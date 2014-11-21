/*   Issue Tracker Pane
**
**  This outline pane allows a user to interact with an issue,
to change its state according to an ontology, comment on it, etc.
**
**
** I am using in places single quotes strings like 'this'
** where internationalization ("i18n") is not a problem, and double quoted
** like "this" where the string is seen by the user and so I18n is an issue.
*/






//////////////////////////////////////////////////////  SUBCRIPTIONS

$rdf.subscription =  function(options, doc, onChange) {


    //  for all Link: uuu; rel=rrr  --->  { rrr: uuu }
    var linkRels = function(doc) {
        var links = {}; // map relationship to uri
        var linkHeaders = tabulator.sf.getHeader(doc, 'link');
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
        console.log("Found rel=" + rel + " URI: " + changesURI);
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
        var router = new $rdf.UpdatesVia(tabulator.sf); // Pass fetcher do it can subscribe to headers
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
                console.log("End of delta stream " + changesURI);
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

///////////////////////////////// End of subscription stufff 


tabulator.panes.utils.messageArea = function(dom, kb, subject, messageStore) {
    var kb = tabulator.kb;
    var ns = tabulator.ns;
    var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
    var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
    var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
    
    var newestFirst = true;
    
    var div = dom.createElement("div")
    var messageTable; // Shared by initial build and addMessageFromBindings

    var me_uri = tabulator.preferences.get('me');
    var me = me_uri? kb.sym(me_uri) : null;

    var updater = new tabulator.rdf.sparqlUpdate(kb);

    var anchor = function(text, term) {
        var a = dom.createElement('a');
        a.setAttribute('href', term.uri);
        a.addEventListener('click', tabulator.panes.utils.openHrefInOutlineMode, true);
        a.textContent = text;
        a.setAttribute('style', 'color: #3B5998; text-decoration: none; '); // font-weight: bold;
        return a;
    };

    var mention = function mention(message, style){
        var pre = dom.createElement("pre");
        pre.setAttribute('style', style ? style :'color: grey');
        div.appendChild(pre);
        pre.appendChild(dom.createTextNode(message));
        return pre
    } 
    
    var console = {
        log: function(message) {mention(message, 'color: #111;')},
        warn: function(message) {mention(message, 'color: #880;')},
        error: function(message) {mention(message, 'color: #800;')}
    };

    
    //       Form for a new message
    //
    var newMessageForm = function() {
        var form = dom.createElement('tr');
        var lhs = dom.createElement('td');
        var middle = dom.createElement('td');
        var rhs = dom.createElement('td');
        form.appendChild(lhs);
        form.appendChild(middle);
        form.appendChild(rhs);
        form.AJAR_date = "9999-01-01T00:00:00Z"; // ISO format for field sort
        
        var sendMessage = function() {
            // titlefield.setAttribute('class','pendingedit');
            // titlefield.disabled = true;
            field.setAttribute('class','pendingedit');
            field.disabled = true;
            sts = [];
            
            var now = new Date();
            var timestamp = ''+ now.getTime();
            var dateStamp = $rdf.term(now);
            // http://www.w3schools.com/jsref/jsref_obj_date.asp
            var message = kb.sym(messageStore.uri + '#' + 'Msg'+timestamp);
            sts.push(new $rdf.Statement(subject, ns.wf('message'), message, messageStore));
            // sts.push(new $rdf.Statement(message, ns.dc('title'), kb.literal(titlefield.value), messageStore))
            sts.push(new $rdf.Statement(message, ns.sioc('content'), kb.literal(field.value), messageStore))
            sts.push(new $rdf.Statement(message, DCT('created'), dateStamp, messageStore));
            if (me) sts.push(new $rdf.Statement(message, ns.foaf('maker'), me, messageStore));

            var sendComplete = function(uri, success, body) {
                if (!success) {
                    form.appendChild(tabulator.panes.utils.errorMessageBlock(
                            dom, "Error writing message: "+ body));
                } else {
                    var bindings = { '?msg': message,
                                    '?content': kb.literal(field.value),
                                    '?date':  dateStamp,
                                    '?creator': me};
                    addMessageFromBindings(bindings);
                    
                    field.value = ''; // clear from out for reuse
                    field.setAttribute('class','');
                    field.disabled = false;
                }
            }
            updater.update([], sts, sendComplete);
        }
        // form.addEventListener('submit', sendMessage, false)
        // form.setAttribute('onsubmit', "function xx(){return false;}");
        form.appendChild(dom.createElement('br'));

        var field = dom.createElement('textarea');
        middle.appendChild(field);
        field.rows = 3;
        // field.cols = 40;
        field.setAttribute('style', 'width: 90%; font-size:100%; \
                background-color: white; border: 0.07em solid gray; padding: 0.1em; margin: 0.1em 1em 0.1em 1em')

        submit = dom.createElement('button');
        //submit.disabled = true; // until the filled has been modified
        submit.textContent = "Comment"; //@@ I18n
        submit.setAttribute('style', 'float: right;');
        submit.addEventListener('click', sendMessage, false);
        rhs.appendChild(submit);

        return form;
    };
    
    var nick = function(person) {
        var s = tabulator.kb.any(person, tabulator.ns.foaf('nick'));
        if (s) return ''+s.value
        return ''+tabulator.Util.label(person);
    }

/////////////////////////////////////////////////////////////////////////
    
    var syncMessages = function(about, messageTable) {
        var displayed = {};
        for (var ele = messageTable.firstChild; ele ;ele = ele.nextSibling) {
            if (ele.AJAR_subject) {
                displayed[ele.AJAR_subject.uri] = true;
            };
        }
        var messages = kb.each(about, ns.wf('message'));
        var stored = {};
        messages.map(function(m){
            stored[m.uri] = true;
            if (!displayed[m.uri]) {
                addMessage(m);
            };
        });

        for (var ele = messageTable.firstChild; ele;) {
            var ele2 = ele.nextSibling;
            if (ele.AJAR_subject && !stored[ele.AJAR_subject.uri]) {
                messageTable.removeChild(ele);
            }
            ele = ele2;
        }


    }

    var addMessageFromBindings = function(bindings) {
        return addMessage(bindings['?msg']);            
    }
    
    var deleteMessage = function(message) {
        deletions = kb.statementsMatching(message).concat(
                kb.statementsMatching(undefined, undefined, message));
        updater.update(deletions, [], function(uri, ok, body){
            if (!ok) {
                console.log("Cant delete messages:" + body);
            } else {
                syncMessages(subject, messageTable);
            };
        });
    };
    
    var addMessage = function(message) {
        var tr = dom.createElement('tr');
        var date = kb.any(message,  DCT('created'));
        var dateString = date.value;
        tr.AJAR_date = dateString;
        tr.AJAR_subject = message;

        for (var ele = messageTable.firstChild;;ele = ele.nextSibling) {
            if (!ele)  {messageTable.appendChild(tr); break;};
            if (((dateString > ele.AJAR_date) && newestFirst) ||
                        ((dateString < ele.AJAR_date) && !newestFirst)) {
                messageTable.insertBefore(tr, ele);
                break;
            }
        }
        
        var  td1 = dom.createElement('td');
        tr.appendChild(td1);
        
        var creator = kb.any(message, ns.foaf('maker'));
        var nickAnchor = td1.appendChild(anchor(nick(creator), creator));
        tabulator.sf.nowOrWhenFetched($rdf.uri.docpart(creator.uri), undefined, function(ok, body){
            nickAnchor.textContent = nick(creator);
        });
        td1.appendChild(dom.createElement('br'));
        td1.appendChild(anchor(tabulator.panes.utils.shortDate(dateString), message));
        
        var  td2 = dom.createElement('td');
        tr.appendChild(td2);
        var pre = dom.createElement('p')            
        pre.setAttribute('style', 'font-size: 100%; margin: 0.1em 1em 0.1em 1em;  white-space: pre-wrap;')
        td2.appendChild(pre);
        pre.textContent = kb.any(message, ns.sioc('content')).value;  
        
        var td3 = dom.createElement('td');
        tr.appendChild(td3);
        
        var delButton = dom.createElement('button');
        td3.appendChild(delButton);
        delButton.textContent = "-";
        
        tr.setAttribute('class', 'hoverControl'); // See tabbedtab.css (sigh global CSS)
        delButton.setAttribute('class', 'hoverControlHide');
        delButton.setAttribute('style', 'color: red;');
        delButton.addEventListener('click', function(e) {
            td3.removeChild(delButton);  // Ask -- are you sure?
            var cancelButton = dom.createElement('button');
            cancelButton.textContent = "cancel";
            td3.appendChild(cancelButton).addEventListener('click', function(e) {
                td3.removeChild(sureButton);
                td3.removeChild(cancelButton);
                td3.appendChild(delButton);
            }, false);
            var sureButton = dom.createElement('button');
            sureButton.textContent = "Delete message";
            td3.appendChild(sureButton).addEventListener('click', function(e) {
                td3.removeChild(sureButton);
                td3.removeChild(cancelButton);
                deleteMessage(message);   
            }, false);
        }, false);
    };


    // Messages with date, author etc

    messageTable = dom.createElement('table');
    div.appendChild(messageTable);

    if (tabulator.preferences.get('me')) {
        var tr = newMessageForm();
        if (newestFirst) {
            messageTable.insertBefore(tr, messageTable.firstChild); // If newestFirst
        } else {
            messageTable.appendChild(tr); // not newestFirst
        }
    };
    
    var msg = kb.any(subject, WF('message'));
    if (msg != undefined) {
        var str = ''
        // Do this with a live query to pull in messages from web
        var query = new $rdf.Query('Messages');
        var v = {};
        ['msg', 'title', 'date', 'creator', 'content'].map(function(x){
             query.vars.push(v[x]=$rdf.variable(x))});
        query.pat.add(subject, WF('message'), v['msg']);
//                    query.pat.add(v['msg'], ns.dc('title'), v['title']);
        query.pat.add(v['msg'], ns.dct('created'), v['date']);
        query.pat.add(v['msg'], ns.foaf('maker'), v['creator']);
        query.pat.add(v['msg'], ns.sioc('content'), v['content']);
        var esc = tabulator.Util.escapeForXML;
        // dump("\nquery.pat = "+query.pat+"\n");

        kb.query(query, addMessageFromBindings);
    }
/*
    var refreshButton = dom.createElement('button');
    refreshButton.textContent = "refresh";
    refreshButton.addEventListener('click', function(e) {
        tabulator.sf.unload(messageStore);
        tabulator.sf.nowOrWhenFetched(messageStore.uri, undefined, function(ok, body){
            if (!ok) {
                console.log("Cant refresh messages" + body);
            } else {
                syncMessages(subject, messageTable);
            };
        });
    }, false);
    div.appendChild(refreshButton);
*/    
    div.refresh = function() {
        syncMessages(subject, messageTable);
    };
    

    return div;
};






    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_bug = iconPrefix + 'js/panes/issue/tbl-bug-22.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_bug] = 'Track issue'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_bug,
    
    name: 'issue',
    
    // Does the subject deserve an issue pane?
    label: function(subject) {
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        if (t['http://www.w3.org/2005/01/wf/flow#Task']) return "issue";
        if (t['http://www.w3.org/2005/01/wf/flow#Tracker']) return "tracker";
        // Later: Person. For a list of things assigned to them,
        // open bugs on projects they are developer on, etc
        return null; // No under other circumstances (while testing at least!)
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var div = dom.createElement("div")
        div.setAttribute('class', 'issuePane');
        div.innherHTML='<h1>Issue</h1><p>This is a pane under development</p>';

        var commentFlter = function(pred, inverse) {
            if (!inverse && pred.uri == 
                'http://www.w3.org/2000/01/rdf-schema#comment') return true;
            return false
        }
        
        var setModifiedDate = function(subj, kb, doc) {
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, WF('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, WF('modifiedBy'), me, doc) );
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


        //  Form to collect data about a New Issue
        //
        var newIssueForm = function(dom, kb, tracker, superIssue) {
            var form = dom.createElement('div');  // form is broken as HTML behaviour can resurface on js error
            var stateStore = kb.any(tracker, WF('stateStore'));

            var sendNewIssue = function() {
                titlefield.setAttribute('class','pendingedit');
                titlefield.disabled = true;
                sts = [];
                
                var issue = kb.sym(stateStore.uri + '#' + 'Iss'+timestring());
                sts.push(new $rdf.Statement(issue, WF('tracker'), tracker, stateStore));
                var title = kb.literal(titlefield.value);
                sts.push(new $rdf.Statement(issue, DC('title'), title, stateStore))
                
                // sts.push(new $rdf.Statement(issue, ns.rdfs('comment'), "", stateStore))
                sts.push(new $rdf.Statement(issue, DCT('created'), new Date(), stateStore));

                var initialStates = kb.each(tracker, WF('initialState'));
                if (initialStates.length == 0) console.log('This tracker has no initialState');
                for (var i=0; i<initialStates.length; i++) {
                    sts.push(new $rdf.Statement(issue, ns.rdf('type'), initialStates[i], stateStore))
                }
                if (superIssue) sts.push (new $rdf.Statement(superIssue, WF('dependent'), issue, stateStore));
                var sendComplete = function(uri, success, body) {
                    if (!success) {
                         console.log("Error: can\'t save new issue:" + body);
                        //dump('Tabulator issue pane: can\'t save new issue:\n\t'+body+'\n')
                    } else {
                        // dump('Tabulator issue pane: saved new issue\n')
                        form.parentNode.removeChild(form);
                        rerender(div);
                        tabulator.outline.GotoSubject(issue, true, undefined, true, undefined);
                        // tabulator.outline.GoToURI(issue.uri); // ?? or open in place?
                    }
                }
                updater.update([], sts, sendComplete);
            }
            //form.addEventListener('submit', function() {try {sendNewIssue} catch(e){console.log('sendNewIssue: '+e)}}, false)
            //form.setAttribute('onsubmit', "function xx(){return false;}");
            
            
            
            tabulator.sf.removeCallback('done','expand'); // @@ experimental -- does this kill the re-paint? no
            tabulator.sf.removeCallback('fail','expand');

            
            var states = kb.any(tracker, WF('issueClass'));
            classLabel = tabulator.Util.label(states);
            form.innerHTML = "<h2>Add new "+ (superIssue?"sub ":"")+
                    classLabel+"</h2><p>Title of new "+classLabel+":</p>";
            var titlefield = dom.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','100');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input
            titlefield.addEventListener('keyup', function(e) {
                if(e.keyCode == 13) {
                    sendNewIssue();
                }
            }, false);
            form.appendChild(titlefield);
            return form;
        };
        
        

                                                  
        /////////////////////// Reproduction: Spawn a new instance of this app
        
        var newTrackerButton = function(thisTracker) {
            return tabulator.panes.utils.newAppInstance(dom, "Start your own new tracker", function(ws){
        
                var appPathSegment = 'issuetracker.w3.org'; // how to allocate this string and connect to 

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

                var stateStore = kb.any(tracker, WF('stateStore'));
                var newStore = kb.sym(base + 'store.ttl');

                var here = documentOf(thisTracker);

                var oldBase = here.uri.slice(0, here.uri.lastIndexOf('/')+1);

                var morph = function(x) { // Move any URIs in this space into that space
                    if (x.elements !== undefined) return x.elements.map(morph); // Morph within lists
                    if (x.uri === undefined) return x;
                    var u = x.uri;
                    if (u === stateStore.uri) return newStore; // special case
                    if (u.slice(0, oldBase.length) === oldBase) {
                        u = base + u.slice(oldBase.length);
                        $rdf.log.debug(" Map "+ x.uri + " to " + u);
                    }
                    return kb.sym(u);
                }
                var there = morph(here);
                var newTracker = morph(thisTracker); 
                
                var myConfig = kb.statementsMatching(undefined, undefined, undefined, here);
                for (var i=0; i < myConfig.length; i++) {
                    st = myConfig[i];
                    kb.add(morph(st.subject), morph(st.predicate), morph(st.object), there);
                }
                
                // Keep a paper trail   @@ Revisit when we have non-public ones @@ Privacy
                //
                kb.add(newTracker, tabulator.ns.space('inspiration'), thisTracker, stateStore);
                
                kb.add(newTracker, tabulator.ns.space('inspiration'), thisTracker, there);
                
                // $rdf.log.debug("\n Ready to put " + kb.statementsMatching(undefined, undefined, undefined, there)); //@@


                updater.put(
                    there,
                    kb.statementsMatching(undefined, undefined, undefined, there),
                    'text/turtle',
                    function(uri2, ok, message) {
                        if (ok) {
                            updater.put(newStore, [], 'text/turtle', function(uri3, ok, message) {
                                if (ok) {
                                    console.info("Ok The tracker created OK at: " + newTracker.uri +
                                    "\nMake a note of it, bookmark it. ");
                                } else {
                                    console.log("FAILED to set up new store at: "+ newStore.uri +' : ' + message);
                                };
                            });
                        } else {
                            console.log("FAILED to save new tracker at: "+ there.uri +' : ' + message);
                        };
                    }
                );
                
                // Created new data files.
                // @@ Now create initial files - html skin, (Copy of mashlib, css?)
                // @@ Now create form to edit configuation parameters
                // @@ Optionally link new instance to list of instances -- both ways? and to child/parent?
                // @@ Set up access control for new config and store. 
                
            }); // callback to newAppInstance

            
        }; // newTrackerButton

 
 
///////////////////////////////////////////////////////////////////////////////
        
        
        
        var updater = new tabulator.rdf.sparqlUpdate(kb);

 
        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;


        // Reload resorce then
        
        var reloadStore = function(store, callBack) {
            tabulator.sf.unload(store);
            tabulator.sf.nowOrWhenFetched(store.uri, undefined, function(ok, body){
                if (!ok) {
                    console.log("Cant refresh data:" + body);
                } else {
                    callBack();
                };
            });
        };



        // Refresh the DOM tree
      
        refreshTree = function(root) {
            if (root.refresh) {
                root.refresh();
                return;
            }
            for (var i=0; i < root.children.length; i++) {
                refreshTree(root.children[i]);
            }
        }



        //              Render a single issue
        
        if (t["http://www.w3.org/2005/01/wf/flow#Task"]) {

            var tracker = kb.any(subject, WF('tracker'));
            if (!tracker) throw 'This issue '+subject+'has no tracker';
            
            var trackerURI = tracker.uri.split('#')[0];
            // Much data is in the tracker instance, so wait for the data from it
            tabulator.sf.nowOrWhenFetched(trackerURI, subject, function drawIssuePane(ok, body) {
                if (!ok) return console.log("Failed to load " + trackerURI + ' '+body);
                var ns = tabulator.ns
                var predicateURIsDone = {};
                var donePredicate = function(pred) {predicateURIsDone[pred.uri]=true};
                donePredicate(ns.rdf('type'));
                donePredicate(ns.dc('title'));




                var setPaneStyle = function() {
                    var types = kb.findTypeURIs(subject);
                    var mystyle = "padding: 0.5em 1.5em 1em 1.5em; ";
                    for (var uri in types) {
                        var backgroundColor = kb.any(kb.sym(uri), kb.sym('http://www.w3.org/ns/ui#backgroundColor'));
                        if (backgroundColor) { mystyle += "background-color: "+backgroundColor.value+"; "; break;}
                    }
                    div.setAttribute('style', mystyle);
                }
                setPaneStyle();
                
                var stateStore = kb.any(tracker, WF('stateStore'));
                var store = kb.sym(subject.uri.split('#')[0]);
/*                if (stateStore != undefined && store.uri != stateStore.uri) {
                    console.log('(This bug is not stored in the default state store)')
                }
*/

                // Unfinished -- need this for speed to save the reloadStore below
                var incommingPatch = function(text) {
                    var contentType = xhr.headers['content-type'].trim();
                    var patchKB = $rdf.graph();
                    $rdf.parse(patchText, patchKB, doc.uri, contentType);
                    // @@ TBC: check this patch isn't one of ours
                    // @@ TBC: kb.applyPatch();  @@@@@ code me
                    refreshTree(div);
                    say("Tree Refreshed!!!");
                }


                var subopts = { 'longPoll': true };
                $rdf.subscription(subopts, stateStore, function() {
                    reloadStore(stateStore, function(deltaText) {
                        refreshTree(div);
                        say("Tree Refreshed!!!");
                    });
                });



                tabulator.panes.utils.checkUserSetMe(dom, stateStore);

                
                var states = kb.any(tracker, WF('issueClass'));
                if (!states) throw 'This tracker '+tracker+' has no issueClass';
                var select = tabulator.panes.utils.makeSelectForCategory(dom, kb, subject, states, store, function(ok,body){
                        if (ok) {
                            setModifiedDate(store, kb, store);
                            rerender(div);
                        }
                        else console.log("Failed to change state:\n"+body);
                    })
                div.appendChild(select);


                var cats = kb.each(tracker, WF('issueCategory')); // zero or more
                for (var i=0; i<cats.length; i++) {
                    div.appendChild(tabulator.panes.utils.makeSelectForCategory(dom, 
                            kb, subject, cats[i], store, function(ok,body){
                        if (ok) {
                            setModifiedDate(store, kb, store);
                            rerender(div);
                        }
                        else console.log("Failed to change category:\n"+body);
                    }));
                }
                
                var a = dom.createElement('a');
                a.setAttribute('href',tracker.uri);
                a.setAttribute('style', 'float:right');
                div.appendChild(a).textContent = tabulator.Util.label(tracker);
                a.addEventListener('click', tabulator.panes.utils.openHrefInOutlineMode, true);
                donePredicate(ns.wf('tracker'));


                div.appendChild(tabulator.panes.utils.makeDescription(dom, kb, subject, WF('description'),
                    store, function(ok,body){
                        if (ok) setModifiedDate(store, kb, store);
                        else console.log("Failed to description:\n"+body);
                    }));
                donePredicate(WF('description'));



                // Assigned to whom?
                
                var assignees = kb.each(subject, ns.wf('assignee'));
                if (assignees.length > 1) throw "Error:"+subject+"has "+assignees.length+" > 1 assignee.";
                var assignee = assignees.length ? assignees[0] : null;
                // Who could be assigned to this?
                // Anyone assigned to any issue we know about  @@ should be just for this tracker
                var sts = kb.statementsMatching(undefined,  ns.wf('assignee'));
                var devs = sts.map(function(st){return st.object});
                // Anyone who is a developer of any project which uses this tracker
                var proj = kb.any(undefined, ns.doap('bug-database'), tracker);
                if (proj) devs = devs.concat(kb.each(proj, ns.doap('developer')));
                if (devs.length) {
                    devs.map(function(person){tabulator.sf.lookUpThing(person)}); // best effort async for names etc
                    var opts = { 'mint': "** Add new person **",
                                'nullLabel': "(unassigned)",
                                'mintStatementsFun': function(newDev) {
                                    var sts = [ $rdf.st(newDev, ns.rdf('type'), ns.foaf('Person'))];
                                    if (proj) sts.push($rdf.st(proj, ns.doap('developer'), newDev))
                                    return sts;
                                }};
                    div.appendChild(tabulator.panes.utils.makeSelectForOptions(dom, kb,
                        subject, ns.wf('assignee'), devs, opts, store,
                        function(ok,body){
                            if (ok) setModifiedDate(store, kb, store);
                            else console.log("Failed to description:\n"+body);
                        }));
                }
                donePredicate(ns.wf('assignee'));


                var allowSubIssues = kb.any(tracker, ns.ui('allowSubIssues'));
                if (allowSubIssues && allowSubIssues.value) {
                    // Sub issues
                    tabulator.outline.appendPropertyTRs(div, plist, false,
                        function(pred, inverse) {
                            if (!inverse && pred.sameTerm(WF('dependent'))) return true;
                            return false
                        });

                    // Super issues
                    tabulator.outline.appendPropertyTRs(div, qlist, true,
                        function(pred, inverse) {
                            if (inverse && pred.sameTerm(WF('dependent'))) return true;
                            return false
                        });
                    donePredicate(WF('dependent'));
                }

                div.appendChild(dom.createElement('br'));

                 var allowSubIssues = kb.any(tracker, ns.ui('allowSubIssues'));
                if (allowSubIssues && allowSubIssues.value) {
                    var b = dom.createElement("button");
                    b.setAttribute("type", "button");
                    div.appendChild(b)
                    classLabel = tabulator.Util.label(states);
                    b.innerHTML = "New sub "+classLabel;
                    b.setAttribute('style', 'float: right; margin: 0.5em 1em;');
                    b.addEventListener('click', function(e) {
                        div.appendChild(newIssueForm(dom, kb, tracker, subject))}, false);
                };

                var extrasForm = kb.any(tracker, ns.wf('extrasEntryForm'));
                if (extrasForm) {
                    tabulator.panes.utils.appendForm(dom, div, {},
                                subject, extrasForm, stateStore, complainIfBad);
                    var fields = kb.each(extrasForm, ns.ui('part'));
                    fields.map(function(field) {
                        var p = kb.any(field, ns.ui('property'));
                        if (p) {
                            donePredicate(p); // Check that one off
                        }
                    });
                    
                };
                
                //   Comment/discussion area
                
                var messageStore = kb.any(tracker, ns.wf('messageStore'));
                if (!messageStore) messageStore = kb.any(tracker, WF('stateStore'));                
                div.appendChild(tabulator.panes.utils.messageArea(dom, kb, subject, messageStore));
                donePredicate(ns.wf('message'));
                

/*
                // Add in simple comments about the bug - if not already in extras form.
                if (!predicateURIsDone[ns.rdfs('comment').uri]) {
                    tabulator.outline.appendPropertyTRs(div, plist, false,
                        function(pred, inverse) {
                            if (!inverse && pred.sameTerm(ns.rdfs('comment'))) return true;
                            return false
                        });
                    donePredicate(ns.rdfs('comment'));
                };
*/
                div.appendChild(dom.createElement('tr'))
                            .setAttribute('style','height: 1em'); // spacer
                
                // Remaining properties
                tabulator.outline.appendPropertyTRs(div, plist, false,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                    });
                tabulator.outline.appendPropertyTRs(div, qlist, true,
                    function(pred, inverse) {
                        return !(pred.uri in predicateURIsDone)
                    });
                    
                var refreshButton = dom.createElement('button');
                refreshButton.textContent = "refresh";
                refreshButton.addEventListener('click', function(e) {
                    tabulator.sf.unload(messageStore);
                    tabulator.sf.nowOrWhenFetched(messageStore.uri, undefined, function(ok, body){
                        if (!ok) {
                            console.log("Cant refresh messages" + body);
                        } else {
                            refreshTree(div);
                            // syncMessages(subject, messageTable);
                        };
                    });
                }, false);
                div.appendChild(refreshButton);



                    
            });  // End nowOrWhenFetched tracker

    ///////////////////////////////////////////////////////////

        //          Render a Tracker instance
        
        } else if (t['http://www.w3.org/2005/01/wf/flow#Tracker']) {
            var tracker = subject;
            
            var states = kb.any(subject, WF('issueClass'));
            if (!states) throw 'This tracker has no issueClass';
            var stateStore = kb.any(subject, WF('stateStore'));
            if (!stateStore) throw 'This tracker has no stateStore';
            
            tabulator.panes.utils.checkUserSetMe(dom, stateStore);
            
            var cats = kb.each(subject, WF('issueCategory')); // zero or more
            
            var h = dom.createElement('h2');
            h.setAttribute('style', 'font-size: 150%');
            div.appendChild(h);
            classLabel = tabulator.Util.label(states);
            h.appendChild(dom.createTextNode(classLabel+" list")); // Use class label @@I18n

            // New Issue button
            var b = dom.createElement("button");
            var container = dom.createElement("div");
            b.setAttribute("type", "button");
            if (!me) b.setAttribute('disabled', 'true')
            container.appendChild(b);
            div.appendChild(container);
            b.innerHTML = "New "+classLabel;
            b.addEventListener('click', function(e) {
                    b.setAttribute('disabled', 'true');
                    container.appendChild(newIssueForm(dom, kb, subject));
                }, false);
            
            // Table of issues - when we have the main issue list
            tabulator.sf.nowOrWhenFetched(stateStore.uri, subject, function(ok, body) {
                if (!ok) return console.log("Cannot load state store "+body);
                var query = new $rdf.Query(tabulator.Util.label(subject));
                var cats = kb.each(tracker, WF('issueCategory')); // zero or more
                var vars =  ['issue', 'state', 'created'];
                for (var i=0; i<cats.length; i++) { vars.push('_cat_'+i) };
                var v = {}; // The RDF variable objects for each variable name
                vars.map(function(x){query.vars.push(v[x]=$rdf.variable(x))});
                query.pat.add(v['issue'], WF('tracker'), tracker);
                //query.pat.add(v['issue'], ns.dc('title'), v['title']);
                query.pat.add(v['issue'], ns.dct('created'), v['created']);
                query.pat.add(v['issue'], ns.rdf('type'), v['state']);
                query.pat.add(v['state'], ns.rdfs('subClassOf'), states);
                for (var i=0; i<cats.length; i++) {
                    query.pat.add(v['issue'], ns.rdf('type'), v['_cat_'+i]);
                    query.pat.add(v['_cat_'+i], ns.rdfs('subClassOf'), cats[i]);
                }
                
                query.pat.optional = [];
                
                var propertyList = kb.any(tracker, WF('propertyList')); // List of extra properties
                // console.log('Property list: '+propertyList); //
                if (propertyList) {
                    properties = propertyList.elements;
                    for (var p=0; p < properties.length; p++) {
                        var prop = properties[p];
                        var vname = '_prop_'+p;
                        if (prop.uri.indexOf('#') >= 0) {
                            vname = prop.uri.split('#')[1];
                        }
                        var oneOpt = new $rdf.IndexedFormula();
                        query.pat.optional.push(oneOpt);
                        query.vars.push(v[vname]=$rdf.variable(vname));
                        oneOpt.add(v['issue'], prop, v[vname]);
                    }
                }
                
            
                // console.log('Query pattern is:\n'+query.pat);
                // console.log('Query pattern optional is:\n'+opts); 
            
                var selectedStates = {};
                var possible = kb.each(undefined, ns.rdfs('subClassOf'), states);
                possible.map(function(s){
                    if (kb.holds(s, ns.rdfs('subClassOf'), WF('Open')) || s.sameTerm(WF('Open'))) {
                        selectedStates[s.uri] = true;
                        // console.log('on '+s.uri); // @@
                    };
                });
                
                        
                var tableDiv = tabulator.panes.utils.renderTableViewPane(dom, {'query': query,
                    'hints': {
                        '?created': { 'cellFormat': 'shortDate'},
                        '?state': { 'initialSelection': selectedStates }}} );
                div.appendChild(tableDiv);

                if (tableDiv.refresh) { // Refresh function
                    var refreshButton = dom.createElement('button');
                    refreshButton.textContent = "refresh";
                    refreshButton.addEventListener('click', function(e) {
                        tabulator.sf.unload(stateStore);
                        tabulator.sf.nowOrWhenFetched(stateStore.uri, undefined, function(ok, body){
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
                            
                
                
                
            });
            div.appendChild(dom.createElement('hr'));
            div.appendChild(newTrackerButton(subject));
            // end of Tracker instance


        } else { 
            console.log("Error: Issue pane: No evidence that "+subject+" is either a bug or a tracker.")
        }         
        if (!tabulator.preferences.get('me')) {
            console.log("(You do not have your Web Id set. Sign in or sign up to make changes.)");
        } else {
            // console.log("(Your webid is "+ tabulator.preferences.get('me')+")");
        };
        
        
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
        
        loginOutButton.setAttribute('style', 'float: right'); // float the beginning of the end

        div.appendChild(loginOutButton);
        
        
        return div;

    }
}, true);

//ends


