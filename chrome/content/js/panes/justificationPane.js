 /** Justification Pane
 *
 * This pane will display the justification trace of a when it encounters 
 * air reasoner output
 * oshani@csail.mit.edu
 */
 
justPane = {};
justPane.name = 'air';
justPane.icon = Icon.src.icon_airPane;

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
var justificationsArr = [];

/**
ExtractFileURIs method was changed to extract all the URIs and load from the source fetcher. So, instead of the object that has several properties including the 'rulesFile', 'sender', 'receiver', etc. Now we just spit out all the individual components of the URI */
extractFileURIs = function(fullURI){

    fullURI = unescape(fullURI); //Otherwise we have to account for the escaped characters -- ugly!
    
    var re = /\s*(?:[&?]by=)|(?:[&?]to=)|(?:[&?]data=)|(?:[&?]policy=)|(?:[&?]rulesFile=)\s*/;
    uris=fullURI.split(re);
	return uris; 			
}

justPane.label = function(subject) {
  
    //Extract and lookup all the files, so that the labels appear properly
    var re = /\s*(?:[&?]by=)|(?:[&?]to=)|(?:[&?]data=)|(?:[&?]policy=)|(?:[&?]rulesFile=)\s*/;
    var uris = window.content.location.toString().split(re);
    if (uris.length > 0){
        for (var i=1; i< uris.length; i++){ //Start from 1 because we don't want to lookup the URI for the reasoner, and do not load the policy or the rulesFile.
            if (uris[i].search('.pdf') != -1){
                sf.lookUpThing(kb.sym("http://dig.csail.mit.edu/2009/DHS-fusion/Mass/cgi-files/xmpparser.py?uri="+unescape(uris[i])));
            }
            else{
                sf.lookUpThing(kb.sym(unescape(uris[i])));
            }
        }
    }
    
    //Flush all the justification statements already found
    justificationsArr = [];
    
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
			if (sts[0].predicate.toString() == ap_compliant.toString()){
                var compliantString = label(sts[0].subject) + " is compliant with " + label(sts[0].object);
                var compliantArr = [];
                compliantArr.push(sts[0].object);
                compliantArr.push(ap_compliant.toString());
                compliantArr.push(compliantString);
				justificationsArr.push(compliantArr);
            }
			if (sts[0].predicate.toString() == ap_nonCompliant.toString()){
                var nonCompliantString = label(sts[0].subject) + " is non compliant with " + label(sts[0].object);
                var nonCompliantArr = [];
                nonCompliantArr.push(sts[0].object);
                nonCompliantArr.push(ap_nonCompliant.toString());
                nonCompliantArr.push(nonCompliantString);
				justificationsArr.push(nonCompliantArr);

            }
			stringToDisplay = "Justify" //Even with one relevant statement this method should return something 
		}   
	}
	//Make the subject list we will be exploring in the render function unique
	//compliantStrings = paneUtils.unique(compliantStrings);
	//nonCompliantStrings = paneUtils.unique(nonCompliantStrings); 
    
   return stringToDisplay;
}

