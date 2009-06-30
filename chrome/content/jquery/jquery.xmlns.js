/*
 * jQuery CURIE @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 */
/*global jQuery */
(function ($) {

  var 
    xmlnsRegex = /\sxmlns(?::([^ =]+))?\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  $.fn.xmlns = function (prefix, uri, inherited) {
    var 
      elem = this.eq(0),
      ns = elem.data('xmlns'),
      e = elem[0], a, p, i,
      decl = prefix ? 'xmlns:' + prefix : 'xmlns',
      value,
      tag, found = false;
    if (uri === undefined) {
      if (prefix === undefined) { // get the in-scope declarations on the first element
        if (ns === undefined) {
          ns = {};
          if (e.outerHTML !== undefined) {
            tag = /<[^>]+>/.exec(e.outerHTML);
            a = xmlnsRegex.exec(tag);
            while (a !== null) {
              prefix = a[1] || '';
              value = a[2] || a[3];
              if (prefix === '' || value !== '') {
                ns[prefix] = $.uri(a[2] || a[3]);
                found = true;
              }
              a = xmlnsRegex.exec(tag);
            }
            xmlnsRegex.lastIndex = 0;
          } else {
            for (i = 0; i < e.attributes.length; i += 1) {
              a = e.attributes[i];
              if (/^xmlns(:(.+))?$/.test(a.nodeName)) {
                prefix = /^xmlns(:(.+))?$/.exec(a.nodeName)[2] || '';
                value = a.nodeValue;
                if (prefix === '' || value !== '') {
                  ns[prefix] = $.uri(a.nodeValue);
                  found = true;
                }
              }
            }
          }
          inherited = inherited || (e.parentNode.nodeType === 1 ? elem.parent().xmlns() : {});
          ns = found ? $.extend({}, inherited, ns) : inherited;
          elem.data('xmlns', ns);
        }
        return ns;
      } else if (typeof prefix === 'object') { // set the prefix mappings defined in the object
        for (p in prefix) {
          if (typeof prefix[p] === 'string') {
            this.xmlns(p, prefix[p]);
          }
        }
        this.find('*').andSelf().removeData('xmlns');
        return this;
      } else { // get the in-scope declaration associated with this prefix on the first element
        if (ns === undefined) {
          ns = elem.xmlns();
        }
        return ns[prefix];
      }
    } else { // set
      this.find('*').andSelf().removeData('xmlns');
      return this.attr(decl, uri);
    }
  };
  
  $.fn.removeXmlns = function (prefix) {
    var decl, p, i;
    if (typeof prefix === 'object') {
      if (prefix.length === undefined) { // assume an object representing namespaces
        for (p in prefix) {
          if (typeof prefix[p] === 'string') {
            this.removeXmlns(p);
          }
        }
      } else { // it's an array
        for (i = 0; i < prefix.length; i += 1) {
          this.removeXmlns(prefix[i]);
        }
      }
    } else {
      decl = prefix ? 'xmlns:' + prefix : 'xmlns';
      this.removeAttr(decl);
    }
    this.find('*').andSelf().removeData('xmlns');
    return this;
  };

  $.fn.qname = function (name) {
    var m, prefix, namespace;
    if (name === undefined) {
      if (this[0].outerHTML === undefined) {
        name = this[0].nodeName.toLowerCase();
      } else {
        name = /<([^ >]+)/.exec(this[0].outerHTML)[1].toLowerCase();
      }
    }
    if (name === '?xml:namespace') {
      // there's a prefix on the name, but we can't get at it
      throw "XMLinHTML: Unable to get the prefix to resolve the name of this element";
    }
    m = /^(([^:]+):)?([^:]+)$/.exec(name);
    prefix = m[2] || '';
    namespace = this.xmlns(prefix);
    if (namespace === undefined && prefix !== '') {
      throw "MalformedQName: The prefix " + prefix + " is not declared";
    }
    return {
      namespace: namespace,
      localPart: m[3],
      prefix: prefix,
      name: name
    };
  };

})(jQuery);
