tabulator.panes = {};

/*  PANES
**
**     Panes are regions of the outline view in which a particular subject is
** displayed in a particular way.  They are like views but views are for query results.
** subject panes are currently stacked vertically.
*/
tabulator.panes.list = [];
tabulator.panes.paneForIcon = []
tabulator.panes.paneForPredicate = []
tabulator.panes.register = function(p, whether) {
    p.requireQueryButton = whether;
    tabulator.panes.list.push(p);
    // alert("Registering pane "+p.name); //@@
    if (p.icon) tabulator.panes.paneForIcon[p.icon] = p;
    if (p.predicates) {
        for (x in p.predicates) {
            tabulator.panes.paneForPredicate[x] = {pred: x, code: p.predicates[x]};
        }
    }
}

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);

loader.loadSubScript("chrome://tabulator/content/js/panes/classInstancePane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/defaultPane.js");
//loader.loadSubScript("chrome://tabulator/content/js/panes/newOutline.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/internalPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/dataContentPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/paneUtils.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/airPane.js");

//@@ jambo commented these things out to pare things down temporarily.
/*
loader.loadSubScript("chrome://tabulator/content/js/panes/lawPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/n3Pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/RDFXMLPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/humanReadablePane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/microblogPane/microblogPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/imagePane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/tableViewPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/socialPane.js");
*/loader.loadSubScript("chrome://tabulator/content/js/panes/social/pane.js");
/*loader.loadSubScript("chrome://tabulator/content/js/panes/airPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/lawPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/pushbackPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/CVPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/photoPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/tagPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/photoImportPane.js");
*/
