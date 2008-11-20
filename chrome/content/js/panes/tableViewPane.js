
/* Table view pane */

tabulator.panes.register({
    icon: iconPrefix + "icons/table-view.png",

    name: "table",

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

        var sts = kb.statementsMatching(undefined, undefined, undefined,
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
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); 

        div.appendChild(renderTableViewPane(myDocument, sts));
        return div;
    }
})

