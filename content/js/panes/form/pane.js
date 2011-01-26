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
        
        kb.fetcher.nowOrWhenFetched(store.uri, subject, function() {

            //              Render the forms
            
            var forms = tabulator.panes.utils.formsFor(subject);
            var div = dom.createElement('div');
            div.setAttribute('class', 'formPane');
            // complain('Form for editing this form:');
            for (var i=0; i<forms.length; i++) {
                div.appendChild(dom.createElement('h4').textContent)
                tabulator.panes.utils.appendForm(dom, div, kb, subject, form, store, complainIfBad); // @@ No link from anywhere
            }


        }); // end: when store loded

        return div;
    }

}, false);

//ends