// View the justification trace in an exploratory manner
justPane.render = function(subject, myDocument) {

	//Variables specific to the UI
	var statementsAsTables = tabulator.panes.dataContentPane.statementsAsTables;        
	var divClass;
	var div = myDocument.createElement("div");

	//Helpers
	var logFileURI = paneUtils.extractLogURI(myDocument.location.toString());

	div.setAttribute('class', 'dataContentPane'); //justPane has the same formatting as the dataContentPane
	div.setAttribute('id', 'dataContentPane'); //justPane has the same formatting as the dataContentPane


    //If there are multiple justifications show a dropdown box to select the correct one
    var selectEl = myDocument.createElement("select");

    var divOutcome = myDocument.createElement("div"); //This is div to display the final outcome. 
    divOutcome.setAttribute('id', 'outcome'); //There can only be one outcome per selection from the drop down box
  
    //Show the selected justification only
	justPane.render.showSelected = function(){
        
        //Clear the contents of the outcome div
        if (myDocument.getElementById('outcome') != null){
            myDocument.getElementById('outcome').innerHTML = ''; 
        }
        
        //Function to hide the natural language description div and the premises div
        justPane.render.showSelected.hide = function(){
        
            //Clear the outcome div
            if (myDocument.getElementById('outcome') != null){
                myDocument.getElementById('outcome').innerHTML = ''; 
            }
            //Remove the justification div from the pane
            var d = myDocument.getElementById('dataContentPane');
            var j = myDocument.getElementById('justification');
            var b = myDocument.getElementById('hide');
            var m = myDocument.getElementById('more');
            var o = myDocument.getElementById('outcome');
            var w = myDocument.getElementById('whyButton');
            if (d != null && m != null){
                d.removeChild(m);
            }
            if (d != null && j != null && b != null){
                d.removeChild(j);
                d.removeChild(b);
            }
            if (d != null && o != null){
                d.removeChild(o);
            }
            if (d != null && w != null){
                d.removeChild(w);
            }

        }
        //End of justPane.render.showSelected.hide

        //Clear the contents of the justification div
        justPane.render.showSelected.hide();
        
        if (this.selectedIndex == 0)
            return;
            
        selected = justificationsArr[this.selectedIndex - 1];
        var stsJust = kb.statementsMatching(undefined, ap_just, undefined, subject); 
        

        for (var i=0; i<stsJust.length; i++){
        
            //Find the statement maching the option selected from the drop down box
            if (stsJust[i].subject.termType == 'formula' && 
                stsJust[i].object != ap_prem.toString() && 
                stsJust[i].subject.statements[0].object.toString() == selected[0].toString()){
                
                var stsFound = stsJust[i].subject.statements[0]; //We have only one statement - so no need to iterate
                
                //@@@@@@ Variables specific to the logic	
                var ruleNameFound;
                
                //Display red or green depending on the compliant/non-compliant status
                if (selected[1].toString() == ap_nonCompliant.toString()){
                    divOutcome.setAttribute('class', 'nonCompliantPane');
                }
                else if (selected[1].toString() == ap_compliant.toString()){
                    divOutcome.setAttribute('class', 'compliantPane');
                }
                else{
                    alert("something went terribly wrong");
                } 
                
                //Create a table and structure the final conclucsion appropriately
                
                var table = myDocument.createElement("table");
                var tr = myDocument.createElement("tr");
                
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

                table.appendChild(tr);
                divOutcome.appendChild(table);
                
                div.appendChild(divOutcome);
                //End of the outcome sentences
                
                //Add the initial buttons 
                justPane.render.showSelected.addInitialButtons = function(){ //Function Call 1

                    //Create and append the 'Why?' button        
                    //Check if it is visible in the DOM, if not add it.
                    if (myDocument.getElementById('whyButton') == null){
                        var becauseButton = myDocument.createElement('input');
                        becauseButton.setAttribute('type','button');
                        becauseButton.setAttribute('id','whyButton');
                        becauseButton.setAttribute('value','Why?');
                        div.appendChild(becauseButton);
                        becauseButton.addEventListener('click',justPane.render.showSelected.because,false);
                    }
                                        
                    div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
                }
                //End of justPane.render.showSelected.addInitialButtons


                //The following function is triggered, when the why button is clicked
                justPane.render.showSelected.because = function(){ //Function Call 2
                
                
                    //If the reasoner used closed-world-assumption, there are no interesting premises 
                    var cwa = ap_air('closed-world-assumption');
                    var cwaStatements = kb.statementsMatching(undefined, cwa, undefined, subject);
                    var noPremises = false;
                /*    if (cwaStatements.length > 0){
                        noPremises = true;
                    }
                 */   
                    //Disable the 'why' button, otherwise clicking on that will keep adding the divs 
                    var whyButton = myDocument.getElementById('whyButton');
                    var d = myDocument.getElementById('dataContentPane');
                    if (d != null && whyButton != null)
                        d.removeChild(whyButton);
                
                    //Function to display the natural language description
                    justPane.render.showSelected.because.displayDesc = function(obj){
                        for (var i=0; i<obj.elements.length; i++) {
                                dump(obj.elements[i]);
                                dump("\n");
                                
                                if (obj.elements[i].termType == 'symbol') {
                                    var anchor = myDocument.createElement('a');
                                    anchor.setAttribute('href', obj.elements[i].uri);
                                    anchor.appendChild(myDocument.createTextNode(label(obj.elements[i])));
                                    //anchor.appendChild(myDocument.createTextNode(obj.elements[i]));
                                    divDescription.appendChild(anchor);
                                }
                                else if (obj.elements[i].termType == 'literal') {
                                    if (obj.elements[i].value != undefined)
                                        divDescription.appendChild(myDocument.createTextNode(obj.elements[i].value));
                                }
                                else if (obj.elements[i].termType == 'formula') {
                                    //@@ As per Lalana's request to handle formulas within the description
                                    divDescription.appendChild(myDocument.createTextNode(obj.elements[i]));
                                    //@@@ Using statementsAsTables to render the result gives a very ugly result -- urgh!
                                    //divDescription.appendChild(statementsAsTables(obj.elements[i].statements,myDocument));
                                }       
                            }
                    }
                    //End of justPane.render.showSelected.because.displayDesc

                    //Function to display the inner most stuff from the proof-tree
                    justPane.render.showSelected.because.moreInfo = function(ruleToFollow){
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
                            var currentRule = kb.statementsMatching(undefined, undefined, ruleToFollow, subject);
                            
                            //Find the corresponding description matching the currenrRule

                            var currentRuleDescSts = kb.statementsMatching(undefined, undefined, currentRule[0].object);
                            
                            for (var i=0; i<currentRuleDescSts.length; i++){
                                if (currentRuleDescSts[i].predicate == ap_instanceOf.toString()){
                                    var currentRuleDesc = kb.statementsMatching(currentRuleDescSts[i].subject, undefined, undefined, subject);
                                    
                                    for (var j=0; j<currentRuleDesc.length; j++){
                                        if (currentRuleDesc[j].predicate == ap_description.toString() &&
                                        currentRuleDesc[j].object.termType == 'collection'){
                                            divDescription.appendChild(myDocument.createElement('br'));
                                            justPane.render.showSelected.because.displayDesc(currentRuleDesc[j].object);
                                            divDescription.appendChild(myDocument.createElement('br'));
                                            divDescription.appendChild(myDocument.createElement('br'));
                                        }
                                    }	
                                }
                            }

                            //This is a hack to fix the rule appearing instead of the bnode containing the description
                            correctCurrentRule = "";
                            for (var i=0; i< currentRule.length; i++){
                                if (currentRule[i].subject.termType == 'bnode'){
                                    correctCurrentRule = currentRule[i].subject;
                                    break;
                                }
                            }
                            
                            var currentRuleSts = kb.statementsMatching(correctCurrentRule, ap_just, undefined, subject);
                            var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ap_ruleName, undefined, subject);
                            ruleNameFound = nextRuleSts[0].object;

                            var currentRuleAntc = kb.statementsMatching(currentRuleSts[0].object, ap_antcExpr, undefined, subject);
                            
                            var currentRuleSubExpr = kb.statementsMatching(currentRuleAntc[0].object, ap_subExpr, undefined, subject);
    
                            var formulaFound = false;
                            var bnodeFound = false;
                            for (var i=0; i<currentRuleSubExpr.length; i++){
                                if(currentRuleSubExpr[i].object.termType == 'formula'){
                                    divPremises.appendChild(statementsAsTables(currentRuleSubExpr[i].object.statements, myDocument)); 
                                    formulaFound = true;
                                }
                                else if (currentRuleSubExpr[i].object.termType == 'bnode'){
                                    bnodeFound = true;
                            
                                }
                            }
                            
                            if (bnodeFound){
                                divPremises.appendChild(myDocument.createElement("br"));
                                divPremises.appendChild(myDocument.createTextNode("  No premises applicable."));
                                divPremises.appendChild(myDocument.createElement("br"));
                                divPremises.appendChild(myDocument.createElement("br"));
                            }
                            
                        }
                    }
                    //End of justPane.render.showSelected.because.moreInfo
                    
                    //Function to bootstrap the natural language description div and the premises div
                    justPane.render.showSelected.because.justify = function(){ //Function Call 3
                    
                        //Clear the contents of the premises div
                        myDocument.getElementById('premises').innerHTML='';
                        justPane.render.showSelected.because.moreInfo(ruleNameFound);   //@@@@ make sure this rul would be valid at all times!      	

                        divJustification.appendChild(divPremises);
                        div.appendChild(divJustification);

                    }
                    //End of justPane.render.showSelected.because.justify

                    //Add the More Information Button
                    var justifyButton = myDocument.createElement('input');
                    justifyButton.setAttribute('type','button');
                    justifyButton.setAttribute('id','more');
                    justifyButton.setAttribute('value','More Information');
                    justifyButton.addEventListener('click',justPane.render.showSelected.because.justify,false);
                    div.appendChild(justifyButton);
                                    
                    //Add 2 spaces to leave some space between the 2 buttons, any better method?                
                    div.appendChild(myDocument.createTextNode('   '));
                    div.appendChild(myDocument.createTextNode('   '));

                    //Add the hide button
                    var hideButton = myDocument.createElement('input');
                    hideButton.setAttribute('type','button');
                    hideButton.setAttribute('id','hide');
                    hideButton.setAttribute('value','Start Over');
                    div.appendChild(hideButton);
                    hideButton.addEventListener('click',justPane.render.showSelected.hide,false);

                    //This div is the containing div for the natural language description and the premises of any given justification
                    var divJustification = myDocument.createElement("div");
                    divJustification.setAttribute('class', 'justification');
                    divJustification.setAttribute('id', 'justification');

                    //Leave a gap between the outcome and the justification divs
                    divJustification.appendChild(myDocument.createElement('br'));

                    //Div for the natural language description
                    var divDescription = myDocument.createElement("div");
                    divDescription.setAttribute('class', 'description');
                    divDescription.setAttribute('id', 'description');
                    
                    //Div for the premises
                    var divPremises = myDocument.createElement("div");
                    divPremises.setAttribute('class', 'premises');
                    divPremises.setAttribute('id', 'premises');
                    
                    //@@@@ what is this for?
                    var justificationSts;
                    
                    //Get all the triples with a air:description as the predicate
                    var stsDesc = kb.statementsMatching(undefined, ap_description, undefined, subject); 

                    //You are bound to have more than one such triple, 
                    //so iterates through all of them and figure out which belongs to the one that's referred from the drop down box
                    for (var j=0; j<stsDesc.length; j++){
                        if (stsDesc[j].subject.termType == 'formula' && 
                            stsDesc[j].object.termType == 'collection' &&
                            stsDesc[j].subject.statements[0].object.toString() == selected[0].toString()){
                            
                            divDescription.appendChild(myDocument.createElement('br'));
                            justPane.render.showSelected.because.displayDesc(stsDesc[j].object);
                            divDescription.appendChild(myDocument.createElement('br'));
                            divDescription.appendChild(myDocument.createElement('br'));
                        }
                        divJustification.appendChild(divDescription);
                        
                    }	
                    
                    //@@@@@@@@@ Why was this here???
                    //div.appendChild(divJustification);
                    
                    //Leave spaces
                    divJustification.appendChild(myDocument.createElement('br'));
                    divJustification.appendChild(myDocument.createElement('br'));
                    
                    //Yes, we are showing premises next...
                    divJustification.appendChild(myDocument.createElement('b').appendChild(myDocument.createTextNode('Premises:')));
                    
                    //Leave spaces
                    divJustification.appendChild(myDocument.createElement('br'));
                    divJustification.appendChild(myDocument.createElement('br'));

                    //Closed World Assumption
                    if (noPremises){
                        alert("no premises");
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
                                            //divPremises.appendChild(myDocument.createElement('br'));
                                            divPremises.appendChild(statementsAsTables(t2[l].object.statements, myDocument)); 
                                           
                                            //@@@@ The following piece of code corresponds to going one level of the justification proof to figure out
                                            // whether there are any premises
                                            //it is commented out, because, the user need not know that at each level there are no premises associated
                                            //that particular step
                                            
                                            /*if (t2[l].object.statements.length == 0){
                                                alert("here");
                        
                                                divPremises.appendChild(myDocument.createTextNode("Nothing interesting found in "));
                                                var a = myDocument.createElement('a')
                                                a.setAttribute('href', unescape(logFileURI));
                                                a.appendChild(myDocument.createTextNode("log file"));
                                                divPremises.appendChild(a);
                                            }
                                            else{
                                                     divPremises.appendChild(statementsAsTables(t2[l].object.statements, myDocument)); 
                                            }
                                           */
                                            //divPremises.appendChild(myDocument.createElement('br'));
                                            divPremises.appendChild(myDocument.createElement('br'));
                                        }
                                   }     
                                }
                            }
                        }
                    }
                    
                    divJustification.appendChild(divPremises);   
                    div.appendChild(divJustification); 
                      
                }
                //End of justPane.render.showSelected.because
                
                justPane.render.showSelected.addInitialButtons(); //Add the "Why Button"
             }
        }
    }
    

    //First add a bogus element
    var optionElBogus = myDocument.createElement("option");
    var optionTextBogus = myDocument.createTextNode(" ");
    optionElBogus.appendChild(optionTextBogus);
    selectEl.appendChild(optionElBogus);

    //Adds the option of which justification to choose in a drop down list box
    for (var i=0; i<justificationsArr.length; i++){
        var optionEl = myDocument.createElement("option");
        var optionText = myDocument.createTextNode(justificationsArr[i][2]);
        optionEl.appendChild(optionText);
        selectEl.appendChild(optionEl);
    }
    
    div.appendChild(selectEl);
    selectEl.addEventListener('change', justPane.render.showSelected, false);
    div.appendChild(myDocument.createElement('br'));
    div.appendChild(myDocument.createElement('br'));
        
	return div;
};

