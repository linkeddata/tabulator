/*
 * jQuery RDF @VERSION
 * 
 * Copyright (c) 2008 Jeni Tennison
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *  jquery.uri.js
 *  jquery.xmlns.js
 *  jquery.datatype.js
 *  jquery.curie.js
 */
/*global jQuery */
(function ($) {

  var 
    memResource = {},
    memBlank = {},
    memLiteral = {},
    memTriple = {},
    memPattern = {},
    xsdNs = "http://www.w3.org/2001/XMLSchema#",
    rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfsNs = "http://www.w3.org/2000/01/rdf-schema#",
    uriRegex = /^<(([^>]|\\>)*)>$/,
    literalRegex = /^("""((\\"|[^"])*)"""|"((\\"|[^"])*)")(@([a-z]+(-[a-z0-9]+)*)|\^\^(.+))?$/,
    tripleRegex = /(("""((\\"|[^"])*)""")|("(\\"|[^"]|)*")|(<(\\>|[^>])*>)|\S)+/g,
    
    blankNodeSeed = databankSeed = new Date().getTime() % 1000,
    blankNodeID = function () {
      blankNodeSeed += 1;
      return 'b' + blankNodeSeed.toString(16);
    },
    
    databankID = function () {
      databankSeed += 1;
      return 'data' + databankSeed.toString(16); 
    },
    
    subject = function (subject, opts) {
      if (typeof subject === 'string') {
        try {
          return $.rdf.resource(subject, opts);
        } catch (e) {
          try {
            return $.rdf.blank(subject, opts);
          } catch (f) {
            throw "Bad Triple: Subject " + subject + " is not a resource: " + f;
          }
        }
      } else {
        return subject;
      }
    },
    
    property = function (property, opts) {
      if (property === 'a') {
        return $.rdf.type;
      } else if (typeof property === 'string') {
        try {
          return $.rdf.resource(property, opts);
        } catch (e) {
          throw "Bad Triple: Property " + property + " is not a resource: " + e;
        }
      } else {
        return property;
      }
    },
    
    object = function (object, opts) {
      if (typeof object === 'string') {
        try {
          return $.rdf.resource(object, opts);
        } catch (e) {
          try {
            return $.rdf.blank(object, opts);
          } catch (f) {
            try {
              return $.rdf.literal(object, opts);
            } catch (g) {
              throw "Bad Triple: Object " + object + " is not a resource or a literal " + g;
            }
          }
        }
      } else {
        return object;
      }
    },
    
    testResource = function (resource, filter, existing) {
      var variable;
      if (typeof filter === 'string') {
        variable = filter.substring(1);
        if (existing[variable] && existing[variable] !== resource) {
          return null;
        } else {
          existing[variable] = resource;
          return existing;
        }
      } else if (filter === resource) {
        return existing;
      } else {
        return null;
      }
    },
    
    findMatches = function (triples, pattern) {
      return $.map(triples, function (triple) {
        var bindings = pattern.exec(triple);
        return bindings === null ? null : { bindings: bindings, triples: [triple] };
      });
    },
    
    mergeMatches = function (existingMs, newMs, optional) {
      return $.map(existingMs, function (existingM, i) {
        var compatibleMs = $.map(newMs, function (newM) {
          // For newM to be compatible with existingM, all the bindings
          // in newM must either be the same as in existingM, or not
          // exist in existingM
          var isCompatible = true;
          $.each(newM.bindings, function (k, b) {
            if (!(existingM.bindings[k] === undefined ||
                  existingM.bindings[k] === b)) {
              isCompatible = false;
              return false;
            }
          });
          return isCompatible ? newM : null;
        });
        if (compatibleMs.length > 0) {
          return $.map(compatibleMs, function (compatibleM) {
            return {
              bindings: $.extend({}, existingM.bindings, compatibleM.bindings), 
              triples: $.unique(existingM.triples.concat(compatibleM.triples))
            };
          });
        } else {
          return optional ? existingM : null;
        }
      });
    },
    
    registerQuery = function (databank, query) {
      var s, p, o;
      if (query.filterExp !== undefined && !$.isFunction(query.filterExp)) {
        if (databank.union === undefined) {
          s = typeof query.filterExp.subject === 'string' ? '' : query.filterExp.subject;
          p = typeof query.filterExp.property === 'string' ? '' : query.filterExp.property;
          o = typeof query.filterExp.object === 'string' ? '' : query.filterExp.object;
          if (databank.queries[s] === undefined) {
            databank.queries[s] = {};
          }
          if (databank.queries[s][p] === undefined) {
            databank.queries[s][p] = {};
          }
          if (databank.queries[s][p][o] === undefined) {
            databank.queries[s][p][o] = [];
          }
          databank.queries[s][p][o].push(query);
        } else {
          $.each(databank.union, function (i, databank) {
            registerQuery(databank, query);
          });
        }
      }
    },
    
    resetQuery = function (query) {
      query.length = 0;
      query.matches = [];
      $.each(query.children, function (i, child) {
        resetQuery(child);
      });
      $.each(query.partOf, function (i, union) {
        resetQuery(union);
      });
    },
    
    updateQuery = function (query, matches) {
      if (matches.length > 0) {
        $.each(query.children, function (i, child) {
          leftActivate(child, matches);
        });
        $.each(query.partOf, function (i, union) {
          updateQuery(union, matches);
        });
        $.each(matches, function (i, match) {
          query.matches.push(match);
          Array.prototype.push.call(query, match.bindings);
        });
      }
    },
    
    leftActivate = function (query, matches) {
      var newMatches;
      if (query.union === undefined) {
        if (query.top || query.parent.top) {
          newMatches = query.alphaMemory;
        } else {
          matches = matches || query.parent.matches;
          if ($.isFunction(query.filterExp)) {
            newMatches = $.map(matches, function (match, i) {
              return query.filterExp.call(match.bindings, i, match.bindings, match.triples) ? match : null;
            });
          } else {
            newMatches = mergeMatches(matches, query.alphaMemory, query.filterExp.optional);
          }
        }
      } else {
        newMatches = $.map(query.union, function (q) {
          return q.matches;
        });
      }
      updateQuery(query, newMatches);
    },
    
    rightActivate = function (query, match) {
      var newMatches;
      if (query.filterExp.optional) {
        resetQuery(query);
        leftActivate(query);
      } else {
        if (query.top || query.parent.top) {
          newMatches = [match];
        } else {
          newMatches = mergeMatches(query.parent.matches, [match], false);
        }
        updateQuery(query, newMatches);
      }
    },
    
    addToQuery = function (query, triple) {
      var match, 
        bindings = query.filterExp.exec(triple);
      if (bindings !== null) {
        match = { triples: [triple], bindings: bindings };
        query.alphaMemory.push(match);
        rightActivate(query, match);
      }
    },
    
    removeFromQuery = function (query, triple) {
      query.alphaMemory.splice($.inArray(triple, query.alphaMemory), 1);
      resetQuery(query);
      leftActivate(query);
    },
    
    addToQueries = function (queries, triple) {
      $.each(queries, function (i, query) {
        addToQuery(query, triple);
      });
    },
    
    removeFromQueries = function (queries, triple) {
      $.each(queries, function (i, query) {
        removeFromQuery(query, triple);
      });
    },
    
    addToDatabankQueries = function (databank, triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object;
      if (databank.union === undefined) {
        if (databank.queries[s] !== undefined) {
          if (databank.queries[s][p] !== undefined) {
            if (databank.queries[s][p][o] !== undefined) {
              addToQueries(databank.queries[s][p][o], triple);
            }
            if (databank.queries[s][p][''] !== undefined) {
              addToQueries(databank.queries[s][p][''], triple);
            }
          }
          if (databank.queries[s][''] !== undefined) {
            if (databank.queries[s][''][o] !== undefined) {
              addToQueries(databank.queries[s][''][o], triple);
            }
            if (databank.queries[s][''][''] !== undefined) {
              addToQueries(databank.queries[s][''][''], triple);
            }
          }
        }
        if (databank.queries[''] !== undefined) {
          if (databank.queries[''][p] !== undefined) {
            if (databank.queries[''][p][o] !== undefined) {
              addToQueries(databank.queries[''][p][o], triple);
            }
            if (databank.queries[''][p][''] !== undefined) {
              addToQueries(databank.queries[''][p][''], triple);
            }
          }
          if (databank.queries[''][''] !== undefined) {
            if (databank.queries[''][''][o] !== undefined) {
              addToQueries(databank.queries[''][''][o], triple);
            }
            if (databank.queries[''][''][''] !== undefined) {
              addToQueries(databank.queries[''][''][''], triple);
            }
          }
        }
      } else {
        $.each(databank.union, function (i, databank) {
          addToDatabankQueries(databank, triple);
        });
      }
    },
    
    removeFromDatabankQueries = function (databank, triple) {
      var s = triple.subject,
        p = triple.property,
        o = triple.object;
      if (databank.union === undefined) {
        if (databank.queries[s] !== undefined) {
          if (databank.queries[s][p] !== undefined) {
            if (databank.queries[s][p][o] !== undefined) {
              removeFromQueries(databank.queries[s][p][o], triple);
            }
            if (databank.queries[s][p][''] !== undefined) {
              removeFromQueries(databank.queries[s][p][''], triple);
            }
          }
          if (databank.queries[s][''] !== undefined) {
            if (databank.queries[s][''][o] !== undefined) {
              removeFromQueries(databank.queries[s][''][o], triple);
            }
            if (databank.queries[s][''][''] !== undefined) {
              removeFromQueries(databank.queries[s][''][''], triple);
            }
          }
        }
        if (databank.queries[''] !== undefined) {
          if (databank.queries[''][p] !== undefined) {
            if (databank.queries[''][p][o] !== undefined) {
              removeFromQueries(databank.queries[''][p][o], triple);
            }
            if (databank.queries[''][p][''] !== undefined) {
              removeFromQueries(databank.queries[''][p][''], triple);
            }
          }
          if (databank.queries[''][''] !== undefined) {
            if (databank.queries[''][''][o] !== undefined) {
              removeFromQueries(databank.queries[''][''][o], triple);
            }
            if (databank.queries[''][''][''] !== undefined) {
              removeFromQueries(databank.queries[''][''][''], triple);
            }
          }
        }
      } else {
        $.each(databank.union, function (i, databank) {
          removeFromDatabankQueries(databank, triple);
        });
      }
    },
    
    createJson = function (triples) {
      var e = {},
        i, t, s, p;
      for (i = 0; i < triples.length; i += 1) {
        t = triples[i];
        s = t.subject.value.toString();
        p = t.property.value.toString();
        if (e[s] === undefined) {
          e[s] = {};
        }
        if (e[s][p] === undefined) {
          e[s][p] = [];
        }
        e[s][p].push(t.object.dump());
      }
      return e;
    },
    
    parseJson = function (data) {
      var s, subject, p, property, o, object, i, opts, triples = [];
      for (s in data) {
        if (s.substring(0, 2) === '_:') {
          subject = $.rdf.blank(s);
        } else {
          subject = $.rdf.resource('<' + s + '>');
        }
        for (p in data[s]) {
          property = $.rdf.resource('<' + p + '>');
          for (i = 0; i < data[s][p].length; i += 1) {
            o = data[s][p][i];
            if (o.type === 'uri') {
              object = $.rdf.resource('<' + o.value + '>');
            } else if (o.type === 'bnode') {
              object = $.rdf.blank(o.value);
            } else {
              // o.type === 'literal'
              if (o.datatype !== undefined) {
                object = $.rdf.literal(o.value, { datatype: o.datatype });
              } else {
                opts = {};
                if (o.lang !== undefined) {
                  opts.lang = o.lang;
                }
                object = $.rdf.literal('"' + o.value + '"', opts);
              }
            }
            triples.push($.rdf.triple(subject, property, object));
          }
        }
      }
      return triples;
    },
    
    addAttribute = function (parent, namespace, name, value) {
      var doc = parent.ownerDocument,
        a;
      if (namespace !== undefined && namespace !== null) {
        a = doc.createAttributeNS(namespace, name);
        a.nodeValue = value;
        parent.attributes.setNamedItemNS(a);
      } else {
        a = doc.createAttribute(name);
        a.nodeValue = value;
        parent.attributes.setNamedItem(a);
      }
      return parent;
    },
    
    createXmlnsAtt = function (parent, namespace, prefix) {
      if (prefix) {
        addAttribute(parent, 'http://www.w3.org/2000/xmlns/', 'xmlns:' + prefix, namespace);
      } else {
        addAttribute(parent, undefined, 'xmlns', namespace);
      }
      return parent;
    },
    
    createDocument = function (namespace, name) {
      var doc, xmlns, prefix;
      if (document.implementation &&
          document.implementation.createDocument) {
        doc = document.implementation.createDocument(namespace, name, null);
        if (namespace !== undefined && namespace !== null) {
          if (/:/.test(name)) {
            prefix = /([^:]+):/.exec(name)[1];
          }
          createXmlnsAtt(doc.documentElement, namespace, prefix);
        }
        return doc;
      } else {
        throw "Sorry, this doesn't work with non-standards-compliant browsers";
      }
    },
    
    appendElement = function (parent, namespace, name) {
      var doc = parent.ownerDocument,
        e;
      if (namespace !== undefined && namespace !== null) {
        e = doc.createElementNS(namespace, name);
      } else {
        e = doc.createElement(name);
      }
      parent.appendChild(e);
      return e;
    },
    
    appendText = function (parent, text) {
      var doc = parent.ownerDocument,
        t;
      t = doc.createTextNode(text);
      parent.appendChild(t);
      return parent;
    },
    
    appendXML = function (parent, xml) {
      var parser, doc, i, child;
      parser = new DOMParser();
      doc = parser.parseFromString('<temp>' + xml + '</temp>', 'text/xml');
      while (doc.documentElement.childNodes.length > 0) {
        parent.appendChild(doc.documentElement.childNodes[0]);
      }
      return parent;
    },
    
    createRdfXml = function (triples, options) {
      var doc = createDocument(rdfNs, 'rdf:RDF'),
        dump = createJson(triples),
        namespaces = options.namespaces || {},
        n, s, se, p, pe, i, v,
        m, local, ns, prefix;
      for (n in namespaces) {
        createXmlnsAtt(doc.documentElement, namespaces[n], n);
      }
      for (s in dump) {
        if (dump[s][$.rdf.type.value] !== undefined) {
          m = /(.+[#\/])([^#\/]+)/.exec(dump[s][$.rdf.type.value][0].value);
          ns = m[1];
          local = m[2];
          for (n in namespaces) {
            if (namespaces[n] === ns) {
              prefix = n;
              break;
            }
          }
          se = appendElement(doc.documentElement, ns, prefix + ':' + local);
        } else {
          se = appendElement(doc.documentElement, rdfNs, 'rdf:Description');
        }
        if (/^_:/.test(s)) {
          addAttribute(se, rdfNs, 'rdf:nodeID', s.substring(2));
        } else {
          addAttribute(se, rdfNs, 'rdf:about', s);
        }
        for (p in dump[s]) {
          if (p !== $.rdf.type.value.toString() || dump[s][p].length > 1) {
            m = /(.+[#\/])([^#\/]+)/.exec(p);
            ns = m[1];
            local = m[2];
            for (n in namespaces) {
              if (namespaces[n] === ns) {
                prefix = n;
                break;
              }
            }
            for (i = (p === $.rdf.type.value.toString() ? 1 : 0); i < dump[s][p].length; i += 1) {
              v = dump[s][p][i];
              pe = appendElement(se, ns, prefix + ':' + local);
              if (v.type === 'uri') {
                addAttribute(pe, rdfNs, 'rdf:resource', v.value);
              } else if (v.type === 'literal') {
                if (v.datatype !== undefined) {
                  if (v.datatype === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral') {
                    addAttribute(pe, rdfNs, 'rdf:parseType', 'Literal');
                    appendXML(pe, v.value);
                  } else {
                    addAttribute(pe, rdfNs, 'rdf:datatype', v.datatype);
                    appendText(pe, v.value);
                  }
                } else if (v.lang !== undefined) {
                  addAttribute(pe, 'http://www.w3.org/XML/1998/namespace', 'xml:lang', v.lang);
                  appendText(pe, v.value);
                } else {
                  appendText(pe, v.value);
                }
              } else {
                // blank node
                addAttribute(pe, rdfNs, 'rdf:nodeID', v.value.substring(2));
              }
            }
          }
        }
      }
      return doc;
    },
    
    parseRdfXmlSubject = function (elem, base) {
      var s, subject;
      if (elem.hasAttributeNS(rdfNs, 'about')) {
        s = elem.getAttributeNS(rdfNs, 'about');
        subject = $.rdf.resource('<' + s + '>', { base: base });
      } else if (elem.hasAttributeNS(rdfNs, 'ID')) {
        s = elem.getAttributeNS(rdfNs, 'ID');
        subject = $.rdf.resource('<#' + s + '>', { base: base });
      } else if (elem.hasAttributeNS(rdfNs, 'nodeID')) {
        s = elem.getAttributeNS(rdfNs, 'nodeID');
        subject = $.rdf.blank('_:' + s);
      } else {
        subject = $.rdf.blank('[]');
      }
      return subject;
    },
    
    parseRdfXmlDescription = function (elem, isDescription, base, lang) {
      var subject, p, property, o, object, reified, lang, i, j, li = 1,
        collection1, collection2, collectionItem, collectionItems = [],
        parseType, serializer, literalOpts = {}, oTriples, triples = [];
      lang = elem.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang') || lang;
      base = elem.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'base') || base;
      if (lang !== null && lang !== undefined && lang !== '') {
        literalOpts = { lang: lang };
      }
      subject = parseRdfXmlSubject(elem, base);
      if (isDescription && (elem.namespaceURI !== rdfNs || elem.localName !== 'Description')) {
        property = $.rdf.type;
        object = $.rdf.resource('<' + elem.namespaceURI + elem.localName + '>');
        triples.push($.rdf.triple(subject, property, object));
      }
      for (i = 0; i < elem.attributes.length; i += 1) {
        p = elem.attributes.item(i);
        if (p.namespaceURI !== undefined && 
            p.namespaceURI !== 'http://www.w3.org/2000/xmlns/' &&
            p.namespaceURI !== 'http://www.w3.org/XML/1998/namespace') {
          if (p.namespaceURI !== rdfNs) {
            property = $.rdf.resource('<' + p.namespaceURI + p.localName + '>');
            object = $.rdf.literal('"' + p.nodeValue + '"', literalOpts);
            triples.push($.rdf.triple(subject, property, object));
          } else if (p.localName === 'type') {
            property = $.rdf.type;
            object = $.rdf.resource('<' + p.nodeValue + '>', { base: base });
            triples.push($.rdf.triple(subject, property, object));
          }
        }
      }
      for (i = 0; i < elem.childNodes.length; i += 1) {
        p = elem.childNodes[i];
        if (p.nodeType === 1) {
          if (p.namespaceURI === rdfNs && p.localName === 'li') {
            property = $.rdf.resource('<' + rdfNs + '_' + li + '>');
            li += 1;
          } else {
            property = $.rdf.resource('<' + p.namespaceURI + p.localName + '>');
          }
          lang = p.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang') || lang;
          if (lang !== null && lang !== undefined && lang !== '') {
            literalOpts = { lang: lang };
          }
          if (p.hasAttributeNS(rdfNs, 'resource')) {
            o = p.getAttributeNS(rdfNs, 'resource');
            object = $.rdf.resource('<' + o + '>', { base: base });
          } else if (p.hasAttributeNS(rdfNs, 'nodeID')) {
            o = p.getAttributeNS(rdfNs, 'nodeID');
            object = $.rdf.blank('_:' + o);
          } else if (p.hasAttributeNS(rdfNs, 'parseType')) {
            parseType = p.getAttributeNS(rdfNs, 'parseType');
            if (parseType === 'Literal') {
              serializer = new XMLSerializer();
              o = serializer.serializeToString(p.getElementsByTagName('*')[0]);
              object = $.rdf.literal(o, { datatype: rdfNs + 'XMLLiteral' });
            } else if (parseType === 'Resource') {
              oTriples = parseRdfXmlDescription(p, false, base, lang);
              if (oTriples.length > 0) {
                object = oTriples[oTriples.length - 1].subject;
                triples = triples.concat(oTriples);
              } else {
                object = $.rdf.blank('[]');
              }
            } else if (parseType === 'Collection') {
              if (p.getElementsByTagName('*').length > 0) {
                for (j = 0; j < p.childNodes.length; j += 1) {
                  o = p.childNodes[j];
                  if (o.nodeType === 1) {
                    collectionItems.push(o);
                  }
                }
                collection1 = $.rdf.blank('[]');
                object = collection1;
                for (j = 0; j < collectionItems.length; j += 1) {
                  o = collectionItems[j];
                  oTriples = parseRdfXmlDescription(o, true, base, lang);
                  if (oTriples.length > 0) {
                    collectionItem = oTriples[oTriples.length - 1].subject;
                    triples = triples.concat(oTriples);
                  } else {
                    collectionItem = parseRdfXmlSubject(o);
                  }
                  triples.push($.rdf.triple(collection1, $.rdf.first, collectionItem));
                  if (j === collectionItems.length - 1) {
                    triples.push($.rdf.triple(collection1, $.rdf.rest, $.rdf.nil));
                  } else {
                    collection2 = $.rdf.blank('[]');
                    triples.push($.rdf.triple(collection1, $.rdf.rest, collection2));
                    collection1 = collection2;
                  }
                }
              } else {
                object = $.rdf.nil;
              }
            }
          } else if (p.hasAttributeNS(rdfNs, 'datatype')) {
            o = p.childNodes[0].nodeValue;
            object = $.rdf.literal(o, { datatype: p.getAttributeNS(rdfNs, 'datatype') });
          } else if (p.getElementsByTagName('*').length > 0) {
            for (j = 0; j < p.childNodes.length; j += 1) {
              o = p.childNodes[j];
              if (o.nodeType === 1) {
                oTriples = parseRdfXmlDescription(o, true, base, lang);
                if (oTriples.length > 0) {
                  object = oTriples[oTriples.length - 1].subject;
                  triples = triples.concat(oTriples);
                } else {
                  object = parseRdfXmlSubject(o);
                }
              }
            }
          } else if (p.childNodes.length > 0) {
            o = p.childNodes[0].nodeValue;
            object = $.rdf.literal('"' + o + '"', literalOpts);
          } else {
            oTriples = parseRdfXmlDescription(p, false, base, lang);
            if (oTriples.length > 0) {
              object = oTriples[oTriples.length - 1].subject;
              triples = triples.concat(oTriples);
            } else {
              object = $.rdf.blank('[]');
            }
          }
          triples.push($.rdf.triple(subject, property, object));
          if (p.hasAttributeNS(rdfNs, 'ID')) {
            reified = $.rdf.resource('<#' + p.getAttributeNS(rdfNs, 'ID') + '>', { base: base });
            triples.push($.rdf.triple(reified, $.rdf.subject, subject));
            triples.push($.rdf.triple(reified, $.rdf.property, property));
            triples.push($.rdf.triple(reified, $.rdf.object, object));
          }
        }
      }
      return triples;
    },
    
    parseRdfXml = function (doc) {
      var i, lang, d, triples = [];
      if (doc.documentElement.namespaceURI === rdfNs && doc.documentElement.localName === 'RDF') {
        lang = doc.documentElement.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang');
        base = doc.documentElement.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'base') || $.uri.base();
        for (i = 0; i < doc.documentElement.childNodes.length; i += 1) {
          d = doc.documentElement.childNodes[i];
          if (d.nodeType === 1) {
            triples = triples.concat(parseRdfXmlDescription(d, true, base, lang));
          }
        }
      } else {
        triples = parseRdfXmlDescription(doc.documentElement, true);
      }
      return triples;
    };
    
  $.typedValue.types['http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral'] = {
    regex: /^.*$/m,
    strip: false,
    value: function (v) {
      return v;
    }
  };

  // Trying to follow jQuery's general pattern, to get the same effect
  $.rdf = function (options) {
    return new $.rdf.fn.init(options);
  };

  $.rdf.fn = $.rdf.prototype = {
    rdfquery: '0.4',
    
    init: function (options) {
      var databanks;
      options = options || {};
      /* must specify either a parent or a union, otherwise it's the top */
      this.parent = options.parent;
      this.union = options.union;
      this.top = this.parent === undefined && this.union === undefined;
      if (this.union === undefined) {
        if (options.databank === undefined) {
          this.databank = this.parent === undefined ? $.rdf.databank(options.triples, options) : this.parent.databank;
        } else {
          this.databank = options.databank;
        }
      } else {
        databanks = $.map(this.union, function (query) {
          return query.databank;
        });
        databanks = $.unique(databanks);
        if (databanks[1] !== undefined) {
          this.databank = $.rdf.databank(undefined, { union: databanks });
        } else {
          this.databank = databanks[0];
        }
      }
      this.children = [];
      this.partOf = [];
      this.filterExp = options.filter;
      this.alphaMemory = [];
      this.matches = [];
      this.length = 0;
      if (this.filterExp !== undefined) {
        if (!$.isFunction(this.filterExp)) {
          registerQuery(this.databank, this);
          this.alphaMemory = findMatches(this.databank.triples(), this.filterExp);
        }
      }
      leftActivate(this);
      return this;
    },
    
    base: function (base) {
      if (base === undefined) {
        return this.databank.base();
      } else {
        this.databank.base(base);
        return this;
      }
    },
    
    prefix: function (prefix, namespace) {
      if (namespace === undefined) {
        return this.databank.prefix(prefix);
      } else {
        this.databank.prefix(prefix, namespace);
        return this;
      }
    },
    
    add: function (triple, options) {
      var query, databank;
      if (triple.rdfquery !== undefined) {
        if (triple.top) {
          databank = this.databank.add(triple.databank);
          query = $.rdf({ parent: this.parent, databank: databank });
          return query;
        } else if (this.top) {
          databank = triple.databank.add(this.databank);
          query = $.rdf({ parent: triple.parent, databank: databank });
          return query;
        } else if (this.union === undefined) {
          query = $.rdf({ union: [this, triple] });
          this.partOf.push(query);
          triple.partOf.push(query);
          return query;
        } else {
          this.union.push(triple);
          triple.partOf.push(this);
        }
      } else {
        if (typeof triple === 'string') {
          options = $.extend({}, { base: this.base(), namespaces: this.prefix(), source: triple }, options);
          triple = $.rdf.pattern(triple, options);
        }
        if (triple.isFixed()) {
          this.databank.add(triple.triple(), options);
        } else {
          query = this;
          this.each(function (i, data) {
            var t = triple.triple(data);
            if (t !== null) {
              query.databank.add(t, options);
            }
          });
        }
      }
      return this;
    },
    
    remove: function (triple, options) {
      if (typeof triple === 'string') {
        options = $.extend({}, { base: this.base(), namespaces: this.prefix() }, options);
        triple = $.rdf.pattern(triple, options);
      }
      if (triple.isFixed()) {
        this.databank.remove(triple.triple(), options);
      } else {
        query = this;
        this.each(function (i, data) {
          var t = triple.triple(data);
          if (t !== null) {
            query.databank.remove(t, options);
          }
        });
      }
      return this;
    },
    
    load: function (data, options) {
      this.databank.load(data, options);
      return this;
    },
    
    except: function (query) {
      return $.rdf({ databank: this.databank.except(query.databank) });
    },
    
    where: function (filter, options) {
      var query, base, namespaces, optional;
      options = options || {};
      if (typeof filter === 'string') {
        base = options.base || this.base();
        namespaces = $.extend({}, this.prefix(), options.namespaces || {});
        optional = options.optional || false;
        filter = $.rdf.pattern(filter, { namespaces: namespaces, base: base, optional: optional });
      }
      query = $.rdf($.extend({}, options, { parent: this, filter: filter }));
      this.children.push(query);
      return query;
    },
    
    optional: function (filter, options) {
      return this.where(filter, $.extend({}, options || {}, { optional: true }));
    },
    
    about: function (resource, options) {
      return this.where(resource + ' ?property ?value', options);
    },
    
    filter: function (property, condition) {
      var func, query;
      if (typeof property === 'string') {
        if (condition.constructor === RegExp) {
          func = function () {
            return condition.test(this[property].value);
          };
        } else {
          func = function () {
            return this[property].type === 'literal' ? this[property].value === condition : this[property] === condition;
          };
        }
      } else {
        func = property;
      }
      query = $.rdf({ parent: this, filter: func });
      this.children.push(query);
      return query;
    },

    select: function (bindings) {
      var s = [], i, j;
      for (i = 0; i < this.length; i += 1) {
        if (bindings === undefined) {
          s[i] = this[i];
        } else {
          s[i] = {};
          for (j = 0; j < bindings.length; j += 1) {
            s[i][bindings[j]] = this[i][bindings[j]];
          }
        }
      }
      return s;
    },

    describe: function (bindings) {
      var i, j, binding, resources = [];
      for (i = 0; i < bindings.length; i += 1) {
        binding = bindings[i];
        if (binding.substring(0, 1) === '?') {
          binding = binding.substring(1);
          for (j = 0; j < this.length; j += 1) {
            resources.push(this[j][binding]);
          }
        } else {
          resources.push(binding);
        }
      }
      return this.databank.describe(resources);
    },

    eq: function (n) {
      return this.filter(function (i) { 
        return i === n;
      });
    },

    reset: function () {
      var query = this;
      while (query.parent !== undefined) {
        query = query.parent;
      }
      return query;
    },

    end: function () {
      return this.parent;
    },

    size: function () {
      return this.length;
    },
    
    sources: function () {
      return $($.map(this.matches, function (match) {
        // return an array-of-an-array because arrays automatically get expanded by $.map()
        return [match.triples];
      }));
    },
    
    get: function (num) {
      return (num === undefined) ? $.makeArray(this) : this[num];
    },
    
    each: function (callback, args) {
      $.each(this.matches, function (i, match) {
        callback.call(match.bindings, i, match.bindings, match.triples);
      });
      return this;
    },
    
    map: function (callback) {
      return $($.map(this.matches, function (match, i) {
        // in the callback, "this" is the bindings, and the arguments are swapped from $.map()
        return callback.call(match.bindings, i, match.bindings, match.triples); 
  		}));
    },
    
    jquery: function () {
      return $(this);
    }
  };

  $.rdf.fn.init.prototype = $.rdf.fn;

  $.rdf.gleaners = [];
  
  $.rdf.dump = function (triples, opts) {
    var opts = $.extend({}, $.rdf.dump.defaults, opts || {}),
      format = opts.format;
    if (format === 'application/json') {
      return createJson(triples, opts);
    } else if (format === 'application/rdf+xml') {
      return createRdfXml(triples, opts);
    } else {
      throw "Unrecognised dump format: " + format + ". Expected application/json or application/rdf+xml.";
    }
  };
  
  $.rdf.dump.defaults = {
    format: 'application/json',
    namespaces: {}
  }
  
  $.fn.rdf = function () {
    var triples = [];
    if ($(this).length > 0) {
      triples = $(this).map(function (i, elem) {
        return $.map($.rdf.gleaners, function (gleaner) {
          return gleaner.call($(elem));
        });
      });
      return $.rdf({ triples: triples, namespaces: $(this).xmlns() });
    } else {
      return $.rdf();
    }
  };

  $.extend($.expr[':'], {
    
    about: function (a, i, m) {
      var j = $(a),
        resource = m[3] ? j.safeCurie(m[3]) : null,
        isAbout = false;
      $.each($.rdf.gleaners, function (i, gleaner) {
        isAbout = gleaner.call(j, { about: resource });
        if (isAbout) {
          return null;
        }
      });
      return isAbout;
    },
    
    type: function (a, i, m) {
      var j = $(a),
        type = m[3] ? j.curie(m[3]) : null,
        isType = false;
      $.each($.rdf.gleaners, function (i, gleaner) {
        if (gleaner.call(j, { type: type })) {
          isType = true;
          return null;
        }
      });
      return isType;
    }
    
  });


/*
 * Triplestores aka Databanks
 */

  $.rdf.databank = function (triples, options) {
    return new $.rdf.databank.fn.init(triples, options);
  };

  $.rdf.databank.fn = $.rdf.databank.prototype = {
    init: function (triples, options) {
      var i;
      triples = triples || [];
      options = options || {};
      this.id = databankID();
      if (options.union === undefined) {
        this.queries = {};
        this.tripleStore = {};
        this.objectStore = {};
        this.baseURI = options.base || $.uri.base();
        this.namespaces = $.extend({}, options.namespaces || {});
        for (i = 0; i < triples.length; i += 1) {
          this.add(triples[i]);
        }        
      } else {
        this.union = options.union;
      }
      return this;
    },
    
    base: function (base) {
      if (this.union === undefined) {
        if (base === undefined) {
          return this.baseURI;
        } else {
          this.baseURI = base;
          return this;
        }
      } else if (base === undefined) {
        return this.union[0].base();
      } else {
        $.each(this.union, function (i, databank) {
          databank.base(base);
        });
        return this;
      }
    },
  
    prefix: function (prefix, uri) {
      var namespaces = {};
      if (this.union === undefined) {
        if (prefix === undefined) {
          return this.namespaces;
        } else if (uri === undefined) {
          return this.namespaces[prefix];
        } else {
          this.namespaces[prefix] = uri;
          return this;
        }
      } else if (uri === undefined) {
        $.each(this.union, function (i, databank) {
          $.extend(namespaces, databank.prefix());
        });
        if (prefix === undefined) {
          return namespaces;
        } else {
          return namespaces[prefix];
        }
      } else {
        $.each(this.union, function (i, databank) {
          databank.prefix(prefix, uri);
        });
        return this;
      }
    },

    add: function (triple, options) {
      var base = (options && options.base) || this.base(),
        namespaces = $.extend({}, this.prefix(), (options && options.namespaces) || {}),
        databank;
      if (triple === this) {
        return this;
      } else if (triple.tripleStore !== undefined) {
        // merging two databanks
        if (this.union === undefined) {
          databank = $.rdf.databank(undefined, { union: [this, triple] });
          return databank;
        } else {
          this.union.push(triple);
          return this;
        }
      } else {
        if (typeof triple === 'string') {
          triple = $.rdf.triple(triple, { namespaces: namespaces, base: base, source: triple });
        }
        if (this.union === undefined) {
          if (this.tripleStore[triple.subject] === undefined) {
            this.tripleStore[triple.subject] = [];
          }
          if ($.inArray(triple, this.tripleStore[triple.subject]) === -1) {
            this.tripleStore[triple.subject].push(triple);
            if (triple.object.type === 'uri' || triple.object.type === 'bnode') {
              if (this.objectStore[triple.object] === undefined) {
                this.objectStore[triple.object] = [];
              }
              this.objectStore[triple.object].push(triple);
            }
            addToDatabankQueries(this, triple);
          }
        } else {
          $.each(this.union, function (i, databank) {
            databank.add(triple);
          });
        }
        return this;
      }
    },
    
    remove: function (triple, options) {
      var base = (options && options.base) || this.base(),
        namespaces = $.extend({}, this.prefix(), (options && options.namespaces) || {}),
        striples, otriples,
        databank;
      if (typeof triple === 'string') {
        triple = $.rdf.triple(triple, { namespaces: namespaces, base: base, source: triple });
      }
      striples = this.tripleStore[triple.subject];
      if (striples !== undefined) {
        striples.splice($.inArray(triple, striples), 1);
      }
      if (triple.object.type === 'uri' || triple.object.type === 'bnode') {
        otriples = this.objectStore[triple.object];
        if (otriples !== undefined) {
          otriples.splice($.inArray(triple, otriples), 1);
        }
      }
      removeFromDatabankQueries(this, triple);
      return this;
    },
    
    except: function (data) {
      var store = data.tripleStore,
        diff = [];
      $.each(this.tripleStore, function (s, ts) {
        var ots = store[s];
        if (ots === undefined) {
          diff = diff.concat(ts);
        } else {
          $.each(ts, function (i, t) {
            if ($.inArray(t, ots) === -1) {
              diff.push(t);
            }
          });
        }
      });
      return $.rdf.databank(diff);
    },
    
    triples: function () {
      var triples = [];
      if (this.union === undefined) {
        $.each(this.tripleStore, function (s, t) {
          triples = triples.concat(t);
        });
      } else {
        $.each(this.union, function (i, databank) {
          triples = triples.concat(databank.triples().get());
        });
        triples = $.unique(triples);
      }
      return $(triples);
    },
    
    size: function () {
      return this.triples().length;
    },
    
    describe: function (resources) {
      var i, r, t, rhash = {}, triples = [];
      while (resources.length > 0) {
        r = resources.pop();
        if (rhash[r] === undefined) {
          if (r.value === undefined) {
            r = $.rdf.resource(r);
          }
          if (this.tripleStore[r] !== undefined) {
            for (i = 0; i < this.tripleStore[r].length; i += 1) {
              t = this.tripleStore[r][i];
              triples.push(t);
              if (t.object.type === 'bnode') {
                resources.push(t.object);
              }
            }
          }
          if (this.objectStore[r] !== undefined) {
            for (i = 0; i < this.objectStore[r].length; i += 1) {
              t = this.objectStore[r][i];
              triples.push(t);
              if (t.subject.type === 'bnode') {
                resources.push(t.subject);
              }
            }
          }
          rhash[r] = true;
        }
      }
      return $.unique(triples);
    },
    
    dump: function (options) {
      options = $.extend({ namespaces: this.namespaces, base: this.base }, options || {});
      return $.rdf.dump(this.triples(), options);
    },
    
    load: function (data, options) {
      var i, triples;
      if (data.ownerDocument !== undefined) {
        triples = parseRdfXml(data);
      } else {
        triples = parseJson(data);
      }
      for (i = 0; i < triples.length; i += 1) {
        this.add(triples[i]);
      }
      return this;
    },
    
    toString: function () {
      return '[Databank with ' + this.size() + ' triples]';
    }
  };
  
  $.rdf.databank.fn.init.prototype = $.rdf.databank.fn;

/*
 * Patterns
 */

  $.rdf.pattern = function (subject, property, object, options) {
    var pattern, m;
    // using a two-argument version; first argument is a Turtle statement string
    if (object === undefined) { 
      options = property;
      m = $.trim(subject).match(tripleRegex);
      if (m.length === 3 || (m.length === 4 && m[3] === '.')) {
        subject = m[0];
        property = m[1];
        object = m[2];
      } else {
        throw "Bad Pattern: Couldn't parse string " + subject;
      }
    }
    if (memPattern[subject] && memPattern[subject][property] && memPattern[subject][property][object]) {
      return memPattern[subject][property][object];
    }
    pattern = new $.rdf.pattern.fn.init(subject, property, object, options);
    if (memPattern[pattern.subject] && 
        memPattern[pattern.subject][pattern.property] && 
        memPattern[pattern.subject][pattern.property][pattern.object]) {
      return memPattern[pattern.subject][pattern.property][pattern.object];
    } else {
      if (memPattern[pattern.subject] === undefined) {
        memPattern[pattern.subject] = {};
      }
      if (memPattern[pattern.subject][pattern.property] === undefined) {
        memPattern[pattern.subject][pattern.property] = {};
      }
      memPattern[pattern.subject][pattern.property][pattern.object] = pattern;
      return pattern;
    }
  };

  $.rdf.pattern.fn = $.rdf.pattern.prototype = {
    init: function (s, p, o, options) {
      var opts = $.extend({}, $.rdf.pattern.defaults, options);
      this.subject = s.toString().substring(0, 1) === '?' ? s : subject(s, opts);
      this.property = p.toString().substring(0, 1) === '?' ? p : property(p, opts);
      this.object = o.toString().substring(0, 1) === '?' ? o : object(o, opts);
      this.optional = opts.optional;
      return this;
    },
    
    fill: function (bindings) {
      var s = this.subject,
        p = this.property,
        o = this.object;
      if (typeof s === 'string' && bindings[s.substring(1)]) {
        s = bindings[s.substring(1)];
      }
      if (typeof p === 'string' && bindings[p.substring(1)]) {
        p = bindings[p.substring(1)];
      }
      if (typeof o === 'string' && bindings[o.substring(1)]) {
        o = bindings[o.substring(1)];
      }
      return $.rdf.pattern(s, p, o, { optional: this.optional });
    },
    
    exec: function (triple) {
      var binding = {};
      binding = testResource(triple.subject, this.subject, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.property, this.property, binding);
      if (binding === null) {
        return null;
      }
      binding = testResource(triple.object, this.object, binding);
      return binding;
    },
    
    isFixed: function () {
      return typeof this.subject !== 'string' && 
        typeof this.property !== 'string' && 
        typeof this.object !== 'string';
    },
    
    triple: function (bindings) {
      var t = this;
      if (!this.isFixed()) {
        t = this.fill(bindings);
      }
      if (t.isFixed()) {
        return $.rdf.triple(t.subject, t.property, t.object, { source: this.toString() });
      } else {
        return null;
      }
    },

    toString: function () {
      return this.subject + ' ' + this.property + ' ' + this.object;
    }
  };

  $.rdf.pattern.fn.init.prototype = $.rdf.pattern.fn;

  $.rdf.pattern.defaults = {
    base: $.uri.base(),
    namespaces: {},
    optional: false
  };

/*
 * Triples
 */

  $.rdf.triple = function (subject, property, object, options) {
    var triple, graph, m;
    // using a two-argument version; first argument is a Turtle statement string
    if (object === undefined) { 
      options = property;
      m = $.trim(subject).match(tripleRegex);
      if (m.length === 3 || (m.length === 4 && m[3] === '.')) {
        subject = m[0];
        property = m[1];
        object = m[2];
      } else {
        throw "Bad Triple: Couldn't parse string " + subject;
      }
    }
    graph = (options && options.graph) || '';
    if (memTriple[graph] && 
        memTriple[graph][subject] && 
        memTriple[graph][subject][property] && 
        memTriple[graph][subject][property][object]) {
      return memTriple[graph][subject][property][object];
    }
    triple = new $.rdf.triple.fn.init(subject, property, object, options);
    graph = triple.graph || '';
    if (memTriple[graph] &&
        memTriple[graph][triple.subject] && 
        memTriple[graph][triple.subject][triple.property] && 
        memTriple[graph][triple.subject][triple.property][triple.object]) {
      return memTriple[graph][triple.subject][triple.property][triple.object];
    } else {
      if (memTriple[graph] === undefined) {
        memTriple[graph] = {};
      }
      if (memTriple[graph][triple.subject] === undefined) {
        memTriple[graph][triple.subject] = {};
      }
      if (memTriple[graph][triple.subject][triple.property] === undefined) {
        memTriple[graph][triple.subject][triple.property] = {};
      }
      memTriple[graph][triple.subject][triple.property][triple.object] = triple;
      return triple;
    }
  };

  $.rdf.triple.fn = $.rdf.triple.prototype = {
    init: function (s, p, o, options) {
      var opts;
      opts = $.extend({}, $.rdf.triple.defaults, options);
      this.subject = subject(s, opts);
      this.property = property(p, opts);
      this.object = object(o, opts);
      this.graph = opts.graph === undefined ? undefined : subject(opts.graph, opts);
      this.source = opts.source;
      return this;
    },
    
    isFixed: function () {
      return true;
    },
    
    triple: function (bindings) {
      return this;
    },
    
    dump: function () {
      var e = {},
        s = this.subject.value.toString(),
        p = this.property.value.toString();
      e[s] = {};
      e[s][p] = this.object.dump();
      return e;
    },
    
    toString: function () {
      return this.subject + ' ' + this.property + ' ' + this.object + ' .';
    }
  };

  $.rdf.triple.fn.init.prototype = $.rdf.triple.fn;
  
  $.rdf.triple.defaults = {
    base: $.uri.base(),
    source: [document],
    namespaces: {}
  };

/*
 * Resources
 */ 

  $.rdf.resource = function (value, options) {
    var resource;
    if (memResource[value]) {
      return memResource[value];
    }
    resource = new $.rdf.resource.fn.init(value, options);
    if (memResource[resource]) {
      return memResource[resource];
    } else {
      memResource[resource] = resource;
      return resource;
    }
  };

  $.rdf.resource.fn = $.rdf.resource.prototype = {
    type: 'uri',
    value: undefined,
    
    init: function (value, options) {
      var m, prefix, uri, opts;
      if (typeof value === 'string') {
        m = uriRegex.exec(value);
        opts = $.extend({}, $.rdf.resource.defaults, options);
        if (m !== null) {
          this.value = $.uri.resolve(m[1].replace(/\\>/g, '>'), opts.base);
        } else if (value.substring(0, 1) === ':') {
          uri = opts.namespaces[''];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for default namespace in " + value;
          } else {
            this.value = $.uri.resolve(uri + value.substring(1));
          }
        } else if (value.substring(value.length - 1) === ':') {
          prefix = value.substring(0, value.length - 1);
          uri = opts.namespaces[prefix];
          if (uri === undefined) {
            throw "Malformed Resource: No namespace binding for prefix " + prefix + " in " + value;
          } else {
            this.value = $.uri.resolve(uri);
          }
        } else {
          try {
            this.value = $.curie(value, { namespaces: opts.namespaces });
          } catch (e) {
            throw "Malformed Resource: Bad format for resource " + e;
          }
        }
      } else {
        this.value = value;
      }
      return this;
    }, // end init
    
    dump: function () {
      return {
        type: 'uri',
        value: this.value.toString()
      };
    },
    
    toString: function () {
      return '<' + this.value + '>';
    }
  };

  $.rdf.resource.fn.init.prototype = $.rdf.resource.fn;
  
  $.rdf.resource.defaults = {
    base: $.uri.base(),
    namespaces: {}
  };

  $.rdf.type = $.rdf.resource('<' + rdfNs + 'type>');
  $.rdf.label = $.rdf.resource('<' + rdfsNs + 'label>');
  $.rdf.first = $.rdf.resource('<' + rdfNs + 'first>');
  $.rdf.rest = $.rdf.resource('<' + rdfNs + 'rest>');
  $.rdf.nil = $.rdf.resource('<' + rdfNs + 'nil>');
  $.rdf.subject = $.rdf.resource('<' + rdfNs + 'subject>');
  $.rdf.property = $.rdf.resource('<' + rdfNs + 'property>');
  $.rdf.object = $.rdf.resource('<' + rdfNs + 'object>');

  $.rdf.blank = function (value, options) {
    var blank;
    if (memBlank[value]) {
      return memBlank[value];
    }
    blank = new $.rdf.blank.fn.init(value, options);
    if (memBlank[blank]) {
      return memBlank[blank];
    } else {
      memBlank[blank] = blank;
      return blank;
    }
  };
  
  $.rdf.blank.fn = $.rdf.blank.prototype = {
    type: 'bnode',
    value: undefined,
    id: undefined,
    
    init: function (value, options) {
      if (value === '[]') {
        this.id = blankNodeID();
        this.value = '_:' + this.id;
      } else if (value.substring(0, 2) === '_:') {
        this.id = value.substring(2);
        this.value = value;
      } else {
        throw "Malformed Blank Node: " + value + " is not a legal format for a blank node";
      }
      return this;
    },
    
    dump: function () {
      return {
        type: 'bnode',
        value: this.value
      };
    },
    
    toString: function () {
      return '_:' + this.id;
    }
  };

  $.rdf.blank.fn.init.prototype = $.rdf.blank.fn;

  $.rdf.literal = function (value, options) {
    var literal;
    if (memLiteral[value]) {
      return memLiteral[value];
    }
    literal = new $.rdf.literal.fn.init(value, options);
    if (memLiteral[literal]) {
      return memLiteral[literal];
    } else {
      memLiteral[literal] = literal;
      return literal;
    }
  };

  $.rdf.literal.fn = $.rdf.literal.prototype = {
    type: 'literal',
    value: undefined,
    lang: undefined,
    datatype: undefined,
    
    init: function (value, options) {
      var 
        m, datatype,
        opts = $.extend({}, $.rdf.literal.defaults, options);
      if (opts.lang !== undefined && opts.datatype !== undefined) {
        throw "Malformed Literal: Cannot define both a language and a datatype for a literal (" + value + ")";
      }
      if (opts.datatype !== undefined) {
        datatype = $.safeCurie(opts.datatype, { namespaces: opts.namespaces });
        $.extend(this, $.typedValue(value.toString(), datatype));
      } else if (opts.lang !== undefined) {
        this.value = value.toString();
        this.lang = opts.lang;
      } else if (typeof value === 'boolean') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'boolean'));
      } else if (typeof value === 'number') {
        $.extend(this, $.typedValue(value.toString(), xsdNs + 'double'));
      } else if (value === 'true' || value === 'false') {
        $.extend(this, $.typedValue(value, xsdNs + 'boolean'));
      } else if ($.typedValue.valid(value, xsdNs + 'integer')) {
        $.extend(this, $.typedValue(value, xsdNs + 'integer'));
      } else if ($.typedValue.valid(value, xsdNs + 'decimal')) {
        $.extend(this, $.typedValue(value, xsdNs + 'decimal'));
      } else if ($.typedValue.valid(value, xsdNs + 'double') &&
                 !/^\s*([\-\+]?INF|NaN)\s*$/.test(value)) {  // INF, -INF and NaN aren't valid literals in Turtle
        $.extend(this, $.typedValue(value, xsdNs + 'double'));
      } else {
        m = literalRegex.exec(value);
        if (m !== null) {
          this.value = (m[2] || m[4]).replace(/\\"/g, '"');
          if (m[9]) {
            datatype = $.rdf.resource(m[9], opts);
            $.extend(this, $.typedValue(this.value, datatype.value));
          } else if (m[7]) {
            this.lang = m[7];
          }
        } else {
          throw "Malformed Literal: Couldn't recognise the value " + value;
        }
      }
      return this;
    }, // end init
    
    dump: function () {
      var e = {
        type: 'literal',
        value: this.value.toString()
      };
      if (this.lang !== undefined) {
        e.lang = this.lang;
      } else if (this.datatype !== undefined) {
        e.datatype = this.datatype.toString();
      }
      return e;
    },
    
    toString: function () {
      var val = '"' + this.value + '"';
      if (this.lang !== undefined) {
        val += '@' + this.lang;
      } else if (this.datatype !== undefined) {
        val += '^^<' + this.datatype + '>';
      }
      return val;
    }
  };

  $.rdf.literal.fn.init.prototype = $.rdf.literal.fn;
  
  $.rdf.literal.defaults = {
    base: $.uri.base(),
    namespaces: {},
    datatype: undefined,
    lang: undefined
  };

})(jQuery);
