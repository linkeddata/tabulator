/**
 * Utility functions for tabulator
 */

function string_startswith(str, pref) { // missing library routines
    return (str.slice(0, pref.length) == pref);
}

/**
 * A function emulating Scheme's filter. Should have been part of JavaScript so
 * it is global.
 */
function filter(func, list) {
    //tabulator.log.debug("entered filter with list length=" + list.length);
    var output = [];
    for (var elt in list) {
	//tabulator.log.debug("elt=" + list[elt] + ", true? " + func(list[elt]));
	if (func(list[elt])) {
	    output.push(list[elt]);
	}
    } //construct output
    //tabulator.log.debug("exiting filter with list length=" + output.length);
    return output;
}

/** 
 * A function emulating Scheme's map. Should have been part of JavaScript so it
 * is global.
 */
function map(func, list) {
    //tabulator.log.debug("entered map with list=" + list.join(", "));
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
        obj.insertCallback=function (hook,func){
        obj.callbacks[hook].unshift(func);
        }
	    obj.fireCallbacks = function (hook, args) {
		var newCallbacks = []
		var replaceCallbacks = []
		var len = obj.callbacks[hook].length
//	    tabulator.log.info('!@$ Firing '+hook+' call back with length'+len);
		for (var x=len-1; x>=0; x--) {
//		    tabulator.log.info('@@ Firing '+hook+' callback '+ obj.callbacks[hook][x])
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
      if (isExtension) {
          return Components.
              classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
              createInstance().QueryInterface(Components.interfaces.nsIXMLHttpRequest);
      } else if (window.XMLHttpRequest) {
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

        'enablePrivilege': ((typeof netscape != 'undefined') && netscape.security.PrivilegeManager.enablePrivilege) || function() { return; },

        'disablePrivilege': ((typeof netscape != 'undefined') && netscape.security.PrivilegeManager.disablePrivilege) || function() { return; }
}
//================================================
function findLabelSubProperties() {
    var i,n
    tabulator.log.debug("rdfs:label subproperties:");
    var labelPredicates = kb.each(undefined, RDFS('subPropertyOf'), RDFS('label'));
    for (i=0, n=labelPredicates.length; i<n; i++) {
	if (labelPriority[labelPredicates[i].uri] == null) {
	    labelPriority[labelPredicates[i].uri] = 1
	}
	tabulator.log.debug("rdfs:label subproperty "+ labelPredicates[i]);
	
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

function escapeForXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
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
	if (lab =='type') return '...'; // Not "is type of"
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

function AJAR_handleNewTerm(kb, p, requestedBy) {
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

function myFetcher(x, requestedBy) {
    //tabulator.log.test('Entered myFetcher');
    if (x == null) {
        tabulator.log.debug("@@ SHOULD SYNC NOW") // what does this mean?
    } else {
        tabulator.log.debug("Fetcher: "+x)
        //tabulator.log.test('Fetcher: ' + x);
        AJAR_handleNewTerm(kb, x, requestedBy)
    }
}

// 
function matrixTD(arrayStatement, asImage, doc) {
    //alert (obj.termType);
    
    s = arrayStatement[0];//Added
    p = arrayStatement[1];//Added
    obj = arrayStatement[2];//Added
    
	if (!doc) doc=document;
    var td = doc.createElement('TD');
    if (!obj) var obj = new RDFLiteral(".");
    if  ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')) {
        td.setAttribute('s', s); //Added
        td.setAttribute('p', p); //Added
		td.setAttribute('about', obj.toNT());
		td.setAttribute('style', 'color:#4444ff');
    }
    var image;
    if (obj.termType == 'literal') {
        td.setAttribute('s', s); //Added
        td.setAttribute('p', p); //Added
        td.appendChild(doc.createTextNode(obj.value));
    } 
    else if ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')) {
        if (asImage) {
            image = AJARImage(mapURI(obj.uri), label(obj), label(obj));
            image.setAttribute('class', 'pic');
            td.appendChild(image);
        } 
        else {
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
	tabulator.log.debug("Click on: " + target.tagName)
	return target
}
	
	//////////////////////////////////// User Interface Events
	
function getAboutLevel(target) {
    var level
    for (level = target; level; level = level.parentNode) {
    tabulator.log.debug("Level "+level)
    var aa = level.getAttribute('about')
    if (aa) return level
    }
    return undefined
}

function ancestor(target, tagName) {
    var level
    for (level = target; level; level = level.parentNode) {
    tabulator.log.debug("looking for "+tagName+" Level: "+level+" "+level.tagName)
    if (level.tagName == tagName) return level;
    }
    return undefined
}

function getAbout(kb, target) {
    var level, aa
    for (level=target; level && (level.nodeType==1); level=level.parentNode) {
        tabulator.log.debug("Level "+level + ' '+level.nodeType)
        aa = level.getAttribute('about')
        if (aa) 
            return kb.fromNT(aa)
        else if (level.tagName=='TR') //this is to prevent literals passing through
            return undefined
    }
    return undefined
}

function getTerm(target){ //works only for <TD>
    var statementTr=ancestor(target,'TR');
    switch (target.className){
        case 'pred selected':
            return statementTr.AJAR_statement.predicate;
            break;
        case 'obj selected':
            if (!statementTr.AJAR_inverse)
                return statementTr.AJAR_statement.object;
            else
                return statementTr.AJAR_statement.subject;
            break;
        case 'selected': //header TD
            return getAbout(kb,target); //kb to be changed
    }
}
//////////////////////////////////////Source Utility

/**This is for .js that is not so important**/
function include(linkstr){

    var lnk = document.createElement('script');
    lnk.setAttribute('type', 'text/javascript');
    lnk.setAttribute('src', linkstr);
    //TODO:This needs to be fixed or no longer used.
    //document.getElementsByTagName('head')[0].appendChild(lnk);
    return lnk;
}

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

//////////////////////////////////View Utility
function findPos(obj) { //C&P from http://www.quirksmode.org/js/findpos.html
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

function getEyeFocus(element,instantly,isBottom,myWindow) {
    if (!myWindow) myWindow=window;
    var elementPosY=findPos(element)[1];
    var totalScroll=elementPosY-52-myWindow.scrollY; //magic number 52 for web-based version
    if (instantly){
        if (isBottom){
            myWindow.scrollBy(0,elementPosY+element.clientHeight-(myWindow.scrollY+myWindow.innerHeight));
            return;
        }            
        myWindow.scrollBy(0,totalScroll);
        return;
    }
    var id=myWindow.setInterval(scrollAmount,50);
    var times=0
    function scrollAmount(){
        myWindow.scrollBy(0,totalScroll/10);
        times++;
        if (times==10)
            myWindow.clearInterval(id);
    }
}

function AJARImage(src, alt, tt, doc) {
	if(!doc)
	    doc=document;
    if (!tt && Icon.tooltips[src])
        tt = Icon.tooltips[src];
    var image = doc.createElement('img');
    image.setAttribute('src', src);
    if (typeof alt != 'undefined')
        image.setAttribute('alt', alt);
    if (typeof tt != 'undefined')
        image.setAttribute('title',tt);
    return image;
}

//returns an array containing x1,y1,x2,y2,etc for some uri
//http://blah.org/f.html?x1=y1&x2=y2, where results[x1]=y1
function getURIQueryParameters(uri){
    var results =new Array();
    var getDataString=new String(window.location);
    var questionMarkLocation=getDataString.search(/\?/);
    if (questionMarkLocation!=-1){
        getDataString=getDataString.substr(questionMarkLocation+1);
        var getDataArray=getDataString.split(/&/g);
        for (var i=0;i<getDataArray.length;i++){
            var nameValuePair=getDataArray[i].split(/=/);
            results[decodeURIComponent(nameValuePair[0])]=decodeURIComponent(nameValuePair[1]);
        }
    }
    return results;
}