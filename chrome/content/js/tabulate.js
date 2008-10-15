//Display RDF information in tabular form using HTML DOM
// 
// CVS Id: tabulate.js,v 1.345 2006/01/12 14:00:56 timbl Exp $
//
// SVN ID: $Id: tabulate.js 25008 2008-10-15 22:54:10Z timbl $
//
// See Help.html, About.html, tb.html
//tabulate.js is now the main driving class behind the web version of the Tabulator.

isExtension=false;

LanguagePreference = "en"    // @@ How to set this from the browser? From cookie?

//var tabulator = {}; //This should eventually wrap all global vars. See log.js now

// Namespaces for general use
tabulator.ns = {};
tabulator.ns.link = tabulator.ns.tab = tabulator.ns.tabont = RDFNamespace("http://www.w3.org/2007/ont/link#")
tabulator.ns.http = RDFNamespace("http://www.w3.org/2007/ont/http#");
tabulator.ns.httph = RDFNamespace("http://www.w3.org/2007/ont/httph#");
tabulator.ns.ical = RDFNamespace("http://www.w3.org/2002/12/cal/icaltzd#");
tabulator.ns.foaf = RDFNamespace("http://xmlns.com/foaf/0.1/");
tabulator.ns.rdf = rdf = RDFNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
tabulator.ns.rdfs = rdfs = RDFNamespace("http://www.w3.org/2000/01/rdf-schema#");
tabulator.ns.owl = owl = RDFNamespace("http://www.w3.org/2002/07/owl#");
tabulator.ns.dc = dc = RDFNamespace("http://purl.org/dc/elements/1.1/");
tabulator.ns.rss = rss = RDFNamespace("http://purl.org/rss/1.0/");
tabulator.ns.xsd = xsd = RDFNamespace("http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-");
tabulator.ns.contact = contact = RDFNamespace("http://www.w3.org/2000/10/swap/pim/contact#");
tabulator.ns.mo = mo = RDFNamespace("http://purl.org/ontology/mo/");
tabulator.ns.doap = doap = RDFNamespace("http://usefulinc.com/ns/doap#");

var ns = tabulator.ns
var kb = new RDFIndexedFormula()  // This uses indexing and smushing
var sf = new SourceFetcher(kb) // This handles resource retrieval
var outline;

kb.sf = sf // Make knowledge base aware of source fetcher to allow sameAs to propagate a fetch

/* Don't use these use tabulator.ns.*
kb.setPrefixForURI('dc', "http://purl.org/dc/elements/1.1/")
kb.setPrefixForURI('rdf', "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
kb.setPrefixForURI('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
kb.setPrefixForURI('owl', "http://www.w3.org/2002/07/owl#")
*/

function AJAR_handleNewTerm(kb, p, requestedBy) {
    //tabulator.log.debug("entering AJAR_handleNewTerm w/ kb, p=" + p + ", requestedBy=" + requestedBy);
    if (p.termType != 'symbol') return;
    var docuri = Util.uri.docpart(p.uri);
    var fixuri;
    if (p.uri.indexOf('#') < 0) { // No hash

	// @@ major hack for dbpedia Categories, which spred indefinitely
	if (string_startswith(p.uri, 'http://dbpedia.org/resource/Category:')) return;
    var URITitlesToStop=[]; //uri strarts with any element in URIsTitleToStop is not dereferenced
    SourceOptions["javascript2rdf"][2].setupHere([URITitlesToStop],"AJAR_handleNewTerm()@tabulate.js");
    for (var i=0;i<URITitlesToStop.length;i++)
        if (string_startswith(p.uri,URITitlesToStop[i])) return;  
	if (string_startswith(p.uri, 'http://purl.org/dc/elements/1.1/')
		   || string_startswith(p.uri, 'http://purl.org/dc/terms/')) {
            fixuri = "http://dublincore.org/2005/06/13/dcq";
	    //dc fetched multiple times
        } else if (string_startswith(p.uri, 'http://xmlns.com/wot/0.1/')) {
            fixuri = "http://xmlns.com/wot/0.1/index.rdf";
        } else if (string_startswith(p.uri, 'http://web.resource.org/cc/')) {
//            tabulator.log.warn("creative commons links to html instead of rdf. doesn't seem to content-negotiate.");
            fixuri = "http://web.resource.org/cc/schema.rdf";
        }
    }
    if (fixuri) {
	docuri = fixuri
    }
    if (sf.getState(kb.sym(docuri)) != 'unrequested') return;
    
    if (fixuri) {   // only give warning once: else happens too often
        tabulator.log.warn("Assuming server still broken, faking redirect of <" + p.uri +
	    "> to <" + docuri + ">")	
    }
    sf.requestURI(docuri, requestedBy);
} //AJAR_handleNewTerm


