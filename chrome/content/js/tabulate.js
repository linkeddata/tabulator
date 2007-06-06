//Display RDF information in tabular form using HTML DOM
// 
// CVS Id: tabulate.js,v 1.345 2006/01/12 14:00:56 timbl Exp $
//
// SVN ID: $Id: tabulate.js 3115 2007-06-06 21:08:27Z presbrey $
//
// See Help.html, About.html, tb.html   

//CONFIG

LanguagePreference = "en"    // @@ How to set this from the browser? From cookie?

var kb = new RDFIndexedFormula()  // This uses indexing and smushing
var sf = new SourceFetcher(kb) // This handles resource retrieval

kb.sf = sf // Make knowledge base aware of source fetcher to allow sameAs to propagate a fetch

kb.register('dc', "http://purl.org/dc/elements/1.1/")
kb.register('rdf', "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
kb.register('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
kb.register('owl', "http://www.w3.org/2002/07/owl#")
kb.predicateCallback = AJAR_handleNewTerm
kb.typeCallback = AJAR_handleNewTerm

selection = []  // Array of statements which have been selected

// For offline working, you might want to map URIs to local copies.
var SiteMap = []
SiteMap[ "http://www.w3.org/" ] = "http://localhost/www.w3.org/"  // Salt to taste

// Icons. Must be able to change for platform-consistency,
// color blindness, etc.



Icon = {}
Icon.src= []

Icon.src.icon_expand = 'icons/tbl-expand-trans.png';
Icon.src.icon_more = 'icons/tbl-more-trans.png'; // looks just like expand, diff semantics
// Icon.src.icon_expand = 'icons/clean/Icon.src.Icon.src.icon_expand.png';
Icon.src.icon_collapse = 'icons/tbl-collapse.png';
Icon.src.icon_shrink = 'icons/tbl-shrink.png';  // shrink list back up
Icon.src.icon_rows = 'icons/tbl-rows.png';
// Icon.src.Icon.src.icon_columns = 'icons/tbl-columns.png';
Icon.src.icon_unrequested = 'icons/16dot-blue.gif';
// Icon.src.Icon.src.icon_parse = 'icons/18x18-white.gif';
Icon.src.icon_fetched = 'icons/16dot-green.gif';
Icon.src.icon_failed = 'icons/16dot-red.gif';
Icon.src.icon_requested = 'icons/16dot-yellow.gif';
// Icon.src.icon_maximize = 'icons/clean/Icon.src.Icon.src.icon_con_max.png';
Icon.src.icon_visit = 'icons/document.png';
// actions for sources;
Icon.src.icon_retract = 'icons/retract.gif';
Icon.src.icon_refresh = 'icons/refresh.gif';
Icon.src.icon_optoff = 'icons/optional_off.PNG';
Icon.src.icon_opton = 'icons/optional_on.PNG';
Icon.src.icon_map = 'icons/compassrose.png';
Icon.src.icon_retracted = Icon.src.icon_unrequested 
Icon.src.icon_retracted = Icon.src.icon_unrequested;
Icon.src.icon_time = 'icons/Wclocksmall.png';
Icon.src.icon_remove_node = 'icons/tbl-x-small.png'
Icon.tooltips = [];
Icon.OutlinerIcon= function (src, width, alt, tooltip, filter)
{
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
function (st, type, inverse) { return (type=='pred' && !inverse&& st.predicate.sameTerm(foaf('based_near'))) });
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

Icon.tooltips[Icon.src.icon_remove_node]='Remove this.'
Icon.tooltips[Icon.src.icon_expand]='View details.'
Icon.tooltips[Icon.src.icon_collapse] = 'Hide details.'
Icon.tooltips[Icon.src.icon_collapse] = 'Hide list.'
Icon.tooltips[Icon.src.icon_rows] = 'Make a table of data like this'
Icon.tooltips[Icon.src.icon_unrequested] = 'Fetch this resource.'
Icon.tooltips[Icon.src.icon_fetched] = 'This was fetched successfully.'
Icon.tooltips[Icon.src.icon_failed] = 'Failed to load. Click to retry.'
Icon.tooltips[Icon.src.icon_requested] = 'Being fetched. Please wait...'
Icon.tooltips[Icon.src.icon_visit] = 'View the HTML content of this page within tabulator.'
Icon.tooltips[Icon.src.icon_retract] = 'Remove this source and all its data from tabulator.'
Icon.tooltips[Icon.src.icon_refresh] = 'Refresh this source and reload its triples.'

// Special knowledge of properties
tabont = Namespace("http://dig.csail.mit.edu/2005/ajar/ajaw#")
foaf = Namespace("http://xmlns.com/foaf/0.1/")
rdf = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")
OWL = Namespace("http://www.w3.org/2002/07/owl#")
dc = Namespace("http://purl.org/dc/elements/1.1/")
rss = Namespace("http://purl.org/rss/1.0/")
xsd = Namespace("http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-")
contact = Namespace("http://www.w3.org/2000/10/swap/pim/contact#")
mo = Namespace("http://purl.org/ontology/mo/")

// labels  -- maybe, extend this with a propertyAction
labelPriority = []
labelPriority[foaf('name').uri] = 10
labelPriority[dc('title').uri] = 8
labelPriority[rss('title').uri] = 6   // = dc:title?
labelPriority[contact('fullName').uri] = 4
labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
labelPriority[foaf('nick').uri] = 3
labelPriority[RDFS('label').uri] = 2

// Predicates used for inner workings. Under the hood
internals = []
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#request'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#requestedBy'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#source'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#session'] = 1;
internals['http://www.w3.org/2006/link#uri'] = 1;
internals['http://www.w3.org/2006/link#Document'] = 1;
internals['http://www.w3.org/2000/01/rdf-schema#seeAlso'] = 1;

/** returns true if str starts with pref, case sensitive, space sensitive **/
function string_startswith(str, pref) { // missing library routines
    return (str.slice(0, pref.length) == pref);
}

/** callback handler for new terms **/
function AJAR_handleNewTerm(kb, p, requestedBy) {
    //tdebug("entering AJAR_handleNewTerm w/ kb, p=" + p + ", requestedBy=" + requestedBy);
    if (p.termType != 'symbol') return;
    var docuri = Util.uri.docpart(p.uri);
    var fixuri;
    if (p.uri.indexOf('#') < 0) { // No hash

	// @@ major hack for dbpedia Categories, which spred indefinitely
	if (string_startswith(p.uri, 'http://dbpedia.org/resource/Category:')) return;  

/*
        if (string_startswith(p.uri, 'http://xmlns.com/foaf/0.1/')) {
            fixuri = "http://dig.csail.mit.edu/2005/ajar/ajaw/test/foaf"
	    // should give HTTP 303 to ontology -- now is :-)
        } else
*/
	if (string_startswith(p.uri, 'http://purl.org/dc/elements/1.1/')
		   || string_startswith(p.uri, 'http://purl.org/dc/terms/')) {
            fixuri = "http://dublincore.org/2005/06/13/dcq";
	    //dc fetched multiple times
        } else if (string_startswith(p.uri, 'http://xmlns.com/wot/0.1/')) {
            fixuri = "http://xmlns.com/wot/0.1/index.rdf";
        } else if (string_startswith(p.uri, 'http://web.resource.org/cc/')) {
//            twarn("creative commons links to html instead of rdf. doesn't seem to content-negotiate.");
            fixuri = "http://web.resource.org/cc/schema.rdf";
        }
    }
    if (fixuri) {
	docuri = fixuri
    }
    if (sf.getState(kb.sym(docuri)) != 'unrequested') return;
    
    if (fixuri) {   // only give warning once: else happens too often
        twarn("Assuming server still broken, faking redirect of <" + p.uri +
	    "> to <" + docuri + ">")	
    }
    sf.requestURI(docuri, requestedBy);
} //AJAR_handleNewTerm

///////////////// Utility

function emptyNode(node) {
    var nodes = node.childNodes, len = nodes.length, i
    for (i=len-1; i>=0; i--) node.removeChild(nodes[i])
    return node
}

function ArrayContains(a, x) {
    var i, n = a.length
    for (i=0; i<n; i++)
    if (a[i] == x) return true;
    return false
}

/** returns true if argument is an array **/
function isArray(arr) {
    if (typeof arr == 'object') {  
        var criterion = arr.constructor.toString().match(/array/i); 
        return (criterion != null); 
    }
    return false;
} //isArray

/** turns an HTMLCollection into an Array. Why? um, mostly so map & filter will work, though
  * i suspect they work on collections too **/
function HTMLCollection_to_Array(coll) {
    var arr = new Array();
    var len = coll.length;
    for (var e = 0; e < len; e++) arr[e] = coll[e];
    return arr;
} //HTMLCollection_to_Array

/** evaluate expression asynchronously. scoping? **/
function acall(expr) {
    setTimeout(expr, 0); //start off expr
} //acall

/** benchmark a function **/
benchmark.lastkbsize = 0;
function benchmark(f) {
    var args = [];
    for (var i = arguments.length-1; i > 0; i--) args[i-1] = arguments[i];
    //tdebug("BENCHMARK: args=" + args.join());
    var begin = new Date().getTime();
    var return_value = f.apply(f, args);
    var end = new Date().getTime();
    tinfo("BENCHMARK: kb delta: " + (kb.statements.length - benchmark.lastkbsize) 
            + ", time elapsed for " + f + " was " + (end-begin) + "ms");
    benchmark.lastkbsize = kb.statements.length;
    return return_value;
} //benchmark

///////////////////////// Representing data

function findLabelSubProperties() {
    var i,n
    tdebug("rdfs:label subproperties:");
    var labelPredicates = kb.each(undefined, RDFS('subPropertyOf'), RDFS('label'));
    for (i=0, n=labelPredicates.length; i<n; i++) {
	if (labelPriority[labelPredicates[i].uri] == null) {
	    labelPriority[labelPredicates[i].uri] = 1
	}
	tdebug("rdfs:label subproperty "+ labelPredicates[i]);
	
    }
}


//  String to represent a thing in displays
function label(x, trimSlash) {
    var i,n
    var plist = kb.statementsMatching(x);
    var y, best = 0, lab = ""
    findLabelSubProperties();	// Too slow? Could cache somewhere
    for (i=0, n=plist.length; i<n; i++) {
	var st = plist[i]
	y = labelPriority[st.predicate.uri]
	if (st.object.value && st.object.lang) {
	    if (st.object.lang.indexOf(LanguagePreference) >= 0) { y += 1 } // Best
	    else { y -= 1}  // Prefer no lang to wrong lang (?)
	}
	if (y && (y > best) && (st.object.termType=='literal')) {
	    lab = st.object.value
	    best = y
	}
    }
    if (lab) {return lab};

    if (x.termType == 'bnode') {
	return "...";
    }
    if (x.termType=='collection'){
	return '(' + x.elements.length + ')';
    }
    var hash = x.uri.indexOf("#")
    if (hash >=0) { return x.uri.slice(hash+1) }

    if (trimSlash) { // only trim URIs, not rdfs:labels
	var slash = x.uri.lastIndexOf("/");
	if ((slash >=0) && (slash < x.uri.length)) return x.uri.slice(slash+1);
    }
    return decodeURIComponent(x.uri)
}

//  As above but escaped for XML and chopped of contains a slash
function labelForXML(x) {
    return escapeForXML(label(x, true));
}

// As above but for predicate, possibly inverse
function predicateLabelForXML(p, inverse) {
    var lab;
    if (inverse) { // If we know an inverse predicate, use its label
	var ip = kb.any(p, OWL('inverseOf'));
	if (!ip) ip = kb.any(undefined, OWL('inverseOf'), p);
	if (ip) return labelForXML(ip)
    }
    
    lab = labelForXML(p)
    if (inverse) {
	if (lab =='type') return 'e.g.'; // Not "is type of"
	return "is "+lab+" of";
    }
    return lab
} 


//  Represent an object in summary form as a table cell


function AJARImage(src, alt, tt) {
    if (!tt && Icon.tooltips[src]) tt = Icon.tooltips[src]
//    var sp = document.createElement('span')
    var image = document.createElement('img')
    image.setAttribute('src', src)
    if (typeof alt != 'undefined') image.setAttribute('alt', alt)
    if (typeof tt != 'undefined') image.setAttribute('title',tt)
    return image
}

function appendRemoveIcon(node, subject, removeNode) {
    var image = AJARImage(Icon.src.icon_remove_node, 'remove')
    image.node = removeNode
    image.setAttribute('about', subject.toNT())
    image.style.marginLeft="5px"
    image.style.marginRight="10px"
    node.appendChild(image)
    return image
}

function appendAccessIcon(node, term) {
    if (typeof term.termType == 'undefined') log.error("??"+ term);
    if (term.termType != 'symbol') return '';
    var state = sf.getState(term);
    var icon, alt, info;
//    fyi("State of " + doc + ": " + state)
    switch (state) {
        case 'unrequested': 
            icon = Icon.src.icon_unrequested;
            alt = 'fetch';
        break;
        case 'requested':
	    icon = Icon.src.icon_requested;
            alt = 'fetching';
        break;
        case 'fetched':
            icon = Icon.src.icon_fetched;
            alt = 'loaded';
        break;
        case 'failed':
            icon = Icon.src.icon_failed;
            alt = 'failed';
        break;
        case 'unpermitted':
            icon = Icon.src.icon_failed;
            alt = 'no perm';
        break;
        case 'unfetchable':
            icon = Icon.src.icon_failed;
            alt = 'cannot fetch';
        break;
        default:
            log.error("?? state = " + state);
        break;
    } //switch
    var img = AJARImage(icon, alt, 
			Icon.tooltips[icon].replace(/[Tt]his resource/,
						    term.uri))
    addButtonCallbacks(img,term)
    node.appendChild(img)
    return img
} //appendAccessIcon

/** make the td for an object (grammatical object) 
 *  @param obj - an RDF term
 *  @param view - a VIEW function (rather than a bool asImage)
 **/
function outline_objectTD(obj, view, deleteNode) {
    //set about
    var td = document.createElement('td');
    
    if ((obj.termType == 'symbol') || (obj.termType == 'bnode'))
	td.setAttribute('about', obj.toNT());
    td.setAttribute('class', 'obj');      //this is how you find an object
    if ((obj.termType == 'symbol') || (obj.termType == 'bnode')) {
	td.appendChild(AJARImage(Icon.src.icon_expand, 'expand'));
    } //expandable
    if (!view) // view should be a function pointer
        view = VIEWAS_boring_default;
    td.appendChild( view(obj) );
    if (deleteNode) {
	appendRemoveIcon(td, obj, deleteNode)
    }
    //td.appendChild( iconBox.construct(document.createTextNode('bla')) );
    return td;
} //outline_objectTD

///////////////// Represent an arbirary subject by its properties
//These are public variables
expandedHeaderTR.tr = document.createElement('tr');
expandedHeaderTR.td = document.createElement('td');
expandedHeaderTR.td.setAttribute('colspan', '2');
expandedHeaderTR.td.appendChild(AJARImage(Icon.src.icon_collapse, 'collapse'));
expandedHeaderTR.td.appendChild(document.createElement('strong'));
expandedHeaderTR.tr.appendChild(expandedHeaderTR.td);

function expandedHeaderTR(subject) {
    var tr = expandedHeaderTR.tr.cloneNode(true); //This sets the private tr as a clone of the public tr
    tr.firstChild.setAttribute('about', subject.toNT());
    tr.firstChild.childNodes[1].appendChild(document.createTextNode(label(subject)));
    return tr;
} //expandedHeaderTR

function propertyTable(subject, table, details) {
    fyi("Property table for: "+ subject)
    subject = kb.canon(subject)
    
    if (!table) { // Create a new property table
	var table = document.createElement('table')
	var tr1 = expandedHeaderTR(subject)
	table.appendChild(tr1)
	
/*   This should be a beautifil system not a quick kludge - timbl 
**   Put  link to inferenceWeb fbrowsers for anything which is a proof
*/	
	var classes = kb.each(subject, rdf('type'))
	var i=0, n=classes.length;
	for (i=0; i<n; i++) {
	    if (classes[i].uri == 'http://inferenceweb.stanford.edu/2004/07/iw.owl#NodeSet') {
		var anchor = document.createElement('a');
		anchor.setAttribute('href', "http://silo.stanford.edu/iwbrowser/NodeSetBrowser?url=" + encodeURIComponent(subject.uri)); // @@ encode
		anchor.setAttribute('title', "Browse in Infereence Web");
		anchor.appendChild(AJARImage(
		    'http://iw.stanford.edu/2.0/images/iw-logo-icon.png', 'IW', 'Inference Web'));
		tr1.appendChild(anchor)
	    }
	}
	
	var plist = kb.statementsMatching(subject)
	appendPropertyTRs(table, plist, false, details)
	
	plist = kb.statementsMatching(undefined, undefined, subject)
	appendPropertyTRs(table, plist, true, details)
	
	return table
    } else {  // New display of existing table
	table.replaceChild(expandedHeaderTR(subject),table.firstChild)
	var row, s
	var expandedNodes = {}

	for (row = table.firstChild; row; row = row.nextSibling) {
	    if (row.childNodes[1]
		&& row.childNodes[1].firstChild.nodeName == 'table') {
		s = row.AJAR_statement
		if (!expandedNodes[s.predicate.toString()]) {
		    expandedNodes[s.predicate.toString()] = {}
		}
		expandedNodes[s.predicate.toString()][s.object.toString()] =
		    row.childNodes[1].childNodes[1]
	    }
	}

	table = propertyTable(subject, undefined, details)

	for (row = table.firstChild; row; row = row.nextSibling) {
	    s = row.AJAR_statement
	    if (s) {
		if (expandedNodes[s.predicate.toString()]) {
		    var node =
			expandedNodes[s.predicate.toString()][s.object.toString()]
		    if (node) {
			row.childNodes[1].replaceChild(node,
						       row.childNodes[1].firstChild)
		    }
		}
	    }
	}

	// do some other stuff here
	return table
    }
} /* propertyTable */


///////////// Property list

function appendPropertyTRs(parent, plist, inverse, details) {
    fyi("Property list length = " + plist.length)
    if (plist.length == 0) return "";
    var sel
    if (inverse) {
	sel = function(x) {return x.subject}
	plist = plist.sort(RDFComparePredicateSubject)
    } else {
	sel = function(x){return x.object}
	plist = plist.sort(RDFComparePredicateObject)
    }
    var j
    var max = plist.length
    for (j=0; j<max; j++) { //squishing together equivalent properties I think
	var s = plist[j]
    //      if (s.object == parentSubject) continue; // that we knew
        var internal = (typeof internals[''+s.predicate.uri] != 'undefined')
	if (!details && internal) {
	    continue;
   	}
	var k;
	var dups = 0; // How many rows have the same predicate, -1?
	var langTagged = 0;  // how many objects have language tags?
	var myLang = 0; // Is there one I like?
	for (k=0; (k+j < max) && (plist[j+k].predicate.sameTerm(s.predicate)); k++) {
	    if (k>0 && (sel(plist[j+k]).sameTerm(sel(plist[j+k-1])))) dups++;
	    if (sel(plist[j+k]).lang) {
		langTagged +=1;
		if (sel(plist[j+k]).lang.indexOf(LanguagePreference) >=0) myLang ++; 
	    }
	}

	var lab = predicateLabelForXML(s.predicate, inverse);
	lab = lab.slice(0,1).toUpperCase() + lab.slice(1) // init capital
	
	var tr = document.createElement("TR")
	parent.appendChild(tr)
	tr.AJAR_statement = s
	tr.AJAR_inverse = inverse
	tr.AJAR_variable
	tr.setAttribute('predTR','true')
	var td_p = document.createElement("TD")
	td_p.setAttribute('about', s.predicate.toNT())
	td_p.setAttribute('class', internal ? 'pred internal' : 'pred')
	tr.appendChild(td_p)
	var labelTD = document.createElement('TD')
	labelTD.setAttribute('notSelectable','true')
	labelTD.appendChild(document.createTextNode(lab))
	td_p.appendChild(labelTD);
	labelTD.style.width='100%'
	td_p.appendChild(termWidget.construct());
	for (var w in Icon.termWidgets)	{
	    //alert(Icon.termWidgets[w]+"   "+Icon.termWidgets[w].filter)
	    if (Icon.termWidgets[w].filter
		&& Icon.termWidgets[w].filter(tr.AJAR_statement,'pred',
					      inverse))
		termWidget.addIcon(td_p,Icon.termWidgets[w])
	}
	var defaultpropview = views.defaults[s.predicate.uri];
	
	/* Display only the one in the preferred language 
	  ONLY in the case (currently) when all the values are tagged.
	  Then we treat them as alternatives.*/
	
	if (myLang > 0 && langTagged == dups+1) {
	    for (k=j; k <= j+dups; k++) {
		if (sel(plist[k]).lang.indexOf(LanguagePreference) >=0) {
		    tr.appendChild(outline_objectTD(sel(plist[k]), defaultpropview))
		    break;
		}
	    }
	    j += dups  // extra push
	    continue;
	}

	tr.appendChild(outline_objectTD(sel(s), defaultpropview));

	/* Note: showNobj shows between n to 2n objects.
	 * This is to prevent the case where you have a long list of objects
         * shown, and dangling at the end is '1 more' (which is easily ignored)
	 * Therefore more objects are shown than hidden.
	 */
	tr.showNobj = function(n){
	    var show = ((2*n) < (k-dups)) ? n : (k-dups);
	    var showLaterArray = [];
	    if ((k-dups) != 1) {
		td_p.setAttribute('rowspan', (show == (k-dups)) ? 2 : 3);
		var l;
		if ((show < k-dups) && (show == 1)){
		    td_p.setAttribute('rowspan', 2);
		}
		for(l=1; l<k; l++) {
		    if (!sel(plist[j+l]).sameTerm(sel(plist[j+l-1]))) {
			s = plist[j+l];
			var trobj = document.createElement("TR");
			trobj.style.colspan='1';
			trobj.appendChild(outline_objectTD(sel(plist[j+l]), defaultpropview)); //property view
			trobj.AJAR_statement = s;
			trobj.AJAR_inverse = inverse;
			parent.appendChild(trobj);
			trobj.style.display = 'none';
			if (l<show){
			    trobj.style.display='block';
			} else {
			    showLaterArray.push(trobj);
			}
		    }
		}
	    }

	    if (show < (k-dups)){ //didn't show every obj
		// special case if show == 1 (case that wasn't covered above)
		// since adding moreTD html cell, still need to expand td_p to accommodate
		// add the '... more' cell here for now
		var moreTR = document.createElement('TR');
		var moreTD = moreTR.appendChild(document.createElement('TD'));

		if (k-dups > n){
		    var small = document.createElement('a');		    
		    moreTD.appendChild(small);


		    var predtoggle = (function(f){return f(td_p, k, dups, n);})(function(td_p, k, dups, n){
			return function(display){
			    // empty small
			    small.innerHTML = '';
			    if (display == 'none') {
				small.appendChild(AJARImage(Icon.src.icon_more, 'more', 'See all'))
				small.appendChild( document.createTextNode((k-dups-n) + ' more...'));
			    } else {
				small.appendChild(AJARImage(Icon.src.icon_shrink, '(less)'))
//				small.appendChild(document.createTextNode(' shrink'));
			    }
			    for (var i=0; i<showLaterArray.length; i++){
				var trobj = showLaterArray[i];
				trobj.style.display = display;
			    //td_p.setAttribute('rowspan', parseInt(td_p.getAttribute('rowspan')) + 1);
			    // for some reason, setting the display attribute to 'block'
			    // somehow stretches td_p to the right dimensions?! without changing the rowspan.
			    }
			}
		    }); // For Great Scoping.
		    var current = 'none';
		    var toggleObj = function(event){
			predtoggle(current);
			current = (current == 'none')? 'block':'none';
			if (event) event.stopPropagation();
			return false;
		    }
		    toggleObj();		    
		    small.addEventListener('click', toggleObj, false); 
		}
		parent.appendChild(moreTR);
	    }
	} //tr.showNobj

	tr.showAllobj = function(){tr.showNobj(k-dups);};
	//tr.showAllobj();

	tr.showNobj(10);

	j += k-1  // extra push
    }
}


termWidget={}

termWidget.construct = function ()
{
	td = document.createElement('TD')
	td.setAttribute('class','iconTD')
	td.setAttribute('notSelectable','true')
	td.style.width = '0px';
	return td
}
termWidget.addIcon = function (td, icon)
{
	var img = AJARImage(icon.src,icon.alt,icon.tooltip)
	var iconTD = td.childNodes[1];
	var width = iconTD.style.width;
	width = parseInt(width);
	width = width + icon.width;
	iconTD.style.width = width+'px';
	iconTD.appendChild(img);
}
termWidget.removeIcon = function (td, icon){
    var iconTD = td.childNodes[1];
    var width = iconTD.style.width;
    width = parseInt(width);
    width = width - icon.width;
    iconTD.style.width = width+'px';
    for (var x = 0; x<iconTD.childNodes.length; x++){
	var elt = iconTD.childNodes[x];
	var eltSrc = elt.src;
	var baseURI = document.location.href.split('?')[0]; // ignore first '?' and everything after it
	var relativeIconSrc = Util.uri.join(icon.src,baseURI);
	if (eltSrc == relativeIconSrc) {
	    iconTD.removeChild(elt);
	}
    }
}
termWidget.replaceIcon = function (td, oldIcon, newIcon)
{
	termWidget.removeIcon (td, oldIcon)
	termWidget.addIcon (td, newIcon)
}
	

////////// Views of classes mentioned in a document

function appendClassViewTRs(parent, subject) {
	
 /*   var statements = kb.statementsMatching(
            undefined, rdf('type'), undefined, subject)
    n = statements.length
    alert(statements[0]);
    for (var x=0; x<n;x++)
    {
    	kb.add(subject,
    		new RDFSymbol('http://dig.csail.mit.edu/2005/ajar/ajaw/ont#mentions'),statements[x].object, subject)
    	//kb.add(subject,rdf('type'),statements[x].object, subject)
    }
    /*var statements = kb.statementsMatching(
            undefined, rdf('type'), undefined, subject)
    var classes = [], i, n = statements.length
    for (i=0; i<n; i++) {
	classes[statements[i].object] = true;
    }

    var c; for (c in classes) {
        var tr = document.createElement('TR')
        var td1 = document.createElement('TD')
        tr.appendChild(td1)
        td1.appendChild(document.createTextNode('mentions'))   // was: 'mentions class'
        tr.appendChild(outline_objectTD(kb.fromNT(c)))
        parent.appendChild(tr)
    }*/
}

//////// Human-readable content of a document

function documentContentTABLE(subject) {
    var table = document.createElement("TABLE")

    table.setAttribute('class', 'docView')
    table.appendChild(expandedHeaderTR(subject))

    var iframe = document.createElement("IFRAME")
    iframe.setAttribute('src', subject.uri)
    iframe.setAttribute('class', 'doc')
    iframe.setAttribute('height', '480')
    iframe.setAttribute('width', '640')
    var tr = document.createElement('TR')
    tr.appendChild(iframe)
    table.appendChild(tr)
    return table
}

////////////////////////////////////////////////////// VALUE BROWSER VIEW


////////////////////////////////////////////////////////// TABLE VIEW

//  Summarize a thing as a table cell

function matrixTD(obj, asImage) {
    var td = document.createElement('TD');
    if (!obj) var obj = new RDFLiteral(".");
    if  ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')) {
	td.setAttribute('about', obj.toNT());
	td.setAttribute('style', 'color:#4444ff');
    }
    
    var image;
    if (obj.termType == 'literal') {
	td.appendChild(document.createTextNode(obj.value));
    } else if ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')){
	if (asImage) {
	    image = AJARImage(mapURI(obj.uri), label(obj), label(obj));
	    image.setAttribute('class', 'pic');
	    td.appendChild(image);
	} else {
	    td.appendChild(document.createTextNode(label(obj)));
	}
    }
    return td;
}

