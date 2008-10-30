/*      Notation3 content Pane
**
**  This pane shows the content of a particular RDF resource
** or at least the RDF semantics we attribute to that resource,
** in generated N3 syntax.
*/

tabulator.panes.register ({

    icon: Icon.src.icon_n3Pane,
    
    label: function(subject) {
        var s = dataContentPane.label(subject);
        if (!s) return null;
        return s + ' as N3';
    },

    render: function(subject) {
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'n3Pane');
        // Because of smushing etc, this will not be a copy of the original source
        // We could instead either fetch and re-parse the source,
        // or we could keep all the pre-smushed triples.
        var sts = kb.statementsMatching(undefined, undefined, undefined, subject); // @@ slow with current store!
        /*
        var kludge = kb.formula([]); // No features
        for (var i=0; i< sts.length; i++) {
            s = sts[i];
            kludge.add(s.subject, s.predicate, s.object);
        }
        */
        var sz = Serializer();
        sz.suggestNamespaces(kb.namespaces);
        sz.setBase(subject.uri);
        var str = sz.statementsToN3(sts)
        var pre = myDocument.createElement('PRE');
        pre.appendChild(myDocument.createTextNode(str));
        div.appendChild(pre);
        return div
    }
}, false);