kb.predicateCallback = AJAR_handleNewTerm
kb.typeCallback = AJAR_handleNewTerm

// For offline working, you might want to map URIs to local copies.
var SiteMap = []
SiteMap[ "http://www.w3.org/" ] = "http://localhost/www.w3.org/"  // Salt to taste

// Icons. Must be able to change for platform-consistency,
// color blindness, etc.



Icon = {}
Icon.src= []
Icon.tooltips = [];
var iconPrefix = '';

////////////////////////// Common icons with extension version

Icon.src.icon_expand = iconPrefix + 'icons/tbl-expand-trans.png';
Icon.src.icon_more = iconPrefix + 'icons/tbl-more-trans.png'; // looks just like expand, diff semantics
// Icon.src.icon_expand = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_expand.png';
Icon.src.icon_collapse = iconPrefix + 'icons/tbl-collapse.png';
Icon.src.icon_internals = iconPrefix + 'icons/tango/22-emblem-system.png'
Icon.src.icon_instances = iconPrefix + 'icons/tango/22-folder-open.png'
Icon.src.icon_foaf = iconPrefix + 'icons/foaf/foafTiny.gif';
Icon.src.icon_shrink = iconPrefix + 'icons/tbl-shrink.png';  // shrink list back up
Icon.src.icon_rows = iconPrefix + 'icons/tbl-rows.png';
// Icon.src.Icon.src.icon_columns = 'icons/tbl-columns.png';

// Status balls:

Icon.src.icon_unrequested = iconPrefix + 'icons/16dot-blue.gif';
// Icon.src.Icon.src.icon_parse = iconPrefix + 'icons/18x18-white.gif';
Icon.src.icon_fetched = iconPrefix + 'icons/16dot-green.gif';
Icon.src.icon_failed = iconPrefix + 'icons/16dot-red.gif';
Icon.src.icon_requested = iconPrefix + 'icons/16dot-yellow.gif';
// Icon.src.icon_maximize = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_con_max.png';

// Panes:

Icon.src.icon_defaultPane = iconPrefix + 'icons/table.png';
Icon.src.icon_visit = iconPrefix + 'icons/tango/22-text-x-generic.png';
Icon.src.icon_dataContents = iconPrefix + 'icons/rdf_flyer.24.gif';  //@@ Bad .. find better
Icon.src.icon_n3Pane = iconPrefix + 'icons/w3c/n3_smaller.png';  //@@ Bad .. find better
Icon.src.icon_RDFXMLPane = iconPrefix + 'icons/22-text-xml4.png';  //@@ Bad .. find better
Icon.src.icon_imageContents = iconPrefix + 'icons/tango/22-image-x-generic.png'
Icon.src.icon_airPane = iconPrefix + 'icons/1pt5a.gif';  //@@ Ask Danny for a better icon
Icon.src.icon_LawPane = iconPrefix + 'icons/law.jpg';  //@@ Ask Danny for a better icon

// For that one we need a document with grid lines.  Make data-x-generix maybe

// actions for sources;
Icon.src.icon_retract = iconPrefix + 'icons/retract.gif';
Icon.src.icon_refresh = iconPrefix + 'icons/refresh.gif';
Icon.src.icon_optoff = iconPrefix + 'icons/optional_off.PNG';
Icon.src.icon_opton = iconPrefix + 'icons/optional_on.PNG';
Icon.src.icon_map = iconPrefix + 'icons/compassrose.png';
Icon.src.icon_retracted = Icon.src.icon_unrequested 
Icon.src.icon_retracted = Icon.src.icon_unrequested;

Icon.src.icon_time = iconPrefix+'icons/Wclocksmall.png';

// Within outline mode:

