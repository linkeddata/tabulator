/*      Data content Pane
**
**  This pane shows the content of a particular RDF resource
** or at least the RDF semantics we attribute to that resource.
*/

// To do:  - Only take data from one graph
//         - Only do forwards not backward?
//         - Expand automatically all the way down
//         - original source view?  Use ffox view source

tabulator.panes.dataContentPane = {
    
    icon:  Icon.src.icon_dataContents,
    
    name: 'dataContents',
    
    label: function(subject) {
        var n = tabulator.kb.statementsMatching(
            undefined, undefined, undefined, subject).length;
        if (n == 0) return null;
        return "Data ("+n+")";
    },
    
    shouldGetFocus: function(subject) {
        return tabulator.kb.whether(subject, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'));
    },

    statementsAsTables: function statementsAsTables(sts, myDocument) {
        var rep = myDocument.createElement('table');
        var sz = Serializer();
        var pair = sz.rootSubjects(sts);
        var roots = pair[0];
        var subjects = pair[1];

        // The property tree for a single subject or anonymos node
        function propertyTree(subject) {
            // print('Proprty tree for '+subject);
            var rep = myDocument.createElement('table')
            var lastPred = null;
            var sts = subjects[sz.toStr(subject)]; // relevant statements
            sts.sort();
            var same =0;
            var td_p; // The cell which holds the predicate
            for (var i=0; i<sts.length; i++) {
                var st = sts[i];
                var tr = myDocument.createElement('tr');
                if (st.predicate.uri != lastPred) {
                    if (lastPred && same > 1) td_p.setAttribute("rowspan", ''+same)
                    td_p = myDocument.createElement('td');
                    td_p.setAttribute('class', 'pred');
                    var anchor = myDocument.createElement('a')
                    anchor.setAttribute('href', st.predicate.uri)
                    anchor.appendChild(myDocument.createTextNode(predicateLabelForXML(st.predicate)));
                    td_p.appendChild(anchor);
                    tr.appendChild(td_p);
                    lastPred = st.predicate.uri;
                    same = 0;
                }
                same++;
                var td_o = myDocument.createElement('td');
                td_o.appendChild(objectTree(st.object));
                tr.appendChild(td_o);
                rep.appendChild(tr);
            }
            if (lastPred && same > 1) td_p.setAttribute("rowspan", ''+same)
            return rep;
        }

        // Convert a set of statements into a nested tree of tables
        function objectTree(obj) {
            switch(obj.termType) {
                case 'symbol':
                    var anchor = myDocument.createElement('a')
                    anchor.setAttribute('href', obj.uri)
                    anchor.appendChild(myDocument.createTextNode(label(obj)));
                    return anchor;
                    
                case 'literal':
                    return myDocument.createTextNode(obj.value); // placeholder
                    
                case 'bnode':
                    var newTable =  propertyTree(obj);
                    if (ancestor(newTable, 'TABLE') && ancestor(newTable, 'TABLE').style.backgroundColor=='white') {
                        newTable.style.backgroundColor='#eee'
                    } else {
                        newTable.style.backgroundColor='white'
                    }
                    return newTable;
                    
                case 'collection':
                    var res = myDocument.createElement('table')
                    res.setAttribute('class', 'collectionAsTables')
                    for (var i=0; i<obj.elements.length; i++) {
                        var tr = myDocument.createElement('tr');
                        res.appendChild(tr);
                        tr.appendChild(objectTree(obj.elements[i]));
                    }
                    return  res;
                case 'formula':
                    var res = tabulator.panes.dataContentPane.statementsAsTables(obj.statements, myDocument);
                    res.setAttribute('class', 'nestedFormula')
                    return res;
            }
            throw "Unhandled node type: "+obj.termType
        }

        for (var i=0; i<roots.length; i++) {
            var tr = myDocument.createElement('tr')
            rep.appendChild(tr);
            var td_s = myDocument.createElement('td')
            tr.appendChild(td_s);
            var td_tree = myDocument.createElement('td')
            tr.appendChild(td_tree);
            var root = roots[i];
            if (root.termType == 'bnode') {
                td_s.appendChild(myDocument.createTextNode(label(root))); // Don't recurse!
            } 
            else {
                td_s.appendChild(objectTree(root)); // won't have tree
            }
            td_tree.appendChild(propertyTree(root));
        }
        return rep;
    }, // statementsAsTables


    // View the data in a file in user-friendly way
    render: function(subject, myDocument) {

        var kb = tabulator.kb;
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'dataContentPane');
        // Because of smushing etc, this will not be a copy of the original source
        // We could instead either fetch and re-parse the source,
        // or we could keep all the pre-smushed triples.
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!
        if (1) {
            div.appendChild(tabulator.panes.dataContentPane.statementsAsTables(sts, myDocument));
            
        } else {  // An outline mode openable rendering .. might be better
            var sz = Serializer();
            var res = sz.rootSubjects(sts);
            var roots = res[0]
            var p  = {};
            // p.icon = dataContentPane.icon
            p.render = function(s2) {
                var div = myDocument.createElement('div')
                
                div.setAttribute('class', 'withinDocumentPane')
                var plist = kb.statementsMatching(s2, undefined, undefined, subject)
                appendPropertyTRs(div, plist, false, function(pred, inverse) {return true;})
                return div    
            }
            for (var i=0; i<roots.length; i++) {
                var tr = myDocument.createElement("TR");
                root = roots[i];
                tr.style.verticalAlign="top";
                var td = thisOutline.outline_objectTD(root, undefined, tr)
                tr.appendChild(td)
                div.appendChild(tr);
                outline_expand(td, root,  p);
            }
        }
        return div
    }
};

tabulator.panes.register(tabulator.panes.dataContentPane, true);


/*   Pane within Document data content view
**
**  This outline pane contains docuemnts from a specific source document only.
** It is a pane used recursively within an outer dataContentPane. (above)
*/
/*  Not used in fact??
tabulator.panes.register({

    icon: Icon.src.icon_withinDocumentPane, // should not show

    label: function(subject) { return 'doc contents';},
    
    filter: function(pred, inverse) {
        return true; // show all
    },
    
    render: function(subject, source) {
        var div = myDocument.createElement('div')
        div.setAttribute('class', 'withinDocumentPane')                  
        var plist = kb.statementsMatching(subject, undefined, undefined, source)
        tabulator.outline.appendPropertyTRs(div, plist, false,
                function(pred, inverse) {return true;});
        return div ;
    }
}, true);
    
*/


//ends

