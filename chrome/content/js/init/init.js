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
loader.loadSubScript("chrome://tabulator/content/js/rdf/util.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/uri.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/term.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/match.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/rdfparser.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/n3parser.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/identity.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/query.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/serialize.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/sparqlUpdate.js");
loader.loadSubScript("chrome://tabulator/content/js/rdf/sparql.js");
tabulator.rdf = $rdf;

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
loader.loadSubScript("chrome://tabulator/content/js/init/views.js");