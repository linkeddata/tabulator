/************************************************************
 * 
 * Project: AJAR/Tabulator
 * 
 * File: sources.js
 * 
 * Description: contains functions for requesting/fetching/retracting
 *  'sources' -- meaning any document we are trying to get data out of
 * 
 * SVN ID: $Id: sources.js 3464 2007-07-16 10:51:49Z kennyluck $
 *
 ************************************************************/

/**
 * Things to test: callbacks on request, refresh, retract
 *   loading from HTTP, HTTPS, FTP, FILE, others?
 */

function SourceFetcher(store, timeout, async) {
    this.store = store
    this.thisURI = "http://dig.csail.mit.edu/2005/ajar/ajaw/rdf/sources.js"
	           +"#SourceFetcher"
    this.timeout = timeout?timeout:30000
    this.async = async!=null?async:true
    this.appNode = this.store.bnode()
    this.requested = {}
    this.lookedUp = {}
    this.handlers = []
    this.mediatypes = {}
    var sf = this

    SourceFetcher.RDFXMLHandler = function (args) {
	if (args) {
	    this.dom = args[0]
	}
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		var kb = sf.store
		if (!this.dom) {
        var dparser;
        if(isExtension) {
            dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                        .getService(Components.interfaces.nsIDOMParser);
        } else {
		        dparser = new DOMParser()
        }
		    this.dom = dparser.parseFromString(xhr.responseText,
						       'application/xml')
		}
		var parser = new RDFParser(kb)
		parser.parse(this.dom, xhr.uri.uri, xhr.uri)
		
		cb()
	    }
	}
    }
    SourceFetcher.RDFXMLHandler.term = this.store.sym(this.thisURI
						      +".RDFXMLHandler")
    SourceFetcher.RDFXMLHandler.toString=function () { return "RDFXMLHandler" }
    SourceFetcher.RDFXMLHandler.register = function (sf) {
	sf.mediatypes['application/rdf+xml'] = {}
    }
    SourceFetcher.RDFXMLHandler.pattern = new RegExp("application/rdf\\+xml")

    SourceFetcher.XHTMLHandler = function (args) {
	if (args) {
	    this.dom = args[0]
	}
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		if (!this.dom) {
        var dparser;
        if(isExtension) {
            dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                        .getService(Components.interfaces.nsIDOMParser);
        } else {
		        dparser = new DOMParser()
        }
		    this.dom = dparser.parseFromString(xhr.responseText,
						       'application/xml')
		}
		var kb = sf.store
		
		// dc:title
		var title = this.dom.getElementsByTagName('title')
		if (title.length > 0) {
		    kb.add(xhr.uri,kb.sym('dc','title'),
			   kb.literal(title[0].textContent),xhr.uri)
		    tabulator.log.info("Inferring title of "+xhr.uri)
		}

		// link rel
		var links = this.dom.getElementsByTagName('link')
		for (var x=links.length-1; x>=0; x--) {
		    if ((links[x].getAttribute('rel') == 'alternate'
			 || links[x].getAttribute('rel') == 'seeAlso'
			 || links[x].getAttribute('rel') == 'meta')
			&& links[x].getAttribute('href')) {
			var join = Util.uri.join
			var uri = kb.sym(join(links[x].getAttribute('href'),
					      xhr.uri.uri))
			kb.add(xhr.uri,kb.sym('rdfs','seeAlso'),uri,
			       xhr.uri)
			tabulator.log.info("Loading "+uri+" from link rel in "+xhr.uri)
		    }
		}

		//GRDDL
		var head = this.dom.getElementsByTagName('head')[0]
		if (head) {
		    var profile = head.getAttribute('profile');
		    if (profile && Util.uri.protocol(profile)=='http') {
			tabulator.log.info("GRDDL: Using generic "
				 + "2003/11/rdf-in-xhtml-processor.");
			sf.requestURI('http://www.w3.org/2005/08/'
					  + 'online_xslt/xslt?'
					  + 'xslfile=http://www.w3.org'
					  + '/2003/11/'
					  + 'rdf-in-xhtml-processor'
					  + '&xmlfile='
					  + escape(xhr.uri.uri),
				   xhr.uri)
		    } else {
			tabulator.log.info("GRDDL: No GRDDL profile in "+xhr.uri)
		    }
		}

		cb()
	    }
	}
    }
    SourceFetcher.XHTMLHandler.term = this.store.sym(this.thisURI
						     +".XHTMLHandler")
    SourceFetcher.XHTMLHandler.toString=function () { return "XHTMLHandler" }
    SourceFetcher.XHTMLHandler.register=function (sf) {
	sf.mediatypes['application/xhtml+xml'] = {'q': 0.3}
    }
    SourceFetcher.XHTMLHandler.pattern = new RegExp("application/xhtml")
    
    SourceFetcher.XMLHandler = function () {
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		var kb = sf.store
    var dparser;
    if(isExtension) {
        dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                    .getService(Components.interfaces.nsIDOMParser);
    } else {
		    dparser = new DOMParser()
    }
		var dom = dparser.parseFromString(xhr.responseText,
							    'application/xml')

		// It could be RDF/XML
		// figure out the root element
		for (var c=0; c<dom.childNodes.length; c++) {
		    // is this node an element?
		    if (dom.childNodes[c].nodeType == 1) {
			// We've found the first element, it's the root
			if (dom.childNodes[c].namespaceURI
			    == kb.namespaces['rdf']) {
			    tabulator.log.info(xhr.uri + " seems to have a root element"
				     + " in the RDF namespace. We'll assume "
				     + "it's RDF/XML.")
			    sf.switchHandler(SourceFetcher.RDFXMLHandler,
					     xhr, cb, [dom])
			    return
			}
			// it isn't RDF/XML or we can't tell
			break
		    }
                }

		// Or it could be XHTML?
		
		// Maybe it has an XHTML DOCTYPE?
                if (dom.doctype) {
		    tabulator.log.info("We found a DOCTYPE in "+xhr.uri)
		    if (dom.doctype.name == 'html'
			&& dom.doctype.publicId.match(/^-\/\/W3C\/\/DTD XHTML/)
			&& dom.doctype.systemId.match(/http:\/\/www.w3.org\/TR\/xhtml/)) {
			tabulator.log.info(xhr.uri + " has XHTML DOCTYPE. Switching to "
				 + "XHTML Handler.")
			sf.switchHandler(SourceFetcher.XHTMLHandler, xhr, cb)
			return
		    }
		}

		// Or what about an XHTML namespace?
		var html = dom.getElementsByTagName('html')[0]
		if (html) {
		    var xmlns = html.getAttribute('xmlns')
		    if (xmlns
			&& xmlns.match(/^http:\/\/www.w3.org\/1999\/xhtml/)) {
			tabulator.log.info(xhr.uri + " has a default namespace for "
				 + "XHTML. Switching to XHTMLHandler.")
			sf.switchHandler(SourceFetcher.XHTMLHandler, xhr, cb)
			return
		    }
		}

		// We give up. What dialect is this?
		sf.failFetch(xhr, "unsupportedDialect")
	    }
	}
    }
    SourceFetcher.XMLHandler.term = this.store.sym(this.thisURI
						   +".XMLHandler")
    SourceFetcher.XMLHandler.toString=function () { return "XMLHandler" }
    SourceFetcher.XMLHandler.register = function (sf) {
	sf.mediatypes['text/xml'] = {'q': 0.2}
	sf.mediatypes['application/xml'] = {'q': 0.2}
    }
    SourceFetcher.XMLHandler.pattern = new RegExp("(text|application)/(.*)xml")

    SourceFetcher.HTMLHandler = function () {
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		var rt = xhr.responseText
		// We only handle XHTML so we have to figure out if this is XML
		tabulator.log.info("Sniffing HTML "+xhr.uri+" for XHTML.");

		if (rt.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
		    tabulator.log.info(xhr.uri + " has an XML declaration. We'll assume "
			     + "it's XHTML as the content-type was text/html.")
		    sf.switchHandler(SourceFetcher.XHTMLHandler, xhr, cb)
		    return
		}

		// DOCTYPE
		// There is probably a smarter way to do this
		if (rt.match(/.*<!DOCTYPE\s+html[^<]+-\/\/W3C\/\/DTD XHTML[^<]+http:\/\/www.w3.org\/TR\/xhtml[^<]+>/)) {
		    tabulator.log.info(xhr.uri + " has XHTML DOCTYPE. Switching to XHTML"
			     + "Handler.")
		    sf.switchHandler(SourceFetcher.XHTMLHandler, xhr, cb)
		    return
		}

		// xmlns
		if (rt.match(/[^(<html)]*<html\s+[^<]*xmlns=['"]http:\/\/www.w3.org\/1999\/xhtml["'][^<]*>/)) {
		    tabulator.log.info(xhr.uri + " has a default namespace for XHTML."
			     + " Switching to XHTMLHandler.")
		    sf.switchHandler(SourceFetcher.XHTMLHandler, xhr, cb)
		    return
		}

		sf.failFetch(xhr, "can't parse non-XML HTML")
	    }
	}
    }
    SourceFetcher.HTMLHandler.term = this.store.sym(this.thisURI
						    +".HTMLHandler")
    SourceFetcher.HTMLHandler.toString=function () { return "HTMLHandler" }
    SourceFetcher.HTMLHandler.register = function (sf) {
	sf.mediatypes['text/html'] = {'q': 0.3}
    }
    SourceFetcher.HTMLHandler.pattern = new RegExp("text/html")
    
    /***********************************************/

    SourceFetcher.TextHandler = function () {
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		// We only speak dialects of XML right now. Is this XML?
		var rt = xhr.responseText

		// Look for an XML declaration
		if (rt.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
		    tabulator.log.warn(xhr.uri + " has an XML declaration. We'll assume "
			     + "it's XML but its content-type wasn't XML.")
		    sf.switchHandler(SourceFetcher.XMLHandler, xhr, cb)
		    return
		}
		
		// Look for an XML declaration
		if (rt.slice(0,500).match(/xmlns:/)) {
		    tabulator.log.warn(xhr.uri + " may have an XML namespace. We'll assume "
			     + "it's XML but its content-type wasn't XML.")
		    sf.switchHandler(SourceFetcher.XMLHandler, xhr, cb)
		    return
		}
		
		// We give up
		sf.failFetch(xhr, "unparseable - text/plain not visibly XML")
		tabulator.log.warn(xhr.uri + " unparseable - text/plain not visibly XML, starts:\n"
			+ rt.slice(0,500))

	    }
	}
    }
    SourceFetcher.TextHandler.term = this.store.sym(this.thisURI
						    +".TextHandler")
    SourceFetcher.TextHandler.toString = function () { return "TextHandler" }
    SourceFetcher.TextHandler.register = function (sf) {
	sf.mediatypes['text/plain'] = {'q': 0.1}
    }
    SourceFetcher.TextHandler.pattern = new RegExp("text/plain")

    /***********************************************/

    SourceFetcher.N3Handler = function () {
	this.recv = function (xhr) {
	    xhr.handle = function (cb) {
		// Parse the text of this non-XML file
		var rt = xhr.responseText
	        var p = SinkParser(kb, kb, xhr.uri.uri, xhr.uri.uri, null, null, "", null)
                p.loadBuf(xhr.responseText)
/*		try {
		    p.loadBuf(xhr.responseText)

		} catch(e) {
		    var msg = ("Error trying to parse " + xhr.uri
			+ ' as Notation3:\n' + e)
		    tabulator.log.warn(msg)
		    sf.failFetch(xhr, msg)
		}
*/
		sf.addStatus(xhr,'N3 parsed: '+p.statementCount 
					    + ' in '+p.lines+' lines.')
		args = [ xhr.uri.uri ]; // Other args needed ever?
		sf.doneFetch(xhr, args)
	    }
	}
    }
    SourceFetcher.N3Handler.term = this.store.sym(this.thisURI
						    +".N3Handler")
    SourceFetcher.N3Handler.toString = function () { return "N3Handler" }
    SourceFetcher.N3Handler.register = function (sf) {
	sf.mediatypes['text/rdf+n3'] = {'q': 0.2} // low whiile parser untested
    }
    SourceFetcher.N3Handler.pattern = new RegExp("text/rdf\\+n3")


    /***********************************************/





    Util.callbackify(this,['request', 'recv', 'load', 'fail', 'refresh',
			   'retract', 'done'])

    this.store.register('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
    this.store.register('owl', "http://www.w3.org/2002/07/owl#")
    this.store.register('tab',"http://dig.csail.mit.edu/2005/ajar/ajaw/ont#")
    this.store.register('http',"http://dig.csail.mit.edu/2005/ajar/ajaw/http#")
    this.store.register('httph',
			"http://dig.csail.mit.edu/2005/ajar/ajaw/httph#")
    this.store.register('ical',"http://www.w3.org/2002/12/cal/icaltzd#")

    this.addProtocol = function (proto) {
	sf.store.add(sf.appNode,
		     sf.store.sym("tab","protocol"),
		     sf.store.literal(proto),
		     this.appNode)
    }

    this.addHandler = function (handler) {
	sf.handlers.push(handler)
	handler.register(sf)
    }

    this.switchHandler = function (handler, xhr, cb, args) {
	var kb = this.store;
	(new handler(args)).recv(xhr);
	kb.the(xhr.req,kb.sym('tab','handler')).append(handler.term)
	xhr.handle(cb)
    }

    this.addStatus = function (xhr, status) {
	var kb = this.store
	kb.the(xhr.req, kb.sym('tab',"status")).append(kb.literal(status))
    }

    this.failFetch = function (xhr, status) {
	this.addStatus(xhr,status)
	this.requested[Util.uri.docpart(xhr.uri.uri)] = false
	this.fireCallbacks('fail',[xhr.requestedURI])
	xhr.abort()
    }

    this.doneFetch = function (xhr, args) {
	this.addStatus(xhr,'done')
	tabulator.log.info("Done with parse, firing 'done' callbacks for "+xhr.uri)
	this.fireCallbacks('done',args)
    }

/* David sheets put this in. It clutters the data about tabulator 
**   and the data about the session should be avalable some ofther way .. like a link under 'sources'.
*/    
    this.store.add(this.store.sym('http://dig.csail.mit.edu/2005/ajar/ajaw/data#Tabulator'),
		   this.store.sym('tab',"session"),
		   this.appNode,
		   this.appNode)
    this.store.add(this.appNode,
		   this.store.sym('rdfs','label'),
		   this.store.literal('This Session'),
		   this.appNode);


    ['http','https','file','chrome'].map(this.addProtocol); // ftp?

    [SourceFetcher.RDFXMLHandler,
     SourceFetcher.XHTMLHandler,
     SourceFetcher.XMLHandler,
     SourceFetcher.HTMLHandler,
     SourceFetcher.TextHandler,
     SourceFetcher.N3Handler,
     ].map(this.addHandler)

    this.addCallback('done',function (uri, r) {
	     if (uri.indexOf('#') >=0) alert('addcallBack '+uri)
	     var kb = sf.store
	     var term = kb.sym(uri)
	     var udoc=term.uri?kb.sym(Util.uri.docpart(uri)):uri

	     var seeAlso = sf.store.sym('rdfs','seeAlso')
	     var refs = sf.store.statementsMatching(term,seeAlso) //this fetches seeAlso of docs indefinitely
	     refs.map(function (x) {
			  if (!sf.requested[Util.uri.docpart(x.object.uri)]) {
			      sf.requestURI(x.object.uri, term)
			  }
		      })


	     var sameAs = sf.store.sym('owl','sameAs') // @@ neaten up

	     var linkUri = sf.store.sym('http://www.w3.org/2006/link#obsoletes')
	     var refs = sf.store.each(uri,linkUri)

	     refs.map(function (y) {
			  var obj = sf.store.sym(y.value)
			  if (!sf.requested[Util.uri.docpart(obj.uri)]) {
			      alert('Requesting '+ obj)
			      sf.requestURI(obj.uri, uri)
			  }
		      })
		      

    /*				  
	     var refs = sf.store.statementsMatching(uri,sameAs)
	     refs.map(function (x) {
			  if (!sf.requested[Util.uri.docpart(x.object.uri)]) {
			      sf.requestURI(x.object.uri, uri)
			  }
		      })
		      
	     var refs = sf.store.statementsMatching(undefined, sameAs, uri)
	     refs.map(function (x) {
			  if (!sf.requested[Util.uri.docpart(x.subject.uri)]) {
			      sf.requestURI(x.subject.uri,uri)
			  }
		      })
    */				  
	     var type = sf.store.sym('rdf','type')
	     var mentions = sf.store.sym('tab','mentionsClass')
	     var refs = sf.store.statementsMatching(undefined,
						    type,
						    undefined,
						    udoc)
	     refs.map(function (x) {
			  sf.store.add(udoc,mentions,x.object,udoc)
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
	if (this.lookedUp[was.uri]) {
	    if (!this.lookedUp[now.uri])
		this.lookUpThing(now, was)
	} else {
	    if (this.lookedUp[now.uri])
		this.lookUpThing(now, was)
	}
    }


    /** Looks up a thing.
    **	    Looks up all the URIs a things has.
    ** Parameters:
    **	    term:  canonical term for the thing whose URI is to be dereferenced
    **      rterm:  the resource which refered to this (for tracking bad links)
    */
    this.lookUpThing = function (term, rterm, force) {
	tabulator.log.debug("lookUpThing: looking up "+ term);
	var uris = kb.uris(term) // Get all URIs
	if (typeof uris != 'undefined') {
	    for (var i=0; i< uris.length; i++) {
		this.lookedUp[uris[i]] = true;
		this.requestURI(Util.uri.docpart(uris[i]), rterm, force)
	    }
	}
	return uris.length
    }
    
    /** Requests a document URI and arranges to load the document.
    ** Parameters:
    **	    term:  term for the thing whose URI is to be dereferenced
    **      rterm:  the resource which refered to this (for tracking bad links)
    ** Return value:
    **	    The xhr object for the HTTP access
    */
    this.requestURI = function (uri, rterm, force) { //sources_request_new
        if (uri.indexOf('#') >= 0) { // hash
	    return alert("requestURI should notbe called with fragid: "+uri)
	}

	var force = !!force
	var kb = this.store
	var args = arguments
//	var term = kb.sym(uri)
	var docuri = Util.uri.docpart(uri)
	var docterm = kb.sym(docuri)
	tabulator.log.debug("requestURI: dereferencing "+ uri)
	//this.fireCallbacks('request',args)
	
	if (!force && typeof this.requested[docuri]!="undefined") {
	    tabulator.log.debug("We already have "+docuri+". Skipping.")
	    var newArgs=[];
	    for (var i=0;i<args.length;i++) newArgs.push(args[i]);
	    newArgs.push(true); //extra information indicates this is a skipping done!
	    //this.fireCallbacks('done',newArgs) //comment out here
	    return null
	}
    this.fireCallbacks('request',args); //Kenny: fire 'request' callbacks here

	this.requested[docuri] = true

	if (rterm) {
	    if (rterm.uri) {
		kb.add(docterm, kb.sym('tab',"requestedBy"),
		       kb.sym(Util.uri.docpart(rterm.uri)), this.appNode)
/*	    } else {   // this shouldn't happen, as the rterm should be a doc not a bnode
		kb.add(docterm, kb.sym('tab',"requestedBy"),
		       rterm, this.appNode)
*/
	    }
	}

	if (rterm) { tabulator.log.info('SF.request: ' + docuri +' refd by '+rterm.uri) }
	else { tabulator.log.info('SF.request: '+ docuri+' no referring doc') };

	var status = kb.collection()
	var xhr = Util.XMLHTTPFactory()
	var req = xhr.req = kb.bnode()
	xhr.uri = docterm
	xhr.requestedURI = args[0]
	var handlers = kb.collection()
	var sf = this

	kb.add(this.appNode, kb.sym('tab',"source"), docterm, this.appNode)
	kb.add(docterm, kb.sym('tab',"request"), req, this.appNode)
	kb.add(req, kb.sym('rdfs',"label"), kb.literal('Request for '+docuri),
	       this.appNode)

	// This request will have handlers probably
	kb.add(req, kb.sym('tab','handler'), handlers, sf.appNode)

	kb.add(req, kb.sym('tab','status'), status, sf.appNode)

	if (typeof kb.anyStatementMatching(this.appNode,
					   kb.sym('tab',"protocol"),
					   Util.uri.protocol(uri))
	    == "undefined") {
	    // update the status before we break out
	    this.failFetch(xhr,"Unsupported protocol")
	    return xhr
	}

	// Set up callbacks
	xhr.onreadystatechange = function () {
	    switch (xhr.readyState) {
	    case 3:
		if (!xhr.recv) {
		    xhr.recv = true
		    var handler = null
		    
		    sf.fireCallbacks('recv',args)
		    
		    kb.add(req,kb.sym('http','status'),kb.literal(xhr.status),
			   sf.appNode)
		    kb.add(req,kb.sym('http','statusText'),
			   kb.literal(xhr.statusText), sf.appNode)
		    
		    if (xhr.status >= 400) {
			sf.failFetch(xhr,"HTTP error "+xhr.status+ ' '+
			    xhr.statusText )
			break
		    }
		    
		    xhr.headers = {}
		    if (Util.uri.protocol(xhr.uri.uri) == 'http'
		        || Util.uri.protocol(xhr.uri.uri) == 'https') {
			xhr.headers = Util.getHTTPHeaders(xhr)
			for (var h in xhr.headers) {
			    kb.add(req, kb.sym('httph',h), xhr.headers[h],
				   sf.appNode)
			}
		    }

                    // deduce some things from the HTTP
                    var addType = function(cla) {
                        kb.add(docterm, kb.sym('rdf','type'), cla,
			   sf.appNode)
                    }
                    if (xhr.status-0 == 200) {
                        addType(kb.sym('tab','Document'));
                        var ct = xhr.headers['content-type'];
                        if (ct.indexOf('image/') == 0)
                            addType(kb.sym('http://purl.org/dc/terms/Image'));
                        if (ct.indexOf('text/') == 0)
                            addType(kb.sym('tab','TextDocument'));

                    }

		    if (Util.uri.protocol(xhr.uri.uri) == 'file' || Util.uri.protocol(xhr.uri.uri) == 'chrome') {
			//tabulator.log.info("Assuming local file is some flavor of XML.")
			//xhr.headers['content-type'] = 'text/xml' // @@ kludge 
			//Kenny asks: why text/xml
			
			switch (xhr.uri.uri.split('.').pop()){
			    case 'rdf':
			        xhr.headers['content-type'] = 'application/rdf+xml';
			        break;
			    case 'n3':
			        xhr.headers['content-type'] = 'text/rdf+n3';
			        break;
			    default:
                    xhr.headers['content-type'] = 'text/xml';			        
			}
		    }
		    
		    var loc = xhr.headers['content-location']

		    if (loc) {
			var udoc = Util.uri.join(xhr.uri.uri,loc)
			if (!force && udoc != xhr.uri.uri 
			    && sf.requested[udoc]) {
			    // should we smush too?
			    tabulator.log.info("HTTP headers indicate we have already"
				     + " retrieved " + xhr.uri + " as "
				     + udoc + ". Aborting.")
			    sf.doneFetch(xhr,args)
			    xhr.abort()
			    break
			}
			sf.requested[udoc] = true
		    }

		    for (var x = 0; x<sf.handlers.length; x++) {
			if (xhr.headers['content-type'].match(sf.handlers[x].pattern)){
			    handler = new sf.handlers[x]()
			    handlers.append(sf.handlers[x].term)
			    break
			}
		    }
		    
		    if (handler) {
			handler.recv(xhr)
		    } else {
			sf.failFetch(xhr,"Unhandled content type: " +
			    xhr.headers['content-type']);
			break
		    }
		}
		break
	    case 4:
		// Now handle
		if (xhr.handle) {
		    xhr.handle(function () {
				   sf.doneFetch(xhr,args)
			       })
		    sf.fireCallbacks('load',args)
		}
		break
	    }
	}

	// Get privileges for cross-domain XHR
        if(!isExtension) {
            try {
                Util.enablePrivilege("UniversalXPConnect UniversalBrowserRead")
            } catch(e) {
                alert("Failed to get privileges: " + e)
            }
        }
	
	// Map the URI to a localhot proxy if we are running on localhost
	// This is used for working offline and on planes.
	// Do not remove without checking with TimBL :)
	var uri2 = uri;
	if(!isExtension) {
	    var here = '' + document.location
	    if (here.slice(0,17) == 'http://localhost/') {
	        uri2 = 'http://localhost/' + uri2.slice(7, uri2.length)
	        tabulator.log.debug("URI mapped to "+ uri2)
	    }
	}

	// Setup the request
	xhr.open('GET', uri2, this.async)

	// Set redirect callback and request headers
	if (Util.uri.protocol(xhr.uri.uri) == 'http'
	    || Util.uri.protocol(xhr.uri.uri) == 'https') {
	    try {
		xhr.channel.notificationCallbacks = {
		    getInterface: 
		    function (iid) {
            if(!isExtension){
			    Util.enablePrivilege("UniversalXPConnect")
            }
			if (iid.equals(Components.interfaces.nsIChannelEventSink)) {
			    return {
				onChannelRedirect: function (oldC,newC,flags) {
            if(!isExtension) {
				    Util.enablePrivilege("UniversalXPConnect")
            }
				    if (xhr.aborted) return
				    var kb = sf.store;
                                    var newURI = newC.URI.spec;
				    sf.addStatus(xhr,"Redirected: "+ 
					xhr.status + " to <" + newURI + ">");

				    kb.add(xhr.req, kb.sym('http','status'), kb.literal(xhr.status),
					   sf.appNode);
				    if (xhr.statusText) kb.add(xhr.req,kb.sym('http','statusText'),
					   kb.literal(xhr.statusText), sf.appNode)

				    kb.add(xhr.req,
					kb.sym('http','location'),
					newURI, sf.appNode);



				    kb.HTTPRedirects[xhr.uri.uri] = newURI;
				    if (xhr.status == 302) {
					var msg ='Warning: '+xhr.uri +
					    ' has moved to <'+newURI + '>.';
                                        if (rterm) {
                                            msg += ' Link in '+
                                                rterm + 'should be changed';
                                            kb.add(rterm,
                                                kb.sym('http://www.w3.org/2006/link#warning'),
                                                 msg, sf.appNode);	
                                        }
					tabulator.log.warn(msg);
				    }
				    xhr.abort()
				    xhr.aborted = true

				    sf.addStatus(xhr,'done') // why
				    sf.fireCallbacks('done',args)
                                    
                                    var hash = newURI.indexOf('#');
                                    if (hash >= 0) {
                                        var msg = ('Warning: '+xhr.uri+' HTTP redirects to'
                                            + newURI + ' which should not contain a "#" sign');
                                        tabulator.log.warn(msg);
                                        kb.add(xhr.uri, kb.sym('http://www.w3.org/2006/link#warning'), msg)
                                        newURI = newURI.slice(0,hash);
                                    }
				    xhr2 = sf.requestURI(newURI, xhr.uri)
				    if (xhr2 && xhr2.req) kb.add(xhr.req, 
					kb.sym('http://www.w3.org/2006/link#redirectedRequest'),
					xhr2.req, sf.appNode);
				}
			    }
			}
			return Components.results.NS_NOINTERFACE
		    }
		}
	    } catch (err) {
		alert("Couldn't set callback for redirects: "+err)
	    }

	    try {
		var acceptstring = ""
		for (var type in this.mediatypes) {
		    var attrstring = ""
		    if (acceptstring != "") { acceptstring += ", " }
		    acceptstring += type
		    for (var attr in this.mediatypes[type]) {
			acceptstring += ';' + attr + '='
			    + this.mediatypes[type][attr]
		    }
		}
		xhr.setRequestHeader('Accept',acceptstring)
		tabulator.log.info('Accept: '+ acceptstring)
		
		// See http://dig.csail.mit.edu/issues/tabulator/issue65
		//if (requester) { xhr.setRequestHeader('Referer',requester) }
	    } catch (err) {
		alert("Can't set Accept header: "+err)
	    }
	}

	// Fire
	try {
	    xhr.send(null)
	} catch (er) {
	    this.failFetch(xhr,"sendFailed")
	    return xhr
	}

	// Drop privs
        if(!isExtension) {
	    try {
	        Util.disablePrivilege("UniversalXPConnect UniversalBrowserRead")
	    } catch (e) {
	        alert("Can't drop privilege: " + e)
	    }
        }

	setTimeout(function() { 
		       if (xhr.readyState != 4 && sf.isPending(xhr.uri)) {
			   sf.failFetch(xhr,"requestTimeout")
		       }
		   }, this.timeout)
	return xhr
    }

    this.objectRefresh = function(term) {
	    var uris = kb.uris(term) // Get all URIs
	    if (typeof uris != 'undefined') {
	        for (var i=0; i< uris.length; i++) {
	            this.refresh(this.store.sym(Util.uri.docpart(uris[i])));
                //what about rterm?
	        }
	    }        
    }
    
    this.refresh = function (term) { // sources_refresh
	this.store.removeMany(undefined,undefined,undefined,term)
	this.fireCallbacks('refresh',arguments)
	this.requestURI(term.uri, undefined, true)
    }

    this.retract = function (term) { // sources_retract
	this.store.removeMany(undefined, undefined, undefined, term)
	if (term.uri) {
	    delete this.requested[Util.uri.docpart(term.uri)]
	}
	this.fireCallbacks('retract',arguments)
    }

    this.getState = function (term) { // docState
	var doc = Util.uri.docpart(term.uri)
	if (typeof this.requested[doc] != "undefined") {
	    if (this.requested[doc]) {
		if (this.isPending(term)) {
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

    this.isPending = function (uri) { // sources_pending
	var req = this.store.anyStatementMatching(
	    this.store.sym(Util.uri.docpart(uri.uri)),
	    this.store.sym('tab','request'))
	if (!req) { return false }
	var status = this.store.anyStatementMatching(req.object,
						     this.store.sym('tab',
								    'status'))
	if (!status) { return true }
	return (this.requested[Util.uri.docpart(uri.uri)]
		&& !status.object.elements.filter(function (x) {
						      return (x.toString()
							      == 'done')
						  }).length)
    }
}


function isExternal (uri)
{
	for (x in kb.spEndpointIndex)
		if (uri.match(new RegExp('^'+x))) return kb.spEndpointIndex[x]; //redirect to external
}

function sources_check_callbacks()
{
    for (var t in sources.callbacks) { //for each trigger
        tabulator.log.debug("trigger=" + t + ", depends on=" + sources.depends[t]);
        if (sources.depends[t] && filter(sources_pending, sources.depends[t]).length != 0)
            continue; //still dependencies
        tabulator.log.success("all dependencies loaded for " + t + ", completed files=" + sources.depends[t]);
        if (!sources.callbacks[t])
            tabulator.log.info("no callback for trigger " + t);
        else {
            for (var c in sources.callbacks[t]) {
                tabulator.log.debug("executing callback #" + c + " for: " + t); // + ", " + sources.callbacks[t][c]);
                sources.callbacks[t][c](); //call back
            } //for
            delete sources.callbacks[t]; //unset this trigger
        } //has callbacks
    } //for each trigger
}

/** hack around firefox permission shtuff **/   
function sources_xml(request) {
    var dparser;
    if(isExtension) {
        dparser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                    .getService(Components.interfaces.nsIDOMParser);
    } else {
        dparser = new DOMParser()
    }
    return dparser.parseFromString(request.responseText, 'text/xml');
} //sources_xml

/** completely(!) retrach a source from the kb **/
function sources_retract(uri)
{ 
    var src = kb.sym(uri_docpart(uri));
    sources_remove_html(sources.status[uri].number);
    kb.removeMany(undefined, undefined, undefined, src); //no limit
    sources.status[uri] = undefined;
    refreshButtons(uri, icon_unrequested); //as if it had never been
} //retract

/** fetch an RDFSymbol (OVERWRITE old requestFetch) use request_new **/
function requestFetch(subject) {
    sources_request_new(subject);
} //requestFetch

