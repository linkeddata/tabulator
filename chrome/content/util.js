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

