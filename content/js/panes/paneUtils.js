/**
* Few General purpose utlity functions used in the panes
* oshani@csail.mit.edu 
*/


paneUtils = {};
tabulator.panes.utils = paneUtils;

// This is used to canonicalize an array
tabulator.panes.utils.unique = function(a){
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++){
      for(var x = 0, y = r.length; x < y; x++){
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}

//To figure out the log URI from the full URI used to invoke the reasoner
tabulator.panes.utils.extractLogURI = function(fullURI){
    var logPos = fullURI.search(/logFile=/);
    var rulPos = fullURI.search(/&rulesFile=/);
    return fullURI.substring(logPos+8, rulPos); 			
}

tabulator.panes.utils.shortDate = function(str) {
    var now = $rdf.term(new Date()).value;
    if (str.slice(0,10) == now.slice(0,10)) return str.slice(11,16);
    return str.slice(0,10);
}


	
//These are horrible global vars. To minimize the chance of an unintended name collision
//these are prefixed with 'ap_' (short for air pane) - Oshani
var ap_air = tabulator.rdf.Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
var ap_tms = tabulator.rdf.Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
var ap_compliant = ap_air('compliant-with');
var ap_nonCompliant = ap_air('non-compliant-with');
var ap_antcExpr = ap_tms('antecedent-expr');
var ap_just = ap_tms('justification');
var ap_subExpr = ap_tms('sub-expr');
var ap_description = ap_tms('description');
var ap_ruleName = ap_tms('rule-name');
var ap_prem = ap_tms('premise');
var ap_instanceOf = ap_air('instanceOf');
var justificationsArr = [];



/*              General purpose widgets
**
*/



//      Description text area
//
// Make a box to demand a description or display existing one
//
// @param myDocument - the document DOM for the user interface
// @param kb - the graph which is the knowledge base we are working with
// @param subject - a term, the subject of the statement(s) being edited.
// @param predicate - a term, the predicate of the statement(s) being edited
// @param storeDoc - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)

tabulator.panes.utils.makeDescription = function(myDocument, kb, subject, predicate, storeDoc, callback) {
    var sparqlService = new tabulator.rdf.sparqlUpdate(kb); // @@ Use a common one attached to each fetcher or merge with fetcher
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
        field.value = "enter a description here"
        field.select(); // Select it ready for user input -- doesn't work
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







// Make SELECT element to select options
//
// @param subject - a term, the subject of the statement(s) being edited.
// @param predicate - a term, the predicate of the statement(s) being edited
// @param possible - a list of terms, the possible value the object can take
// @param multiple - Boolean - Whether more than one at a time is allowed 
// @param nullLabel - a string to be displayed as the
//                        option for none selected (for non multiple)
// @param storeDoc - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForOptions = function(myDocument, kb, subject, predicate,
                possible, multiple, nullLabel, storeDoc, callback) {
    var sparqlService = new tabulator.rdf.sparqlUpdate(kb);
    tabulator.log.debug('Select list length now '+ possible.length)
    var n = 0; var uris ={}; // Count them
    for (var i=0; i < possible.length; i++) {
        var sub = possible[i];
        // tabulator.log.warn('Select element: '+ sub)
        if (sub.uri in uris) continue;
        uris[sub.uri] = true; n++;
    } // uris is now the set of possible options
    if (n==0) throw "Can't do selector with no subclasses "+subject+" possible: "+possible
    
    var actual = {};
    kb.each(subject, predicate).map(function(x){actual[x.uri] = true});
    
    var onChange = function(e) {
        select.disabled = true; // until data written back - gives user feedback too
        var ds = [], is = [];
        for (var i =0; i< select.options.length; i++) {
            var opt = select.options[i];
            if (!opt.AJAR_uri) continue; // a prompt
            if (opt.selected && !(opt.AJAR_uri in actual)) { // new class
                is.push(new $rdf.Statement(subject,
                    predicate, kb.sym(opt.AJAR_uri),storeDoc ));
            }
            if (!opt.selected && opt.AJAR_uri in actual) {  // old class
                ds.push(new $rdf.Statement(subject,
                    predicate, kb.sym(opt.AJAR_uri),storeDoc ));
            }
            if (opt.selected) select.currentURI =  opt.AJAR_uri;                      
        }
        var sub = select.subSelect;
        while (sub && sub.currentURI) {
            ds.push(new $rdf.Statement(subject,
                    predicate, kb.sym(sub.currentURI),storeDoc));
            sub = sub.subSelect;
        }
        sparqlService.update(ds, is,
            function(uri, ok, body) {
                actual = {}; // refresh
                kb.each(subject, predicate).map(function(x){actual[x.uri] = true});
                if (ok) select.disabled = false; // data written back
                if (callback) callback(ok, body);
            });
    }
    
    var select = myDocument.createElement('select');
    select.setAttribute('style', 'margin: 0.6em 1.5em;')
    if (multiple) select.setAttribute('multiple', 'true');
    select.currentURI = null;
    for (var uri in uris) {
        var c = kb.sym(uri)
        var option = myDocument.createElement('option');
        option.appendChild(myDocument.createTextNode(tabulator.Util.label(c)));
        var backgroundColor = kb.any(c, kb.sym('http://www.w3.org/ns/ui#background-color'));
        if (backgroundColor) option.setAttribute('style', "background-color: "+backgroundColor.value+"; ");
        option.AJAR_uri = uri;
        if (uri in actual) {
            option.setAttribute('selected', 'true')
            select.currentURI = uri;
            //dump("Already in class: "+ uri+"\n")
        }
        select.appendChild(option);
    }
    if ((select.currentURI == null) && !multiple) {
        var prompt = myDocument.createElement('option');
        prompt.appendChild(myDocument.createTextNode(nullLabel));
        //dump("prompt option:" + prompt + "\n")
        select.insertBefore(prompt, select.firstChild)
        prompt.selected = true;
    }
    select.addEventListener('change', onChange, false)
    return select;

} // makeSelectForOptions


// Make SELECT element to select subclasses
//
// If there is any disjoint union it will so a mutually exclusive dropdown
// Failing that it will do a multiple selection of subclasses.
// Callback takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForCategory = function(myDocument, kb, subject, category, storeDoc, callback) {
    var types = kb.findTypeURIs(subject);
    var log = tabulator.log;
    var du = kb.any(category, tabulator.ns.owl('disjointUnionOf'));
    var subs;
    var multiple = false;
    if (!du) {
        subs = kb.each(undefined, tabulator.ns.rdfs('subClassOf'), category);
        multiple = true;
    } else {
        subs = du.elements            
    }
    log.debug('Select list length '+ subs.length)
    if (subs.length == 0) throw "Can't do "+ (multiple?"multiple ":"")+"selector with no subclasses of category: "+category;
    if (subs.length == 1) throw "Can't do "+ (multiple?"multiple ":"")+"selector with only 1 subclass of category: "+category+":"+subs[1];
    return tabulator.panes.utils.makeSelectForOptions(myDocument, kb, subject, tabulator.ns.rdf('type'), subs,
                    multiple, "--classify--", storeDoc, callback);
}

