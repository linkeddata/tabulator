/*   Sharing Pane
**
**  This outline pane allows a user to view and adjust the sharing -- accesss control lists
** for anything which has that capability.
**
** I am using in places single quotes strings like 'this'
** where internationalization ("i18n") is not a problem, and double quoted
** like "this" where the string is seen by the user and so I18n is an issue.
*/



if (typeof console == 'undefined') { // e.g. firefox extension. Node and browser have console
    console = {};
    console.log = function(msg) { tabulator.log.info(msg);};
}



// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_sharing = iconPrefix + 'js/panes/common/icons/noun_123691.svg';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_sharing] = 'Sharing'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_sharing,

    name: 'sharing',

    // Does the subject deserve an contact pane?
    label: function(subject) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var t = kb.findTypeURIs(subject);
        if (t[ns.ldp('Resource').uri]) return "Sharing"; // @@ be more sophisticated?
        if (t[ns.ldp('Container').uri]) return "Sharing"; // @@ be more sophisticated?
        if (t[ns.ldp('BasicContainer').uri]) return "Sharing"; // @@ be more sophisticated?
        // check being allowed to see/change shgaring?
        return null; // No under other circumstances
    },


    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var div = dom.createElement("div")
        var cardDoc = subject.doc();

        div.setAttribute('class', 'sharingPane');


        // Set up a frame with status Block

        var toolsPane = function() {
            var kb = tabulator.kb, ns = tabulator.ns;
            var doc = $rdf.sym(subject.uri.split('#')[0]); // The ACL is actually to the doc describing the thing

            var pane = dom.createElement('div');
            var table = pane.appendChild(dom.createElement('table'));
            table.setAttribute('style', 'font-size:120%; margin: 1em; border: 0.1em #ccc ;');
            var headerRow = table.appendChild(dom.createElement('tr'));
            headerRow.textContent =  tabulator.Util.label(subject) + " - tools";
            headerRow.setAttribute('style', 'min-width: 20em; padding: 1em; font-size: 150%; border-bottom: 0.1em solid red; margin-bottom: 2em;');

            var statusRow = table.appendChild(dom.createElement('tr'));
            var statusBlock = statusRow.appendChild(dom.createElement('div'));
            statusBlock.setAttribute('style', 'padding: 2em;');
            var MainRow = table.appendChild(dom.createElement('tr'));
            var box = MainRow.appendChild(dom.createElement('table'));
            // var bottomRow = table.appendChild(dom.createElement('tr'));


            context = { target: subject, me: me, noun: "resource",
                div: pane, dom: dom, statusRegion: statusBlock };

            box.appendChild(tabulator.panes.utils.ACLControlBox(subject, dom, function(ok, body){
                if (!ok) box.innerHTML = "ACL control box Failed: " + body;
            }));

            return pane;
        }

        tabulator.panes.utils.preventBrowserDropEvents(dom);
        div.appendChild(toolsPane());
        return div;
    }
}, true);

//ends
