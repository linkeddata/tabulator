 /** AIR (Amord in RDF) Pane
 *
 * This pane will display the justification trace of a when it encounters 
 * air reasoner output
 * oshani@csail.mit.edu
 */
 
airPane = {};
airPane.name = 'air';
airPane.icon = Icon.src.icon_airPane;

//These are horrible global vars. To minimize the chance of an unintended name collision
//these are prefixed with 'ap_' (short for air pane) 
var ap_air = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
var ap_tms = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
var ap_compliant = ap_air('compliant-with');
var ap_nonCompliant = ap_air('non-compliant-with');
var ap_antcExpr = ap_tms('antecedent-expr');
var ap_just = ap_tms('justification');
var ap_subExpr = ap_tms('sub-expr');
var ap_description = ap_tms('description');
var ap_ruleName = ap_tms('rule-name');
var ap_prem = ap_tms('premise');
var ap_instanceOf = ap_air('instanceOf');
var compliantSubjects = [];
var nonCompliantSubjects = [];
		 
airPane.label = function(subject) {

	//Find all the statements with air:justification in it
	var stsJust = kb.statementsMatching(undefined, ap_just, undefined, subject); 
	//This will hold the string to display if the pane appears
	var stringToDisplay = null
	//Then make a registry of the compliant and non-compliant subjects
	//(This algorithm is heavily dependant on the output from the reasoner.
	//If the output changes, the parser will break.)
	for (var j=0; j<stsJust.length; j++){
		//The subject of the statements should be a quouted formula and
		//the object should not be tms:premise (this corresponds to the final chunk of the output 
		//which has {some triples} tms:justification tms:premise)
		if (stsJust[j].subject.termType == 'formula' && stsJust[j].object != ap_prem.toString()){
			var sts = stsJust[j].subject.statements;
			if (sts.length != 1) throw new Error("There should be only ONE statement indicating some event is (non-)compliant with some policy!")
			//Keep track of the subjects of the statements in the global variables above and return "Justify"
			//which will be the tool-tip text of the label icon
			if (sts[0].predicate.toString() == ap_compliant.toString())
				compliantSubjects.push(sts[0].subject);
			if (sts[0].predicate.toString() == ap_nonCompliant.toString())
				nonCompliantSubjects.push(sts[0].subject);
			stringToDisplay = "Justify" //Even with one relevant statement this method should return something 
		}   
	}
	//Make the subject list we will be exploring in the render function unique
	compliantSubjects = paneUtils.unique(compliantSubjects);
	nonCompliantSubjects = paneUtils.unique(nonCompliantSubjects); 
   return stringToDisplay;
}

