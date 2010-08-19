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
            var insertions = $rdf.st(subject, DCT('modified'), new Date(), doc);
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'color: red');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, myDocument);
            parent.replaceChild(div2, div);
        };


        // Make SELECT element to select subclasses
        //
        // If there is any disjoint union it will so a mutually exclusive dropdown
        // Failing that it will do a multiple selection of subclasses.
        // Callback takes (ok, errorBody)
        
        var makeSelectForCategory = function(subject, category, storeDoc, callback) {
            var sparqlService = new tabulator.rdf.sparqlUpdate(kb);
            var types = kb.findTypeURIs(subject);
            var du = kb.any(category, OWL('disjointUnionOf'));
            var subs;
            var multiple = false;
            if (!du) {
                subs = kb.each(undefined, ns.rdfs('subClassOf'), category);
                multiple = true;
            } else {
                subs = du.elements            
            }
            var n = 0; var uris ={}; // Count them
            for (var i=0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub.uri in uris) continue;
                uris[sub.uri] = true; n++;
            } // uris is now the set of possible options
            
            var onChange = function(e) {
                // select.setAttribute('class', 'pending');
                select.disabled = true; // until data written back
                if (true) {
                    // throw "Multiple selections not implemented @@";
                    var ds = [], is = [];
                    for (var i =0; i< select.options.length; i++) {
                        var opt = select.options[i];
                        if (!opt.AJAR_uri) continue; // a prompt
                        // dump('   option AJAR_uri='+opt.AJAR_uri+', selected='+opt.selected+'\n')
                        if (opt.selected && !(opt.AJAR_uri in types)) {
                            is.push(new $rdf.Statement(subject,
                                ns.rdf('type'), kb.sym(opt.AJAR_uri),storeDoc ));
                        }
                        if (!opt.selected && opt.AJAR_uri in types) {
                            ds.push(new $rdf.Statement(subject,
                                ns.rdf('type'), kb.sym(opt.AJAR_uri),storeDoc ));
                        }                        
                    }
                    sparqlService.update(ds, is,
                        function(uri, ok, body) {
                            types = kb.findTypeURIs(subject); // Review our list of types
                            if (ok) select.disabled = false; // data written back
                            if (callback) callback(ok, body);
                        });
                }
            }
            if (n==0) throw "Can't do selector with no subclasses "+subject
            var select = myDocument.createElement('select');
            select.setAttribute('style', 'margin: 0.6em 1.5em;')
            if (multiple) select.setAttribute('multiple', 'true');
            var currentURI = undefined;
            for (var uri in uris) {
                var c = kb.sym(uri)
                var option = myDocument.createElement('option');
                option.appendChild(myDocument.createTextNode(tabulator.Util.label(c)));
                var backgroundColor = kb.any(c, kb.sym('http://www.w3.org/ns/ui#background-color'));
                if (backgroundColor) option.setAttribute('style', "background-color: "+backgroundColor.value+"; ");
                option.AJAR_uri = uri;
                if (uri in types) {
                    option.setAttribute('selected', 'true')
                    currentURI = uri;
                    //dump("Already in class: "+ uri+"\n")
                }
                select.appendChild(option);
            }
            if ((currentURI == undefined) && !multiple) {
                var prompt = myDocument.createElement('option');
                prompt.appendChild(myDocument.createTextNode("--classify--"));
                dump("prompt option:" + prompt + "\n")
                select.insertBefore(prompt, select.firstChild)
                prompt.selected = true;
            }
            select.addEventListener('change', onChange, false)
            return select;
        
        } // makeSelectForCategory
        
        //      Description text area
        //
        // Make a box to demand a description or display existing one
        var makeDescription = function(myDocument, subject, predicate, storeDoc, callback) {
            var group = myDocument.createElement('div');
            var sts = kb.statementsMatching(subject, predicate,undefined,storeDoc); // Only one please
            if (sts.length > 1) throw "Should not be "+sts.length+" i.e. >1 "+predicate+" of "+subject;
            var desc = sts.length? sts[0].object.value : undefined;
            var field = myDocument.createElement('textarea');
            group.appendChild(field);
            field.rows = desc? desc.split('\n').length + 2 : 2;
            field.cols = 80
            field.setAttribute('style', 'font-size:100%; \
                    background-color: white; border: 0.07em solid gray; padding: 1em; margin: 1em 2em;')
            if (sts.length) field.value = desc 
            else {
                field.value = "Please enter a description here"
                field.select(); // Select it ready for user input
            }

            var br = myDocument.createElement('br');
            group.appendChild(br);
            submit = myDocument.createElement('input');
            submit.setAttribute('type', 'submit');
            submit.disabled = true; // until the filled has been modified
            submit.value = "Save "+tabulator.Util.label(predicate); //@@ I18n
            submit.setAttribute('style', 'float: right;');
            group.appendChild(submit);

            var groupSubmit = function(e) {
                submit.disabled = true;
                field.disabled = true;
                var deletions = desc ? sts[0] : undefined; // If there was a desciption, remove it
                insertions = field.value.length? new $rdf.Statement(subject, predicate, field.value, storeDoc) : [];
                sparqlService.update(deletions, insertions,function(uri,ok, body){
                    if (ok) { desc = field.value; field.disabled = false;};
                    if (callback) callback(ok, body);
                })
            }

            submit.addEventListener('click', groupSubmit, false)

            field.addEventListener('keypress', function(e) {
                    submit.disabled = false;
                }, false);
            return group;
        }

        //  Form to collect data about a New Issue
        //
        var newIssueForm = function(myDocument, kb, tracker, superIssue) {
           var form = myDocument.createElement('form');
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

                var initialState = kb.any(tracker, WF('initialState'));
                if (!initialState) complain('This tracker has no initialState');
                sts.push(new $rdf.Statement(issue, ns.rdf('type'), initialState, stateStore))
                if (superIssue) sts.push (new $rdf.Statement(superIssue, WF('dependent'), issue, stateStore));
                var sendComplete = function(uri, success, body) {
                    if (!success) {
                        dump('Tabulator issue pane: can\'t save new issue:\n\t'+body+'\n')
                    } else {
                        // dump('Tabulator issue pane: saved new issue\n')
                        div.removeChild(form);
                        rerender(div);
                    }
                }
                sparqlService.update([], sts, sendComplete);
            }
            form.addEventListener('submit', sendNewIssue, false)
            form.setAttribute('onsubmit', "function xx(){return false;}");
            classLabel = tabulator.Util.label(states);
            form.innerHTML = "<h2>Add new "+ (superIssue?"sub ":"")+
                    classLabel+"</h2><p>Title of new "+classLabel+":<p>";
            var titlefield = myDocument.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','100');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input
            form.appendChild(titlefield);
            return form;
        };
                             
 // //////////////////////////////////////////////////////////////////////////////       
        
        
        
        var sparqlService = new tabulator.rdf.sparqlUpdate(kb);

        // Claim the next sequential number -- unused?
        var usingNextID = function usingNextID(thing, kb, callback) {
            var docuri = tabulator.rdf.Util.uri.docpart(thing.uri);
            if (doc == object.uri) throw 'usingNextID - must have a hash in uri:'+thing.uri;
            var sts = kb.statementsMatching(thing, tabulator.ns.link('nextID'),undefined, doc);
            if (sts.length == 0) {
                sparqlService.update([], new $rdf.Statement(
                        thing, tabulator.ns.link('nextID'), 1,kb.sym(doc)),
                        function(uri, success, body){
                            if (!success) throw "Error setting first ID for "+thing;
                })
            } else {
                var id = 0 + sts[0].object.value;
                var updater = sparqlService.update_statement(sts[0]);
                updater.set_object(id+1, function(uri, success, body){
                    if (success) {
                        callback(id);
                    } else {
                        dump("Failed to get new ID, asssume clash, retrying:"+body+"\n");
                        usingNextID(thing, kb, callback);
                    }
                });
            }
        }
        

        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        //              Render a single issue
        
        if (t["http://www.w3.org/2005/01/wf/flow#Task"]) {

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
            
            var tracker = kb.any(subject, WF('tracker'));
            if (!tracker) throw 'This issue '+subject+'has no tracker';
            var states = kb.any(tracker, WF('issueClass'));
            if (!states) throw 'This tracker '+tracker+' has no issueClass';
            var stateStore = kb.any(tracker, WF('stateStore'));
            if (!stateStore) throw 'This tracker '+tracker+' has no stateStore';

            var cats = kb.each(tracker, WF('issueCategory')); // zero or more
            var select = makeSelectForCategory(subject, states, stateStore, function(ok,body){
                    if (ok) {
                        setModifiedDate(stateStore, kb, stateStore);
                        rerender(div);
                    }
                    else complain("Failed to change state:\n"+body);
                })
            div.appendChild(select);
            for (var i=0; i<cats.length; i++) {
                div.appendChild(makeSelectForCategory(subject, cats[i], stateStore, function(ok,body){
                    if (ok) {
                        setModifiedDate(stateStore, kb, stateStore);
                        rerender(div);
                    }
                    else complain("Failed to change category:\n"+body);
                }));
            }
            
            div.appendChild(makeDescription(myDocument, subject, WF('description'),
                stateStore, function(ok,body){
                    if (ok) setModifiedDate(stateStore, kb, stateStore);
                    else complain("Failed to description:\n"+body);
                }));

            // Add in comments about the bug
            tabulator.outline.appendPropertyTRs(div, plist, false,
                function(pred, inverse) {
                    if (!inverse && pred.uri == 
                        "http://www.w3.org/2000/01/rdf-schema#comment") return true;
                    return false
                });


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


            div.appendChild(myDocument.createElement('br'));

            var b = myDocument.createElement("button");
            b.setAttribute("type", "button");
            div.appendChild(b)
            b.innerHTML = "New sub "+classLabel;
            b.setAttribute('style', 'float: right;');
            b.addEventListener('click', function(e) {
                div.appendChild(newIssueForm(myDocument, kb, tracker, subject))}, false);
            
            var a = myDocument.createElement('a');
            a.setAttribute('href',tracker.uri);
            div.appendChild(a);
            a.appendChild(myDocument.createTextNode(tabulator.Util.label(tracker)))

            



        //          Render a Tracker instance
        
        } else if (t['http://www.w3.org/2005/01/wf/flow#Tracker']) {
            // var p = myDocument.createElement("p");
            // div.appendChild(p);
            // p.innerHTML = "This is a Tracker";
            
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


            var listDiv = myDocument.createElement('div');
            div.appendChild(listDiv);
            tabulator.sf.nowOrWhenFetched(stateStore.uri, subject, function() {
                var plist = kb.statementsMatching(undefined, WF('tracker'), subject);
                tabulator.outline.appendPropertyTRs(listDiv, plist, true,
                    function(pred, inverse) {return true;});            
            });
            

            // New Issue button
            var b = myDocument.createElement("button");
            b.setAttribute("type", "button");
            div.appendChild(b)
            b.innerHTML = "New "+classLabel;
            b.addEventListener('click', function(e) {
                    div.appendChild(newIssueForm(myDocument, kb, subject));
                }, false);
            
            // @@ TBD

        } // end of Tracker instance

        return div;
    }
}, true);

//ends


