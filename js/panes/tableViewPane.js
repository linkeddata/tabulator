
// Format an array of RDF statements as an HTML table.
//
// This can operate in one of three modes: when the class of object is given
// or when the source document from whuch data is taken is given,
// or if a prepared query object is given.
// (In principle it could operate with neither class nor document 
// given but typically
// there would be too much data.)
// When the tableClass is not given, it looks for common  classes in the data,
// and gives the user the option.
//
// 2008 Written, Ilaria Liccardi
// 2014 core functionality now in common/table.js   -timbl


/////////////////////////////////////////////////////////////////////

/* Table view pane  -- view of a class*/

tabulator.panes.register({
    icon: iconPrefix + "icons/table.png",

    name: "tableOfClass",

    label: function(subject) {
            //if (!tabulator.kb.holds(subject, tabulator.ns.rdf('type'),tabulator.ns.rdfs('Class'))) return null;
            if (!tabulator.kb.any(undefined, tabulator.ns.rdf('type'),subject)) return null;
            return tabulator.Util.label(subject)+ " table";
        },

    render: function(subject, myDocument) {
        var div = myDocument.createElement("div");
        div.setAttribute('class', 'tablePane');
        div.appendChild(tabulator.panes.utils.renderTableViewPane(myDocument, {'tableClass': subject}));
        return div;
    }
});

/* Table view pane -- as a view of a document 
*/
/*

tabulator.panes.register({
    icon: iconPrefix + "icons/table2.png",   
    @@@@@@  Needs to be different from other icons used eg above as eems to be used as to fire up the pane
    @@@@@@ Needs to be lower prio for a document than the data content pane

    name: "tableOfDocument",

    label: function(subject) {

        // Returns true if the specified list of statements contains
        // information on a single subject.
 
        function singleSubject(statements) {
            var subj = null;

            for (var i=0; i<statements.length; ++i) {
                if (subj == null) {
                    subj = statements[i].subject;
                } else if (statements[i].subject != subj) {
                    return false;
                }
            }

            return true;
        }

        var sts = tabulator.kb.statementsMatching(undefined, undefined, undefined,
                                        subject); 

        // If all the statements are on a single subject, a table view 
        // is futile, so hide the table view icon.

        if (!singleSubject(sts)) {
            return "Table view";
        } else {
            return null;
        }
    },

    render: function(subject, myDocument) {
        var div = myDocument.createElement("div");
        div.setAttribute('class', 'n3Pane'); // needs a proper class
        div.appendChild(tabulator.panes.utils.renderTableViewPane(myDocument, {'sourceDocument': subject}));
        return div;
    }
});
*/
