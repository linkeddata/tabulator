
/* Table view pane */

tabulator.panes.register({
    icon: iconPrefix + "icons/table-view.png",

    name: "table",

    label: function(subject) {
        return "Table view";
    },

    render: function(subject, myDocument) {
        var div = myDocument.createElement("div");
        div.setAttribute('class', 'n3Pane'); // needs a proper class
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!

        div.appendChild(renderTableViewPane(myDocument, sts));
        /*
        div.appendChild(myDocument.createTextNode("predicates:" + sts.length));

        for (i=0; i<sts.length; ++i) {
            var text = sts[i].predicate.uri;
            div.appendChild(myDocument.createTextNode(text));
        }*/
        return div;
    }
})

