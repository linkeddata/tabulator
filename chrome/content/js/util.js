/**
 * Utility functions for tabulator
 */

/**
 * A function emulating Scheme's filter. Should have been part of JavaScript so
 * it is global.
 */
function filter(func, list) {
    //tdebug("entered filter with list length=" + list.length);
    var output = [];
    for (var elt in list) {
	//tdebug("elt=" + list[elt] + ", true? " + func(list[elt]));
	if (func(list[elt])) {
	    output.push(list[elt]);
	}
    } //construct output
    //tdebug("exiting filter with list length=" + output.length);
    return output;
}

/** 
 * A function emulating Scheme's map. Should have been part of JavaScript so it
 * is global.
 */
function map(func, list) {
    //tdebug("entered map with list=" + list.join(", "));
    var output = [];
    for (var i in list)  //works on assoc? i hope so
	output[i] = func(list[i]);
    return output;
}

// These are extra

/**
 * @class A utility class
 */
Util = {
    /** A simple debugging function */         
        'output': function (o) {
	    var k = document.createElement('div')
	    k.textContent = o
	    document.body.appendChild(k)
	},
    /**
     * A standard way to add callback functionality to an object
     **
     ** Callback functions are indexed by a 'hook' string.
     **
     ** They return true if they want to be called again.
     **
     */
        'callbackify': function (obj,callbacks) {
	    obj.callbacks = {}
	    for (var x=callbacks.length-1; x>=0; x--) {
		obj.callbacks[callbacks[x]] = []
	    }
	    
	    obj.addHook = function (hook) {
		if (!obj.callbacks[hook]) { obj.callbacks[hook] = [] }
	    }

	    obj.addCallback = function (hook, func) {
		obj.callbacks[hook].push(func)
	    }

        obj.removeCallback = function (hook, funcName) {
            for (var i=0;i<obj.callbacks[hook].length;i++){
                //alert(obj.callbacks[hook][i].name);
                if (obj.callbacks[hook][i].name==funcName){

                    obj.callbacks[hook].splice(i,1);
                    return true;
                }
            }
            return false; 
        }
	    obj.fireCallbacks = function (hook, args) {
		var newCallbacks = []
		var replaceCallbacks = []
		var len = obj.callbacks[hook].length
		for (var x=len-1; x>=0; x--) {
//		    tinfo('@@ Firing '+hook+' callback '+ obj.callbacks[hook][x])
		    if (obj.callbacks[hook][x].apply(obj,args)) {
			newCallbacks.push(obj.callbacks[hook][x])
		    }
		}

		for (var x=newCallbacks.length-1; x>=0; x--) {
		    replaceCallbacks.push(newCallbacks[x])
		}
		
		for (var x=len; x<obj.callbacks[hook].length; x++) {
		    replaceCallbacks.push(obj.callbacks[hook][x])
		}
		
		obj.callbacks[hook] = replaceCallbacks
	    }
	},
    
    /**
     * A standard way to create XMLHttpRequest objects
     */
	'XMLHTTPFactory': function () {
	    if (window.XMLHttpRequest) {
		try {
		    return new XMLHttpRequest()
		} catch (e) {
		    return false
		}
	    }
	    else if (window.ActiveXObject) {
		try {
		    return new ActiveXObject("Msxml2.XMLHTTP")
		} catch (e) {
		    try {
			return new ActiveXObject("Microsoft.XMLHTTP")
		    } catch (e) {
			return false
		    }
		}
	    }
	    else {
		return false
	    }
	},
    /**
     * Returns a hash of headers and values
     */
	'getHTTPHeaders': function (xhr) {
	    var lines = xhr.getAllResponseHeaders().split("\n")
	    var headers = {}
	    var last = undefined
	    for (var x=0; x<lines.length; x++) {
		if (lines[x].length > 0) {
		    var pair = lines[x].split(': ')
		    if (typeof pair[1] == "undefined") { // continuation
			headers[last] += "\n"+pair[0]
		    } else {
			last = pair[0].toLowerCase()
			headers[last] = pair[1]
		    }
		}
	    }
	    return headers
	},

        'dtstamp': function () {
	    var now = new Date();
	    var year  = now.getYear() + 1900;
	    var month = now.getMonth() + 1;
	    var day  = now.getDate() + 1;
	    var hour = now.getUTCHours();
	    var minute = now.getUTCMinutes();
	    var second = now.getSeconds();
	    if (month < 10) month = "0" + month;
	    if (day < 10) day = "0" + day;
	    if (hour < 10) hour = "0" + hour;
	    if (minute < 10) minute = "0" + minute;
	    if (second < 10) second = "0" + second;
	    return year + "-" + month + "-" + day + "T"
		+ hour + ":" + minute + ":" + second + "Z";
	},

        'enablePrivilege': netscape.security.PrivilegeManager.enablePrivilege,

        'disablePrivilege': netscape.security.PrivilegeManager.disablePrivilege
}
//================================================
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
//=====================================
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


function myFetcher(x, requestedBy) {
    if (x == null) {
        fyi("@@ SHOULD SYNC NOW") // what does this mean?
    } else {
        fyi("Fetcher: "+x)
        AJAR_handleNewTerm(kb, x, requestedBy)
    }
}

function matrixTD(obj, asImage, doc) {
	if(!doc)
	  doc=document;
    var td = doc.createElement('TD');
    if (!obj) var obj = new RDFLiteral(".");
    if  ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')) {
	td.setAttribute('about', obj.toNT());
	td.setAttribute('style', 'color:#4444ff');
    }
    
    var image;
    if (obj.termType == 'literal') {
	td.appendChild(doc.createTextNode(obj.value));
    } else if ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')){
	if (asImage) {
	    image = AJARImage(mapURI(obj.uri), label(obj), label(obj));
	    image.setAttribute('class', 'pic');
	    td.appendChild(image);
	} else {
	    td.appendChild(doc.createTextNode(label(obj)));
	}
    }
    return td;
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
	        if (aa) 
		        return kb.fromNT(aa)
		    else if (level.tagName=='TR') //this is to prevent literals passing through
		        return undefined
	    }
	    return undefined
	}
	
//////////////////////////////////////Source Utility

/**This is for .js that is not so important**/
function include(linkstr){
    var lnk = document.createElement('script');
    lnk.setAttribute('type', 'text/javascript');
    lnk.setAttribute('src', linkstr);
    document.getElementsByTagName('head')[0].appendChild(lnk);
    return lnk;
}
