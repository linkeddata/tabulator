


if (typeof tabulator.panes.utils === 'undefined') {
    tabulator.panes.utils = {};
}


////////////////////////////////////// Start ACL stuff
//

// Take the "defaltForNew" ACL and convert it into the equivlent ACL 
// which the resource would have had.  Retur it as a new separate store.

tabulator.panes.utils.adoptACLDefault = function(doc, aclDoc, defaultResource, defaultACLdoc) {
    var kb = tabulator.kb;
    var ACL = tabulator.ns.acl;
    var ns = tabulator.ns;
    var defaults = kb.each(undefined, ACL('defaultForNew'), defaultResource, defaultACLdoc);
    var proposed = [];
    defaults.map(function(da) {
        proposed = proposed.concat(kb.statementsMatching(da, ACL('agent'), undefined, defaultACLdoc))
            .concat(kb.statementsMatching(da, ACL('agentClass'), undefined, defaultACLdoc))
            .concat(kb.statementsMatching(da, ACL('mode'), undefined, defaultACLdoc));
        proposed.push($rdf.st(da, ACL('accessTo'), doc, defaultACLdoc)); // Suppose 
    });
    var kb2 = $rdf.graph(); // Potential - derived is kept apart
    proposed.map(function(st){
        var move = function(sym) {
            var y = defaultACLdoc.uri.length; // The default ACL file
            return  $rdf.sym( (sym.uri.slice(0, y) == defaultACLdoc.uri) ?
                 aclDoc.uri + sym.uri.slice(y) : sym.uri );
        }
        kb2.add(move(st.subject), move(st.predicate), move(st.object), $rdf.sym(aclDoc.uri) );
    });
    
    //   @@@@@ ADD TRIPLES TO ACCES CONTROL ACL FILE -- until servers fixed @@@@@
    var ccc = kb2.each(undefined, ACL('accessTo'), doc)
        .filter(function(au){ return  kb2.holds(au, ACL('mode'), ACL('Control'))});
    ccc.map(function(au){
        var au2 = kb2.sym(au.uri + "__ACLACL");
            kb2.add(au2, ns.rdf('type'), ACL('Authorization'), aclDoc);
            kb2.add(au2, ACL('accessTo'), aclDoc, aclDoc);
            kb2.add(au2, ACL('mode'), ACL('Read'), aclDoc);
            kb2.add(au2, ACL('mode'), ACL('Write'), aclDoc);
        kb2.each(au, ACL('agent')).map(function(who){
            kb2.add(au2, ACL('agent'), who, aclDoc);
        });
        kb2.each(au, ACL('agentClass')).map(function(who){
            kb2.add(au2, ACL('agentClass'), who, aclDoc);
        });
    });
    
    return kb2;
}


// Read and conaonicalize the ACL for x in aclDoc
//
// Accumulate the access rights which each agent or class has
//
tabulator.panes.utils.readACL = function(x, aclDoc) {
    var kb = tabulator.kb;
    var ACL = tabulator.ns.acl;
    var ac = {'agent': [], 'agentClass': []};
    var auths = kb.each(undefined, ACL('accessTo'), x);
    for (var pred in { 'agent': true, 'agentClass': true}) {
//    ['agent', 'agentClass'].map(function(pred){
        auths.map(function(a){
            kb.each(a,  ACL('mode')).map(function(mode){
                 kb.each(a,  ACL(pred)).map(function(agent){                 
                    if (!ac[pred][agent.uri]) ac[pred][agent.uri] = [];
                    ac[pred][agent.uri][mode.uri] = a; // could be "true" but leave pointer just in case
                });
            });
        });
    };
    return ac;
}

