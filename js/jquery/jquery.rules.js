/*
 * jQuery RDF Rules @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 *  jquery.rdf.js
 */
/*global jQuery */
(function ($) {

  var
    blankNodeNum = 1;

/* Rulesets */

  $.rdf.ruleset = function (rules, options) {
    return new $.rdf.ruleset.fn.init(rules, options);
  };

  $.rdf.ruleset.fn = $.rdf.ruleset.prototype = {
    init: function (rules, options) {
      var opts = $.extend({}, $.rdf.ruleset.defaults, options);
      rules = rules || [];
      this.baseURI = opts.base;
      this.namespaces = $.extend({}, opts.namespaces);
      this.rules = [];
      for (i = 0; i < rules.length; i += 1) {
        this.add.apply(this, rules[i]);
      }
      return this;
    },
    
    base: function (uri) {
      if (uri === undefined) {
        return this.baseURI;
      } else {
        this.baseURI = uri;
        return this;
      }
    },
    
    prefix: function (prefix, uri) {
      if (prefix === undefined) {
        return this.namespaces;
      } else if (uri === undefined) {
        return this.namespaces[prefix];
      } else {
        this.namespaces[prefix] = uri;
        return this;
      }
    },
    
    size: function () {
      return this.rules.length;
    },
    
    add: function (lhs, rhs) {
      if (lhs.lhs) {
        rule = lhs;
      } else {
        rule = $.rdf.rule(lhs, rhs, { namespaces: this.prefix(), base: this.base() })
      }
      if ($.inArray(rule, this.rules) === -1) {
        this.rules.push(rule);
      }
      return this;
    },
    
    run: function (data, options) {
      var i, r, ntriples,
        opts = $.extend({ limit: 50 }, options),
        limit = opts.limit;
      do {
        ntriples = data.size();
        for (i = 0; i < this.rules.length; i += 1) {
          r = this.rules[i];
          r.run(data);
        }
        limit -= 1;
      } while (data.size() > ntriples && limit > 0)
      return this;
    }
  };
  
  $.rdf.ruleset.fn.init.prototype = $.rdf.ruleset.fn;
  
  $.rdf.ruleset.defaults = {
    base: $.uri.base(),
    namespaces: {}
  }

/* Rules */

  $.rdf.rule = function (lhs, rhs, options) {
    return new $.rdf.rule.fn.init(lhs, rhs, options);
  };

  $.rdf.rule.fn = $.rdf.rule.prototype = {
    init: function (lhs, rhs, options) {
      var opts = $.extend({}, $.rdf.rule.defaults, options),
        lhsWildcards = [], rhsBlanks = false;
      if (typeof lhs === 'string') {
        lhs = [lhs];
      }
      if (typeof rhs === 'string') {
        rhs = [rhs];
      }
      this.lhs = $.map(lhs, function (p) {
        if ($.isArray(p)) {
          return [p];
        } else if ($.isFunction(p)) {
          return p;
        } else {
          p = $.rdf.pattern(p, opts);
          if (typeof p.subject === 'string') {
            lhsWildcards.push(p.subject);
          }
          if (typeof p.property === 'string') {
            lhsWildcards.push(p.property);
          }
          if (typeof p.object === 'string') {
            lhsWildcards.push(p.object);
          }
          return p;
        }
      });
      lhsWildcards = $.unique(lhsWildcards);
      if ($.isFunction(rhs)) {
        this.rhs = rhs;
      } else {
        this.rhs = $.map(rhs, function (p) {
          p = $.rdf.pattern(p, opts);
          if ((typeof p.subject === 'string' && $.inArray(p.subject, lhsWildcards) === -1) ||
              (typeof p.property === 'string' && $.inArray(p.property, lhsWildcards) === -1) ||
              (typeof p.object === 'string' && $.inArray(p.object, lhsWildcards) === -1)) {
            throw "Bad Rule: Right-hand side of the rule contains a reference to an unbound wildcard";
          } else if (p.subject.type === 'bnode' || p.property.type === 'bnode' || p.object.type === 'bnode') {
            rhsBlanks = true;
          }
          return p;
        });
      }
      this.rhsBlanks = rhsBlanks;
      this.cache = {};
      return this;
    },
    
    run: function (data, options) {
      var query = $.rdf({ databank: data }), 
        condition,
        opts = $.extend({ limit: 50 }, options), limit = opts.limit,
        ntriples,
        i, pattern, s, p, o, q,
        blanks = this.rhsBlanks,
        cache, sources, triples, add;
      if (this.cache[data.id] === undefined) {
        this.cache[data.id] = {};
      }
      for (i = 0; i < this.lhs.length; i += 1) {
        condition = this.lhs[i];
        if ($.isArray(condition)) {
          query = query.filter.apply(query, condition);
        } else if ($.isFunction(condition)) {
          query = query.filter.call(query, condition);
        } else {
          query = query.where(this.lhs[i]);
        }
      }
      do {
        ntriples = query.length;
        sources = query.sources();
        for (i = 0; i < ntriples; i += 1) {
          triples = sources[i];
          add = true;
          cache = this.cache[data.id];
          for (j = 0; j < triples.length; j += 1) {
            if (cache[triples[j]] === undefined) {
              cache[triples[j]] = {};
            } else if (j === triples.length - 1) {
              add = false;
            }
            cache = cache[triples[j]];
          }
          if (add) {
            q = query.eq(i);
            if (blanks) {
              for (j = 0; j < this.rhs.length; j += 1) {
                pattern = this.rhs[j];
                s = pattern.subject;
                p = pattern.property;
                o = pattern.object;
                if (s.type === 'bnode') {
                  s = $.rdf.blank('' + s + blankNodeNum);
                }
                if (p.type === 'bnode') {
                  p = $.rdf.blank('' + p + blankNodeNum);
                }
                if (o.type === 'bnode') {
                  o = $.rdf.blank('' + o + blankNodeNum);
                }
                pattern = $.rdf.pattern(s, p, o);
                q.add(pattern);
              }
              blankNodeNum += 1;
            } else if ($.isFunction(this.rhs)) {
              q.map(this.rhs);
            } else {
              for (j = 0; j < this.rhs.length; j += 1) {
                q.add(this.rhs[j]);
              }
            }
          }
        }
        limit -= 1;
      } while (query.length > ntriples && limit > 0)
      return this;
    }
  };

  $.rdf.rule.fn.init.prototype = $.rdf.rule.fn;

  $.rdf.rule.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  $.extend($.rdf.databank.fn, {
    reason: function (rule, options) {
      rule.run(this, options);
      return this;
    }
  });
  
  $.extend($.rdf.fn, {
    reason: function (rule, options) {
      rule.run(this.databank, options);
      return this;
    }
  });

})(jQuery);
