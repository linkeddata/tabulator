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



//////////////////////////////////////////////////////  SUBCRIPTIONS

$rdf.subscription =  function(options, doc, onChange) {


    //  for all Link: uuu; rel=rrr  --->  { rrr: uuu }
    var linkRels = function(doc) {
        var links = {}; // map relationship to uri
        var linkHeaders = tabulator.fetcher.getHeader(doc, 'link');
        if (!linkHeaders) return null;
        linkHeaders.map(function(headerValue){
            var arg = headerValue.trim().split(';');
            var uri = arg[0];
            arg.slice(1).map(function(a){
                var key = a.split('=')[0].trim();
                var val = a.split('=')[1].trim();
                if (key ==='rel') {
                    links[val] = uri.trim();
                }
            });        
        });
        return links;
    };


    var getChangesURI = function(doc, rel) {
        var links = linkRels(doc);
        if (!links[rel]) {
            console.log("No link header rel=" + rel + " on " + doc.uri)
            return null;
        }
        var changesURI = $rdf.uri.join(links[rel], doc.uri);
        // console.log("Found rel=" + rel + " URI: " + changesURI);
        return changesURI;
    };



///////////////  Subscribe to changes by SSE


    var getChanges_SSE = function(doc, onChange) {
        var streamURI = getChangesURI(doc, 'events');
        if (!streamURI) return;
        var source = new EventSource(streamURI); // @@@  just path??
        console.log("Server Side Source");   

        source.addEventListener('message', function(e) {
            console.log("Server Side Event: " + e);   
            alert("SSE: " + e)  
            // $('ul').append('<li>' + e.data + ' (message id: ' + e.lastEventId + ')</li>');
        }, false);
    };

 
    

    //////////////// Subscribe to changes websocket

    // This implementation uses web sockets using update-via
    
    var getChanges_WS2 = function(doc, onChange) {
        var router = new $rdf.UpdatesVia(tabulator.fetcher); // Pass fetcher do it can subscribe to headers
        var wsuri = getChangesURI(doc, 'changes').replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
        router.register(wsuri, doc.uri);
    };
    
    
    var getChanges_WS = function(doc, onChange) {
        var SQNS = $rdf.Namespace('http://www.w3.org/ns/pim/patch#');
        var changesURI = getChangesURI(doc, 'updates'); //  @@@@ use single
        var socket;
        try {
            socket = new WebSocket(changesURI);
        } catch(e) {
            socket = new MozWebSocket(changesURI);
        };
        
        socket.onopen = function(event){
            console.log("socket opened");
        };
        
        socket.onmessage = function (event) {
            console.log("socket received: " +event.data);
            var patchText = event.data;
            console.log("Success: patch received:" + patchText);
            
            // @@ check integrity of entire patch
            var patchKB = $rdf.graph();
            var sts;
            try {
                $rdf.parse(patchText, patchKB, doc.uri, 'text/n3');
            } catch(e) {
                console.log("Parse error in patch: "+e);
            };
            clauses = {};
            ['where', 'insert', 'delete'].map(function(pred){
                sts = patchKB.statementsMatching(undefined, SQNS(pred), undefined);
                if (sts) clauses[pred] = sts[0].object;
            });
            console.log("Performing patch!");
            kb.applyPatch(clauses, doc, function(err){
                if (err) {
                    console.log("Incoming patch failed!!!\n" + err)
                    alert("Incoming patch failed!!!\n" + err)
                    socket.close();
                } else {
                    console.log("Incoming patch worked!!!!!!\n" + err)
                    onChange(); // callback user
                };
            });
        };

    }; // end getChanges
    

    ////////////////////////// Subscribe to changes using Long Poll

    // This implementation uses link headers and a diff returned by plain HTTP
    
    var getChanges_LongPoll = function(doc, onChange) {
        var changesURI = getChangesURI(doc, 'changes');
        if (!changesURI) return "No advertized long poll URI";
        console.log(tabulator.panes.utils.shortTime() + " Starting new long poll.")
        var xhr = $rdf.Util.XMLHTTPFactory();
        xhr.alreadyProcessed = 0;

        xhr.onreadystatechange = function(){
            switch (xhr.readyState) {
            case 0:
            case 1:
                return;
            case 3:
                console.log("Mid delta stream (" + xhr.responseText.length + ") "+ changesURI);
                handlePartial();
                break;
            case 4:
                handlePartial();
                console.log(tabulator.panes.utils.shortTime() + " End of delta stream " + changesURI);
                break;
             }   
        };

        try {
            xhr.open('GET', changesURI);
        } catch (er) {
            console.log("XHR open for GET changes failed <"+changesURI+">:\n\t" + er);
        }
        try {
            xhr.send();
        } catch (er) {
            console.log("XHR send failed <"+changesURI+">:\n\t" + er);
        }

        var handlePartial = function() {
            // @@ check content type is text/n3

            if (xhr.status >= 400) {
                console.log("HTTP (" + xhr.readyState + ") error " + xhr.status + "on change stream:" + xhr.statusText);
                console.log("     error body: " + xhr.responseText);
                xhr.abort();
                return;
            } 
            if (xhr.responseText.length > xhr.alreadyProcessed) {
                var patchText = xhr.responseText.slice(xhr.alreadyProcessed);
                xhr.alreadyProcessed = xhr.responseText.length;
                
                console.log(tabulator.panes.utils.shortTime() + " Long poll returns, processing...")
                xhr.headers = $rdf.Util.getHTTPHeaders(xhr);
                try {
                    onChange(patchText);
                } catch (e) {
                    console.log("Exception in patch update handler: " + e)
                    // @@ Where to report error e?
                }
                getChanges_LongPoll(doc, onChange); // Queue another one
                
            }        
        };
        return null; // No error

    }; // end getChanges_LongPoll
    
    if (options.longPoll ) {
        getChanges_LongPoll(doc, onChange);
    }
    if (options.SSE) {
        getChanges_SSE(doc, onChange);
    }
    if (options.websockets) {
        getChanges_WS(doc, onChange);
    }

}; // subscription

