/*   Class member Pane
**
**  This outline pane lists the members of a class
*/
tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_instances,

    name: 'classInstance', // @@ 'folder'

    label: function(subject) {
      var n = tabulator.kb.each(
          undefined, tabulator.ns.rdf( 'type'), subject).length;
      if (n > 0) return "List (" + n + ")";  // Show how many in hover text
      n = tabulator.kb.each(
          subject, tabulator.ns.ldp( 'contains')).length;
      if (n > 0) {
        return "Contents (" + n + ")"  // Show how many in hover text
      }
      return null;     // Suppress pane otherwise
    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb
        var complain = function complain(message, color){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'background-color: '+ color || '#eed' +';');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        }
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'instancePane');

        // If this is an LDP container just list the directory
        var contentsStatements = kb.statementsMatching(subject, tabulator.ns.ldp( 'contains'));
        if (contentsStatements.length) {
            // complain("Contents:", 'white'); // filter out hidden files?
            tabulator.outline.appendPropertyTRs(div, contentsStatements, false, function(pred){return true;})
        }

        // If this is a class, look for all both explicit and implicit
        var sts = kb.statementsMatching(undefined, tabulator.ns.rdf( 'type'), subject)
        if (sts.length > 0) {
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
        }
        return div;
    }
}, true);

//ends
