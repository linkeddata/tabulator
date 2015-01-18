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

tabulator.panes.byName = function(name) {
    for(var i=0; i<tabulator.panes.list.length; i++)
        if (tabulator.panes.list[i].name == name) return tabulator.panes.list[i];
    return undefined;
}

// var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
//    .getService(Components.interfaces.mozIJSSubScriptLoader);
/*
The panes are loaded in a particular order. The early ones
take precedence. Typically, the more specific pane takes precedence,
as it gives a higher quality view than the generic pane.
The default panes take little precedence, except the internals pane
is lower as normally it is just for diagnostics.
Also lower could be optional tools for various classes.
*/
/* First we load the common utilities so panes can add them (while developing) as well as use them */
// Pattern of adding code where it used then moving it back out into a common code.

// Form and general UI widgets 
tabulator.loadScript("js/panes/common/widgets.js");
// Sign-in, sign-up, workspce and identity UI widgets 
tabulator.loadScript("js/panes/common/signin.js");
// A discussion area for discussing anything
tabulator.loadScript("js/panes/common/discussion.js");
// A relationsal table widget
tabulator.loadScript("js/panes/common/table.js");
// A 2-D matrix of values 
tabulator.loadScript("js/panes/common/matrix.js");

/*  Note that hte earliest panes have priority. So the most specific ones are first.
**
*/
// Developer designed:
tabulator.loadScript("js/panes/issue/pane.js");
tabulator.loadScript("js/panes/argument/argumentPane.js"); // A posistion in an argumnent tree

tabulator.loadScript("js/panes/transaction/pane.js");
tabulator.loadScript("js/panes/transaction/period.js");

tabulator.loadScript("js/panes/trip/tripPane.js");
tabulator.loadScript("js/panes/airPane.js");

// Content views

tabulator.loadScript("js/panes/imagePane.js");   // Basic image view

tabulator.loadScript("js/panes/humanReadablePane.js"); // A web page as a web page

tabulator.loadScript("js/panes/dataContentPane.js");  // Prefered for a data file
tabulator.loadScript("js/panes/n3Pane.js");
tabulator.loadScript("js/panes/RDFXMLPane.js");

// User configured:
tabulator.loadScript("js/panes/form/pane.js");

// Generic:
tabulator.loadScript("js/panes/attach/attachPane.js");
tabulator.loadScript("js/panes/tableViewPane.js");
tabulator.loadScript("js/panes/classInstancePane.js");

// Fallback totally generic:
tabulator.loadScript("js/panes/defaultPane.js");

//tabulator.loadScript("js/panes/newOutline.js");
tabulator.loadScript("js/panes/ui/pane.js");
// tabulator.loadScript("js/panes/categoryPane.js");  // Not useful enough
tabulator.loadScript("js/panes/pubsPane.js");

//@@ jambo commented these things out to pare things down temporarily.
// Note must use // not /* to comment out to make sure expander sees it
// tabulator.loadScript("js/panes/lawPane.js");

tabulator.loadScript("js/panes/microblogPane/microblogPane.js");


tabulator.loadScript("js/panes/socialPane.js");
//tabulator.loadScript("js/panes/social/pane.js");
//tabulator.loadScript("js/panes/airPane.js");
//tabulator.loadScript("js/panes/lawPane.js");
//tabulator.loadScript("js/panes/pushbackPane.js");
//tabulator.loadScript("js/panes/CVPane.js");
//tabulator.loadScript("js/panes/photoPane.js");
//tabulator.loadScript("js/panes/tagPane.js");
//tabulator.loadScript("js/panes/photoImportPane.js");

// The internals pane is always the last as it is the least user-friendly
tabulator.loadScript("js/panes/internalPane.js");

// ENDS

