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

sparql.prototype.prepareUpdate = function(statement) {
    if (statement == undefined || statement.why == undefined) return;

    function contextToWhere(context) {
        return (context == undefined || context.length == 0)
            ? ""
            : "{ " + map(anonymizeNT, context).join("\n") + " }";
    }

    context = [];
    s = statement;
    while(1) {
        if (s.subject == undefined) break;
        s = this.store.statementsMatching(undefined,undefined,s.subject,statement.why);
        if (s == undefined || s.length == 0) break;
        if (s.length == 1) {
            context.push(s[0]);
        } else {
            // node is not uniquely identifiable
            // do some IFP magic but for now,
            break;
        }
    }

    return {
        complete: false,
        success: false,
        statement: [statement.subject, statement.predicate, statement.object, statement.why],
        statementNT: anonymizeNT(statement),
        where: contextToWhere(context),

        setObject: function(obj) {
            function fire(query) {
                var xhr = Util.XMLHTTPFactory();

                /* // asynchronous request callback
                xhr.onreadystatechange = function() {
                    switch (xhr.readyState) {
                        case 3: //interactive
                            break;
                        case 4: //complete
                            this.complete = true;
                            if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
                                this.success = true;
                            }
                            alert(this);
                            break;
                    }
                }
                */

                // Get privileges for cross-domain XHR
                if(!isExtension) {
                    try {
                        Util.enablePrivilege("UniversalXPConnect UniversalBrowserRead")
                    } catch(e) {
                        alert("Failed to get privileges: " + e)
                    }
                }
                
                xhr.open('POST', 'http://presbrey.mit.edu/sparql/', false);
                xhr.setRequestHeader('Content-type', 'application/sparql-query');
                xhr.send(query);
                
                if (xhr.status < 200 || xhr.status >= 300) {
                    alert("HTTP Error " + xhr.status + "\n\n" + xhr.responseText);
                } else if (xhr.responseText.length > 0) {
                    alert(xhr.responseText);
                }
            }
            
            query = "WHERE { GRAPH " +
                    this.statement[3].toNT() + "\n" +
                    this.where + " }\n";
            query += "DELETE { GRAPH " +
                    this.statement[3].toNT() + " { " +
                    this.statementNT + " } }\n";
            query += "INSERT { GRAPH " +
                    this.statement[3].toNT() + " { " +
                    anonymize(this.statement[0]) + " " +
                    anonymize(this.statement[1]) + " " +
                    anonymize(obj) + " " + " . } }\n";
            
            fire(query);
        }
    }
}