// Make SELECT element to select subclasses recurively
//
// It will so a mutually exclusive dropdown, with another if there are nested 
// disjoint unions.
// Callback takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForNestedCategory = function(
                myDocument, kb, subject, category, storeDoc, callback) {
    var container = myDocument.createElement('span'); // Container
    var child = null;
    var select;
    var onChange = function(ok, body) {
        if (ok) update();
        callback(ok, body);
    }
    select = tabulator.panes.utils.makeSelectForCategory(
                myDocument, kb, subject, category, storeDoc, onChange);
    container.appendChild(select);
    var update = function() {
        // tabulator.log.info("Selected is now: "+select.currentURI);
        if (child) { container.removeChild(child); child = null;}
        if (select.currentURI && kb.any(kb.sym(select.currentURI), tabulator.ns.owl('disjointUnionOf'))) {
            child = tabulator.panes.utils.makeSelectForNestedCategory(
                myDocument, kb, subject, kb.sym(select.currentURI), storeDoc, callback)
            select.subSelect = child.firstChild;
            container.appendChild(child);
        }
    };
    update();
    return container;
}

	
/*  Build a checkbox from a given statement
** 
**  If the source document is ediable, make the checkbox editable
** originally in socialPane
*/
tabulator.panes.utils.buildCheckboxForm = function(doc, kb, lab, statement, state) {
    var f = doc.createElement('form');
    var input = doc.createElement('input');
    f.appendChild(input);
    var tx = doc.createTextNode(lab);
    var editable = outline.UserInput.updateService.editMethod(
        kb.sym(tabulator.rdf.Util.uri.docpart(statement.why.uri)), kb);
    tx.className = 'question';
    f.appendChild(tx);
    input.setAttribute('type', 'checkbox');
    input.checked = state;
    if (!editable) return f;
    
    var boxHandler = function(e) {
        tx.className = 'pendingedit';
        // alert('Should be greyed out')
        if (this.checked) { // Add link
            try {
                outline.UserInput.sparqler.insert_statement(statement, function(uri,success,error_body) {
                    tx.className = 'question';
                    if (!success){
                        prompts.alert(null,"Message","Error occurs while inserting "+statement+'\n\n'+error_body);
                        input.checked = false; //rollback UI
                        return;
                    }
                    kb.add(statement.subject, statement.predicate, statement.object, statement.why);                        
                })
            }catch(e){
                prompts.alert(null,"Message","Data write fails:" + e);
                input.checked = false; //rollback UI
                tx.className = 'question';
            }
        } else { // Remove link
            try {
                outline.UserInput.sparqler.delete_statement(statement, function(uri,success,error_body) {
                    tx.className = 'question';
                    if (!success){
                        prompts.alert(null,"Message","Error occurs while deleting "+statement+'\n\n'+error_body);
                        this.checked = true; // Rollback UI
                    } else {
                        kb.removeMany(statement.subject, statement.predicate, statement.object, statement.why);
                    }
                })
            }catch(e){
                prompts.alert(null,"Message","Delete fails:" + e);
                this.checked = true; // Rollback UI
                return;
            }
        }
    }
    input.addEventListener('click', boxHandler, false);
    return f;
}
  