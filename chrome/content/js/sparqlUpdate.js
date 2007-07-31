// Joe Presbrey <presbrey@mit.edu>
// 2007-07-15

/*
   I think the architecute of this code is quite shaky due to various hacks (by myself).
   This file might have to be examined and even rewritten becuase a user is more likely 
   to add new triples but not alter existing ones. The procedure prepareUpdate -> setObject
                                                                               -> setStatement
   might be inappropriate.
                                                                    Kenny 2007-07-31                                                                            
*/
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
    var This=this;
    //statement==undefined means updating a new statement
    if (statement && statement.why == undefined) return;

    function contextToWhere(context) {
        return (context == undefined || context.length == 0)
            ? ""
            : "{ " + map(anonymizeNT, context).join("\n") + " }";
    }

    var context = [];
    function setContext(_statement){
        var s = _statement;
        for each (var term in [s.subject,s.object]){ //predicate is not likely to be a bnode
            if (term.termType!='bnode') continue;
            var labelTerm=lb.label(term);
            if (labelTerm){
                s = This.store.statementsMatching(undefined,undefined,labelTerm,_statement.why);
                if (s.length == 1) context.push(s[0]);           
            }
	        
	        //other identifier    
		    /*
		    while(1) {
		        if (!s || s.subject == undefined) break;
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
		    */
        }
        return context;
    }
    if (statement) setContext(statement);

    return {
        complete: false,
        success: false,
        statement: statement?[statement.subject, statement.predicate, statement.object, statement.why]:undefined,
        statementNT: statement?anonymizeNT(statement):undefined,
        where: contextToWhere(context),

        setObject: function(obj) {
            function fire(uri,query) {
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
                
                xhr.open('POST', uri, false);
                xhr.setRequestHeader('Content-type', 'application/sparql-query');
                xhr.send(query);
                
                if (xhr.status < 200 || xhr.status >= 300) {
                    throw new Error("HTTP Error " + xhr.status + "\n\n" + xhr.responseText);
                } else if (xhr.responseText.length > 0) {
                    //alert(xhr.responseText);
                }
            }

/*  algae does not yet support named graphs
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
*/

            query = this.where.length > 0 ? "WHERE " + this.where + "\n" : "";
            query += "DELETE { " + this.statementNT + " }\n";
            query += "INSERT { " +
                anonymize(this.statement[0]) + " " +
                anonymize(this.statement[1]) + " " +
                anonymize(obj) + " " + " . }\n";
            
            fire(this.statement[3].uri, query);
        },
        
        setStatement: function (st){
            function fire(uri,query) {
                var xhr = Util.XMLHTTPFactory();
                // Get privileges for cross-domain XHR
                if(!isExtension) {
                    try {
                        Util.enablePrivilege("UniversalXPConnect UniversalBrowserRead")
                    } catch(e) {
                        alert("Failed to get privileges: " + e)
                    }
                }
                
                xhr.open('POST', uri, false);
                xhr.setRequestHeader('Content-type', 'application/sparql-query');
                xhr.send(query);
                
                if (xhr.status < 200 || xhr.status >= 300) {
                    throw new Error("HTTP Error " + xhr.status + "\n\n" + xhr.responseText);
                } else if (xhr.responseText.length > 0) {
                    //alert(xhr.responseText);
                }
            }
            this.where=contextToWhere(setContext(st instanceof Array?st[0]:st))
            query = this.where.length > 0 ? "WHERE " + this.where + "\n" : "";
            //query += "DELETE { " + this.statementNT + " }\n";
            
            if (st instanceof Array)
                anonymize = function(obj) {return obj.toNT()};
            if (st instanceof Array){
                query += "INSERT { "+st.map(anonymizeNT).join('\n')+" }\n";
            }else{
                query += "INSERT { " +
                    anonymize(st.subject) + " " +
                    anonymize(st.predicate) + " " +
                    anonymize(st.object) + " " + " . }\n";
            }

            fire(st instanceof Array?st[0].why.uri:st.why.uri, query);
            
            //I am sure this copy and paste is bad
            if (st instanceof Array) {
            anonymize = function (obj) {
                return (obj.toNT().substr(0,2) == "_:")
                ? "?" + obj.toNT().substr(2): obj.toNT();
            }
            }                 
        }
    }
}
