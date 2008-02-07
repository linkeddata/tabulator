    var HTML_NS = 'http://www.w3.org/1999/xhtml';
    var airPane = {};
    airPane.icon = Icon.src.icon_airPane;
     
    var air = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
    var tms = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
    var compliant = air('compliant-with');
    var nonCompliant = air('non-compliant-with');
    var antcExpr = tms('antecedent-expr');
    var just = tms('justification');
    var subExpr = tms('sub-expr');
    var description = tms('description');
    var ruleName = tms('rule-name');
    var prem = tms('premise');
    var stsCompliant;
    var stsNonCompliant;
    var airRet = null;
    var stsJust;
    var ruleNameFound;
             
    airPane.label = function(subject) {
    
        stsJust = kb.statementsMatching(undefined, just, undefined, subject); 

            for (var j=0; j<stsJust.length; j++){
                if (stsJust[j].subject.termType == 'formula'){
                var sts = stsJust[j].subject.statements;
                for (var k=0; k<sts.length; k++){
                    if (sts[k].predicate.toString() == compliant.toString()){
                        airRet = "AIR";
                        stsCompliant = sts[k];
                    
                    } 
                    if (sts[k].predicate.toString() == nonCompliant.toString()){
                        airRet = "AIR";
                        stsNonCompliant = sts[k];
                        
                     }
                   }
                }    
            }
        
       return airRet;
    }

    // View the justification trace in an exploratory manner
    airPane.render = function(subject,myDocument) {
        var statementsAsTable = myDocument.outline.statementsAsTable;        
        var stsFound;
         
        var divClass;
        var div = myDocument.createElementNS(HTML_NS,"div");
        div.setAttribute('class', 'dataContentPane'); //airPane has the same formatting as the dataContentPane
        div.setAttribute('id', 'dataContentPane'); //airPane has the same formatting as the dataContentPane

        var divOutcome = myDocument.createElementNS(HTML_NS,"div"); 
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
        
            var table = myDocument.createElementNS(HTML_NS,"table");
            var tr = myDocument.createElementNS(HTML_NS,"tr");
            
            var td_intro = myDocument.createElementNS(HTML_NS,"td");
            td_intro.appendChild(myDocument.createTextNode('The reason '));
            tr.appendChild(td_intro);

            var td_s = myDocument.createElementNS(HTML_NS,"td");
            var a_s = myDocument.createElementNS(HTML_NS,'a')
            a_s.setAttribute('href', stsFound.subject.uri)
            a_s.appendChild(myDocument.createTextNode(label(stsFound.subject)));
            td_s.appendChild(a_s);
            tr.appendChild(td_s);

            var td_is = myDocument.createElementNS(HTML_NS,"td");
            td_is.appendChild(myDocument.createTextNode(' is '));
            tr.appendChild(td_is);

            var td_p = myDocument.createElementNS(HTML_NS,"td");
            var a_p = myDocument.createElementNS(HTML_NS,'a')
            a_p.setAttribute('href', stsFound.predicate.uri)
            a_p.appendChild(myDocument.createTextNode(label(stsFound.predicate)));
            td_p.appendChild(a_p);
            tr.appendChild(td_p);

            var td_o = myDocument.createElementNS(HTML_NS,"td");
            var a_o = myDocument.createElementNS(HTML_NS,'a')
            a_o.setAttribute('href', stsFound.object.uri)
            a_o.appendChild(myDocument.createTextNode(label(stsFound.object)));
            td_o.appendChild(a_o);
            tr.appendChild(td_o);

           	var td_end = myDocument.createElementNS(HTML_NS,"td");
            td_end.appendChild(myDocument.createTextNode(' is because: '));
            tr.appendChild(td_end);

            table.appendChild(tr);
            divOutcome.appendChild(table);
            div.appendChild(divOutcome);
            
            var hideButton = myDocument.createElementNS(HTML_NS,'input');
            hideButton.setAttribute('type','button');
            hideButton.setAttribute('id','hide');
            hideButton.setAttribute('value','Start Over');
        }

        airPane.render.addInitialButtons = function(){
 
	 		//Create and append the 'Why?' button        
	        var becauseButton = myDocument.createElementNS(HTML_NS,'input');
	        becauseButton.setAttribute('type','button');
	        becauseButton.setAttribute('id','whyButton');
	        becauseButton.setAttribute('value','Why?');
	        div.appendChild(becauseButton);
	        becauseButton.addEventListener('click',airPane.render.because,false);
				        		
	        div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
	        
	        //Create and append the 'Lawyer's View' button
	        var lawyerButton = myDocument.createElementNS(HTML_NS,'input');
	        lawyerButton.setAttribute('type','button');
	        lawyerButton.setAttribute('id','lawyerButton');
	        lawyerButton.setAttribute('value','Lawyer\'s View');
	        div.appendChild(lawyerButton);
	        lawyerButton.addEventListener('click',airPane.render.lawyer,false);
        	
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

        airPane.render.lawyer = function(){
        	alert('Inside lawyer');
        }

        airPane.render.because = function(){
        	//Disable the 'why' and 'lawyer's view' buttons... If not, it creates a mess if accidentally pressed
           var whyButton = myDocument.getElementById('whyButton');
           var lawyerButton = myDocument.getElementById('lawyerButton');
            var d = myDocument.getElementById('dataContentPane');
    		if (d != null && whyButton != null)
            	d.removeChild(whyButton);
    		if (d != null && lawyerButton != null)
            	d.removeChild(lawyerButton);

            airPane.render.because.moreInfo = function(ruleToFollow){
                var statementsAsTable = myDocument.outline.statementsAsTable;  
				//Terminating condition: 
				// if the rule has for example - "pol:MA_Disability_Rule_1 tms:justification tms:premise"
				// there are no more information to follow
				var terminatingCondition = kb.statementsMatching(ruleToFollow, just, prem, subject);
				if (terminatingCondition[0] != undefined){

				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
					divPremises.appendChild(myDocument.createTextNode("No more information is available from the reasoner!"));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			   
				}
				else{
					
					//Update the description div with the description at the next level
	                var currentRule = kb.statementsMatching(ruleToFollow, undefined, undefined, subject);
	                airPane.render.because.displayDesc(currentRule[0].object);
	            	divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   	divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   	
	                var currentRuleSts = kb.statementsMatching(currentRule[0].subject, just, undefined, subject);
				   	var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ruleName, undefined, subject);
				   	ruleNameFound = nextRuleSts[0].object;

				   	
				   	//Update the premises div also with the corresponding premises
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br')); 
				   var t1 = kb.statementsMatching(currentRuleSts[0].object, antcExpr, undefined);
                    for (var k=0; k<t1.length; k++){
	                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
	                        for (var l=0; l<t2.length; l++){
	                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
	                                justificationSts = t2;
	                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
	                            }                
	                       }     
	                }
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
				   divPremises.appendChild(myDocument.createElementNS(HTML_NS,'br'));
						
				}
            				   	
            }
            
            airPane.render.because.justify = function(){
            
            	//Clear the contents of the div
            	myDocument.getElementById('premises').innerHTML='';
				airPane.render.because.moreInfo(ruleNameFound);            	

                divJustification.appendChild(divPremises);
            	div.appendChild(divJustification);
    
            }

			//Add the More Information Button
			var justifyButton = myDocument.createElementNS(HTML_NS,'input');
   			justifyButton.setAttribute('type','button');
            justifyButton.setAttribute('id','more');
            justifyButton.setAttribute('value','More Information');
            justifyButton.addEventListener('click',airPane.render.because.justify,false);
            div.appendChild(justifyButton);
			        		
            div.appendChild(myDocument.createTextNode('   '));//To leave some space between the 2 buttons, any better method?
            div.appendChild(myDocument.createTextNode('   '));

            div.appendChild(hideButton);
            hideButton.addEventListener('click',airPane.render.hide,false);

            var divJustification = myDocument.createElementNS(HTML_NS,"div");
            divJustification.setAttribute('class', 'justification');
            divJustification.setAttribute('id', 'justification');

            var divDescription = myDocument.createElementNS(HTML_NS,"div");
            divDescription.setAttribute('class', 'description');
            divDescription.setAttribute('id', 'description');
            
            var divPremises = myDocument.createElementNS(HTML_NS,"div");
            divPremises.setAttribute('class', 'premises');
            divPremises.setAttribute('id', 'premises');
            
			
            var justificationSts;
            
            airPane.render.because.displayDesc = function(obj){
            
            	for (var i=0; i<obj.elements.length; i++) {
			            switch(obj.elements[i].termType) {
			                case 'symbol':
			                    var anchor = myDocument.createElementNS(HTML_NS,'a')
			                    anchor.setAttribute('href', obj.elements[i].uri)
			                    anchor.appendChild(myDocument.createTextNode(label(obj.elements[i])));
			                    divDescription.appendChild(anchor);
			                    
			                case 'literal':
			                	if (obj.elements[i].value != undefined)
			                    	divDescription.appendChild(myDocument.createTextNode(obj.elements[i].value)); 
			            }       
					}
            }
            
            var statementsAsTable = myDocument.outline.statementsAsTable;  
		   //Display the actual English-like description first
        	var stsDesc = kb.statementsMatching(undefined, description, undefined, subject); 

	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));

            for (var j=0; j<stsDesc.length; j++){
                if (stsDesc[j].subject.termType == 'formula' && stsDesc[j].object.termType == 'collection'){
					divJustification.appendChild(myDocument.createElementNS(HTML_NS,'b').appendChild(myDocument.createTextNode('Because:')));
				    divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
					airPane.render.because.displayDesc(stsDesc[j].object);
				    divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			        divDescription.appendChild(myDocument.createElementNS(HTML_NS,'br'));
                }
                divJustification.appendChild(divDescription);
                
            }	
			
            div.appendChild(divJustification);

		    divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
			divJustification.appendChild(myDocument.createElementNS(HTML_NS,'b').appendChild(myDocument.createTextNode('Premises:')));
		    divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
	        divJustification.appendChild(myDocument.createElementNS(HTML_NS,'br'));
            
            for (var j=0; j<stsJust.length; j++){
                if (stsJust[j].subject.termType == 'formula' && stsJust[j].object.termType == 'bnode'){
                
                	var ruleNameSts = kb.statementsMatching(stsJust[j].object, ruleName, undefined);
                	ruleNameFound =	ruleNameSts[0].object; // This would be the initial rule name from the 
                										   // statement containing the formula		
           		   	
                    var t1 = kb.statementsMatching(stsJust[j].object, antcExpr, undefined);
                    for (var k=0; k<t1.length; k++){
                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
                        for (var l=0; l<t2.length; l++){
                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
                                justificationSts = t2;
                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
                            }
                            else{
                            	var cwa = air('closed-world-assumption');
                        		var t3 = kb.statementsMatching(undefined, cwa, undefined);
                            }                
                       }     
                    }
                }
            }
            divJustification.appendChild(divPremises);    
        }

		//Create a table and append the 2 buttons into that
		var table = myDocument.createElementNS(HTML_NS,'table');
		var tr_b = myDocument.createElementNS(HTML_NS,'tr');
		var td_w = myDocument.createElementNS(HTML_NS,'td');
		var td_l = myDocument.createElementNS(HTML_NS,'td');

		airPane.render.addInitialButtons();

        return div;
    }