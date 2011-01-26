/*   User Interface hints Pane
**
*/

    
tabulator.Icon.src.icon_builder = iconPrefix + 'js/panes/ui/22-builder.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_builder] = 'build user interface'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_builder,
    
    name: 'ui',
    
    // Does the subject deserve this pane?
    label: function(subject) {
        var ns = tabulator.ns;
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        if (t[ns.rdfs('Class').uri]) return "user interface";
        if (t[ns.rdf('Property').uri]) return "user interface";
        if (t[ns.ui('Form').uri]) return "user interface";
        
        return null; // No under other circumstances (while testing at least!)
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var UI = $rdf.Namespace('http://www.w3.org/ns/ui#');
        
        var div = dom.createElement('div')
        div.setAttribute('class', 'uiPane');
        var label = tabulator.Util.label(subject)
        div.innherHTML='<h2>'+"Use Interface for "+label+'</h2><table><tbody><tr>\
        <td>%s</tr></tbody></table>\
        <p>This is a pane under development.</p>';

        var commentFlter = function(pred, inverse) {
            if (!inverse && pred.uri == 
                'http://www.w3.org/2000/01/rdf-schema#comment') return true;
            return false
        }

        var complain = function complain(message){
            var pre = dom.createElement("pre");
            pre.setAttribute('style', 'color: grey');
            div.appendChild(pre);
            pre.appendChild(dom.createTextNode(message));
        } 

        var complainIfBad = function(ok,body){
            if (ok) {
                // setModifiedDate(store, kb, store);
                // rerender(div);   // Deleted forms at the moment
            }
            else complain("Sorry, failed to save your change:\n"+body);
        }

        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, dom);
            parent.replaceChild(div2, div);
        };


 // //////////////////////////////////////////////////////////////////////////////       
        
        
        
        if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(kb);
 
        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;
        
        var store = null;
        if (subject.uri) {
            var docuri = $rdf.Util.uri.docpart(subject.uri);
            if (subject.uri != docuri
                && tabulator.sparql.editable(docuri))
                store = kb.sym($rdf.Util.uri.docpart(subject.uri)); // an editable ontology with hash
        }
        if (!store) store = kb.any(kb.sym(docuri), ns.link('annotationStore'));

        if (!store) store = kb.sym('http://tabulator.org/wiki/ontologyAnnotation/common'); // fallback
        
        // A fallback which gives a different store page for each ontology would be good @@
        
        kb.fetcher.nowOrWhenFetched(store.uri, subject, function() {

            //              Render a Property
            
            if (t[ns.rdf('Property').uri]) {

                var res = tabulator.panes.utils.checkProperty(kb, pred);
                var data = res.data, range = res.range;
            
                if (data == undefined) {
                    // add a select for data or object
                    div.appendChild(dom.createElement('p')).textContent =
                     "A data type property takes a data value";
                    div.appendChild(tabulator.panes.utils.makeSelectForOptions(dom, kb, subject, ns.rdf('type'),
                        [ns.owl('DatatypeProperty'), ns.owl('ObjectProperty') ], false, "-- which is it? -- " , store, complainIfBad));
                }

                if (data) {
                    if (range) {
                        

                    } else {
                    
                    }
                
                } else { // not data, object property

                    complain('object property @@');
                }



                div.appendChild(dom.createElement('tr'))
                            .setAttribute('style','height: 1em'); // spacer
                
                // Remaining properties
                /*
                tabulator.outline.appendPropertyTRs(div, plist, false,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                    });
                tabulator.outline.appendPropertyTRs(div, qlist, true,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                    });
    */
            // end of render property instance

//      _____________________________________________________________________

            //              Render a Class -- the forms associated with it
            
            } else if (t[ns.rdfs('Class').uri]) {

                // complain('class');
                // For each creation form, allow one to caete a new trip with it, and also to edit the form.
                var pred = ns.ui('creationForm');
                var sts = kb.statementsMatching(subject, pred);
                if (sts.length) {
                    div.appendChild(dom.createElement('h2')).textContent = tabulator.Util.label(pred);
                    for (var i=0; i<sts.length; i++) {
                        tabulator.outline.appendPropertyTRs(div,  [ sts[i] ]);
                        var form = sts[i].object;
                        div.appendChild(tabulator.panes.utils.newButton(
                            dom, kb, null, null, subject, form, store, function(ok,body){
                            if (ok) {
                                // tabulator.outline.GotoSubject(newThing@@, true, undefined, true, undefined);
                                // rerender(div);   // Deleted forms at the moment
                            }
                            else complain("Sorry, failed to save your change:\n"+body);
                        }) );
                        
                        var formdef = kb.statementsMatching(form, ns.rdf('type'));
                        if (!formdef.length) formdef = kb.statementsMatching(form);
                        if (!formdef.length) complain('No data about form');
                        else tabulator.panes.utils.editFormButton(dom, div,
                                        form, formdef[0].why, complainIfBad);
                    }
                } else {
                    complain("There are no forms defined for this class.");
                }
                div.appendChild(dom.createElement('hr'));
                div.appendChild(tabulator.panes.utils.newButton(
                    dom, kb, subject, pred, ns.ui('Form'), null, store, complainIfBad) )

//      _____________________________________________________________________

            //              Render a Form
            
            } else if (t[ns.ui('Form').uri]) {

                complain('Form for editing this form. (Editing '+store+')');
                tabulator.panes.utils.appendForm(dom, div, kb, subject, ns.ui('FormForm'), store, complainIfBad);

            } else {
                complain("Eh?");

            }

        }); // end: when store loded

        return div;
    }

}, false);

//ends


