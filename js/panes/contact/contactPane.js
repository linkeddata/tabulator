/*   Contact AddressBook Pane
**
**  This outline pane allows a user to interact with an contact,
to change its state according to an ontology, comment on it, etc.
**
** See aslo things like
**  http://www.w3.org/TR/vcard-rdf/
**  http://tools.ietf.org/html/rfc6350
**  http://www.iana.org/assignments/vcard-elements/vcard-elements.xhtml
**
** I am using in places single quotes strings like 'this'
** where internationalization ("i18n") is not a problem, and double quoted
** like "this" where the string is seen by the user and so I18n is an issue.
*/



if (typeof console == 'undefined') { // e.g. firefox extension. Node and browser have console
    console = {};
    console.log = function(msg) { tabulator.log.info(msg);};
}



// Sets the best name we have and looks up a better one
tabulator.panes.utils.setName = function(element, subject) {
    var kb = tabulator.kb, ns = tabulator.ns;
    var name = kb.any(subject, ns.vcard('fn')) || kb.any(subject, ns.foaf('name'))
        ||  kb.any(subject, ns.vcard('organization-name'));
    element.textContent = name ? name.value : tabulator.Util.label(subject);
    if (!name) {
        tabulator.sf.nowOrWhenFetched(subject, undefined, function(ok) {
             element.textContent = (ok ? '' : '?') +  tabulator.Util.label(subject);
        });
    }
}



// Delete button with a check you really mean it

tabulator.panes.utils.deleteButtonWithCheck = function(dom, container, noun, deleteFunction) {
    var delButton = dom.createElement('button');
    container.appendChild(delButton);
    delButton.textContent = "-";
    
    container.setAttribute('class', 'hoverControl'); // See tabbedtab.css (sigh global CSS)
    delButton.setAttribute('class', 'hoverControlHide');
    delButton.setAttribute('style', 'color: red; margin-right: 0.3em; foat:right; text-align:right');
    delButton.addEventListener('click', function(e) {
        container.removeChild(delButton);  // Ask -- are you sure?
        var cancelButton = dom.createElement('button');
        cancelButton.textContent = "cancel";
        container.appendChild(cancelButton).addEventListener('click', function(e) {
            container.removeChild(sureButton);
            container.removeChild(cancelButton);
            container.appendChild(delButton);
        }, false);
        var sureButton = dom.createElement('button');
        sureButton.textContent = "Delete " + noun;
        container.appendChild(sureButton).addEventListener('click', function(e) {
            container.removeChild(sureButton);
            container.removeChild(cancelButton);
            deleteFunction();   
        }, false);
    }, false);
}

////////////////////////////////////// Start ACL stuff


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




