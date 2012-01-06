/**
 *
 * INITIALIZATION CODE...  for non-extension versions, in HTML mashup as webapp
 *
 */


tabulator = {};
tabulator.isExtension = false;
 // @@@ Git hosted for testing only! Need a seiously hosted main site - or mashup user's site of course
tabulator.scriptBase = 'https://raw.github.com/linkeddata/tabulator-firefox/master/content/';
tabulator.iconPrefix = tabulator.scriptBase;


// Dump exists in ff but not safari.
if (typeof dump == 'undefined') dump = function(x) {};

var complain = function complain(message, style){
    if (style == undefined) style = 'color: grey';
    var pre = document.createElement("pre");
    pre.setAttribute('style', style);
    document.lastChild.appendChild(pre);
    pre.appendChild(document.createTextNode(message));
} 

/*
tabulator.loadScript = function(uri) {
    if (uri.slice(0,19) == 'chrome://tabulator/')
        // uri = 'file:///devel/github.com/linkeddata/tabulator-firefox/'+uri.slice(19);  // getScript fails silently on file:
        uri = ''https://raw.github.com/linkeddata/tabulator-firefox/'+uri.slice(19);
    if (uri.slice(-7) == '-ext.js')
        uri = uri.slice(0,-7) + '.js';
    complain("Loading "+uri);
    jQuery.getScript(uri, function(data, status){
        complain("Loaded "+uri+": ");
    });
    // load(uri)
}; 
*/


jQuery(document).ready(function(){

    // complain("@@ init.js test 40 )");

    //Before anything else, load up the logger so that errors can get logged.
    tabulator.loadScript("js/tab/log.js");

    dump("@@@ init.js Inital setting of tabulator.log\n");

    //Load the RDF Library, which defines itself in the namespace $rdf.
    // see the script rdf/create-lib (this script creates one file -rdflib.js that concatenates all the js files)

    tabulator.loadScript("js/rdf/dist/rdflib.js");
    tabulator.rdf = $rdf;



    //Load the icons namespace onto tabulator.
    tabulator.loadScript("js/init/icons.js");
    //And Namespaces..
    tabulator.loadScript("js/init/namespaces.js");
    //And Panes.. (see the below file to change which panes are turned on)
    tabulator.loadScript("js/init/panes.js");
    tabulator.loadScript("js/jscolor/jscolor.js");
    //And Preferences mechanisms.
    // tabulator.loadScript("js/init/prefs.js");  // Firefox
    tabulator.loadScript("js/tab/preferences.js"); // cookies

    //Now, load tabulator sourceWidget code.. the sources.js became rdf/web.js
    tabulator.loadScript("js/tab/util-nonlib.js");

    // Not sure wheere the sources code is fro non-extension tabulator.
    // tabulator.loadScript("js/tab/sources-ext.js");

    //And, finally, all non-pane UI code.
    tabulator.loadScript("js/tab/labeler.js");
    tabulator.loadScript("js/tab/request.js");
    tabulator.loadScript("js/tab/outlineinit.js");
    // tabulator.loadScript("js/tab/updateCenter.js"); obsolete, moved to rdf/sparqlUpdate.js
    tabulator.loadScript("js/tab/userinput.js");
    tabulator.loadScript("js/tab/outline.js");

    //Oh, and the views!
    //@@ jambo commented this out to pare things down temporarily.
    tabulator.loadScript("js/init/views.js");

///////////////  These things in the extension are in components/xpcom.js

    tabulator.kb = new tabulator.rdf.IndexedFormula();
    tabulator.sf = new tabulator.rdf.Fetcher(tabulator.kb);
    tabulator.kb.sf = tabulator.sf;
    tabulator.qs = new tabulator.rdf.QuerySource();
    // tabulator.sourceWidget = new SourceWidget();
    tabulator.sourceURI = "resource://tabulator/";
    tabulator.sparql = new tabulator.rdf.sparqlUpdate(tabulator.kb);
    // tabulator.rc = new RequestConnector();
    tabulator.requestCache = [];
    tabulator.cacheEntry = {};


    tabulator.lb = new Labeler(tabulator.kb, tabulator.preferences.get('languages')); // @@ was LanguagePreference
    tabulator.kb.predicateCallback = tabulator.rdf.Util.AJAR_handleNewTerm; // @@ needed??
    tabulator.kb.typeCallback = tabulator.rdf.Util.AJAR_handleNewTerm;


//////////////////////





    tabulator.requestUUIDs = {};
/*
    // This has an empty id attribute instead of uuid string, beware. Not used
    tabulator.outlineTemplate = //    ###    This needs its link URIs adjusting! @@@
            // "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n"+
            "<html id='docHTML'>\n"+
            "    <head>\n"+
            "        <title>Tabulator: Data Browser</title>\n"+
            "        <link rel=\"stylesheet\" href=\"@@@@@tabbedtab.css\" type=\"text/css\" />\n"+
            "        <link rel=\"stylesheet\" href=\"@@@@@js/widgets/style.css\" type=\"text/css\" />\n"+
            "    </head>\n"+
            "    <body>\n"+
            "        <div class=\"TabulatorOutline\" id=\"DummyUUID\">\n"+
            "            <table id=\"outline\"></table>\n"+
            "        </div>\n"+
            "    </body>\n"+
            "</html>\n";
*/
    // complain("@@ init.js test 118 )");


    //Add the Tabulator outliner
    var outline = new tabulator.OutlineObject(document);

    // we don't currently have a uuid generator code in non-extension mode
    // var a =$jq('.TabulatorOutline', doc).attr('id', uuidString);
    
    outline.init();


});  // End jQuery ready()


    

    
// Ends
