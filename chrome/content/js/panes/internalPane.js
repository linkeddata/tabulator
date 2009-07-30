    /*   Internal Pane
    **
    **  This outline pane contains the properties which are
    ** internal to the user's interaction with the web, and are not normaly displayed
    */
tabulator.panes.internalPane = {

    icon: tabulator.Icon.src.icon_internals,
    
    name: 'internal',

    label: function(subject) {
        var sts = tabulator.kb.statementsMatching(subject);
        sts = sts.concat(tabulator.kb.statementsMatching(undefined, undefined, subject));
        for (var i=0; i<sts.length; i++) {
            if (tabulator.panes.internalPane.predicates[sts[i].predicate.uri] == 1) // worth displaing
                return "under the hood";
        }
        return null
    },
    
    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        subject = kb.canon(subject);
        function filter(pred, inverse) {
            if (pred.sameTerm(tabulator.ns.owl('sameAs'))) return false; //our principle is not to show sameAs
            return  !!(typeof tabulator.panes.internalPane.predicates[pred.uri] != 'undefined');
        }
        var div = myDocument.createElement('div')
        div.setAttribute('class', 'internalPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject)
        if (subject.uri) plist.push(new RDFStatement(subject,
                    kb.sym('http://www.w3.org/2006/link#uri'), subject.uri, sf.appNode));
        tabulator.outline.appendPropertyTRs(div, plist, false, filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        tabulator.outline.appendPropertyTRs(div, plist, true, filter)    
        return div
    },
    
    predicates: {// Predicates used for inner workings. Under the hood
        'http://www.w3.org/2007/ont/link#request': 1,
        'http://www.w3.org/2007/ont/link#requestedBy': 1,
        'http://www.w3.org/2007/ont/link#source': 1,
        'http://www.w3.org/2007/ont/link#session': 2, // 2=  test neg but display
        'http://www.w3.org/2006/link#uri': 1,
        'http://www.w3.org/2006/link#all': 1, // From userinput.js
        'http://www.w3.org/2006/link#Document': 1,
    }
    
};    

//    if (!SourceOptions["seeAlso not internal"].enabled)
tabulator.panes.internalPane.predicates['http://www.w3.org/2000/01/rdf-schema#seeAlso'] = 1;
tabulator.panes.internalPane.predicates[tabulator.ns.owl('sameAs').uri] = 1;
tabulator.panes.register(tabulator.panes.internalPane, true);

//ends

