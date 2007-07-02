function SourceWidget(container) {
    this.document = Components.classes["@mozilla.org/xul/xul-document;1"].createInstance()
    this.container = this.document.createElementNS('http://www.w3.org/1999/xhtml','html:div');
    this.container.setAttribute('id','tabulatorsourcescontainer');
    this.ele = container;
    this.sources = {}
    var sw = this

    this.setContainer = function(newContainer) {
        this.ele = newContainer;
        this.ele.appendChild(this.container);
    }

    this.clearContainer = function() {
        this.ele = null;
    }


    this.addStatusUpdateCallbacks = function (term, node) {
        var cb = function (uri, r) {
            if (!node) { return false }
            if (!uri) { return true }
            var udoc = tabulator.kb.sym(Util.uri.docpart(uri))
            if (udoc.sameTerm(term)) {
                var req = tabulator.kb.any(udoc, tabulator.kb.sym('tab', 'request')) // @@ what if > 1?
                var lstat = tabulator.kb.the(req, tabulator.kb.sym('tab','status'))
                if (typeof lstat.elements[lstat.elements.length-1]
                    != "undefined") {
                    if(sf.getState(term)=="failed"){
                        node.parentNode.style.backgroundColor="#faa";
                    }
                    node.textContent = lstat.elements[lstat.elements.length-1]
                }
                return false
            } else {
                return true  // call me again
            }
        }

        tabulator.sf.addCallback('recv',cb)
        tabulator.sf.addCallback('load',cb)
        tabulator.sf.addCallback('fail',cb)
        tabulator.sf.addCallback('done',cb)	
    }

    this.addSource = function (uri, r) {
        var udoc = tabulator.kb.sym(Util.uri.docpart(uri))
        if (!sw.sources[udoc.uri]) {
            var row = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:tr');
            row.setAttribute('id',uri);
            sw.sources[udoc.uri] = row		// was true - tbl
            var iconCell = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');
            var src = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');
            var status = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');

            var xbtn = AJARImage(Icon.src.icon_remove_node, 'remove',null,sw.document);
            xbtn.addEventListener('click',function () {
                tabulator.sf.retract(udoc)
                sw.ele.removeChild(row)
            },true);
            iconCell.appendChild(xbtn)

            src.style.color = "blue"
            src.style.cursor = "default"
            src.textContent = udoc.uri
            src.addEventListener('click',function (e) {
                //TODO:What about redirects?
                gBrowser.selectedTab=gBrowser.addTab(udoc.uri);
            },true);

            sw.addStatusUpdateCallbacks(udoc,status)
            tabulator.sf.addCallback('refresh',function (u, r) {
                if (!status) { return false }
                if (!uri) { return true }
                var udoc2 = tabulator.kb.sym(Util.uri.docpart(uri))
                if (udoc2.sameTerm(udoc)) {
                    sw.addStatusUpdateCallbacks(udoc,status)
                }
                return true
            })

            row.appendChild(iconCell)
            row.appendChild(src)
            row.appendChild(status)
            sw.container.appendChild(row)
            if(sw.ele) { //repaint style.
              sw.ele.removeChild(sw.container);
              sw.ele.appendChild(sw.container);
            }
        }
        return true
    }

    tabulator.sf.addCallback('request',this.addSource)
    tabulator.sf.addCallback('retract',function (u) {
        u.uri && delete sw.sources[u.uri]
        //TODO:Probably have to physically remove DOM Nodes, too.
        return true
    })
		   
    this.highlight = function(u, on) {
        if (!u) return;
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        var myxulwin = wm.getMostRecentWindow("tabulatorsources");
        if(myxulwin) {
            var doc = myxulwin.document;
            var innerWin = doc.getElementById("sourceshtml").contentWindow;
            var innerDoc = doc.getElementById("sourceshtml").contentDocument;
            innerWin.scrollTo(0,innerDoc.getElementById(u.uri).offsetTop) //I can't believe I'm using this..
        }
        this.sources[u.uri].setAttribute('class', on ? 'sourceHighlight' : '')
    }
}