/**********************

  query global vars 

***********************/
var NextVariable = 0;
function newVariableName() {
    return 'v' + NextVariable++;
}
function clearVariableNames() { 
    NextVariable = 0;
} //clear


// const doesn't work in Opera
// const BLANK_QUERY = { pat: kb.formula(), vars: [], orderBy: [] };
// @ pat: the query pattern in an RDFIndexedFormula. Statements are in pat.statements
// @ vars: the free variables in the query
// @ orderBy: the variables to order the table


function queryObj()
{ 
	this.pat = kb.formula(), 
	this.vars = []
	this.orderBy = [] 
}

var queries = [];
myQuery=queries[0]=new queryObj();


function query_save() {
    queries.push(queries[0]);
    var choices = document.getElementById('queryChoices');
    var next = document.createElement('option');
    var box = document.createElement('input');
    var index = queries.length-1;
    box.setAttribute('type','checkBox');
    box.setAttribute('value',index);
    choices.appendChild(box);
    choices.appendChild(document.createTextNode("Saved query #"+index));
    choices.appendChild(document.createElement('br'));
	next.setAttribute("value",index);
	next.appendChild(document.createTextNode("Saved query #"+index));
	document.getElementById("queryJump").appendChild(next);
  }

/** tabulate this! **/
function AJAR_Tabulate(event) {
    makeQueryLines();
    matrixTable(myQuery, sortables_init)
    sortables_init(); //make table headers sortable
} //AJAR_Tabulate

