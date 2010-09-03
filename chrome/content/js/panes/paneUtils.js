/**
* Few General purpose utlity functions used in the panes
* oshani@csail.mit.edu 
*/


paneUtils = {};

// This is used to canonicalize an array
paneUtils.unique = function(a){
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
paneUtils.extractLogURI = function(fullURI){
	var logPos = fullURI.search(/logFile=/);
	var rulPos = fullURI.search(/&rulesFile=/);
	return fullURI.substring(logPos+8, rulPos); 			
}
	
//These are horrible global vars. To minimize the chance of an unintended name collision
//these are prefixed with 'ap_' (short for air pane) 
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
	
/*  Build a checkbox from a given statement
** 
**  If the source document is ediable, make it editable
** originally in socialPane
*/
paneUtils.buildCheckboxForm = function(doc, kb, lab, statement, state) {
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
  