/**
 *
 * INITIALIZATION CODE... for the Tabulator Firefox Extension
 *
 * Tabulator has a lot of things going on.
 * Previously, all of these things were declared in one huge file.
 * Now, though, they are split up into different files that can be modified
 * more easily.  The following loadSubScript calls each make
 * different pieces of the tabulator library available, while keeping those
 * definitions out of the XPCOM code.
 * In some variations of the code, the tabulator.loadScript() calls are
 * instead actually expanded inline during library generation.
 * So these if commented out must be commented with a leading //
 *
 * The only assumption that this file makes is that the global name "tabulator"
 * has already been defined in this scope.
 *
 */

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);

tabulator.isExtension = true;
tabulator.iconPrefix = 'chrome://tabulator/content/';

tabulator.loadScript = function(uri) {
    dump("@@ Loading "+uri+"\n");
    loader.loadSubScript('chrome://tabulator/content/'+ uri);
}

//Before anything else, load up the logger so that errors can get logged.
tabulator.loadScript("js/tab/log-ext.js");

tabulator.log = new TabulatorLogger();
dump("@@@ init.js Inital setting of tabulator.log\n");

//Load the RDF Library, which defines itself in the namespace $rdf.
// see the script rdf/create-lib which creates one file, rdflib.js
// by concatenating all the js files)

tabulator.loadScript("js/rdf/rdflib.js");
tabulator.rdf = $rdf;


//Load the icons namespace onto tabulator.
tabulator.loadScript("js/init/icons.js");
//And Namespaces..
tabulator.loadScript("js/init/namespaces.js");
//And Panes.. (see the below file to change which panes are turned on)
tabulator.loadScript("js/init/panes.js");
tabulator.loadScript("js/jscolor/jscolor.js");
//And Preferences mechanisms.
tabulator.loadScript("js/init/prefs.js");

//Now, load tabulator sourceWidget code.. the sources.js became rdf/web.js
tabulator.loadScript("js/tab/util-nonlib.js");

tabulator.loadScript("js/tab/sources-ext.js");

//And, finally, all non-pane UI code.
tabulator.loadScript("js/tab/labeler.js");
tabulator.loadScript("js/tab/request.js");
tabulator.loadScript("js/tab/outlineinit.js");
tabulator.loadScript("js/tab/userinput.js");
tabulator.loadScript("js/tab/outline.js");

//Oh, and the views!
tabulator.loadScript("js/init/views.js");



tabulator.requestUUIDs = {};

// This has an empty id attribute instead of uuid string, beware.
tabulator.outlineTemplate = 
        // "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"+
        "<html id='docHTML'>\n"+
        "    <head>\n"+
        "        <title>Tabulator: Data Browser</title>\n"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" />\n"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/js/widgets/style.css\" type=\"text/css\" />\n"+
        "    </head>\n"+
        "    <body>\n"+
        "        <div class=\"TabulatorOutline\" id=\"DummyUUID\">\n"+
        "            <table id=\"outline\"></table>\n"+
        "        </div>\n"+
        "    </body>\n"+
        "</html>\n";


const Cc = Components.classes;
const Ci = Components.interfaces;

function CCIN(cName, ifaceName) {
    return Cc[cName].createInstance(Ci[ifaceName]);
}

