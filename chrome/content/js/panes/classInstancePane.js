/*   Class member Pane
**
**  This outline pane lists the members of a class
*/
tabulator.panes.register( {

    icon: Icon.src.icon_instances,
    
    name: 'classInstance',
    
    label: function(subject) {
        var n = tabulator.kb.statementsMatching(
            undefined, tabulator.ns.rdf( 'type'), subject).length;
        if (n == 0) return null;  // None, suppress pane
        return "List "+n;     // Show how many in hover text
    },

    render: function(subject, myDocument) {
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'instancePane');
        var sts = tabulator.kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        if (sts.length > 10) {
            var tr = myDocument.createElement('TR');
            tr.appendChild(myDocument.createTextNode(''+sts.length));
            tr.AJAR_statement=sts[i];
            div.appendChild(tr);
        }

        // Don't need to check in the filter as the plist is already trimmed
        var plist = tabulator.kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        tabulator.outline.appendPropertyTRs(div, plist, true, function(pred){return true;})
        return div;
    }
}, true);

//ends


