//  Implementing URI-specific functions
//
//	See RFC 2386
//
// This is or was   http://www.w3.org/2005/10/ajaw/rdf/uri.js
// 2005 W3C open source licence
//
//
//  Take a URI given in relative or absolute form and a base
//  URI, and return an absolute URI
//
//  See also http://www.w3.org/2000/10/swap/uripath.py
//
function URIjoin(given, base) {
//    if (typeof fyi != 'undefined') fyi("   URI given="+given+" base="+base)
    if (given.length==0) return base // before chopping its filename off
    if (given.indexOf('#')==0) return base + given
    var colon = given.indexOf(':')
    if (colon >= 0) return given	// Absolute URI form overrides base URI
    var baseColon = base.indexOf(':')
    if (base<0) {alert("Invalid base URL "+ base); return given}
    var baseScheme = base.slice(0,baseColon+1)  // eg http:
    if (given.indexOf("//") == 0)     // Starts with //
	return baseScheme + given;
    if (base.indexOf('//', baseColon)==baseColon+1) {  // Any hostpart?
	var baseSingle = base.indexOf("/", baseColon+3)
    } else {
	var baseSingle = base.indexOf("/", baseColon+1)
    }
    if (baseSingle < 0) return baseScheme + given;
    if (given.indexOf('/') == 0)	// starts with / but not //
	return base.slice(0, baseSingle) + given

    var path = base.slice(baseSingle)
    var lastSlash = path.lastIndexOf("/")
    if (lastSlash <0) return baseScheme + given
    if ((lastSlash >=0) && (lastSlash < (path.length-1)))
	path = path.slice(0, lastSlash+1) // Chop trailing filename from base

    path = path + given
    while (path.match(/[^\/]*\/\.\.\//)) // must apply to result of prev
	path = path.replace( /[^\/]*\/\.\.\//, '') // ECMAscript spec 7.8.5
    path = path.replace( /\.\//g, '') // spec vague on escaping
    return base.slice(0, baseSingle) + path
}
 

//ends
