/*   Attachment Pane
**
** - Attach a document to a thing
**  - View attachments
** - Look at all unattached Supporting Documents.
** - Drag a document onto the pane to attach it @@
**
**
** I am using in places single quotes strings like 'this'
** where internationalizatio ("i18n") is not a problem, and double quoted
** like "this" where th string is seen by the user and so I18n is an issue.
*/

    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_paperclip = tabulator.iconPrefix + 'js/panes/attach/tbl-paperclip-22.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_bug] = 'Attachments'

if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(tabulator.kb);

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_paperclip,
    
    name: 'attachments',
    
    // Does the subject deserve an issue pane?
    //
    //  In this case we will render any thing which is in any subclass of 
    //  certain classes, or also the certain classes themselves, as a
    //  triage tool for correlating many attachees with attachments.
    // We also offer the pane for anything of any class which just has an attachment already.
    //
    label: function(subject) {
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        if (t['http://www.w3.org/ns/pim/trip#Trip'] || // If in any subclass
        subject.uri == 'http://www.w3.org/ns/pim/trip#Trip' ||
        t['http://www.w3.org/2005/01/wf/flow#Task'] ||
        t['http://www.w3.org/2000/10/swap/pim/qif#Transaction'] ||
        subject.uri == 'http://www.w3.org/2000/10/swap/pim/qif#Transaction' ||
        kb.holds(subject, WF('attachment'))) return "attachments";
        return null; 
    },

    render: function(subject, dom) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var CAL = $rdf.Namespace('http://www.w3.org/2002/12/cal/ical#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var TRIP = $rdf.Namespace('http://www.w3.org/ns/pim/trip#');
        var QU = $rdf.Namespace('http://www.w3.org/2000/10/swap/pim/qif#');
        
        
   //////////////////////////////////////////////////////////////////////////////     
        
        var setModifiedDate = function(subj, kb, doc) {
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, WF('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, WF('modifiedBy'), me, doc) );
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = dom.createElement("pre");
            pre.setAttribute('style', 'background-color: pink');
            div.appendChild(pre);
            pre.appendChild(dom.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, dom);
            parent.replaceChild(div2, div);
        };

        // Where can we write about this thing?
        //
        // Returns term for document or null 
        var findStore = function(kb, subject) {
            var docURI = tabulator.rdf.Util.uri.docpart(subject.uri);
            if (tabulator.sparql.editable(docURI, kb)) return kb.sym(docURI);
            var store = kb.any(kb.sym(docURI), QU('annotationStore'));
            // if (!store) complain("No store for "+docURI);
            return store;
        }

        
        var div = dom.createElement("div");
        div.setAttribute('class', 'attachPane');
        div.innerHTML='<h1>Attachments</h1>';


        var predicate =  WF('attachment');
        var range = QU('SupportingDocument');
        
        var subjects;
        var multi;
        var options = {};
        var currentMode = 0;
        var currentSubject = null, currentObject = null;
        var currentSubjectItem = null, currentObjectItem = null;
        var objectType = QU('SupportingDocument');
        
        // Find all members of the class which we know about
        // and sort them by an appropriate property.   @@ Move to library
        //
        var getMembersAndSort = function(subject) {
        
            var sortBy = {
                'http://www.w3.org/2005/01/wf/flow#Task' :
                    'http://purl.org/dc/elements/1.1/created',
                'http://www.w3.org/ns/pim/trip#Trip' : // @@ put this into the ontologies
                    'http://www.w3.org/2002/12/cal/ical#dtstart' ,
                'http://www.w3.org/2000/10/swap/pim/qif#Transaction' :
                    'http://www.w3.org/2000/10/swap/pim/qif#date',
                'http://www.w3.org/2000/10/swap/pim/qif#SupportingDocument':
                    'http://purl.org/dc/elements/1.1/date'} [subject.uri];
                    
            if (!sortBy) {
                sortBy = kb.any(subject, tabulator.ns.ui('sortBy'));
            }
            var u, x, key, uriHash = kb.findMemberURIs(subject);
            var pairs = [], subjects = [];
            for (u in uriHash) { //@ protect against methods?
                x = kb.sym(u);
                key = kb.any(x, kb.sym(sortBy));
                // if (!key) complain("Sort: '"+key+"' No "+sortBy+" for "+x); // Assume just not in this year
                if (key) pairs.push( [key, x]);
            }
            pairs.sort();
            pairs.reverse(); // @@ Descending order .. made a toggle?
            for (var i=0; i< pairs.length; i++) {
                subjects.push(pairs[i][1]);
            }
            return subjects;
        };
        
        // Set up a triage of many class members against documents or just one
        if (subject.uri ==  'http://www.w3.org/ns/pim/trip#Trip' ||
            subject.uri == 'http://www.w3.org/2000/10/swap/pim/qif#Transaction') {
            multi = true;
            subjects = getMembersAndSort(subject);
        } else {
            currentSubject = subject;
            currentMode = 1; // Show attached only.
            subjects = [ subject ];
            multi = false;
        }

        //var store = findStore(kb, subject);
        //if (!store) complain("There is no annotation store for: "+subject.uri);

        //var objects = kb.each(undefined, ns.rdf('type'), range);
        var objects = getMembersAndSort(range);
        if (!objects) complain("objects:"+objects.length);
        
        var deselectObject = function() {
            currentObject = null;
            preview.innerHTML = '';
        }

        var showFiltered = function(mode) {
            var filtered = (mode == 0) ? objects :
                (mode == 1) ?   (currentSubject === null
                    ? objects.filter(function(y){return !!kb.holds(undefined, predicate, y)})
                    : objects.filter(function(y){return !!kb.holds(currentSubject, predicate, y)}) )
                : objects.filter(function(y){return kb.each(undefined, predicate, y).length == 0});
            tabulator.panes.utils.selectorPanelRefresh(objectList,
                dom, kb, objectType, predicate, true, filtered, options, showObject, linkClicked);
            if (filtered.length == 1) {
                currentObject = filtered[0];
                showObject(currentObject, null, true); // @@ (Sure?) if only one select it.
            } else {
                deselectObject();
            };
        };
        


        var setAttachment = function(x, y, value, refresh) {
            if (kb.holds(x, predicate, y) == value) return;
            var verb = value ? "attach" : "detach";
            //complain("Info: starting to "+verb+" " + y.uri + " to "+x.uri+ ":\n")
            var linkDone3 = function(uri, ok, body) {
                if (ok) {
                    // complain("Success "+verb+" "+y.uri+" to "+x.uri+ ":\n"+ body);
                    refresh();
                } else {
                    complain("Error: Unable to "+verb+" "+y.uri+" to "+x.uri+ ":\n"+ body);
                }
            };

            var store = findStore(kb, x);
            if (!store) {
                complain("There is no annotation store for: "+x.uri);
            } else {
                var sts = [$rdf.st(x, predicate, y, store)];
                if (value) {
                    tabulator.sparql.update([], sts, linkDone3);
                } else {
                    tabulator.sparql.update(sts, [], linkDone3);
                };
            };
        };

        var linkClicked = function(x, event, inverse, refresh) {
            var s, o;
            if (inverse) { // Objectlist
                if (!currentSubject) {
                    complain("No subject for the link has been selected");
                    return;
                } else {
                    s = currentSubject;
                    o = x;
                };
            
            } else { // Subjectlist
                if (!currentObject) {
                    complain("No object for the link has been selected");
                    return;
                } else {
                    s = x;
                    o = currentObject;
                };
            };
            setAttachment(s, o, !kb.holds(s, predicate, o), refresh); // @@ toggle
        };
        
        // When you click on a subject, filter the objects connected to the subject
        var showSubject = function(x, event, selected) {
            if (selected) {
                currentSubject = x;
            } else {
                currentSubject = null;
                deselectObject();
            }
            showFiltered(currentMode); // Refresh the objects
        }
        
        if (multi) {
            var subjectList = tabulator.panes.utils.selectorPanel(dom, kb, subject,
                    predicate, false, subjects, options, showSubject, linkClicked);
            subjectList.setAttribute('style',
                'background-color: white;  width: 25em; height: 100%; padding: 0 em; overflow:scroll; float:left');
            div.appendChild(subjectList);
        }

        var showObject = function(x, event, selected) {
            if (!selected) {
                deselectObject();
                preview.innerHTML = ''; // Clean out what is there
            // complain("Show object "+x.uri)
                return;
            }
            currentObject = x;
            try {

/*
                var table = dom.createElement('table');
                tabulator.outline.GotoSubject(x, true, undefined, false, undefined, table) 
*/

                if (x.uri.slice(-4) == ".pdf" || x.uri.slice(-4) == ".png" ||
                        x.uri.slice(-5) == ".jpeg") { // @@@ KLUDGE! use metadata after HEAD
                    preview.innerHTML = '<iframe height="100%" width="100%"src="'
                        + x.uri + '">' + x.uri + '</iframe>';
                } else {
                    preview.innerHTML = '';
                    if (x.uri) kb.fetcher.nowOrWhenFetched(x.uri, undefined, function() {
                        var display = tabulator.outline.propertyTable(x); //  ,table, pane
                        preview.appendChild(display);                    
                    });
                };


            } catch(e) {
                preview.innerHTML = '<span style="background-color: pink;">' + "Error:" + e + '</span>'; // @@ enc
            }
        }

        div.setAttribute('style', 'background-color: white; width:40cm; height:20cm;');
        
        
        var headerButtons = function(dom, labels, callback) {
            var head = dom.createElement('table');
            var current = 0;
            head.setAttribute('style', 'float: left; width: 30em; padding: 0.5em; height: 1.5em; background-color: #ddd; color: #444; font-weight: bold')
            var tr = dom.createElement('tr');
            var style0 = 'border-radius: 0.6em; text-align: center;'
            var style1 = style0 + 'background-color: #ccc; color: black;'
            head.appendChild(tr);
            var setStyles = function() {
                for (i=0; i<labels.length; i++) {
                    buttons[i] .setAttribute('style', i == current ? style1 : style0);
                }
            }
            var i, b, buttons = [];
            for (i=0; i<labels.length; i++) {
                b = buttons[i] = dom.createElement('td');
                b.textContent = labels[i];
                tr.appendChild(buttons[i]);
                var listen = function(b, i) {
                    b.addEventListener('click', function(e) {
                        current = i;
                        setStyles();
                        callback(i);
                    });
                }
                listen(b, i);
            };
            setStyles();
            return head;
        };

        var setMode = function (mode){
            currentMode = mode;
            deselectObject();
            showFiltered(mode);
        }

        var wrapper = dom.createElement('div');
        wrapper.setAttribute('style', ' width: 30em; height: 100%;  padding: 0em; float:left;');
        // wrapper.appendChild(head);
        div.appendChild(wrapper);
        wrapper.appendChild(headerButtons(dom, [ 'all', 'attached', 'not attached',], setMode));

        var objectList = tabulator.panes.utils.selectorPanel(dom, kb, objectType, predicate, true, objects, options, showObject, linkClicked);
        objectList.setAttribute('style',
            'background-color: #ffe;  width: 30em; height: 100%; padding: 0em; overflow:scroll;'); //float:left
        wrapper.appendChild(objectList);
        
        //objectList.insertBefore(head, objectList.firstChild);

        var preview = dom.createElement("div");
        preview.setAttribute('style', /*background-color: black; */ 'padding: 0em; margin: 0;  height: 100%; overflow:scroll;');
        div.appendChild(preview);

        if (subjects.length > 0 && multi) {
            var stores = {};
            for (var k=0; k<subjects.length; k++) {
                var store = findStore(kb, subjects[k]);
                if (store) stores[store.uri] = subjects[k];
                //if (!store) complain("No store for "+subjects[k].uri);
            };
            for (var storeURI in stores) {
            //var store = findStore(kb,subjects[subjectList.length-1]);
                var store = kb.sym(storeURI);
                var mintBox = dom.createElement('div');
                mintBox.setAttribute('style', 'clear: left; margin-top:2em; background-color:#ccc; border-radius: 1em; padding: 2em; font-weight: bold;');
                mintBox.textContent = "+ New in "+storeURI;
                /*
                var mintButton = dom.createElement('img');
                mintBox.appendChild(mintButton);
                mintButton.setAttribute('src', tabulator.Icon.src.icon_add_triple); @@ Invokes master handler
                */
                mintBox.addEventListener('click', function(event) {
                    var thisForm = tabulator.panes.utils.promptForNew(
                        dom, kb, subject, predicate, subject, null, store,
                        function(ok, body){
                            if (!ok) {
                                //callback(ok, body); // @@ if ok, need some form of refresh of the select for the new thing
                            } else {
                                // Refresh @@
                            }
                        });
                    try {
                        div.insertBefore(thisForm, mintBox.nextSibling) // Sigh no insertAfter
                    } catch(e) {
                        div.appendChild(thisForm);
                    }
                    var newObject = thisForm.AJAR_subject;

                }, false);
                div.appendChild(mintBox);
            };
        };

         
        
        
        // if (!me) complain("(You do not have your Web Id set. Set your Web ID to make changes.)");

        return div;
    }
}, true);

//ends