function makeQueryLines() {
    var i, n=selection.length, j, m, tr, sel, st;
    for (i=0; i<n; i++) {
        sel = selection[i]
       	tr = sel.parentNode
       	st = tr.AJAR_statement
       	tdebug("Statement "+st)
       	if (sel.getAttribute('class').indexOf('pred') >= 0) {
           	tinfo("   We have a predicate")
           	patternFromTR(tr) //defined in tabulate.js, currently..
       	}
       	if (sel.getAttribute('class').indexOf('obj') >=0) {
       		tinfo("   We have an object")
       		patternFromTR(tr,true)
       	}
    }
    fyi("Vars now: "+myQuery.vars)
    tinfo("Query pattern now:\n"+myQuery.pat+"\n")
}


/** add a row to global myQuery using tr **/
function patternFromTR(tr, constraint) {
    var nodes = tr.childNodes, n = tr.childNodes.length, inverse=tr.AJAR_inverse,
        i, hasVar = 0, pattern, v, c, parentVar=null, level;
    
    function makeRDFStatement(freeVar, parent)
    {
    	if (inverse)
	    	return new RDFStatement(freeVar, st.predicate, parent)
	    else
	    	return new RDFStatement(parent, st.predicate, freeVar)
	}
	
    var st = tr.AJAR_statement; 
    for (level=tr.parentNode; level; level=level.parentNode) {
        if (typeof level.AJAR_statement != 'undefined') {
            fyi("Parent TR statement="+level.AJAR_statement + ", var=" + level.AJAR_variable)
            /*for(c=0;c<level.parentNode.childNodes.length;c++) //This makes sure the same variable is used for a subject
            	if(level.parentNode.childNodes[c].AJAR_variable)
            		level.AJAR_variable = level.parentNode.childNodes[c].AJAR_variable;*/
            if (!level.AJAR_variable)
                patternFromTR(level);
            parentVar = level.AJAR_variable
            break;
        }
    }
    var constraintVar = tr.AJAR_inverse? st.subject:st.object; //this is only used for constraints
    var hasParent=true
    if (constraintVar.isBlank && constraint) 
			alert("Warning: you are constraining your query with a blank node. The query will only find entries with the same blank node. Try constraining with a variable inside this node.");
    if (!parentVar)
    {
    	hasParent=false;
    	parentVar = inverse? st.object : st.subject; //if there is no parents, uses the sub/obj
	}
	tdebug('Initial variable: '+tr.AJAR_variable)
	v = tr.AJAR_variable? tr.AJAR_variable : kb.variable(newVariableName());
    myQuery.vars.push(v)
    v.label = hasParent? parentVar.label : label(parentVar);
    alert('Susepct this code is  not used')
    v.label += " "+ predicateLabelForXML(st.predicate, inverse);
    twarn('@@ temp2: v.label='+v.label)
    pattern = makeRDFStatement(v,parentVar);
    //alert(pattern);
    v.label = v.label.slice(0,1).toUpperCase() + v.label.slice(1)// init cap
    
    if (constraint)   //binds the constrained variable to its selected value
    	myQuery.pat.initBindings[v]=constraintVar;
    	
    tinfo('Pattern: '+pattern);
    pattern.tr = tr
    tr.AJAR_pattern = pattern    // Cross-link UI and query line
    tr.AJAR_variable = v;
    tdebug('Final variable: '+tr.AJAR_variable)
    fyi("Query pattern: "+pattern)
    myQuery.pat.statements.push(pattern)
    return v
} //patternFromTR


