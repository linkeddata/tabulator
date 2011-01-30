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
        if (t[ns.rdfs('Class').uri]) return "creation forms";
        // if (t[ns.rdf('Property').uri]) return "user interface";
        if (t[ns.ui('Form').uri]) return "edit form";
        
        return null; // No under other circumstances (while testing at least!)
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        
        var box = dom.createElement('div')
        //box.setAttribute('class', 'uiPane');
        var label = tabulator.Util.label(subject);

        var mention = function complain(message, style){
            var pre = dom.createElement("p");
            pre.setAttribute('style', style ? style :'color: grey; background-color: white');
            box.appendChild(pre).textContent = message;
            return pre
        } 

        var complain = function complain(message, style){
            mention(message, 'style', style ? style :'color: grey; background-color: #fdd');
        } 

        var complainIfBad = function(ok,body){
            if (ok) {
                // setModifiedDate(store, kb, store);
                // rerender(box);   // Deleted forms at the moment
            }
            else complain("Sorry, failed to save your change:\n"+body);
        }

        var thisPane = this;
        var rerender = function(box) {
            var parent  = box.parentNode;
            var box2 = thisPane.render(subject, dom);
            parent.replaceChild(box2, box);
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
        if (!store) store = tabulator.panes.utils.defaultAnnotationStore(subject);
        if (!store) store = kb.sym('http://tabulator.org/wiki/ontologyAnnotation/common'); // fallback
        
        // A fallback which gives a different store page for each ontology would be good @@
        
        var wait = mention('(Loading data from: '+store+')');

        kb.fetcher.nowOrWhenFetched(store.uri, subject, function() {

            box.removeChild(wait);

//      _____________________________________________________________________

            //              Render a Class -- the forms associated with it
            
            if (t[ns.rdfs('Class').uri]) {

                // complain('class');
                // For each creation form, allow one to create a new trip with it, and also to edit the form.
                var pred = ns.ui('creationForm');
                var sts = kb.statementsMatching(subject, pred);
                box.appendChild(dom.createElement('h2')).textContent = tabulator.Util.label(pred);
                mention("Creation forms allow you to add information about a new thing,\
                                    in this case a new "+label+".");
                if (sts.length) {
                    for (var i=0; i<sts.length; i++) {
                        tabulator.outline.appendPropertyTRs(box,  [ sts[i] ]);
                        var form = sts[i].object;
                        var cell = dom.createElement('td');
                        box.lastChild.appendChild(cell);
                        cell.appendChild(tabulator.panes.utils.newButton(
                            dom, kb, null, null, subject, form, store, function(ok,body){
                            if (ok) {
                                // tabulator.outline.GotoSubject(newThing@@, true, undefined, true, undefined);
                                // rerender(box);   // Deleted forms at the moment
                            }
                            else complain("Sorry, failed to save your change:\n"+body);
                        }) );
                        
                        var formdef = kb.statementsMatching(form, ns.rdf('type'));
                        if (!formdef.length) formdef = kb.statementsMatching(form);
                        if (!formdef.length) complain('No data about form');
                        else tabulator.panes.utils.editFormButton(dom, box,
                                        form, formdef[0].why, complainIfBad);
                    }
                    box.appendChild(dom.createElement('hr'));
                } else {
                    mention("There are no forms currently defined to make a "+
                        label+".");
                }
                mention("You can make a new form.");
                box.appendChild(tabulator.panes.utils.newButton(
                    dom, kb, subject, pred, ns.ui('Form'), null, store, complainIfBad) )
                mention("Storing new form in: "+store)
                box.appendChild(dom.createElement('hr'));

//      _____________________________________________________________________

            //              Render a Form
            
            } else if (t[ns.ui('Form').uri]) {

                tabulator.panes.utils.appendForm(dom, box, kb, subject, ns.ui('FormForm'), store, complainIfBad);

            } else {
                complain("ui/pane internal error -- Eh?");

            }

        }); // end: when store loded

        return box;
    }

}, false);

//ends