tabulator.panes.utils.ACLControlBox = function(subject, dom, callback) {
    var kb = tabulator.kb;
    var updater = new tabulator.rdf.sparqlUpdate(kb);
    var ACL = tabulator.ns.acl;
    var doc = subject.doc(); // The ACL is actually to the doc describing the thing

    var table = dom.createElement('table');
    table.setAttribute('style', 'font-size:120%; margin: 1em; border: 0.1em #ccc ;');
    var headerRow = table.appendChild(dom.createElement('tr'));
    headerRow.textContent = "Sharing for group " + tabulator.Util.label(subject);
    headerRow.setAttribute('style', 'min-width: 20em; padding: 1em; font-size: 150%; border-bottom: 0.1em solid red; margin-bottom: 2em;');

    var statusRow = table.appendChild(dom.createElement('tr'));
    var statusBlock = statusRow.appendChild(dom.createElement('div'));
    statusBlock.setAttribute('style', 'padding: 2em;');
    var MainRow = table.appendChild(dom.createElement('tr'));
    var box = MainRow.appendChild(dom.createElement('table'));
    var bottomRow = table.appendChild(dom.createElement('tr'));

    var ACLControl = function(box, doc, aclDoc, kb) {
        var authorizations = kb.each(undefined, ACL('accessTo'), doc, aclDoc); // ONLY LOOK IN ACL DOC
        if (authorizations.length === 0) {
            statusBlock.textContent += "Access control file exists but contains no authorizations! " + aclDoc + ")";
        }
        for (i=0; i < authorizations.length; i++) {
            var row = box.appendChild(dom.createElement('tr'));
            var rowdiv1 = row.appendChild(dom.createElement('div'));

            rowdiv1.setAttribute('style', 'margin: 1em; border: 0.1em solid #444; border-radius: 0.5em; padding: 1em;');
            rowtable1 = rowdiv1.appendChild(dom.createElement('table'));
            rowrow = rowtable1.appendChild(dom.createElement('tr'));
            var left = rowrow.appendChild(dom.createElement('td'));
            var middle = rowrow.appendChild(dom.createElement('td'));
            middle.textContent = "can:"
            middle.setAttribute('style', 'font-size:100%; padding: 1em;');
            var leftTable = left.appendChild(dom.createElement('table'));
            var right = rowrow.appendChild(dom.createElement('td'));
            var rightTable = right.appendChild(dom.createElement('table'));
            var a = authorizations[i];
            
            kb.each(a,  ACL('agent')).map(function(x){
                var tr = leftTable.appendChild(dom.createElement('tr'));
                tabulator.panes.utils.setName(tr, x);
                tr.setAttribute('style', 'min-width: 12em');
            });
            
            kb.each(a,  ACL('agentClass')).map(function(x){
                var tr = leftTable.appendChild(dom.createElement('tr'));
                tr.textContent = tabulator.Util.label(x) + ' *'; // for now // later add # or members
            });
            
            kb.each(a,  ACL('mode')).map(function(x){
                var tr = rightTable.appendChild(dom.createElement('tr'));
                tr.textContent = tabulator.Util.label(x); // for now // later add # or members
            });
        }
    }


    tabulator.panes.utils.getACLorDefault(doc, function(ok, p2, targetDoc, targetACLDoc, defaultHolder, defaultACLDoc){
        var defa = !p2;
        if (!ok) {
            statusBlock.textContent += "Error reading " + (defa? " default " : "") + "ACL."
                + " status " + targetDoc + ": " + targetACLDoc;
        } else {
            if (defa) {
                var defaults = kb.each(undefined, ACL('defaultForNew'), defaultHolder, defaultACLDoc);
                if (!defaults.length) {
                    statusBlock.textContent += " (No defaults given.)";
                } else {
                    statusBlock.textContent = "The sharing for this group is the default.";
                    var kb2 = tabulator.panes.utils.adoptACLDefault(doc, targetACLDoc, defaultHolder, defaultACLDoc) 
                    ACLControl(box, doc, targetACLDoc, kb2); // Add btton to save them as actual
                    
                    var editPlease = bottomRow.appendChild(dom.createElement('button'));
                    editPlease.textContent = "Set specific sharing\nfor this group";
                    editPlease.addEventListener('click', function(event) {
                        updater.put(targetACLDoc, kb2.statements,
                            'text/turtle', function(uri, ok, message){
                            if (!ok) {
                                statusBlock.textContent += " (Error writing back access control file: "+message+")";
                            } else {
                                statusBlock.textContent = " (Now editing specific access for this group)";
                                bottomRow.removeChild(editPlease);
                            }
                        });

                    });
                } // defaults.length
            } else { // Not using defaults

                ACLControl(box, targetDoc, targetACLDoc, kb);
                
                var useDefault;
                var addDefaultButton = function() {
                    useDefault = bottomRow.appendChild(dom.createElement('button'));
                    useDefault.textContent = "Stop specific sharing for this group -- just use default.";
                    useDefault.addEventListener('click', function(event) {
                        updater.delete(doc, function(uri, ok, message){
                            if (!ok) {
                                statusBlock.textContent += " (Error deleting access control file: "+message+")";
                            } else {
                                statusBlock.textContent = " The sharing for this group is now the default.";
                                bottomRow.removeChild(useDefault);
                            }
                        });
         
                    });
                }
                addDefaultButton();
            
                var checkIndividualACLsButton;
                var addCheckButton = function() {
                    bottomRow.appendChild(dom.createElement('br'));
                    checkIndividualACLsButton = bottomRow.appendChild(dom.createElement('button'));
                    checkIndividualACLsButton.textContent = "Check individalcards ACLs";
                    checkIndividualACLsButton.addEventListener('click', function(event) {
                        
                        
                    });
                }
                addCheckButton();
            
            } // Not using defaults
        }
            
    });

    return table
    
}; // ACLControl


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

    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_contactCard = iconPrefix + 'js/panes/contact/card.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_contactCard] = 'Contact'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_contactCard,
    
    name: 'contact',
    
    // Does the subject deserve an contact pane?
    label: function(subject) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var t = kb.findTypeURIs(subject);
        if (t[ns.vcard('Individual').uri]) return "Contact";
        if (t[ns.vcard('Organization').uri]) return "contact";
        if (t[ns.vcard('Group').uri]) return "Group";
        if (t[ns.vcard('AddressBook').uri]) return "Address book";
        return null; // No under other circumstances
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var div = dom.createElement("div")
        var cardDoc = subject.doc();
        
        div.setAttribute('class', 'contactPane');

        var commentFlter = function(pred, inverse) {
            if (!inverse && pred.uri == 
                'http://www.w3.org/2000/01/rdf-schema#comment') return true;
            return false
        }
        
        var setModifiedDate = function(subj, kb, doc) {
            if (!getOption(tracker, 'trackLastModified')) return;
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, ns.wf('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, ns.wf('modifiedBy'), me, doc) );
            updater.update(deletions, insertions, function(uri, ok, body){});
        }

        var say = function say(message, style){
            var pre = dom.createElement("pre");
            pre.setAttribute('style', style ? style :'color: grey');
            div.appendChild(pre);
            pre.appendChild(dom.createTextNode(message));
            return pre
        } 

        var complainIfBad = function(ok,body){
            if (!ok) {
                console.log("Error: " + body);
            }
        }

        var getOption = function (tracker, option){ // eg 'allowSubContacts'
            var opt = kb.any(tracker, ns.ui(option));
            return !!(opt && opt.value);
        }


        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, dom);
            parent.replaceChild(div2, div);
        };

        var timestring = function() {
            var now = new Date();
            return ''+ now.getTime();
            // http://www.w3schools.com/jsref/jsref_obj_date.asp
        }


         var gen_uuid = function() { // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };


        
        // Unused and untested but could be handy: a facetted browser view
        //
        var addressBookAsTable = function() {
            var query = new $rdf.Query(tabulator.Util.label(subject));
            var vars =  ['contact', 'name', 'em', 'email'];
            var v = {}; // The RDF variable objects for each variable name
            vars.map(function(x){query.vars.push(v[x]=$rdf.variable(x))});

            query.pat.add(v['contact'], ns.vcard('fn'), v['name']);
            query.pat.add(v['contact'], ns.vcard('hasEmail'), v['em']);
            query.pat.add(v['contact'], ns.vcard('value'), v['email']);
            query.pat.optional = [];
            
            var propertyList = kb.any(subject, ns.wf('propertyList')); // List of extra properties
            // console.log('Property list: '+propertyList); //
            if (propertyList) {
                properties = propertyList.elements;
                for (var p=0; p < properties.length; p++) {
                    var prop = properties[p];
                    var vname = '_prop_'+p;
                    if (prop.uri.indexOf('#') >= 0) {
                        vname = prop.uri.split('#')[1];
                    }
                    query.vars.push(v[vname]=$rdf.variable(vname));
                    var oneOpt = new $rdf.IndexedFormula();
                    query.pat.optional.push(oneOpt);
                    oneOpt.add(v['contact'], prop, v[vname]);
                }
            }
                    
            var tableDiv = tabulator.panes.utils.renderTableViewPane(dom, {'query': query,
   /*             'hints': {
                    '?created': { 'cellFormat': 'shortDate'},
                    '?state': { 'initialSelection': selectedStates }}
                    */
                } );
                    
            div.appendChild(tableDiv);

            if (tableDiv.refresh) { // Refresh function
                var refreshButton = dom.createElement('button');
                refreshButton.textContent = "refresh";
                refreshButton.addEventListener('click', function(e) {
                    tabulator.fetcher.unload(nameEmailIndex);
                    tabulator.fetcher.nowOrWhenFetched(nameEmailIndex.uri, undefined, function(ok, body){
                        if (!ok) {
                            console.log("Cant refresh data:" + body);
                        } else {
                            tableDiv.refresh();
                        };
                    });
                }, false);
                div.appendChild(refreshButton);
            } else {
                console.log('No refresh function?!');
            }
        };

                                                  
        /////////////////////// Reproduction: Spawn a new instance of this app
        
        var newAddressBookButton = function(thisAddressBook) {
            return tabulator.panes.utils.newAppInstance(dom, "Start your own new address book", function(ws){
        
                var appPathSegment = 'com.timbl.contactor'; // how to allocate this string and connect to 

                // console.log("Ready to make new instance at "+ws);
                var sp = tabulator.ns.space;
                var kb = tabulator.kb;
                
                var base = kb.any(ws, sp('uriPrefix')).value;
                if (base.slice(-1) !== '/') {
                    $rdf.log.error(appPathSegment + ": No / at end of uriPrefix " + base );
                    base = base + '/';
                }
                base += appPathSegment + '/' + timestring() + '/'; // unique id 

                var documentOf = function(x) {
                    return kb.sym($rdf.uri.docpart(x.uri));
                }

                var newBook = kb.sym(base + 'book.ttl');
                var newGroups = kb.sym(base + 'groups.ttl');
                var newPeople = kb.sym(base + 'people.ttl');

                 
                //
                // kb.add(newAddressBook, tabulator.ns.space('inspiration'), thisAddressBook, doc);
                
                //kb.add(newAddressBook, tabulator.ns.space('inspiration'), thisAddressBook, there);
                
                // $rdf.log.debug("\n Ready to put " + kb.statementsMatching(undefined, undefined, undefined, there)); //@@


                //  @@@  MAKE SURE NOT OVERWRITING EXISTING FILES
                
                agenda = [];
                
                prefixes = '@prefix vcard: <http://www.w3.org/2006/vcard/ns#>. \n\
@prefix ab: <http://www.w3.org/ns/pim/ab#>. \n\
@prefix dc: <http://purl.org/dc/elements/1.1/>.\n\
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n\
'

                bookData = prefixes + '\n<#this> a vcard:AddressBook;\n\
                    vcard:nameEmailIndex <people.ttl>; \n\
                    vcard:groupIndex <groups.ttl>. \n\n';  // @@ Add title?


                agenda.push(function() {
                    webOperation('PUT', base + 'groups.ttl', { data: bookData, contentType: 'text/turtle'}, function(ok, body) {
                        complainIfBad(ok, "Failed to initialize empty results file: " + body);
                        if (ok) agenda.shift()();
                    })
                });


                groupsData = prefixes + '<book.ttl#this> vcard:includesGroup  <Group/Home.ttl#this>. <Group/Home.ttl#this> a vcard:Group; vcard:fn "Home"\n' 
                     + '<book.ttl#this> vcard:includesGroup  <Group/Work.ttl#this>. <Group/Work.ttl#this> a vcard:Group; vcard:fn "Work"\n' 

                 agenda.push(function() {
                    webOperation('PUT', base + 'groups.ttl', { data: groupsData, contentType: 'text/turtle'}, function(ok, body) {
                        complainIfBad(ok, "Failed to initialize empty results file: " + body);
                        if (ok) agenda.shift()();
                    })
                });

           ////////////

                agenda.shift()();
                
                 
            }); // callback to newAppInstance

            
        }; // newAddressBookButton

 
 
///////////////////////////////////////////////////////////////////////////////
        
        
        
        var updater = new tabulator.rdf.sparqlUpdate(kb);

 
        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;


        // Reload resorce then
        
        var reloadStore = function(store, callBack) {
            tabulator.fetcher.unload(store);
            tabulator.fetcher.nowOrWhenFetched(store.uri, undefined, function(ok, body){
                if (!ok) {
                    console.log("Cant refresh data:" + body);
                } else {
                    callBack();
                };
            });
        };



        // Refresh the DOM tree
      
        var refreshTree = function(root) {
            if (root.refresh) {
                root.refresh();
                return;
            }
            for (var i=0; i < root.children.length; i++) {
                refreshTree(root.children[i]);
            }
        }
        






        //              Render a single contact Individual
        
        if (t[ns.vcard('Individual').uri]|| t[ns.vcard('Organization').uri]) { // https://timbl.rww.io/Apps/Contactator/individualForm.ttl

            // var individualFormDoc = kb.sym(iconPrefix + 'js/panes/contact/individualForm.ttl');
            var individualFormDoc = kb.sym('https://timbl.rww.io/Apps/Contactator/individualForm.ttl');
            var individualForm = kb.sym(individualFormDoc.uri + '#form1')

            tabulator.fetcher.nowOrWhenFetched(individualFormDoc.uri, subject, function drawContactPane(ok, body) {
                if (!ok) return console.log("Failed to load form " + individualFormDoc.uri + ' '+body);
                var predicateURIsDone = {};
                var donePredicate = function(pred) {predicateURIsDone[pred.uri]=true};
                
                donePredicate(ns.rdf('type'));
                donePredicate(ns.dc('title'));
                donePredicate(ns.dc('modified'));
                
                [ 'hasUID', 'fn', 'hasEmail', 'hasTelephone', 'hasName',
                    'hasAddress', 'note'].map(function(p) {
                    donePredicate(ns.vcard(p));
                });
                

                var setPaneStyle = function() {
                    var types = kb.findTypeURIs(subject);
                    var mystyle = "padding: 0.5em 1.5em 1em 1.5em; ";
                    var backgroundColor = null;
                    for (var uri in types) {
                        backgroundColor = kb.any(kb.sym(uri), kb.sym('http://www.w3.org/ns/ui#backgroundColor'));
                        if (backgroundColor) break;
                    }
                    backgroundColor = backgroundColor ? backgroundColor.value : '#fff'; // default white
                    mystyle += "background-color: " + backgroundColor + "; ";
                    div.setAttribute('style', mystyle);
                }
                setPaneStyle();
                

                tabulator.panes.utils.checkUserSetMe(cardDoc);

                tabulator.panes.utils.appendForm(dom, div, {}, subject, individualForm, cardDoc, complainIfBad);
                 
                 
                 //   Comment/discussion area
                /*
                var messageStore = kb.any(tracker, ns.wf('messageStore'));
                if (!messageStore) messageStore = kb.any(tracker, ns.wf('doc'));                
                div.appendChild(tabulator.panes.utils.messageArea(dom, kb, subject, messageStore));
                donePredicate(ns.wf('message'));
                */

                div.appendChild(dom.createElement('tr'))
                            .setAttribute('style','height: 1em'); // spacer
                
                // Remaining properties from whatever ontollogy
                tabulator.outline.appendPropertyTRs(div, plist, false,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                });
                tabulator.outline.appendPropertyTRs(div, qlist, true,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                });
                /*
                var refreshButton = dom.createElement('button');
                refreshButton.textContent = "refresh";
                refreshButton.addEventListener('click', function(e) {
                    tabulator.fetcher.unload(messageStore);
                    tabulator.fetcher.nowOrWhenFetched(messageStore.uri, undefined, function(ok, body){
                        if (!ok) {
                            console.log("Cant refresh messages" + body);
                        } else {
                            refreshTree(div);
                            // syncMessages(subject, messageTable);
                        };
                    });
                }, false);
                div.appendChild(refreshButton);
                */


            });  // End nowOrWhenFetched tracker
            
                    // Alas force ct for github.io 
            // was:  ,{ 'forceContentType': 'text/turtle'}

    ///////////////////////////////////////////////////////////

        //          Render a AddressBook instance
        
        } else if (t[ns.vcard('AddressBook').uri]) {
            var tracker = subject;
            
            var nameEmailIndex = kb.any(subject, ns.vcard('nameEmailIndex'));
            
            var groupIndex = kb.any(subject, ns.vcard('groupIndex'));
            
            //var cats = kb.each(subject, ns.wf('contactCategory')); // zero or more
            
            classLabel = tabulator.Util.label(ns.vcard('AddressBook'));
            IndividualClassLabel = tabulator.Util.label(ns.vcard('Individual'));
            
            var title = kb.any(subject, ns.dc('title'));
            title = title ? title.value : classLabel;
            
            //  Write a new contact to the web
            //
            var createNewContact = function(book, name, selectedGroups, callback) {
                var nameEmailIndex = kb.any(book, ns.vcard('nameEmailIndex'));
                
                var uuid = gen_uuid();
                var x = subject.uri.split('#')[0]
                var doc  = kb.sym(x.slice(0, x.lastIndexOf('/')+1) + 'Person/' + uuid + '.ttl');
                var person = kb.sym(doc.uri + '#this');
                
                // Sets of statements to different files
                agenda = [    // Patch the main index to add the person
                        
                    [   $rdf.st(person, ns.vcard('inAddressBook'), book, nameEmailIndex), // The people index
                        $rdf.st(person, ns.vcard('fn'), name, nameEmailIndex) ]
                ];

                //@@ May be missing email - sync that differently
                
                // sts.push(new $rdf.Statement(person, DCT('created'), new Date(), doc));  ??? include this?
                for (gu in selectedGroups) {
                    var g = kb.sym(gu);
                    var gd = g.doc();
                    agenda.push( [  $rdf.st(g, ns.vcard('hasMember'), person, gd),
                                    $rdf.st(person, ns.vcard('fn'), name, gd) 
                    ]);
                }

                var updateCallback = function(uri, success, body){
                    if (!success) {
                        dump("Error: can\'t update " + uri + " for new contact:" + body + '\n' );
                        callback(false, "Error: can\'t update " + uri + " for new contact:" + body);
                    } else {
                        if (agenda.length > 0) {
                            dump("Patching " + agenda[0] + '\n')
                            updater.update([], agenda.shift(), updateCallback);
                        } else { // done!
                            dump("Done patching. Now reading back in.\n")
                            tabulator.fetcher.nowOrWhenFetched(doc, undefined, function(ok, body){
                                if (ok) {
                                    dump("Read back in OK.\n")
                                    callback(true, person);
                                } else {
                                    dump("Read back in FAILED: " + body + "\n")
                                    callback(false, body);
                                }
                            });
                        }
                    }
                };

                tabulator.fetcher.nowOrWhenFetched(nameEmailIndex, undefined, function(ok, message) {
                    if (ok) {
                        dump(" People index must be loaded\n");
                        updater.put(doc, [
                                $rdf.st(person, ns.vcard('fn'), name, doc), 
                                $rdf.st(person, ns.rdf('type'), ns.vcard('Individual'), doc) ],
                            'text/turtle', updateCallback);
                    } else {
                        dump("Error loading people index!" + uri + ": " + message);
                        callback(false, "Error loading people index!" + uri + ": " + message + '\n');
                    }
                });

            };
            
           // Write new group to web
           // Creates an empty new group file and adds it to the index
           //
           var saveNewGroup = function(book, name, callback) {
                var gix = kb.any(book, ns.vcard('groupIndex'));
                
                var x = subject.uri.split('#')[0]
                var gname = name.replace(' ', '_');
                var doc  = kb.sym(x.slice(0, x.lastIndexOf('/')+1) + 'Group/' + gname + '.ttl');
                var group = kb.sym(doc.uri + '#this');
                dump(" New group will be: "+ group + '\n');
                
                tabulator.fetcher.nowOrWhenFetched(gix, undefined, function(ok, message) {
                    if (ok) {
                        dump(" Group index must be loaded\n");
                        updater.update([], 
                            [   $rdf.st(subject, ns.vcard('includesGroup'), group, gix),
                                $rdf.st(group, ns.rdf('type'), ns.vcard('Group'), gix) ,
                                $rdf.st(group, ns.vcard('fn'), name, gix) ], function(uri, success, body){
                                    if (ok) {
                                        updater.put(doc, [], 'text/turtle', function(uri, ok, body){
                                            callback(ok, ok? group : "Can't save new group file " + doc + body);
                                        });
                                    } else {
                                        callback(ok, "Could not update group index "+ body); // fail
                                    }
                            });
                    } else {
                        dump("Error loading people index!" + uri + ": " + message);
                        callback(false, "Error loading people index!" + uri + ": " + message + '\n');
                    }
                });

            };
 
            // Form to get the name of a new thing before we create it        
            var getNameForm = function(dom, kb, classLabel, selectedGroups, gotNameCallback) {
                var form = dom.createElement('div');  // form is broken as HTML behaviour can resurface on js error

                tabulator.fetcher.removeCallback('done','expand'); // @@ experimental -- does this kill the re-paint? no
                tabulator.fetcher.removeCallback('fail','expand'); // @@ ?? 
                
                // classLabel = tabulator.Util.label(ns.vcard('Individual'));
                form.innerHTML = "<h2>Add new "+
                        classLabel+"</h2><p>name of new "+classLabel+":</p>";
                var namefield = dom.createElement('input')
                namefield.setAttribute('type','text');
                namefield.setAttribute('size','100');
                namefield.setAttribute('maxLength','2048');// No arbitrary limits
                namefield.select() // focus next user input
                
                var gotName = function() {
                    namefield.setAttribute('class','pendingedit');
                    namefield.disabled = true;
                    gotNameCallback(true, subject, namefield.value, selectedGroups);
                }
                
                namefield.addEventListener('keyup', function(e) {
                    if(e.keyCode == 13) {
                        gotName();
                    }
                }, false);
                form.appendChild(namefield);
                
                var br = form.appendChild(dom.createElement("br"));

                var cancel = form.appendChild(dom.createElement("button"));
                cancel.setAttribute("type", "button");
                cancel.innerHTML = "Cancel";
                cancel.addEventListener('click', function(e) {
                    form.parentNode.removeChild(form);
                    gotNameCallback(false);
                }, false);

                var b = form.appendChild(dom.createElement("button"));
                b.setAttribute("type", "button");
                b.innerHTML = "Continue";
                b.addEventListener('click', function(e) {
                    gotName();
                }, false);
                
                return form;
            };
        


            var toolsPane = function(selectedGroups) {
                var kb = tabulator.kb;
                var updater = new tabulator.rdf.sparqlUpdate(kb);
                var ACL = tabulator.ns.acl, VCARD = tabulator.ns.vcard;
                var doc = $rdf.sym(subject.uri.split('#')[0]); // The ACL is actually to the doc describing the thing

                var pane = dom.createElement('div');
                var table = pane.appendChild(dom.createElement('table'));
                table.setAttribute('style', 'font-size:120%; margin: 1em; border: 0.1em #ccc ;');
                var headerRow = table.appendChild(dom.createElement('tr'));
                headerRow.textContent =  tabulator.Util.label(subject) + " - tools";
                headerRow.setAttribute('style', 'min-width: 20em; padding: 1em; font-size: 150%; border-bottom: 0.1em solid red; margin-bottom: 2em;');

                var statusRow = table.appendChild(dom.createElement('tr'));
                var statusBlock = statusRow.appendChild(dom.createElement('div'));
                statusBlock.setAttribute('style', 'padding: 2em;');
                var MainRow = table.appendChild(dom.createElement('tr'));
                var box = MainRow.appendChild(dom.createElement('table'));
                var bottomRow = table.appendChild(dom.createElement('tr'));
                
                var totalCards = kb.each(undefined, VCARD('inAddressBook'), subject).length;
                var p = MainRow.appendChild(dom.createElement('pre'));
                var log = function(message) {
                    p.textContent += message + '\n';
                };
                
                log("" + totalCards + " cards alltogether. ");
                
                var gg = [], g;
                for (g in selectedGroups) {
                    gg.push(g);
                }
                log('' + gg.length + "groups. " );
                
                var loadIndexButton = pane.appendChild(dom.createElement('button'));
                loadIndexButton.textContent = "Load main index";
                loadIndexButton.addEventListener('click', function(e) {
                    loadIndexButton.setAttribute('style', 'background-color: #ffc;');

                    var nameEmailIndex = kb.any(subject, ns.vcard('nameEmailIndex'));
                    tabulator.fetcher.nowOrWhenFetched(nameEmailIndex, undefined, function(ok, message) {
                        if (ok) {
                            loadIndexButton.setAttribute('style', 'background-color: #cfc;');
                            log(" People index has been loaded\n");
                        } else {
                            loadIndexButton.setAttribute('style', 'background-color: #fcc;');
                            log("Error: People index has NOT been loaded" + message + "\n");
                        };
                    });
                });

                
                var check = MainRow.appendChild(dom.createElement('button'));
                check.textContent = "Check inidividual card access";
                check.addEventListener('click', function(event){
                    for (var i = 0; i< gg.length; i++) {
                        g = kb.sym(gg[i]);
                        var a = kb.each(g, ns.vcard('hasMember'));
                        log(tabulator.Util.label(g)+ ': ' + a.length + " members");
                        for (var j=0; j < a.length; j++) {
                            var card = a[j];
                            log(tabulator.Util.label(card));
                            function doCard(card) {
                                tabulator.panes.utils.fixIndividualCardACL(card, log, function(ok, message) {
                                    if (ok) {
                                        log("Sucess for "+tabulator.Util.label(card));
                                    } else {
                                        log("Failure for "+tabulator.Util.label(card) + ": " + message);
                                    }
                                });
                            }
                            doCard(card);
                        } 
                    }
                });
                // 
                
                return pane;
            }




                       
            ////////////////////////////// Three-column Contact Browser
            
            tabulator.fetcher.nowOrWhenFetched(groupIndex.uri, subject, function(ok, body) {
        
                if (!ok) return console.log("Cannot load group index: "+body);
                
                // organization-name is a hack for Mac records with no FN which is mandatory.
                var nameFor = function(x) { 
                    var name = kb.any(x, ns.vcard('fn')) || 
                        kb.any(x, ns.foaf('name')) || kb.any(x, ns.vcard('organization-name')); 
                    return name ? name.value : '???';
                }
                
                var filterName = function(name) {
                    var filter = searchInput.value.trim().toLowerCase();
                    if (filter.length === 0) return true;
                    var parts = filter.split(' '); // Each name part must be somewhere
                    for (var j=0; j< parts.length; j++) {
                        word = parts[j];
                        if (name.toLowerCase().indexOf(word) <0 ) return false;
                    }
                    return true;
                }
                
                var searchFilterNames = function() {
                    for (var i=0; i < peopleMainTable.children.length; i++) {
                        row = peopleMainTable.children[i] 
                        row.setAttribute('style',
                            filterName(nameFor(row.subject)) ? '' : 'display: none;');
                    }
                }

                var bookTable = dom.createElement('table');
                bookTable.setAttribute('style', 'border-collapse: collapse; margin-right: 0;')
                div.appendChild(bookTable);
                var bookHeader = bookTable.appendChild(dom.createElement('tr'));
                var bookMain = bookTable.appendChild(dom.createElement('tr'));
                var bookFooter = bookTable.appendChild(dom.createElement('tr'));
                var groupsHeader =  bookHeader.appendChild(dom.createElement('td'));
                var peopleHeader =  bookHeader.appendChild(dom.createElement('td'));
                var cardHeader =  bookHeader.appendChild(dom.createElement('td'));
                var groupsMain = bookMain.appendChild(dom.createElement('td'));
                var groupsMainTable = groupsMain.appendChild(dom.createElement('table'));
                var peopleMain = bookMain.appendChild(dom.createElement('td'));
                var peopleMainTable = peopleMain.appendChild(dom.createElement('table'));

                var groupsFooter =  bookFooter.appendChild(dom.createElement('td'));
                var peopleFooter =  bookFooter.appendChild(dom.createElement('td'));
                var cardFooter =  bookFooter.appendChild(dom.createElement('td'));
                
                var  searchDiv = cardHeader.appendChild(dom.createElement('div'));
                // searchDiv.setAttribute('style', 'border: 0.1em solid #888; border-radius: 0.5em');
                searchInput = cardHeader.appendChild(dom.createElement('input'));
                searchInput.setAttribute('type', 'text');
                searchInput.setAttribute('style', 'border: 0.1em solid #444; border-radius: 0.5em; width: 100%;');
                // searchInput.addEventListener('input', searchFilterNames);
                searchInput.addEventListener('input', function(e){
                    searchFilterNames();
                });

                var cardMain = bookMain.appendChild(dom.createElement('td'));
                cardMain.setAttribute('style', 'margin: 0;'); // fill space available
                var dataCellStyle =  'padding: 0.1em;'
                
                groupsHeader.textContent = "groups";
                groupsHeader.setAttribute('style', 'min-width: 10em; padding-bottom 0.2em;');
                var allGroups = groupsHeader.appendChild(dom.createElement('button'));
                allGroups.textContent = "All";
                allGroups.setAttribute('style', 'margin-left: 1em;');
                allGroups.addEventListener('click', function(event){
                    allGroups.state = allGroups.state ? 0 : 1;
                    peopleMainTable.innerHTML = ''; // clear in case refreshNames doesn't work for unknown reason
                    if (allGroups.state) {
                        for (var k=0; k < groupsMainTable.children.length; k++) {
                            var groupRow = groupsMainTable.children[k];
                            var group = groupRow.subject;

                            var groupList = kb.sym(group.uri.split('#')[0]);
                            selectedGroups[group.uri] = true;

                            kb.fetcher.nowOrWhenFetched(groupList.uri, undefined, function(ok, message){
                                if (!ok) return complainIfBad(ok, "Can't load group file: " +  groupList + ": " + message);
                                groupRow.setAttribute('style', 'background-color: #cce;');
                                refreshNames(); // @@ every time??
                            });
                        //refreshGroups();
                        } // for each row
                    } else {
                        selectedGroups = {};
                        refreshGroups();
                    }
                }); // on button click

                
                peopleHeader.textContent = "name";
                peopleHeader.setAttribute('style', 'min-width: 18em;');
                peopleMain.setAttribute('style','overflow:scroll;');
                
                
                var groups = kb.each(subject, ns.vcard('includesGroup'));
                var groups2 = groups.map(function(g){return [ kb.any(g, ns.vcard('fn')), g] })
                groups.sort();
                var selectedGroups = {};

                var cardPane = function(dom, subject, paneName) {
                    var p = tabulator.panes.byName(paneName);
                    var d = p.render(subject, dom);
                    d.setAttribute('style', 'border: 0.1em solid #444; border-radius: 0.5em')
                    return d;
                };

                var compareForSort = function(self, other) {
                    var s = nameFor(self) ;
                    var o = nameFor(other);
                    if (s && o) {
                        s = s.toLowerCase();
                        o = o.toLowerCase();
                        if (s > o) return 1;
                        if (s < o) return -1;
                    }
                    if (self.uri > other.uri) return 1;
                    if (self.uri < other.uri) return -1;
                    return 0;
                }

                // In a LDP work, deletes the whole document describing a thing
                // plus patch out ALL mentiosn of it!    Use with care!
                // beware of other dta picked up from other places being smushed 
                // together and then deleted.

                var deleteThing = function(x) {
                    var ds = kb.statementsMatching(x).concat(kb.statementsMatching(undefined, undefined, x));
                    var targets = {};
                    ds.map(function(st){targets[st.why.uri] = st;});
                    agenda = []; // sets of statements of same dcoument to delete;
                    for (target in targets) {
                        agenda.push(ds.filter(function(st){ return st.why.uri = target}));
                        dump('Deleting '+ agenda[agenda.length -1].length + ' from ' + target)
                    }
                    function nextOne() {
                        if (agenda.length > 0) {
                            updater.update(agenda.shift(), [], function(uri, ok, body) {
                                nextOne();
                            });
                        } else {
                            var doc = kb.sym(x.uri.split('#')[0]);
                            dump('Deleting resoure ' + doc)
                            updater.deleteResource(doc);
                        }
                    }
                    nextOne;
                };

                var refreshNames = function() {
                    var cards = [], ng = 0;
                    for (var u in selectedGroups) {
                        if (selectedGroups[u]) {
                            var a = kb.each(kb.sym(u), ns.vcard('hasMember'));
                            // dump('Adding '+ a.length + ' people from ' + u + '\n')
                            cards = cards.concat(a);
                            ng += 1;
                        }
                    }
                    cards.sort(compareForSort); // @@ sort by name not UID later
                    for (var k=0; k < cards.length - 1;) {
                        if (cards[k].uri === cards[k+1].uri) {
                            cards.splice(k,1);
                        } else {
                            k++;
                        }
                    }
                    
                    peopleMainTable.innerHTML = ''; // clear
                    peopleHeader.textContent = (cards.length > 5 ? '' + cards.length + " contacts" : "contact");

                    for (var j =0; j < cards.length; j++) {
                        var personRow = peopleMainTable.appendChild(dom.createElement('tr'));
                        var personLeft = personRow.appendChild(dom.createElement('td'));
                        var personRight = personRow.appendChild(dom.createElement('td'));
                        personLeft.setAttribute('style', dataCellStyle);
                        var person = cards[j];
                        var name = nameFor(person);
                        personLeft.textContent = name;
                        personRow.subject = person;

                        var setPersonListener = function toggle(personLeft, person) {
                            tabulator.panes.utils.deleteButtonWithCheck(dom, personRight, 'contact', function(){
                                deleteThing(person);
                                refreshNames();
                                cardMain.innerHTML = '';
                            });
                            personRow.addEventListener('click', function(event){
                                event.preventDefault();
                                cardMain.innerHTML = 'loading...';
                                var cardURI = person.uri.split('#')[0];
                                tabulator.fetcher.nowOrWhenFetched(cardURI, undefined, function(ok, message){
                                    cardMain.innerHTML = '';
                                    if (!ok) return complainIfBad(ok, "Can't load card: " +  group.uri.split('#')[0] + ": " + message)
                                    // dump("Loaded card " + cardURI + '\n')
                                    cardMain.appendChild(cardPane(dom, person, 'contact'));  
                                    cardMain.appendChild(dom.createElement('br'));
                                    var anchor = cardMain.appendChild(dom.createElement('a'));
                                    anchor.setAttribute('href', person.uri);
                                    anchor.textContent = '->';
                                })
                           });
                        };
                        setPersonListener(personRow, person);
                    };
                    searchFilterNames();
    
                }
                
                var refreshGroups = function() {
                    for (i=0; i < groupsMainTable.children.length; i++) {
                        var row = groupsMainTable.children[i];
                        if (row.subject) {
                            row.setAttribute('style', selectedGroups[row.subject.uri] ? 'background-color: #cce;' : '');
                        }
                    }
                };
                
                for (var i =0; i<groups2.length; i++) {
                    var name = groups2[i][0];
                    var group = groups2[i][1];
                    //selectedGroups[group.uri] = false;
                    var groupRow = groupsMainTable.appendChild(dom.createElement('tr'));
                    groupRow.subject = group;
                    groupRow.setAttribute('style', dataCellStyle);
                    // var groupLeft = groupRow.appendChild(dom.createElement('td'));
                    // var groupRight = groupRow.appendChild(dom.createElement('td'));
                    groupRow.textContent = name;
                    var foo = function toggle(groupRow, group, name) {
                        tabulator.panes.utils.deleteButtonWithCheck(dom, groupRow, "group " + name, function(){
                            deleteThing(group);
                        });
                        groupRow.addEventListener('click', function(event){
                            event.preventDefault();
                            var groupList = kb.sym(group.uri.split('#')[0]);
                            if (!event.altKey) {
                                selectedGroups = {}; // If alt key pressed, accumulate multiple
                            }
                            selectedGroups[group.uri] = selectedGroups[group.uri] ? false : true;
                            refreshGroups();
                            peopleMainTable.innerHTML = ''; // clear in case refreshNames doesn't work for unknown reason

                            kb.fetcher.nowOrWhenFetched(groupList.uri, undefined, function(ok, message){
                                if (!ok) return complainIfBad(ok, "Can't load group file: " +  groupList + ": " + message);
                                refreshNames();

                                if (!event.altKey) { // If only one group has beeen selected show ACL
                                    cardMain.innerHTML = ''; 
                                    cardMain.appendChild(tabulator.panes.utils.ACLControlBox(group, dom, function(ok, body){
                                        if (!ok) cardMain.innerHTML = "Failed: " + body;
                                    }));
                                }
                            })
                        }, true);
                    };
                    foo(groupRow, group, name);
                }
                
 
                // New Contact button
                var newContactButton = dom.createElement("button");
                var container = dom.createElement("div");
                newContactButton.setAttribute("type", "button");
                if (!me) newContactButton.setAttribute('disabled', 'true')
                container.appendChild(newContactButton);
                newContactButton.innerHTML = "New Contact" // + IndividualClassLabel;
                peopleFooter.appendChild(container);
                
                var createdNewContactCallback1 = function(ok, person) {
                    dump("createdNewContactCallback1 "+ok+" - "+person +"\n");
                    cardMain.innerHTML = ''; 
                    if (ok) {
                        cardMain.appendChild(cardPane(dom, person, 'contact'));
                    } // else no harm done delete form
                };

                newContactButton.addEventListener('click', function(e) {
                    // b.setAttribute('disabled', 'true');  (do we need o do this?)
                    cardMain.innerHTML = '';

                    var nameEmailIndex = kb.any(subject, ns.vcard('nameEmailIndex'));
                    tabulator.fetcher.nowOrWhenFetched(nameEmailIndex, undefined, function(ok, message) {
                        if (ok) {
                            dump(" People index has been loaded\n");
                        } else {
                            dump("Error: People index has NOT been loaded" + message + "\n");
                        };
                        // Just a heads up, actually used later.
                    });
                    // cardMain.appendChild(newContactForm(dom, kb, selectedGroups, createdNewContactCallback1));
                    cardMain.appendChild(getNameForm(dom, kb, "Contact", selectedGroups,
                        function(ok, subject, name, selectedGroups) {
                            if (!ok) return; // cancelled by user
                            createNewContact(subject, name, selectedGroups, function(success, body) {
                                if (!success) {
                                     console.log("Error: can't save new contact:" + body);
                                } else {
                                    cardMain.innerHTML = ''; 
                                    refreshNames(); // Add name to list of group
                                    cardMain.appendChild(cardPane(dom, body, 'contact'));
                                }
                            });
                        }));
                }, false);
 
                // New Group button
                var newGroupButton = groupsFooter.appendChild(dom.createElement("button"));
                newGroupButton.setAttribute("type", "button");
                newGroupButton.innerHTML = "New Group" // + IndividualClassLabel;
                newGroupButton.addEventListener('click', function(e) {
                    // b.setAttribute('disabled', 'true');  (do we need o do this?)
                    cardMain.innerHTML = '';
                    var groupIndex = kb.any(subject, ns.vcard('groupIndex'));
                    tabulator.fetcher.nowOrWhenFetched(groupIndex, undefined, function(ok, message) {
                        if (ok) {
                            dump(" Group index has been loaded\n");
                        } else {
                            dump("Error: Group index has NOT been loaded" + message + "\n");
                        };
                    });
                    // cardMain.appendChild(newContactForm(dom, kb, selectedGroups, createdNewContactCallback1));
                    cardMain.appendChild(getNameForm(dom, kb, "Group", selectedGroups,
                        function(ok, subject, name, selectedGroups) {
                            if (!ok) return; // cancelled by user
                            saveNewGroup(subject, name, function(success, body) {
                                if (!success) {
                                     console.log("Error: can\'t save new group:" + body);
                                     cardMain.innerHTML = "Failed to save group" + body
                                } else {
                                    cardMain.innerHTML = ''; 
                                    cardMain.appendChild(tabulator.panes.utils.ACLControlBox(group, dom, function(ok, body){
                                        if (!ok) cardMain.innerHTML = "Group creation failed: " + body;
                                    }));
                                }
                            });
                        }));
                }, false);
                


                // Tools button
                var toolsButton = cardFooter.appendChild(dom.createElement("button"));
                toolsButton.setAttribute("type", "button");
                toolsButton.innerHTML = "Tools";
                toolsButton.addEventListener('click', function(e) {
                    cardMain.innerHTML = ''; 
                    cardMain.appendChild(toolsPane(selectedGroups));
                });
                
                cardFooter.appendChild(newAddressBookButton(subject));
             
                                     
            });
                                             
            div.appendChild(dom.createElement('hr'));
            //  div.appendChild(newAddressBookButton(subject));       // later
            // end of AddressBook instance


        } else { 
            console.log("Error: Contact pane: No evidence that "+subject+" is either a bug or a tracker.");
        }         
        if (!tabulator.preferences.get('me')) {
            console.log("(You do not have your Web Id set. Sign in or sign up to make changes.)");
        } else {
            // console.log("(Your webid is "+ tabulator.preferences.get('me')+")");
        };
        
        ///////////////// Fix user when testing on a plane

        if (tabulator.mode == 'webapp' && typeof document !== 'undefined' &&
            document.location &&  ('' + document.location).slice(0,16) === 'http://localhost') {
         
            me = kb.any(subject, tabulator.ns.acl('owner')); // when testing on plane with no webid
            console.log("Assuming user is " + me)   
        }
        
        /////////////////  Obsolete log in out now?
        /*
        var loginOutButton = tabulator.panes.utils.loginStatusBox(dom, function(webid){
            // sayt.parent.removeChild(sayt);
            if (webid) {
                tabulator.preferences.set('me', webid);
                console.log("(Logged in as "+ webid+")")
                me = kb.sym(webid);
            } else {
                tabulator.preferences.set('me', '');
                console.log("(Logged out)")
                me = null;
            }
        });
        
        loginOutButton.setAttribute('style', 'float: right'); // float the beginning of the end // float sucks

        div.appendChild(loginOutButton);
        */
        
        return div;

    }
}, true);

//ends