function resetQuery(){
	function resetOutliner(pat)
	{
    	var i, n = pat.statements.length, pattern, tr;
    	for (i=0; i<n; i++) {
        	pattern = pat.statements[i];
        	tr = pattern.tr;
       	 	//tdebug("tr: " + tr.AJAR_statement);
        	if (typeof tr!='undefined')
        	{
        		delete tr.AJAR_pattern;
        		delete tr.AJAR_variable;
        	}
    	}
    	for (x in pat.optional)
    		resetOutliner(pat.optional[x])
    }
    resetOutliner(myQuery.pat)
    clearVariableNames();
    queries[0]=myQuery=new queryObj();
}

function AJAR_ClearTable() {
    resetQuery();
    var div = document.getElementById('results');
    emptyNode(div);
    return false;
} //AJAR_ClearTable


/** build the tabulator table 
  * @param q - a query pattern (RDFFormula) 
  * @param matrixTableCB - function pointer **/
function matrixTable(q, matrixTableCB) {
    function onBinding(bindings) { //Creates a row of the table and sticks all the columns in it
        tinfo("making a row w/ bindings " + bindings);
        var i, tr, td
        tr = document.createElement('tr')
        t.appendChild(tr)
        for (i=0; i<nv; i++) {
            v = q.vars[i]
            tr.appendChild(matrixTD(bindings[v]))
        } //for each query var, make a row
    }
    var i, nv=q.vars.length, td, th, j, v
    var t = document.createElement('table')

    tr = document.createElement('tr')
    t.appendChild(tr)
    t.setAttribute('class', 'results sortable')
    t.setAttribute('id', 'tabulated_data'); //needed to make sortable
    var div = document.getElementById('results')
    emptyNode(div).appendChild(t) // See results as we go
    for (i=0; i<nv; i++) {
    	v = q.vars[i]
  	fyi("table header cell for " + v + ': '+v.label)
    	th = document.createElement('th')
    	
    	th.appendChild(document.createTextNode(v.label))
    	tr.appendChild(th)
    }
    use_callback = 1
    use_fetcher = 1
    if (use_callback) {
        kb.query(myQuery, onBinding, use_fetcher ? myFetcher : null); 
        //queries myQuery with use_fetcher, creating a callback to onBinding when it is fetched
        //It passes onBinding an association list of all the vars with their associated values in this subgraph
        //kb.query essentially routes to kb.match, which passes all matching subsets of kb, each to onBinding
        //kb.query(myQuery, queryCB)
    } else {
        var nbs = kb.query(myQuery.pat)
        var j, tr, nb, bindings, what
        for (j=0; j<nbs.length; j++) {
            tr = document.createElement('tr')
            t.appendChild(tr)
            bindings = nbs[j][0]  // [bindings, reason]
            for (i=0; i<nv; i++) {
            v = q.vars[i]
            td = document.createElement('td')
            what = bindings[v]
        //      fyi("    table cell "+v+": "+what + " type="+what.termType)
            tr.appendChild(matrixTD(what))
            }
        }
    }
    return t
}