// Compare two ACLs
tabulator.panes.utils.sameACL = function(a, b) {
    var contains = function(a, b) {
        for (var pred in { 'agent': true, 'agentClass': true}) {
            if (a[pred]) {
                for (var agent in a[pred]) {
                    for (var mode in a[pred][agent]) {
                        if (!b[pred][agent] || !b[pred][agent][mode]) {
                            return false;
                        }
                    }
                }
            };
        };
        return true;
    }
    return contains(a, b) && contains(b,a);
}

// Union N ACLs
tabulator.panes.utils.ACLunion = function(list) {
    var b = list[0], a, ag;
    for (var k=1; k < list.length; k++) {
        ['agent', 'agentClass'].map(function(pred){
            a = list[k];
            if (a[pred]) {
                for (ag in a[pred]) {
                    for (var mode in a[pred][ag]) {
                        if (!b[pred][ag]) b[pred][ag] = [];
                        b[pred][ag][mode] = true;
                    }
                }
            };
        });
    }
    return b;
}


// Merge ACLs lists from things to form union

tabulator.panes.utils.loadUnionACL = function(subjectList, callback) {
    var aclList = [];
    var doList = function(list) {
        if (list.length) {
            doc = list.shift().doc();
            tabulator.panes.utils.getACLorDefault(doc, function(ok, p2, targetDoc, targetACLDoc, defaultHolder, defaultACLDoc){
                var defa = !p2;
                if (!ok) return callback(ok, targetACLDoc);
                aclList.push((defa) ? tabulator.panes.utils.readACL(defaultHolder, defaultACLDoc) :
                    tabulator.panes.utils.readACL(targetDoc, targetACLDoc));
                doList(list.slice(1));
            });
        } else { // all gone
            callback(true, tabulator.panes.utils.ACLunion(aclList))
        }
    }
    doList(subjectList);
}

// Represents these as a RDF graph by combination of modes
//
tabulator.panes.utils.ACLbyCombination = function(x, ac, aclDoc) {
    var byCombo = [];
    ['agent', 'agentClass'].map(function(pred){
        for (var agent in ac[pred]) {
            var combo = [];
            for (var mode in ac[pred][agent]) {
                combo.push(mode)
            }
            combo.sort()
            combo = combo.join('\n'); 
            if (!byCombo[combo]) byCombo[combo] = [];
            byCombo[combo].push([pred, agent])
        }
    });
    return byCombo;
}
//    Write ACL graph to store
//
tabulator.panes.utils.makeACLGraph = function(kb, x, ac, aclDoc) {
    var byCombo = tabulator.panes.utils.ACLbyCombination(x, ac, aclDoc);
    var ACL = tabulator.ns.acl;
    for (combo in byCombo) {
        var modeURIs = combo.split('\n');
        var short = modeURIs.map(function(u){return u.split('#')[1]}).join('');
        var a = kb.sym(aclDoc.uri + '#' + short);
        kb.add(a, tabulator.ns.rdf('type'), ACL('Authorization'), aclDoc);
        kb.add(a, ACL('accessTo'), x, aclDoc);

        for (var i=0; i < modeURIs.length; i++) {
            kb.add(a, ACL('mode'), kb.sym(modeURIs[i]), aclDoc);
        }
        var pairs = byCombo[combo];
        for (i=0; i< pairs.length; i++) {
            var pred = pairs[i][0], ag = pairs[i][1];
            kb.add(a, ACL(pred), kb.sym(ag), aclDoc);
        } 
    }
}

//    Write ACL graph to string
//
tabulator.panes.utils.makeACLString = function(x, ac, aclDoc) {
    var kb = $rdf.graph();
    tabulator.panes.utils.makeACLGraph(kb, x, ac, aclDoc);
    return $rdf.serialize(aclDoc,  kb, aclDoc.uri, 'text/turtle');
}