// View the justification trace in an exploratory manner
airPane.render = function(subject, myDocument) {

	//Variables specific to the UI
	var statementsAsTables = tabulator.panes.dataContentPane.statementsAsTables;        
	var divClass;
	var div = myDocument.createElement("div");

	//Helpers
	var logFileURI = paneUtils.extractLogURI(myDocument.location.toString());
	
	div.setAttribute('class', 'dataContentPane'); //airPane has the same formatting as the dataContentPane
	div.setAttribute('id', 'dataContentPane'); //airPane has the same formatting as the dataContentPane

	//@@ The following bit should handle the case of multiple justifications 
	/*
	airPane.render.justification =  function(justArr, subject){

		//Do this for all the subjects we have found in the label function
		for (var i=justArr.length; i > 0; i--){
	
			//Create a container div
			var divContainer = myDocument.createElement("div");
			divContainer.setAttribute('class', 'container');
			divContainer.setAttribute('id', 'container');
			
			var divOutcome = myDocument.createElement("div"); //To give the "yes/no" type answer indicating the concise reason
			divOutcome.setAttribute('id', 'outcome');
	
			var stsJust = kb.statementsMatching(undefined, ap_just, undefined, subject); 
			for (var j=0; j<stsJust.length; j++){
				//We are only interested in the bigger justification proof tree. So filter out the rest.
				if (stsJust[j].subject.termType == 'formula' && 
					stsJust[j].subject.statements[0].subject == justArr[0].toString() &&
					stsJust[j].object != ap_prem.toString()){
					var sts = stsJust[j].subject.statements;
					//Differentiate between the compliant and non-compliant statements to give some eye-candy
					if (sts[0].predicate.toString() == ap_compliant.toString()){
						divOutcome.setAttribute('class', 'compliantPane');
					}
					if (sts[0].predicate.toString() == ap_nonCompliant.toString()){
						divOutcome.setAttribute('class', 'nonCompliantPane');
					}
					
					//Add the contents of the outcome first		
					var table = myDocument.createElement("table");
					var tr = myDocument.createElement("tr");
		
				    	var td_s = myDocument.createElement("td");
					var a_s = myDocument.createElement('a')
					a_s.setAttribute('href', sts[0].subject.uri)
					a_s.appendChild(myDocument.createTextNode(label(sts[0].subject)));
					td_s.appendChild(a_s);
					tr.appendChild(td_s);

					var td_is = myDocument.createElement("td");
					td_is.appendChild(myDocument.createTextNode(' is '));
					tr.appendChild(td_is);

					var td_p = myDocument.createElement("td");
					var a_p = myDocument.createElement('a');
					a_p.setAttribute('href', sts[0].predicate.uri)
					a_p.appendChild(myDocument.createTextNode(label(sts[0].predicate)));
					td_p.appendChild(a_p);
					tr.appendChild(td_p);

					var td_o = myDocument.createElement("td");
					var a_o = myDocument.createElement('a')
					a_o.setAttribute('href', sts[0].object.uri)
					a_o.appendChild(myDocument.createTextNode(label(sts[0].object)));
					td_o.appendChild(a_o);
					tr.appendChild(td_o);

				  	table.appendChild(tr);
					divOutcome.appendChild(table);
					divContainer.appendChild(divOutcome);
		
				}
				    
			}

			//Find the statements with tms:justification as the premise and narrow the search with the subject from the loop 	
			div.appendChild(divContainer);
		}
	}
	
	//In a multiple justifications scenario first display the non-compliant stuff and then the compliant stuff
	airPane.render.justification(nonCompliantSubjects)
	airPane.render.justification(compliantSubjects)
	
	*/
	
	//Variables specific to the logic	
	var ruleNameFound;
	var stsCompliant;
	var stsNonCompliant;
	var stsFound;
	var stsJust = kb.statementsMatching(undefined, ap_just, undefined, subject); 
	
	var divOutcome = myDocument.createElement("div"); //To give the "yes/no" type answer indicating the concise reason

	for (var j=0; j<stsJust.length; j++){
		if (stsJust[j].subject.termType == 'formula'){
			var sts = stsJust[j].subject.statements;
			for (var k=0; k<sts.length; k++){
				if (sts[0].predicate.toString() == ap_compliant.toString()){
					stsCompliant = sts[k];
				} 
				if (sts[0].predicate.toString() == ap_nonCompliant.toString()){
					stsNonCompliant = sts[k];
				}
			}
		}    
	}

	if (stsNonCompliant != undefined){
		divClass = 'nonCompliantPane';
		stsFound =  stsNonCompliant;
	}
	if (stsCompliant != undefined){
		divClass = 'compliantPane';
		stsFound =  stsCompliant;
	}
	
	if (stsFound != undefined){
		divOutcome.setAttribute('class', divClass);
		divOutcome.setAttribute('id', 'outcome');
	
		var table = myDocument.createElement("table");
		var tr = myDocument.createElement("tr");
		
	 /*   var td_intro = myDocument.createElement("td");
		td_intro.appendChild(myDocument.createTextNode('The reason '));
		tr.appendChild(td_intro);
	*/
		var td_s = myDocument.createElement("td");
		var a_s = myDocument.createElement('a')
		a_s.setAttribute('href', stsFound.subject.uri)
		a_s.appendChild(myDocument.createTextNode(label(stsFound.subject)));
		td_s.appendChild(a_s);
		tr.appendChild(td_s);

		var td_is = myDocument.createElement("td");
		td_is.appendChild(myDocument.createTextNode(' is '));
		tr.appendChild(td_is);

		var td_p = myDocument.createElement("td");
		var a_p = myDocument.createElement('a');
		a_p.setAttribute('href', stsFound.predicate.uri)
		a_p.appendChild(myDocument.createTextNode(label(stsFound.predicate)));
		td_p.appendChild(a_p);
		tr.appendChild(td_p);

		var td_o = myDocument.createElement("td");
		var a_o = myDocument.createElement('a')
		a_o.setAttribute('href', stsFound.object.uri)
		a_o.appendChild(myDocument.createTextNode(label(stsFound.object)));
		td_o.appendChild(a_o);
		tr.appendChild(td_o);

	  /* 	var td_end = myDocument.createElement("td");
		td_end.appendChild(myDocument.createTextNode(' is because: '));
		tr.appendChild(td_end);
	  */
		
		table.appendChild(tr);
		divOutcome.appendChild(table);
		div.appendChild(divOutcome);
		
		var hideButton = myDocument.createElement('input');
		hideButton.setAttribute('type','button');
		hideButton.setAttribute('id','hide');
		hideButton.setAttribute('value','Start Over');
	}

	airPane.render.addInitialButtons = function(){ //Function Call 1

		//Create and append the 'Why?' button        
		var becauseButton = myDocument.createElement('input');
		becauseButton.setAttribute('type','button');
		becauseButton.setAttribute('id','whyButton');
		becauseButton.setAttribute('value','Why?');
		div.appendChild(becauseButton);
		becauseButton.addEventListener('click',airPane.render.because,false);
							
		div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
	}
	
	airPane.render.hide = function(){
	
		//Remove the justification div from the pane
		var d = myDocument.getElementById('dataContentPane');
		var j = myDocument.getElementById('justification');
		var b = myDocument.getElementById('hide');
		var m = myDocument.getElementById('more');
		if (d != null && m != null){
			d.removeChild(m);
		}
		if (d != null && j != null && b != null){
			d.removeChild(j);
			d.removeChild(b);
		}

		airPane.render.addInitialButtons();
					
	}

	airPane.render.because = function(){ //Function Call 2
	
		var cwa = ap_air('closed-world-assumption');
		var cwaStatements = kb.statementsMatching(undefined, cwa, undefined, subject);
		var noPremises = false;
		if (cwaStatements.length > 0){
			noPremises = true;
		}
		
	   	//Disable the 'why' button, otherwise clicking on that will keep adding the divs 
	   	var whyButton = myDocument.getElementById('whyButton');
		var d = myDocument.getElementById('dataContentPane');
		if (d != null && whyButton != null)
			d.removeChild(whyButton);
	
		airPane.render.because.displayDesc = function(obj){
			for (var i=0; i<obj.elements.length; i++) {
					switch(obj.elements[i].termType) {

						//@@ As per Lalana's request to handle formulas within the description
						case 'formula':
							divDescription.appendChild(statementsAsTables(obj.elements[i],myDocument));

						case 'symbol':
							var anchor = myDocument.createElement('a')
							anchor.setAttribute('href', obj.elements[i].uri)
							anchor.appendChild(myDocument.createTextNode(label(obj.elements[i])));
							divDescription.appendChild(anchor);
							
						case 'literal':
							if (obj.elements[i].value != undefined)
								divDescription.appendChild(myDocument.createTextNode(obj.elements[i].value)); 

					}       
				}
		}

		airPane.render.because.moreInfo = function(ruleToFollow){
			//Terminating condition: 
			// if the rule has for example - "pol:MA_Disability_Rule_1 tms:justification tms:premise"
			// there are no more information to follow
			var terminatingCondition = kb.statementsMatching(ruleToFollow, ap_just, ap_prem, subject);
			if (terminatingCondition[0] != undefined){

			   divPremises.appendChild(myDocument.createElement('br'));
			   divPremises.appendChild(myDocument.createElement('br'));
			   divPremises.appendChild(myDocument.createTextNode("No more information available from the reasoner!"));
			   divPremises.appendChild(myDocument.createElement('br'));
			   divPremises.appendChild(myDocument.createElement('br'));
		   
			}
			else{
				
				//Update the description div with the description at the next level
				var currentRule = kb.statementsMatching(undefined, undefined, ruleToFollow);
				
				//Find the corresponding description matching the currenrRule

				var currentRuleDescSts = kb.statementsMatching(undefined, undefined, currentRule[0].object);
				
				for (var i=0; i<currentRuleDescSts.length; i++){
					if (currentRuleDescSts[i].predicate == ap_instanceOf.toString()){
						var currentRuleDesc = kb.statementsMatching(currentRuleDescSts[i].subject, undefined, undefined, subject);
						
						for (var j=0; j<currentRuleDesc.length; j++){
							if (currentRuleDesc[j].predicate == ap_description.toString() &&
							currentRuleDesc[j].object.termType == 'collection'){
								divDescription.appendChild(myDocument.createElement('br'));
								airPane.render.because.displayDesc(currentRuleDesc[j].object);
								divDescription.appendChild(myDocument.createElement('br'));
								divDescription.appendChild(myDocument.createElement('br'));
							}
						}	
					}
				}

				
				var currentRuleSts = kb.statementsMatching(currentRule[0].subject, ap_just, undefined);
				
				var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ap_ruleName, undefined);
				ruleNameFound = nextRuleSts[0].object;

				var currentRuleAntc = kb.statementsMatching(currentRuleSts[0].object, ap_antcExpr, undefined);
				
				var currentRuleSubExpr = kb.statementsMatching(currentRuleAntc[0].object, ap_subExpr, undefined);

				for (var i=0; i<currentRuleSubExpr.length; i++){
					if(currentRuleSubExpr[i].object.termType == 'formula')
						divPremises.appendChild(statementsAsTables(currentRuleSubExpr[i].object.statements, myDocument)); 
				}

			}
		}
		
		airPane.render.because.justify = function(){ //Function Call 3
		
			//Clear the contents of the div
			myDocument.getElementById('premises').innerHTML='';
			airPane.render.because.moreInfo(ruleNameFound);            	

			divJustification.appendChild(divPremises);
			div.appendChild(divJustification);

		}

		//Add the More Information Button
		var justifyButton = myDocument.createElement('input');
		justifyButton.setAttribute('type','button');
		justifyButton.setAttribute('id','more');
		justifyButton.setAttribute('value','More Information');
		justifyButton.addEventListener('click',airPane.render.because.justify,false);
		div.appendChild(justifyButton);
						
		div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
		div.appendChild(myDocument.createTextNode('   '));

		div.appendChild(hideButton);
		hideButton.addEventListener('click',airPane.render.hide,false);

		var divJustification = myDocument.createElement("div");
		divJustification.setAttribute('class', 'justification');
		divJustification.setAttribute('id', 'justification');

		var divDescription = myDocument.createElement("div");
		divDescription.setAttribute('class', 'description');
		divDescription.setAttribute('id', 'description');
		
		var divPremises = myDocument.createElement("div");
		divPremises.setAttribute('class', 'premises');
		divPremises.setAttribute('id', 'premises');
		
		
		var justificationSts;
		
		

		//Display the actual English-like description first
		var stsDesc = kb.statementsMatching(undefined, ap_description, undefined, subject); 

		divJustification.appendChild(myDocument.createElement('br'));

		for (var j=0; j<stsDesc.length; j++){
			if (stsDesc[j].subject.termType == 'formula' && stsDesc[j].object.termType == 'collection'){
				divDescription.appendChild(myDocument.createElement('br'));
				airPane.render.because.displayDesc(stsDesc[j].object);
				divDescription.appendChild(myDocument.createElement('br'));
				divDescription.appendChild(myDocument.createElement('br'));
			}
			divJustification.appendChild(divDescription);
			
		}	
		
		div.appendChild(divJustification);
		
			divJustification.appendChild(myDocument.createElement('br'));
			divJustification.appendChild(myDocument.createElement('br'));
			divJustification.appendChild(myDocument.createElement('b').appendChild(myDocument.createTextNode('Premises:')));
			divJustification.appendChild(myDocument.createElement('br'));
			divJustification.appendChild(myDocument.createElement('br'));

		if (noPremises){
			divPremises.appendChild(myDocument.createElement('br'));
			divPremises.appendChild(myDocument.createElement('br'));
			divPremises.appendChild(myDocument.createTextNode("Nothing interesting found in the "));
			var a = myDocument.createElement('a')
			a.setAttribute("href", unescape(logFileURI));
			a.appendChild(myDocument.createTextNode("log file"));
			divPremises.appendChild(a);
			divPremises.appendChild(myDocument.createElement('br'));
			divPremises.appendChild(myDocument.createElement('br'));
			
		}
			
		for (var j=0; j<stsJust.length; j++){
			if (stsJust[j].subject.termType == 'formula' && stsJust[j].object.termType == 'bnode'){
			
				var ruleNameSts = kb.statementsMatching(stsJust[j].object, ap_ruleName, undefined, subject);
				ruleNameFound =	ruleNameSts[0].object; // This would be the initial rule name from the 
									// statement containing the formula		
				if (!noPremises){
					var t1 = kb.statementsMatching(stsJust[j].object, ap_antcExpr, undefined, subject);
					for (var k=0; k<t1.length; k++){
						var t2 = kb.statementsMatching(t1[k].object, undefined, undefined, subject);
						for (var l=0; l<t2.length; l++){
							if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
								justificationSts = t2;
								divPremises.appendChild(myDocument.createElement('br'));
								divPremises.appendChild(myDocument.createElement('br'));
								if (t2[l].object.statements.length == 0){
									divPremises.appendChild(myDocument.createTextNode("Nothing interesting found in "));
									var a = myDocument.createElement('a')
									a.setAttribute('href', unescape(logFileURI));
									a.appendChild(myDocument.createTextNode("log file"));
									divPremises.appendChild(a);
								}
								else{
									divPremises.appendChild(statementsAsTables(t2[l].object.statements, myDocument)); 
								}
								divPremises.appendChild(myDocument.createElement('br'));
								divPremises.appendChild(myDocument.createElement('br'));
							}
					   }     
					}
				}
			}
		}
		
		divJustification.appendChild(divPremises);    
		  
	}


	airPane.render.addInitialButtons();

	return div;
}

tabulator.panes.register(airPane, false);

// ends




