/*   Attachment Pane
**
** - Attach a document to a thing
**  - View attachments
** - Look at all unattached Supporting Documents.
** - Drag a document onto the pane to attach it @@
**
**
** I am using in places single quotes strings like 'this'
** where internationalizatio ("i18n") is not a problem, and double quoted
** like "this" where th string is seen by the user and so I18n is an issue.
*/

    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_paperclip = iconPrefix + 'js/panes/attach/tbl-paperclip-22.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_bug] = 'Attachments'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_paperclip,
    
    name: 'attachments',
    
    // Does the subject deserve an issue pane?
    label: function(subject) {
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        if (t['http://www.w3.org/ns/pim/trip#Trip'] ||
        subject.uri == 'http://www.w3.org/ns/pim/trip#Trip' ||
        t['http://www.w3.org/2000/10/swap/pim/qif#Transaction'] ||
        subject.uri == 'http://www.w3.org/2000/10/swap/pim/qif#Transaction') return "attachments";
        return null; 
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var TRIP = $rdf.Namespace('http://www.w3.org/ns/pim/trip#');
        var QU = $rdf.Namespace('http://www.w3.org/2000/10/swap/pim/qif#');
        var div = dom.createElement("div");
        
        
   //////////////////////////////////////////////////////////////////////////////     
        
        var setModifiedDate = function(subj, kb, doc) {
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, WF('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, WF('modifiedBy'), me, doc) );
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = dom.createElement("pre");
            pre.setAttribute('style', 'color: grey');
            div.appendChild(pre);
            pre.appendChild(dom.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, dom);
            parent.replaceChild(div2, div);
        };

        // Where can we write about this thing?
        //
        // Returns term for document of null 
        var findStore = function(kb, subject) {
            var docURI = tabulator.rdf.Util.uri.docpart(subject.uri);
            if (tabulator.sparql.editable(docURI, kb)) return kb.sym(docURI);
            var store = (kb.sym(docURI), QU('annotationStore'));
            return store;
        }
 
 // //////////////////////////////////////////////////////////////////////////////       
        
        var selectorPanel = function(dom, kb,
            predicate, inverse, possible, options, store, callback) {
            
            var list = dom.createElement("div");
            var item, x, already;

            var listen = function(it, xx){
                item.addEventListener('click', function(event){
                    // complain('Clicked!'+event+" for "+xx.uri);
                    it.setAttribute('style', style0 + 'background-color: black; color:white;')
                    callback(xx, event);
                }, false);
            };
            
            //list.setAttribute('style', 'border: 0.1em; width: 40%; height: 100%; padding: 1em;');
            var style0 = 'border: 0.1em; width: 80%; height: 2em; padding: 0.5em;';
            for (var i=0; i < possible.length; i++) {
                x = possible[i];
                already = inverse   ? kb.each(undefined, predicate, x)
                                        : kb.each(x, predicate);
                if (options.unused && already.length > 0) {
                    continue;
                }
                item = dom.createElement("div");
                item.setAttribute('style', style0);
                item.textContent = (tabulator.Util.label(x));
           //     item.textContent = (tabulator.Util.label(x) + already.length? ('('+already.length+')'): '');
                list.appendChild(item);
                listen(item, x);
            };
            return list;
        };
        
        div.setAttribute('class', 'attachPane');
        
        div.innerHTML='<h1>Attachments</h1><p>This is a pane under development</p>';
        div.setAttribute('style', 'background-color: #efe; width:40cm; height:20cm;');


        var predicate =  WF('attachment');
        var range = QU('SupportingDocument');
        
        var subjects = [ subject ];
        var multi = false;
        /*
        var types = kb.findTypeURIs(subject);
        if (types['http://www.w3.org/ns/pim/trip#Trip'] ||
        types['http://www.w3.org/2000/10/swap/pim/qif#Transaction'] ||
*/

        // Set up a triage of many class memembers against documents
        if (subject.uri == 'http://www.w3.org/ns/pim/trip#Trip' ||
            subject.uri == 'http://www.w3.org/2000/10/swap/pim/qif#Transaction'){
            subjects = kb.each(undefined, ns.rdf('type'), subject);
            multi = true;
        }

        var store = findStore(kb, subject);
        if (!store) complain("There is no annotation store for: "+subject.uri);

        var objects = kb.each(undefined, ns.rdf('type'), range);
        if (!objects.length) complain("objects:"+objects.length);
        
        var options = {};
        var showSubject = function(x, event) {
            complain('subject clicked' + x.uri);
        }
        if (multi) {
            var subjectList = selectorPanel(dom, kb,
                    predicate, false, subjects, options, store, showSubject);
            subjectList.setAttribute('style',
                'background-color: #ffe;  width: 25em; height: 100%; padding: 1em; overflow:scroll; float:left');
            div.appendChild(subjectList);
        }

        var showObject = function(x, event) {
            //preview.innerHTML = ''; // Clean out what is there
            complain("Show object "+x.uri)
            if (0) {
                preview.innerHTML = '<iframe width="100%" height="100%" src="'
                    + x.uri + '">' + x.uri + '</iframe>';
            } else {
                preview.innerHTML = '<img width="100%" height="100%" src="'
                    + x.uri + '">';
            }
        }


       var objectList = selectorPanel(dom, kb, predicate, true, objects, options, store, showObject);
        objectList.setAttribute('style', 'background-color: #fef;  width: 30em; height: 100%; padding: 1em; float:left;overflow:scroll;');
        div.appendChild(objectList);

        var preview = dom.createElement("div");
        preview.setAttribute('style', 'background-color: #fee; padding: 1em;  height: 100%; overflow:scroll;');
        div.appendChild(preview);

         
        
        
        // if (!me) complain("(You do not have your Web Id set. Set your Web ID to make changes.)");

        return div;
    }
}, true);

//ends


