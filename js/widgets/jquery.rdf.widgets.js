/**
 * @fileOverview Semantic Web Widget Library
 * @author <a href="mailto:jambo@mit.edu">Jim Hollenbach</a>
 * @license MIT License
 * @license GPL v2
 */

/**
 * @exports $ as jQuery
 */

/**
 * @name jQuery
 * @namespace The jQuery Javascript toolkit.
 */

/**
 * @name jQuery.rdfwidgets
 * @namespace Library functions for the widget library.
 */
jQuery.rdfwidgets = function($) {

    var CONVERT_BASE = "http://feelings.xvm.mit.edu/"

    var langs = {
        "en": true,
        "en-US":true
    };

    var widgets = {};
    var matchers = [];
    var loadFilters = [];
    var pendingSources = [];
    /**
     * @description Define a new widget for use in the library.
     * @param {String} name the namespaced name of the widget, eg. ui.mywidgetname
     * @param {Object} prototype the prototype class of the new widget.
     */
    $.rdfwidget = function( name, prototype ) {
        var namespace = name.split( "." )[ 0 ], fullName;
        var sname = name.split( "." )[ 1 ];
        fullName = namespace + "-" + sname;
        widgets[fullName] = {s:(':'+fullName),n:sname};

        var w = $.extend({}, $.RdfWidget.prototype, prototype);
        $.widget(name,w);
    };

    /**
     * @class
     * @description The base class for all SW Widgets.
     */
    $.RdfWidget = function(options, element) {


    };


    $.RdfWidget.prototype = {

        /**
         * @description Get a valid term given a string input by the user, according to the options the user provided to the widget such as prefixes.
         * @param {String | Object} term The string or Term object provided by the user.
         * @returns {Object} A Literal or NamedNode that matches the term supplied by the user.
         */
        _resource: function( term ) {
            return processResource( term, this.options );
        },

        /**
         * @description A function that is called whenever new data is loaded into the local store.
         * @param {Array} trips The new $rdf.Triples that were added to the store.
         */
        insertData: function( trips ) {
            if( !this.options.ignoreupdates ) {
                this.refresh();
            }
        },

        /**
         * @description Redraw the widget.
         */
        refresh: function() {},

        /**
         * @description A function that is called whenever new data is removed from the local store.
         * @param {Array} trips The new $rdf.Triples that were removed from the store.
         */
        deleteData: function( trips ) {
            if( !this.options.ignoreupdates ) {
                this.refresh();
            }
        },

        /**
         * @description Get a Matcher for the provided element.
         * @param {String | Object} [element=this.element] The element to draw into. Can be any valid argument to a jQuery constructor.
         * @param {Boolean} [norefresh=false] If true, this matcher will not refresh when new data is loaded.
         */
        _matcher: function( element, norefresh ) {
            return Matcher( (element ? element : this.element) , this.options, norefresh );
        }
    };

    /**
     * @class
     * @description a class for matching items.
     */
    var Matcher = function( element, opts, norefresh ) {
        var bindings = [{}]; // {"varname":somesymbol, "varname2":someliteral}
        var elt = $(element, document);
        var history = [];
        var cstring = "";
        var wstring = "";
        function processVar( s ) {
            if( (typeof s) === "string" ) {
                if( s.length > 0 && s.charAt(0) == "?" ) {
                    if( s.length > 1 ) {
                        return s.substring(1);
                    }
                    throw "invalid variable name: "+str;
                }
            }
            return null;
        }
        var m = /** @lends jQuery.rdfwidgets-Matcher.prototype */{
            /**
             * @description foobarbaz
             */
            match: function( s,p,o,optional ) {
                var s_v = processVar( s );
                var p_v = processVar( p );
                var o_v = processVar( o );

                var newBindings = [];
                var matches;
                for( var i=0; i < bindings.length; i++ ) {
                    var b = bindings[i]
                    matches = $.rdfwidgets.statementsMatching( s_v ? (b[s_v] ? b[s_v] : undefined) : processResource( s, opts ),
                                                               p_v ? (b[p_v] ? b[p_v] : undefined) : processResource( p, opts ),
                                                               o_v ? (b[o_v] ? b[o_v] : undefined) : processObject( o, opts ),
                                                               undefined, false, opts );
                    if( opts.filterduplicates ) {
                        matches = filterDuplicates( matches );
                    }
                    if( (!matches || (matches && matches.length === 0)) && optional ) {
                        var newvals = {};
                        if( s_v && !b[s_v] ) { newvals[s_v] = null }
                        if( p_v && !b[p_v] ) { newvals[p_v] = null }
                        if( o_v && !b[o_v] ) { newvals[o_v] = null }
                        newBindings.push( $.extend( {}, b, newvals ) );
                    } else {
                        for( var j=0; j < matches.length; j++ ) {
                            //use extend..
                            var newvals = {};
                            if( s_v && !b[s_v] ) { newvals[s_v] = matches[j].subject; }
                            if( p_v && !b[p_v] ) { newvals[p_v] = matches[j].predicate; }
                            if( o_v && !b[o_v] ) { newvals[o_v] = matches[j].object; }
                            newBindings.push( $.extend( {}, b, newvals ) );
                        }
                    }
                }
                bindings = newBindings;

                //build up query string..
                var pat = ""
                if( optional ) {
                    pat += " optional { ";
                }
                if( s_v ) {
                    pat += " " + s + " ";
                } else { pat += " " + processResource( s, opts ).toNT() + " ";
                }
                if( p_v ) {
                    pat += " " + p + " ";
                } else { pat += " " + processResource( p, opts ).toNT() + " ";
                }
                if( o_v ) {
                    pat += " " + o + " . ";
                } else {
                    pat += " " + processObject( o, opts ).toNT() + " . ";
                }
                if( optional ) {
                    pat += " } ";
                }
                if( !optional ) {
                    cstring += pat;
                }
                wstring += pat;
                history.push({f:this.match, args:[s,p,o,optional]});
                return this;
            },

            optional: function( s,p,o ) {
                return this.match( s,p,o,true );
            },

            filter: function( f ) {
                bindings = $.grep( bindings, f );
                history.push({f:this.filter, args:[f]});
                return this;
            },

            draw: function( template, element, justOne ) {
                var target = element ? $(element, document) : elt;
                var output = "";
                var temp;
                for( var i = 0; i < bindings.length && (!justOne || (justOne && i < 1 ) ); i++ ) {
                    temp = template;
                    for( x in bindings[i] ) {
                        temp = temp.replace( new RegExp("\\?"+x,"g"), (bindings[i][x] ? bindings[i][x].value : "None" ));
                        temp = temp.replace( new RegExp("\\@"+x,"g"), (bindings[i][x] ? doLabel( bindings[i][x] , opts ) : "None" ));
                    }
                    output += temp;
                }
                target.html( output );
                processHTMLWidgets( target );
                history.push({f:this.draw, args:[template, element, justOne]});
                return this;
            },

            page: function( template, perPage, element ) {
                //split bindings into ceil(bindings.length/perPage) pages.
                if( !perPage ) { perPage = 10 }
                //draw the first page, put listeners.
                var target = element ? $(element, document) : elt;
                var currentPage = 0;
                var area = $('<div class="rdfpagearea"></div>', document);
                var page = $('<div class="rdfpage"></div>', document);
                var left = $('<div style="float:left"><a href="#">&lt; Previous</a></div>', document);
                var center = $('<div style="clear:both"> </div>', document);
                var right = $('<div style="float:right"><a href="#">Next &gt;</a></div>', document);

                left.click( function( e ) {
                    e.preventDefault();
                    if( currentPage > 0 ) {
                        currentPage--;
                        drawPage( currentPage );
                    }
                });

                right.click( function( e ) {
                    e.preventDefault();
                    if( (currentPage+1)*perPage < bindings.length ) {
                        currentPage++;
                        drawPage( currentPage );
                    }
                });

                area.append( page );
                area.append( left );
                area.append( right );
                area.append( center );
                var drawPage = function( pnumber ) {

                    if( pnumber === 0 ) {
                        left.hide();
                        if( (pnumber+1)*perPage < bindings.length ) {
                            right.show();
                        } else {
                            right.hide();
                        }
                    } else if ( (pnumber+1)*perPage >= bindings.length ) {
                        left.show();
                        right.hide();
                    } else {
                        left.show();
                        right.show();
                    }

                    var output = "";
                    for( var i = pnumber * perPage; ( i < (pnumber+1)*perPage && (i < bindings.length) ); i++ ) {
                        temp = template;
                        for( x in bindings[i] ) {
                            temp = temp.replace( new RegExp("\\?"+x,"g"), (bindings[i][x] ? bindings[i][x].value : "None" ));
                            temp = temp.replace( new RegExp("\\@"+x,"g"), (bindings[i][x] ? doLabel( bindings[i][x] , opts ) : "None" ));
                        }
                        output += temp;
                    }
                    page.html( output );
                    processHTMLWidgets( target );
                }
                drawPage( currentPage );
                target.empty().append(area);
                history.push({f:this.page, args:[template, perPage, element]});
                return this;
            },

            replay: function() {
                bindings = [{}];
                cstring = "";
                wstring = "";
                var len = history.length;
                for( var i = 0; i < len; i++ ) {
                    history[i].f.apply( this, history[i].args );
                }
                if( len > 0 ) {
                    history = history.slice( len );
                }
            },

            reset: function() {
                elt.empty();
                bindings = [{}];
                history = [];
                cstring = "";
                wstring = "";
                return this;
            },

            query: function( uri ) {
                var q = "construct { " + cstring + " } where { "+ wstring +" }";
                q = escape( q );
                var u;
                if( uri.indexOf( "?" ) !== -1 ) {
                    u = uri + "&query="+q;
                } else {
                    u = uri + "?query="+q;
                }
                $.rdfwidgets.load( u );
            },

            bindings: function() {
                return $.extend( true, [], bindings );
            }
        };
        if( !norefresh ) {
            matchers.push( m );
        }
        return m;
    };

    function allSubClasses( uri, o ) {
        var s = processResource( uri, o );
        var c = {uri : s}
        var q = [ s ];
        while( q.length > 0 ) {
            var more = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/2000/01/rdf-schema#subClassOf"), q[0] );
            for( var i = 0; i < more.length; i++ ) {
                if( !c[more[i].uri] ) {
                    c[more[i].uri] = more[i];
                    q.push( more[i] );
                }
            }
            q = q.slice(1);
        }
        return c;
    }

    function allSubProperties( uri, o ) {
        var s = processResource( uri, o );
        var c = {uri : s}
        var q = [ s ];
        while( q.length > 0 ) {
            var more = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/2000/01/rdf-schema#subPropertyOf"), q[0] );
            for( var i = 0; i < more.length; i++ ) {
                if( !c[more[i].uri] ) {
                    c[more[i].uri] = more[i];
                    q.push( more[i] );
                }
            }
            q = q.slice(1);
        }
        return c;
    }

    function filterDuplicates( trips ) {
        var result = [];
        var used = {};
        for( var i = 0; i < trips.length; i++ ) {
            var hash = db.canon(trips[i].subject).toNT()+db.canon(trips[i].predicate).toNT()+(trips[i].object.termType==="literal" ? trips[i].object.value : db.canon(trips[i].object).toNT() );
            if( !used[hash] ) {
                result.push( trips[i] );
            }
            used[hash] = true;
        }
        return result;
    }

    function deleteData( trips ) {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            //w holds two fields:
            //w.s, a jquery selector for the widget, eg ":ui-rdflabel"
            //w.n, the name of the widget, eg "rdflabel"
            $(w.s, document)[w.n]("deleteData", trips);
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    function insertData( trips ) {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            //the following line is explained in deleteData, above.
            $(w.s, document)[w.n]("insertData", trips);
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    function refreshAll() {
        labelCache = {};
        imageCache = {};
        var w;
        for( x in widgets ) {
            w = widgets[x];
            $(w.s, document)[w.n]("refresh");
        }
        for( var i = 0; i < matchers.length; i++ ) {
            matchers[i].replay();
        }
    }

    var uriRegex = /^(https?):\/\/((?:[a-z0-9.-]|%[0-9A-F]{2}){3,})(?::(\d+))?((?:\/(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})*)*)(?:\?((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?(?:#((?:[a-z0-9-._~!$&'()*+,;=:\/?@]|%[0-9A-F]{2})*))?$/i;
    //var uriRegex = /^(([a-z][\-a-z0-9+\.]*):)?(\/\/([^\/?#]+))?([^?#]*)?(\?([^#]*))?(#(.*))?$/i; // '

    function validURI( str ) {
        m = str.match(uriRegex);
        if( m === null ) {
            return false;
        }
        return true;
    }

    var docpart = $rdf.Util.uri.docpart
    var join = $rdf.Util.uri.join

    function randomID() {
        return "rdfwidget"+Math.floor(Math.random()*100000000).toString();
    }

    var SW_PREFIX = "http://dig.csail.mit.edu/2009/swjs#";

    var db = new $rdf.IndexedFormula();

    var requestedURIs = {};
    var endpoints = {};
    var selectedElement = null;
    var labelCache = {};
    var defaultEndpoint = window.location;
    var defaultUser = null;
    var defaultFriend = null;
    var sourceNames = {};
    var loadedSources = {};
    function finishLoads() {
        $.each( db.statementsMatching( undefined, db.sym( SW_PREFIX+"data" ), undefined ), function() {
            if( !requestedURIs[this.object.uri] ) {
                loadDataSource( this.object.uri, undefined, finishLoads );
            }
        });
    }

    function doneLoading( uri ) {
        pendingSources = $.grep(pendingSources, function( element ) {
            return element !== uri;
        });
        if( pendingSources.length === 0 ) {
            $(document, document).trigger('rdfloaded');
        }
    }

    function loadDataSource( uri, t, callback, originalURI ) {
        if( uri && !originalURI ) {
            pendingSources.push(docpart( uri ) );
        }
        var refresh = false;
        var decrement = false;
        if( (originalURI && requestedURIs[originalURI]) || (!originalURI && requestedURIs[docpart( uri )]) ) {
            refresh = true;
        }

        if(originalURI && originalURI.indexOf('https') === 0 ) {
            doneLoading( docpart( originalURI ) );
            return;
        }
        var format = (t === "application/json" ? "json" :
                      (t === "application/jsonp" ? "jsonp" :
                       (t === "application/rdf+xml" ? "xml" :
                        ((t === "text/n3" || t === "text/turtle") ? "text" :
                         "text") ) ) );
        try {
            requestedURIs[docpart( uri )] = true;
            if( originalURI ) { requestedURIs[docpart( originalURI )] = true; }
            $.ajax({
                url: uri,
                beforeSend: function( xhr ) {
                    if( xhr.withCredentials !== undefined ) {
                        xhr.withCredentials = true;
                    }
                },
                timeout:5000,
                success: function( data, text, xhr ) {
                    var contenttype = t;
                    if( xhr ) {
                        contenttype = xhr.getResponseHeader("Content-Type").split(";")[0];
                        if( !contenttype ) {
                            contenttype = t;
                        }
                        format = (contenttype === "application/json" ? "json" :
                                  (contenttype === "application/jsonp" ? "jsonp" :
                                   (contenttype === "application/rdf+xml" ? "xml" :
                                    ((contenttype === "text/n3" || contenttype === "text/turtle") ? "text" :
                                     null) ) ) );
                    }
                    if( xhr && xhr.status >= 400  || ( !xhr && format !== "jsonp" ) ) {
                        doneLoading( originalURI ? docpart( originalURI ) : docpart( uri ) );
                        return;
                    }
                    if( (xhr && xhr.status === 0) || !format || ( !text && !originalURI ) || (!contenttype && !originalURI ) ) {
                        var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                        loadDataSource(converturi, "application/jsonp", callback, uri);
                        return;
                    }
                    var source = originalURI ? originalURI : uri;
                    if( refresh ) {
                        db.removeMany( undefined, undefined, undefined, db.sym( source ) );
                    }
                    var triples = [];
                    if( format === "json" || format === "jsonp" ) {
                        var parser = $rdf.jsonParser;
                        triples = parser.parseJSON( data, source, db );
                        if( originalURI ) {
                            loadedSources[originalURI] = originalURI;
                        } else {
                            loadedSources[uri] = uri;
                        }
                        if( !decrement ) { decrement = true; if( callback ) { callback(source, true); } }
                    } else if ( format === "xml" ) {
                        var p = new $rdf.RDFParser( db );
                        triples = p.parse( xhr.responseXML, source, source );
                        if( originalURI ) {
                            loadedSources[originalURI] = originalURI;
                        } else {
                            loadedSources[uri] = uri;
                        }
                        if( !decrement ) { decrement = true; if( callback ) { callback(source, true); } }
                    } else if ( format === "text" ) {
                        var u = originalURI ? originalURI : uri;
                        var p = new $rdf.N3Parser(db,db,u,u,null,null,"",null);
                        p.loadBuf( xhr.responseText );
                        loadedSources[u] = u;
                    }
                    doneLoading( originalURI ? docpart( originalURI ) : docpart( uri ) );
                    insertData( triples );
                },
                error: function(xhr) {
                    requestedURIs[docpart( uri )] = false;
                    if( !originalURI ) {
                        var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                        loadDataSource(converturi, "application/jsonp", callback, uri);
                    } else {
                        if( callback ) { callback( originalURI, false ); }
                        doneLoading( docpart( originalURI ) );
                    }
                },
                dataType: format
            });
        } catch(e) {
            /*                if (jQuery.browser.msie && window.XDomainRequest && !originalURI && uri.indexOf('https://') === 0 && "xml" === format ) {
            // Use Microsoft XDR
            var xdr = new XDomainRequest();
            xdr.open("get", uri);
            xdr.onload = function() {
            var source = originalURI ? originalURI : uri;
            var p = new $rdf.RDFParser( db );
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async="false";
            xmlDoc.loadXML(this.responseText);
            triples = p.parse( xmlDoc, source, source );
            if( originalURI ) {
            loadedSources[originalURI] = originalURI;
            } else {
            loadedSources[uri] = uri;
            }
            return;
            };
            xdr.send();
            return;
            } */
            if( !decrement ) { decrement = true; }
            if( !originalURI ) {
                requestedURIs[docpart( uri )] = false;
                var converturi = CONVERT_BASE+"?data-uri[]="+escape(uri)+"&input=&output=jsonp";
                loadDataSource(converturi, "application/jsonp", callback, uri);
            } else {
                callback( originalURI, false );
                doneLoading( docpart( originalURI ) );
            }
        }
    }

    function loadDataSources() {
        $('link', document).each( function() {
            if(this.href && "sw:data" === this.getAttribute("rel") ) {
                var uri = docpart( this.href );
                var name = this.getAttribute("name");
                if( name ) { sourceNames[name] = uri; }
                var endpoint = this.getAttribute("sw:endpoint");
                endpoints[uri] = endpoint;
                loadDataSource( uri, this.getAttribute("type"), finishLoads );
            } else if( this.href && "sw:endpoint" === this.getAttribute("rel") ) {
                var name = this.getAttribute("name");
                if( name ) { sourceNames[name] = uri; }
                defaultEndpoint = docpart( this.href );
            } else if( this.href && "sw:user" === this.getAttribute("rel") ) {
                defaultUser = this.href;
            }
        });
        return true;
    }

    //====================================
    // Widgets.
    //====================================

    var namespaces = {'foaf':'http://xmlns.com/foaf/0.1/',
                      'sioc':'http://rdfs.org/sioc/ns#',
                      'dc'  :'http://purl.org/dc/terms/',
                      'rdf' :'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                      'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
                      ''    :window.location};

    function processResource( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && v.termType ) {
            return v;
        }
        if( typeof( v ) === "string" && v.indexOf( '<' ) === 0 && v.lastIndexOf( '<' ) === 0 && v.indexOf( '>' ) === (v.length-1) ) {
            return db.sym( v.substr( 1, v.length-2 ) );
        }
        var index = v.indexOf( ':' );
        if( index !== -1 && v.indexOf( "://" ) !== index ) {
            var pfx = v.substr( 0, index );
            var base = o.namespaces ? ( (o.namespaces[pfx] !== undefined) ? o.namespaces[pfx] : namespaces[pfx] ) : namespaces[pfx];
            if( base ) {
                return db.sym( base + v.substr(index+1) );
            }
        }
        var sym = db.sym(v);
        return sym;
    }

    function processSourceFilter( f, o ) {
        if( !f ) { return null; }
        var r = {};
        for( var i = 0; i < f.length; i++ ) {
            var n = sourceNames[f[i]];
            r[ ( n ? n : processResource( f[i], o ).uri ) ] = true;
        }
        return r;
    }

    function processLiteral( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && "literal" === v.termType) {
            return v;
        }
        var lit = db.literal( v );
        return lit;
    }

    function processObject( v, o ) {
        if( v === null || v === undefined ) { return null; }
        if( typeof( v ) === "object" && v.termType ) {
            return v;
        }
        var object;
        if( validURI ( v ) || (v.indexOf('"') !== 0 && v.indexOf(':') !== -1) ) {
            object = processResource( v, o );
        } else {
            object = processLiteral( v, o );
        }
        return object;
    }

    function processEditTerm( o ) {
        if( o.editTerm ) {
            return o.editTerm;
        }
        if( o.subject && o.predicate && o.object ) {
            o.editTerm = "object";
            return o.editTerm;
        } else if ( o.object && o.predicate ) {
            o.editTerm = "subject";
            return o.editTerm;
        }  else if ( o.subject && o.object ) {
            o.editTerm = "predicate";
            return o.editTerm;
        }  else if ( o.subject && o.predicate ) {
            o.editTerm = "object";
            return o.editTerm;
        }
        throw "Insufficient information provided to edit or view "+ o.editTerm +" term. S:"+o.subject+" P:"+o.predicate+" O:"+o.object;
    }

    function processGraph( o, subject ) {
        return o.graph ? o.graph : ( (o.acl && o.acl.graph) ? o.acl.graph : (subject ? subject : null ) );
    }

    function processACL( o, subject ) {
        var a = o.acl;
        var ACL_URI_BASE = "http://jambo.xvm.mit.edu/acl/";

        if( "string" === typeof(a) && validURI( a ) ) {
            return a;
        }
        if( "object" === typeof(a) ) {
            var graph = processGraph( o, subject );
            var user = a.user ? a.user : defaultUser;
            var friend = a.friend ? a.friend : defaultFriend;
            if( !graph ) { throw( "could not determine target graph for ACL." ); }
            if( !a.type ) {
                throw "no acl type provided:"+a;
            } else if( a.type === "permanent" ) {
                return ACL_URI_BASE+"permanent.n3?r="+escape(graph);
            } else if( a.type === "private-readonly" ) {
                if( !user ) { throw ("could not determine user for ACL"); }
                if( !friend ) { throw ("could not determine friend or group to be given read access for ACL"); }
                return ACL_URI_BASE+"private-readonly.n3?r="+escape(graph)+"&u="+escape(user)+"&f="+escape(friend);
            } else if( a.type === "private-editable" ) {
                if( !user ) { throw ("could not determine user for ACL"); }
                if( !friend ) { throw ("could not determine friend or group to be given read-write access for ACL"); }
                return ACL_URI_BASE+"private.n3?r="+escape(graph)+"&u="+escape(user)+"&f="+escape(friend);
            } else if( a.type === "public-editable" ) {
                return ACL_URI_BASE+"public.n3?r="+escape(graph);
            } else if( a.type === "public-readonly" ) {
                return ACL_URI_BASE+"public-readonly.n3?r="+escape(graph)+"&u="+escape(user);
            }
        }
        throw "unrecognized acl format:"+a;
    }

    function getMenuPredicateOptions( o ) {
        var props = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"), undefined, o );
        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];
        for( x in props ) {
            var binding = {};
            bindings.push( binding );
            var prop = props[x];
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }
        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }

    function getMenuNoOptions() {
        return {bindings:[],valueToURI:{},uriToValue:{}};
    }

    function getMenuUsedOptions( o ) {
        var used = new Array();
        used = $.rdfwidgets.statementsMatching( undefined ,  db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), o.type ? processObject(o.type) : undefined, undefined, false, o);

        used = filterDuplicates( used );

        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];

        for( x in used ) {
            var st = used[x];
            var prop;
            if( o.editTerm ) {
                prop = st[o.editTerm];
            }else if( !o.subject ) {
                prop = st.subject;
            } else if( !o.object ) {
                prop = st.object;
            } else if( !o.predicate ) {
                prop = st.predicate;
            }
            if( uriToValue[prop] || prop.termType === "bnode" ) {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }

        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }

    function getMenuInstanceOptions( o ) {
        var used = [];
        var ranges = [];

        if( o.predicate ) {
            if( $.rdfwidgets.whether(processResource( o.predicate, o ), db.sym("http://www.w3.org/2000/01/rdf-schema#range" ), db.sym("http://www.w3.org/2000/01/rdf-schema#Literal"), undefined, o ) ) {
                return {bindings:[],valueToURI:{},uriToValue:{}};
            }
            var p = allSubProperties( o.predicate, o );
            for( x in p ) {
                used = used.concat( $.rdfwidgets.statementsMatching( undefined, p[x], undefined, undefined, false, o ) );
                if( o.editTerm === "subject" ) {
                    ranges = ranges.concat($.rdfwidgets.each( p[x], db.sym("http://www.w3.org/2000/01/rdf-schema#domain"), undefined, undefined, o ));
                }else if( o.editTerm === "object" ) {
                    ranges = ranges.concat($.rdfwidgets.each( p[x], db.sym("http://www.w3.org/2000/01/rdf-schema#range"), undefined, undefined, o ));
                }
            }
        }

        var props = [];
        if( ranges.length > 0 ) {
            for( var i = 0; i < ranges.length; i++ ) {
                var r = allSubClasses( ranges[i], o );
                for( x in r ) {
                    props = props.concat( $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), r[x], undefined, false, o) );
                }
            }
        } else {
            props = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), undefined, undefined, false, o );
        }


        var uriToValue = {};
        var valueToURI = {};
        var bindings = [];
        for( x in props ) {
            var st = props[x];
            var prop = st.subject;
            if( $.rdfwidgets.whether( st.subject, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" ), undefined, o ) || uriToValue[st.subject] || st.subject.termType === "bnode") {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }


        for( x in used ) {
            var st = used[x];
            var prop;
            if( o.editTerm === "subject" ) {
                prop = st.subject;
            } else {
                prop = st.object;
            }
            if( uriToValue[prop] || prop.termType === "bnode" ) {
                continue;
            }
            var binding = {};
            bindings.push( binding );
            var comment = $.rdfwidgets.any( prop, db.sym("http://www.w3.org/2000/01/rdf-schema#comment"), undefined, undefined, o );
            binding.uri = prop.uri;
            binding.value = doLabel( prop, o );

            if( comment ) {
                binding.comment = comment.value;
            } else  {
                binding.comment = prop.value;
            }

            binding.label = "<span title='"+binding.comment+" "+binding.uri+"'>"+binding.value+"</span>";
            valueToURI[binding.value] = prop;
            uriToValue[prop] = binding.value;
        }

        return {bindings:bindings, valueToURI:valueToURI, uriToValue:uriToValue};
    }


    /* find the endpoint that you should write to for a given data source */
    function getEndpoint( why, o ) {
        if( o.endpoint ) {
            return o.endpoint;
        } else if ( why && why.uri && endpoints[why] ) {
            return endpoints[why];
        } else if ( defaultEndpoint ) {
            return defaultEndpoint;
        } else {
            return window.location;
        }
    }

    function doInsert( triples, callback, o ){
        if( !triples || triples.length == 0 ) { callback( true, triples, null );return; }
        var endpoint = getEndpoint( triples[0], o );
        var queryString = "INSERT ";
        var postData = {};

        var graph;
        if( o.acl ) {
            postData['acl'] = processACL( o, triples[0].why.uri );
            graph = processGraph( o, triples[0].why.uri );
        } else {
            graph = processGraph( o );
        }
        if( graph ) {
            queryString += "INTO <" + graph + "> ";
        }

        queryString += " { ";
        for( x in triples ) { queryString += triples[x].toString(); }
        queryString += " } ";
        postData['query']=queryString;
        $.ajax({
            type:"POST",
            data:postData,
            url :endpoint,
            beforeSend: function( xhr ) {
                if( xhr.withCredentials !== undefined ) {
                    xhr.withCredentials = true;
                }
                if( o.beforeSubmit ) {
                    o.beforeSubmit( triples, xhr );
                }
            },
            success: function(data, stat, xhr) {
                var sp, d;
                if( ! data.childNodes ) {
                    callback( false, triples, xhr );
                }
                for( var i = 0; i < data.childNodes.length; i++ ) {
                    var sp = data.childNodes[i];
                    if( sp.nodeName === "sparql" ) {
                        for( var j = 0; j < sp.childNodes.length; j++ ) {
                            var d = sp.childNodes[j];
                            if( d.nodeName === "inserted" ) {
                                var val =$(d, document).text();
                                for( var t = 0; t < triples.length; t++ ) {
                                    db.add( triples[t].subject, triples[t].predicate, triples[t].object, triples[t].why );
                                }
                                callback( true, triples, xhr );
                                insertData( triples );
                                if( o.afterSubmit ) {
                                    o.afterSubmit( true, triples, xhr );
                                }
                                return;
                            }
                        }
                    }
                }
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, triples, xhr );
                }
            },
            error: function(xhr, t, err) {
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, null, xhr );
                }
            }
            //dataType:"xml"
        });
    }

    function doDelete( triples, callback, o ){
        if( !triples || triples.length == 0 ) { callback( true, triples, null );return; }
        var endpoint = getEndpoint( triples[0], o );
        var queryString = "DELETE ";
        var postData = {};
        var graph;
        if( o.acl ) {
            postData['acl'] = processACL( o, triples[0].why.uri );
            graph = processGraph( o, triples[0].why.uri );
        } else {
            graph = processGraph( o );
        }
        if( graph ) {
            queryString += "FROM <" + graph + "> ";
        }

        queryString += " { ";
        for( x in triples ) { queryString += triples[x].toString(); }
        queryString += " } ";
        postData['query']=queryString;

        $.ajax({
            type:"POST",
            data:postData,
            url :endpoint,
            beforeSend: function( xhr ) {
                if( xhr.withCredentials !== undefined ) {
                    xhr.withCredentials = true;
                }
                if( o.beforeSubmit ) {
                    o.beforeSubmit( triples, xhr );
                }
            },
            success: function(data, stat, xhr) {
                var sp, d;
                if( ! data.childNodes ) {
                    callback( false, triples, xhr );
                }
                for( var i = 0; i < data.childNodes.length; i++ ) {
                    var sp = data.childNodes[i];
                    if( sp.nodeName === "sparql" ) {
                        for( var j = 0; j < sp.childNodes.length; j++ ) {
                            var d = sp.childNodes[j];
                            if( d.nodeName === "deleted" ) {
                                var val =$(d, document).text();
                                for( var t = 0; t < triples.length; t++ ) {
                                    db.remove( triples[t] );
                                }
                                callback( true, triples, xhr );
                                deleteData( triples );
                                if( o.afterSubmit ) {
                                    o.afterSubmit( true, triples, xhr );
                                }
                                return;
                            }
                        }
                    }
                }
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, triples, xhr );
                }
            },
            error: function(xhr, stat, err) {
                callback( false, triples, xhr );
                if( o.afterSubmit ) {
                    o.afterSubmit( false, null, xhr );
                }
            }
            //dataType:"xml"
        });
    }

    //when i feel confident that its being implemented, this will use the w3c spec which allows multiple update actions in one query
    function doUpdate( triples, callback,  o ) {
        doDelete( triples['delete_triples'], function( success, t, xhr ) {
                if( success ) {
                    doInsert( triples['insert_triples'], callback, o );
                } else {
                    callback( false, t, xhr );
                }
            }, o );
    }

    function doLabel( term, o ) {
        if( labelCache[term] ) {
            return labelCache[term];
        }
        if( term.termType === "literal" ) {
            return term.value;
        }
        var label = null;
        var t = term.value;
        if( !t ) { return ""; }
        var p = db.sym( "http://www.w3.org/2000/01/rdf-schema#label" );
        //var pat = $.rdf.pattern( s,p,o );
        var r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
        if( r.length > 0 ) {
            for( var i = 0; i < r.length; i++ ) {
                if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                    label = r[i].object.toString();
                    break;
                }
            }
        }
        if( !label ) {
            p = db.sym("http://purl.org/dc/terms/title");
            r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
            if( r.length > 0 ) {
                for( var i = 0; i < r.length; i++ ) {
                    if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                        label = r[i].object.toString();
                        break;
                    }
                }
            }
        }
        if( !label ) {
            p = db.sym("http://xmlns.com/foaf/0.1/name");
            r = $.rdfwidgets.statementsMatching( term, p, undefined, undefined, false );
            if( r.length > 0 ) {
                for( var i = 0; i < r.length; i++ ) {
                    if( !r[i].lang || (r[i].lang && langs[r[i].lang]) ) {
                        label = r[i].object.toString();
                        break;
                    }
                }
            }
        }
        if( !label ) {
            var li = t.lastIndexOf( "#" );
            if( li !== -1 && li < t.length-2 ) {
                    label = t.substr(li+1);
            } else {
                li = t.lastIndexOf( "/" );
                if( (li > 0 && t[li-1] !== "/") && li < t.length-2 ) {
                    label = t.substr(li+1);
                } else {
                    label = t;
                }
            }
        }
        labelCache[term]=label;
        return label;
    }

    var imageProperties = null;
    var imageCache = {};

    function findImageProperties() {
        q = [db.sym("http://xmlns.com/foaf/0.1/depiction"),db.sym("http://dbpedia.org/property/img")/*,db.sym("http://xmlns.com/foaf/0.1/img")*/];
        imageProperties = {};
        var current = null;
        var sp = db.sym( "http://www.w3.org/2000/01/rdf-schema#subPropertyOf" );
        while( q.length > 0 ) {
            current = q[0];
            q = q.slice(1);
            if( imageProperties[current.value] ) {
                continue;
            } else {
                var extras = $.rdfwidgets.each( undefined, sp, current );
                for( var i = 0; i < extras.length; i++ ) {
                    if( !imageProperties[extras[i].value] ) {
                        q.push( extras[i] );
                    }
                }
                imageProperties[current.value] = 1;
            }
        }
    }



    function doImage( term, o ) {
        if( !imageProperties ) {
            findImageProperties();
        }

        var sts = $.rdfwidgets.statementsMatching( term,undefined,undefined,undefined,false,o );
        for( var i = 0; i < sts.length; i++ ) {
            if( imageProperties[sts[i].predicate.value] && sts[i].object.termType === "symbol" ) {
                imageCache[term.value] = sts[i].object;
                return sts[i].object;
            }
        }
        return null;
    }

    function isImage( term, o ) {
        if( !imageProperties ) {
            findImageProperties();
        }

        if( $.rdfwidgets.anyStatementMatching( term, db.sym( "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" ), db.sym( "http://xmlns.com/foaf/0.1/Image" ), undefined, o ) ) {
            return term;
        }

        var sts = $.rdfwidgets.statementsMatching( undefined, undefined, term, undefined, false, o );
        for( var i = 0; i < sts.length; i++ ) {
            if( imageProperties[sts[i].predicate.value] ) {
                return sts[i].object;
            }
        }
        return null;
    }

    function doAutocomplete( jq, o ) {
        var options;

        if( o.menuOptions !== null && o.menuOptions !== undefined ) {
            options = o.menuOptions;
        } else if( o.editTerm === "object" && $.rdfwidgets.whether(processResource( o.predicate, o ), db.sym("http://www.w3.org/2000/01/rdf-schema#range" ), db.sym("http://www.w3.org/2000/01/rdf-schema#Literal"), undefined, o ) ) {
            jq.bind("blur", function() { jq.trigger("autocompletechoice") } );
            return;
        } else if ( (o.editTerm === "object" || o.editTerm === "subject") ) {
            options = getMenuInstanceOptions( o );
        } else if ( o.editTerm === "predicate" ) {
            options = getMenuPredicateOptions( o );
        }  else {
            options = {bindings:[],valueToURI:{},uriToValue:{}};
        }
        var preds = options.bindings;
        var open = false;
        var passedUp = false;
        var selected = false;
        var lastSelect = null;

        function getEvent( val ) {
            //perform label-> uri OR uri -> label.
            if( lastSelect && lastSelect.value === jq.val() ) {
                return { type: "autocompletechoice", uri:lastSelect.uri,  input: jq.val(), label:lastSelect.value };
            } else if ( validURI( jq.val() ) ) {
                return { type: "autocompletechoice", uri:jq.val(), input: jq.val(), label:( options.uriToValue[ jq.val() ] ? options.uriToValue[ jq.val() ] : jq.val() ) };
            } else if ( options.valueToURI[jq.val()] ) {
                return { type: "autocompletechoice", uri: options.valueToURI[jq.val()],input: jq.val(),  label:jq.val() };
            } else if ( validURI( jq.val() ) ){
                return { type: "autocompletechoice", uri: jq.val(),input: jq.val(),  label:jq.val() };
            } else {
                return { type: "autocompletechoice", uri: null,input: jq.val(),  label:jq.val() };
            }
        }

        return jq.autocomplete("destroy").autocomplete({
                    source: preds,
                    open: function() {
                      open = true;
                      passedUp = false;
                      selected = false;
                    },
                    close: function() {
                      open = false;
                      if( passedUp && !selected ) {
                          var evt = getEvent( jq.val() );
                          if( evt.uri ) {
                              jq.data( "uri", evt.uri );
                              jq.data( "val", evt.input );
                          } else {
                              jq.data( "uri", null );
                              jq.data( "val", evt.input );
                          }
                          $(this, document).trigger( evt );
                      }
                    },
                    focus: function( e, ui ) {
                      lastSelect = ui.item;
                    },
                    select: function( e, ui ) {
                      selected = true;
                      lastSelect = ui.item;
                    }
               }).blur( function() {
                    if( !open ) {
                        var evt = getEvent( jq.val() );
                        if( evt.uri ) {
                            jq.data( "uri", evt.uri );
                            jq.data( "val", evt.input );
                        } else {
                            jq.data( "uri", null );
                            jq.data( "val", evt.input );
                        }
                        $(this, document).trigger( evt );
                    } else {
                        passedUp = true;
                    }
               });
    }

    function processTripleUpdate( term, original, o ) {
        var delete_triples = null;
        var insert_triples = null;
        if( o.editTerm === "subject" ) {
            var pred = processResource( o.predicate, o );
            var obj = processObject( o.object, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( original, pred, obj,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( term, pred, obj ) ];
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        } else if ( o.editTerm === "predicate" ) {
            var subj = processResource( o.subject, o );
            var obj = processObject( o.object, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( subj, original, obj,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( subj, term, obj ) ];
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        } else if ( o.editTerm === "object" ) {
            var subj = processResource( o.subject, o );
            var pred = processResource( o.predicate, o );
            if( original ) { delete_triples = $.rdfwidgets.statementsMatching( subj, pred, original,undefined,false,o ); }
            if( term ) {
                insert_triples = [ new $rdf.Statement( subj, pred, term ) ];
                if( delete_triples && delete_triples[0] && delete_triples[0].why ) { insert_triples[0].why = delete_triples[0].why; }
            }
        }
        if( !delete_triples ) { delete_triples = new Array(); }
        if( !insert_triples ) { insert_triples = new Array(); }
        return { delete_triples: delete_triples, insert_triples:insert_triples }
    }

    function setUnselected( element ) {
        if( element && element === selectedElement ) {
            selectedElement = null;
            element.removeClass( 'selected' );
        }
    }

    function setSelected( element, term ) {
        setUnselected( selectedElement );
        if( element ) {
            selectedElement = element;
            element.addClass( 'selected' );
            if( term ) {
                element.trigger( 'rdfselect', [term] );
            }
        }
    }

    function checkSelected( element ) {
        return element === selectedElement;
    }



    function addDelayedClickEvent( element  ) {
        var waiting = false;
        function firstClick( e ) {
            e.stopPropagation();
            if( !waiting ) {
                waiting = true;
                setSelected( element, element.label('getRDFValue'));
                setTimeout( function() {
                        waiting = false;
                        element.unbind( "click", firstClick );
                        element.bind( "click", secondClick );
                    }, 1000);
            }
        }
        function secondClick( e ) {
            e.stopPropagation();
            if( checkSelected( element ) ) {
                element.trigger( "delayedclick" );
            } else {
                element.bind( "click", firstClick );
                element.unbind( "click", secondClick );
                firstClick( e );
            }
        }
        element.bind( "click", firstClick );
    }
                                                                                                                                                                                                  /*    function addDelayedClickEvent( element  ) {
        function firstClick( e ) {
            e.stopPropagation();
            setSelected( element);
            element.trigger( "rdfselect",[element.rdflabel('getRDFValue')] );
            setTimeout( function() {
                    element.one( "click", secondClick );
                }, 1000);
        }
        function secondClick( e ) {
            e.stopPropagation();
            if( checkSelected( element ) ) {
                element.one( "click", firstClick );
                element.trigger( "delayedclick" );
            } else {
                firstClick( e );
            }
        }
        element.one( "click", firstClick );
        }*/


    /**
     * @name jQuery.prototype.edit
     * @description Draw a label that, when clicked twice, transforms into an editable text box for modifying a value in a triple.
     * @function
     * @param {String | Object} [options.subject] The resource to display an edit for OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.autocomplete=true] If false, no autocomplete menu will be displayed when the user is editing.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.edit", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            usetextarea:false,
            editable:"delayedclick"
        },
        _create: function() {
            this.originalSubject = this.options.subject;
            this.originalPredicate = this.options.predicate;
            this.originalObject = this.options.object;
            this.refresh();
        },
        reset: function() {
            this.element.edit('option','subject',this.originalSubject);
            this.element.edit('option','predicate',this.originalPredicate);
            this.element.edit('option','object',this.originalObject);
            refresh();
        },
        getTriple: function() {
            var o = this.options;
            var t = this.element.label( "getTriple" );
            if( t ) {
                return t;
            }
            if( o.subject && o.predicate && o.object ) {
                var trip = $.rdfwidgets.anyStatementMatching( processResource(o.subject,o),processResource(o.predicate,o),processObject(o.object,o), undefined, o );
                return trip ? trip : null;
            }
            return null;
        },

        refresh: function() {
            var acdone = false;
            var o = this.options;
            var element = this.element;
            processEditTerm( o );
            element.label(o);
            addDelayedClickEvent( element );
            if( false !== o.editable && "never" !== o.editable ) {
                var original = element.label("getRDFValue");
                var inputbox;
                function insertAC( e ) {
                    if( !inputbox ) {
                        if( o.usetextarea ) {
                            inputbox = $("<textarea class='rdfedit'></textarea>", document);
                        } else {
                            inputbox = $("<input style='margin:0; padding:0; border: 1px solid black;' class='rdfedit' type='text'></input>", document);
                        }
                    }
                    if( !acdone ) {
                        doAutocomplete( inputbox, o );
                    }
                    inputbox.width( element.width()-2 );
//                    if( o.usetextarea ) {
                    inputbox.height( element.height()-2 );
//                    }
                    if( element.edit('option','disabled')) {
                        element.one('delayedclick', insertAC );
                        return;
                    }
                    var oldText;
                    if( original ) {
                        inputbox.val(element.text());
                        oldText = element.text();
                    } else {
                        oldText = "";
                    }
                    element.empty().append( inputbox );
                    inputbox.select();
                    function insertLabel(e) {
                        var i = inputbox.val();
                        var choice;
                        var label;
                        if( i === "" || i === oldText ) {
                            element.empty().label(o).one('delayedclick', insertAC );
                            return;
                        }
                        if( !e.uri ) {
                            if( !o.autocomplete ) {
                                if( validURI( i ) ) {
                                    choice = processResource( i, o );
                                } else if ( o.editTerm === "object" ) {
                                    choice = processLiteral( i, o );
                                }
                            } else if (o.editTerm === "object" ) {
                                choice = processLiteral( i, o );
                            }
                            label = i;
                        } else {
                            label = e.label;
                            choice = processResource( e.uri, o );
                        }
                        if( choice ) {
                            var data = processTripleUpdate( choice, original, o );
                            doUpdate( data, function( success, foobar, xhr ) {
                                    if( success ) {
                                        element.edit("option",o.editTerm,choice.value);
                                        element.empty().label(o).one('delayedclick', insertAC );
                                        original = choice;
                                    } else {
                                        alert( "Sorry, the server responded to your edit request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                                        element.empty().label(o).one('delayedclick', insertAC );
                                    }
                                }, o);
                        } else {
                            alert( "Sorry, the input you provided was not valid. Please choose a menu option or enter a valid URL.");
                            inputbox.one("autocompletechoice", insertLabel );
                            inputbox.focus();
                        }
                    }
                    inputbox.one("autocompletechoice", insertLabel );
                    if( !o.autocomplete ) {
                        o.menuOptions = [];
                    }
                    inputbox.focus();
                }
                element.one('delayedclick', insertAC );
            }
        }
    });

    $.ui.edit.getter = "getTriple";

    /**
     * @name jQuery.prototype.tripleedit
     * @description Draw a series of editable boxes for editing each term in a single triple.
     * @function
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.autocomplete=true] If false, no autocomplete menu will be displayed.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.tripleedit", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            var o = this.options;
            if( o.subjectElement ) {
                $(o.subjectElement, document).edit('disable');
            }
            if( o.predicateElement ) {
                $(o.predicateElement, document).edit('disable');
            }
            if( o.objectElement ) {
                $(o.objectElement, document).edit('disable');
            }
        },

        enable: function() {
            var o = this.options;
            if( o.subjectElement ) {
                $(o.subjectElement, document).edit('enable');
            }
            if( o.predicateElement ) {
                $(o.predicateElement, document).edit('enable');
            }
            if( o.objectElement ) {
                $(o.objectElement, document).edit('enable');
            }
        },
        getTriple: function() {
            var o = this.options;
            if( o.subjectElement ) {
                return $(o.subjectElement, document).edit('getTriple');
            } else if( o.predicateElement ) {
                return $(o.predicateElement, document).edit('getTriple');
            } else if( o.objectElement) {
                return $(o.objectElement, document).edit('getTriple');
            }
            return null;
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            if( ! (o.subjectElement || o.predicateElement || o.objectElement)) {
                element.empty();
            }

            var beforeSubmit = function(data, xhr) {
                that.disable();
                if( o.beforeSubmit ) {
                    o.beforeSubmit( data, xhr );
                }
            }

            var afterSubmit = function(success, data, xhr) {
                if( success && data.insert_triples && data.insert_triples[0] ) {
                    element.tripleedit('option','subject',data.insert_triples[0].subject);
                    element.tripleedit('option','predicate',data.insert_triples[0].predicate);
                    element.tripleedit('option','object',data.insert_triples[0].object);
                }
                if( o.afterSubmit ) {
                    o.afterSubmit( success, data, xhr );
                }
                that.enable();
            }

            var subjectopts = {};
            var newopts = {editTerm:'subject',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( subjectopts, o, newopts );
            if( o.subjectElement === undefined ) {
                element.tripleedit('option','subjectElement',$('<div class="rdftripleedit"></div>', document));
                element.append( o.subjectElement );
            }

            var predopts = {};
            newopts = {editTerm:'predicate',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( predopts, o, newopts );
            if( o.predicateElement === undefined ) {
                element.tripleedit('option','predicateElement',$('<div class="rdftripleedit"></div>', document));
                element.append( o.predicateElement );
            }
            var objectopts = {};
            newopts = {editTerm:'object',beforeSubmit:beforeSubmit, afterSubmit:afterSubmit}
            $.extend( objectopts, o, newopts );
            if( o.objectElement === undefined ) {
                element.tripleedit('option','objectElement',$('<div class="rdftripleedit"></div>', document));
                element.append( o.objectElement );
            }
            if( o.subjectElement ) {
                $(o.subjectElement, document).edit(subjectopts);
            }
            if( o.predicateElement ) {
                $(o.predicateElement, document).edit(predopts);
            }
            if( o.objectElement ) {
                $(o.objectElement, document).edit(objectopts);
            }

        }

    });

    $.ui.tripleedit.getter = "getTriple";

    /**
     * @name jQuery.prototype.selecttable
     * @description Perform a SPARQL SELECT query with a set of properties and display the results in a table.
     * @function
     * @param {String | Object} [options.type] If specified, the required rdf:type of each result in the list.
     * @param {Array} [options.properties] If specified, the set of properties to be SELECTed for.
     * @param {Array} [options.requireall=true] If false, matches that bind at least one item in options.properties will be displayed.
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.selecttable", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            editable:true,
            autocomplete:true,
            subject:window.location,
            requireall:true,
            properties:[]
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;

            var optsArray = {};
            var properties = [];
            for( var i = 0; i < o.properties.length; i++ ) {
                properties.push( processResource( o.properties[i], o ) );
            }

            function doHeader( ) {
                var str = "<thead><tr class='rdfeditheader'><th></th>";
                for( var i = 0; i < properties.length; i++ ) {
                    var id = randomID();
                    var cell = "<div class='rdfeditheader' id='"+id+"'></div>";
                    var cellopts = {};
                    var tripopts = {subject: properties[i], predicate:null, object:null, selectable:false, editable:false};
                    $.extend( cellopts, o, tripopts );
                    optsArray[id]= cellopts;
                    td+=cell;
                    str += "<th class='rdfeditheader'>"+cell+"</th>";
                }
                str += "</tr></thead>";
                return str;
            }

            var html = "<table class='rdfselecttable'><tbody>";
            html += doHeader();
            if( o.type ) {
                var t = processResource( o.type, o );
                var subjects = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t,undefined, o );
                for( var i = 0; i < subjects.length; i++ ) {
                    var row = "<tr>";
                    var subject = subjects[i];
                    //todo: row header.
                    var id = randomID();
                    var td = "<td class='rdfeditheader'>";
                    var cell = "<div  class='rdfeditheader' id='"+id+"'></div>";
                    var cellopts = {};
                    var tripopts = {subject: subject, predicate:null, object:null, selectable:false, editable:false};
                    $.extend( cellopts, o, tripopts );
                    optsArray[id]= cellopts;
                    td += cell + "</td>";
                    row += td;
                    var fail = false;
                    for( var j = 0; j < properties.length; j++ ) {
                        td = "<td>";
                        var objects = $.rdfwidgets.each( subject, properties[j],undefined,undefined,o );
                        if( (!objects || objects.length == 0)) {
                            if( o.requireall ) {
                                fail = true;
                                break;
                            } else {
                                id = randomID();
                                cell = "<div id='"+id+"'></div>";
                                cellopts = {};
                                tripopts = {subject: subject, predicate:properties[j]};
                                $.extend( cellopts, o, tripopts );
                                optsArray[id] = cellopts;
                                td += cell;
                            }
                        }
                        for( var k = 0; k < objects.length; k++ ) {
                            id = randomID();
                            cell = "<div id='"+id+"'></div>";
                            cellopts = {};
                            tripopts = {subject: subject, predicate:properties[j], object:objects[k]};
                            $.extend( cellopts, o, tripopts );
                            optsArray[id] = cellopts;
                            td += cell;
                        }
                        td+="</td>";
                        row += td;
                    }
                    if( !o.requireall || !fail ) {
                        row += "</tr>";
                        html += row;
                    }
                }
            } else {
                var done = {};
                var total = 0;
                for( var h = 0; ((h < properties.length && !o.requireall) || (o.requireall && h < 1)) ; h++ ) {
                    var tempsubjects = $.rdfwidgets.statementsMatching( undefined, properties[h],undefined,undefined,false,o);
                    var subjects = [];
                    var count = total;
                    for( var y= 0; y < tempsubjects.length; y++ ) {
                        if( !done[tempsubjects[y].subject] ) {
                            subjects.push(tempsubjects[y].subject);
                            done[tempsubjects[y].subject]=true;
                            total++;
                        }
                    }
                    for( var i = 0; i < subjects.length; i++ ) {
                        var fail = false;
                        var row = "<tr>";
                        var subject = subjects[i];
                        //todo: row header.
                        var id = randomID();
                        var td = "<td class='rdfeditheader'>";
                        var cell = "<div class='rdfeditheader' id='"+id+"'></div>";
                        var cellopts = {};
                        var tripopts = {subject: subject, predicate:null, object:null, selectable:false, editable:false};
                        $.extend( cellopts, o, tripopts );
                        optsArray[id]= cellopts;
                        td += cell + "</td>";
                        row += td;
                        for( var j = 0; j < h; j++ ) {
                            row += "<td>";
                            id = randomID();
                            cell = "<div id='"+id+"'></div>";
                            cellopts = {};
                            tripopts = {subject: subject, predicate:properties[j]};
                            $.extend( cellopts, o, tripopts );
                            row+=cell+ "</td>";
                            optsArray[id] = cellopts;
                        }
                        for( var j = h; j < properties.length; j++ ) {
                            td = "<td>";
                            var objects = $.rdfwidgets.each( subject, properties[j],undefined,undefined,o );
                            if( (!objects || objects.length == 0)) {
                                if( o.requireall ) {
                                    fail = true;
                                    break;
                                } else {
                                    id = randomID();
                                    cell = "<div id='"+id+"'></div>";
                                    cellopts = {};
                                    tripopts = {subject: subject, predicate:properties[j]};
                                    $.extend( cellopts, o, tripopts );
                                    optsArray[id] = cellopts;
                                    td += cell;
                                }
                            }
                            for( var k = 0; k < objects.length; k++ ) {
                                id = randomID();
                                cell = "<div id='"+id+"'></div>";
                                cellopts = {};
                                tripopts = {subject: subject, predicate:properties[j], object:objects[k]};
                                $.extend( cellopts, o, tripopts );
                                optsArray[id] = cellopts;
                                td += cell;
                            }
                            td+="</td>";
                            row += td;
                        }
                        if( !o.requireall || !fail ) {
                            row += "</tr>";
                            html += row;
                        }
                    }
                }
            }
            html+= "</tbody></table>";
            element.bind( "rdfdelete", function( e ) {
                var triple = $(e.target, document).edit("getTriple");

                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) {
                        if( success ) {
                            var parent = $(e.target, document).parent();
                            $(e.target, document).remove();
                            if( parent.children().size() == 0 ) {
                                if( !o.requireall ) {
                                            id = randomID();
                                    cell = "<div id='"+id+"'></div>";
                                    cellopts = {};
                                    tripopts = {subject: triple.subject, predicate:triple.predicate};
                                    $.extend( cellopts, o, tripopts );
                                    optsArray[id] = cellopts;
                                    $(parent, document).append(cell);
                                    $('#'+id, document).edit( cellopts );
                                } else {
                                    parent.parent().remove();
                                }
                            }
                        } else {
                            alert( "Sorry, the triple could not be deleted. Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blanknodes is not yet supported." );
                }
            });
            element.html(html);

            $(element, document).find('div').each( function() {
                    var p = optsArray[this.id]
                        if( p ) {
                            if( p.editable ) {
                                $(this, document).edit( optsArray[this.id] );
                            } else {
                                $(this, document).label( optsArray[this.id] );
                            }
                        }
                });
            }
        });

    /**
     * @name jQuery.prototype.instancedropdown
     * @description Provide an autocomplete input that contains all instances of a given type.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] If provided, only instances of the given type will be displayed in the dropdown.  Otherwise, all instances in the local store are options.
     */
    $.rdfwidget("ui.instancedropdown", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );
            this.triples = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, false, o );
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var input = $("<input type='text'></input>", document);
            doAutocomplete( input, {menuOptions: getMenuUsedOptions( { type: o.type, sources:o.sources } ) } );
            input.bind( "autocompletechoice", function(e) {
                if( e.uri ) {
                    element.trigger( "rdfselect", [db.sym(e.uri)] );
                } else {
                    alert( "Please enter a valid menu selection." );
                }
            });
            element.empty().append( input );
        }
    });

    /**
     * @name jQuery.prototype.instancelist
     * @description Provide an list that contains all instances of a given type.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] The rdf:type to filter instances by.
     */
    $.rdfwidget("ui.instancelist", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            subject:window.location
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );
            this.triples = $.rdfwidgets.statementsMatching( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, false, o);
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var html = "<table class='rdfinstancelist'><tbody>";
            var ids = [];
            var id;
            for( var i = 0; i < this.triples.length; i++ ) {
                id = randomID();
                ids.push( id );
                html += "<tr><td id='"+id+"'></td></tr>";
            }
            html += "</tbody></table>";
            element.html(html);
            var opts,tripopts;
            for( var i = 0; i < ids.length; i++ ) {
                opts = {};
                tripopts = {subject: that.triples[i].subject, selectable:true};
                $.extend( opts, o, tripopts );
                $('#'+ids[i], document).label(opts);
            }
        }
    });

    /**
     * @name jQuery.prototype.checkbox
     * @description Let the user edit a triple by selecting which value(s) it takes on from a set of checkboxes.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of Terms that are made available to choose from as checkboxes.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.checkbox", {
        options: {
            namespaces:namespaces,
            showlinks:true,
            choices:[]
        },
        _create: function() {
            this.groupname = randomID();
            this.refresh();
        },

        disable: function() {
            this.element.find('input').attr('disabled','disabled');
        },

        enable: function() {
            this.element.find('input').attr('disabled',false);
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object") {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            processEditTerm( o );
            var choices = [];
            var used = {};
            var useda = [];
            var span = $('<span class="rdfcheckbox"></span>', document);
            if( o.editTerm === "object" ) {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processObject( o.choices[i], o ) ); }
            } else {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processResource( o.choices[i], o ) ); }
            }
            var exist = $.rdfwidgets.each( (o.editTerm!=="subject" ? processResource(o.subject,o) : undefined ), (o.editTerm!=="predicate" ? processResource(o.predicate,o) : undefined ), (o.editTerm!=="object" ? processObject(o.object,o) : undefined ), undefined, o );
            for( var i = 0; i < exist.length; i++ ) {
                choices.push( exist[i] );
            }
            function handleCheck(e) {
                e.preventDefault();
                var t = $(e.target, document);
                var selection = choices[Number($(this, document).val())];
                t.attr("disabled","disabled");
                var update = {insert_triples:[],delete_triples:[]};
                if( !t.attr("checked") ) {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = selection;
                    var st2 = $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object,undefined,o );
                    st = st2 ? st2 : st;
                    update.delete_triples.push( st );
                } else {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = selection;
                    update.insert_triples.push( st );
                }
                doUpdate( update, function( success, foobar, xhr ) {
                        if( success ) {
                            t.attr("checked",!t.attr("checked"));
                            t.attr("disabled",false);
                        } else {
                            t.attr("disabled",false);
                            alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o);
            }

            element.empty();
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[choices[i].value] ) {
                    var id = randomID();
                    var div = $('<div class="rdfcheckbox" ></div>', document);
                    var cb = $('<input type="checkbox" name="'+this.groupname+'" id="'+id+'" value="'+useda.length+'"></input>', document);
                    var label = $('<label for="'+id+'">'+doLabel(choices[i],o)+'</label>', document);
                    span.append(div);
                    div.append(cb);
                    div.append(label);
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = choices[i];
                    if( $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o ) ) {
                        cb.attr( "checked", "checked" );
                    }
                    cb.bind("click", handleCheck);
                    used[choices[i].value] = true;
                    useda.push(choices[i].value);
                }
            }
            element.append(span);
        }

    });

    /**
     * @name jQuery.prototype.radio
     * @description Let the user edit a triple by selecting which single value it takes on from a set of radio buttons.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of choices the user may choose from as a set of radio buttons.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.radio", {
        options: {
            namespaces:namespaces,

            showlinks:true,
            choices:[]
        },
        _create: function() {
            this.groupname = randomID();
            this.refresh();
        },

        disable: function() {
            this.element.find('input').attr('disabled','disabled');
        },

        enable: function() {
            this.element.find('input').attr('disabled',false);
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object") {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            that.currentChoice = null;
            processEditTerm( o );
            var initialValue;
            var choices = [];
            var used = {};
            var useda = [];
            var span = $('<span class="rdfradio"></span>', document);
            var temp = $.rdfwidgets.each( o.subject ? processResource( o.subject,o ) : undefined,
                                          o.predicate ? processResource( o.predicate,o ) : undefined,
                                          o.object ? processObject( o.object,o ) : undefined, undefined, o );
            if( temp && temp.length > 1 ) {
                element.checkbox( o );
                return;
            }
            if( o.editTerm === "object" ) {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processObject( o.choices[i], o ) ); }
            } else {
                for( var i = 0; i < o.choices.length; i++ ) { choices.push( processResource( o.choices[i], o ) ); }
            }

            if( temp && temp.length === 1 ) {
                initialValue = temp[0];
                that.currentChoice = initialValue;
                choices.push( temp[0] );
            } else {
                initialValue = null;
            }

            function handleCheck(e) {
                e.preventDefault();
                var selection = choices[Number($(this, document).val())];
                if( that.currentChoice && selection.value === that.currentChoice.value ) {
                    return;
                }
                element.find( "input" ).attr("disabled","disabled");
                var update = {insert_triples:[],delete_triples:[]};
                if( that.currentChoice ) {
                    var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                                 o.predicate ? processResource( o.predicate,o ) : undefined,
                                                 o.object ? processObject( o.object,o ) : undefined );
                    st[o.editTerm] = that.currentChoice;
                    var st2 = $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
                    st = st2 ? st2 : st;
                    update.delete_triples.push( st );
                }
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = selection;
                update.insert_triples.push( st );
                doUpdate( update, function( success, foobar, xhr ) {
                        if( success ) {
                            $(e.target, document).attr("checked","checked");
                            that.currentChoice = selection;
                            element.find( "input" ).attr("disabled",false);
                        } else {
                            element.find( "input" ).attr("disabled",false);
                            alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o);
            }

            element.empty();
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[choices[i].value]) {
                    var id = randomID();
                    var div = $('<div class="rdfradio"></div>', document);
                    var radio = $('<input class="rdfradio" type="radio" name="'+this.groupname+'" id="'+id+'" value="'+useda.length+'"></input>', document);
                    var label = $('<label for="'+id+'">'+doLabel(choices[i],o)+'</label>', document);
                    span.append(div);
                    div.append(radio);
                    div.append(label);
                    if( initialValue && choices[i].value === initialValue.value ) {
                        radio.attr("checked","checked");
                    }
                    used[choices[i].value] = true;
                    useda.push( choices[i].value );
                    radio.bind("click", handleCheck);
                }
            }
            element.append(span);
        },
        getTriple: function() {
            var o = this.options;
            if( this.currentChoice ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = this.currentChoice;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
        }

    });

    $.ui.radio.getter = "getTriple";

    /**
     * @name jQuery.prototype.combobox
     * @description Let the user edit a triple by selecting which single value it takes on from a combobox.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Array} [options.choices] The set of choices the user may choose from as dropdown items in a combo box.
     * @param {String | Object} [options.subject] The subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     */
    $.rdfwidget("ui.combobox", {
        options: {
            namespaces:namespaces,
            choices:[]
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            this.combo.attr( "disabled", "disabled" );
        },

        enable: function() {
            this.combo.attr( "disabled", false );
        },

        getTriple: function() {
            var o = this.options;
            var term = this.ids[this.current.val()];
            if( term && o.editTerm ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = term;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            processEditTerm( o );
            var ids = {};
            var opt, term, id;
            var process = (o.editTerm === "object") ? processObject : processResource;
            var combo = $('<select class="rdfcombobox"></select>', document);
            this.combo = combo;
            var initial = null;
            this.current = null;
            function addOption( str,hidden ) {
                term = process( str,o );
                id = randomID();
                if( !hidden ) {
                    ids[id] = term;
                }
                opt = $('<option value="'+id+'" title="'+term.value.toString()+'"'+(hidden?' style="display:none"':'')+'>'+doLabel(term, o)+'</option>', document);
                combo.append( opt );
                return opt;
            }
            this.current = addOption( "", true );
            var subject = ((o.editTerm === "subject") ? undefined : processResource(o.subject,o));
            var predicate = ((o.editTerm === "predicate") ? undefined : processResource(o.predicate,o));
            var object = ((o.editTerm === "object") ? undefined : processObject(o.object,o));
            var existing = $.rdfwidgets.each( subject,predicate,object,undefined,o );

            var used = {};
            var choices = [];
            for( var i = 0; i < o.choices.length; i++ ) {
                choices.push( process( o.choices[i], o ) );
            }

            if( existing ) {
                if( existing.length === 1 ) {
                    initial = existing[0].value;
                    choices.push( existing[0] );
                } else if (existing.length > 1) {
                    throw "Combobox functionality is only provided for patterns with a single value right now:"+existing;
                }
            }
            for( var i = 0; i < choices.length; i++ ) {
                if( !used[ choices[i].value ] ) {
                    used[choices[i].value] = true;
                    var opt = addOption( choices[i] );
                    if( choices[i].value === initial ) {
                        opt.attr("selected","selected");
                        this.current = opt;
                    }
                }
            }

            element.empty().append(combo);
            combo.change( function( e ) {
                old = ids[that.current.val()];
                var term = ids[e.target.value];
                var d = processTripleUpdate( term, old, o );
                combo.attr("disabled","disabled");
                doUpdate( d, function( success, foobar, xhr ) {
                    if( success ) {
                        that.current = $(e.target, document).find(":selected");
                    } else {
                        alert( "Sorry, the server responded to your request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        that.current.attr("selected","selected");
                    }
                    combo.attr( "disabled", false );
                }, o );
            });
            this.ids = ids;
        }
    });

    $.ui.combobox.getter = "getTriple";

    /**
     * @name jQuery.prototype.triplelist
     * @description Display the list of triples that match a given pattern.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] The subject of the statements to be matched.
     * @param {String | Object} [options.predicate] The predicate of the statements to be matched.
     * @param {String | Object} [options.object] The object of the statements to be matched.
     * @param {String | Object} [options.filterduplicates=false] Remove duplicate statements from multiple different data sources.
     */
    $.rdfwidget("ui.triplelist", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            filterduplicates:false
        },
        _create: function() {
            this.refresh();
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var table = $('<table class="triplelist"></table>', document);
            table.bind( "rdfdelete", function( e ) {
                var row = $(e.target, document).parent();
                var triple = row.tripleedit( "getTriple" );
                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) {
                        if( success ) {
                            row.remove();
                        } else {
                            alert( "Sorry, the server responded to your edit request with an error: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blank nodes is not yet supported." );
                }
            });
            element.empty().append(table);
            var subject = o.subject ? processResource( o.subject,o ) : undefined;
            var predicate = o.predicate ? processResource( o.predicate,o) : undefined;
            var object = o.object ? processObject( o.object, o) : undefined;
            this.triples = $.rdfwidgets.statementsMatching( subject,predicate,object, undefined, false, o );
            if( o.filterduplicates ) {
                this.triples = filterDuplicates( this.triples );
            }
            var rows = [];
            var html= "<tbody>";
            for( var i = 0; i < this.triples.length; i++ ) {
                var t = this.triples[i];
                var rid = randomID(), sid = null, pid = null, oid = null;
                html += "<tr id='"+rid+"'>";
                if( !o.subject ) {
                    sid = randomID();
                    html += "<td id='"+sid+"'></td>";
                }
                if( !o.predicate ) {
                    pid = randomID();
                    html += "<td id='"+pid+"'></td>";
                }
                if( !o.object ) {
                    oid = randomID();
                    html += "<td id='"+oid+"'></td>";
                }
                html += "</tr>";
                var opts = {};
                var tripopts = {subject: t.subject, predicate: t.predicate, object: t.object, subjectElement: '#'+sid, predicateElement: '#'+pid, objectElement: '#'+oid};
                $.extend( opts, o, tripopts );
                rows.push({r:rid,o:opts});
            }
            html += "</tbody>";
            table.append( html );

            for( var i = 0; i < rows.length; i++ ) {
                $('#'+rows[i].r, document).tripleedit(rows[i].o);
            }
        }
    });

    /**
     * @name jQuery.prototype.toolbar
     * @description Display an image for each resource of a certain type in a toolbar layout.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.type] The rdf:type that should be used to decide which resources will appear in the toolbar.
     */
    $.rdfwidget("ui.toolbar", {
        options: {
            namespaces:namespaces,
            width:32,
            height:32
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            element.find( "td" ).each( function() {
                $(this, document).image("disable");
            });
        },

        enable: function() {
            element.find( "td" ).each( function() {
                $(this, document).image("enable");
            });
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var t = processResource( o.type, o );

            if( o.choices ) {
                this.choices = o.choices;
            } else {
                this.choices = $.rdfwidgets.each( undefined, db.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), t, undefined, o );
            }
            var html = "<table class='rdftoolbar'><tr>";
            var actual = [];

            for( var i = 0; i < this.choices.length; i++ ) {
                if( (o.mappings && o.mappings[this.choices[i]]) || doImage( processResource(this.choices[i],o),o) ) {
                    actual.push( this.choices[i] );
                    html += "<td width="+o.width+" height="+o.height+" class='rdftoolbar' style='margin:1px'></td>";
                }
            }
            html += "</tr></table>";
            element.html(html);
            element.find( "td" ).each( function(i) {
                    var opts = {};
                    var tripopts = {subject: actual[i], selectable:true};
                    $.extend( opts, o, tripopts );
                    $(this, document).image(opts);
                });
        }
    });

    /**
     * @name jQuery.prototype.resource
     * @description Display a table containing all of the properties of a given resource.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] the URI of the resource to be described.
     */
    $.rdfwidget("ui.resource", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true,
            subject:window.location
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" ) {
                this.refresh();
            }
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var div = $('<div></div>', document);
            var table = $('<table class="rdfresourceedit"></table>', document);
            table.bind( "rdfdelete", function( e ) {
                var row = $(e.target, document).parent();
                var triple = row.tripleedit( "getTriple" );
                if( triple ) {
                    doDelete( [ triple ] , function( success, foobar, xhr ) {
                        if( success ) {
                            row.remove();
                        } else {
                            alert( "Sorry, the triple could not be deleted. Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                        }
                    }, o );
                } else {
                    alert( "Sorry, the deletion of information related to blanknodes is not yet supported." );
                }
            });
            div.append(table);
            element.empty().append(div);
            var subject = processResource( o.subject,o );
            this.triples = $.rdfwidgets.statementsMatching( subject,undefined,undefined,undefined,false,o );
            var hid = randomID();
            var thead = "<thead><tr class='rdfeditheader'><td id='"+hid+"' colspan=2></td></tr></thead>";
            table.append(thead);
            $('#'+hid, document).label( {showlinks:o.showlinks,subject:o.subject, selectable:true } );
            var tbody = "<tbody>";
            var id, ids = [], opts, tripopts;
            var sopts = [];
            for( var i = 0; i < this.triples.length; i++ ) {
                id = { p:randomID(),r:randomID(),o:randomID() };
                ids.push(id);
                var tr = '<tr id="'+id.r+'"><td id="'+id.p+'"></td><td id="'+id.o+'"></td></tr>';
                var opts = {};
                var tripopts = {subject: this.triples[i].subject, predicate: this.triples[i].predicate, object: this.triples[i].object, subjectElement: null, predicateElement: '#'+id.p, objectElement: '#'+id.o };
                $.extend( opts, o, tripopts );
                sopts.push( opts );
                tbody+=tr;
            }
            tbody += "</tbody>";
            table.append( tbody );

            for( var i = 0; i < this.triples.length; i++ ) {
                $('#'+ids[i].r, document).tripleedit( sopts[i] );
            }
            var addButton = $('<input type="button" value="Add..."></input>', document);
            div.append(addButton);
            addButton.click( function() {
                var addTable = $('<table class="rdfaddtriple"></table>', document);
                addTable.append('<tr><th colspan="2">Add Data</th></tr>');
                var rowid1 = randomID();
                var rowid2 = randomID();
                var firstRow = $('<tr><td><label for="'+rowid1+'">Property: </label></td></tr>', document);
                var secondRow = $('<tr><td><label for="'+rowid2+'">Value: </label></td></tr>', document);
                var firstInput = $('<input name="'+rowid1+'" type="text"></input>', document);
                var secondInput = $('<input name="'+rowid2+'" type="text"></input>', document);

                doAutocomplete( firstInput, { menuOptions:getMenuPredicateOptions( {} ) } );
                doAutocomplete( secondInput, { menuOptions:getMenuInstanceOptions( {} ) } );

                var lastPred, lastPredInput, lastObj, lastObjInput;

                firstInput.bind( "autocompletechoice", function(e) {
                    lastPred = e.uri;
                    lastPredInput = e.input;
                });

                secondInput.bind( "autocompletechoice", function(e) {
                    lastObj = e.uri;
                    lastObjInput = e.input;
                });
                secondInput.focus( function() {
                    doAutocomplete( secondInput, { menuOptions:getMenuInstanceOptions( {subject:o.subject, predicate:lastPred, editTerm:"object"} ) } );
                })
                firstRow.append(firstInput);
                secondRow.append(secondInput);
                addTable.append(firstRow).append(secondRow);
                var addPopup = $('<div style="position:absolute; display:none" class="rdfaddpropertypopup"></div>', document);
                var closeButton = $('<a style="position:absolute" href="#">X</a>', document);
                var submitButton = $('<input type="button" value="Submit"></input>', document);
                submitButton.click( function() {
                    if( !lastPred ) {
                        alert( "You must enter a valid property.");
                        return;
                    }else if( !lastObjInput ) {
                        alert( "You must enter a value." );
                        return;
                    } else {
                        var pred = processResource( lastPred, o );
                        var obj;
                        if( lastObj ) {
                            obj = processResource( lastObj, o );
                        } else {
                            obj = processObject( lastObjInput, o );
                        }
                        var triple = new $rdf.Statement( subject, pred, obj );
                        if( !$.rdfwidgets.anyStatementMatching( subject, pred, obj,undefined, o ) ) {
                            doInsert( [ triple ], function( success, foobar, xhr ) {
                                if( success ) {
                                    var predicateTD = $('<td class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></td>', document);
                                    var objectTD = $('<td class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></td>', document);
                                    var TR = $('<tr class="'+((2%2===0) ? 'rdfediteven' : 'rdfeditodd')+'"></tr>', document);

                                    table.append(TR);
                                    TR.append(predicateTD);
                                    TR.append(objectTD);
                                    var opts = {};
                                    var tripopts = {subject: subject, predicate: pred, object: obj, subjectElement: null, predicateElement: predicateTD, objectElement: objectTD };
                                    $.extend( opts, o, tripopts );
                                    TR.tripleedit(opts);
                                    addPopup.hide("fast");
                                } else {
                                    alert( "Sorry, the triple could not be inserted at this time.  Server response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                                }
                            }, o );
                        } else {
                            alert( "Good news: the triple you created already exists!" );
                        }
                    }
                });
                closeButton.click( function() {
                    addPopup.hide("fast");
                });
                addPopup.append(closeButton);
                addPopup.append( addTable );
                addPopup.append( submitButton );
                var pos = addButton.offset();
                var width = addButton.outerWidth();
                var height = addButton.outerHeight();
                div.append( addPopup );
                closeButton.css( { "right": "2px", "top": "2px" } );
                addPopup.css( {"left": (pos.left + width) + "px", "top":(pos.top+height) + "px" } );

                addPopup.show("fast");
            });
        }
    });

    /**
     * @name jQuery.prototype.createinstance
     * @description Create a form for creating new information about an as-yet undescribed object.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {Object} [options.properties] An array of create instance options.  Each object must at least have a property field, which defines which predicate the form input will obtain an object for. More coming soon.
     */
    $.rdfwidget("ui.createinstance", {
        options: {
            namespaces:namespaces,
            showlinks:false,
            autocomplete:true
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
            element.find("input").attr("disabled","disabled");
            element.find("textarea").attr("disabled","disabled");
        },

        enable: function() {
            element.find("input").attr("disabled",false);
            element.find("textarea").attr("disabled",false);
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            var that = this;
            var items = o.items;
            var itemIDs = [];
            var map = {};
            var form = $('<form class="rdfcreateinstance"></form>', document);
            var table = $('<table class="rdfcreateinstance"></table>', document);
            var staticTriples = [];
            var why = db.sym(getEndpoint( null, o ));
            o.editTerm="object";

            if( o.items ) {
                for( var i=0; i < items.length; i++ ) {
                    var item = items[i];
                    if ( item.type == "hidden" ) {
                        if( item.predicate && item.object ) {
                            staticTriples.push(item);
                        }
                        continue;
                    }

                    var id = randomID();
                    if( !item.predicate ) {
                        continue;
                    }
                    itemIDs.push( id );
                    map[id] = item;
                    var row = $("<tr></tr>", document);
                    var p = processResource( item.predicate, o );
                    if( !item.type || item.type == "text" ) {
                        var td = $("<td></td>", document);
                        var label = $("<td><label for='"+id+"'>"+doLabel( p, o )+"</label></td>", document);
                        var input = $("<input id='"+id+"' name='"+id+"' type='text'></input>", document);
                        td.append(input);
                        row.append(label).append(td);
                        var opts = {};
                        //todo: inputopts used to be {predicate:p}
                        var inputopts = item;
                        $.extend( opts, o, item, inputopts );
                        doAutocomplete( input, opts );
                        table.append(row);
                    } else if ( item.type == "textarea" ) {
                        var td = $("<td></td>", document);
                        var label = $("<td><label for='"+id+"'>"+doLabel( p, o )+"</label></td>", document);
                        var input = $("<textarea id='"+id+"' name='"+id+"' ></textarea>", document);
                        td.append(input);
                        row.append(label).append(td);
                        var opts = {};
                        var inputopts = {subject:(o.subject ? processResource(o.subject) : (o.baseURI ? db.sym(o.baseURI + '#' + randomID()) : db.sym( window.location + '#' + randomID() ) ) ), predicate: p };
                        $.extend( opts, o, item, inputopts );
                        doAutocomplete( input, opts );
                        table.append(row);
                    }
                }
            }

            form.append(table);
            var submit = $('<input type="submit" value="Submit"></input>', document);
            form.append(submit);
            var disableAll = function() {
                for( var i=0; i<itemIDs.length; i++ ) { $('#'+itemIDs[i], document).attr("disabled","disabled"); }
                submit.attr("disabled","disabled");
            };
            var enableAll = function() {
                for( var i=0; i<itemIDs.length; i++ ) { $('#'+itemIDs[i], document).attr("disabled",false); }
                submit.attr("disabled",false);
            };
            form.submit( function(e) {
                e.preventDefault();
                disableAll();
                var subject = o.subject ? processResource(o.subject) : (o.baseURI ? db.sym(docpart(o.baseURI) + '#' + randomID()) : db.sym( docpart(window.location.toString()) + '#' + randomID() ) );
                var triples = [];
                for( var i=0; i<itemIDs.length; i++ ) {
                    var id = itemIDs[i];
                    var item = map[id];
                    var elt = $('#'+id, document);
                    var uri = elt.data("uri");
                    var lastAC = elt.data("val");
                    var val = elt.val();
                    if( val === lastAC ) {
                        if( uri ) {
                            triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processResource( uri ), subject ) );
                        } else {
                            triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processLiteral( val ), subject ) );
                        }
                    } else {
                        triples.push( new $rdf.Statement( subject, processResource( item.predicate ), processLiteral( val ), subject ) );
                    }
                }
                for( var i = 0; i < staticTriples.length; i++ ) {
                    triples.push( new $rdf.Statement( subject, processResource( staticTriples[i].predicate ), processObject( staticTriples[i].object ), subject ) );
                }

                doInsert( triples , function(success, foobar, xhr) {
                    if( success ) {
                    } else {
                        alert( "Sorry, an error occurred during the submission of your information.  Server Response: " + (xhr ? (xhr.status + " " + xhr.responseText) : "" ) );
                    }
                    enableAll();
                },o);
                return false;
            });
            element.empty().append(form);
        }
    });


    /**
     * @name jQuery.prototype.sourcelist
     * @description Display a list of all sources currently in use by the widget library.
     * @function
     */
    $.rdfwidget("ui.sourcelist", {
        options: {
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            element.empty();
            var span = $('<span class="rdfsourcelist"></span>', document);

            var html = "<div class='rdfsourcelisttitle'>Sources</div>";
            for( var x in loadedSources ) {
                html += "<div class='rdfsourcelist'><a href='"+x+"' title='"+doLabel(db.sym(x),o)+"'>"+x+"</a></div>";
            }
            span.html(html);
            element.append(span);
        },

        insertData: function(d) {
            this.refresh();
        },

        deleteData: function(d) {
            this.refresh();
        }
    });


    getNodeSubject = function( node ) {
        var current = $(node, document);
        var subject;
        while( current.length > 0 ) {
            about = current.attr("about");
            var nn = current.get(0).nodeName;
            if( nn && nn.toLowerCase() === "a" ) {
                subject = join( current.get(0).href, window.location.toString() );
                break;
            }
            if( about ) {
                if( about.indexOf("[") === 0 ) {
                    //TODO: support safe curies..
                    continue;
                } else {
                    subject = join( about, window.location.toString() );
                    break;
                }
            }
            current = current.parent();
        }
        if( !subject ) {
            subject = window.location.toString();
        }
        return subject;
    }

    /**
     * @name jQuery.prototype.annotator
     * @description Display an annotation box when any element inside of a certain element is shift+clicked.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.displayElement] A valid jQuery constructor argument that determines where the annotations will be displayed when an item is selected.  If not provided, the annotations will be displayed in a floating popup.
     */
    $.rdfwidget("ui.annotator", {
        options: {
        },

        _findSubject: function( current ) {
            var subject;
            while( current.length > 0 ) {
                about = current.attr("about");
                var nn = current.get(0).nodeName;
                if( nn && nn.toLowerCase() === "a" ) {
                    subject = join( current.get(0).href, window.location.toString() );
                    break;
                }
                if( about ) {
                    if( about.indexOf("[") === 0 ) {
                        //TODO: support safe curies..
                        continue;
                    } else {
                        subject =  join( about, window.location.toString() );
                        break;
                    }
                }
                current = current.parent();
            }
            if( !subject ) {
                subject = window.location.toString();
            }
            return subject;
        },

        _create: function() {
            var annotator;
            var o = this.options;
            if( o.displayElement ) {
                annotator = $("<div class='rdfannotator'></div>", document);
            } else {
                annotator = $("<div class='rdfannotator' style='display:none; position:absolute'></div>", document);
            }
            var that=this;
            function doCommentBox( e ) {
                if( !e.target || !e.shiftKey ) {
                    return;
                }
                if( e.stopPropagation ) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                var current = $(e.target, document);
                that.current = current;
                var about;
                var subject = that._findSubject( current );
                annotator.empty();
                var listdiv = $("<div class='rdfannotatorlist'></div>", document);
                that.listdiv = listdiv;
                that._matcher( listdiv )
                    .match( "?comment", "http://rdfs.org/sioc/ns#topic", processResource( subject ) )
                    .match( "?comment", "http://rdfs.org/sioc/ns#content", "?content" )
                    .match( "?comment", "http://rdfs.org/sioc/ns#has_creator", "?user" )
                    .page("<div class='rdfannotatorcomment'><div><a href='?user'>@user</a> wrote...</div><div><p>?content</p></div></div>", 4);

                var user = $.rdfwidgets.getDefaultUser();
                if( !user ) { user = SW_PREFIX + "Anonymous"; }
                annotator.append(listdiv);
                var lid = randomID();
                annotator.append( "<div class='rdfannotatortitle'>Add a comment about <span id='"+lid+"' title='"+subject+"'>"+subject+"</span></div>" );
                $('#'+lid, document).label({subject: db.sym(subject), selectable:false})
                var formdiv = $("<div class='rdfannotatorform'></div>", document);
                var opts = $.extend({},that.options,{afterSubmit:function(s) { if(s && !o.displayElement) { annotator.hide("fast"); } },
                                                     items:[{type:"textarea",
                                                             predicate:"http://rdfs.org/sioc/ns#content",
                                                             menuOptions:getMenuNoOptions()},
                                                            {type:"hidden",
                                                             predicate:"http://rdfs.org/sioc/ns#has_creator",
                                                             object:db.sym( user )
                                                            },
                                                            {type:"hidden",
                                                             predicate:"http://rdfs.org/sioc/ns#topic",
                                                             object:subject
                                                            },
                                                            {type:"hidden",
                                                             predicate:"http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                                                             object:"http://rdfs.org/sioc/types#Comment"
                                                            }],
                                                     acl:( o.acl ? o.acl : {
                                                         type:"permanent"
                                                     } )});
                formdiv.createinstance(opts);
                annotator.append(formdiv);
                if( !o.displayElement ) {
                    var closeButton = $('<a style="position:absolute" href="#">X</a>', document);
                    annotator.css({left:e.pageX+"px", top:e.pageY+"px"});
                    closeButton.click( function() {
                        annotator.hide("fast");
                    });
                    closeButton.css( { "right": "2px", "top": "2px" } );
                    annotator.append( closeButton );
                    annotator.show("fast");
                }
            }

            this.element.bind( "click", doCommentBox );
            if( o.displayElement ) {
                $(o.displayElement, document).append( annotator );
                doCommentBox({target:this.element, shiftKey:true});
            } else {
                $(document.body, document).append(annotator);
            }
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            if( this.current ) {
                this._matcher( this.listdiv )
                    .match( "?comment", "http://rdfs.org/sioc/ns#topic", processResource( this._findSubject( this.current ) ) )
                    .match( "?comment", "http://rdfs.org/sioc/ns#content", "?content" )
                    .match( "?comment", "http://rdfs.org/sioc/ns#has_creator", "?user" )
                    .page("<div class='rdfannotatorcomment'><div><a href='?user'>@user</a> wrote...</div><div><p>?content</p></div></div>", 4);
            }
        }
    });

    /**
     * @name jQuery.prototype.sourceview
     * @description Serialize the entire local store as N3 and display it in a text box.
     * @function
     */
    $.rdfwidget("ui.sourceview", {
        options: {
          format:"n3"
        },
        _create: function() {
            this.refresh();
        },

        disable: function() {
        },

        enable: function() {
        },

        refresh: function() {
            var o = this.options;
            var element = this.element;
            element.empty();
            var pre = $('<pre class="rdfsourceview"></pre>', document);
            var s = $rdf.Serializer( data );

            var text;
            if( o.format === "xml" ) {
                text = s.statementsToXML( db.statements );
            } else {
                text = s.toN3( db );
            }

            pre.text( text );
            element.append(pre);
        }
    });

    /**
     * @name jQuery.prototype.image
     * @description Search for a valid image depicting a given resource and display it.  Currently, bases this search off of the foaf:depiction property, dbpedia img property, and their subproperties.
     * @function
     * @param {Object} [options] @see CommonOptions
     * @param {String | Object} [options.subject] The resource to display an image of OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {String | Number} [options.width] The width, in pixels, that the image should be displayed with (height will be scaled).
     * @param {String | Number} [options.height] The height, in pixels, that the image should be displayed with (width will be scaled).
     */
    $.rdfwidget("ui.image", {
        options: {
            namespaces:namespaces,
            selectable:true
        },
        _create: function() {
            this.originalEditTerm = this.options.editTerm;
            this.rdfvalue = null;
            this.refresh();
        },
        refresh: function() {
            var element = this.element;
            var o = this.options;
            var that = this;
            o.editTerm = this.originalEditTerm;

            if( !( o.subject && !o.predicate && !o.object ) ) {
                processEditTerm( o );
            } else {
                o.editTerm = "subject";
            }

            var subject, predicate, object;
            if( o.subject ) { subject = processResource(o.subject, o); }
            if( o.predicate ) { predicate = processResource(o.predicate, o); }
            if( o.object ) { object = processObject( o.object, o ); }

            var temp;
            var output = null;
            var type;
            if( o.subject && !o.object && !o.predicate ) {
                output = subject;
            } else if( o.editTerm==="object" || !o.editTerm ) {
                if( object ) { output = object; }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), (predicate ? predicate : undefined), undefined, undefined, o);
                    if( temp ) { output = temp; }
                }
            } else if( o.editTerm==="predicate" ) {
                if( predicate ) { output = predicate; }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), undefined,(object ? object : undefined), undefined, o );
                    if( temp ) { output = temp; }
                }
            } else if( o.editTerm==="subject" ) {
                o.editTerm="subject";
                if( subject ) { output = subject; }
                else {
                    temp = $.rdfwidgets.any( undefined, (predicate ? predicate : undefined),(object ? object : undefined), undefined, o );
                    if( temp ) { output = temp; }
                }
            }
            var stringLabel;
            if( !output ) {
                return;
            } else if( output.termType === "symbol" ) {
                stringLabel = doLabel(output, o);
                this.rdfvalue = output;
            } else {
                stringLabel = output.value;
                this.rdfvalue = output;
            }

            if( o.selectable ) {
                element.click( function(e) {
                        e.stopPropagation();
                        setSelected( element, that.rdfvalue );
                    } );
            }
            var imageuri = null;
            if( o.mappings ) {
                imageuri = o.mappings[output.value];
            }
            if( !imageuri && "symbol" === output.termType && o.editTerm !== "predicate" ) {
                var im = isImage( output, o );
                if( im ) {
                    imageuri = im.value;
                }
            }
            if( !imageuri && "symbol" === output.termType ) {
                var im = doImage( output, o );
                if( im ) {
                    imageuri = im.value;
                }
            }
            if( imageuri ) {
                output = "<span class='rdfimage'><img class='rdfimage' style='display:none' "+"src='"+imageuri+"' title='"+doLabel(output,o)+" "+output.value+"'></img></span>";
                this.element.empty().html(output);
                $(element, document).find( "img" ).one( "load", function() {
                    var im = $(this, document).show(0);
                    var width = im.width();    // Current image width
                    var height = im.height();  // Current image height

                    var maxWidth = o.width?o.width:width; // Max width for the image
                    var maxHeight = o.height?o.height:height;    // Max height for the image
                    var ratio = 0;  // Used for aspect ratio

                    // Check if the current width is larger than the max
                    if(width > maxWidth){
                        ratio = maxWidth / width;   // get ratio for scaling image
                        height = height * ratio;    // Reset height to match scaled image
                        width = width * ratio;    // Reset width to match scaled image
                    }

                    // Check if current height is larger than max
                    if(height > maxHeight){
                        ratio = maxHeight / height; // get ratio for scaling image
                        width = width * ratio;    // Reset width to match scaled image
                        height = height * ratio;
                    }
                    im.css("width", width); // Set new width
                    im.css("height", height);  // Scale height based on ratio

                });
            }
        },
        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },
        getRDFValue: function() {
            return this.rdfvalue;
        },
        getTriple: function() {
            var o = this.options;
            if( this.rdfvalue && o.editTerm ) {
                var st = new $rdf.Statement( o.subject ? processResource( o.subject,o ) : undefined,
                                             o.predicate ? processResource( o.predicate,o ) : undefined,
                                             o.object ? processObject( o.object,o ) : undefined );
                st[o.editTerm] = this.rdfvalue;
                return $.rdfwidgets.anyStatementMatching( st.subject, st.predicate, st.object, undefined, o );
            }
            return null;
        }
    });

    $.ui.image.getter = "getRDFValue getTriple";

    /**
     * @name jQuery.prototype.label
     * @description Display a simple text label for a given resource or implied resource.
     * @param {String | Object} [options.subject] The resource to display a label for OR if predicate or object is defined, the subject of a statement to be matched.
     * @param {String | Object} [options.predicate] The predicate of a statement to be matched.
     * @param {String | Object} [options.object] The object of a statement to be matched.
     * @param {Boolean} [options.showlinks=true] If false, labels for NamedNodes will not contain hyperlinks.
     * @param {Boolean} [options.selectable=true] If false, the item will not be selectable and will not fire the rdfselect event.
     * @function
     * @param {Object} [options] @see CommonOptions
     */
    $.rdfwidget("ui.label", {
        options: {
            namespaces:namespaces,
            selectable:false,
            showlinks:true
        },
        _create: function() {
            this.originalEditTerm = this.options.editTerm;
            this.rdfvalue = null;
            this.refresh();
        },
        refresh: function() {
            var element = this.element;
            var o = this.options;
            var that = this;
            o.editTerm = this.originalEditTerm;


            if( !( o.subject && !o.predicate && !o.object ) ) {
                processEditTerm( o );
            } else {
                o.editTerm = "subject";
            }


            var subject, predicate, object;
            if( o.subject ) { subject = that._resource(o.subject); }
            if( o.predicate ) { predicate = that._resource(o.predicate); }
            if( o.object ) { object = processObject( o.object, o ); }
            var temp;
            var output = "<span class='rdflabel rdflabelempty'>None</span>";
            var type;

            if( o.subject && !o.object && !o.predicate ) {
                output = subject;
            } else if( o.editTerm==="object" ) {
                if( object ) {
                    output = object;
                }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), (predicate ? predicate : undefined), undefined, undefined, o);
                    if( temp ) { o.object = temp; output = temp; }
                }

            } else if( o.editTerm==="predicate" ) {
                if( predicate ) {
                    output = predicate;
                }
                else {
                    temp = $.rdfwidgets.any( (subject ? subject : undefined), undefined,(object ? object : undefined), undefined, o );
                    if( temp ) { o.predicate = temp; output = temp; }
                }
            } else if( o.editTerm==="subject" ) {
                if( subject ) {
                    output = subject;
                }
                else {
                    temp = $.rdfwidgets.any( undefined, (predicate ? predicate : undefined),(object ? object : undefined), undefined, o );
                    if( temp ) { o.subject = temp; output = temp; }
                }
            }

            var stringLabel;
            if( typeof( output ) === "string" ) {
                stringLabel = output;
            } else if( o.label ) {
                stringLabel = o.label;
                this.rdfvalue = output;
            } else if( output.termType === "symbol" ) {
                stringLabel = doLabel(output, o);
                this.rdfvalue = output;
            } else {
                stringLabel = output.value;
                this.rdfvalue = output;
            }

            if( o.selectable ) {
                element.click( function(e) {
                        e.stopPropagation();
                        setSelected( element, that.rdfvalue );
                    } );
            }

            if( true === o.showlinks && output.termType === "symbol" ) {
                output = "<span class='rdflabel'><a href='"+output.value+"'>"+(o.linkText ? o.linkText : stringLabel)+"</a></span>";
            } else if( typeof(output) !== "string" ){
                output = "<span class='rdflabel' title='"+(output.value ? output.value : stringLabel)+"'>"+stringLabel+"</span>";
            }
            this.element.html(output);
        },
        _setOption: function( key ) {
            $.Widget.prototype._setOption.apply( this, arguments );
            if ( key === "subject" || key === "predicate" || key === "object" || key === "editTerm" ) {
                this.refresh();
            }
        },
        getRDFValue: function() {
            return this.rdfvalue;
        },
        getTriple: function() {
            var o = this.options;
            if( o.subject && o.predicate && o.object ) {
                var trip = $.rdfwidgets.anyStatementMatching( this._resource(o.subject),this._resource(o.predicate),processObject(o.object,o), undefined, o );
                return trip ? trip : null;
            }
            return null;
        }
    });

    $.ui.label.getter = "getRDFValue getTriple";

    $(document, document).ready( function() {
        loadDataSources();
        $(document, document).click( function(e) {
            setUnselected( selectedElement );
        });
        $(document, document).keyup( function( e ) {
            if( (!e.originalTarget || (e.originalTarget && e.originalTarget.nodeName.toLowerCase() !== "input" && e.originalTarget.nodeName.toLowerCase() !== "textarea") )
                && e.which === 46 ) {
                if( selectedElement ) {
                    selectedElement.trigger( "rdfdelete" );
                }
            }
        });
        processHTMLWidgets();
    });

    function processHTMLWidgets ( element ) {
        element = element ? $(element, document).get(0) : document.body;
        $("[sw\\:widget]", document).closest( "*", element ).each( function( i, elt ) {
            var widget = null;
            var opts = {};
            for( var i = 0; i < this.attributes.length; i++ ) {
                var a = this.attributes[i];
                if( a.nodeName.indexOf("sw:") === 0 ) {
                    if( a.nodeValue === "false" ) {
                        opts[a.nodeName.substr(3)] = false;
                    } else if( a.nodeValue.length>2  &&
                               ( ( a.nodeValue[0] === "[" &&
                                   a.nodeValue[a.nodeValue.length-1] === "]") ||
                                 ( a.nodeValue[0] === "{" &&
                                   a.nodeValue[a.nodeValue.length-1] === "}") ) ) {
                        opts[a.nodeName.substr(3)] = $.parseJSON( a.nodeValue );
                    } else {
                        opts[a.nodeName.substr(3)] = a.nodeValue;
                    }
                }
                if( a.nodeName === "sw:widget" ) {
                    widget = a.nodeValue;
                }
            }
            $(this, document)[widget](opts);
        });
    }

    return {

        /**
         * @description Set the default SPARUL endpoint to be used for user-generated content.
         * @memberOf jQuery.rdfwidgets
         * @param {String | $rdf.NamedNode} uri The URI of the new default endpoint.
         */
        setDefaultEndpoint: function( uri ) {
            if( typeof(uri) === "object" && "symbol" === object.termType ) {
                defaultEndpoint = uri.value;
            } else if( uri && uri.toString ) {
                defaultEndpoint = uri.toString();
            }
        },

        /**
         * @description Get the default SPARUL endpoint to be used for user-generated content.
         * @memberOf jQuery.rdfwidgets
         * @returns {String} The current endpoint URI.
         */
        getDefaultEndpoint: function() {
            return defaultEndpoint;
        },

        /**
         * @description Get the current default user used when generating ACL for new data.
         * @memberOf jQuery.rdfwidgets
         * @returns {String} The current default user URI.
         */
        getDefaultUser: function() {
            return defaultUser;
        },

        /**
         * @description Get the Tabulator RDF Store backing the library.
         * @memberOf jQuery.rdfwidgets
         * @returns {$rdf.IndexedFormula} The data store.
         */
        getStore: function() {
            return db;
        },

        setStore: function( newdb ) {
            db = newdb;
            refreshAll();
        },

        refreshAll: function( ) {
            refreshAll();
        },

        /**
         * @description Load all of the RDF data from a given URI into the local store.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The URI of the new default endpoint.
         * @param {Object} [o]
         * @param {String} [o.endpoint] The endpoint to be used when data from this source is edited.
         * @param {String} [o.name] The shorthand name of this data source.
         * @param {Function} [o.callback] A function to be called after the data source has loaded, of the form f(uri, success).
         */
        load: function( uri, o ) {
            for( var i = 0; i < loadFilters.length; i++ ) {
                var t = loadFilters[i](uri);
                if( t && t !== uri ) {
                    uri = t;
                    break;
                }
            }
            if( !requestedURIs[ docpart( uri ) ] ) {
                var u = docpart( uri );
                if( !o ) { o = {}; }
                if( o.name ) {
                    sourceNames[u] = o.name;
                }
                if( o.endpoint ) {
                    endpoints[u] = sourceNames[o.endpoint] ? sourceNames[o.endpoint] : processResource( o.endpoint );
                }
                loadDataSource( u, o.format, o.callback );
            }
        },
        /**
         * @description Remove all data associated with a given URI from the local store.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The data source for which to remove all data.
         */
        remove: function( uri ) {
            var really = docpart( uri );
            delete loadedSources[really];
            db.removeMany( undefined, undefined, undefined, db.sym( really ) );
            deleteData( null );
            requestedURIs[ really ] = false;
        },

        match: function( o ) {
            if( !o ) { o = {}; }
            return $.rdfwidgets.statementsMatching(processResource( o.subject, o ), processResource( o.predicate, o ), processObject( o.object, o ), undefined, false, o );
        },

        loadSameAs: function( uri, o ) {
            var uris = db.uris( processResource( uri, {} ) );
            o = o ? o : {};
            for( var i = 0; i < uris.length; i++ ) {
                if( !requestedURIs[ docpart( uris[i] ) ] ) {
                    $.rdfwidgets.load( uris[i] , o );
                }
            }
        },

        /**
         * @description Get a Matcher instance that draws into a given element.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} element The element to be drawn into.  Can be any valid jQuery constructor argument--a selector, a DOM element, or even another jQuery object.
         * @param {Object} [options] @see CommonOptions
         * @param {Boolean} [options.filterduplicates] Ignore identical matches that originate from different data sources.
         * @param {Boolean} [norefresh] If true, this matcher will not refresh itself automatically when new data is loaded.
         * @returns {Matcher} The new matcher instance
         */
        matcher: function( element, options, norefresh ) {
            return Matcher( element, options ? options : {}, norefresh );
        },

        /**
         * @description Process the DOM starting from a given element in search of HTML-encoded widgets.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [element="document.body"] The element to search in. Any valid jQuery constructor argument--only the first result of a selector will be searched.
         */
        processHTML: function( element ) {
            processHTMLWidgets( element );
        },

        /**
         * @description Ascend up the DOM looking for an RDFa "about" tag.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} node The element to search in. Any valid jQuery constructor argument--only the first result of a selector will be searched. Currently does not support safe CURIEs.
         * @returns {String} the URI of the first "about" tag found, or the "href" of the first anchor tag found.
         */
        getNodeSubject: function( node ) {
            return getNodeSubject( node );
        },

        /**
         * @description Add a function that has a chance to override a source loading.  If the function returns false, the provided URI will not be loaded.
         * @memberOf jQuery.rdfwidgets
         * @param {Function} f The filter function.  If the function returns false, the data source will not be loaded.  The function should have the signature f(uri).
         */
        addLoadFilter: function( f ) {
            loadFilters.push( f );
        },

        /**
         * @description Get the set of data sources pending.
         * @memberOf jQuery.rdfwidgets
         * @returns {Array} The list of URIs which are still loading.
         */
        sourcesPending: function() {
            return $.extend( [], pendingSources );
        },

        /**
         * @description See if a specific URI is in the process of loading.
         * @memberOf jQuery.rdfwidgets
         * @param {String} uri The URI to check.
         * @returns {Boolean} true if the data source is pending, false otherwise.
         */
        sourcePending: function( uri ) {
            var u = docpart( uri );
            for( var i = 0; i < pendingSources.length; i++ ) {
                if( pendingSources[i] === u ) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @description Remove a given load filter.
         * @memberOf jQuery.rdfwidgets
         * @param {Function} f a reference to the filter to be removed.
         */
        removeLoadFilter: function( f ) {
            for( var i = 0; i < loadFilters.length; i++ ) {
                if( loadFilters[i] === f ) {
                    loadFilters.splice(i,1);
                    return;
                }
            }
        },

        /**
         * @description Get all statements matching a given triple pattern.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [o] Object. A URI, prefixed name, NamedNode, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or NamedNode.
         * @param {Boolean} [justOne] If true, only return the first result (still in an Array).
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of $rdf.Statement objects that match the provided pattern.
         */
        statementsMatching: function( s, p, o, w, justOne, opts ) {
            var f = null;
            if( opts ) {
                f = processSourceFilter( opts.sources, opts );
            }
            var sts = db.statementsMatching( s, p, o, w, justOne );
            if( f ) {
                sts = $.map(sts, function(st) {
                    if( f[st.why.uri] ) {
                        return st;
                    }
                    return null;
                });
            }
            if( opts && opts.filter ) {
                sts = $.grep( sts, opts.filter );
            }
            return sts;
        },

        /**
         * @description Get a single statement matching a given triple pattern.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [o] Object. A URI, prefixed name, NamedNode, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or NamedNode.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of $rdf.Statement objects that match the provided pattern.
         */
        anyStatementMatching: function( s, p, o, w, opts ) {
            var x = $.rdfwidgets.statementsMatching(s,p,o,w,true,opts);
            if (!x || x == []) return undefined;
            return x[0];
        },

        /**
         * @description Given two of s, p, o, return any match for the missing term.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [o] Object. A URI, prefixed name, NamedNode, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or NamedNode.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Object} A NamedNode, Literal, or BlankNode representing a match for the missing term, or undefined if none was found.
         */
        any: function( s, p, o, w, opts ) {
            var st = $.rdfwidgets.anyStatementMatching(s,p,o,w,opts);
            if (typeof st == 'undefined') return undefined;
            if (typeof s == 'undefined') return st.subject;
            if (typeof p == 'undefined') return st.predicate;
            if (typeof o == 'undefined') return st.object;
            return undefined;
        },

        /**
         * @description Given two of s, p, o, return all matches for the missing term.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [o] Object. A URI, prefixed name, NamedNode, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or NamedNode.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Array} An Array of NamedNodes, Literals, and/or BlankNodes representing matches for the missing term.
         */
        each: function( s, p, o, w, opts ) {
            var results = []
            var st, sts = $.rdfwidgets.statementsMatching(s,p,o,w,false,opts)
            var i, n=sts.length
            if (typeof s == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.subject);}
            } else if (typeof p == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.predicate);}
            } else if (typeof o == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.object);}
            } else if (typeof w == 'undefined') {
	            for (i=0; i<n; i++) {st=sts[i]; results.push(st.why);}
            }
            return results;
        },

        /**
         * @description Given any of s, p, o, and w, see if any valid match exists.
         * @memberOf jQuery.rdfwidgets
         * @param {String | Object} [s] Subject. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [p] Predicate. A URI, prefixed name, or NamedNode.
         * @param {String | Object} [o] Object. A URI, prefixed name, NamedNode, or Literal.
         * @param {String | Object} [w] Data Source. A URI, prefixed name, or NamedNode.
         * @param {Object} [opts] @see CommonOptions
         * @returns {Boolean} True if a match exists, false otherwise.
         */
        whether: function( s, p, o, w, opts ) {
            return $.rdfwidgets.statementsMatching(s,p,o,w,false,opts).length;
        }

    };

    /**
     * @name CommonOptions
     * @namespace Options commonly used by the widget library widgets.
     * @description Note that this isn't really a class, but is just meant as a reference to the options used by many widgets.
     */

    /**
     * @name sources
     * @type Array
     * @memberOf CommonOptions
     * @field
     * @description An array of URIs and shorthand names that define the set of sources that should be used when obtaining data for this widget.
     */

    /**
     * @name endpoint
     * @type String
     * @memberOf CommonOptions
     * @field
     * @description A URI indicating the SPARUL endpoint to which data created by this widget or edited at this data source should be written
     */


    /**
     * @name filter
     * @type Function
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f($rdf.Triple) that, given a triple, will return true if that triple should be used in the output of the widget.
     */

    /**
     * @name acl
     * @type Object | String
     * @memberOf CommonOptions
     * @field
     * @description An anonymous object representing the ACL to be used with any new resource description created by this widget. Can use any of the pre-defined ACL strings, or an absolute URI pointing to a policy to be used.
     */

    /**
     * @name selectable
     * @type Boolean
     * @memberOf CommonOptions
     * @field
     * @description If true, this item will be selectable.  When selected, the widget will fire an rdfselect event.
     */

    /**
     * @name editable
     * @type Boolean
     * @memberOf CommonOptions
     * @field
     * @description If true, this widget will be editable.
     */

    /**
     * @name beforeSubmit
     * @type Funtion
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f(data, xhr) to be called just prior to the submission of an update to a SPARUL server.
     */

    /**
     * @name afterSubmit
     * @type Function
     * @memberOf CommonOptions
     * @field
     * @description A function with the signature f(success, data, xhr) to be called following a SPARUL request's completion, regardless of success.
     */

    /**
     * @name namespaces
     * @type Object
     * @memberOf CommonOptions
     * @field
     * @description An anonymous object containing namespace->URI mappings, e.g. {"foaf":"http://xmlns.com/foaf/0.1/"}.
     */

}(jQuery);
