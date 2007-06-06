//   Display RDF information in tabular form using HTML DOM
// 
// $Id: tabulate.js,v 1.150 2005/11/23 21:31:29 timbl Exp $
//
// Wishlist:
//     Undo function on all user operations
//     Revocation of specific sources of data
//     Masking of specific proerties and/or ontologies
//     Store all state (except RDF triples) in DOM so Save page
//	    makes a useable version
//     Ontological closure -- follow all predicates
//     Solve the problem of loading from different domain
//     depiction as image
//	Mouseover URIs for things
//	Number triples on board (??) display
//  Lists as lists
//  Other views, esp. of long lists or many of the same property:
//	slideshow -present 1 at a time with forwrad and back buttons
//	Wide list of horizontal cells, with nothing to left (and sim vert)
//	


var documentStatus = []
var documents = []
var kb = new RDFFormula()

var logging = false  // flag: Should fyi() log to the status area 

// Icons. Must be able to change for platform-consistency,
// color blindness, etc.

var SiteMap = []

SiteMap[ "http://www.w3.org/" ] = "http://localhost/www.w3.org/"  // Salt to taste

icon_fetch = 'icons/16dot-blue.gif'
icon_failed = 'icons/18x18-white.gif'
icon_expand = 'icons/16dot-green.gif'
icon_collapse = 'icons/16dot-red.gif'  
icon_pending = 'icons/16dot-yellow.gif'
icon_maximize = 'icons/clean/icon_con_max.png'
icon_visit = 'icons/document.png'

/*
icon_fetch = 'icons/16dot-blue.gif'
icon_expand = 'icons/clean/icon_expand.png'
icon_collapse = 'icons/clean/icon_collapse.png'  // icons/clean/icon_menu.png
icon_pending = 'icons/16dot-yellow.gif'
icon_maximize = 'icons/clean/icon_con_max.png'
*/

foaf = Namespace("http://xmlns.com/foaf/0.1/")

PropertiesWithRangeImage = []
PropertiesWithRangeImage[foaf('depiction')] = true
PropertiesWithRangeImage[foaf('thumb')] = true
PropertiesWithRangeImage[foaf('logo')] = true


  
function label(x) {
    var foafName = kb.any(x, foaf("name"))
    if (foafName) return foafName.toString();

    if (x.termType == 'bnode') {
	return "..."
    }
    var hash = x.uri.indexOf("#")
    if (hash >=0) { return x.uri.slice(hash+1) }
    return x.uri 
}


function dumpStore() {
    fyi("\nStore:\n" + kb + "__________________\n")
}

     
 //////////  URI space mapping
 //
 // Maybe here we track redirectios 301 302 and not to mention 303
 //
 //  Also online/offline working, caches etc
 //  Tracking of information obtained by HTTP, I suppose.
 //  Hmmm. interesting to keep that information available to user tabulated
 //
 function mapURI(uri) {
    var j, j, v
    fyi("document.domain "+document.domain)
    i = uri.indexOf('//')
    fyi("uri.indexOf('//') "+uri.indexOf('//'))
    if (document.domain == "localhost") {   // ie script is local
	if ( i >= 0) {
	    j = uri.indexOf('/', i+2)
	    if (j >= 0) {
		fyi("uri.slice(0,j+1) "+uri.slice(0,j+1))
		v =  SiteMap[uri.slice(0,j+1)]
		if (v) {
		    fyi("Mapped "+uri+" to "+v + uri.slice(j+1))
		    uri = v + uri.slice(j+1)
		}
	    }
	}
    }
    fyi("Mapped "+uri)
    return uri
 }
 
 ////////// Document management:
 
function documentURI(uri) {
    var i = uri.indexOf("#")
    if (i < 0) return uri
    return uri.slice(0,i)
} 