/////////////////////////////////////////// End of subscription stufff 

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
    var auth = tabulator.ns.auth;
    var ns = tabulator.ns;
    var defaults = kb.each(undefined, auth('defaultForNew'), defaultResource, defaultACLdoc);
    var proposed = [];
    defaults.map(function(da) {
        proposed = proposed.concat(kb.statementsMatching(da, auth('agent'), undefined, defaultACLdoc))
            .concat(kb.statementsMatching(da, auth('agentClass'), undefined, defaultACLdoc))
            .concat(kb.statementsMatching(da, auth('mode'), undefined, defaultACLdoc));
        proposed.push($rdf.st(da, auth('accessTo'), doc, defaultACLdoc)); // Suppose 
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
    var ccc = kb2.each(undefined, auth('accessTo'), doc)
        .filter(function(au){ return  kb2.holds(au, auth('mode'), auth('Control'))});
    ccc.map(function(au){
        var au2 = kb2.sym(au.uri + "__ACLACL");
            kb2.add(au2, ns.rdf('type'), auth('Authorization'), aclDoc);
            kb2.add(au2, auth('accessTo'), aclDoc, aclDoc);
            kb2.add(au2, auth('mode'), auth('Read'), aclDoc);
            kb2.add(au2, auth('mode'), auth('Write'), aclDoc);
        kb2.each(au, auth('agent')).map(function(who){
            kb2.add(au2, auth('agent'), who, aclDoc);
        });
        kb2.each(au, auth('agentClass')).map(function(who){
            kb2.add(au2, auth('agentClass'), who, aclDoc);
        });
    });
    
    return kb2;
}

tabulator.panes.utils.ACLControlBox = function(subject, dom, callback) {
    var kb = tabulator.kb;
    var updater = new tabulator.rdf.sparqlUpdate(kb);
    var auth = tabulator.ns.auth;
    var doc = $rdf.sym(subject.uri.split('#')[0]); // The ACL is actually to the doc describing the thing

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
        var authorizations = kb.each(undefined, auth('accessTo'), doc, aclDoc); // ONLY LOOK IN ACL DOC
        if (authorizations.length === 0) {
            statusBlock.textContent += "Access control file exists but contains no authorizations! " + aclDoc + ")";
        }
        for (i=0; i < authorizations.length; i++) {
            var row = box.appendChild(dom.createElement('tr'));
            var rowdiv1 = row.appendChild(dom.createElement('div'));
            row.setAttribute('style', 'margin: 1em; border: 0.1em solid black; border-radius: 0.5em; padding: 1em;') // doesn't work
            rowdiv1.setAttribute('style', 'margin: 1em; border: 0.1em solid black; border-radius: 1em; padding: 1em;');
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
            
            kb.each(a,  auth('agent')).map(function(x){
                var tr = leftTable.appendChild(dom.createElement('tr'));
                tabulator.panes.utils.setName(tr, x);
                tr.setAttribute('style', 'min-width: 12em');
            });
            
            kb.each(a,  auth('agentClass')).map(function(x){
                var tr = leftTable.appendChild(dom.createElement('tr'));
                tr.textContent = tabulator.Util.label(x) + ' *'; // for now // later add # or members
            });
            
            kb.each(a,  auth('mode')).map(function(x){
                var tr = rightTable.appendChild(dom.createElement('tr'));
                tr.textContent = tabulator.Util.label(x); // for now // later add # or members
            });
        }
    }

    tabulator.panes.utils.getACL(doc, function(ok, status, aclDoc, message) {
        var i, row, left, right, a;
        var auth = tabulator.ns.auth;
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

        
        // Recursively search for the ACL file which gives default access
        var tryParent = function(uri) {
            if (uri.slice(-1) === '/') {
                uri = uri.slice(0, -1);
            }
            var right = uri.lastIndexOf('/');
            var left = uri.indexOf('/', uri.indexOf('//') + 2);
            uri = uri.slice(0, right + 1);
            var doc2 = $rdf.sym(uri);
            tabulator.panes.utils.getACL(doc2, function(ok, status, aclDoc2) {

                if (!ok) {
                    statusBlock.textContent += ("( No ACL pointer " + uri + ' ' + status + ")");
                } else if (status === 403) {
                    statusBlock.textContent += ("( ACL file FORBIDDEN. Stop." + uri + ")");
                } else if (status === 404) {
                    statusBlock.textContent += ("( No ACL file for set " + uri + ")");
                    if (left >= right) {
                        statusBlock.textContent += ("( Thats all folks.)");
                    } else {
                        tryParent(uri);
                    }
                } else { // 200
                    statusBlock.textContent += (" ACCESS set at " + uri + ". End search.");
                    var defaults = kb.each(undefined, auth('defaultForNew'), kb.sym(uri), aclDoc2);
                    if (!defaults.length) {
                        statusBlock.textContent += " (No defaults given.)";
                    } else {
                        statusBlock.textContent = "The sharing for this group is the default.";
                        var kb2 = tabulator.panes.utils.adoptACLDefault(doc, aclDoc, kb.sym(uri), aclDoc2) 
                        ACLControl(box, doc, aclDoc, kb2); // Add btton to save them as actual
                        
                        var editPlease = bottomRow.appendChild(dom.createElement('button'));
                        editPlease.textContent = "Set specific sharing\nfor this group";
                        editPlease.addEventListener('click', function(event) {
                            updater.put(aclDoc, kb2.statements,
                                'text/turtle', function(uri, ok, message){
                                if (!ok) {
                                    statusBlock.textContent += " (Error writing back access control file: "+message+")";
                                } else {
                                    statusBlock.textContent = " (Now editing specific access for this group)";
                                    bottomRow.removeChild(editPlease);
                                }
                            });

                        });
                    }
                }
            });
        };

        if (!ok) {
            statusBlock.textContent += ("( Access control information not provided " + uri +")");
        } else if (status === 404) {
            statusBlock.textContent = '(No specific access control has been set.)\n'; // error message
            statusBlock.setAttribute('style', 'background-color: #ffe; padding:2em;');
            tryParent(doc.uri);
            //  @@ construct default one - the server should do that
        } else  if (status === 403) {
            statusBlock.textContent = '(Sharing not available to you)'; // error message
        } else  if (status !== 200) {
            statusBlock.textContent = message; // error message
            statusBlock.setAttribute('style', 'background-color: #f99; padding:2em;')
        } else { // 200
            ACLControl(box, doc, aclDoc, kb);
            addDefaultButton();
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
                    callback(true, xhr.status, aclDoc, "Can't read Access Control File " + body);
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
        var cardDoc = kb.sym(subject.uri.split('#')[0]);
        
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
            if (ok) {
            }
            else console.log("Sorry, failed to save your change:\n"+body, 'background-color: pink;');
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
                    var gd = kb.sym(gu.split('#')[0]);
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
           var createNewGroup = function(book, name, callback) {
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
                    gotNameCallback(subject, namefield.value, selectedGroups);
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
                    createdNewContactCallback(false);
                }, false);

                var b = form.appendChild(dom.createElement("button"));
                b.setAttribute("type", "button");
                b.innerHTML = "Continue";
                b.addEventListener('click', function(e) {
                    gotName();
                }, false);
                
                return form;
            };
        
                       
            ////////////////////////////// Three-column Contact Browser
            
            tabulator.fetcher.nowOrWhenFetched(groupIndex.uri, subject, function(ok, body) {
        
                if (!ok) return console.log("Cannot load group index: "+body);
                
                // organization-name is a hack for Mac records with no FN which is mandatory.
                var nameFor = function(x) { 
                    var name = kb.any(x, ns.vcard('fn')) || 
                        kb.any(x, ns.foaf('name')) || kb.any(x, ns.vcard('organization-name')); 
                    return name ? name.value : '???';
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
                
                var cardMain = bookMain.appendChild(dom.createElement('td'));
                cardMain.setAttribute('style', 'margin: 0;'); // fill space available
                var dataCellStyle =  'padding: 0.1em;'
                
                groupsHeader.textContent = "groups";
                groupsHeader.setAttribute('style', 'min-width: 10em; padding-bottom 0.2em;');
                
                peopleHeader.textContent = "name";
                peopleHeader.setAttribute('style', 'min-width: 18em;');
                peopleMain.setAttribute('style','overflow:scroll;');
                // cardHeader.textContent = "contact details"; // clutter
                
                
                var groups = kb.each(subject, ns.vcard('includesGroup'));
                var groups2 = groups.map(function(g){return [ kb.any(g, ns.vcard('fn')), g] })
                groups.sort();
                var selected = {};

                var cardPane = function(dom, subject, paneName) {
                    var p = tabulator.panes.byName(paneName);
                    var d = p.render(subject, dom);
                    d.setAttribute('style', 'border: 0.1em solid #888; border-radius: 0.5em')
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
                    for (var u in selected) {
                        if (selected[u]) {
                            var a = kb.each(kb.sym(u), ns.vcard('hasMember'));
                            // dump('Adding '+ a.length + ' people from ' + u + '\n')
                            cards = cards.concat(a);
                            ng += 1;
                        }
                    }
                    cards.sort(compareForSort); // @@ sort by name not UID later
                    peopleMainTable.innerHTML = ''; // clear
                    peopleHeader.textContent = (cards.length > 5 ? '' + cards.length + " contacts" : "contact");

                    for (var j =0; j < cards.length; j++) {
                        var personRow = peopleMainTable.appendChild(dom.createElement('tr'));
                        personRow.setAttribute('style', dataCellStyle);
                        var person = cards[j];
                        var name = nameFor(person);
                        personRow.textContent = name;
                        personRow.subject = person;

                        var setPersonListener = function toggle(personRow, person) {
                            tabulator.panes.utils.deleteButtonWithCheck(dom, personRow, 'contact', function(){
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
                                })
                           });
                        };
                        setPersonListener(personRow, person);
                    };
    
                }
                
                var refreshGroups = function() {
                    for (i=0; i < groupsMainTable.children.length; i++) {
                        var row = groupsMainTable.children[i];
                        if (row.subject) {
                            row.setAttribute('style', selected[row.subject.uri] ? 'background-color: #cce;' : '');
                        }
                    }
                };
                
                for (var i =0; i<groups2.length; i++) {
                    var name = groups2[i][0];
                    var group = groups2[i][1];
                    //selected[group.uri] = false;
                    var groupRow = groupsMainTable.appendChild(dom.createElement('tr'));
                    groupRow.subject = group;
                    groupRow.setAttribute('style', dataCellStyle);
                    // var groupLeft = groupRow.appendChild(dom.createElement('td'));
                    // var groupRight = groupRow.appendChild(dom.createElement('td'));
                    groupRow.textContent = name;
                    // var checkBox = groupLeft.appendChild(dom.createElement('input'))
                    // checkBox.setAttribute('type', 'checkbox'); // @@ set from personal last settings
                    var foo = function toggle(groupRow, group) {
                        tabulator.panes.utils.deleteButtonWithCheck(dom, groupRow, "group", function(){
                            deleteThing(group);
                        });
                        groupRow.addEventListener('click', function(event){
                            event.preventDefault();
                            var groupList = kb.sym(group.uri.split('#')[0]);
                            if (!event.altKey) {
                                selected = {}; // If alt key pressed, accumulate multiple
                                /*
                                cardMain.innerHTML = ''; 
                                cardMain.appendChild(tabulator.panes.utils.ACLControlBox(group, dom, function(ok, body){
                                    if (!ok) cardMain.innerHTML = "Failed: " + body;
                                }));
                                */
                            }
                            selected[group.uri] = selected[group.uri] ? false : true;
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
                    foo(groupRow, group);
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
                    // cardMain.appendChild(newContactForm(dom, kb, selected, createdNewContactCallback1));
                    cardMain.appendChild(getNameForm(dom, kb, "Contact", selected,
                        function(subject, name, selectedGroups) {
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
                    // cardMain.appendChild(newContactForm(dom, kb, selected, createdNewContactCallback1));
                    cardMain.appendChild(getNameForm(dom, kb, "Group", selected,
                        function(subject, name, selectedGroups) {
                            createNewGroup(subject, name, function(success, body) {
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


