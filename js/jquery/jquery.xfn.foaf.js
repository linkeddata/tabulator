/*
 * jQuery XFN for rdfQuery @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison, Libby Miller
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
    foaf = $.uri("http://xmlns.com/foaf/0.1/"),
    work = $.rdf.resource('<' + $.uri.base() + '>'),
    foafPersonClass = $.rdf.resource('<' + foaf + 'Person>'),
    foafKnowsProp = $.rdf.resource('<' + foaf + 'knows>'),
    foafWeblogProp = $.rdf.resource('<' + foaf + 'weblog>'),
    person1Bnode = $.rdf.blank("[]"),
    meRegex = /(?:^|\s)me(?:\s|$)/,

    gleaner = function (options) {

        var rel = this.attr('rel'),
        href = this.attr('href'),
        m = meRegex.exec(rel),
        person2Bnode = $.rdf.blank("[]");

        if (href !== undefined && m === null) {

            if (options && options.about !== undefined) {
                if (options.about === null) {
                    return true;
                } else {
                    return options.about === $.uri.base()  || options.about === href;
                }
            } else if (options && options.type !== undefined) {
                if (options.type === null) {
                    return true;
                } else {
                    return options.type === foafPersonClass.uri;
                }
            } else {
                return [
                    $.rdf.triple(person1Bnode, $.rdf.type, foafPersonClass),
                    $.rdf.triple(person1Bnode, foafWeblogProp, work),
                    $.rdf.triple(person1Bnode, foafKnowsProp, person2Bnode),
                    $.rdf.triple(person2Bnode, foafWeblogProp, '<' + href + '>'),
                    $.rdf.triple(person2Bnode, $.rdf.type, foafPersonClass)

                ];
            }
        }
        return options === undefined ? [] : false;
    };



    $.fn.xfn = function (relationship) { 
    //relationship e.g. 'friend' 'met' etc
        if (relationship === undefined) {
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
                    elem.attr('rel', relationship);
                } else if (!rel.toLowerCase().match(relationship.toLowerCase())) {
                    elem.attr('rel', rel + ' ' + relationship);
                }
            });
            return this;
        }
    };

    $.rdf.gleaners.push(gleaner);

})(jQuery);
