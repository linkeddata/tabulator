/*
**                 Pane for running existing forms for any object
**
*/

    
tabulator.Icon.src.icon_form = iconPrefix + 'js/panes/form/form-b-22.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_form] = 'forms';

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_form,
    
    name: 'form',
    
    // Does the subject deserve this pane?
    label: function(subject) {
        var n = tabulator.panes.utils.formsFor(subject).length;
        tabulator.log.debug("Form pane: forms for "+subject+": "+n)
        if (!n) return null;
        return ""+n+" forms";
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var UI = $rdf.Namespace('http://www.w3.org/ns/ui#');
        

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


        
        if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(kb);
 
        
        kb.statementsMatching(undefined, undefined, subject);

        // The question of where to store this data
        // This in general needs a whole lot more thought
        // and it connects to the discoverbility through links
        
        var docs = {}
        kb.statementsMatching(subject).map(function(st){docs[st.why.uri] = 1});
        kb.statementsMatching(undefined, undefined, subject).map(function(st){docs[st.why.uri] = 1});
        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;
        
        var store;
        var docuri = $rdf.Util.uri.docpart(subject.uri);
        if (subject.uri != docuri
            && tabulator.sparql.editable(docuri))
            store = kb.sym($rdf.Util.uri.docpart(subject.uri)); // an editable data file with hash
            
        else if (store = kb.any(kb.sym(docuri), ns.link('annotationStore'))) {
            // 
        }
        else store = kb.sym('http://tabulator.org/wiki/2010/testformdata/common'); // fallback
        // A fallback which gives a different store page for each ontology would be good @@
        
        var box = dom.createElement('div');
        box.setAttribute('class', 'formPane');
        kb.fetcher.nowOrWhenFetched(store.uri, subject, function() {

            //              Render the forms
            
            var forms = tabulator.panes.utils.formsFor(subject);
            // complain('Form for editing this form:');
            for (var i=0; i<forms.length; i++) {
                var form = forms[i];
                var heading = dom.createElement('h4');
                box.appendChild(heading);
                if (form.uri) {
                    var formStore = $rdf.Util.uri.document(form);
                    if (formStore.uri != form.uri) {// The form is a hash-type URI
                        var e = box.appendChild(tabulator.panes.utils.editFormButton(
                                dom, box, form, formStore,complainIfBad ));
                        e.setAttribute('style', 'float: right;');
                    }
                }
                var anchor = dom.createElement('a');
                anchor.setAttribute('href', form.uri);
                heading.appendChild(anchor)
                anchor.textContent = tabulator.Util.label(form, true);
                
                mention("Where will this information be stored?")
                var ele = dom.createElement('input');
                box.appendChild(ele);
                ele.setAttribute('type', 'text');
                ele.setAttribute('size', '72');
                ele.setAttribute('maxlength', '1024');
                ele.setAttribute('style', 'font-size: 80%; color:#222;');
                ele.value = store.uri
                
                tabulator.panes.utils.appendForm(dom, box, {}, subject, form, store, complainIfBad);
            }


        }); // end: when store loded

        return box;
    }

}, false);

//ends