Icon.src.icon_telephone = iconPrefix + 'icons/silk/telephone.png';
Icon.src.icon_time = iconPrefix + 'icons/Wclocksmall.png';
Icon.src.icon_remove_node = iconPrefix + 'icons/tbl-x-small.png'
Icon.src.icon_add_triple = iconPrefix + 'icons/tango/22-list-add.png';
Icon.src.icon_add_new_triple = iconPrefix + 'icons/tango/22-list-add-new.png';
Icon.src.icon_show_choices = iconPrefix + 'icons/userinput_show_choices_temp.png'; // looks just like collapse, diff smmantics


Icon.tooltips[Icon.src.icon_add_triple] = 'Add another'
Icon.tooltips[Icon.src.icon_add_new_triple] = 'Add data'
Icon.tooltips[Icon.src.icon_remove_node] = 'Remove'
Icon.tooltips[Icon.src.icon_expand] = 'View details.'
Icon.tooltips[Icon.src.icon_collapse] = 'Hide details.'
Icon.tooltips[Icon.src.icon_shrink] = 'Shrink list.'
Icon.tooltips[Icon.src.icon_internals] = 'Under the hood'
Icon.tooltips[Icon.src.icon_instances] = 'List'
Icon.tooltips[Icon.src.icon_foaf] = 'Friends'
Icon.tooltips[Icon.src.icon_rows] = 'Make a table of data like this'
Icon.tooltips[Icon.src.icon_unrequested] = 'Fetch this resource.'
Icon.tooltips[Icon.src.icon_fetched] = 'This was fetched successfully.'
Icon.tooltips[Icon.src.icon_failed] = 'Failed to load. Click to retry.'
Icon.tooltips[Icon.src.icon_requested] = 'Being fetched. Please wait...'
Icon.tooltips[Icon.src.icon_visit] = 'View document'
Icon.tooltips[Icon.src.icon_retract] = 'Remove this source and all its data from tabulator.'
Icon.tooltips[Icon.src.icon_refresh] = 'Refresh this source and reload its triples.'

///////////////////////////////// End comon area

Icon.OutlinerIcon= function (src, width, alt, tooltip, filter){
    this.src=src;
    this.alt=alt;
    this.width=width;
    this.tooltip=tooltip;
    this.filter=filter;
   //filter: RDFStatement,('subj'|'pred'|'obj')->boolean, inverse->boolean (whether the statement is an inverse).
   //Filter on whether to show this icon for a term; optional property.
   //If filter is not passed, this icon will never AUTOMATICALLY be shown.
   //You can show it with termWidget.addIcon
    return this;
}

Icon.termWidgets = {}
Icon.termWidgets.optOn = new Icon.OutlinerIcon(Icon.src.icon_opton,20,'opt on','Make this branch of your query mandatory.');
Icon.termWidgets.optOff = new Icon.OutlinerIcon(Icon.src.icon_optoff,20,'opt off','Make this branch of your query optional.');
Icon.termWidgets.map = new Icon.OutlinerIcon(Icon.src.icon_map,30,'mappable','You can view this field in the map view.', 
function (st, type, inverse) { return (type=='pred' && !inverse&& st.predicate.sameTerm(tabulator.ns.foaf('based_near'))) });
function calendarable(st, type, inverse){
    var obj = (inverse) ? st.subject : st.object;
    var calType = findCalType(st.predicate.toString());
    //@TODO. right now we can't tell apart "is component of" from "is component"
    if (obj!=undefined){
	obj.cal = calType;
    }
    if (!inverse){
       if (calType==null || calType=='summary'){
           return false;
       } else if (calType=='dateThing'){
           return (st.object.termType=="literal");
           // if literal, might be date info...
       } else {
           return true;
       }
    } else {
       return false;
    }
};
Icon.termWidgets.time = new Icon.OutlinerIcon(Icon.src.icon_time,20,'time',
'You can view this field in the calendar or timeline view',
					      calendarable);
Icon.termWidgets.addTri = new Icon.OutlinerIcon(Icon.src.icon_add_triple,18,"add tri","Add another"); // add object to this pred
function menuable(statement,type,inverse){return (statement.predicate.termType=='collection');}
Icon.termWidgets.showChoices=new Icon.OutlinerIcon(Icon.src.icon_show_choices,20,'show choices',"Choose another term",menuable);

