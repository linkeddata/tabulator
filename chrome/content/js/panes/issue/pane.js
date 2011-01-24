/*   Issue Tracker Pane
**
**  This outline pane allows a user to interact with an issue,
to change its state according to an ontology, comment on it, etc.
**
**
** As an experiment, I am using in places single quotes strings like 'this'
** where internationalizatio ("i18n") is not a problem, and double quoted
** like "this" where th string is seen by the user and so I18n is an issue.
*/

    
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

    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var div = myDocument.createElement("div")
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
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'color: grey');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, myDocument);
            parent.replaceChild(div2, div);
        };

        var shortDate = function(str) {
            var now = $rdf.term(new Date()).value;
            if (str.slice(0,10) == now.slice(0,10)) return str.slice(11,16);
            return str.slice(0,10);
        }

        //  Form to collect data about a New Issue
        //
        var newIssueForm = function(myDocument, kb, tracker, superIssue) {
            var form = myDocument.createElement('form');
            var stateStore = kb.any(tracker, WF('stateStore'));

            var sendNewIssue = function() {
                titlefield.setAttribute('class','pendingedit');
                titlefield.disabled = true;
                sts = [];
                
                var now = new Date();
                var timestamp = ''+ now.getTime();
                // http://www.w3schools.com/jsref/jsref_obj_date.asp
                var issue = kb.sym(stateStore.uri + '#' + 'Iss'+timestamp);
                sts.push(new $rdf.Statement(issue, WF('tracker'), tracker, stateStore));
                var title = kb.literal(titlefield.value);
                sts.push(new $rdf.Statement(issue, DC('title'), title, stateStore))
                
                // sts.push(new $rdf.Statement(issue, ns.rdfs('comment'), "", stateStore))
                sts.push(new $rdf.Statement(issue, DCT('created'), new Date(), stateStore));

                var initialStates = kb.each(tracker, WF('initialState'));
                if (initialStates.length == 0) complain('This tracker has no initialState');
                for (var i=0; i<initialStates.length; i++) {
                    sts.push(new $rdf.Statement(issue, ns.rdf('type'), initialStates[i], stateStore))
                }
                if (superIssue) sts.push (new $rdf.Statement(superIssue, WF('dependent'), issue, stateStore));
                var sendComplete = function(uri, success, body) {
                    if (!success) {
                        //dump('Tabulator issue pane: can\'t save new issue:\n\t'+body+'\n')
                    } else {
                        // dump('Tabulator issue pane: saved new issue\n')
                        div.removeChild(form);
                        rerender(div);
                        tabulator.outline.GotoSubject(issue, true, undefined, true, undefined);
                        // tabulator.outline.GoToURI(issue.uri); // ?? or open in place?
                    }
                }
                sparqlService.update([], sts, sendComplete);
            }
            form.addEventListener('submit', sendNewIssue, false)
            form.setAttribute('onsubmit', "function xx(){return false;}");
            var states = kb.any(tracker, WF('issueClass'));
            classLabel = tabulator.Util.label(states);
            form.innerHTML = "<h2>Add new "+ (superIssue?"sub ":"")+
                    classLabel+"</h2><p>Title of new "+classLabel+":</p>";
            var titlefield = myDocument.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','100');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input
            form.appendChild(titlefield);
            return form;
        };
        
       //       Form for a new message
        //
        var newMessageForm = function(myDocument, kb, about, storeDoc) {
            var form = myDocument.createElement('form');
            var issue = about;

            var sendMessage = function() {
                // titlefield.setAttribute('class','pendingedit');
                // titlefield.disabled = true;
                field.setAttribute('class','pendingedit');
                field.disabled = true;
                sts = [];
                
                var now = new Date();
                var timestamp = ''+ now.getTime();
                // http://www.w3schools.com/jsref/jsref_obj_date.asp
                var message = kb.sym(storeDoc.uri + '#' + 'Msg'+timestamp);
                sts.push(new $rdf.Statement(about, ns.wf('message'), message, storeDoc));
                // sts.push(new $rdf.Statement(message, ns.dc('title'), kb.literal(titlefield.value), storeDoc))
                sts.push(new $rdf.Statement(message, ns.sioc('content'), kb.literal(field.value), storeDoc))
                sts.push(new $rdf.Statement(message, DCT('created'), new Date(), storeDoc));
                if (me) sts.push(new $rdf.Statement(message, ns.foaf('maker'), me, storeDoc));

                var sendComplete = function(uri, success, body) {
                    if (!success) {
                        //dump('Tabulator issue pane: can\'t save new message:\n\t'+body+'\n')
                    } else {
                        form.parentNode.removeChild(form);
                        rerender(div);
                    }
                }
                sparqlService.update([], sts, sendComplete);
            }
            form.addEventListener('submit', sendMessage, false)
            form.setAttribute('onsubmit', "function xx(){return false;}");
            // label = tabulator.Util.label(ns.dc('title')); // Localise
            // form.innerHTML = "<p>"+label+":</p>";
                    
/*
            var titlefield = myDocument.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','80');
            titlefield.setAttribute('style', 'margin: 0.1em 1em 0.1em 1em');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input - doesn't work @@
            form.appendChild(titlefield);
*/
            form.appendChild(myDocument.createElement('br'));

            var field = myDocument.createElement('textarea');
            form.appendChild(field);
            field.rows = 8;
            field.cols = 80;
            field.setAttribute('style', 'font-size:100%; \
                    background-color: white; border: 0.07em solid gray; padding: 0.1em; margin: 0.1em 1em 0.1em 1em')

            form.appendChild(myDocument.createElement('br'));

            submit = myDocument.createElement('input');
            submit.setAttribute('type', 'submit');
            //submit.disabled = true; // until the filled has been modified
            submit.value = "Send"; //@@ I18n
            submit.setAttribute('style', 'float: right;');
            form.appendChild(submit);

            return form;
        };
                             
 // //////////////////////////////////////////////////////////////////////////////       
        
        
        
        var sparqlService = new tabulator.rdf.sparqlUpdate(kb);

 
        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;


        //              Render a single issue
        
        if (t["http://www.w3.org/2005/01/wf/flow#Task"]) {

            var tracker = kb.any(subject, WF('tracker'));
            if (!tracker) throw 'This issue '+subject+'has no tracker';
            
            var trackerURI = tracker.uri.split('#')[0];
            // Much data is in the tracker instance, so wait for the data from it
            tabulator.sf.nowOrWhenFetched(trackerURI, subject, function drawIssuePane() {
            
                var ns = tabulator.ns
                var predicateURIsDone = {};
                var donePredicate = function(pred) {predicateURIsDone[pred.uri]=true};
                donePredicate(ns.rdf('type'));
                donePredicate(ns.dc('title'));


                var setPaneStyle = function() {
                    var types = kb.findTypeURIs(subject);
                    var mystyle = "padding: 0.5em 1.5em 1em 1.5em; ";
                    for (var uri in types) {
                        var backgroundColor = kb.any(kb.sym(uri), kb.sym('http://www.w3.org/ns/ui#background-color'));
                        if (backgroundColor) { mystyle += "background-color: "+backgroundColor.value+"; "; break;}
                    }
                    div.setAttribute('style', mystyle);
                }
                setPaneStyle();
                
                var stateStore = kb.any(tracker, WF('stateStore'));
                var store = kb.sym(subject.uri.split('#')[0]);
/*                if (stateStore != undefined && store.uri != stateStore.uri) {
                    complain('(This bug is not stored in the default state store)')
                }
*/
                var states = kb.any(tracker, WF('issueClass'));
                if (!states) throw 'This tracker '+tracker+' has no issueClass';
                var select = tabulator.panes.utils.makeSelectForCategory(myDocument, kb, subject, states, store, function(ok,body){
                        if (ok) {
                            setModifiedDate(store, kb, store);
                            rerender(div);
                        }
                        else complain("Failed to change state:\n"+body);
                    })
                div.appendChild(select);


                var cats = kb.each(tracker, WF('issueCategory')); // zero or more
                for (var i=0; i<cats.length; i++) {
                    div.appendChild(tabulator.panes.utils.makeSelectForCategory(myDocument, 
                            kb, subject, cats[i], store, function(ok,body){
                        if (ok) {
                            setModifiedDate(store, kb, store);
                            rerender(div);
                        }
                        else complain("Failed to change category:\n"+body);
                    }));
                }
                
                var a = myDocument.createElement('a');
                a.setAttribute('href',tracker.uri);
                a.setAttribute('style', 'float:right');
                div.appendChild(a).textContent = tabulator.Util.label(tracker);
                donePredicate(ns.wf('tracker'));


                div.appendChild(tabulator.panes.utils.makeDescription(myDocument, kb, subject, WF('description'),
                    store, function(ok,body){
                        if (ok) setModifiedDate(store, kb, store);
                        else complain("Failed to description:\n"+body);
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
                    div.appendChild(tabulator.panes.utils.makeSelectForOptions(myDocument, kb,
                        subject, ns.wf('assignee'), devs, false, "-- unassigned --", store,
                        function(ok,body){
                            if (ok) setModifiedDate(store, kb, store);
                            else complain("Failed to description:\n"+body);
                        }));
                }

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


                div.appendChild(myDocument.createElement('br'));

                if (stateStore) {
                    var b = myDocument.createElement("button");
                    b.setAttribute("type", "button");
                    div.appendChild(b)
                    classLabel = tabulator.Util.label(states);
                    b.innerHTML = "New sub "+classLabel;
                    b.setAttribute('style', 'float: right; margin: 0.5em 1em;');
                    b.addEventListener('click', function(e) {
                        div.appendChild(newIssueForm(myDocument, kb, tracker, subject))}, false);
                };

                // Messages with date, author etc

                var table = myDocument.createElement('table');
                div.appendChild(table);
                if (me) {
                    var docStore = kb.any(tracker, ns.wf('messageStore'));
                    if (!docStore) docStore = stateStore;
                    var b = myDocument.createElement("button");
                    b.setAttribute("type", "button");
                    div.insertBefore(b, table);
                    label = tabulator.Util.label(ns.wf('message'));
                    b.innerHTML = "New " + label;
                    b.setAttribute('style', 'margin: 0.5em 1em;');
                    b.addEventListener('click', function(e) {
                        var tr = myDocument.createElement('tr')
                        table.insertBefore(tr, table.firstChild);
                        var td = myDocument.createElement('td');
                        td.innerHTML = 'Title:<br><br>Your message:'
                        tr.appendChild(td);
                        td = myDocument.createElement('td');
                        tr.appendChild(td);
                        // Actually we only need to know it is editable - we could HEAD not GET
                        kb.sf.nowOrWhenFetched(stateStore.uri, subject, function(){td.appendChild(newMessageForm(myDocument, kb, subject, docStore))});
                    }, false);
                }
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
                    var nick = function(person) {
                        var s = kb.any(person, ns.foaf('nick'));
                        if (s) return ''+s.value
                        return ''+tabulator.Util.label(person);
                    }
                    var addLine = function(bindings) {
                        //dump("Message, date="+bindings['?date']+"\n");
                        var date = bindings['?date'].value;
                        var tr = myDocument.createElement('tr');
                        for (var ele = table.firstChild;;ele = ele.nextSibling) {
                            if (!ele)  {table.appendChild(tr); break;};
                            if (date > ele.AJAR_date) { // newest first
                                table.insertBefore(tr, ele);
                                break;
                            }
                        }
                        tr.AJAR_date = date;
                        var  td1 = myDocument.createElement('td');
                        tr.appendChild(td1);

                        var a = myDocument.createElement('a');
                        a.setAttribute('href',bindings['?msg'].uri);
                        td1.appendChild(a).textContent = shortDate(date);
                        td1.appendChild(myDocument.createElement('br'));
                        var a = myDocument.createElement('a');
                        a.setAttribute('href',bindings['?creator'].uri);
                        td1.appendChild(a).textContent = nick(bindings['?creator']);
                        
                        var  td2 = myDocument.createElement('td');
                        tr.appendChild(td2);
                        var pre = myDocument.createElement('pre')
                        
                        pre.setAttribute('style', 'margin: 0.1em 1em 0.1em 1em')
                        td2.appendChild(pre);
                        pre.textContent = bindings['?content'].value;

                        /* tr.innerHTML = '<td>'+esc(bindings['?date'].value)+
                                '  '+esc(nick(bindings['?creator']))+
                                '</td><td><pre>'+esc(bindings['?content'].value)+
                                '</pre></td>'; */ // Doesn't work - misses out td's

                        
                    };
                    // dump("\nquery.pat = "+query.pat+"\n");
                    kb.query(query, addLine);
                }
                donePredicate(ns.wf('message'));
                


                // Add in simple comments about the bug
                tabulator.outline.appendPropertyTRs(div, plist, false,
                    function(pred, inverse) {
                        if (!inverse && pred.uri == 
                            "http://www.w3.org/2000/01/rdf-schema#comment") return true;
                        return false
                    });

                div.appendChild(myDocument.createElement('tr'))
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
            });  // End nowOrWhenFetched tracker



        //          Render a Tracker instance
        
        } else if (t['http://www.w3.org/2005/01/wf/flow#Tracker']) {
            var tracker = subject;
            
            var states = kb.any(subject, WF('issueClass'));
            if (!states) throw 'This tracker has no issueClass';
            var stateStore = kb.any(subject, WF('stateStore'));
            if (!stateStore) throw 'This tracker has no stateStore';
            var cats = kb.each(subject, WF('issueCategory')); // zero or more
            
            var h = myDocument.createElement('h2');
            h.setAttribute('style', 'font-size: 150%');
            div.appendChild(h);
            classLabel = tabulator.Util.label(states);
            h.appendChild(myDocument.createTextNode(classLabel+" list")); // Use class label @@I18n

            // New Issue button
            var b = myDocument.createElement("button");
            b.setAttribute("type", "button");
            if (!me) b.setAttribute('disabled', 'true')
            div.appendChild(b)
            b.innerHTML = "New "+classLabel;
            b.addEventListener('click', function(e) {
                    div.appendChild(newIssueForm(myDocument, kb, subject));
                }, false);
            
            // Table of issues - when we have the main issue list
            tabulator.sf.nowOrWhenFetched(stateStore.uri, subject, function() {
                var query = new $rdf.Query(tabulator.Util.label(subject));
                var cats = kb.each(tracker, WF('issueCategory')); // zero or more
                var vars =  ['issue', 'state', 'created'];
                for (var i=0; i<cats.length; i++) { vars.push('_cat_'+i) };
                var v = {};
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
                //complain('Query pattern is:\n'+query.pat);
                var tableDiv = paneUtils.renderTableViewPane(myDocument, {'query': query} );
                div.appendChild(tableDiv);
            });

        } // end of Tracker instance
        
        if (!me) complain("You do not have your Web Id set. Set your Web ID to make changes.");

        return div;
    }
}, true);

//ends