//^^
justPane.renderReasonsForStatement = function renderReasonsForStatement(st,
					divJustification){
  var divDescription = myDocument.createElement("div");
  divDescription.setAttribute('class', 'description');

        //Display the actual English-like description first
	//It's no longer English-like, but just property tables
        //var stsDesc = kb.statementsMatching(undefined, ap_description, undefined, subject);
        //var stsDesc = kb.statementsMatching(st, ap_description);
	var stsDesc = kb.statementsMatching(st, ap_just);
	// {}  tms:justification []. (multiple)

	if(stsDesc.length > 1){
            for (var j=0; j<stsDesc.length; j++){
                //Display the header "Reason x:"
		var h3 = divJustification.appendChild(document.createElement('h3'));
		h3.textContent = "Reason " + String(j+1); + ":";
		justPane.render.because.displayDesc(stsDesc[j].object,
						   divDescription);
		divJustification.appendChild(divDescription);
                //Make a copy of the orange box
		divDescription = divDescription.cloneNode(false); //shallow:true
            
            }
	} else{
	  justPane.render.because.displayDesc(stsDesc[0].object,
					     divDescription);
	  divJustification.appendChild(divDescription);
	}
};
    
justPane.renderExplanationForStatement = function renderExplanationForStatement(st){
    var subject = undefined; //not restricted to a source, but kb
    var div = myDocument.createElement("div"); //the returned div
    var ruleNameFound;
    var stsCompliant;
    var stsNonCompliant;
    var stsFound;
    var stsJust = kb.statementsMatching(st, ap_just); 
	
    
    var divOutcome = myDocument.createElement("div"); //To give the "yes/no" type answer indicating the concise reason

        /*
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
        */

    var divClass = 'compliantPane'; //a statement is natively good :)
    //stsFound = kb.anyStatementsMatching(st, ap_just);
    stsFound = stsJust[0].subject.statements[0];

    if (stsFound != undefined){
        divOutcome.setAttribute('class', divClass);
        divOutcome.setAttribute('id', 'outcome');

        var table = myDocument.createElement("table");
        var tr = myDocument.createElement("tr");

        var td_intro = myDocument.createElement("td");
        td_intro.appendChild(myDocument.createTextNode('The reason '));
        tr.appendChild(td_intro);

        var td_s = myDocument.createElement("td");
        var a_s = myDocument.createElement('a')
        a_s.setAttribute('href', stsFound.subject.uri)
        a_s.appendChild(myDocument.createTextNode(label(stsFound.subject)));
        td_s.appendChild(a_s);
        tr.appendChild(td_s);

        //var td_is = myDocument.createElement("td");
        //td_is.appendChild(myDocument.createTextNode(' is '));
        //tr.appendChild(td_is);

        var td_p = myDocument.createElement("td");
        var a_p = myDocument.createElement('a');
        a_p.setAttribute('href', stsFound.predicate.uri);
        a_p.appendChild(myDocument.createTextNode(label(stsFound.predicate)));
        td_p.appendChild(a_p);
        tr.appendChild(td_p);

        var td_o = myDocument.createElement("td");
	var a_o = null;
	if (stsFound.object.termType == 'literal'){
	  a_o = myDocument.createTextNode(stsFound.object.value);
	} else {
	  var a_o = myDocument.createElement('a');
	  a_o.setAttribute('href', stsFound.object.uri);
	  a_o.appendChild(myDocument.createTextNode(label(stsFound.object)));
	}
        td_o.appendChild(a_o);
        tr.appendChild(td_o);

        var td_end = myDocument.createElement("td");
        td_end.appendChild(myDocument.createTextNode(' is because: '));
        tr.appendChild(td_end);

        table.appendChild(tr);
        divOutcome.appendChild(table);
        div.appendChild(divOutcome);


        var hideButton = myDocument.createElement('input');
        hideButton.setAttribute('type','button');
        hideButton.setAttribute('id','hide');
        hideButton.setAttribute('value','Start Over');
    }

    justPane.render.addInitialButtons = function(){ //Function Call 1

        //Create and append the 'Why?' button        
        var becauseButton = myDocument.createElement('input');
        becauseButton.setAttribute('type','button');
        becauseButton.setAttribute('id','whyButton');
        becauseButton.setAttribute('value','Why?');
        div.appendChild(becauseButton);
        becauseButton.addEventListener('click',justPane.render.because,false);
                            
        div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
    }
    
    justPane.render.hide = function(){
    
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

        justPane.render.addInitialButtons();
                    
    }

    justPane.render.because = function(){ //Function Call 2
    
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
    
        justPane.render.because.displayDesc = function(obj, divDescription){
	  //@argument obj: most likely a [] that has 
	  //a tms:antecedent-expr and a tms:rule-name
	  var aAnd_justification = kb.the(obj, ap_antcExpr);
	  var subExprs = kb.each(aAnd_justification, ap_subExpr);
	  var premiseFormula = null;
	  if (subExprs[0].termType == 'formula')
	    premiseFormula = subExprs[0];
	  else
	    premiseFormula = subExprs[1];
	  divDescription.waitingFor = []; //resources of more information 
                                          //this reason is waiting for
	  divDescription.informationFound = false; //true if an extra 
	               //information is found and we can stop the throbber
	  function dumpFormula(formula, firstLevel){
	    for (var i=0;i<formula.statements.length;i++){
	      var st = formula.statements[i];
	      var elements_to_display = [st.subject, st.predicate, 
					 st.object];
	      var p = null; //the paragraph element the description is dumped to
	      if (firstLevel){
		p = myDocument.createElement('p');
		//Look up the outermost subject and object for information
		if (st.subject.termType == 'symbol'){
		  var doc_uri = Util.uri.docpart(st.subject.uri);
		  if (divDescription.waitingFor.indexOf(doc_uri) < 0 &&
		      typeof sf.requested[doc_uri]=="undefined")
		    divDescription.waitingFor.push(doc_uri);
		}
		if (st.object.termType == 'symbol'){
		  var doc_uri = Util.uri.docpart(st.object.uri);
		  if (divDescription.waitingFor.indexOf(doc_uri) < 0 &&
		      typeof sf.requested[doc_uri]=="undefined")
		    divDescription.waitingFor.push(doc_uri);
		}
	      }
	      else{
		p = dumpFormula.current_p;
	      }
	      for (var j=0; j<3; j++) {
		var element = elements_to_display[j];
		switch(element.termType) {

		  //@@ As per Lalana's request to handle formulas within the description
		case 'formula':
		  p.appendChild(myDocument.createTextNode("{ "));
		  dumpFormula.current_p = p;
		  dumpFormula(element, false);
		  p.appendChild(myDocument.createTextNode(" }"));
		  break;
		case 'symbol':
          var anchor = myDocument.createElement('a');
		  anchor.setAttribute('href', element.uri);
		  anchor.appendChild(myDocument.createTextNode(label(element)));
		  p.appendChild(anchor);
		  p.appendChild(myDocument.createTextNode(" "));
		  break;
		case 'literal':
		  //if (obj.elements[i].value != undefined)
		  p.appendChild(myDocument.createTextNode(element.value)); 
		  
		}       
	      }
	      p.appendChild(myDocument.createTextNode(". "));
	      if(firstLevel){
		divDescription.appendChild(p);
		var one_statement_formula = new RDFIndexedFormula();
		one_statement_formula.statements.push(st)
		p.AJAR_formula = one_statement_formula;
		function make_callback(st, p, divDescription){
		  return function statement_more_information_callback(uri){
		    divDescription.waitingFor.remove(uri);
		    if(kb.any(p.AJAR_formula, ap_just)) {
		      //The would get called twice even if the callback
		      //is canceled, so check the last child.
		      //dump("in statement_more_information_callback with st: "                         +st + "and uri: " + uri + "\n");
		      divDescription.informationFound = true;
		      if (p.lastChild.nodeName=="#text"){
			var explain_icon = p.appendChild(myDocument.createElement('img'));
			explain_icon.src = "chrome://tabulator/content/icons/tango/22-help-browser.png";
			var click_cb = function(){
			  justPane.renderReasonsForStatement(
			    p.AJAR_formula, divJustification);
			};
			explain_icon.addEventListener('click',
						      click_cb,
						      false)
		      }
		      if (throbber_p && throbber_callback) 
			throbber_callback();
		      return false; //no need to fire this function
		    }
		    //Fetch sameAs here. We try to load minimum sources
		    //so this comes after the above kb.any
		    for (var h=0;h<2;h++) { //Never use for each!!!
		                           //Array.prototype.remove would
                                           //be one of them!!!
		      var thing =[st.subject, st.object][h];
		      var uris = kb.uris(thing);
		      for (var k=0;k<uris.length;k++){
			var doc_uri = Util.uri.docpart(uris[k])
			  if (typeof sf.requested[doc_uri]=="undefined" &&
			     divDescription.waitingFor.indexOf(doc_uri)<0){
			    //the second condition holds, for example,
			    //Util.uri.docpart(thing.uri)
			    divDescription.waitingFor.push(doc_uri);
			    sf.lookUpThing(kb.sym(doc_uri));
			  }
		      }
		    }
		    if (divDescription.waitingFor.length == 0){
		      if (throbber_p && throbber_callback) 
			throbber_callback();
		      return false; //the last resource this div is waiting for
		    }
		    if (throbber_p && throbber_callback) 
		      throbber_callback();
		    return true;
		  };
		}
		var cb = make_callback(st, p, divDescription)
		cb();
		//statement_more_information_callback(); //run once for exsiting information
		sf.addCallback('done',cb);
		sf.addCallback('fail',cb);
	      }
	    } //statement loop
	  } //function dumpFormula
	  dumpFormula(premiseFormula, true);
	  //'Looking for more information...
	  //@correct the background color of the throbber
	  var throbber_p = myDocument.createElement('p');
	  throbber_p.setAttribute('class', 'ap_premise_loading')
	  var throbber = throbber_p.appendChild(myDocument.createElement
						('img'));
	  throbber.src = "chrome://tabulator/content/icons/loading.png";
	  throbber_p.appendChild(myDocument.createTextNode
				 ("Looking for more information..."));
	  divDescription.appendChild(throbber_p);
	  function throbber_callback(uri){
	    divDescription.waitingFor.remove(uri);
	    
	    if (divDescription.informationFound){
	      throbber_p.removeChild(throbber_p.firstChild);
	      throbber_p.textContent = "More information found!";
	      return false;
	    } else if (divDescription.waitingFor.length == 0){
	      
	      //The final call to this function. But the above callbacks 
	      //might not have been fired. So check all. Well...
              //It takes time to close the world
	      //@@This method assumes there's only one thread for this js.
	      //Maybe not?
	      var found = false;
// 	      for (var i=0;i<divDescription.childNodes.length;i++){
// 		var p = divDescription.childNodes[i];
// 		if(p.AJAR_formula && kb.any(p.AJAR_formula, ap_just)){
// 		  found = true;
// 		  break;
// 		}
// 	      }
	      if (found){
		throbber_p.removeChild(throbber_p.firstChild);
		throbber_p.textContent = "More information found!";
	      } else {
		throbber_p.removeChild(throbber_p.firstChild);
		throbber_p.textContent = "No more information.";
	      }
	      return false; //no more resource waiting for
	    } else {
	      return true;
	    }
	  }
	  throbber_callback();
// 	  if(divDescription.waitingFor.length){
// 	    //we don't need to do call back if there's nothing more to lookup
// 	    sf.addCallback('done',throbber_callback);
// 	    sf.addCallback('fail',throbber_callback);
// 	  }
	  for (var i=0;i<divDescription.waitingFor.length;i++)
	    sf.lookUpThing(kb.sym(divDescription.waitingFor[i]));
	  
	} //function justPane.render.because.displayDesc

        justPane.render.because.moreInfo = function(ruleToFollow){
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
                                justPane.render.because.displayDesc(currentRuleDesc[j].object);
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
        
        justPane.render.because.justify = function(){ //Function Call 3
        
            //Clear the contents of the div
            myDocument.getElementById('premises').innerHTML='';
            justPane.render.because.moreInfo(ruleNameFound);                

            divJustification.appendChild(divPremises);
            div.appendChild(divJustification);

        }

        //Add the More Information Button
	/* //disable buttons
        var justifyButton = myDocument.createElement('input');
        justifyButton.setAttribute('type','button');
        justifyButton.setAttribute('id','more');
        justifyButton.setAttribute('value','More Information');
        justifyButton.addEventListener('click',justPane.render.because.justify,false);
        div.appendChild(justifyButton);
                        
        div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
        div.appendChild(myDocument.createTextNode('   '));

        div.appendChild(hideButton);
        hideButton.addEventListener('click',justPane.render.hide,false);
        */

        var divJustification = myDocument.createElement("div");
        divJustification.setAttribute('class', 'justification');
        divJustification.setAttribute('id', 'justification');

        var divDescription = myDocument.createElement("div");
        divDescription.setAttribute('class', 'description');
        //divDescription.setAttribute('id', 'description');

        /*
        var divPremises = myDocument.createElement("div");
        divPremises.setAttribute('class', 'premises');
        divPremises.setAttribute('id', 'premises');
        */ 
        
        
        var justificationSts;
        
        
	justPane.renderReasonsForStatement(st, divJustification);
    
        
        div.appendChild(divJustification);
	
        /*
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
                ruleNameFound =    ruleNameSts[0].object; // This would be the initial rule name from the 
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
        */    
          
    }//end of justPane.render.because


    //justPane.render.addInitialButtons();
    justPane.render.because();
        
    return div;
}
tabulator.panes.register(justPane, false);

// ends



