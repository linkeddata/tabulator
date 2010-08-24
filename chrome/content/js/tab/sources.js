/************************************************************
 * 
 * Project: AJAR/Tabulator
 * 
 * File: sources.js
 * 
 * Description: contains functions for requesting/fetching/retracting
 *  'sources' -- meaning any document we are trying to get data out of
 *  This implements quite a lot of the web architecture
 * 
 * SVN ID: $Id: sources.js 25776 2009-04-09 18:50:29Z timbl $
 *
 ************************************************************/

/**
 * Things to test: callbacks on request, refresh, retract
 *   loading from HTTP, HTTPS, FTP, FILE, others?
 */

tabulator.SourceFetcher = function(store, timeout, async) {
    this.store = store
    this.thisURI = "http://dig.csail.mit.edu/2005/ajar/ajaw/rdf/sources.js" + "#SourceFetcher"
    this.timeout = timeout ? timeout : 30000
    this.async = async != null ? async : true
    this.appNode = this.store.bnode(); // Denoting this session
    this.store.fetcher = this; //Bi-linked
    this.requested = {}
    this.lookedUp = {}
    this.handlers = []
    this.mediatypes = {}
    var sf = this
    var kb = this.store;
    tabulator.SourceFetcher.RDFXMLHandler = function(args) {
        if (args) {
            this.dom = args[0]
        }
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                var kb = sf.store
                if (!this.dom) {
                    var dparser;
                    if (isExtension) {
                        dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"].getService(Components.interfaces.nsIDOMParser);
                    } else {
                        dparser = new DOMParser()
                    }
                    //strange things hapeen when responseText is empty
                    this.dom = dparser.parseFromString(xhr.responseText, 'application/xml')
                }

                var root = this.dom.documentElement;
                //some simple syntax issue should be dealt here, I think
                if (root.nodeName == 'parsererror') { //@@ Mozilla only See issue 110
                    //            alert('Warning: Badly formed XML');
                    sf.failFetch(xhr, "Badly formed XML in " + xhr.uri.uri); //have to fail the request
                    throw new Error("Badly formed XML in " + xhr.uri.uri); //@@ Add details
                }
                var parser = new tabulator.rdf.RDFParser(kb)
                sf.addStatus(xhr, 'parsing...');
                parser.parse(this.dom, xhr.uri.uri, xhr.uri)
                kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'), sf.appNode);
                cb()
            }
        }
    }
    tabulator.SourceFetcher.RDFXMLHandler.term = this.store.sym(this.thisURI + ".RDFXMLHandler")
    tabulator.SourceFetcher.RDFXMLHandler.toString = function() {
        return "RDFXMLHandler"
    }
    tabulator.SourceFetcher.RDFXMLHandler.register = function(sf) {
        sf.mediatypes['application/rdf+xml'] = {}
    }
    tabulator.SourceFetcher.RDFXMLHandler.pattern = new RegExp("application/rdf\\+xml");

    // This would much better use on-board XSLT engine. @@
    tabulator.SourceFetcher.doGRDDL = function(kb, doc, xslturi, xmluri) {
        sf.requestURI('http://www.w3.org/2005/08/' + 'online_xslt/xslt?' + 'xslfile=' + escape(xslturi) + '&xmlfile=' + escape(xmluri), doc)
    }

    tabulator.SourceFetcher.XHTMLHandler = function(args) {
        if (args) {
            this.dom = args[0]
        }
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                if (!this.dom) {
                    var dparser;
                    if (isExtension) {
                        dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"].getService(Components.interfaces.nsIDOMParser);
                    } else {
                        dparser = new DOMParser()
                    }
                    this.dom = dparser.parseFromString(xhr.responseText, 'application/xml')
                }
                var kb = sf.store;

                // dc:title
                var title = this.dom.getElementsByTagName('title')
                if (title.length > 0) {
                    kb.add(xhr.uri, tabulator.ns.dc('title'), kb.literal(title[0].textContent), xhr.uri)
                    tabulator.log.info("Inferring title of " + xhr.uri)
                }

                // link rel
                var links = this.dom.getElementsByTagName('link');
                for (var x = links.length - 1; x >= 0; x--) {
                    sf.linkData(xhr, links[x].getAttribute('rel'), links[x].getAttribute('href'));
                }

                //GRDDL
                var head = this.dom.getElementsByTagName('head')[0]
                if (head) {
                    var profile = head.getAttribute('profile');
                    if (profile && tabulator.rdf.Util.uri.protocol(profile) == 'http') {
                        tabulator.log.info("GRDDL: Using generic " + "2003/11/rdf-in-xhtml-processor.");
                        sf.doGRDDL(kb, xhr.uri, "http://www.w3.org/2003/11/rdf-in-xhtml-processor", xhr.uri.uri)
/*			sf.requestURI('http://www.w3.org/2005/08/'
					  + 'online_xslt/xslt?'
					  + 'xslfile=http://www.w3.org'
					  + '/2003/11/'
					  + 'rdf-in-xhtml-processor'
					  + '&xmlfile='
					  + escape(xhr.uri.uri),
				      xhr.uri)
                        */
                    } else {
                        tabulator.log.info("GRDDL: No GRDDL profile in " + xhr.uri)
                    }
                }
                kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('WebPage'), sf.appNode);
                // @@ Do RDFa here
                var p = $rdf.RDFaParser(kb, xhr.uri.uri);
                cb()
            }
        }
    }
    tabulator.SourceFetcher.XHTMLHandler.term = this.store.sym(this.thisURI + ".XHTMLHandler")
    tabulator.SourceFetcher.XHTMLHandler.toString = function() {
        return "XHTMLHandler"
    }
    tabulator.SourceFetcher.XHTMLHandler.register = function(sf) {
        sf.mediatypes['application/xhtml+xml'] = {
            'q': 0.3
        }
    }
    tabulator.SourceFetcher.XHTMLHandler.pattern = new RegExp("application/xhtml")


    /******************************************************/

    tabulator.SourceFetcher.XMLHandler = function() {
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                var kb = sf.store
                var dparser;
                if (isExtension) {
                    dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"].getService(Components.interfaces.nsIDOMParser);
                } else {
                    dparser = new DOMParser()
                }
                var dom = dparser.parseFromString(xhr.responseText, 'application/xml')

                // XML Semantics defined by root element namespace
                // figure out the root element
                for (var c = 0; c < dom.childNodes.length; c++) {
                    // is this node an element?
                    if (dom.childNodes[c].nodeType == 1) {
                        // We've found the first element, it's the root
                        var ns = dom.childNodes[c].namespaceURI;

                        // Is it RDF/XML?
                        if (ns == tabulator.ns['rdf']) {
                            tabulator.log.info(xhr.uri + " seems to have a root element" + " in the RDF namespace. We'll assume " + "it's RDF/XML.")
                            sf.switchHandler(tabulator.SourceFetcher.RDFXMLHandler, xhr, cb, [dom])
                            return
                        }
                        // it isn't RDF/XML or we can't tell
                        // Are there any GRDDL transforms for this namespace?
                        // @@ assumes ns documents have already been loaded
                        var xforms = kb.each(kb.sym(ns), kb.sym("http://www.w3.org/2003/g/data-view#namespaceTransformation"));
                        for (var i = 0; i < xforms.length; i++) {
                            var xform = xforms[i];
                            tabulator.log.info(xhr.uri.uri + " namespace " + ns + " has GRDDL ns transform" + xform.uri);
                            sf.doGRDDL(kb, xhr.uri, xform.uri, xhr.uri.uri);
                        }
                        break
                    }
                }

                // Or it could be XHTML?
                // Maybe it has an XHTML DOCTYPE?
                if (dom.doctype) {
                    tabulator.log.info("We found a DOCTYPE in " + xhr.uri)
                    if (dom.doctype.name == 'html' && dom.doctype.publicId.match(/^-\/\/W3C\/\/DTD XHTML/) && dom.doctype.systemId.match(/http:\/\/www.w3.org\/TR\/xhtml/)) {
                        tabulator.log.info(xhr.uri + " has XHTML DOCTYPE. Switching to " + "XHTML Handler.")
                        sf.switchHandler(tabulator.SourceFetcher.XHTMLHandler, xhr, cb)
                        return
                    }
                }

                // Or what about an XHTML namespace?
                var html = dom.getElementsByTagName('html')[0]
                if (html) {
                    var xmlns = html.getAttribute('xmlns')
                    if (xmlns && xmlns.match(/^http:\/\/www.w3.org\/1999\/xhtml/)) {
                        tabulator.log.info(xhr.uri + " has a default namespace for " + "XHTML. Switching to XHTMLHandler.")
                        sf.switchHandler(tabulator.SourceFetcher.XHTMLHandler, xhr, cb)
                        return
                    }
                }

                // At this point we should check the namespace document (cache it!) and
                // look for a GRDDL transform
                // @@  Get namespace document <n>, parse it, look for  <n> grddl:namespaceTransform ?y
                // Apply ?y to   dom
                // We give up. What dialect is this?
                sf.failFetch(xhr, "unsupportedDialect")
            }
        }
    }
    tabulator.SourceFetcher.XMLHandler.term = this.store.sym(this.thisURI + ".XMLHandler")
    tabulator.SourceFetcher.XMLHandler.toString = function() {
        return "XMLHandler"
    }
    tabulator.SourceFetcher.XMLHandler.register = function(sf) {
        sf.mediatypes['text/xml'] = {
            'q': 0.2
        }
        sf.mediatypes['application/xml'] = {
            'q': 0.2
        }
    }
    tabulator.SourceFetcher.XMLHandler.pattern = new RegExp("(text|application)/(.*)xml")

    tabulator.SourceFetcher.HTMLHandler = function() {
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                var rt = xhr.responseText
                // We only handle XHTML so we have to figure out if this is XML
                tabulator.log.info("Sniffing HTML " + xhr.uri + " for XHTML.");

                if (rt.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
                    tabulator.log.info(xhr.uri + " has an XML declaration. We'll assume " + "it's XHTML as the content-type was text/html.")
                    sf.switchHandler(tabulator.SourceFetcher.XHTMLHandler, xhr, cb)
                    return
                }

                // DOCTYPE
                // There is probably a smarter way to do this
                if (rt.match(/.*<!DOCTYPE\s+html[^<]+-\/\/W3C\/\/DTD XHTML[^<]+http:\/\/www.w3.org\/TR\/xhtml[^<]+>/)) {
                    tabulator.log.info(xhr.uri + " has XHTML DOCTYPE. Switching to XHTML" + "Handler.")
                    sf.switchHandler(tabulator.SourceFetcher.XHTMLHandler, xhr, cb)
                    return
                }

                // xmlns
                if (rt.match(/[^(<html)]*<html\s+[^<]*xmlns=['"]http:\/\/www.w3.org\/1999\/xhtml["'][^<]*>/)) {
                    tabulator.log.info(xhr.uri + " has a default namespace for XHTML." + " Switching to XHTMLHandler.")
                    sf.switchHandler(tabulator.SourceFetcher.XHTMLHandler, xhr, cb)
                    return
                }


                // dc:title	                       //no need to escape '/' here
                var titleMatch = (new RegExp("<title>([\\s\\S]+?)</title>", 'im')).exec(rt);
                if (titleMatch) {
                    var kb = sf.store;
                    kb.add(xhr.uri, tabulator.ns.dc('title'), kb.literal(titleMatch[1]), xhr.uri); //think about xml:lang later
                    kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('WebPage'), sf.appNode);
                    cb(); //doneFetch, not failed
                    return;
                }

                sf.failFetch(xhr, "can't parse non-XML HTML")
            }
        }
    }
    tabulator.SourceFetcher.HTMLHandler.term = this.store.sym(this.thisURI + ".HTMLHandler")
    tabulator.SourceFetcher.HTMLHandler.toString = function() {
        return "HTMLHandler"
    }
    tabulator.SourceFetcher.HTMLHandler.register = function(sf) {
        sf.mediatypes['text/html'] = {
            'q': 0.3
        }
    }
    tabulator.SourceFetcher.HTMLHandler.pattern = new RegExp("text/html")

    /***********************************************/

    tabulator.SourceFetcher.TextHandler = function() {
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                // We only speak dialects of XML right now. Is this XML?
                var rt = xhr.responseText

                // Look for an XML declaration
                if (rt.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
                    tabulator.log.warn(xhr.uri + " has an XML declaration. We'll assume " + "it's XML but its content-type wasn't XML.")
                    sf.switchHandler(tabulator.SourceFetcher.XMLHandler, xhr, cb)
                    return
                }

                // Look for an XML declaration
                if (rt.slice(0, 500).match(/xmlns:/)) {
                    tabulator.log.warn(xhr.uri + " may have an XML namespace. We'll assume " + "it's XML but its content-type wasn't XML.")
                    sf.switchHandler(tabulator.SourceFetcher.XMLHandler, xhr, cb)
                    return
                }

                // We give up
                sf.failFetch(xhr, "unparseable - text/plain not visibly XML")
                tabulator.log.warn(xhr.uri + " unparseable - text/plain not visibly XML, starts:\n" + rt.slice(0, 500))

            }
        }
    }
    tabulator.SourceFetcher.TextHandler.term = this.store.sym(this.thisURI + ".TextHandler")
    tabulator.SourceFetcher.TextHandler.toString = function() {
        return "TextHandler"
    }
    tabulator.SourceFetcher.TextHandler.register = function(sf) {
        sf.mediatypes['text/plain'] = {
            'q': 0.1
        }
    }
    tabulator.SourceFetcher.TextHandler.pattern = new RegExp("text/plain")

    /***********************************************/

    tabulator.SourceFetcher.N3Handler = function() {
        this.recv = function(xhr) {
            xhr.handle = function(cb) {
                // Parse the text of this non-XML file
                var rt = xhr.responseText
                var p = tabulator.rdf.N3Parser(kb, kb, xhr.uri.uri, xhr.uri.uri, null, null, "", null)
                //                p.loadBuf(xhr.responseText)
                try {
                    p.loadBuf(xhr.responseText)

                } catch (e) {
                    var msg = ("Error trying to parse " + xhr.uri + ' as Notation3:\n' + e)
                    tabulator.log.warn(msg)
                    sf.failFetch(xhr, msg)
                    return;
                }

                sf.addStatus(xhr, 'N3 parsed: ' + p.statementCount + ' statements in ' + p.lines + ' lines.')
                sf.store.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'), sf.appNode);
                args = [xhr.uri.uri]; // Other args needed ever?
                sf.doneFetch(xhr, args)
            }
        }
    }
    tabulator.SourceFetcher.N3Handler.term = this.store.sym(this.thisURI + ".N3Handler")
    tabulator.SourceFetcher.N3Handler.toString = function() {
        return "N3Handler"
    }
    tabulator.SourceFetcher.N3Handler.register = function(sf) {
        sf.mediatypes['text/n3'] = {
            'q': '1.0'
        } // as per 2008 spec
        sf.mediatypes['text/rdf+n3'] = {
            'q': 1.0
        } // pre 2008 spec
        sf.mediatypes['application/x-turtle'] = {
            'q': 1.0
        } // pre 2008
        sf.mediatypes['text/turtle'] = {
            'q': 1.0
        } // pre 2008
    }
    tabulator.SourceFetcher.N3Handler.pattern = new RegExp("(application|text)/(x-)?(rdf\\+)?(n3|turtle)")


    /***********************************************/





    tabulator.rdf.Util.callbackify(this, ['request', 'recv', 'load', 'fail', 'refresh', 'retract', 'done'])