function myFetcher(x, requestedBy) {
    if (x == null) {
        fyi("@@ SHOULD SYNC NOW") // what does this mean?
    } else {
        fyi("Fetcher: "+x)
        AJAR_handleNewTerm(kb, x, requestedBy)
    }
}

//////////////////////////////////// User Interface Events

function getAboutLevel(target) {
    var level
    for (level = target; level; level = level.parentNode) {
    fyi("Level "+level)
    var aa = level.getAttribute('about')
    if (aa) return level
    }
    return undefined
}

function ancestor(target, tagName) {
    var level
    for (level = target; level; level = level.parentNode) {
	fyi("looking for "+tagName+" Level: "+level+" "+level.tagName)
	if (level.tagName == tagName) return level;
    }
    return undefined
}

function getAbout(kb, target) {
    var level, aa
    for (level=target; level && (level.nodeType==1); level=level.parentNode) {
        fyi("Level "+level + ' '+level.nodeType)
        aa = level.getAttribute('about')
        if (aa) {
	    return kb.fromNT(aa)
	}
    }
    return undefined
}

function addButtonCallbacks(target, term) {
    var fireOn = Util.uri.docpart(term.uri)
    log.debug("Button callbacks for " + fireOn + " added")
    var makeIconCallback = function (icon) {
	return function (req) {
	    if (req.indexOf('#') >= 0) alert('Should have no hash in '+req)
	    if (!target) {
		return false
	    }
	    if (term.termType != "symbol") { return true }
	    if (req == fireOn) {
		target.src = icon
		target.title = Icon.tooltips[icon]
	    }
	    return true
	}
    }
    sf.addCallback('request',makeIconCallback(Icon.src.icon_requested))
    sf.addCallback('done',makeIconCallback(Icon.src.icon_fetched))
    sf.addCallback('fail',makeIconCallback(Icon.src.icon_failed))
}

//   Selection support

function selected(node) {
    var a = node.getAttribute('class')
    if (a && (a.indexOf('selected') >= 0)) return true
    return false
}


function setSelectedParent(node, inc){
    var onIcon = Icon.termWidgets.optOn;
	var offIcon = Icon.termWidgets.optOff;
	for (var n = node; n.parentNode; n=n.parentNode)
	{
    	while (true)
    	{
    		if (n.getAttribute('predTR'))
    		{
    			var num = n.getAttribute('parentOfSelected')
    			if (!num) num = 0;
    			else num = parseInt(num);
    			if (num==0 && inc>0) termWidget.addIcon(n.childNodes[0],n.getAttribute('optional')?onIcon:offIcon)
    			num = num+inc;
    			n.setAttribute('parentOfSelected',num)
    			if (num==0) 
    			{
    				n.removeAttribute('parentOfSelected')
    				termWidget.removeIcon(n.childNodes[0],n.getAttribute('optional')?onIcon:offIcon)
    			}
    			break;
    		}
    		else if (n.previousSibling && n.previousSibling.nodeName == 'TR')
    			n=n.previousSibling;
    		else break;
    	}
    }
}

function setSelected(node, newValue) {
    if (newValue == selected(node)) return;
    var cla = node.getAttribute('class')
    if (!cla) cla = ""
    if (newValue) {
	    cla += ' selected'
	    if (cla.indexOf('pred') >= 0 || cla.indexOf('obj') >=0 ) setSelectedParent(node,1)
	    selection.push(node)
	    fyi("Selecting "+node)
	    var source
	    if (node.AJAR_statement) source = node.AJAR_statement.why
	    else if (node.parentNode.AJAR_statement) source = node.parentNode.AJAR_statement.why
	    tinfo('Source to highlight: '+source);
	    if (source && source.uri) sourceWidget.highlight(source, true);
       } else {
	    fyi("cla=$"+cla+"$")
	    cla = cla.replace(' selected','')
	    if (cla.indexOf('pred') >= 0 || cla.indexOf('obj') >=0 ) setSelectedParent(node,-1)
	    RDFArrayRemove(selection, node)
	    fyi("Deselecting "+node)
	    fyi("cla=$"+cla+"$")
	    if (node.AJAR_statement) source=node.AJAR_statement.why
	    else if (node.parentNode.AJAR_statement) source=node.parentNode.AJAR_statement.why
	    if (source && source.uri) sourceWidget.highlight(source, false)
  }
    node.setAttribute('class', cla)
}

function deselectAll() {
    var i, n=selection.length
    for (i=n-1; i>=0; i--) setSelected(selection[i], false);
}

function getTarget(e) {
    var target
    if (!e) var e = window.event
    if (e.target) target = e.target
    else if (e.srcElement) target = e.srcElement
    if (target.nodeType == 3) // defeat Safari bug [sic]
       target = target.parentNode
    fyi("Click on: " + target.tagName)
    return target
}

/////////  Hiding

function AJAR_hideNext(event) {
    var target = getTarget(event)
    var div = target.parentNode.nextSibling
    for (; div.nodeType != 1; div = div.nextSibling) {}
    if (target.src.indexOf('collapse') >= 0) {
	div.setAttribute('class', 'collapse')
	target.src = Icon.src.icon_expand
    } else {
	div.removeAttribute('class')
	target.scrollIntoView(true)
	target.src = Icon.src.icon_collapse
    }
}

function TabulatorDoubleClick(event)
{
    var target = getTarget(event);
    var tname = target.tagName;
    fyi("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName);
    var aa = getAbout(kb, target);
    if (!aa) return;
	GotoSubject(aa,true);
}

function ResultsDoubleClick(event)
{	
    var target = getTarget(event);
    var aa = getAbout(kb, target)
    if (!aa) return;
    GotoSubject(aa,true);
}


function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
	((expires) ? "; expires=" + expires.toGMTString() : "") +
	((path) ? "; path=" + path : "") +
	((domain) ? "; domain=" + domain : "") +
	((secure) ? "; secure" : "");
    document.cookie = curCookie;
}


/*
  name - name of the desired cookie
  return string containing value of specified cookie or null
  if cookie does not exist
*/

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
	begin = dc.indexOf(prefix);
	if (begin != 0) return null;
    } else
	begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
	end = dc.length;
    return decodeURIComponent(dc.substring(begin + prefix.length, end));
}

function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
	document.cookie = name + "=" +
	    ((path) ? "; path=" + path : "") +
	    ((domain) ? "; domain=" + domain : "") +
	    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

