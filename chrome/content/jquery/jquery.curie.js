/*
 * jQuery CURIE @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *	jquery.uri.js
 *  jquery.xmlns.js
 */
/*global jQuery */
(function ($) {
	
	$.curie = function (curie, options) {
		var 
			opts = $.extend({}, $.curie.defaults, options || {}),
			m = /^(([^:]*):)?(.+)$/.exec(curie),
			prefix = m[2],
			local = m[3],
			ns = opts.namespaces[prefix];
		if (prefix === "") { // This is the case of a CURIE like ":test"
		  if (opts.reservedNamespace === undefined || opts.reservedNamespace === null) {
		    throw "Malformed CURIE: No prefix and no default namespace for unprefixed CURIE " + curie;
		  } else {
  		  ns = opts.reservedNamespace;
		  }
		} else if (prefix) {
		  if (ns === undefined) {
  			throw "Malformed CURIE: No namespace binding for " + prefix + " in CURIE " + curie;
		  }
		} else {
		  if (opts.charcase === 'lower') {
		    curie = curie.toLowerCase();
		  } else if (opts.charcase === 'upper') {
		    curie = curie.toUpperCase();
		  }
  		if (opts.reserved.length && $.inArray(curie, opts.reserved) >= 0) {
  		  ns = opts.reservedNamespace;
  		  local = curie;
      } else if (opts.defaultNamespace === undefined || opts.defaultNamespace === null) {
  			// the default namespace is provided by the application; it's not clear whether
  			// the default XML namespace should be used if there's a colon but no prefix
  			throw "Malformed CURIE: No prefix and no default namespace for unprefixed CURIE " + curie;
  		} else {
  		  ns = opts.defaultNamespace;
  		}
		}
	  return $.uri(ns + local);
	};
	
	$.curie.defaults = {
		namespaces: {},
		reserved: [],
		reservedNamespace: undefined,
		defaultNamespace: undefined,
		charcase: 'preserve'
	};
	
	$.safeCurie = function (safeCurie, options) {
		var m = /^\[([^\]]+)\]$/.exec(safeCurie);
		return m ? $.curie(m[1], options) : $.uri(safeCurie);
	};
	
	$.createCurie = function (uri, options) {
		var opts = $.extend({}, $.curie.defaults, options || {}),
		  ns = opts.namespaces,
		  curie;
		uri = $.uri(uri).toString();
		$.each(ns, function (prefix, namespace) {
		  if (uri.substring(0, namespace.toString().length) === namespace.toString()) {
		    curie = prefix + ':' + uri.substring(namespace.toString().length);
		    return null;
		  }
		});
		if (curie === undefined) {
  		throw "No Namespace Binding: There's no appropriate namespace binding for generating a CURIE from " + uri;
		} else {
		  return curie;
		}
	};

	$.fn.curie = function (curie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.curie(curie, opts);
	};
	
	$.fn.safeCurie = function (safeCurie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.safeCurie(safeCurie, opts);
	};
	
	$.fn.createCurie = function (uri, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.createCurie(uri, opts);
	};

	$.fn.curie.defaults = {
		reserved: [
			'alternate', 'appendix', 'bookmark', 'cite', 'chapter', 'contents', 'copyright', 
			'first', 'glossary', 'help', 'icon', 'index', 'last', 'license', 'meta', 'next',
			'p3pv1', 'prev', 'role', 'section', 'stylesheet', 'subsection', 'start', 'top', 'up'
		],
		reservedNamespace: 'http://www.w3.org/1999/xhtml/vocab#',
		defaultNamespace: undefined,
		charcase: 'lower'
	};
	
	$.fn.safeCurie = function (safeCurie, options) {
		var opts = $.extend({}, $.fn.curie.defaults, { namespaces: this.xmlns() }, options || {});
		return $.safeCurie(safeCurie, opts);
	};

})(jQuery);