/* now see tabulator.ns
       this.store.setPrefixForURI('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
       this.store.setPrefixForURI('owl', "http://www.w3.org/2002/07/owl#")
       this.store.setPrefixForURI('tab',"http://www.w3.org/2007/ont/link#")
       this.store.setPrefixForURI('http',"http://www.w3.org/2007/ont/http#")
       this.store.setPrefixForURI('httph',
	   "http://www.w3.org/2007/ont/httph#")
       this.store.setPrefixForURI('ical',"http://www.w3.org/2002/12/cal/icaltzd#")
       
    */
    this.addProtocol = function(proto) {
        sf.store.add(sf.appNode, tabulator.ns.link("protocol"), sf.store.literal(proto), this.appNode)
    }

    this.addHandler = function(handler) {
        sf.handlers.push(handler)
        handler.register(sf)
    }

    this.switchHandler = function(handler, xhr, cb, args) {
        var kb = this.store;
        (new handler(args)).recv(xhr);
        kb.the(xhr.req, tabulator.ns.link('handler')).append(handler.term)
        xhr.handle(cb)
    }

    this.addStatus = function(xhr, status) {
        //<Debug about="parsePerformance">
        var now = new Date();
        status = "[" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "] " + status;
        //</Debug>
        var kb = this.store
        kb.the(xhr.req, tabulator.ns.link('status')).append(kb.literal(status))
    }

    this.failFetch = function(xhr, status) {
        this.addStatus(xhr, status)
        kb.add(xhr.uri, tabulator.ns.link('error'), status)
        this.requested[tabulator.rdf.Util.uri.docpart(xhr.uri.uri)] = false
        this.fireCallbacks('fail', [xhr.requestedURI])
        xhr.abort()
    }

    this.linkData = function(xhr, rel, uri) {
        var x = xhr.uri;
        if (!uri) return;
        // See http://www.w3.org/TR/powder-dr/#httplink for describedby 2008-12-10
        if (rel == 'alternate' || rel == 'seeAlso' || rel == 'meta' || rel == 'describedby') {
            var join = tabulator.rdf.Util.uri.join2;
            var obj = kb.sym(join(uri, xhr.uri.uri))
            if (obj.uri != xhr.uri) {
                kb.add(xhr.uri, tabulator.ns.rdfs('seeAlso'), obj, xhr.uri);
                tabulator.log.info("Loading " + obj + " from link rel in " + xhr.uri);
            }
        }
    };


    this.doneFetch = function(xhr, args) {
        this.addStatus(xhr, 'done')
        tabulator.log.info("Done with parse, firing 'done' callbacks for " + xhr.uri)
        this.requested[xhr.uri.uri] = 'done'; //Kenny
        this.fireCallbacks('done', args)
    }

    this.store.add(this.appNode, tabulator.ns.rdfs('label'), this.store.literal('This Session'), this.appNode);

    ['http', 'https', 'file', 'chrome'].map(this.addProtocol); // ftp?
    [tabulator.SourceFetcher.RDFXMLHandler, tabulator.SourceFetcher.XHTMLHandler, tabulator.SourceFetcher.XMLHandler, tabulator.SourceFetcher.HTMLHandler, tabulator.SourceFetcher.TextHandler, tabulator.SourceFetcher.N3Handler, ].map(this.addHandler)

    this.addCallback('done', function(uri, r) {
        if (uri.indexOf('#') >= 0) throw ('addCallback: Document URI may not contain #: ' + uri);
        var kb = sf.store
        var term = kb.sym(uri)
        var udoc = term.uri ? kb.sym(tabulator.rdf.Util.uri.docpart(uri)) : uri
        var refs = sf.store.statementsMatching(undefined, tabulator.ns.rdf('type'), undefined, udoc)
        refs.map(function(x) {
            sf.store.add(udoc, tabulator.ns.link('mentionsClass'), x.object, sf.appNode)
        })
        return true
    })

    /** Note two nodes are now smushed
     **
     ** If only one was flagged as looked up, then
     ** the new node is looked up again, which
     ** will make sure all the URIs are dereferenced
     */
    this.nowKnownAs = function(was, now) {
        //tabulator.log.warn("entering nowKnowAs, %s lookedup: %s, %s lookedup: %s", 
        //                    was.uri, this.lookedUp[was.uri], now.uri, this.lookedUp[now.uri]);
        if (this.lookedUp[was.uri]) {
            if (!this.lookedUp[now.uri]) this.lookUpThing(now, was)
        } else if (this.lookedUp[now.uri]) {
            if (!this.lookedUp[was.uri]) this.lookUpThing(was, now)
        }
    }





    /** Looks up a thing.
     **	    Looks up all the URIs a things has.
     ** Parameters:
     **	    term:  canonical term for the thing whose URI is to be dereferenced
     **      rterm:  the resource which refered to this (for tracking bad links)
     */
    this.lookUpThing = function(term, rterm, force) {
        tabulator.log.debug("lookUpThing: looking up " + term);
        var uris = kb.uris(term) // Get all URIs
        if (typeof uris != 'undefined') {
            for (var i = 0; i < uris.length; i++) {
                this.lookedUp[uris[i]] = true;
                this.requestURI(tabulator.rdf.Util.uri.docpart(uris[i]), rterm, force)
            }
        }
        return uris.length
    }


