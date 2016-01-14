
/////////////////////////////// ACL User Interface


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