function TracingListener() {
}
TracingListener.prototype =
{
    originalListener: null,
    receivedData: [],   // array for incoming data.

    onDataAvailable: function(request, context, inputStream, offset, count)
    {

        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1",
                "nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
                "nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);
        this.receivedData.push(data);

        binaryOutputStream.writeBytes(data, count);

        //this.originalListener.onDataAvailable(request, context,
        //storageStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
        this.receivedData = [];
        //this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode)
    {
        //var responseSource = this.receivedData.join(); //entire file in responseSource
        //parse responseSource through tabulator
        var uuidGenerator = 
            Components.classes["@mozilla.org/uuid-generator;1"]
            .getService(Components.interfaces.nsIUUIDGenerator);
        var uuid = uuidGenerator.generateUUID();
        var uuidString = uuid.toString();
        
        tabulator.requestUUIDs[uuidString] = request.name;

        //send html file to originalListener
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1",
                "nsIBinaryOutputStream");

        var data =
        "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"+
        "<html id='docHTML'>\n"+
        "    <head>\n"+
        "        <title>Tabulator: Data Browser</title>\n"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" />\n"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/js/widgets/style.css\" type=\"text/css\" />\n"+
        "    </head>\n"+
        "    <body>\n"+
        "        <div class=\"TabulatorOutline\" id=\""+uuidString+"\">\n"+
        "            <table id=\"outline\"></table>\n"+
        "        </div>\n"+
        "    </body>\n"+
        "</html>\n";

        storageStream.init(8192, data.length, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
        binaryOutputStream.writeBytes(data, data.length);
        this.originalListener.onStartRequest(request, context);
        this.originalListener.onDataAvailable(request, context,
               storageStream.newInputStream(0), 0, data.length);
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}

var httpRequestObserver =
{
    observe : function(aSubject, aTopic, aData)
    {
        var chan = aSubject.QueryInterface(Ci.nsIChannel);
        var isBrowserLoad = chan.loadFlags & chan.LOAD_INITIAL_DOCUMENT_URI;

        if (aTopic.slice(0,4) != 'http')  dump("init.js Observer @@ isBrowserLoad="+isBrowserLoad+", aTopic="+aTopic+"\n");
        if (isBrowserLoad && (aTopic == "http-on-examine-response" ||
                        aTopic == "http-on-examine-merged-response" ||
                        aTopic == "http-on-examine-cached-response"))
        {
            var newListener = new TracingListener();
            aSubject.QueryInterface(Ci.nsIHttpChannel);
            var ct = aSubject.QueryInterface(Components.interfaces.nsIChannel)
                .contentType
            if( ct.indexOf("application/rdf+xml") === 0 ||
                ct.indexOf("text/n3") === 0 ||
                ct.indexOf("text/rdf+n3") === 0 ||
                ct.indexOf("text/turtle") === 0 ) {
                aSubject.QueryInterface(Components.interfaces.nsIChannel)
                    .contentType = "text/html";
                aSubject.QueryInterface(Ci.nsITraceableChannel);
                newListener.originalListener = 
                    aSubject.setNewListener(newListener);
            }
        }
    },

    QueryInterface : function (aIID)
    {
        if (aIID.equals(Ci.nsIObserver) ||
            aIID.equals(Ci.nsISupports))
        {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;

    }
};

var observerService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);

observerService.addObserver(httpRequestObserver,
    "http-on-examine-response", false);
observerService.addObserver(httpRequestObserver,
    "http-on-examine-merged-response", false);
observerService.addObserver(httpRequestObserver,
    "http-on-examine-cached-response", false);

///////////////////////////////////////////////////////////////////

tabulator.pumpRDFa = function(e){
     

    // if (typeof tabulator == 'undefined') var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    var uri = gURLBar.value;
    
    // From init/init.js
    var uuidGenerator = 
        Components.classes["@mozilla.org/uuid-generator;1"]
        .getService(Components.interfaces.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID();
    var uuidString = uuid.toString();
    
    tabulator.requestUUIDs[uuidString] = uri;

    var doc = window.content.document;
    //Remove all the style sheet elements and scripts
    
    $jq('head', doc).empty();
    $jq('body', doc).empty();
    $jq('html', doc).attr("id","docHTML");
    // doc.innerHTML = tabulator.outlineTemplate; // Reset doc entirely


//@@ from jambo, WARNING ! the way that this code operates HAS BEEN CHANGED
// a UUID nonce is now used to identify the document to display.
// I am not sure if this will affect the execution of this code when
// it gets re-enabled.  If you experience issues, feel free to email
// me and I will help resolve it.
// For refs on how to do this, see init/init.js, where
// tabulator.requestUUIDs is used.

    $jq('head', doc).append("<title>Data View</title>\n"+
    "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" />\n"+
    "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/js/widgets/style.css\" type=\"text/css\" />\n"
    );
    $jq('body', doc).append("<div class=\"TabulatorOutline\" id=\"DummyUUID\">\n"+
    "<table id=\"outline\"></table>\n"+
    "</div>\n"
    );

    //Add the Tabulator outliner
    var outline = new tabulator.OutlineObject(doc)

    var a =$jq('.TabulatorOutline', doc).attr('id', uuidString);
    
    outline.init();

    var nsIURI = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(uri, null, null); //ToDo: make sure the encoding is correct
    gBrowser.getBrowserForDocument(doc).webNavigation.setCurrentURI(nsIURI);
    
    var queryButton = doc.createElement('input');
    queryButton.setAttribute('id','queryButton');
    queryButton.setAttribute('style','display:none;');
    queryButton.setAttribute('type','button');
    queryButton.setAttribute('value','Find All');
    doc.body.appendChild(queryButton);
    queryButton.addEventListener('click',outline.viewAndSaveQuery,false);

        
    outline.GotoSubject(tabulator.kb.sym(uri),true);

}
    
tabulator.log.error("@@ init.js test 90 tabulator.log.error: $rdf.log.error)"+$rdf.log.error);

    
// Ends
