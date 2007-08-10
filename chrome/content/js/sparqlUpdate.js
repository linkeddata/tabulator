// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15

anonymize = function (obj) {
    return (obj.toNT().substr(0,2) == "_:")
    ? "?" + obj.toNT().substr(2)
    : obj.toNT();
}

anonymizeNT = function(stmt) {
    return anonymize(stmt.subject) + " " +
    anonymize(stmt.predicate) + " " +
    anonymize(stmt.object) + " .";
}

sparql = function(store) {
    this.store = store;
}

///////////  The identification of bnodes

// Make a cached list of [Inverse-]Functional properties
// Call this once before calling context_statements

sparql.prototype._cache_ifps = function() {
    sparql.ifps = {};
    var a = kb.each(undefined, tabulator.ns.rdf('type'),
                    tabulator.ns.owl('InverseFunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        sparql.ifps[a.uri] = true;
    }
    sparql.fps = {};
    var a = kb.each(undefined, tabulator.ns.rdf('type'),
                    tabulator.ns.owl('FunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        sparql.fps[a.uri] = true;
    }
}

// Return a list of statements which indirectly identify a node
//
//  Depth > 1 if try further indirection.
//  Return array of statements (possibly empty), or null if failure
//
sparql.prototype._node_context2 = function(x, source, depth) {
    if (x.termType != 'bnode') return []; // only bnodes need this
    var sts = kb.statementsMatching(undefined, undefined, x, source); // incoming links
    for (var i=0; i<sts.length; i++) {
        if (sparql.fps[sts[i].predicate.uri]) {
            var y = sts[i].subject;
            if (y.termType != 'bnode') return [ sts[i] ];
            if (depth) {
                var res = this._context_statements(y, depth-1);
                if (res != null) return [ sts[i] ] + res;
            }
        }        
    }
    var sts = kb.statementsMatching(x, undefined, undefined, source); // outgoing links
    for (var i=0; i<sts.length; i++) {
        if (sparql.ifps[sts[i].predicate.uri]) {
            var y = sts[i].object;
            if (y.termType != 'bnode') return [ sts[i] ];
            if (depth) {
                var res = this._context_statements(y, depth-1);
                if (res != null) return [ sts[i] ] + res;
            }
        }        
    }
    return null; // Failure
}


// Return a list of statements which indirectly identify a node
//
//   Breadth-first
sparql.prototype._node_context = function(x, source) {
    for (var depth = 0; depth < 3; depth++) { // Try simple first 
        var con = this._node_context2(x, source, depth);
        if (con != null) return con;
    }
    throw 'Can\'t edit: Unable to uniquely identify bnode '+x.toNT();
}

sparql.prototype._statement_context = function(st) {
    return ( this._node_context(st.subject, st.why) +
            this._node_context(st.predicate, st.why) +
            this._node_context(st.object,  st.why))
}

sparql.prototype._context_where = function(context) {
        return (context == undefined || context.length == 0)
        ? ""
        : "WHERE { " + context.map(anonymizeNT).join("\n") + " }\n";
}


//////////////////////////////

/*
sparql.prototype._statement_context = function(s) {
    var uri = s.why;
    var context = [];
    var attempts = 0;
    while (attempts++ < 10) {
        if (!s || s.subject == undefined) break;
        s = this.store.statementsMatching(undefined,undefined,s.subject,uri);
        if (s == undefined || s.length == 0) break;
        if (s.length == 1) {
            context.push(s[0]);
        } else {
            // node is not uniquely identifiable
            // do some IFP magic but for now,
            break;
        }
    }
    return context;
}
*/
sparql.prototype._fire = function(uri, query, callback) {
    return alert('sparqlUpdate.js: '+query) // @@
    var xhr = Util.XMLHTTPFactory();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var success = (!xhr.status || (xhr.status >= 200 && xhr.status < 300));
            callback(uri, success, xhr.responseText);
        }
    }

    if(!isExtension) {
        try {
            Util.enablePrivilege("UniversalBrowserRead")
        } catch(e) {
            alert("Failed to get privileges: " + e)
        }
    }
    
    xhr.open('POST', uri);
    xhr.setRequestHeader('Content-type', 'application/sparql-query');
    xhr.send(query);
}

sparql.prototype.update_statement = function(statement) {
    if (statement && statement.why == undefined) return;

    var sparql = this;
    this._cache_ifps();
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
        },
    }
}

sparql.prototype.insert_statement = function(st, callback) {
    this._cache_ifps();
    var query = this._context_where(this._statement_context(st instanceof Array?st[0]:st));
    
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
    
    this._fire(st instanceof Array?st[0].why.uri:st.why.uri, query, callback);
}

sparql.prototype.delete_statement = function(st, callback) {
    this._cache_ifps();
    var query = this._context_where(thi(st));
    
    query += "DELETE { " + anonymizeNT(st) + " }\n";
    
    this._fire(st instanceof Array?st[0].why.uri:st.why.uri, query, callback);
}
