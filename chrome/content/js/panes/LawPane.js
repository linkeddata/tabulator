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

LawPane.render = function(subject, myDocument) {

    var div = myDocument.createElement("div");
    div.setAttribute('class', 'RDFXMLPane');
    
    var uris = extractFileURIs(myDocument.location.toString()); 
    var log = uris.pop();
    var policy = uris.pop();
    
    //Create the Issue div
    var div_issue = myDocument.createElement("div");
    div_issue.setAttribute('id', 'div_issue');
    div_issue.setAttribute('class', 'RDFXMLPane');
    div_issue.appendChild(myDocument.createTextNode('Issue:'));
    div_issue.appendChild(myDocument.createTextNode('Whether the transactions in ' +
    		log + ' {about [VariableName] [VariableValue]} comply with ' + policy));
    div.appendChild(div_issue);
    
    //Create the Rules div
    var div_rule = myDocument.createElement("div");
    div_rule.setAttribute('class', 'RDFXMLPane');
    div_rule.setAttribute('id', 'div_rule');
    div_rule.appendChild(myDocument.createTextNode('Rule: To be compliant, [SubPolicyPopularName] ' +
    		'of [MasterPolicyPopularName] requires [PatternVariableName] of an event to be ' +
    		'[PatternValue1].'));
    div.appendChild(div_rule);
    
    //Create the Facts div
    var div_facts = myDocument.createElement("div");
    div_facts.setAttribute('class', 'RDFXMLPane');
    div_facts.setAttribute('id', 'div_facts');
    div_facts.appendChild(myDocument.createTextNode('Fact: In transaction [TransactionNumber] ' +
    		'[PatternVariableName] of the event was [PatternValue2].'));
    div.appendChild(div_facts);
    
    //Create the Analysis div
    var div_analysis = myDocument.createElement("div");
    div_analysis.setAttribute('class', 'RDFXMLPane');
    div_analysis.setAttribute('id', 'div_analysis');
    div_analysis.appendChild(myDocument.createTextNode('Analysis: [PatternValue2] is not [PatternValue].'));
    div.appendChild(div_analysis);
    
    //Create the Conclusion div
    var div_conclusion = myDocument.createElement("div");
    div_conclusion.setAttribute('class', 'RDFXMLPane');
    div_conclusion.setAttribute('id', 'div_conclusion');
    div_conclusion.appendChild(myDocument.createTextNode('Conclusion: The transactions appear to be ' +
    		'non-compliant with [SubPolicyName] of [MasterPolicyPopularName].'));
    div.appendChild(div_conclusion);
    
    return div;

}
