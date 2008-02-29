/*  Lawyer Pane
*
*  This pane shows the Lawyer's view of reasoning
* 
*/
LawPane = {};
LawPane.icon = Icon.src.icon_LawPane;
LawPane.label = function(subject) {

    stsJust = kb.statementsMatching(undefined, just, undefined, subject); 

        for (var j=0; j<stsJust.length; j++){
            if (stsJust[j].subject.termType == 'formula'){
            var sts = stsJust[j].subject.statements;
            for (var k=0; k<sts.length; k++){
                if (sts[k].predicate.toString() == compliant.toString()){
                    stsCompliant = sts[k];
                	return "Lawyer's View";
                    
                } 
                if (sts[k].predicate.toString() == nonCompliant.toString()){
                    stsNonCompliant = sts[k];
                    return "Lawyer's View";
               	}
               }
            }    
        }
    
   return null;
}

//TODO handle more than one log file and policy file
//This is a very clumsy method and should be changed
//this returns the log and the policy file URIs from the full URI
//Fails when there are multiple logs and policy files
extractFileURIs = function(fullURI){
	var uris = [];
	var logPos = fullURI.search(/logFile=/);
	var rulPos = fullURI.search(/&rulesFile=/);
	uris.push(fullURI.substring(logPos+8, rulPos));
	uris.push(fullURI.substring(rulPos+11, fullURI.length));
	return uris; 			
}

LawPane.display = function(myDocument,obj){
	var div = myDocument.createElement("div");
	for (var i=0; i<obj.elements.length; i++) {
        switch(obj.elements[i].termType) {
            case 'symbol':
                var anchor = myDocument.createElement('a')
                anchor.setAttribute('href', obj.elements[i].uri)
                anchor.appendChild(myDocument.createTextNode(label(obj.elements[i])));
                div.appendChild(anchor);
                
            case 'literal':
            	if (obj.elements[i].value != undefined)
                	div.appendChild(myDocument.createTextNode(obj.elements[i].value)); 
        }
	}    
	return div;
}
	
