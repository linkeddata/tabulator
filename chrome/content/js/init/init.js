/**
 *
 * INITIALIZATION CODE...
 *
 * Tabulator has a lot of things going on.
 * Previously, all of these things were declared in one huge file.
 * Now, though, they are split up into different files that can be modified
 * more easily.  The following loadSubScript calls each make
 * different pieces of the tabulator library available, while keeping those
 * definitions out of the XPCOM code.
 *
 * The only assumption that this file makes is that the global name "tabulator"
 * has already been defined in this scope.
 *
 */

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);

//Before anything else, load up the logger so that errors can get logged.
loader.loadSubScript("chrome://tabulator/content/js/tab/log-ext.js");
tabulator.log = new TabulatorLogger();

//Load the RDF Library, which defines itself in the namespace $rdf.
/*loader.loadSubScript("chrome://tabulator/content/js/rdf/util.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/uri.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/term.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/match.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/rdfparser.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/rdfa.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/n3parser.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/identity.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/query.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/serialize.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/sparqlUpdate.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/sparql.js");*/
loader.loadSubScript("chrome://tabulator/content/js/rdf/rdflib.js");
tabulator.rdf = $rdf;

// Overwrite the default dummy logger in rdf/Utils.js with a real one
// $rdf.log2 = tabulator.log;    @@ Doesn't work :-( tbl

//Load the icons namespace onto tabulator.
loader.loadSubScript("chrome://tabulator/content/js/init/icons.js");
//And Namespaces..
loader.loadSubScript("chrome://tabulator/content/js/init/namespaces.js");
//And Panes.. (see the below file to change which panes are turned on)
loader.loadSubScript("chrome://tabulator/content/js/init/panes.js");
//And Preferences mechanisms.
loader.loadSubScript("chrome://tabulator/content/js/init/prefs.js");

//Now, load tabulator sources code..
loader.loadSubScript("chrome://tabulator/content/js/tab/util-nonlib.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/sources-ext.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/sources.js");

//And, finally, all non-pane UI code.
loader.loadSubScript("chrome://tabulator/content/js/tab/labeler.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/request.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/outlineinit.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/updateCenter.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/userinput.js");
loader.loadSubScript("chrome://tabulator/content/js/tab/outline.js");

//Oh, and the views!
//@@ jambo commented this out to pare things down temporarily.
//loader.loadSubScript("chrome://tabulator/content/js/init/views.js");


//TODO: SEPARATE.

//generate a UID for each thing to be drawn in tabulator, so that
//tabulator only renders in a page if the extension explicitly
//decided to do so.. (before it just relied on the existence of
//the class "TabulatorOutline" on a div, and had data exposure
//issues.
tabulator.requestUUIDs = {};

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