function docState(uri) {
    if (uri.slice(0,5) != 'http:') return 'unfetchable' // @@ add ftp, file?
    var status = documentStatus[uri]
    if (typeof status == 'undefined') return 'unrequested';
    return status.state
}
function requestFetch(subject, callback) {
    var uri = documentURI(subject.uri)
    var state = docState(uri)
    if (state != 'unrequested') {
	alert("Can't request "+uri+" "+state)
	return;
    }
    var i = documents.length
    documents.push(uri)
    documentStatus[uri] = { state: 'requested', number: i}
    RDFLoad(mapURI(uri), uri, kb, function(status) {documentLoaded(uri, status)})

    var x = document.getElementById('sources');
    if (!x) return;
    var addendum = document.createElement("TR")
    x.appendChild(addendum)
    addendum.innerHTML = ('<tr id="source'+i+'" class="requested"><td> '
		+ escapeForXML(uri) + ' </td></tr>');

}
 
 
function documentLoaded(uri, responseCode) {
   var state = docState(uri)
    if (state != 'requested') alert("eh? "+uri+" "+state)
    var status = documentStatus[uri]
    var i = status.number
    var newIcon
    if (responseCode == 200) {
	status.state = 'fetched'
	newIcon = icon_expand
    } else {
	alert("Error: HTTP response code " + responseCode + " for "+uri)
	status.state = 'failed'
	newIcon = icon_failed
    }
    if (!document.getElementById('sources')) return;
    var x = document.getElementById('source'+i);
    if (!x) {
	alert("What? no source"+i)
	return
    }
    x.setAttribute('class', 'fetched')
    
    refreshButtons(uri, newIcon,
	document.getElementById('browser'))
    fyi("Fetch over and UI updated: "+ uri + "\n")	    
}

// Bonus prize for a better way to do this. This refreshes the whole
// browser table for any icons which need to change state when URI has loaded

