     /** AIR (Amord in RDF) Pane
     *
     * This pane will display the justification trace of a when it encounters 
     * air reasoner output
     */
     
    airPane = {};
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
    airPane.render = function(subject, myDocument) {

    	var statementsAsTables = myDocument.outline.statementsAsTables;        
  
  		airPane.render.extractLogURI = function(fullURI){
  			var logPos = fullURI.search(/logFile=/);
  			var rulPos = fullURI.search(/&rulesFile=/);
 			return fullURI.substring(logPos+8, rulPos); 			
  		}
  		
  		var logFileURI = airPane.render.extractLogURI(myDocument.location.toString());
  		      
        var stsFound;
         
        var divClass;
        var div = myDocument.createElement("div");
        div.setAttribute('class', 'dataContentPane'); //airPane has the same formatting as the dataContentPane
        div.setAttribute('id', 'dataContentPane'); //airPane has the same formatting as the dataContentPane

        var divOutcome = myDocument.createElement("div"); 
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
            
            var td_intro = myDocument.createElement("td");
            td_intro.appendChild(myDocument.createTextNode('The reason '));
            tr.appendChild(td_intro);

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
            var a_p = myDocument.createElement('a')
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

        airPane.render.addInitialButtons = function(){
 
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

        airPane.render.because = function(){
        
	    	var cwa = air('closed-world-assumption');
			var cwaStatements = kb.statementsMatching(undefined, cwa, undefined);
			var noPremises = false;
			if (cwaStatements.length > 0){
				noPremises = true;
			}
			
			
        	//Disable the 'why' and 'lawyer's view' buttons... If not, it creates a mess if accidentally pressed
           var whyButton = myDocument.getElementById('whyButton');
            var d = myDocument.getElementById('dataContentPane');
    		if (d != null && whyButton != null)
            	d.removeChild(whyButton);

            airPane.render.because.moreInfo = function(ruleToFollow){
				//Terminating condition: 
				// if the rule has for example - "pol:MA_Disability_Rule_1 tms:justification tms:premise"
				// there are no more information to follow
				var terminatingCondition = kb.statementsMatching(ruleToFollow, just, prem, subject);
				if (terminatingCondition[0] != undefined){

				   divPremises.appendChild(myDocument.createElement('br'));
				   divPremises.appendChild(myDocument.createElement('br'));
				   divPremises.appendChild(myDocument.createTextNode("No more information is available from the reasoner!"));
				   divPremises.appendChild(myDocument.createElement('br'));
				   divPremises.appendChild(myDocument.createElement('br'));
			   
				}
				else{
					
					//Update the description div with the description at the next level
	                var currentRule = kb.statementsMatching(ruleToFollow, undefined, undefined);
	                var currentRuleSts = kb.statementsMatching(currentRule[0].subject, just, undefined);
				   	var nextRuleSts = kb.statementsMatching(currentRuleSts[0].object, ruleName, undefined, subject);
				   	ruleNameFound = nextRuleSts[0].object;

	                if (currentRule[0].object.termType == 'collection'){
	                    airPane.render.because.displayDesc(currentRule[0].object);
			            divDescription.appendChild(myDocument.createElement('br')); 
					   	divDescription.appendChild(myDocument.createElement('br'));
	                }
	                else{
	                	airPane.render.because.moreInfo(ruleNameFound);
	                }
				   	
				   	
				   	
				   	//Update the premises div also with the corresponding premises
					   divPremises.appendChild(myDocument.createElement('br')); 
					   divPremises.appendChild(myDocument.createElement('br')); 
					   var t1 = kb.statementsMatching(currentRuleSts[0].object, antcExpr, undefined);
	                    for (var k=0; k<t1.length; k++){
		                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
		                        for (var l=0; l<t2.length; l++){
		                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
		                                justificationSts = t2;
		                                if (t2[l].object.statements.length == 0){
										   	divPremises.appendChild(myDocument.createElement('br'));
										   	divPremises.appendChild(myDocument.createTextNode("Not found in "));
										   	var a = myDocument.createElement('a')
							            	a.setAttribute('href', logFileURI);
							            	a.appendChild(myDocument.createTextNode(logFileURI));
							    			divPremises.appendChild(a);
										   	divPremises.appendChild(myDocument.createElement('br'));
		                                }
		                                else{
			                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
		                                }
		                            }                
		                       }     
		                }
					   divPremises.appendChild(myDocument.createElement('br'));
					   divPremises.appendChild(myDocument.createElement('br'));
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
            
            airPane.render.because.displayDesc = function(obj){
            	for (var i=0; i<obj.elements.length; i++) {
			            switch(obj.elements[i].termType) {
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
            

		   //Display the actual English-like description first
        	var stsDesc = kb.statementsMatching(undefined, description, undefined, subject); 

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
			   	divPremises.appendChild(myDocument.createTextNode("Not found in "));
			   	var a = myDocument.createElement('a')
            	a.setAttribute('href', logFileURI);
            	a.appendChild(myDocument.createTextNode(logFileURI));
    			divPremises.appendChild(a);
			   	divPremises.appendChild(myDocument.createElement('br'));
			   	divPremises.appendChild(myDocument.createElement('br'));
    			
    		}
	            
            for (var j=0; j<stsJust.length; j++){
                if (stsJust[j].subject.termType == 'formula' && stsJust[j].object.termType == 'bnode'){
                
                	var ruleNameSts = kb.statementsMatching(stsJust[j].object, ruleName, undefined);
                	ruleNameFound =	ruleNameSts[0].object; // This would be the initial rule name from the 
                										   // statement containing the formula		
           		   	
           		   	if (!noPremises){
	           		   	var t1 = kb.statementsMatching(stsJust[j].object, antcExpr, undefined);
	                    for (var k=0; k<t1.length; k++){
	                        var t2 = kb.statementsMatching(t1[k].object, undefined, undefined);
	                        for (var l=0; l<t2.length; l++){
	                            if (t2[l].subject.termType == 'bnode' && t2[l].object.termType == 'formula'){
	                                justificationSts = t2;
								   	divPremises.appendChild(myDocument.createElement('br'));
								   	divPremises.appendChild(myDocument.createElement('br'));
	                                if (t2[l].object.statements.length == 0){
									   	divPremises.appendChild(myDocument.createTextNode("Not found in "));
									   	var a = myDocument.createElement('a')
						            	a.setAttribute('href', logFileURI);
						            	a.appendChild(myDocument.createTextNode(logFileURI));
						    			divPremises.appendChild(a);
	                                }
	                                else{
		                                divPremises.appendChild(statementsAsTables(t2[l].object.statements)); 
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