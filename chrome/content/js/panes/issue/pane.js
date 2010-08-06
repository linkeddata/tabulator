/*   Issue Tracker Pane
**
**  This outline pane allows a user to interact with an issue,
to change its state according to an ontology, comment on it, etc.
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
        if (t["http://www.w3.org/2005/01/wf/flow#Task"]) return "issue";
        if (t["http://www.w3.org/2005/01/wf/flow#Tracker"]) return "tracker";
        // Later: Person. For a list of things assigned to them,
        // open bugs on projects they are developer on, etc
        return null; // No under other circumstances (while testing at least!)
    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace("http://www.w3.org/2005/01/wf/flow#");
    
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'issuePane');
        div.innherHTML='<h1>Issue</h1><p>This is a pane under development</p>';

        var commentFlter = function(pred, inverse) {
            if (!inverse && pred.uri == 
                "http://www.w3.org/2000/01/rdf-schema#comment") return true;
            return false
        }
        
        var complain = function complain(message){
            var p = myDocument.createElement("p");
            p.setAttribute('style', 'color: red');
            div.appendChild(p);
            p.appendChild(myDocument.createTextNode('Error: '+message));
        } 

        // Make Select
        var makeSelectForCategory = function(category, types, multiple) {
            var du = kb.any(category, OWL('disjointUnionOf'));
            if (!du) throw 'select class has no disjoint union.'+category;
            var subs = du.elements
            var n = 0; var uris ={}; // Count them
            for (var i=0; i < subs.length; i++) {
                var sub = subs[i];
                if (sub.uri in uris) continue;
                uris[sub.uri] = true; n++;
            }
            var onChange = function(e) {
                select.setAttribute('class', 'pending');
            }
            if (n>0) {
                var select = myDocument.createElement('select');
                if (multiple) select.setAttribute('multiple', 'true');
                //@@ Later, check whether classes are disjoint.
                select.innerHTML = "<option>-- classify --</option>";
                for (var uri in uris) {
                    var option = myDocument.createElement('option');
                    option.appendChild(myDocument.createTextNode(tabulator.Util.label(kb.sym(uri))));
                    option.setAttribute('name', uri);
                    if (uri in types) option.setAttribute('selected', 'true')
                    select.appendChild(option);
                }
                select.addEventListener('change', onChange, false)
                return select;
            }
            return null;
        
        } // makeSelectForCategory

        var plist = kb.statementsMatching(subject)

        var t = kb.findTypeURIs(subject);

        // Render a single issue
        if (t["http://www.w3.org/2005/01/wf/flow#Task"]) {
            tabulator.outline.appendPropertyTRs(div, plist, false,
                function(pred, inverse) {
                    if (!inverse && pred.uri == 
                        "http://www.w3.org/2000/01/rdf-schema#comment") return true;
                    return false
                });

            // var qlist = kb.statementsMatching(undefined, undefined, subject)

            // Find out whether we can write anywhere or this is just a view operation
            /*
            var pad = null;   // Where are we writing things?
            var sts = kb.statementsMatching(subject, ns.rdf('type'));
            for (var i=0; i<sts.length; i++) {
                var editable = tabulator.outline.UserInput.updateService.editMethod(
                    sts[i].why, kb);
                if (!editable) continue;
                pad = sts[i].why; // Found an editable file
            }
            
            // Read state, or set to New if there is none.
            var state = kb.any(subject, WF('state'));
            var p = myDocument.createElement("p");
            div.appendChild(p);
            p.appendChild(myDocument.createTextNode('State: '));

            if (state) {
                p.appendChild(myDocument.createTextNode(tabulator.lb.label(state)));
            } else {
                tabulator.outline.UserInput.updateService.insert_statement(
                    new $rdf.Statement(subject, WF('state'), WF('New'), pad),
                    function(uri, success, body) {
                        p.appendChild(myDocument.createTextNode('New *'))
                    dump("issue pane: Done create a state for "+subject+"\n");

                    });
                dump("issue pane: Had to create a state for "+subject+"\n");
            }
            */





        // Render a Tracker instance
        } else if (t["http://www.w3.org/2005/01/wf/flow#Tracker"]) {
            var p = myDocument.createElement("p");
            var types = kb.findTypeURIs(subject);
            div.appendChild(p);
            p.innerHTML = "This is a Tracker @@";
            
            var states = kb.any(subject, WF('issueClass'));
            if (!states) throw 'This tracker has no issueClass';
            var cats = kb.each(subject, WF('issueCategory')); // zero or more
            
            
            var newIssueForm = function(e) {
                var form = myDocument.createElement("form");
                form.setAttribute('onsubmit', "function(){return false;}");
                div.appendChild(form);
                form.innerHTML = "<h2>Add new issue</h2><p>Title of new issue:<p>\
                <input type='text' width='80' name='title'/>";
                var select = makeSelectForCategory(states, types, false)
                form.appendChild(select);
                for (var i=0; i<cats.length; i++) {
                    form.appendChild(makeSelectForCategory(cats[i], types, false));
                }

            }
            var b = myDocument.createElement("button");
            b.setAttribute("type", "button");
            div.appendChild(b)
            b.innerHTML = "New Issue";
            b.addEventListener('click', newIssueForm, false);
            
            // @@ TBD

        }



        // tabulator.outline.appendPropertyTRs(div, plist, true, tabulator.panes.defaultPane.filter)
        /*
        if ((subject.termType == 'symbol' && 
             outline.UserInput.updateService.editMethod(kb.sym(tabulator.rdf.Util.uri.docpart(subject.uri)), kb))
             || (subject.termType == 'bnode' && kb.anyStatementMatching(subject) &&
             outline.UserInput.updateService.editMethod(kb.anyStatementMatching(subject).why)
                //check the document containing something about of the bnode @@ what about as object?
             )) {
            var holdingTr = myDocument.createElement('tr'); //these are to minimize required changes
            var holdingTd = myDocument.createElement('td'); //in userinput.js
            holdingTd.setAttribute('colspan','2');
            holdingTd.setAttribute('notSelectable','true');
            var img = myDocument.createElement('img');
            img.src = tabulator.Icon.src.icon_add_new_triple;
            img.className='bottom-border-active'
            //img.addEventListener('click', thisOutline.UserInput.addNewPredicateObject,false);
            div.appendChild(holdingTr).appendChild(holdingTd).appendChild(img);          
        }
        */       
         
        return div;
    }
}, true);

//ends