//    Write ACL graph to web
//
tabulator.panes.utils.putACLGraph = function(kb, x, ac, aclDoc, callback) {
    var kb2 = $rdf.graph();
    tabulator.panes.utils.makeACLGraph(kb2, x, ac, aclDoc);
    
    //var str = tabulator.panes.utils.makeACLString = function(x, ac, aclDoc);
    var updater =  new tabulator.rdf.sparqlUpdate(kb);
    updater.put(aclDoc, kb2.statementsMatching(undefined, undefined, undefined, aclDoc),
        'text/turtle', function(uri, ok, message){
        if (!ok) {
            callback(ok, message);
        } else {
            kb.fetcher.unload(aclDoc);
            tabulator.panes.utils.makeACLGraph(kb, x, ac, aclDoc);
            kb.fetcher.requested[aclDoc.uri] = 'done'; // missing: save headers
        }
    });
}




// Fix the ACl for an individual card as a function of the groups it is in
// 
// All group files must be loaded first
//

tabulator.panes.utils.fixIndividualCardACL = function(person, log, callback)  {
    var groups =  tabulator.kb.each(undefined, tabulator.ns.vcard('hasMember'), person); 
    var doc = person.doc();
    if (groups) {
        tabulator.panes.utils.fixIndividualACL(person, groups, log, callback);
    } else {
        log("This card is in no groups");
        callback(true); // fine, no requirements to access. default should be ok
    }
    // @@ if no groups, then use default for People container or the book top container.?
}

tabulator.panes.utils.fixIndividualACL = function(item, subjects, log, callback)  {
    log = log || console.log;
    var doc = item.doc();
    tabulator.panes.utils.getACLorDefault(doc, function(ok, exists, targetDoc, targetACLDoc, defaultHolder, defaultACLDoc){ 
        if (!ok) return callback(false, targetACLDoc); // ie message
        var ac = (exists) ? tabulator.panes.utils.readACL(targetDoc, targetACLDoc) : tabulator.panes.utils.readACL(defaultHolder, defaultACLDoc) ;
        tabulator.panes.utils.loadUnionACL(subjects, function(ok, union){
            if (!ok) return callback(false, union);
            if (tabulator.panes.utils.sameACL(union, ac)) {
                log("Nice - same ACL. no change " +tabulator.Util.label(item) + " " + doc);
            } else {
                log("Group ACLs differ for " + tabulator.Util.label(item) + " " + doc);

                // log("Group ACLs: " + tabulator.panes.utils.makeACLString(targetDoc, union, targetACLDoc));
                // log((exists ? "Previous set" : "Default") + " ACLs: " +
                    // tabulator.panes.utils.makeACLString(targetDoc, ac, targetACLDoc));

                tabulator.panes.utils.putACLGraph(tabulator.kb, targetDoc, union, targetACLDoc, callback);
            }
        });
    })
}



tabulator.panes.utils.setACL = function(docURI, aclText, callback) {
    var aclDoc = kb.any(kb.sym(docURI),
        kb.sym('http://www.iana.org/assignments/link-relations/acl')); // @@ check that this get set by web.js
    if (aclDoc) { // Great we already know where it is
        webOperation('PUT', aclDoc.uri, { data: aclText, contentType: 'text/turtle'}, callback);        
    } else {
    
        fetcher.nowOrWhenFetched(docURI, undefined, function(ok, body){
            if (!ok) return callback(ok, "Gettting headers for ACL: " + body);
            var aclDoc = kb.any(kb.sym(docURI),
                kb.sym('http://www.iana.org/assignments/link-relations/acl')); // @@ check that this get set by web.js
            if (!aclDoc) {
                // complainIfBad(false, "No Link rel=ACL header for " + docURI);
                callback(false, "No Link rel=ACL header for " + docURI);
            } else {
                webOperation('PUT', aclDoc.uri, { data: aclText, contentType: 'text/turtle'}, callback);
            }
        })
    }
};


//  Get ACL file or default if necessary
//
// callback(true, true, doc, aclDoc)   The ACL did exist
// callback(true, false, doc, aclDoc, defaultHolder, defaultACLDoc)   ACL file did not exist but a default did
// callback(false, false, status, message)  error getting original
// callback(false, true, status, message)  error getting defualt

