/*   Human-readable Pane
**
**  This outline pane contains the document contents for an HTML document
**  This is for peeking at a page, because the user might not want to leave the tabulator.
*/
tabulator.panes.register({
    
    icon: tabulator.Icon.src.icon_visit,
    
    name: 'humaReadable',
    
    label: function(subject, myDocument) {
        //recursive iframe is not allowed (eh? -tim)
        if (tabulator.isExtension && myDocument.location == subject.uri) return null;
        var kb = tabulator.kb;
        var request = kb.any(subject, tabulator.ns.link("request"));
        if (!request) return null;
        // Don't use the() when it would not be an error for there not to be any.
        var content_type = kb.any(request, tabulator.ns.httph("content-type"));
        if (!content_type) return null;//this hapeens when request is generated but response not ready        
        var allowed = ['text/plain','application/x-javascript',
                       ,'text/html','application/xhtml+xml','text/css'];
        if (allowed.filter(function(s){return content_type.value.search(s)!=-1}).length) return "view";
        //if (!kb.anyStatementMatching(
        //    subject, tabulator.ns.rdf( 'type'), tabulator.ns.link( 'TextDocument')))
        //    return null;
        //var s = dataContentPane.label(subject);
        // Done to stop Tab'r trying to show nestd RDF and N3 files in Firefox
        //if (s) return null; // If a data document, don't try human readable view.  (?)
        return null;
    },
    
    render: function(subject, myDocument) {
        var div = myDocument.createElement("div")

        div.setAttribute('class', 'docView')    
        var iframe = myDocument.createElement("IFRAME")
        iframe.setAttribute('src', subject.uri)
        iframe.setAttribute('class', 'doc')
        iframe.setAttribute('height', '480')
        iframe.setAttribute('width', '640')
        var tr = myDocument.createElement('TR')
        tr.appendChild(iframe)
        div.appendChild(tr)
        return div
    }
}, true);
//ends


