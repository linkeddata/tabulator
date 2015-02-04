// Data Source List   - Provenance - Firefox Extension version
// MIT Licencse

function SourceWidget(container) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);                   
    var gBrowser = wm.getMostRecentWindow("navigator:browser").getBrowser();
    //Because this is in the scope of a component, gBrowser has to be declared
    this.document = Components.classes["@mozilla.org/xul/xul-document;1"].createInstance();
    this.container = this.document.createElementNS('http://www.w3.org/1999/xhtml','html:div');
    this.container.setAttribute('id','tabulatorsourcescontainer');
    this.ele = container;
    this.sources = {};
    var sw = this;

    this.setContainer = function (newContainer) {
        var doc = newContainer.ownerDocument;
        this.ele = newContainer; //this.ele is not used anywhere in this code, used elsewhere?
        this.document = doc;                
        try{
            //this is necessary in Firefox3, but throws a NOT_IMPLEMENTED error in firefox 2
            doc.adoptNode(this.container);
        }catch(e){tabulator.log.warn('Error catched by Tabulator:'+e);}
        this.ele.appendChild(this.container);
    }

    this.clearContainer = function () {
        this.ele = null;
    }


// need table.wide  tr:nth-child(odd) td{  background-color: #efe; }
//   table.wide tr:nth-child(even) td{ }


    this.addStatusUpdateCallbacks = function (term, node) {
        var displayStatus = function (uri, r, phase) {
            var udoc = tabulator.kb.sym(tabulator.rdf.Util.uri.docpart(uri));
            if (!node) { return false };
            if (!uri) { return true };
            if (udoc.sameTerm(term)) {
                if (!node.textContent) node.textContent = '';  // Avoid NaN in + below ?? 
                
                var notice = { recv: "incoming...", load: "parsing...", fail: "Failed.", done: "Done." }[phase];
                node.textContent += ' [' + notice + '] '; // @@@
                
                if (phase === 'done' || phase == 'fail') { 
                    var req = tabulator.kb.any(undefined, tabulator.ns.link('requestedURI'), udoc.uri); // @@ what if > 1?
                    if (!req) { node.textContent += '@@ no rq '; return true;}; // @ should not happen
                    // var response = tabulator.kb.the(req, tabulator.ns.link('response'));
                    // if (!response) { node.textContent += '@@ no resp '; return true;}; // @ should not happen
                    var lstat = tabulator.kb.the(req, tabulator.ns.link('status'));
                    if (!lstat) { node.textContent += " (no stat)"; return true;}; // @ should not happen
                    if (!lstat) return true; // @@
                    if (!lstat.elements) return true; // @@
                    if (typeof lstat.elements[lstat.elements.length-1]
                        != 'undefined') {
                        if(tabulator.fetcher.getState(term)=="failed"){
                            node.parentNode.setAttribute('syle', 'background-color: #faa;');
                        }
                        node.textContent = lstat.elements[lstat.elements.length-1];
                    }
                }
                return false;
            } else {
                return true;  // call me again
            }
        }

        var cb2 = function (uri, r){
            var udoc = tabulator.kb.sym(tabulator.rdf.Util.uri.docpart(uri));
            if (udoc.sameTerm(term)) {
                node.textContent =+ 'parsing...';
                return false;
            } else {
                return true;
            }            
        };

        ['recv', 'load', 'fail', 'done'].map(function (phase){
            tabulator.fetcher.addCallback(phase, function (uri, r) {
                return displayStatus(uri, r, phase)
            });
        });
        
//        tabulator.fetcher.addCallback('recv', function (uri, r) {return displayStatus(uri, r, 'recv')});
//        tabulator.fetcher.addCallback('load', function (uri, r) {return displayStatus(uri, r, 'load')});
//        tabulator.fetcher.addCallback('load',cb2);
//        tabulator.fetcher.addCallback('fail', function (uri, r) {return displayStatus(uri, r, ')});
//        tabulator.fetcher.addCallback('done', function (uri, r) {return displayStatus(uri, r, "Done")});

//        tabulator.fetcher.addCallback('fail',cb);
//        tabulator.fetcher.addCallback('done',cb);
    }

    this.addSource = function (uri, r) {
        var udoc = tabulator.kb.sym(tabulator.rdf.Util.uri.docpart(uri))
        if (!sw.sources[udoc.uri]) {
            var row = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:tr');
            row.setAttribute('id',uri);
            sw.sources[udoc.uri] = row;		// was true - tbl
            var iconCell = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');
            var src = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');
            var status = sw.document.createElementNS('http://www.w3.org/1999/xhtml','html:td');
            status.textContent = "";

            var xbtn = tabulator.Util.AJARImage(tabulator.Icon.src.icon_remove_node, 'remove',null,sw.document);
            xbtn.addEventListener('click',function () {
                tabulator.fetcher.retract(udoc)
                sw.ele.removeChild(row)
            },true);
            iconCell.appendChild(xbtn)

            src.style.color = "blue";
            src.style.cursor = "default";
            src.textContent = udoc.uri;
            src.addEventListener('click',function (e) {
                //TODO:What about redirects?
                gBrowser.selectedTab=gBrowser.addTab(udoc.uri);
            },true);

            sw.addStatusUpdateCallbacks(udoc,status)
            tabulator.fetcher.addCallback('refresh',function (u, r) {
                if (!status) { return false }
                if (!uri) { return true }
                var udoc2 = tabulator.kb.sym(tabulator.rdf.Util.uri.docpart(uri))
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

    tabulator.fetcher.addCallback('request',this.addSource);
    tabulator.fetcher.addCallback('retract',function (u) {
        u.uri && delete sw.sources[u.uri]
        //TODO:Probably have to physically remove DOM Nodes, too.
        return true
    });
		   
    this.highlight = function (u, on) {
        if (!u) return;
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        var myxulwin = wm.getMostRecentWindow("tabulatorsources");
        if (on && myxulwin) {
            var doc = myxulwin.document;
            var innerWin = doc.getElementById("sourceshtml").contentWindow;
            var innerDoc = doc.getElementById("sourceshtml").contentDocument;
            innerWin.scrollTo(0,innerDoc.getElementById(u.uri).offsetTop); //I can't believe I'm using this..
        }
        this.sources[u.uri].setAttribute('class', on ? 'sourceHighlight' : '');
    }
}