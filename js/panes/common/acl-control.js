
/////////////////////////////// ACL User Interface


// See https://www.coshx.com/blog/2014/04/11/preventing-drag-and-drop-disasters-with-a-chrome-userscript/
// Without this dropping anything onto a browser page will cause chrome etc to jump to diff page
// throwing away all the user's work.

tabulator.panes.utils.preventBrowserDropEvents = function(document) {

    if (tabulator.preventBrowserDropEventsDone) return;
    tabulator.preventBrowserDropEventsDone = true;

    function preventDrag(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    function handleDrop(e) {
      if (e.dataTransfer.files.length > 0) {
        if (!confirm("Are you sure you want to drop this file here? "
                    +"(Cancel opens it in a new tab)")) {
          e.stopPropagation();
          e.preventDefault();

          var file = e.dataTransfer.files[0];
          var reader = new FileReader();

          reader.onload = function(event) {
            window.open(reader.result);
          }
          reader.readAsDataURL(file);
        }
      }
    }
    document.addEventListener('drop', handleDrop, false);
    document.addEventListener('dragenter', preventDrag, false);
    document.addEventListener('dragover', preventDrag, false);
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

    var ACLControlEditable = function(box, doc, aclDoc, kb, options) {

        var ac = tabulator.panes.utils.readACL(doc, aclDoc, kb); // Note kb might not be normal one
        var byCombo = tabulator.panes.utils.ACLbyCombination(ac);
        var kToCombo = function(k){
            var y = [ 'Read', 'Append', 'Write', 'Control'];
            var combo = [];
            for (i=0; i< 4; i++) {
                if (k & (1 << i)) {
                    combo.push('http://www.w3.org/ns/auth/acl#' + y[i])
                }
            }
            combo.sort();
            combo = combo.join('\n')
            return combo;
        };
        var colloquial = {13: "Owners", 5: "Editors", 3: "Posters", 2: "Submitters", 1: "Viewers"};
        var explanation = {
            13: "can read, write, and control sharing.",
            5: "can read and change information",
            3: "can add new information, and read but not change existing information",
            2: "can add new information but not read any",
            1: "can read but not change information"
        };

        var kToColor = {13: 'purple', 5: 'red', 3: 'orange', 2: '#cc0', 1: 'green'};

        var ktToList = function(k){
            var list = "", y = ['Read', 'Append', 'Write', 'Control'];
            for (i=0; i< 4; i++) {
                if (k & (1 << i)) {
                    list+= y[i];
                }
            }
        }

        if (!options.modify) {
            box.setAttribute('style', 'font-color: #777;')
        }

        var addCombo = function(byCombo, combo){
            var row = box.appendChild(dom.createElement('tr'));
            row.setAttribute('style', 'border: 3px solid black; padding: 0.4em; margin: 4px solid red; color: ' + (kToColor[k] || 'black') + ';')

            var left = row.appendChild(dom.createElement('td'));

            left.textContent = colloquial[k] || ktToList[k];
            left.setAttribute('style', 'padding: 1em;')

            var middle = row.appendChild(dom.createElement('td'));
            var middleTable = middle.appendChild(dom.createElement('table'));

            var right = row.appendChild(dom.createElement('td'));
            right.textContent = explanation[k] || "Unusual combination";
            right.setAttribute('style', 'max-width: 30%;')

            var addAgent = function(pred, obj) {
                if (middleTable.NoneTR) {
                    middleTable.removeChild(middleTable.NoneTR);
                    delete middleTable.NoneTR;
                }
                var tr = middleTable.appendChild(dom.createElement('tr'));
                tr.setAttribute('draggable','true'); // allow a person to be dragged to diff role
                var td1 = tr.appendChild(dom.createElement('td'));
                var td2 = tr.appendChild(dom.createElement('td'));
                var td3 = tr.appendChild(dom.createElement('td'));
                var agent = $rdf.sym(obj);
                tabulator.panes.utils.setName(td2, agent);
                tabulator.panes.utils.deleteButtonWithCheck(dom, td3, 'person', function deletePerson(){
                    var arr =  byCombo[combo];
                    for (var b=0; b < arr.length; b++) {
                        if  (arr[b][0] === pred && arr[b][1] === obj ) {
                            arr.splice(b, 1); // remove from ACL
                            break;
                        }
                    };
                    // @@@ save byCombo back to ACLDoc
                    middleTable.removeChild(tr);
                })
                tr.addEventListener('drag', function(ev){
                    ev.dataTransfer.setData("text/uri-list", obj);
                }, false);
            };


            var arr = byCombo[combo];
            if (arr) {
                arr.sort();
                for (var a=0; a<arr.length; a++) {
                    addAgent(arr[a][0], arr[a][1]);
                }
            } else {
                var tr = middleTable.appendChild(dom.createElement('tr'));
                tr.textContent = 'None';
                tr.setAttribute('style', 'padding: 1em;')
                middleTable.NoneTR = tr;
            }
            // see http://html5demos.com/drag-anything
            row.addEventListener('drop', function (e) {
                if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.
                console.log("Drop event!")
                /** THIS IS THE MAGIC: we read from getData based on the content type - so it grabs the item matching that format **/
                var uris = null;
                if (e.dataTransfer.types) {
                    for (var t=0; t<e.dataTransfer.types.length; t++){
                        var type = e.dataTransfer.types[t];
                        if (type === 'text/uri-list') {
                            uris = e.dataTransfer.getData(type).split('\n'); // @ ignore those starting with #
                            console.log("Dropped URI list: " + uris)
                        }
                    }
                } else {
                // ... however, if we're IE, we don't have the .types property, so we'll just get the Text value
                    var uris = [ e.dataTransfer.getData('Text') ];
                    console.log("@@ WARNING non-standrad drop event: " + uris[0]);
                }
                console.log("Dropped URI list: 2 " + uris);
                if (uris) {
                    // @@@ save byCombo back to ACLDoc
                    uris.map(function(u){
                        if (!(combo in byCombo)) {
                            byCombo[combo] = [];
                        }
                        byCombo[combo].push(['agent', u]);
                        addAgent('agent', u);
                    })
                }

              return false;
            });

        };

        var k, combo, label;
        for (k=15; k>0; k--) {
            combo = kToCombo(k);
            if (( options.modify && colloquial[k]) || byCombo[combo]){
                addCombo(byCombo, combo);
            } // if
        } // for
    } // ACLControlEditable


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
                    ACLControlEditable(box, doc, targetACLDoc, kb2, {modify: false}); // Add btton to save them as actual
                    box.style = 'color: #777;';

                    var editPlease = bottomRow.appendChild(dom.createElement('button'));
                    editPlease.textContent = "Set specific sharing\nfor this group";
                    editPlease.addEventListener('click', function(event) {
                        updater.put(targetACLDoc, kb2.statements,
                            'text/turtle', function(uri, ok, message){
                            if (!ok) {
                                statusBlock.textContent += " (Error writing back access control file: "+message+")";
                            } else {
                                statusBlock.textContent = " (Now editing specific access for this group)";
                                box.style = 'color: black;';
                                bottomRow.removeChild(editPlease);
                            }
                        });

                    });
                } // defaults.length
            } else { // Not using defaults

                ACLControlEditable(box, targetDoc, targetACLDoc, kb, {modify: true}); // yes can edit
                box.style = 'color: black;';

                var useDefault;
                var addDefaultButton = function() {
                    useDefault = bottomRow.appendChild(dom.createElement('button'));
                    useDefault.textContent = "Stop specific sharing for this group -- just use default.";
                    useDefault.addEventListener('click', function(event) {
                        tabulator.fetcher.webOperation('DELETE', targetACLDoc)
                            .then(function(xhr) {
                                statusBlock.textContent = " The sharing for this group is now the default.";
                                bottomRow.removeChild(useDefault);
                                box.style = 'color: #777;';

                            })
                            .catch(function(e){
                                statusBlock.textContent += " (Error deleting access control file: "+message+")";
                            });

                    });
                }
                addDefaultButton();

                var checkIndividualACLsButton;
                var addCheckButton = function() {
                    bottomRow.appendChild(dom.createElement('br'));
                    checkIndividualACLsButton = bottomRow.appendChild(dom.createElement('button'));
                    checkIndividualACLsButton.textContent = "Check individal cards ACLs";
                    checkIndividualACLsButton.addEventListener('click', function(event) {


                    });
                }
                addCheckButton();

            } // Not using defaults
        }

    });

    return table

}; // ACLControlBox