LawPane.render = function(subject, myDocument) {

    var div = myDocument.createElement("div");
    div.setAttribute('class', 'RDFXMLPane');
    
    //Extract the log and policy files
    var uris = extractFileURIs(myDocument.location.toString()); 
    var policy = uris.pop();
    var log = uris.pop();
    
    var stsJust = kb.statementsMatching(undefined, just, undefined, subject); 
 	
 	// TODO: & FIXME: There could be a bug here, but that all depends on the format of the proof tree
 	// {non-compliant/compliant} air:description (the description) stuff could appear more than once
 	// The code here wil push all that to 'stsDescAll'
 	// The problem is there is no direct correlation with these initial description statements and once 
 	// that are obtained by following the rule names
 	var stsDescAll = [];
 	var stsAnalysisAll = [];
 	var stsDesc = kb.statementsMatching(undefined, description, undefined, subject); 
    for (var j=0; j<stsDesc.length; j++){
	    if (stsDesc[j].subject.termType == 'formula' && stsDesc[j].object.termType == 'collection'){
	    	    stsAnalysisAll.push(LawPane.display(myDocument, stsDesc[j].object));
		}
	}
	var stsFound = [];
	for (var j=0; j<stsJust.length; j++){
	    if (stsJust[j].subject.termType == 'formula'){
	        var sts = stsJust[j].subject.statements;
	        for (var k=0; k<sts.length; k++){
	            if (sts[k].predicate.toString() == compliant.toString() ||
	            	sts[k].predicate.toString() == nonCompliant.toString()){
	                stsFound.push(sts[k]);
	            } 
	        }
	        if (stsJust[j].object.termType == 'bnode'){
            	var ruleNameSts = kb.statementsMatching(stsJust[j].object, ruleName, undefined, subject);
            	var ruleNameFound =	ruleNameSts[0].object; // This would be the initial rule name
            	
            	var terminatingCondition = kb.statementsMatching(ruleNameFound, just, prem, subject);
				while (terminatingCondition[0] == undefined){
	            	var currentRule = kb.statementsMatching(ruleNameFound, undefined, undefined, subject);
	            	
	            	if (currentRule[0].object.termType == 'collection'){
			    	    stsDescAll.push(LawPane.display(myDocument, currentRule[0].object));
	                }
	        		var currentRuleSts = kb.statementsMatching(currentRule[0].subject, just, undefined, subject);
				   	var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ruleName, undefined, subject);
				   	ruleNameFound = nextRuleSts[0].object;
			   		terminatingCondition = kb.statementsMatching(ruleNameFound, just, prem, subject);
				}
	        }
	   	}    
	}
    
    //Create the Issue div
    
    var div_issue = myDocument.createElement("div");
    div_issue.setAttribute('id', 'div_issue');
    div_issue.setAttribute('class', 'RDFXMLPane');
    var table_issue = myDocument.createElement("table");
    var tr_issue = myDocument.createElement("tr");
    var td_img = myDocument.createElement("td");
    var td_issue = myDocument.createElement("td");
    td_issue.appendChild(myDocument.createTextNode('Issue:'));
    tr_issue.appendChild(td_img);
    tr_issue.appendChild(td_issue);
    table_issue.appendChild(tr_issue);
    var tr_issue_data = myDocument.createElement('tr');
    var td_issue_dummy = myDocument.createElement('td');
    td_issue_dummy.appendChild(myDocument.createTextNode(' '));
    tr_issue_data.appendChild(td_issue_dummy);
	var td_issue_data = myDocument.createElement('td');
    td_issue_data.appendChild(myDocument.createTextNode('Whether the transactions in '));
    var a_log = myDocument.createElement('a')
    a_log.setAttribute('href', log)
    a_log.appendChild(myDocument.createTextNode(log));
    td_issue_data.appendChild(a_log);
    td_issue_data.appendChild(myDocument.createTextNode(' comply with '));
    var a_policy = myDocument.createElement('a')
    a_policy.setAttribute('href', policy)
    a_policy.appendChild(myDocument.createTextNode(policy));
    td_issue_data.appendChild(a_policy);
    tr_issue_data.appendChild(td_issue_data);
	table_issue.appendChild(tr_issue_data);
    div_issue.appendChild(table_issue);
    div.appendChild(div_issue);

    //End of Issue
    
    //Create the Rules div

    var div_rule = myDocument.createElement("div");
    div_rule.setAttribute('class', 'RDFXMLPane');
    div_rule.setAttribute('id', 'div_rule');
    div_rule.appendChild(myDocument.createTextNode('Rule: To be compliant, [SubPolicyPopularName] ' +
    		'of [MasterPolicyPopularName] requires [PatternVariableName] of an event to be ' +
    		'[PatternValue1].'));
    div.appendChild(div_rule);
    
    //End of Rules

    //Create the Facts div

    var div_facts = myDocument.createElement("div");
    div_facts.setAttribute('class', 'RDFXMLPane');
    div_facts.setAttribute('id', 'div_facts');
    
    var table_facts = myDocument.createElement("table");
    var tr_facts = myDocument.createElement("tr");
    var td_img = myDocument.createElement("td");
    var td_facts = myDocument.createElement("td");
    td_facts.appendChild(myDocument.createTextNode('Facts:'));
    tr_facts.appendChild(td_img);
    tr_facts.appendChild(td_facts);
    table_facts.appendChild(tr_facts);
    var tr_facts_data = myDocument.createElement('tr');
    var td_facts_dummy = myDocument.createElement('td');
    td_facts_dummy.appendChild(myDocument.createTextNode(' '));
    tr_facts_data.appendChild(td_facts_dummy);
    var td_facts_data = myDocument.createElement('td');

	var table_inner = myDocument.createElement("table");
    
	var tr = myDocument.createElement("tr");
    var td = myDocument.createElement("td");
    
    for (var i=stsDescAll.length-1; i>=0; i--){
    	td.appendChild(stsDescAll[i]);
    }

    tr.appendChild(td);       
	table_inner.appendChild(tr);

	td_facts_data.appendChild(table_inner);
	tr_facts_data.appendChild(td_facts_data);
    table_facts.appendChild(tr_facts_data);
    div_facts.appendChild(table_facts);
	div.appendChild(div_facts);
    
    //End of Facts

    //Create the Analysis div

    var div_analysis = myDocument.createElement("div");
    div_analysis.setAttribute('class', 'RDFXMLPane');
    div_analysis.setAttribute('id', 'div_analysis');
    var table_analysis = myDocument.createElement("table");
    var tr_analysis = myDocument.createElement("tr");
    var td_img = myDocument.createElement("td");
    var td_analysis = myDocument.createElement("td");
    td_analysis.appendChild(myDocument.createTextNode('Analysis:'));
    tr_analysis.appendChild(td_img);
    tr_analysis.appendChild(td_analysis);
    table_analysis.appendChild(tr_analysis);
    var tr_analysis_data = myDocument.createElement('tr');
    var td_analysis_dummy = myDocument.createElement('td');
    td_analysis_dummy.appendChild(myDocument.createTextNode(' '));
    tr_analysis_data.appendChild(td_analysis_dummy);
    var td_analysis_data = myDocument.createElement('td');

	var table_inner = myDocument.createElement("table");
    
	var tr = myDocument.createElement("tr");
    var td = myDocument.createElement("td");
    
    for (var i=0; i<stsAnalysisAll.length; i++){
    	td.appendChild(stsAnalysisAll[i]);
    }

    tr.appendChild(td);       
	table_inner.appendChild(tr);

	td_analysis_data.appendChild(table_inner);
	tr_analysis_data.appendChild(td_analysis_data);
    table_analysis.appendChild(tr_analysis_data);
    div_analysis.appendChild(table_analysis);
    div.appendChild(div_analysis);

    //End of Analysis
    
    //Create the Conclusion div
    
    var div_conclusion = myDocument.createElement("div");
    div_conclusion.setAttribute('class', 'RDFXMLPane');
    div_conclusion.setAttribute('id', 'div_conclusion');
    var table_conclusion = myDocument.createElement("table");
    var tr_conclusion = myDocument.createElement("tr");
    var td_img = myDocument.createElement("td");
    var td_conclusion = myDocument.createElement("td");
    td_conclusion.appendChild(myDocument.createTextNode('Conclusion:'));
    tr_conclusion.appendChild(td_img);
    tr_conclusion.appendChild(td_conclusion);
    table_conclusion.appendChild(tr_conclusion);
    var tr_conclusion_data = myDocument.createElement('tr');
    var td_conclusion_dummy = myDocument.createElement('td');
    td_conclusion_dummy.appendChild(myDocument.createTextNode(' '));
    tr_conclusion_data.appendChild(td_conclusion_dummy);
    var td_conclusion_data = myDocument.createElement('td');

	var table_inner = myDocument.createElement("table");

	for (var i=0; i<stsFound.length; i++){

            var tr = myDocument.createElement("tr");
            var td_intro = myDocument.createElement("td");
            td_intro.appendChild(myDocument.createTextNode('The transaction - '));
            tr.appendChild(td_intro);

            var td_s = myDocument.createElement("td");
            var a_s = myDocument.createElement('a')
            a_s.setAttribute('href', stsFound[i].subject.uri)
            a_s.appendChild(myDocument.createTextNode(label(stsFound[i].subject)));
            td_s.appendChild(a_s);
            tr.appendChild(td_s);

            var td_is = myDocument.createElement("td");
            td_is.appendChild(myDocument.createTextNode(' is '));
            tr.appendChild(td_is);

            var td_p = myDocument.createElement("td");
//            var a_p = myDocument.createElement('a')
//            a_p.setAttribute('href', stsFound[i].predicate.uri)
//            a_p.appendChild(myDocument.createTextNode(label(stsFound[i].predicate)));
//            td_p.appendChild(a_p);
            td_p.appendChild(myDocument.createTextNode(label(stsFound[i].predicate)));
			tr.appendChild(td_p);
			
            var td_o = myDocument.createElement("td");
            var a_o = myDocument.createElement('a')
            a_o.setAttribute('href', stsFound[i].object.uri)
            a_o.appendChild(myDocument.createTextNode(label(stsFound[i].object)));
            td_o.appendChild(a_o);
            tr.appendChild(td_o);
            table_inner.appendChild(tr);

	}
	td_conclusion_data.appendChild(table_inner);
	tr_conclusion_data.appendChild(td_conclusion_data);
    table_conclusion.appendChild(tr_conclusion_data);
    div_conclusion.appendChild(table_conclusion);
    div.appendChild(div_conclusion);
    
    //End of Conclusion
    
    return div;

}
