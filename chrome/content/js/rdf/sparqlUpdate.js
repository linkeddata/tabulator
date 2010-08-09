// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15
// 2010-08-08 TimBL folded in Kenny's WEBDAV 

$rdf.sparqlUpdate = function() {

var anonymize = function (obj) {
    return (obj.toNT().substr(0,2) == "_:")
    ? "?" + obj.toNT().substr(2)
    : obj.toNT();
}

var anonymizeNT = function(stmt) {
    return anonymize(stmt.subject) + " " +
    anonymize(stmt.predicate) + " " +
    anonymize(stmt.object) + " .";
}

var sparql = function(store) {
    this.store = store;
    this.ifps = {};
    this.fps = {};
}

// Returns The method string SPARQL or WEBDAV or false if known, undefined if not known.
//
sparql.prototype.editable = function(uri, kb) {
    // dump("sparql.prototype.editable: CALLED for "+uri+"\n")
    var link = $rdf.Namespace("http://www.w3.org/2007/ont/link#");
    var httph = $rdf.Namespace("http://www.w3.org/2007/ont/httph#");
    var http = $rdf.Namespace("http://www.w3.org/2007/ont/http#");
    if (!kb) kb = this.store;
    if (!uri) return false; // Eg subject is bnode, no knowm doc to write to
    var request = kb.any(kb.sym($rdf.Util.uri.docpart(uri)), link("request"));
    if (request !== undefined) {
        var response = kb.any(request, link("response"));
        if (request !== undefined) {
            var author_via = kb.each(response, httph("ms-author-via"));
            if (author_via.length) {
                for (var i = 0; i < author_via.length; i++) {
                    if (author_via[i] == "SPARQL" || author_via[i] == "DAV")
                        dump("sparql.editable: Success for "+uri+": "+author_via[i] +"\n");
                        return author_via[i].value;
                }
            }
            var status = kb.each(response, http("status"));
            if (status.length) {
                for (var i = 0; i < status.length; i++) {
                    if (status[i] == 200) {
                        dump("sparql.editable: 200 status, not editable for "+uri+"\n");
                        return false;
                    }
                }
            }
        } else {
            dump("sparql.editable: No response for "+uri+"\n");
        }
    } else {
        dump("sparql.editable: No request for "+uri+"\n");
    }
    dump("sparql.editable: inconclusive for "+uri+"\n");
}

///////////  The identification of bnodes

sparql.prototype._statement_bnodes = function(st) {
    return [st.subject, st.predicate, st.object].filter(function(x){return x.isBlank});
}

sparql.prototype._statement_array_bnodes = function(sts) {
    var bnodes = [];
    for (var i=0; i<sts.length;i++) bnodes = bnodes.concat(this._statement_bnodes(sts[i]));
    bnodes.sort(); // in place sort - result may have duplicates
    bnodes2 = [];
    for (var j=0; j<bnodes.length; j++)
        if (j==0 || !bnodes[j].sameTermAs(bnodes[j-1])) bnodes2.push(bnodes[j]);
    return bnodes2;
}

sparql.prototype._cache_ifps = function() {
    // Make a cached list of [Inverse-]Functional properties
    // Call this once before calling context_statements
    var rdf = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var owl = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
    this.ifps = {};
    var a = this.store.each(undefined, rdf('type'), owl('InverseFunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        this.ifps[a[i].uri] = true;
    }
    this.fps = {};
    var a = this.store.each(undefined, rdf('type'), owl('FunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        this.fps[a[i].uri] = true;
    }
}

sparql.prototype._bnode_context2 = function(x, source, depth) {
    // Return a list of statements which indirectly identify a node
    //  Depth > 1 if try further indirection.
    //  Return array of statements (possibly empty), or null if failure
    var sts = this.store.statementsMatching(undefined, undefined, x, source); // incoming links
    for (var i=0; i<sts.length; i++) {
        if (this.fps[sts[i].predicate.uri]) {
            var y = sts[i].subject;
            if (!y.isBlank)
                return [ sts[i] ];
            if (depth) {
                var res = this._bnode_context2(y, source, depth-1);
                if (res != null)
                    return res.concat([ sts[i] ]);
            }
        }        
    }
    var sts = this.store.statementsMatching(x, undefined, undefined, source); // outgoing links
    for (var i=0; i<sts.length; i++) {
        if (this.ifps[sts[i].predicate.uri]) {
            var y = sts[i].object;
            if (!y.isBlank)
                return [ sts[i] ];
            if (depth) {
                var res = this._bnode_context2(y, source, depth-1);
                if (res != undefined)
                    return res.concat([ sts[i] ]);
            }
        }        
    }
    return null; // Failure
}


sparql.prototype._bnode_context = function(x, source) {
    // Return a list of statements which indirectly identify a node
    //   Breadth-first
    for (var depth = 0; depth < 3; depth++) { // Try simple first 
        var con = this._bnode_context2(x, source, depth);
        if (con != null) return con;
    }
    throw ('Unable to uniquely identify bnode: '+ x.toNT());
}

sparql.prototype._bnode_context = function(bnodes) {
    var context = [];
    if (bnodes.length) {
        if (this.store.statementsMatching(st.subject.isBlank?undefined:st.subject,
                                  st.predicate.isBlank?undefined:st.predicate,
                                  st.object.isBlank?undefined:st.object,
                                  st.why).length <= 1) {
            context = context.concat(st);
        } else {
            this._cache_ifps();
            for (x in bnodes) {
                context = context.concat(this._bnode_context(bnodes[x], st.why));
            }
        }
    }
    return context;
}

sparql.prototype._statement_context = function(st) {
    var bnodes = this._statement_bnodes(st);
    return this._bnode_context(bnodes);
}

sparql.prototype._context_where = function(context) {
        return (context == undefined || context.length == 0)
        ? ""
        : "WHERE { " + context.map(anonymizeNT).join("\n") + " }\n";
}

sparql.prototype._fire = function(uri, query, callback) {
    if (!uri) throw "No URI given for remote editing operation: "+query;
    // dump("sparql: sending update to <"+uri+">\n   query="+query+"\n");
    var xhr = $rdf.Util.XMLHTTPFactory();

    xhr.onreadystatechange = function() {
        //dump("SPARQL update ready state for <"+uri+"> readyState="+xhr.readyState+"\n"+query+"\n");
        if (xhr.readyState == 4) {
            var success = (!xhr.status || (xhr.status >= 200 && xhr.status < 300));
            if (!success) dump("sparql: update failed for <"+uri+"> status="+
                xhr.status+", "+xhr.statusText+", body length="+xhr.responseText.length+"\n   for query: "+query);
            callback(uri, success, xhr.responseText);
        }
    }

    if(!isExtension) {
        try {
            $rdf.Util.enablePrivilege("UniversalBrowserRead")
        } catch(e) {
            alert("Failed to get privileges: " + e)
        }
    }
    
    xhr.open('POST', uri, true);  // async=true
    xhr.setRequestHeader('Content-type', 'application/sparql-query');
    xhr.send(query);
}

// This does NOT update the statement.
// It returns an object whcih includes
//  function which can be used to change the object of the statement.
//
sparql.prototype.update_statement = function(statement) {
    if (statement && statement.why == undefined) return;

    var sparql = this;
    var context = this._statement_context(statement);

    return {
        statement: statement?[statement.subject, statement.predicate, statement.object, statement.why]:undefined,
        statementNT: statement?anonymizeNT(statement):undefined,
        where: sparql._context_where(context),

        set_object: function(obj, callback) {
            query = this.where;
            query += "DELETE { " + this.statementNT + " }\n";
            query += "INSERT { " +
                anonymize(this.statement[0]) + " " +
                anonymize(this.statement[1]) + " " +
                anonymize(obj) + " " + " . }\n";
 
            sparql._fire(this.statement[3].uri, query, callback);
        }
    }
}

sparql.prototype.insert_statement = function(st, callback) {
    var st0 = st instanceof Array ? st[0] : st;
    var query = this._context_where(this._statement_context(st0));
    
    if (st instanceof Array) {
        var stText="";
        for (var i=0;i<st.length;i++) stText+=st[i]+'\n';
        //query += "INSERT { "+st.map(RDFStatement.prototype.toNT.call).join('\n')+" }\n";
        //the above should work, but gives an error "called on imcompatible XUL...scope..."
        query += "INSERT { " + stText + " }\n";
    } else {
        query += "INSERT { " +
            anonymize(st.subject) + " " +
            anonymize(st.predicate) + " " +
            anonymize(st.object) + " " + " . }\n";
    }
    
    this._fire(st0.why.uri, query, callback);
}

sparql.prototype.delete_statement = function(st, callback) {
    var query = this._context_where(this._statement_context(st));
    
    query += "DELETE { " + anonymizeNT(st) + " }\n";
    
    this._fire(st instanceof Array?st[0].why.uri:st.why.uri, query, callback);
}

// This high-level function updates the local store iff the web is changed successfully. 
//
//  - deletions, insertions may be undefined or single statements or lists or formulae.
//
//  - callback is called as callback(uri, success, errorbody)
//
sparql.prototype.update = function(deletions, insertions, callback) {
    var ds =  deletions == undefined ? []
                : deletions instanceof $rdf.IndexedFormula ? deletions.statements
                : deletions instanceof Array ? deletions : [ deletions ];
    var is =  insertions == undefined? []
                : insertions instanceof $rdf.IndexedFormula ? insertions.statements
                : insertions instanceof Array ? insertions : [ insertions ];
    if (! (ds instanceof Array)) throw "Type Error "+(typeof ds)+": "+ds;
    if (! (is instanceof Array)) throw "Type Error "+(typeof is)+": "+is;
    var doc = ds.length ? ds[0].why : is[0].why;

    var protocol = this.editable(doc.uri);
    if (!protocol) throw "Can't make changes in uneditable "+doc;

    if (protocol.indexOf('SPARQL') >=0) {
        var bnodes = []
        if (ds.length) bnodes = this._statement_array_bnodes(ds);
        if (is.length) bnodes = bnodes.concat(this._statement_array_bnodes(is));
        var context = this._bnode_context(bnodes);
        query = this._context_where(context);
        if (ds.length) {
            query += "DELETE { ";
            for (var i=0; i<ds.length;i++) query+= anonymizeNT(ds[i])+"\n";
            query += " }\n";
        }
        if (is.length) {
            query += "INSERT { ";
            for (var i=0; i<is.length;i++) query+= anonymizeNT(is[i])+"\n";
            query += " }\n";
        }
        var mykb = tabulator.kb;
        this._fire(doc.uri, query,
            function(uri, success, body) {
                if (success) {
                    for (var i=0; i<ds.length;i++) mykb.remove(ds[i]);
                    for (var i=0; i<is.length;i++)
                        mykb.add(is[i].subject, is[i].predicate, is[i].object, doc); 
                }
                callback(uri, success, body);
            });
        
    } else if (protocol.indexOf('WEBDAV') >=0) {

        // The code below is derived from Kenny's UpdateCenter.js
        var documentString;
        var request = kb.any(doc, tabulator.ns.link("request"));
        if (!request) throw "No record of our HTTP GET request for document: "+doc; //should not happen
        var response =  kb.any(request, tabulator.ns.link("response"));
        if (!response)  return null; // throw "No record HTTP GET response for document: "+doc;
        var content_type = kb.the(response, tabulator.ns.httph("content-type")).value;            

        //prepare contents of revised document
        var newSts = kb.statementsMatching(undefined, undefined, undefined, doc).slice(); // copy!
        for (var i=0;i<is.length;i++) newSts.push(is[i]);                                     
        for (var i=0;i<ds.length;i++) RDFArrayRemove(newSts, ds[i]);
        
        //serialize to te appropriate format
        var sz = $rdf.Serializer();
        sz.suggestNamespaces(kb.namespaces);
        sz.setBase(doc.uri);//?? beware of this - kenny (why? tim)                   
        switch(content_type){
            case 'application/rdf+xml': 
                documentString = sz.statementsToXML(newSts);
                break;
            case 'text/rdf+n3': // Legacy
            case 'text/n3':
            case 'text/turtle':
            case 'application/x-turtle': // Legacy
            case 'application/n3': // Legacy
                documentString = sz.statementsToN3(newSts);
                break;
            default:
                throw "Content-type "+content_type +" not supported for data write";                                                                            
        }
        
        // Write the new version back
        var candidateTarget = kb.the(response, tabulator.ns.httph("content-location"));
        if (candidateTarget) targetURI = Util.uri.join(candidateTarget.value, targetURI);
        var xhr = Util.XMLHTTPFactory();
        xhr.onreadystatechange = function (){
            if (xhr.readyState == 4){
                //formula from sparqlUpdate.js, what about redirects?
                var success = (!xhr.status || (xhr.status >= 200 && xhr.status < 300));
                if (success) {
                    for (var i=0; i<ds.length;i++) kb.remove(ds[i]);
                    for (var i=0; i<is.length;i++)
                        kb.add(is[i].subject, is[i].predicate, is[i].object, doc);                
                }
                callback(doc.uri, success, xhr.responseText);
            }
        };
        xhr.open('PUT', targetURI, true);
        //assume the server does PUT content-negotiation.
        xhr.setRequestHeader('Content-type', content_type);//OK?
        xhr.send(documentString);
        // tabulator.log.info("sending "+sts+"["+documentString+"] to +"+targetURI);

    
    } else throw "Unhandled edit method: '"+protocol+"' for "+doc;
};



return sparql;

}();
