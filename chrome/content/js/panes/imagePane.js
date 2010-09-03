/*   Image Pane
**
**  This outline pane contains the document contents for an Image document
*/
tabulator.panes.register( {
    icon: tabulator.Icon.src.icon_imageContents,
    
    name: 'image',
    
    label: function(subject) {
        var kb = tabulator.kb;
        if (!kb.anyStatementMatching(
            subject, tabulator.ns.rdf( 'type'),
            kb.sym('http://purl.org/dc/terms/Image'))) // NB: Not dc: namespace!
            return null;
        return "view";
    },

    render: function(subject, myDocument) {
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'imageView')
        var img = myDocument.createElement("IMG")
        img.setAttribute('src', subject.uri) // w640 h480
        div.style['max-width'] = '640';
        div.style['max-height'] = '480';
        var tr = myDocument.createElement('TR')  // why need tr?
        tr.appendChild(img)
        div.appendChild(tr)
        return div
    }
}, true);

//ends


