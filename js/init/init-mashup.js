// mashlib-init.js

tabulator = {};
tabulator.isExtension = false;
tabulator.mode = 'webapp';

// base for icons etc
tabulator.scriptBase = 'https://linkeddata.github.io/tabulator/'; // Or app dev overwrite to point to your app's own copy

tabulator.iconPrefix = tabulator.scriptBase;

// Dump exists in ff but not safari.
if (typeof dump == 'undefined') dump = function(x) {console.log(x)};

tabulator.setup = function() {

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
    tabulator.loadScript("js/tab/userinput.js");
    tabulator.loadScript("js/tab/outline.js");

    //Oh, and the views!
    tabulator.loadScript("js/init/views.js");

    tabulator.kb = new tabulator.rdf.IndexedFormula();
    tabulator.sf = tabulator.fetcher = new tabulator.rdf.Fetcher(tabulator.kb); // .sf deprecated

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

document.addEventListener('DOMContentLoaded', function() {
// jQuery(function() {
    if (tabulator.rdf == undefined)
        tabulator.setup();
});

// init-mashup ends

