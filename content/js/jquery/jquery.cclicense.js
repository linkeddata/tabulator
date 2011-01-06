/*
 * jQuery CC License for rdfQuery @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.curie.js
 *  jquery.datatype.js
 *  jquery.rdf.js
 */
/*global jQuery */
(function ($) {

  var 
    cc = $.uri("http://creativecommons.org/ns#"),
    work = $.rdf.resource('<' + $.uri.base() + '>'),
    ccLicenseClass = $.rdf.resource('<' + cc + 'License>'),
    ccWorkClass = $.rdf.resource('<' + cc + 'Work>'),
    ccLicenseProp = $.rdf.resource('<' + cc + 'license>'),
    licenseRegex = /(?:^|\s)(?:(\S+):)?license(?:\s|$)/,
    
    gleaner = function (options) {
      var rel = this.attr('rel'),
        href = this.attr('href'),
        license,
        m = licenseRegex.exec(rel);
      if (href !== undefined && m !== null && (m[1] === undefined || this.xmlns(m[1]) === cc)) {
        if (options && options.about !== undefined) {
          if (options.about === null) {
            return true;
          } else {
            return options.about === $.uri.base() || options.about === href;
          }
        } else if (options && options.type !== undefined) {
          if (options.type === null) {
            return true;
          } else {
            return options.type === ccLicenseClass.value || options.type === ccWorkClass.value;
          }
        } else {
          license = $.rdf.resource('<' + href + '>');
          return [
            $.rdf.triple(work, $.rdf.type, ccWorkClass),
            $.rdf.triple(license, $.rdf.type, ccLicenseClass),
            $.rdf.triple(work, ccLicenseProp, license)
          ];
        }
      }
      return options === undefined ? [] : false;
    };

  $.fn.cclicense = function (triple) {
    if (triple === undefined) {
      var triples = $.map($(this), function (elem) {
        return gleaner.call($(elem));
      });
      return $.rdf({ triples: triples });
    } else {
      $(this)
        .filter('[href]') // only add to elements with href attributes
        .each(function () {
          var elem = $(this),
            rel = elem.attr('rel');
          if (rel === undefined || rel === '') {
            elem.attr('rel', 'license');
          } else if (!licenseRegex.test(rel)) {
            elem.attr('rel', rel + ' license');
          }
        });
      return this;
    }
  };

  $.rdf.gleaners.push(gleaner);

})(jQuery);
