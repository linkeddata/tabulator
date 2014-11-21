// mashlib-init.js

tabulator = {};
tabulator.isExtension = false;

// base for icons etc
tabulator.scriptBase = 'https://raw.github.com/linkeddata/tabulator/master/';

/*
tabulator.getScriptName = function () {
    var error = new Error()
      , source
      , lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/)
      , currentStackFrameRegex = new RegExp(/getScriptName \(.+\/(.*):\d+:\d+\)/);

    if((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] != "")
        return source[1];
    else if((source = currentStackFrameRegex.exec(error.stack.trim())))
        return source[1];
    else if(error.fileName != undefined)
        return error.fileName;
}
*/
// tabulator.scriptBase = tabulato.getScriptName();
// tabulator.scriptBase = tabulator.scriptBase.split('/').slice(0,-1).join('/') + '/';

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

tabulator.setup = function() {
    // complain("@@ init.js test 40 )");

    //Before anything else, load up the logger so that errors can get logged.
    tabulator.loadScript("js/tab/log.js");

    dump("@@@ init.js Inital setting of tabulator.log\n");

    //Load the RDF Library, which defines itself in the namespace $rdf.
    // see the script rdf/create-lib (this script creates one file -rdflib.js that concatenates all the js files)

    tabulator.loadScript("js/rdf/dist/rdflib.js"); // Sets this.$rdf 
    
    tabulator.rdf = this['$rdf'];
    $rdf = this['$rdf'];

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
    tabulator.loadScript("js/tab/common.js");

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

    tabulator.requestUUIDs = {};

    //Add the Tabulator outliner
    tabulator.outline = new tabulator.OutlineObject(document);

    // we don't currently have a uuid generator code in non-extension mode
    // var a =$jq('.TabulatorOutline', doc).attr('id', uuidString);
    tabulator.outline.init();
};

jQuery(function() {
    if (tabulator.rdf == undefined)
        tabulator.setup();
});

// init-mashup ends