function exportTable()
{
    /*sel=document.getElementById('exportType')
	var type = sel.options[sel.selectedIndex].value
	
	switch (type)
	{
		case 'cv':

			break;
		case 'html':
*/
	var win=window.open('table.html','Save table as HTML');
    var tbl=document.getElementById('tabulated_data');
    win.document.write('<TABLE>');
    for(j=0;j<tbl.childNodes[0].childNodes.length;j++)
    {
	win.document.write('<TH>'+ts_getInnerText(tbl.childNodes[0].cells[j])
			   +'</TH>')
    }
    for(i=1;i<tbl.childNodes.length;i++)
    {
	var r=tbl.childNodes[i]
	win.document.write('<TR>')
	var j
	for(j=0;j<r.childNodes.length;j++) {
	    var about = ""
	    if (r.childNodes[j].attributes['about'])
		about=r.childNodes[j].attributes['about'].value;
	    win.document.write('<TD about="'+about+'">');
	    win.document.write(ts_getInnerText(r.childNodes[j]));
	    win.document.write('</TD>');
	}
	win.document.write('</TR>');
    }
    win.document.write('</TABLE>');
    win.document.uri='table.html'
    win.document.close();
    /*			break;
	   	case 'sparql':
			//makeQueryLines();
			var spr = document.getElementById('SPARQLText')
			spr.setAttribute('class','expand')
            document.getElementById('SPARQLTextArea').value=queryToSPARQL(myQuery);
			//SPARQLToQuery("PREFIX ajar: <http://dig.csail.mit.edu/2005/ajar/ajaw/data#> SELECT ?v0 ?v1 WHERE { ajar:Tabulator <http://usefulinc.com/ns/doap#developer> ?v0 . ?v0 <http://xmlns.com/foaf/0.1/birthday> ?v1 . }")
			//matrixTable(myQuery, sortables_init)
    		      //sortables_init();
			break;
		case '': 
			alert('Please select a file type');
			break;
	}*/
}

function QuerySPARQLText ()
{
    var txt=document.getElementById('SPARQLTextArea').value;
    myQuery =  SPARQLToQuery(txt);
    matrixTable(myQuery, sortables_init)
    sortables_init(); //make table headers sortable
}

/** get the target of an event **/

function targetOf(e) {
    var target;
    if (!e) var e = window.event
    if (e.target) 
        target = e.target
    else if (e.srcElement) 
    target = e.srcElement
    else {
        terror("can't get target for event " + e);
        return false;
    } //fail
    if (target.nodeType == 3) // defeat Safari bug [sic]
        target = target.parentNode;
    return target;
} //targetOf

/** things to do onmousedown in outline view **/
// expand
// collapse
// refocus
// select
// visit/open a page

function TabulatorMousedown(e) {
    var target = targetOf(e);
    if (!target) return;
    var tname = target.tagName;
    //fyi("TabulatorMousedown: " + tname + " shift="+e.shiftKey+" alt="+e.altKey+" ctrl="+e.ctrlKey);
    var p = target.parentNode;
    var about = getAbout(kb, target)
    var source = null;
    if (tname == "INPUT") {
        return
    }
    if (tname != "IMG") {
        if(about) { 
            document.getElementById('UserURI').value = 
		 (about.termType == 'symbol') ? about.uri : ''; // blank if no URI
        }
        var node;
        for (node = ancestor(target, 'TD');
	     node && node.getAttribute('notSelectable');
	     node = ancestor(node.parentNode, 'TD')) {}
        if (!node) return;
        var sel = selected(node);
        var cla = node.getAttribute('class')
        fyi("Was node selected before: "+sel)
        if (e.altKey) {
            setSelected(node, !selected(node))
        } else if  (e.shiftKey) {
            setSelected(node, true)
        } else {
            //setSelected(node, !selected(node))
            deselectAll()
            setSelected(node, true)
        }
        fyi("Was node selected after: "+selected(node)
            +", count="+selection.length)
	var tr = node.parentNode;
	if (tr.AJAR_statement) {
	    var why = tr.AJAR_statement.why
	    tinfo("Information from "+why);
	}
	
    } else { // IMG
        var tsrc = target.src
        var outer
        var i = tsrc.indexOf('/icons/')
        if (i >=0 ) tsrc=tsrc.slice(i+1) // get just relative bit we use
        fyi("\nEvent: You clicked on an image, src=" + tsrc)
        if (!about) {
            alert("No about attribute");
            return;
        }
        var subject = about;
        fyi("TabulatorMousedown: subject=" + subject);
        
        switch (tsrc) {
	case Icon.src.icon_expand:
	case Icon.src.icon_collapse:
	    var details = e.altKey;
	    var mode = e.shiftKey ? outline_refocus :
		(tsrc == Icon.src.icon_expand ? outline_expand : outline_collapse);
	    mode(p, subject, details);
	    break;
	    //	case Icon.src.icon_visit:
	    //emptyNode(p.parentNode).appendChild(documentContentTABLE(subject));
	    //document.url = subject.uri;   // How to jump to new page?
	    //var newWin = window.open(''+subject.uri,''+subject.uri,'width=500,height=500,resizable=1,scrollbars=1');
	    //newWin.focus();
	    //break;
	case Icon.src.icon_failed:
	case Icon.src.icon_fetched:
	    sf.refresh(subject);
	    break;
	case Icon.src.icon_unrequested:
	    if (subject.uri) sf.lookUpThing(subject);
	    break;
	case Icon.src.icon_opton:
	case Icon.src.icon_optoff:
	    oldIcon = (tsrc==Icon.src.icon_opton)? Icon.termWidgets.optOn : Icon.termWidgets.optOff;
	    newIcon = (tsrc==Icon.src.icon_opton)? Icon.termWidgets.optOff : Icon.termWidgets.optOn;
	    termWidget.replaceIcon(p.parentNode,oldIcon,newIcon);
	    if (tsrc==Icon.src.icon_opton)
		p.parentNode.parentNode.removeAttribute('optional');
	    else p.parentNode.parentNode.setAttribute('optional','true');
	    break;
	case Icon.src.icon_remove_node:
	    var node = target.node;
	    node.parentNode.removeChild(node);
	    
	    break;
	case Icon.src.icon_map:
	    var node = target.node;
		setSelected(node, true);
		viewAndSaveQuery();
	    break;
	default: //nothing
        }
    }  // IMG
    if (e) e.stopPropagation();
} //function

// added source-getting to outline expand 4/27/06
function outline_expand(p, subject1, details) {
    var subject = kb.canon(subject1)
    var requTerm = subject.uri?kb.sym(Util.uri.docpart(subject.uri)):subject
    var subj_uri = subject.uri
    var already = false
    
    function render() {
	subject = kb.canon(subject)
	if (!p || !p.parentNode || !p.parentNode.parentNode) return false

	var newTable
	log.info('@@ REPAINTING ')
	if (!already) { // first expand
	    newTable = propertyTable(subject, undefined, details)
	} else {
	    for (newTable = p.firstChild; newTable.nextSibling;
		 newTable = newTable.nextSibling) {
		if (newTable.nodeName == 'table') break
	    }
	    newTable = propertyTable(subject, newTable, details)
	}
	already = true
	if (p.parentNode.parentNode.style.backgroundColor=='white') {
	    newTable.style.backgroundColor='#eee'
	} else {
	    newTable.style.backgroundColor='white'
	}
	emptyNode(p).appendChild(newTable)
	log.debug("expand: Node for " + subject + " expanded")	    
    } 


    function expand(uri)  {
	var cursubj = kb.canon(subject)  // canonical identifier may have changed
	    log.info('@@ expand: relevant subject='+cursubj+', uri='+uri+', already='+already)
        var term = kb.sym(uri)
	var docTerm = kb.sym(Util.uri.docpart(uri))
	if (uri.indexOf('#') >= 0) 
	    throw "Internal error: hash in "+uri;
	
	var relevant = function() {  // Is the loading of this URI relevam to the display of subject?
	    if (!cursubj.uri) return true;  // bnode should expand() 
	    doc = cursubj.uri?kb.sym(Util.uri.docpart(cursubj.uri)):cursubj
	    as = kb.uris(cursubj)
	    if (!as) return false;
	    for (var i=0; i<as.length; i++) {  // canon'l uri or any alias
		for (var rd = Util.uri.docpart(as[i]); rd; rd = kb.HTTPRedirects[rd]) {
//		    log.info('@@@@@ cursubj='+cursubj+', rd='+rd)
		    if (uri == rd) return true;
		}
	    }
	    /* This didn't work because of smushing
	    if (kb.anyStatementMatching(docTerm, // or stg. requestedBY the same thing?
		kb.sym('tab',"requestedBy"),  // @@ works? -tim
				    requTerm)) return true;
	    */
	    return false;
	}
	if (relevant()) {
	    log.success('@@ expand OK: relevant subject='+cursubj+', uri='+uri+', source='+
		already)
		
	    render()
	}
	return true
    }

    log.debug("outline_expand: dereferencing "+subject)
    var status = document.createElement("span")
    p.appendChild(status)
    sf.addCallback('done', expand)
    sf.addCallback('fail', expand)
    sf.addCallback('request', function (u) {
		       if (u != subj_uri) { return true }
		       status.textContent=" requested..."
		       return false
		   })
    sf.addCallback('recv', function (u) {
		       if (u != subj_uri) { return true }
		       status.textContent=" receiving..."
		       return false
		   })
    sf.addCallback('load', function (u) {
		       if (u != subj_uri) { return true }
		       status.textContent=" parsing..."
		       return false
		   })
    sf.lookUpThing(subject)
    render()  // inital open, or else full if re-open

} //outline_expand

