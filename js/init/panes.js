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
tabulator.panes.register = function(p, requireQueryButton) {
    p.requireQueryButton = requireQueryButton;
    tabulator.panes.list.push(p);
    if (p.icon) tabulator.panes.paneForIcon[p.icon] = p;
    if (p.predicates) {
        for (x in p.predicates) {
            tabulator.panes.paneForPredicate[x] = {pred: x, code: p.predicates[x]};
        }
    }
}

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);
/*
The panes are loaded in a particular order. The early ones
take precedence. Typically, the more specific pane takes precedence,
as it gives a higher quality view than the generic pane.
The default pane take little precedence, except the internals pane
is lower as normally it is just for diagnostics.
Also lower could be optional tools for various classes.
*/
/* First we load the utils so panes can add them (while deevloping) as well as use them */
loader.loadSubScript("chrome://tabulator/content/js/panes/paneUtils.js");


loader.loadSubScript("chrome://tabulator/content/js/panes/issue/pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/form/pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/transaction/pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/dataContentPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/airPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/n3Pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/RDFXMLPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/tableViewPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/classInstancePane.js");

loader.loadSubScript("chrome://tabulator/content/js/panes/defaultPane.js");

//loader.loadSubScript("chrome://tabulator/content/js/panes/newOutline.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/ui/pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/categoryPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/pubsPane.js");

//@@ jambo commented these things out to pare things down temporarily.
/*
loader.loadSubScript("chrome://tabulator/content/js/panes/lawPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/n3Pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/RDFXMLPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/humanReadablePane.js");
*/
loader.loadSubScript("chrome://tabulator/content/js/panes/microblogPane/microblogPane.js");

// loader.loadSubScript("chrome://tabulator/content/js/panes/imagePane.js");

loader.loadSubScript("chrome://tabulator/content/js/panes/socialPane.js");
/*loader.loadSubScript("chrome://tabulator/content/js/panes/social/pane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/airPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/lawPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/pushbackPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/CVPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/photoPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/tagPane.js");
loader.loadSubScript("chrome://tabulator/content/js/panes/photoImportPane.js");
*/
// The internals pane is always the last as it is the least user-friendly
loader.loadSubScript("chrome://tabulator/content/js/panes/internalPane.js");

// ENDS