// Special knowledge of properties
var lb = new Labeler(kb);
// labels  -- maybe, extend this with a propertyAction
labelPriority = []
labelPriority[tabulator.ns.foaf('name').uri] = 10
labelPriority[tabulator.ns.dc('title').uri] = 8
labelPriority[tabulator.ns.rss('title').uri] = 6   // = dc:title?
labelPriority[tabulator.ns.contact('fullName').uri] = 4
labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
labelPriority[tabulator.ns.foaf('nick').uri] = 3
labelPriority[tabulator.ns.rdfs('label').uri] = 2


/** returns true if str starts with pref, case sensitive, space sensitive **/
function string_startswith(str, pref) { // missing library routines
    return (str.slice(0, pref.length) == pref);
}

function StatusWidget() {
    this.ele = document.getElementById('TabulatorStatusWidget')
    this.pend = []
    this.errors = {}
    var sw = this

    this.recv = function (uri) {
	sw.pend.push(uri);
	sw.update()
	return true
    }

    this.quit = function (uri) {
	sw.pend = sw.pend.filter(function(x){ x != uri; });
	sw.update()
	return true
    }

    this.update = function () {
        if(sw.pend.length==0)
          sw.ele.style.display="none";
        else
          sw.ele.style.display="inline";
	sw.ele.textContent = "Sources pending: "+sw.pend.length
	return true
    }

    sf.addCallback('request',this.recv)
    sf.addCallback('fail',this.quit)
    sf.addCallback('done',this.quit)
}

// ******************  Source Widget
// Replaces what used to be in sources.js

function SourceWidget() {
    this.ele = document.getElementById('sources')    
    this.sources = {}
    var sw = this

    this.addStatusUpdateCallbacks = function (term, node) {
	var cb = function (uri, r) {
	    if (!node) { return false }
	    if (!uri) { return true }
	    var udoc = kb.sym(Util.uri.docpart(uri))
	    if (udoc.sameTerm(term)) {
		var req = kb.any(udoc, tabulator.ns.link('request')) // @@ what if > 1?
		var lstat = kb.the(req, tabulator.ns.link('status'))
		if (typeof lstat.elements[lstat.elements.length-1]
		    != "undefined") {
		    node.textContent = lstat.elements[lstat.elements.length-1]
		}
		return false
	    } else {
		return true  // call me again
	    }
	}

	sf.addCallback('recv',cb)
	sf.addCallback('load',cb)
	sf.addCallback('fail',cb)
	sf.addCallback('done',cb)	
    }

    this.addSource = function (uri, r) {
	var udoc = kb.sym(Util.uri.docpart(uri))
	if (!sw.sources[udoc.uri]) {
	    var row = document.createElement('tr')
	    sw.sources[udoc.uri] = row		// was true - tbl
	    var iconCell = document.createElement('td')
	    var src = document.createElement('td')
	    var status = document.createElement('td')
	
	    var rbtn = outline.appendAccessIcon(iconCell, udoc)
	    var xbtn = AJARImage(Icon.src.icon_remove_node, 'remove');
            if (rbtn) {
                rbtn.style.marginRight = "0.8em"
                rbtn.onclick = function () {
                    sf.refresh(udoc)
                }
            }
	    xbtn.onclick = function () {
		sf.retract(udoc)
		sw.ele.removeChild(row)
	    }
	    iconCell.appendChild(xbtn)

	    src.style.color = "blue"
	    src.style.cursor = "default"
	    src.textContent = udoc.uri
	    src.onclick = function (e) {
		GotoSubject(udoc, true)
	    }

	    sw.addStatusUpdateCallbacks(udoc,status)
	    sf.addCallback('refresh',function (u, r) {
			       if (!status) { return false }
			       if (!uri) { return true }
			       var udoc2 = kb.sym(Util.uri.docpart(uri))
			       if (udoc2.sameTerm(udoc)) {
				   sw.addStatusUpdateCallbacks(udoc,status)
			       }
			       return true
			   })

	    row.appendChild(iconCell)
	    row.appendChild(src)
	    row.appendChild(status)
	    
	    sw.ele.appendChild(row)
	}
	return true
    }

    sf.addCallback('request',this.addSource)
    sf.addCallback('retract',function (u) {
		       u.uri && delete sw.sources[u.uri]
		       return true
		   })
		   
    this.highlight = function(term, on) {
        tabulator.log.debug('Source highlight ='+on+' for '+term)
	if (!term) return;
	try{
            this.sources[term.uri].setAttribute('class', on ? 'sourceHighlight' : '')
        }
        catch(e){
            alert('tabulate.js: source highlight: uri='+term.uri+ ', error: '+e);
        }
    }
}