function outline_collapse(p, subject) {
    var row = ancestor(p, 'TR');
    row = ancestor(row.parentNode, 'TR'); //two levels up
    if (row) var statement = row.AJAR_statement;
    var level; //find level (the enclosing TD)
    for (level=p.parentNode; level.tagName != "TD";
            level=level.parentNode) {
        if (typeof level == 'undefined') {
            alert("Not enclosed in TD!")
            return
        }
    }
    //deselects everything being collapsed. This goes backwards because
    //deselecting an element decreases selection.length
    for (var x=selection.length-1;x>-1;x--)
    	for (elt=selection[x];elt.parentNode;elt=elt.parentNode)
    	    if (elt===row)
		setSelected(selection[x],false)
    			
    fyi("Collapsing subject "+subject);
    var myview;
    if (statement) {
        log.debug("looking up pred " + statement.predicate.uri + "in defaults");
        myview = views.defaults[statement.predicate.uri];
    }
    log.debug("view= " + myview);
    if (level.parentNode.parentNode.id == 'browser') {
	var deleteNode = level.parentNode
    }
    level.parentNode.replaceChild(outline_objectTD(subject,
						   myview, deleteNode), level);
} //outline_collapse

function outline_refocus(p, subject) { // Shift-expand or shift-collapse: Maximize
    var outer = null
    for (var level=p.parentNode; level; level=level.parentNode) {
        fyi("level "+ level.tagName)
        if (level.tagName == "TD") outer = level
    } //find outermost td
    emptyNode(outer).appendChild(propertyTable(subject));
    document.title = label("Tabulator: "+subject);
    outer.setAttribute('about', subject.toNT());
} //outline_refocus

// Inversion is turning the outline view inside-out
 
function outline_inversion(p, subject) { // re-root at subject

    function move_root(rootTR, childTR) { // swap root with child
    // @@
    }

}

function GotoFormURI_enterKey(e) { if (e.keyCode==13) GotoFormURI(e)  }
function GotoFormURI(e) { GotoURI(document.getElementById('UserURI').value); }

function GotoURI(uri){
	var subject = kb.sym(uri)
	GotoSubject(subject, true);
}

function GotoURIinit(uri){
	var subject = kb.sym(uri)
	GotoSubject(subject)
}

function GotoSubject(subject, expand) {
    var table = document.getElementById('browser');
    var tr = document.createElement("TR");
    tr.style.verticalAlign="top";
    table.appendChild(tr);
    var td = outline_objectTD(subject, undefined, tr)

    tr.appendChild(td)
    if (expand) {
    	outline_expand(td, subject)
    	document.title = "Tabulator: "+label(subject)
    }

    return subject;
}

function GotoURIAndOpen(uri) {
   var sbj = GotoURI(uri);
//   outline_expand(document.getElementById('browser'), sbj);  Wrong element
}