function refreshButtons(resourceURI, iconURI, ele, parent) {
//    fyi("    Refresh name "+ ele + " name " + ele.tagName)
    if ('TABLE TBODY TR TD'.indexOf(ele.tagName) >=0 ) {
	var nodes = ele.childNodes, len = nodes.length, i
	for (i=0; i<len; i++) refreshButtons(resourceURI, iconURI, nodes[i], ele)
    } else if (ele.tagName == 'IMG') {
	var about = parent.getAttribute('about').replace(/^</, "").replace(/>$/,"")
	about = about.replace(/#.*/,"")
	if (about == resourceURI) {
	    fyi("Fixed an icon")
	    ele.src = iconURI
	}
    }
}

/////////////////////////  Logging
//

function escapeForXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

function fyi(str)
{
    if (!logging) return
    var x = document.getElementById('status');
    if (!x) return;

    var addendum = document.createElement("SPAN")
    x.appendChild(addendum)
    addendum.innerHTML = escapeForXML(str) + "<br/>";
}

function clearStatus(str)
{
    var x = document.getElementById('status');
    if (!x) return;
    x.innerHTML = "";
}

function setLogging(x) {
    logging = true
    fyi("Logging "+x)
    logging = x
}

///////////////////////// Representing data

function title(subject) {
    return ('<img border="0" src="' + icon_expand + '" alt="expand">'+
		' ' + label(subject))
}


//  Represent an object in summary form as a table cell

function objectCell(obj, asImage) {
    var icon = icon_expand
    var alt = 'expand'
    var visitable = ''
    var str=""
    if (obj.termType == 'symbol') {
	var doc = documentURI(obj.uri)
	if ((obj.uri.indexOf("#") <0) &&
		(obj.uri.slice(0,5)=='http:')) { // a web page @@ file, ftp
	    visitable = (
//		    '<a href="' + doc + '" target="tabdoc">'+
	     '<img border="0" src="' + icon_visit + '" alt="open">'
//		     +'</a>'
	     )
	}
	var state = docState(doc)
	fyi("State of " + doc + ": " + state)
	if (state == 'unrequested') {
	    icon = icon_fetch
	    alt = 'fetch'
	} else if (state == 'pending') {
	    icon = icon_pending
	    alt = 'fetching'
	}
    
    }
    if (obj.termType == 'literal') {
			str += ( '<td>' + obj.value + '</td>')
    } else if (obj.termType == 'symbol'){
	str += ('<td about="' + obj.toNT() + 
	'"><img border="0" src="' + icon + ' " alt="'+alt+'" />'
	 + (asImage ? ( '<img src="'+ obj.uri+'"/>') : label(obj))
	 + visitable + '</td>')
    } else if (obj.termType == 'bnode'){
	str += ('<td about="' + obj.toNT() + 
	'"><img border="0" src="'+ icon +'" alt="'+alt+'" />'+
	label(obj) + '</td>')
    }
    return str
}

///////////////// Represent an arbirary subject by its properties

function propertyTable(subject, ele) {
    fyi("Property table for: "+ subject)
    var str = '<table border="0.5">\n'
    var s
    str += '<tr><td colspan="2" about="' + subject.toNT() + 
		'"><img border="0" src="'+ icon_collapse +'" alt="close" />'+
		 label(subject) +'</td></tr>' 

    ele.innerHTML = str + '</table>'  //initial value while we wait
    
    var plist = kb.statementsMatching(subject)
    fyi("Property list length = " + plist.length)
    
    if (plist.length > 0) {
//	plist = plist.sort(RDFComparePredicateObject)
	var j, s
	var max = plist.length
	for (j=0; j<max; j++) {
	    var s = plist[j]
	    
	    var lab = label(s.predicate)
	    var slash = lab.lastIndexOf("/")
	    if (slash >=0) lab = lab.slice(slash+1);

	    var asImage = ((s.predicate.termType == 'symbol')
		&& PropertiesWithRangeImage[s.predicate.uri])

	    str += ('<tr><td>' + lab + '</td>'
		    + objectCell(s.object, asImage)
		    + '</tr>')
	}
    }

    plist = kb.statementsMatching(undefined, undefined, subject)
    fyi("Inverse Property list length = " + plist.length)
    
    if (plist.length > 0) {
//	plist = plist.sort(RDFComparePredicateObject)
	var j, s
	var max = plist.length
	for (j=0; j<max; j++) {
	    if (s.subject == subject) continue; // that we knew
	    var s = plist[j]
	    
	    var lab = label(s.predicate)
	    var slash = lab.lastIndexOf("/")
	    if (slash >=0) lab = lab.slice(slash+1);

	    str += ('<tr><td>is ' + lab + ' of</td>'
		    + objectCell(s.subject)
		    + '</tr>')
	}
    }

    str += '</table>'
    ele.innerHTML = str
return
} /* propertyTable */


function TabulatorMousedown(e)
{
    var target
    if (!e) var e = window.event
    if (e.target) target = e.target
    else if (e.srcElement) target = e.srcElement
    if (target.nodeType == 3) // defeat Safari bug [sic]
       target = target.parentNode
    var tname = target.tagName
    fyi("TabulatorMousedown: " + tname)
    p = target.parentNode
 
    if (tname == "IMG")
    {
	var tsrc = target.src
	var outer
	var i = tsrc.indexOf('/ajaw/')
	if (i >=0 ) tsrc=tsrc.slice(i+6) // get just relative bit we use
	fyi("\nEvent: You clicked on an image, src=" + tsrc)
	var subject = p.getAttribute("about")
	if (!subject) {
	    alert("No about attribute")
	    return
	}
	subject = kb.fromNT(subject)
	fyi("TabulatorMousedown: subject=" + subject)
	if ((tsrc == icon_expand) || (tsrc == icon_pending)) {
	    if (e.shiftKey!=1) {
		propertyTable(subject, p)
	    } else {
		outer = null
		for (level=p.parentNode; level; level=level.parentNode) {
		    fyi("level "+ level.tagName)
		    if (level.tagName == "TD") outer = level
		}
		propertyTable(subject, outer)
		document.title = label(subject)	    
		outer.setAttribute('about', subject.toNT())
	    }
	} else if (tsrc == icon_visit) {

	} else if (tsrc == icon_fetch) {
	    target.src = icon_pending
	    requestFetch(subject)
	} else if (tsrc == icon_collapse) {
	    var level
	    for (level=p.parentNode; level.tagName != "TD";
					    level=level.parentNode) {
		fyi("level "+ level.tagName)
		if (typeof level == 'undefined') {
		    alert("Not enclosed in TD!")
		    return
		}
	    }
	    level.innerHTML = title(subject)
	}
    }
}

function GotoFormURI(event) { GotoURI(document.AddressBar.UserURI.value) }

function GotoURI(uri) {
    var table = document.getElementById('browser')
    var tr = document.createElement("TR")
    var subject = kb.sym(uri)
    table.appendChild(tr)
    tr.innerHTML = objectCell(subject)
    document.title = label(subject)
    return
}

//ends

