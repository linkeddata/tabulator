/*   Class member Pane
**
**  This outline pane lists the members of a class
*/
tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_instances,
    
    name: 'classInstance',
    
    label: function(subject) {
        var n = tabulator.kb.statementsMatching(
            undefined, tabulator.ns.rdf( 'type'), subject).length;
        if (n == 0) return null;  // None, suppress pane
        return "List "+n;     // Show how many in hover text
    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb
        var complain = function complain(message){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'background-color: #eed;');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        } 
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'instancePane');
        var sts = kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        var already = {}, more = [];
        sts.map(function(st){already[st.subject.toNT()] = st});
        for (var nt in kb.findMembersNT(subject)) if (!already[nt])
            more.push($rdf.st(kb.fromNT(nt), tabulator.ns.rdf( 'type'), subject)); // @@ no provenence
        if (more.length) complain("There are "+sts.length+" explicit and "+
                more.length+" implicit members of "+tabulator.Util.label(subject));
        if (subject.sameTerm(tabulator.ns.rdf('Property'))) {
                /// Do not find all properties used as properties .. unlesss look at kb index
        } else if (subject.sameTerm(tabulator.ns.rdfs('Class'))) {
            var uses = kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), undefined);
            var usedTypes = {}; uses.map(function(st){usedTypes[st.object] = st}); // Get unique
            var used = []; for (var i in usedTypes) used.push($rdf.st(
                    st.object,tabulator.ns.rdf( 'type'),tabulator.ns.rdfs('Class')));
            complain("Total of "+uses.length+" type statments and "+used.length+" unique types.");
        }

        if (sts.length > 10) {
            var tr = myDocument.createElement('TR');
            tr.appendChild(myDocument.createTextNode(''+sts.length));
            //tr.AJAR_statement=sts[i];
            div.appendChild(tr);
        }

        tabulator.outline.appendPropertyTRs(div, sts, true, function(pred){return true;})

        if (more.length) {
            complain('Implcit:')
            tabulator.outline.appendPropertyTRs(div, more, true, function(pred){return true;})
        }
        return div;
    }
}, true);

//ends


