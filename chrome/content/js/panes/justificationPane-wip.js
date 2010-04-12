 /** Justification Pane
 *
 * This pane will display the justification trace of a when it encounters 
 * air reasoner output
 * oshani@csail.mit.edu
 */
 
justPane = {};
justPane.name = 'air';
justPane.icon = Icon.src.icon_airPane;


justPane.label = function(subject) {
    
  //If the document contains any air:justifications show the justification pane
  if (kb.statementsMatching(undefined, ap_just, undefined, subject).length > 0)   
    return "Justification Pane";
  else
    return null;
};

// View the justification trace in an exploratory manner
justPane.render = function(subject, doc) {

    var justPane = doc.createElement("div");
    justPane.setAttribute('id', 'justPane');

    var justDiv = doc.createElement("div");
    justDiv.setAttribute('class', 'justification');


    //Extend the justification UI to include properties other than air:compliant-with and air:non-compliant-with
    var filterProperties = function(){
        
        var re = /\s*(?:[&?]filterProperties=)\s*/;
        var tokens = window.content.location.toString().split(re);
        var props = [];
        if (tokens.length > 0){
            for (var i=1; i<tokens.length; i++ ){ //index is starting from 1, because the 0th element is usually "http://mr-burns.w3.org/...ilter_property_rules.n3"
                var token = unescape(tokens[i].toString());
                if (token == ap_compliant.uri.toString()){
                    continue;
                }
                else if (token == ap_nonCompliant.uri.toString()){
                    continue;
                }
                else{
                    props.push(token);
                }
            }
        }
        return props;
    };

    /**Final Outcome statement*/
    var containerDiv = doc.createElement("div");
    var outcomeDiv = doc.createElement("div");
    outcomeDiv.setAttribute('id', 'outcome'); //There can only be one outcome per selection from the drop down box
    
    var stmtObjMap =  new Array(); //This associative array keeps the statement strings -> objects maps of the drop down list box
    var rule =  null; //When the "Why?" button is pressed, this will be updated with the next rule
    
    var showOutcome = function(){
        
        var stmt = this.value;
        rule = stmtObjMap[stmt].object;
        outcomeDiv =  doc.getElementById('outcome');
        
        if (outcomeDiv == null) return; //something has cleared the outcome div, and it should not have happened!
        
        //Set the right color for the div
        if (stmtObjMap[stmt].predicate.toString() == ap_compliant.toString()){
            outcomeDiv.setAttribute('class', 'compliantPane');
        }
        else if (stmtObjMap[stmt].predicate.toString() == ap_nonCompliant.toString()){
            outcomeDiv.setAttribute('class', 'nonCompliantPane');
        }
        else{
            outcomeDiv.setAttribute('class', 'filterPane');
        }
        //clear the contents of the div if there are some previous text in it
        outcomeDiv.innerHTML = '';
        //set the outcome to the one displayed in the drop down box and change it to default
        outcomeDiv.appendChild(doc.createTextNode(label(stmtObjMap[stmt].subject)+ " is " + label(stmtObjMap[stmt].predicate) + " " + label(stmtObjMap[stmt].object)));
        doc.getElementById('selectEl').selectedIndex = 0;
        
        //Add the why button
        var whyButton = doc.createElement('input');
        whyButton.setAttribute('type','button');
        whyButton.setAttribute('id','whyButton');
        whyButton.setAttribute('value','Why?');
        whyButton.addEventListener('click', function(){why(stmtObjMap[stmt].object)},false);
        outcomeDiv.appendChild(doc.createElement("br"));
        outcomeDiv.appendChild(doc.createElement("br"));
        outcomeDiv.appendChild(whyButton);

    };
    /**End of Final Outcome statement*/

    /**Why are you calling me? :) Recursive function to display the descriptions and the premises*/
    var why = function(rule){
        var descDiv = doc.createElement("div");
        descDiv.setAttribute('class', 'description');
        //find all the statements with the predicate tms:description
        var desc = kb.statementsMatching(undefined, ap_description, undefined, subject);
        for (var i=0; i<desc.length; i++){
            //Find the formula that corresponds to this rule
            if (desc[i].subject.termType == 'formula'){
                if(desc[i].subject.statements[0].object.toString() == rule){
                    alert(rule);
                
                    displayDesc(desc[i].object,descDiv);
                    justDiv.appendChild(doc.createElement("br"));
                    //Add the rule
                    justDiv.appendChild(doc.createTextNode("Because, according to "));
                    var rule_a = doc.createElement("a");
                    rule_a.setAttribute("href",rule.uri);
                    rule_a.appendChild(doc.createTextNode(label(rule)));
                    justDiv.appendChild(rule_a);
                    justDiv.appendChild(doc.createTextNode(':'));
                    justDiv.appendChild(doc.createElement("br"));
                    //and add the description
                    justDiv.appendChild(descDiv);
                    //find the next rule to follow
                    var tms_sub_exprs = kb.statementsMatching(kb.statementsMatching(kb.statementsMatching(desc[i].subject, ap_just, undefined, subject)[0].object, ap_antcExpr,undefined, subject)[0].object, ap_subExpr,undefined, subject);
                    for (var j=0; j<tms_sub_exprs.length; j++){
                        if (tms_sub_exprs[j].object.termType == 'bnode'){
                            //change the why button's value to "More information"
                            whyButton = doc.getElementById("whyButton");
                            whyButton.setAttribute('value','More Information');
                            whyButton.addEventListener('click', function(){why(kb.statementsMatching(tms_sub_exprs[j].object,ap_instanceOf,undefined,subject)[0].object)},false);
                        }
                        //else it's a premise?
                    }
                    break;
                }
            }
            else if (desc[i].subject.termType == 'bnode'){
                if(desc[i].subject.statements[0].object.toString() == rule){
                    displayDesc(desc[i].object,descDiv);
                    justDiv.appendChild(doc.createElement("br"));
                    //Add the rule
                    justDiv.appendChild(doc.createTextNode("and, according to "));
                    var rule_a = doc.createElement("a");
                    rule_a.setAttribute("href",rule.uri);
                    rule_a.appendChild(doc.createTextNode(label(rule)));
                    justDiv.appendChild(rule_a);
                    justDiv.appendChild(doc.createTextNode(':'));
                    justDiv.appendChild(doc.createElement("br"));
                    //and add the description
                    justDiv.appendChild(descDiv);
                    //find the next rule to follow
                    var tms_sub_exprs = kb.statementsMatching(kb.statementsMatching(kb.statementsMatching(desc[i].subject, ap_just, undefined, subject)[0].object, ap_antcExpr,undefined, subject)[0].object, ap_subExpr,undefined, subject);
                    for (var j=0; j<tms_sub_exprs.length; j++){
                        if (tms_sub_exprs[j].object.termType == 'bnode'){
                            rule = kb.statementsMatching(tms_sub_exprs[j].object,ap_instanceOf,undefined,subject)[0].object;
                            //change the why button's value to "More information"
                            whyButton = doc.getElementById("whyButton");
                            whyButton.setAttribute('value','More Information');
                            whyButton.addEventListener('click', function(){why(rule)},false);
                        }
                        //else it's a premise?
                    }
                    break;
                }
            }
            else{
                break;
            }
        }
    };
    /**End of why*/
 
    /*Function that displays the NL description*/
    var displayDesc = function(obj,descDiv){
        for (var i=0; i<obj.elements.length; i++) {
            if (obj.elements[i].termType == 'symbol') {
                var anchor = doc.createElement('a');
                anchor.setAttribute('href', obj.elements[i].uri);
                anchor.appendChild(doc.createTextNode(label(obj.elements[i])));
                descDiv.appendChild(anchor);
            }
            else if (obj.elements[i].termType == 'literal') {
                if (obj.elements[i].value != undefined)
                    descDiv.appendChild(doc.createTextNode(obj.elements[i].value));
            }
            else if (obj.elements[i].termType == 'formula') {
                //@@ As per Lalana's request to handle formulas within the description
                descDiv.appendChild(doc.createTextNode(obj.elements[i]));
            }       
        }
    }
    /**End of displayDesc*/
   
    /**Drop Down Boxes*/
    var selectDiv = doc.createElement("div");
    //drop down box to show if there are multiple outcomes
    var selectEl = doc.createElement("select");
    selectEl.setAttribute("id","selectEl");
    //First add a bogus element
    var optionElBogus = doc.createElement("option");
    optionElBogus.setAttribute("value" , "default");
    var optionTextBogus = doc.createTextNode(" ");
    optionElBogus.appendChild(optionTextBogus);
    selectEl.appendChild(optionElBogus);

    //Find the air:compliant-with and air:non-compliant-with and other filter property statements that are in the document
    justificationsArr = [];
    var compliantSts = kb.statementsMatching(undefined, ap_compliant, undefined, subject);
    var nonCompliantSts = kb.statementsMatching(undefined, ap_nonCompliant, undefined, subject);
    if (compliantSts.length > 0) justificationsArr.push(compliantSts);
    if (nonCompliantSts.length > 0) justificationsArr.push(nonCompliantSts);
    var filterProps = filterProperties();
    for (var i=0; i<filterProps.length; i++){
        var filterSts = kb.statementsMatching(undefined, kb.sym(filterProps[i]), undefined, subject);
        if (filterSts.length > 0) justificationsArr.push(filterSts);
    }
    for (var i=0; i<justificationsArr.length; i++){
        for (var j=0; j< justificationsArr[i].length; j++){
            var optionEl = doc.createElement("option");
            stmtObjMap[justificationsArr[i][j].toString()] = justificationsArr[i][j];
            optionEl.setAttribute("value" , justificationsArr[i][j]);
            var optionText = doc.createTextNode(label(justificationsArr[i][j].subject) + " is " + label(justificationsArr[i][j].predicate) + " " + label(justificationsArr[i][j].object));
            optionEl.appendChild(optionText);
            selectEl.appendChild(optionEl);
        }
    }

    selectEl.addEventListener('change', showOutcome, false);

    selectDiv.appendChild(doc.createElement("br"));
    
    selectDiv.appendChild(selectEl);
    selectDiv.appendChild(doc.createElement("br"));
    selectDiv.appendChild(doc.createElement("br"));
    /**End of Drop Down Boxes*/
    
    
    justPane.appendChild(selectDiv);
    justPane.appendChild(outcomeDiv);
    justPane.appendChild(justDiv);
    return justPane;
};


//register with tabulator
tabulator.panes.register(justPane, true);

// ends