tabulator.panes.utils.getACLorDefault = function(doc, callback) {

    tabulator.panes.utils.getACL(doc, function(ok, status, aclDoc, message) {
        var i, row, left, right, a;
        var kb = tabulator.kb;
        var ACL = tabulator.ns.acl;
        if (!ok) return callback(false, false, status, message);
        
        // Recursively search for the ACL file which gives default access
        var tryParent = function(uri) {
            if (uri.slice(-1) === '/') {
                uri = uri.slice(0, -1);
            }
            var right = uri.lastIndexOf('/');
            var left = uri.indexOf('/', uri.indexOf('//') + 2);
            uri = uri.slice(0, right + 1);
            var doc2 = $rdf.sym(uri);
            tabulator.panes.utils.getACL(doc2, function(ok, status, defaultACLDoc) {

                if (!ok) {
                    return callback(false, true, status, "( No ACL pointer " + uri + ' ' + status + ")")
                } else if (status === 403) {
                    return callback(false, true, status,"( default ACL file FORBIDDEN. Stop." + uri + ")");
                } else if (status === 404) {
                    if (left >= right) {
                        return callback(false, true, 499, "Nothing to hold a default");
                    } else {
                        tryParent(uri);
                    }
                } else if (status !== 200) {
                        return callback(false, true, status, "Error searching for default");
                } else { // 200
                    //statusBlock.textContent += (" ACCESS set at " + uri + ". End search.");
                    var defaults = kb.each(undefined, ACL('defaultForNew'), kb.sym(uri), defaultACLDoc);
                    if (!defaults.length) {
                        tryParent(uri);       // Keep searching
                    } else {
                        var defaultHolder = kb.sym(uri);
                        callback(true, false, doc, aclDoc, defaultHolder, defaultACLDoc)
                    }
                }
            });
        }; // tryParent

        if (!ok) {
            return callback(false, false, status ,
                "Error accessing Access Control information for " + doc +") " + message);
        } else if (status === 404) {
            tryParent(doc.uri);   //  @@ construct default one - the server should do that
        } else  if (status === 403) {
            return callback(false, false, status, "(Sharing not available to you)" + message);
        } else  if (status !== 200) {
            return callback(false, false, status, "Error " + status +
                " accessing Access Control information for " + doc + ": " + message); 
        } else { // 200
            return callback(true, true, doc, aclDoc);
        }  
    }); // Call to getACL
} // getACLorDefault


//    Calls back (ok, status, acldoc, message)
// 
//   (false, errormessage)        no link header
//   (true, 403, documentSymbol, fileaccesserror) not authorized
//   (true, 404, documentSymbol, fileaccesserror) if does not exist
//   (true, 200, documentSymbol)   if file exitss and read OK
//
tabulator.panes.utils.getACL = function(doc, callback) {
    tabulator.sf.nowOrWhenFetched(doc, undefined, function(ok, body){
        if (!ok) return callback(ok, "Can't get headers to find ACL file: " + body);
        var kb = tabulator.kb;
        var aclDoc = kb.any(doc,
            kb.sym('http://www.iana.org/assignments/link-relations/acl')); // @@ check that this get set by web.js
        if (!aclDoc) {
            callback(false, "No Link rel=ACL header for " + doc);
        } else {
            if (tabulator.sf.nonexistant[aclDoc.uri]) {
                return callback(true, 404, aclDoc, "ACL file does not exist.");
            }
            tabulator.sf.nowOrWhenFetched(aclDoc, undefined, function(ok, message, xhr){
                if (!ok) {
                    callback(true, xhr.status, aclDoc, "Can't read Access Control File " + aclDoc + ": " + message);
                } else {
                    callback(true, 200, aclDoc);
                }
            });
        }
    });
};




///////////////////////////////////////////  End of ACL stuff
