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
    var n = 0; var uris ={}; // Count them
    for (var i=0; i < possible.length; i++) {
        var sub = possible[i];
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
    var currentURI = undefined;
    for (var uri in uris) {
        var c = kb.sym(uri)
        var option = myDocument.createElement('option');
        option.appendChild(myDocument.createTextNode(tabulator.Util.label(c)));
        var backgroundColor = kb.any(c, kb.sym('http://www.w3.org/ns/ui#background-color'));
        if (backgroundColor) option.setAttribute('style', "background-color: "+backgroundColor.value+"; ");
        option.AJAR_uri = uri;
        if (uri in actual) {
            option.setAttribute('selected', 'true')
            currentURI = uri;
            //dump("Already in class: "+ uri+"\n")
        }
        select.appendChild(option);
    }
    if ((currentURI == undefined) && !multiple) {
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
    var du = kb.any(category, tabulator.ns.owl('disjointUnionOf'));
    var subs;
    var multiple = false;
    if (!du) {
        subs = kb.each(undefined, tabulator.ns.rdfs('subClassOf'), category);
        multiple = true;
    } else {
        subs = du.elements            
    }
    
    if (subs.length == 0) throw "Can't do "+ (multiple?"multiple ":"")+"selector with no subclasses of category: "+category;
    return tabulator.panes.utils.makeSelectForOptions(myDocument, kb, subject, tabulator.ns.rdf('type'), subs,
                    multiple, "--classify--", storeDoc, callback);
}


	
/*  Build a checkbox from a given statement
** 
**  If the source document is ediable, make it editable
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
  