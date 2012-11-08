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
tabulator.Icon.src.icon_paperclip = iconPrefix + 'js/panes/attach/tbl-paperclip-128.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_bug] = 'Attachments'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_bug,
    
    name: 'atachments',
    
    // Does the subject deserve an issue pane?
    label: function(subject) {
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        if (t['http://www.w3.org/ns/pim/trip#trip']) return "attach";
        if (t['http://www.w3.org/2005/01/wf/flow#Tracker']) return "attach";
        return null; 
    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var div = myDocument.createElement("div");
        
        
   //////////////////////////////////////////////////////////////////////////////     
        
        var setModifiedDate = function(subj, kb, doc) {
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, WF('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, WF('modifiedBy'), me, doc) );
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'color: grey');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, myDocument);
            parent.replaceChild(div2, div);
        };

 
 // //////////////////////////////////////////////////////////////////////////////       
        
        div.setAttribute('class', 'attachPane');
        
        div.innherHTML='<h1>Attachments</h1><p>This is a pane under development</p>';
        div.setAttribute('style', 'background-color: #ffe');

        var objectList  myDocument.createElement("div");
        objectList.setAttribute('style', 'width: 40%; height: 100%; padding: 1em;');
        div.appendChild(objectList);

        var docList = myDocument.createElement("div");
        docList.setAttribute('style', 'width: 20%; height: 100%; padding: 1em;  border-color: #777;');
        div.appendChild(docList);
        
        var preview = myDocument.createElement("div");
        preview.setAttribute('style', 'width: 40%; height: 100%; padding: 1em;');
        div.appendChild(preview);
        
        
        // if (!me) complain("(You do not have your Web Id set. Set your Web ID to make changes.)");

        return div;
    }
}, true);

//ends


