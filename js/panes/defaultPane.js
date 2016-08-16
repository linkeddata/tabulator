/*   Default Pane
**
**  This outline pane contains the properties which are
**  normaly displayed to the user. See also: internalPane
*/
tabulator.panes.defaultPane = {
    icon:  tabulator.iconPrefix + 'icons/about.png', // was tabulator.Icon.src.icon_defaultPane,

    name: 'default',

    label: function(subject) { return 'about ';},

    filter: function(pred, inverse) {
        if (typeof tabulator.panes.internalPane.predicates[pred.uri] != 'undefined')
            return false;
        if (inverse && (pred.uri ==
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) return false;
        return true;
    },

    render: function(subject, myDocument) {
        //var doc = myDocument.wrappedJSObject;   Jim? why-tim
        // dump( doc );
        var kb = tabulator.kb;
        var outline = tabulator.outline; //@@
        tabulator.log.info("@defaultPane.render, myDocument is now " + myDocument.location);
        subject = kb.canon(subject);
        var div = myDocument.createElement('div')
        //var f = jq("<div></div>", doc);
        //jq(div, doc).append(f);
        //f.resource({subject:"http://web.mit.edu/jambo/www/foaf.rdf#jambo", predicate:"http://xmlns.com/foaf/0.1/knows"});
        div.setAttribute('class', 'defaultPane')
//        appendRemoveIcon(div, subject, div);

        var plist = kb.statementsMatching(subject)
        tabulator.outline.appendPropertyTRs(div, plist, false, tabulator.panes.defaultPane.filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        tabulator.outline.appendPropertyTRs(div, plist, true, tabulator.panes.defaultPane.filter)
        if ((subject.termType == 'Literal') && (subject.value.slice(0,7) == 'http://'))
            tabulator.outline.appendPropertyTRs(div,
                [$rdf.st(kb.sym(subject.value), tabulator.ns.link('uri'), subject)],
                true, tabulator.panes.defaultPane.filter)
        if ((subject.termType == 'NamedNode' &&
             tabulator.sparql.editable(tabulator.rdf.Util.uri.docpart(subject.uri), kb))
             || (subject.termType == 'BlankNode'
                && kb.anyStatementMatching(subject)
                && kb.anyStatementMatching(subject).why
                && kb.anyStatementMatching(subject).why.uri
                && tabulator.sparql.editable(kb.anyStatementMatching(subject).why.uri)
                //check the document containing something about of the bnode @@ what about as object?
             /*! && HCIoptions["bottom insert highlights"].enabled*/)) {
            var holdingTr = myDocument.createElement('tr'); //these are to minimize required changes
            var holdingTd = myDocument.createElement('td'); //in userinput.js
            holdingTd.setAttribute('colspan','2');
            holdingTd.setAttribute('notSelectable','true');
            var img = myDocument.createElement('img');
            img.src = tabulator.Icon.src.icon_add_new_triple;
            img.addEventListener('click', function  add_new_tripleIconMouseDownListener(e) { // tabulator.Icon.src.icon_add_new_triple
                    tabulator.outline.UserInput.addNewPredicateObject(e);
                    e.stopPropagation();
                    e.preventDefault();
                    return;
            });
            img.className='bottom-border-active';
            //img.addEventListener('click', thisOutline.UserInput.addNewPredicateObject,false);
            div.appendChild(holdingTr).appendChild(holdingTd).appendChild(img);
        }
        return div
    },

    sync: function(subject, myDocument, div) { // Untested  and not the best way to do it
    // This code was cut out of outline.js
    //    best way is to leave TRs there and add/delete any necessray extras

        tabulator.log.info('Re-expand: '+div)
        // try{table.replaceChild(expandedHeaderTR(subject),table.firstChild)}
        // catch(e){}   // kludge... Todo: remove this (seeAlso UserInput::clearInputAndSave)
        var row, s
        var expandedNodes = {}
        var parent = div
        for (row = parent.firstChild; row; row = row.nextSibling) { // Note which p,o pairs are exppanded
            if (row.childNodes[1]
                && row.childNodes[1].firstChild.nodeName == 'TABLE') {
                s = row.AJAR_statement
                if (!expandedNodes[s.predicate.toString()]) {
                    expandedNodes[s.predicate.toString()] = {}
                }
                expandedNodes[s.predicate.toString()][s.object.toString()] =
                    row.childNodes[1].childNodes[1]
            }
        }

        var table = propertyTable(subject, undefined, pane)  // Re-build table

        for (row = table.firstChild; row; row = row.nextSibling) {
            s = row.AJAR_statement
            if (s) {
                if (expandedNodes[s.predicate.toString()]) {
                    var node =
                        expandedNodes[s.predicate.toString()][s.object.toString()]
                    if (node) {
                        row.childNodes[1].replaceChild(node,
                                        row.childNodes[1].firstChild)
                    }
                }
            }
        }

        // do some other stuff here





    }


};

tabulator.panes.register(tabulator.panes.defaultPane, true);

// ends