function GotoSubject(subject,expand) {
    outline.GotoSubject(subject,expand);
}



///////////////////////////////////////////////////
//
//
//
//        simplify event handling
//
//
//
///////////////////////////////////////////////////
/** add event to elm of type evType executing fn **/
function addEvent(elm, evType, fn, useCapture) {
    if (elm.addEventListener) {
        elm.addEventListener(evType, fn, useCapture);
        return true;
    }
    else if (elm.attachEvent) {
        var r = elm.attachEvent('on' + evType, fn);
        return r;
    }
    else {
        elm['on' + evType] = fn;
    }
} //addEvent

/** add event on page load **/
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    }
    else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
} //addLoadEvent

function test() {
    tabulator.log.msg("DEPENDENCIES: ");
    for (var d in sources.depends) tabulator.log.msg("d=" + d + ", sources.depends[d]=" + sources.depends[d]);
    tabulator.log.msg("CALLBACKS: ");
    for (var c in sources.callbacks) tabulator.log.msg("c=" + c + ", sources.callbacks[c]=" + sources.callbacks[c]);
} //test
//end;

/** nicked from http://www.safalra.com/programming/javascript/getdata.html 
 *  initializes a global GET_DATA array **/
var GET_DATA; //global
function initialiseGetData(){
    GET_DATA=new Array();
    var getDataString=new String(window.location);
    var questionMarkLocation=getDataString.search(/\?/);
    if (questionMarkLocation!=-1){
        getDataString=getDataString.substr(questionMarkLocation+1);
        var getDataArray=getDataString.split(/&/g);
        for (var i=0;i<getDataArray.length;i++){
            var nameValuePair=getDataArray[i].split(/=/);
            GET_DATA[decodeURIComponent(nameValuePair[0])]=decodeURIComponent(nameValuePair[1]);
        }
    }
}

/** if the get ?uri= is set, begin with that; if ?sparql is set, empty the 
starting points and start with the specified query; otherwise, display the suggested
 * starting points **/
function AJAR_initialisePage() {
    outline = new Outline(document);
    statusWidget = new StatusWidget()
    sourceWidget = new SourceWidget()

    //Force tabulator to load these two again because these are used in "This Session"
    //Make sw.sources and sf.requested syncronized to each other should be the better way - Kenny
    var ThisSession=kb.the(undefined, tabulator.ns.rdfs('label'), kb.literal("This Session"));
    sf.requestURI('http://www.w3.org/2000/01/rdf-schema',ThisSession,true);
    sf.requestURI('http://www.w3.org/2007/ont/link',ThisSession,true);

    initialiseGetData();
    var browser = document.getElementById('outline');
    var q;
    if (GET_DATA['query']) {
        emptyNode(browser);
    	var txt = GET_DATA['query'];
    	txt = txt.replace(/\+/g,"%20")
    	txt = window.decodeURIComponent(txt)
    	q = SPARQLToQuery(txt)
    	if (GET_DATA['sname']) q.name=GET_DATA['sname']
        qs.addQuery(q);
    }
    if (GET_DATA['uri']) {
        //clear browser
        emptyNode(browser);
		document.getElementById('UserURI').value = GET_DATA['uri'];
        outline.GotoURIAndOpen(GET_DATA['uri']);
    }
    else
    {
    	var links = { 'http://dig.csail.mit.edu/2005/ajar/ajaw/data#Tabulator':'The tabulator project',
    			  'http://dig.csail.mit.edu/data#DIG':'Decentralised Information Group' };
    	for (q in links)
    	{
    		kb.add(kb.sym(q), tabulator.ns.dc("title"),kb.literal(links[q]));
    		outline.GotoURIinit(q)
    	}
    } //go to an initial uri
    return outline;
} //initialize page

///and at the end
//addLoadEvent(function() { sources_request_new(tabulator_ns('')) });
//addLoadEvent(function () { sources_request_new(kb.sym('http://www.w3.org/People/Connolly/#me')); });
addLoadEvent(AJAR_initialisePage)