function StatusWidget() {
    this.ele = document.getElementById('TabulatorStatusWidget')
    this.pend = 0
    this.errors = {}
    var sw = this

    this.recv = function (uri) {
	sw.pend++
	sw.update()
	return true
    }

    this.quit = function (uri) {
	sw.pend--
	sw.update()
	return true
    }

    this.update = function () {
        if(sw.pend==0)
          sw.ele.style.display="none";
        else
          sw.ele.style.display="inline";
	sw.ele.textContent = "Sources pending: "+sw.pend
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
		var req = kb.any(udoc, kb.sym('tab', 'request')) // @@ what if > 1?
		var lstat = kb.the(req, kb.sym('tab','status'))
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
	
	    var rbtn = appendAccessIcon(iconCell, udoc)
	    var xbtn = AJARImage(Icon.src.icon_remove_node, 'remove');
	    rbtn.style.marginRight = "0.8em"
	    rbtn.onclick = function () {
		sf.refresh(udoc)
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
		   
    this.highlight = function(u, on) {
	if (!u) return;
	this.sources[u.uri].setAttribute('class', on ? 'sourceHighlight' : '')
    }
}

////////////////////////////////////////////////////////
//
//
//                    VIEWS
//
//
////////////////////////////////////////////////////////

var views = {
    properties                          : [],
    defaults                                : [],
    classes                                 : []
}; //views

// not functional at the moment. 
///** find applicable views for the subject 
//    @returns array of javascript functions **/
//function views_find_applicable(subject) {
//  //find class-specific views
//  //i.e.: foaf:Person tabulator:view <http://MYDOMAIN/MYVIEW.js> }
//  var classes = kb.each(subject, rdf('type'));
//  var views;
//  for (var c in classes) classes[c] = classes[c].object;
//  for (var c in classes)
//      views = views.concat(views, views_findClassViews(c));
//
//  //@@fresnel views
//  //@@views if fulfills some functions
//  return views;
//} //find
//
///** find views that apply to the given class to the array **/
//function views_findClassViews(clss)
//{
//  var classviews = kb.each(clss, tabulator_ns('view'));
//  for (var cv in classviews)
//      classviews[cv] = classview[cv].object;
//  return classviews;
//} //views_add_classviews

/** add a property view function **/
function views_addPropertyView(property, pviewfunc, isDefault) {
    if (!views.properties[property]) 
        views.properties[property] = [];
    views.properties[property].push(pviewfunc);
    if(isDefault) //will override an existing default!
        views.defaults[property] = pviewfunc;
} //addPropertyView

//view that applies to items that are objects of certain properties.
//views_addPropertyView(property, viewjsfile, default?)
views_addPropertyView(foaf('depiction').uri, VIEWAS_image, true);
views_addPropertyView(foaf('img').uri, VIEWAS_image, true);
views_addPropertyView(foaf('thumbnail').uri, VIEWAS_image, true);
views_addPropertyView(foaf('logo').uri, VIEWAS_image, true);
views_addPropertyView(mo('image').uri, VIEWAS_image, true);
//views_addPropertyView(foaf('aimChatID').uri, VIEWAS_aim_IMme, true);
views_addPropertyView(foaf('mbox').uri, VIEWAS_mbox, true);
//views_addPropertyView(foaf('based_near').uri, VIEWAS_map, true);
views_addPropertyView(foaf('birthday').uri, VIEWAS_cal, true);

/** some builtin simple views **/
function VIEWAS_boring_default(obj) {
    //log.debug("entered VIEWAS_boring_default...");
    var rep; //representation in html

    if (obj.termType == 'literal')
    {
        rep = document.createTextNode(obj.value);
    } else if (obj.termType == 'symbol' || obj.termType == 'bnode') {
        rep = document.createElement('span');
        rep.setAttribute('about', obj.toNT());
        appendAccessIcon(rep, obj);
        rep.appendChild(document.createTextNode(label(obj)));
        if ((obj.termType == 'symbol') &&
            (obj.uri.indexOf("#") < 0) &&
            (Util.uri.protocol(obj.uri)=='http'
	     || Util.uri.protocol(obj.uri)=='https')) {
	    // a web page @@ file, ftp;
                var linkButton = document.createElement('input');
                linkButton.type='image';
                linkButton.src='icons/document.png';
                linkButton.alt='Open in new window';
                linkButton.onclick= function () {
                    return window.open(''+obj.uri,
				       ''+obj.uri,
				       'width=500,height=500,resizable=1,scrollbars=1')
                }
                linkButton.title='View in a new window';
                rep.appendChild(linkButton);
        }
    } else if (obj.termType=='collection'){
	// obj.elements is an array of the elements in the collection
	rep = document.createElement('table');
	rep.setAttribute('about', obj.toNT());
/* Not sure which looks best -- with or without. I think without

	var tr = rep.appendChild(document.createElement('tr'));
	tr.appendChild(document.createTextNode(
		obj.elements.length ? '(' + obj.elements.length+')' : '(none)'));
*/
	for (var i=0; i<obj.elements.length; i++){
	    var elt = obj.elements[i];
	    var row = rep.appendChild(document.createElement('tr'));
	    var numcell = row.appendChild(document.createElement('td'));
	    numcell.setAttribute('about', obj.toNT());
	    numcell.innerHTML = (i+1) + ')';
	    row.appendChild(outline_objectTD(elt));
	}
    } else {
        log.error("unknown term type: " + obj.termType);
        rep = document.createTextNode("[unknownTermType:" + obj.termType +"]");
    } //boring defaults.
    log.debug("contents: "+rep.innerHTML);
    return rep;
}  //boring_default!
function VIEWAS_image(obj) {
    return AJARImage(obj.uri, label(obj), label(obj));
}

function VIEWAS_mbox(obj) {
    var anchor = document.createElement('a');
    // previous implementation assumed email address was Literal. fixed.
    
    // FOAF mboxs must NOT be literals -- must be mailto: URIs.
    
    var address = (obj.termType=='symbol') ? obj.uri : obj.value; // this way for now
    if (!address) return VIEWAS_boring_default(obj)
    var index = address.indexOf('mailto:');
    address = (index >= 0) ? address.slice(index + 7) : address;
    anchor.setAttribute('href', 'mailto:'+address);
    anchor.appendChild(document.createTextNode(address));
    return anchor;
}

/* need to make unique calendar containers and names
 * YAHOO.namespace(namespace) returns the namespace specified 
 * and creates it if it doesn't exist
 * function 'uni' creates a unique namespace for a calendar and 
 * returns number ending
 * ex: uni('cal') may create namespace YAHOO.cal1 and return 1
 *
 * YAHOO.namespace('foo.bar') makes YAHOO.foo.bar defined as an object,
 * which can then have properties
 */

function uni(prefix){
    var n = counter();
    var name = prefix + n;
    YAHOO.namespace(name);
    return n;
}

// counter for calendar ids, 
counter = function(){
	var n = 0;
	return function(){
		n+=1;
		return n;
	}
}() // *note* those ending parens! I'm using function scope

var renderHoliday = function(workingDate, cell) { 
	YAHOO.util.Dom.addClass(cell, "holiday");
} 


/* toggles whether element is displayed
 * if elt.getAttribute('display') returns null, 
 * it will be assigned 'block'
 */
function toggle(eltname){
	var elt = document.getElementById(eltname);
	elt.style.display = (elt.style.display=='none')?'block':'none'
}

/* Example of calendar Id: cal1
 * 42 cells in one calendar. from top left counting, each table cell has
 * ID: YAHOO.cal1_cell0 ... YAHOO.cal.1_cell41
 * name: YAHOO.cal1__2006_3_2 for anchor inside calendar cell 
 * of date 3/02/2006
 * 
 */	
function VIEWAS_cal(obj) {
	prefix = 'cal';
	var cal = prefix + uni(prefix);

	var containerId = cal + 'Container';
	var table = document.createElement('table');
	
	
	// create link to hide/show calendar
	var a = document.createElement('a');
	// a.appendChild(document.createTextNode('[toggle]'))
	a.innerHTML="<small>mm-dd: " + obj.value + "[toggle]</small>";
	//a.setAttribute('href',":toggle('"+containerId+"')");
	a.onclick = function(){toggle(containerId)};
	table.appendChild(a);

	var dateArray = obj.value.split("-");
	var m = dateArray[0];
	var d = dateArray[1];
	var yr = (dateArray.length>2)?dateArray[2]:(new Date()).getFullYear();

	// hack: calendar will be appended to divCal at first, but will
	// be moved to new location
	document.getElementById('divCal').appendChild(table);
	var div = table.appendChild(document.createElement('DIV'));
	div.setAttribute('id', containerId);
	// default hide calendar
	div.style.display = 'none';
	div.setAttribute('tag','calendar');
	YAHOO[cal] = new YAHOO.widget.Calendar("YAHOO." + cal, containerId, m+"/"+yr);

	YAHOO[cal].addRenderer(m+"/"+d, renderHoliday); 

	YAHOO[cal].render();
	// document.childNodes.removeChild(table);
	return table;
}


// test writing something to calendar cell


function VIEWAS_aim_IMme(obj) {
    var anchor = document.createElement('a');
    anchor.setAttribute('href', "aim:goim?screenname=" + obj.value + "&message=hello");
    anchor.setAttribute('title', "IM me!");
    anchor.appendChild(document.createTextNode(obj.value));
    return anchor;
} //aim_IMme

/*function VIEWAS_map(obj) {
	var lat = kb.each(obj, kb.sym('http://www.w3.org/2003/01/geo/wgs84_pos#lat'), undefined).toString();
	var lng = kb.each(obj, kb.sym('http://www.w3.org/2003/01/geo/wgs84_pos#long'), undefined).toString();
	if (parseFloat(lat) && parseFloat(lng))
	{
	
	    var disp = document.createElement('table')
	    var cola=disp.appendChild(document.createElement('tr'))
	    cola.appendChild(document.createTextNode("Latitude: "+lat+", Longitude: "+lng));
	    var colb=disp.appendChild(document.createElement('tr'))
	    var anchor=colb.appendChild(document.createElement('div'));
	    anchor.setAttribute('style','width:400px; height: 400px');
		anchor.setAttribute('id','mapContainer'+obj.toString);
		if (GBrowserIsCompatible()) {
			var map = new GMap2(anchor);
			map.setCenter(new GLatLng(parseFloat(lat), parseFloat(lng)), 9);
			map.panTo(new GLatLng(parseFloat(lat), parseFloat(lng)))
	        map.addOverlay(new GMarker(new GLatLng(parseFloat(lat), parseFloat(lng))));
	    }
	 
    //var myPoint = new YGeoPoint (parseFloat(lat.toString()),parseFloat(lng.toString));
    //var myPoint = new YGeoPoint(42.3601,-71.8783);
    //var map = new YMap(anchor);
    //map.drawZoomAndCenter(myPoint,8);
    //map.addTypeControl();
    //map.setMapType(YAHOO_MAP_REG);
    //var marker = new YMarker(myPoint);
    //var owner = kb.each(undefined,kb.sym(foaf('based_near')),obj)
    //var owner_name = kb.each(owner,kb.sym(foaf('name')),undefined)
    //marker.addLabel('Adam')
    
		return disp;
	}
	else
	{
		return VIEWAS_boring_default(obj);
	}
}*/

/*<div id="mapContainer"></div>

<script type="text/javascript">
// Create a lat/lon object
var myPoint = new YGeoPoint(37.4041960114344,-122.008194923401);
// Create a map object 
var map = new YMap(document.getElementById('mapContainer'));
// Display the map centered on a latitude and longitude 
map.drawZoomAndCenter(myPoint, 3);

// Add map type control
map.addTypeControl();

// Set map type to either of: YAHOO_MAP_SAT YAHOO_MAP_HYB YAHOO_MAP_REG
map.setMapType(YAHOO_MAP_SAT);

//Get valid map types, returns array [YAHOO_MAP_REG, YAHOO_MAP_SAT, YAHOO_MAP_HYB]
var myMapTypes = map.getMapTypes(); */


function createTabURI() {
    document.getElementById('UserURI').value=
      document.URL+"?uri="+document.getElementById('UserURI').value;
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
    tmsg("DEPENDENCIES: ");
    for (var d in sources.depends) tmsg("d=" + d + ", sources.depends[d]=" + sources.depends[d]);
    tmsg("CALLBACKS: ");
    for (var c in sources.callbacks) tmsg("c=" + c + ", sources.callbacks[c]=" + sources.callbacks[c]);
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
function AJAR_initialisePage()
{
    statusWidget = new StatusWidget()
    sourceWidget = new SourceWidget()
    initialiseGetData();
    var browser = document.getElementById('browser');
    var q
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
        GotoURIAndOpen(GET_DATA['uri']);
    }
    else
    {
    	var links = { 'http://dig.csail.mit.edu/2005/ajar/ajaw/data#Tabulator':'The tabulator project',
    			  'http://dig.csail.mit.edu/data#DIG':'Decentralised Information Group' };
    	for (q in links)
    	{
    		/*var tr = document.createElement('tr')
    		var td = document.createElement('td')
    		td.setAttribute('about',q)
    		browser.appendChild(tr)
    		tr.appendChild(td)
    		td.appendChild(AJARImage(icon_expand,'expand'))
    		td.appendChild(document.createTextNode(links[q]))*/
    		kb.add(kb.sym(q),kb.sym('dc',"title"),kb.literal(links[q]));
    		GotoURIinit(q)
    	}
    } //go to an initial uri
} //initialize page


///and at the end
//addLoadEvent(function() { sources_request_new(tabulator_ns('')) });
//addLoadEvent(function () { sources_request_new(kb.sym('http://www.w3.org/People/Connolly/#me')); });
addLoadEvent(AJAR_initialisePage)
