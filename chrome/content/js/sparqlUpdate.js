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
    this.ifps = {};
    this.fps = {};
}

///////////  The identification of bnodes

sparql.prototype._statement_bnodes = function(st) {
    return [st.subject, st.predicate, st.object].filter(function(x){return x.isBlank});
}

sparql.prototype._cache_ifps = function() {
    // Make a cached list of [Inverse-]Functional properties
    // Call this once before calling context_statements
    this.ifps = {};
    var a = this.store.each(undefined, tabulator.ns.rdf('type'), tabulator.ns.owl('InverseFunctionalProperty'))
    for (var i=0; i<a.length; i++) {
        this.ifps[a[i].uri] = true;
    }
    this.fps = {};
    var a = this.store.each(undefined, tabulator.ns.rdf('type'), tabulator.ns.owl('FunctionalProperty'))
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

sparql.prototype._statement_context = function(st) {
    var bnodes = this._statement_bnodes(st);
    var context = [];
    if (bnodes.length) {
        if (this.store.statementsMatching(st.subject.isBlank?undefined:st.subject,
                                  st.predicate.isBlank?undefined:st.predicate,
                                  st.object.isBlank?undefied:st.object,
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

sparql.prototype._context_where = function(context) {
        return (context == undefined || context.length == 0)
        ? ""
        : "WHERE { " + context.map(anonymizeNT).join("\n") + " }\n";
}

sparql.prototype._fire = function(uri, query, callback) {
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
