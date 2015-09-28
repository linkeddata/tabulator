

// A utility which should prb go elsewhere

tabulator.panes.utils.hashColor = function(who) {
    who = who.uri || who;
    var hash = function(x){return x.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); }
    return '#' + ((hash(who) & 0xffffff) | 0xc0c0c0).toString(16); // c0c0c0 or 808080 forces pale
}


////////////////////////////////////////////////

//   The pad widget
//



tabulator.panes.utils.notepad  = function (dom, padDoc, subject, me, options) {
    options = options || {}
    var exists = options.exists;
    var table = dom.createElement('table');
    var kb = tabulator.kb;
    // var mainRow = table.appendChild(dom.createElement('tr'));
    
    var fetcher = tabulator.sf;
    var ns = tabulator.ns;
    var updater = new $rdf.sparqlUpdate(kb);
    var waitingForLogin = false;

    var PAD = $rdf.Namespace('http://www.w3.org/ns/pim/pad#');
    
    var currentNode, currentOffset;
    
    var setPartStyle = function(part, colors) {
        var chunk = part.subject;
        var baseStyle = 'font-size: 100%; font-family: monospace; min-width: 50em; border: none;'; //  font-weight:
        var headingCore = 'font-family: sans-serif; font-weight: bold;  border: none;'
        var headingStyle = [ 'font-size: 110%;  padding-top: 0.5em; padding-bottom: 0.5em;min-width: 20em;' ,
            'font-size: 120%; padding-top: 1em; padding-bottom: 1em; min-width: 20em;' ,
            'font-size: 150%; padding-top: 1em; padding-bottom: 1em; min-width: 20em;' ];

        var author = kb.any(chunk, ns.dc('author'));
        if (!colors && author) { // Hash the user webid for now -- later allow user selection!
            var hash = function(x){return x.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); }
            var bgcolor = '#' + ((hash(author.uri) & 0xffffff) | 0xc0c0c0).toString(16); // c0c0c0  forces pale
            colors = 'color: black; background-color: ' + bgcolor + ';'
        }

        var indent = kb.any(chunk, PAD('indent'));
        
        indent = indent ? indent.value : 0;
        var style =  (indent >= 0) ?
            baseStyle + 'padding-left: ' + (indent * 3) + 'em;'
            :   headingCore + headingStyle[ -1 - indent ]; 
        part.setAttribute('style', style + colors);
    }
    

    var removePart = function(part) {
        var chunk = part.subject;
        var prev = kb.any(undefined, PAD('next'), chunk);
        var next = kb.any(chunk, PAD('next'));
        if (prev.sameTerm(subject) && next.sameTerm(subject)) { // Last one
            console.log("You can't delete the last line.")
            return;
        }
        var del = kb.statementsMatching(chunk, undefined, undefined, padDoc)
                .concat(kb.statementsMatching(undefined, undefined, chunk, padDoc));
        var ins = [ $rdf.st(prev, PAD('next'), next, padDoc) ];

       tabulator.sparql.update(del, ins, function(uri,ok,error_body){
            if (!ok) {
                //alert("Fail to removePart " + error_body);
                console.log("removePart FAILED " + chunk + ": " + error_body);
                console.log("removePart was deleteing :'" + del);
                setPartStyle(part, 'color: black;  background-color: #fdd;');// failed
                tabulator.sparql.requestDownstreamAction(padDoc, reloadAndSync);
            } else {
                var row = part.parentNode;
                var before = row.previousSibling;
                row.parentNode.removeChild(row);
                console.log("delete row ok " + part.value);
                if (before && before.firstChild) {
                    before.firstChild.focus();
                }
            }
        });
    }
    
    var changeIndent = function(part, chunk, delta) {
        var del = kb.statementsMatching(chunk, PAD('indent'));
        var current =  del.length? Number(del[0].object.value) : 0;
        if (current + delta < -3) return; //  limit negative indent
        var newIndent = current + delta;
        var ins = $rdf.st(chunk, PAD('indent'), newIndent, padDoc);
        tabulator.sparql.update(del, ins, function(uri, ok, error_body){
            if (!ok) {
                console.log("Indent change FAILED '" + newIndent + "' for "+padDoc+": " + error_body);
                setPartStyle(part, 'color: black;  background-color: #fdd;'); // failed
                tabulator.sparql.requestDownstreamAction(padDoc, reloadAndSync);
            } else {
                setPartStyle(part); // Implement the indent
            }
        });
    }
    
    var addListeners = function(part, chunk) {

        part.addEventListener('keydown', function(event){
            var author = kb.any(chunk, ns.dc('author')); 
            //  up 38; down 40; left 37; right 39     tab 9; shift 16; escape 27
            switch(event.keyCode) {
            case 13:                    // Return
                console.log("enter");   // Shift-return inserts before -- only way to add to top of pad.
                newChunk(document.activeElement, event.shiftKey);
                break;
            case 8: // Delete
                if (part.value.length === 0 ) {
                    console.log("Deleting line")
                    removePart(part);
                }
                break;
            case 9: // Tab
                var delta = event.shiftKey ? -1 : 1;
                changeIndent(part, chunk, delta);
                event.preventDefault(); // default is to highlight next field
                break;
            case 27:  // ESC
                tabulator.sparql.requestDownstreamAction(padDoc, reloadAndSync);
                break;
                
            case 38: // Up
                if (part.parentNode.previousSibling) {
                    part.parentNode.previousSibling.firstChild.focus();
                    event.preventDefault();
                }
                break;

            case 40: // Down
                if (part.parentNode.nextSibling) {
                    part.parentNode.nextSibling.firstChild.focus();
                    event.preventDefault();
                }
                break;

            default:
            }
        });

        part.addEventListener('click', function(event){
            //var chunk = event.target.subject;
            var author = kb.any(chunk, ns.dc('author'));

            var range;
            var textNode;
            var offset;

            if (document.caretPositionFromPoint) {
                range = document.caretPositionFromPoint(event.clientX, event.clientY);
                textNode = range.offsetNode;
                offset = range.offset;
            } else if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(event.clientX, event.clientY);
                textNode = range.startContainer;
                offset = range.startOffset;
            }

            if (me.sameTerm(author)) {
                // continue to edit
 
                // only split TEXT_NODEs
                if (textNode.nodeType == 3) {
                    textNode.textContent = textNode.textContent.slice(0,offset) 
                    + '#' + textNode.textContent.slice(offset); 
                    currentNode = textNode;
                    currentOffset = offset;
                }
            
            } else {
                // @@ where is the cursor?
                // https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint
                // https://drafts.csswg.org/cssom-view/#the-caretposition-interface
                
                
                // only split TEXT_NODEs
                if (textNode.nodeType == 3) {
                
                    var replacement = textNode.splitText(offset);
                    
                    var bling = document.createElement('span');
                    bling.textContent = "*"; // @@
                    
                    textNode.parentNode.insertBefore(bling, replacement);
                }
            }
        });

        var updateStore = function(part) {
            var chunk = part.subject;
            setPartStyle(part, 'color: #888;');
            var old = kb.any(chunk, ns.sioc('content')).value;
            del = [ $rdf.st(chunk, ns.sioc('content'), old, padDoc)];
            ins = [ $rdf.st(chunk, ns.sioc('content'), part.value, padDoc)];
            
            tabulator.sparql.update(del, ins, function(uri,ok,error_body){
                if (!ok) {
                    // alert("clash " + error_body);
                    console.log("patch FAILED '" + part.value + "' " + error_body);
                    setPartStyle(part,'color: black;  background-color: #fdd;'); // failed
                    part.state = 0;
                    tabulator.sparql.requestDownstreamAction(padDoc, reloadAndSync);
                } else {
                    setPartStyle(part); // synced
                    // console.log("patch ok " + part.value);
                    if (part.state === 2) {
                        part.state = 1;  // pending: lock
                        updateStore(part)
                    } else {
                        part.state = 0; // clear lock
                    }
                }
            });
        }

        part.addEventListener('input', function inputChangeListener(event) {
            // console.log("input changed "+part.value);
            setPartStyle(part, 'color: #888;'); // grey out - not synced
            if (part.state) {
                part.state = 2; // please do again
                return;
            } else {
                part.state = 1; // in progres
            }
            updateStore(part);

        }); // listener
        
    } // addlisteners


    var newPartAfter = function(tr1, chunk, before) { // @@ take chunk and add listeners
        text = kb.any(chunk, ns.sioc('content'));
        text = text ? text.value : '';
        var tr = dom.createElement('tr');
        if (before) {
            table.insertBefore(tr, tr1);
        } else { // after
            if (tr1 && tr1.nextSibling) {
                table.insertBefore(tr, tr1.nextSibling);
            } else {
                table.appendChild(tr);
            }
        }
        var part = tr.appendChild(dom.createElement('input'));
        part.subject = chunk;
        part.setAttribute('type', 'text')
        setPartStyle(part, '');
        part.value = text;
        addListeners(part, chunk);
        return part
    };

    
           
    var newChunk = function(ele, before) { // element of chunk being split
        var kb = tabulator.kb, tr1;

        var here, prev, next, indent = 0;
        if (ele) {
            if (ele.tagName.toLowerCase() !== 'input') {
                console.log('return pressed when current document is: ' + ele.tagName)
            }
            here = ele.subject;
            indent = kb.any(here, PAD('indent'));
            indent = indent? Number(indent.value)  : 0;
            if (before) {
                prev =  kb.any(undefined, PAD('next'), here);
                next = here;
            } else {
                prev = here;
                next =  kb.any(here, PAD('next'));
            }
            tr1 = ele.parentNode;
        } else {
            prev = subject
            next = subject;
            tr1 = undefined;
        }

        var chunk = tabulator.panes.utils.newThing(padDoc);
        var part = newPartAfter(tr1, chunk, before);

        del = [ $rdf.st(prev, PAD('next'), next, padDoc)];
        ins = [ $rdf.st(prev, PAD('next'), chunk, padDoc),
                $rdf.st(chunk, PAD('next'), next, padDoc),
                $rdf.st(chunk, ns.dc('author'), me, padDoc),
                $rdf.st(chunk, ns.sioc('content'), '', padDoc)];
        if (indent > 0) { // Do not inherit 
            ins.push($rdf.st(chunk, PAD('indent'), indent, padDoc));
        }

        tabulator.sparql.update(del, ins, function(uri,ok,error_body){
            if (!ok) {
                alert("Error writing fresh PAD data " + error_body)
            } else {
                console.log("fresh chunk updated");
                setPartStyle(part);
            }
        });
        part.focus();
    };

    var consistencyCheck = function() {
        var found = [], failed =0;
        var  complain = function(msg) {
            if (options.statusArea) {
                options.statusArea.textContent += msg + '.  ';
            }
            failed++;
        }
    
        for (chunk = kb.the(subject, PAD('next'));  
            !chunk.sameTerm(subject);
            chunk = kb.the(chunk, PAD('next'))) {
            var label = chunk.uri.split('#')[1];
            if (found[chunk.uri]) {
                complian("Loop!");
                return false;
            }

            found[chunk.uri] = true;
            var k = kb.each(chunk, PAD('next')).length
            if (k !== 1) complain("Should be 1 not "+k+" next pointer for " + label);

            var k = kb.each(chunk, PAD('indent')).length
            if (k > 1) complain("Should be 0 or 1 not "+k+" indent for " + label);

            var k = kb.each(chunk, ns.sioc('content')).length
            if (k !== 1) complain("Should be 1 not "+k+" contents for " + label);
        
            var k = kb.each(chunk, ns.dc('author')).length
            if (k !== 1) complain("Should be 1 not "+k+" author for " + label);
            
            var sts = kb.statementsMatching(undefined, ns.sioc('contents'));
            sts.map(function(st){ if (!found[st.subject.uri]) {
                    complain("Loose chunk! " + st.subject.uri);
            }});
        }
        return !failed;
    }

    // Ensure that the display matches the current state of the
    var sync = function() {
        var first = kb.the(subject, PAD('next'));
        if (kb.each(subject, PAD('next')).length !== 1) {
            console.log("Pad: Inconsistent data - too many NEXT pointers: "
                + (kb.each(subject, PAD('next')).length));
            //alert("Inconsitent data");
            if (options.statusArea) {
                statusArea.textContent = "Inconsistent Data!"
            }
            return
        }
        var last = kb.the(undefined, PAD('previous'), subject);
        var chunk = first; //  = kb.the(subject, PAD('next'));
        var row = table.firstChild;
            
        // First see which of the logical chunks have existing physical manifestations
        manif = [];
        // Find which lines correspond to existing chunks
        for (chunk = kb.the(subject, PAD('next'));  
            !chunk.sameTerm(subject);
            chunk = kb.the(chunk, PAD('next'))) {
            for (var i=0; i< table.children.length; i++) {
                var tr = table.children[i];
                if (tr.firstChild.subject.sameTerm(chunk)) {
                    manif[chunk.uri] = tr.firstChild;
                }
            }
        }
        
        // Remove any deleted lines
        for (var i = table.children.length -1; i >= 0 ; i--) {
            var row = table.children[i];
            if (!manif[row.firstChild.subject.uri]) {
                table.removeChild(row);
            }
        }
        // Insert any new lines and update old ones
        row = table.firstChild;
        for (chunk = kb.the(subject, PAD('next'));  
            !chunk.sameTerm(subject);
            chunk = kb.the(chunk, PAD('next'))) {
            var text = kb.any(chunk, ns.sioc('content')).value;
            // superstitious -- don't mess with unchanged input fields
            // which may be selected by the user
            if (manif[chunk.uri]) { 
                var part = row.firstChild;
                if (text !== part.value) {
                    part.value = text;
                }
                setPartStyle(part);
                part.state = 0;
                row = row.nextSibling
            } else {
                newPartAfter(row, chunk, true); // actually before
            }
        };
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


    var reloadAndSync = function() {
        tabulator.sparql.reload(kb, padDoc, function (ok) {
            if (ok) {
                refreshTree(table);
            }
        });
    }
    
    table.refresh = sync; // Catch downward propagating refresh events
    table.reloadAndSync = reloadAndSync;
    
    if (exists) {
        console.log("Existing pad.");
        if (consistencyCheck()) {
            sync();
        } else {
            console.log(table.textContent = "Inconsistent data. Abort");
        } 
    } else { // Make new pad
        console.log("No pad exists - making new one.");

        var insertables = [];
        insertables.push($rdf.st(subject, ns.dc('author'), me, padDoc));
        insertables.push($rdf.st(subject, ns.dc('created'), new Date(), padDoc));
        insertables.push($rdf.st(subject, PAD('next'), subject, padDoc));
        
        tabulator.sparql.update([], insertables, function(uri,ok,error_body){
            if (!ok) {
                complainIfBad(ok, error_body);
            } else {
                console.log("Initial pad created");
                newChunk(); // Add a first chunck
                // getResults();
            }
        });
    }
    return table;
}
