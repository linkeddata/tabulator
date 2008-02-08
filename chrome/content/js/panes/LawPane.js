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

LawPane.render = function(subject, myDocument) {
	
    var div = myDocument.createElement("div")
    div.setAttribute('class', 'RDFXMLPane');
    div.appendChild(myDocument.createTextNode('IRFAC Reasoning - To be implemented!'));
    return div

}