/*  Ask for a doc to be loaded if necessary then call back
    **/
    this.nowOrWhenFetched = function(uri, referringTerm, callback) {
        var sta = this.getState(uri);
        if (sta == 'fetched') return callback();
        this.addCallback('done', function(uri2) {
            if (uri2 == uri) callback();
            return (uri2 != uri); // Call me again?
        });
        if (sta == 'unrequested') this.requestURI(
        uri, referringTerm, false);
    }





    /** Requests a document URI and arranges to load the document.
     ** Parameters:
     **	    term:  term for the thing whose URI is to be dereferenced
     **      rterm:  the resource which refered to this (for tracking bad links)
     ** Return value:
     **	    The xhr object for the HTTP access
     **      null if the protocol is not a look-up protocol,
     **              or URI has already been loaded
     */
    this.requestURI = function(uri, rterm, force) { //sources_request_new
        if (uri.indexOf('#') >= 0) { // hash
            throw ("requestURI should notbe called with fragid: " + uri)
        }

        var pcol = tabulator.rdf.Util.uri.protocol(uri);
        if (pcol == 'tel' || pcol == 'mailto' || pcol == 'urn') return null; // No look-up operaion on these, but they are not errors
        var force = !! force
        var kb = this.store
        var args = arguments
        //	var term = kb.sym(uri)
        var docuri = tabulator.rdf.Util.uri.docpart(uri)
        var docterm = kb.sym(docuri)
        tabulator.log.debug("requestURI: dereferencing " + uri)
        //this.fireCallbacks('request',args)
        if (!force && typeof(this.requested[docuri]) != "undefined") {
            tabulator.log.debug("We already have " + docuri + ". Skipping.")
            var newArgs = [];
            for (var i = 0; i < args.length; i++) newArgs.push(args[i]);
            newArgs.push(true); //extra information indicates this is a skipping done!
            //this.fireCallbacks('done',newArgs) //comment out here
            return null
        }

        //debug code, we might need this later
/*
          if (tabulator.statusWidget && tabulator.statusWidget.pend.length > 10){
          tabulator.log.error("too many requests to "+uri+" from: "+this.requestURI.caller);
          return
          }
        */
        this.fireCallbacks('request', args); //Kenny: fire 'request' callbacks here
        // dump( "Tabulator requesting uri: " + uri + "\n" );
        this.requested[docuri] = true

        if (rterm) {
            if (rterm.uri) {
                kb.add(docterm.uri, tabulator.ns.link("requestedBy"), rterm.uri, this.appNode)
                //		        kb.add(docterm, tabulator.ns.link("requestedBy"),
                //		               kb.sym(tabulator.rdf.Util.uri.docpart(rterm.uri)), this.appNode)
            }
        }

        if (rterm) {
            tabulator.log.info('SF.request: ' + docuri + ' refd by ' + rterm.uri)
        }
        else {
            tabulator.log.info('SF.request: ' + docuri + ' no referring doc')
        };

        var status = kb.collection()
        var xhr = tabulator.rdf.Util.XMLHTTPFactory()
        var req = xhr.req = kb.bnode()
        xhr.uri = docterm
        xhr.requestedURI = args[0]
        var handlers = kb.collection()
        var sf = this

        // The list of sources is kept in the source widget
        // kb.add(this.appNode, tabulator.ns.link("source"), docterm, this.appNode)
        kb.add(docterm, tabulator.ns.link("request"), req, this.appNode)
        var now = new Date();
        var timeNow = "[" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "] ";

        kb.add(req, tabulator.ns.rdfs("label"), kb.literal(timeNow + ' Request for ' + docuri), this.appNode)
        kb.add(req, tabulator.ns.link("requestedURI"), kb.literal(docuri), this.appNode)

        // This request will have handlers probably
        kb.add(req, tabulator.ns.link('handler'), handlers, sf.appNode)

        kb.add(req, tabulator.ns.link('status'), status, sf.req)

        if (typeof kb.anyStatementMatching(this.appNode, tabulator.ns.link("protocol"), tabulator.rdf.Util.uri.protocol(uri)) == "undefined") {
            // update the status before we break out
            if (tabulator.rdf.Util.uri.protocol(uri) == 'rdf') { // ??? eh? rdf: ?? -- tim
                xhr.abort();
            }
            this.failFetch(xhr, "Unsupported protocol")
            return xhr
        }

        // Set up callbacks
        xhr.onreadystatechange = function() {
            switch (xhr.readyState) {
            case 3:
                // Intermediate states
                if (!xhr.recv) {
                    xhr.recv = true
                    var handler = null
                    sf.fireCallbacks('recv', args)
                    var response = kb.bnode();
                    kb.add(req, tabulator.ns.link('response'), response);
                    kb.add(response, tabulator.ns.http('status'), kb.literal(xhr.status), response)
                    kb.add(response, tabulator.ns.http('statusText'), kb.literal(xhr.statusText), response)

                    if (xhr.status >= 400) {
                        sf.failFetch(xhr, "HTTP error " + xhr.status + ' ' + xhr.statusText)
                        break
                    }

                    xhr.headers = {}
                    if (tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'http' || tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'https') {
                        xhr.headers = tabulator.rdf.Util.getHTTPHeaders(xhr)
                        for (var h in xhr.headers) {
                            kb.add(response, tabulator.ns.httph(h), xhr.headers[h], response)
                        }
                    }

                    // deduce some things from the HTTP transaction
                    var addType = function(cla) { // add type to all redirected resources too
                        var prev = req;
                        for (;;) {
                            var doc = kb.any(undefined, tabulator.ns.link('request'), prev)
                            kb.add(doc, tabulator.ns.rdf('type'), cla, sf.appNode);
                            prev = kb.any(undefined, kb.sym('http://www.w3.org/2006/link#redirectedRequest'), prev);
                            if (!prev) break;
                            var redirection = kb.any(prev, kb.sym('http://www.w3.org/2007/ont/http#status'));
                            tabulator.log.info('redirection :' + redirection + ' for ' + prev);
                            if (!redirection) break;
                            if (redirection != '301' && redirection != '302') break;
                        }
                    }
                    if (xhr.status - 0 == 200) {
                        //addType(tabulator.ns.link('Document'));
                        var ct = xhr.headers['content-type'];
                        if (!ct) throw ('No content-type on 200 response for ' + xhr.uri)
                        else {
                            if (ct.indexOf('image/') == 0) addType(kb.sym('http://purl.org/dc/terms/Image'));
                            //if (ct.indexOf('text/') == 0)
                            //    addType(tabulator.ns.link('TextDocument'));
                        }
                    }

                    if (tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'file' || tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'chrome') {
                        //tabulator.log.info("Assuming local file is some flavor of XML.")
                        //xhr.headers['content-type'] = 'text/xml' // @@ kludge 
                        //Kenny asks: why text/xml
                        // Timbl replies: I think so as to make it get parsed as XML
                        switch (xhr.uri.uri.split('.').pop()) {
                        case 'rdf':
                        case 'owl':
                            xhr.headers['content-type'] = 'application/rdf+xml';
                            break;
                        case 'n3':
                        case 'nt':
                        case 'ttl':
                            xhr.headers['content-type'] = 'text/n3';
                            break;
                        default:
                            xhr.headers['content-type'] = 'text/xml';
                        }
                    }

                    var loc = xhr.headers['content-location']

                    if (loc) {
                        var udoc = tabulator.rdf.Util.uri.join(xhr.uri.uri, loc)
                        if (!force && udoc != xhr.uri.uri && sf.requested[udoc]) {
                            // should we smush too?
                            tabulator.log.info("HTTP headers indicate we have already" + " retrieved " + xhr.uri + " as " + udoc + ". Aborting.")
                            sf.doneFetch(xhr, args)
                            xhr.abort()
                            break
                        }
                        sf.requested[udoc] = true
                    }

                    for (var x = 0; x < sf.handlers.length; x++) {
                        if (xhr.headers['content-type'].match(sf.handlers[x].pattern)) {
                            handler = new sf.handlers[x]()
                            handlers.append(sf.handlers[x].term)
                            break
                        }
                    }

                    var link = xhr.headers['link']; // Only one?
                    if (link) {
                        var rel = null;
                        var arg = link.replace(/ /g, '').split(';');
                        for (var i = 0; i < arg.length; i++) {
                            lr = arg[i].split('=');
                            if (lr[0] == 'rel') rel = lr[1];
                        }
                        if (rel) // Treat just like HTML link element
                        sf.linkData(xhr, rel, arg[0]);
                    }


                    if (handler) {
                        handler.recv(xhr)
                    } else {
                        sf.failFetch(xhr, "Unhandled content type: " + xhr.headers['content-type']);
                        break
                    }
                }
                break
            case 4:
                // Final state
                // Now handle
                if (xhr.handle) {
                    if (sf.requested[xhr.uri.uri] === 'redirected') {
                        break;
                    }
                    sf.fireCallbacks('load', args)
                    xhr.handle(function() {
                        sf.doneFetch(xhr, args)
                    })
                }
                break
            }
        }

        // Get privileges for cross-domain XHR
        if (!isExtension) {
            try {
                tabulator.rdf.Util.enablePrivilege("UniversalXPConnect UniversalBrowserRead")
            } catch (e) {
                throw ("Failed to get privileges: " + e)
            }
        }

        // Map the URI to a localhot proxy if we are running on localhost
        // This is used for working offline and on planes.
        // Do not remove without checking with TimBL :)
        var uri2 = uri;
        if (!isExtension) {
            var here = '' + document.location
            if (here.slice(0, 17) == 'http://localhost/') {
                uri2 = 'http://localhost/' + uri2.slice(7, uri2.length)
                tabulator.log.debug("URI mapped to " + uri2)
            }
        }

        // Setup the request
        xhr.open('GET', uri2, this.async)
        //webdav.manager.register(uri,function(uri,success){});
        // Set redirect callback and request headers
        if (tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'http' || tabulator.rdf.Util.uri.protocol(xhr.uri.uri) == 'https') {
            try {
                xhr.channel.notificationCallbacks = {
                    getInterface: function(iid) {
                        if (!isExtension) {
                            tabulator.rdf.Util.enablePrivilege("UniversalXPConnect")
                        }
                        if (iid.equals(Components.interfaces.nsIChannelEventSink)) {
                            return {

                                onChannelRedirect: function(oldC, newC, flags) {
                                    if (!isExtension) {
                                        tabulator.rdf.Util.enablePrivilege("UniversalXPConnect")
                                    }
                                    if (xhr.aborted) return;
                                    var kb = sf.store;
                                    var newURI = newC.URI.spec;
                                    sf.addStatus(xhr, "Redirected: " + xhr.status + " to <" + newURI + ">");
                                    //tabulator.log.info('@@ sources onChannelRedirect'+
                                    //               "Redirected: "+ 
                                    //               xhr.status + " to <" + newURI + ">"); //@@
                                    var response = kb.bnode();
                                    kb.add(xhr.req, tabulator.ns.link('response'), response);
                                    kb.add(response, tabulator.ns.http('status'), kb.literal(xhr.status), response);
                                    if (xhr.statusText) kb.add(response, tabulator.ns.http('statusText'), kb.literal(xhr.statusText), response)

                                    kb.add(response, tabulator.ns.http('location'), newURI, response);

                                    kb.add(xhr.req, tabulator.ns.http('redirectedTo'), kb.sym(newURI), xhr.req);

                                    //delete the entry caused by the Tabulator. See test.js. tabExtension not defined, why?
/*		    
		            if (isExtension && xhr.status == 303){
		            tabulator.log.warn('deleted entry:' +newURI+typeof tabExtension+typeof getTerm);
		            //tabExtension.inverseRedirectDirectory[newURI]=undefined;
		            }*/

                                    kb.HTTPRedirects[xhr.uri.uri] = newURI;
                                    if (xhr.status == 301 && rterm) { // 301 Moved
                                        var badDoc = tabulator.rdf.Util.uri.docpart(rterm.uri);
                                        var msg = 'Warning: ' + xhr.uri + ' has moved to <' + newURI + '>.';
                                        if (rterm) {
                                            msg += ' Link in ' + badDoc + 'should be changed';
                                            kb.add(badDoc, kb.sym('http://www.w3.org/2006/link#warning'), msg, sf.appNode);
                                        }
                                        tabulator.log.warn(msg);
                                    }
                                    xhr.abort()
                                    xhr.aborted = true

                                    sf.addStatus(xhr, 'done') // why
                                    sf.fireCallbacks('done', args)
                                    sf.requested[xhr.uri.uri] = 'redirected';

                                    var hash = newURI.indexOf('#');
                                    if (hash >= 0) {
                                        var msg = ('Warning: ' + xhr.uri + ' HTTP redirects to' + newURI + ' which should not contain a "#" sign');
                                        tabulator.log.warn(msg);
                                        kb.add(xhr.uri, kb.sym('http://www.w3.org/2006/link#warning'), msg)
                                        newURI = newURI.slice(0, hash);
                                    }
                                    xhr2 = sf.requestURI(newURI, xhr.uri)
                                    if (xhr2 && xhr2.req) kb.add(xhr.req, kb.sym('http://www.w3.org/2006/link#redirectedRequest'), xhr2.req, sf.appNode);
                                }
                            }
                        }
                        return Components.results.NS_NOINTERFACE
                    }
                }
            } catch (err) {
                throw ("Couldn't set callback for redirects: " + err)
            }

            try {
                var acceptstring = ""
                for (var type in this.mediatypes) {
                    var attrstring = ""
                    if (acceptstring != "") {
                        acceptstring += ", "
                    }
                    acceptstring += type
                    for (var attr in this.mediatypes[type]) {
                        acceptstring += ';' + attr + '=' + this.mediatypes[type][attr]
                    }
                }
                xhr.setRequestHeader('Accept', acceptstring)
                tabulator.log.info('Accept: ' + acceptstring)

                // See http://dig.csail.mit.edu/issues/tabulator/issue65
                //if (requester) { xhr.setRequestHeader('Referer',requester) }
            } catch (err) {
                throw ("Can't set Accept header: " + err)
            }
        }

        // Fire
        try {
            xhr.send(null)
        } catch (er) {
            this.failFetch(xhr, "sendFailed")
            return xhr
        }

        // Drop privs
        if (!isExtension) {
            try {
                tabulator.rdf.Util.disablePrivilege("UniversalXPConnect UniversalBrowserRead")
            } catch (e) {
                throw ("Can't drop privilege: " + e)
            }
        }

        setTimeout(function() {
            if (xhr.readyState != 4 && sf.isPending(xhr.uri.uri)) {
                sf.failFetch(xhr, "requestTimeout")
            }
        }, this.timeout)
        return xhr
    }

    this.objectRefresh = function(term) {
        var uris = kb.uris(term) // Get all URIs
        if (typeof uris != 'undefined') {
            for (var i = 0; i < uris.length; i++) {
                this.refresh(this.store.sym(tabulator.rdf.Util.uri.docpart(uris[i])));
                //what about rterm?
            }
        }
    }

    this.refresh = function(term) { // sources_refresh
        this.store.removeMany(undefined, undefined, undefined, term)
        this.fireCallbacks('refresh', arguments)
        this.requestURI(term.uri, undefined, true)
    }

    this.retract = function(term) { // sources_retract
        this.store.removeMany(undefined, undefined, undefined, term)
        if (term.uri) {
            delete this.requested[tabulator.rdf.Util.uri.docpart(term.uri)]
        }
        this.fireCallbacks('retract', arguments)
    }

    this.getState = function(docuri) { // docState
        if (typeof this.requested[docuri] != "undefined") {
            if (this.requested[docuri]) {
                if (this.isPending(docuri)) {
                    return "requested"
                } else {
                    return "fetched"
                }
            } else {
                return "failed"
            }
        } else {
            return "unrequested"
        }
    }

    //doing anyStatementMatching is wasting time
    this.isPending = function(docuri) { // sources_pending
        //if it's not pending: false -> flailed 'done' -> done 'redirected' -> redirected
        return this.requested[docuri] == true;
    }
}
