    /*   Internal Pane
    **
    **  This outline pane contains the properties which are
    ** internal to the user's interaction with the web, and are not normaly displayed
    */
tabulator.panes.internalPane = {

    icon: Icon.src.icon_internals,

    label: function(subject) {
        var sts = kb.statementsMatching(subject);
        sts = sts.concat(kb.statementsMatching(undefined, undefined, subject));
        for (var i=0; i<sts.length; i++) {
            if (internalPane.predicates[sts[i].predicate.uri] == 1) // worth displaing
                return "under the hood";
        }
        return null
    },
    
    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        subject = kb.canon(subject);
        function filter(pred, inverse) {
            if (pred.sameTerm(owl('sameAs'))) return false; //our principle is not to show sameAs
            return  !!(typeof internalPane.predicates[pred.uri] != 'undefined');
        }
        var div = myDocument.createElement('div')
        div.setAttribute('class', 'internalPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject)
        if (subject.uri) plist.push(new RDFStatement(subject,
                    kb.sym('http://www.w3.org/2006/link#uri'), subject.uri, sf.appNode));
        appendPropertyTRs(div, plist, false, filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        appendPropertyTRs(div, plist, true, filter)    
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
tabulator.panes.internalPane.predicates[owl('sameAs').uri] = 1;
tabulator.panes.register(tabulator.panes.internalPane, true);

//ends

