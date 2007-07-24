//places to generate SPARQL update: clearInputAndSave() pasteFromClipboard()
//                                  undetermined statement generated formUndetStat()
//                                                                 ->fillInRequest()

/*ontological issues
    temporarily using the tabont namespace
    clipboard: 'predicates' 'objects' 'all'(internal)
    request: 'from' 'to' 'message' 'Request'
*/
var UserInputFormula; //Formula to store references of user's work
function UserInput(outline){

var myDocument=outline.document; //is this ok?
this.menuId='predicateMenu1';
this.namespaces={};//I hope we can integrate all the namespaces used in Tabulator
this.namespaces["tabont"] = "http://dig.csail.mit.edu/2005/ajar/ajaw#";
this.namespaces["foaf"] = "http://xmlns.com/foaf/0.1/";
this.namespaces["rdf"] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
this.namespaces["RDFS"] = "http://www.w3.org/2000/01/rdf-schema#";
this.namespaces["OWL"] = "http://www.w3.org/2002/07/owl#";
this.namespaces["dc"] = "http://purl.org/dc/elements/1.1/";
this.namespaces["rss"] = "http://purl.org/rss/1.0/";
this.namespaces["xsd"] = "http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-";
this.namespaces["contact"] = "http://www.w3.org/2000/10/swap/pim/contact#";
this.namespaces["mo"] = "http://purl.org/ontology/mo/";
this.namespaces["doap"] = "http://usefulinc.com/ns/doap#";
var NameSpaces=this.namespaces;
if (!UserInputFormula){
    UserInputFormula=new RDFFormula();
    UserInputFormula.superFormula=kb;
    UserInputFormula.registerFormula("Your Work"); 
}

return {
lastModified: null, //the last <input> being modified, .isNew indicates whether it's a new input
lastModifiedStat: null, //the last statement being modified
statIsInverse: false, //whether the statement is an inverse

switchMode: function(){ //should be part of global UI
    switch (this._tabulatorMode){
        case 0://discovery -> edit
            this._tabulatorMode=1;
	        var outliner=document.getElementById('browser');
	        //outliner.style.cursor="url('icons/pencil_small.png')"; //not working as of now
	        document.getElementsByName('mode')[1].checked=true;
	        break;
	    case 1://edit -> discovery
	        this._tabulatorMode=0;
	        this.clearInputAndSave();	        
            document.getElementsByName('mode')[0].checked=true;
            break;
        default:
            throw "userinput.js: Unknown mode: " + this._tabulatorMode;
    }
},
    
Click: function Click(e,selectedTd,isEnter){
    //var This=outline.UserInput;
    if (e.type=='keypress'){ //e==undefined : Keyboard Input
        var target=selectedTd;
        var object=getAbout(kb,target);
        if (object && (object.termType=='symbol' || object.termType=='bnode') && isEnter){
            outline.GotoSubject(object,true);
            return false;
        }
    }            
    else if (selectedTd) //case: add triple, auto-complete
        var target=selectedTd;
    else    
        var target=getTarget(e);
    if (target.tagName == 'INPUT' || target.tagName=='TEXTAREA') return; //same box clicked
    var about = this.getStatementAbout(target); // timbl - to avoid alert from random clicks
    if (!about) return;
    try{
        var obj = about.object;
        var trNode=ancestor(target,'TR');
    }catch(e){
        alert('userinput.js: '+e+getAbout(kb,selectedTd));
        tabulator.log.error(target+" getStatement Error:"+e);
    }
    this.clearInputAndSave();
    
    try{var tdNode=trNode.lastChild;}catch(e){tabulator.log.error(e+"@"+target);}
    //seems to be a event handling problem of firefox3
    if (e.type!='keypress'&&selectedTd.className=='undetermined selected'||selectedTd.className=='undetermined'){ 
        this.Refill(e,selectedTd);
        return;
    }
    //ignore clicking trNode.firstChild (be careful for <div> or <span>)    
    if (e.type!='keypress'&&target!=tdNode && ancestor(target,'TD')!=tdNode) return;     
    
    if (obj.termType== 'literal'){
        tdNode.removeChild(tdNode.firstChild); //remove the text
        
        if (obj.value.match('\n')){//match a line feed and require <TEXTAREA>
             var textBox=myDocument.createElement('textarea');
             textBox.appendChild(myDocument.createTextNode(obj.value));
             textBox.setAttribute('rows',(obj.value.match(/\n/g).length+1).toString());
                                                            //g is for global(??)
             textBox.setAttribute('cols','100'); //should be the size of <TD>
             textBox.setAttribute('class','textinput');
             tdNode.appendChild(textBox);
             this.lastModified=textBox;
        }else{
             this.lastModified = this.createInputBoxIn(tdNode,obj.value);
        }
        this.lastModified.isNew=false;
        //Kenny: What should be expected after you click a editable text element?
        //Choice 1
        this.lastModified.select();
        //Choice 2 - direct the key cursor to where you click (failed attempt) 
        //--------------------------------------------------------------------------     
            //duplicate the event so user can edit without clicking twice
            //var e2=myDocument.createEvent("MouseEvents");
            //e2.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
            //inputBox.dispatchEvent(e2);
        //---------------------------------------------------------------------------
    }else if (selectedTd.className=='undetermined selected'){
        emptyNode(selectedTd);
        this.lastModified=this.createInputBoxIn(selectedTd,"");
        this.lastModified.select();
        this.lastModified.addEventListener('keypress',this.AutoComplete,false);
    }else if (obj.termType== 'symbol'){
        /*
        emptyNode(tdNode);
        tdNode.appendChild(myDocument.createTextNode("<"));
        var inputBox=myDocument.createElement('input');
        inputBox.setAttribute('value',obj.uri);
        inputBox.setAttribute('class','textinput');
        inputBox.setAttribute('size',obj.uri.length.toString());
        tdNode.appendChild(inputBox);
        tdNode.appendChild(myDocument.createTextNode(">"));
        
        inputBox.select();
        this.lastModified = inputBox;
        //Kenny: What if the user just want to edit the title?
        */
    }
    if (e.type=='keypress'&&selectedTd.className=='undetermined selected') {
        var completeType=(selectedTd.nextSibling)?'predicate':'all';
        this.AutoComplete(undefined,selectedTd,completeType);
    }
    if(e) e.stopPropagation();
    return true; //this is not a valid modification
},

clearMenu: function clearMenu(){
    var menu=myDocument.getElementById(this.menuID);
    if (menu) {
        menu.parentNode.removeChild(menu);
        emptyNode(menu);
    }
},

clearInputAndSave: function clearInputAndSave(e){
    if(!this.lastModified) return;
    if(!this.lastModified.isNew){
        try{
             var obj=this.getStatementAbout(this.lastModified).object;
        }catch(e){return;}
    }
    var s=this.lastModifiedStat;
    if(this.lastModified.value != this.lastModified.defaultValue){
        // generate path and nailing from current values
        sparqlUpdate = new sparql(kb).prepareUpdate(s);
        if (this.lastModified.isNew){
            s=kb.add(s.subject,s.predicate,kb.literal(this.lastModified.value));
        }
        else{ 
            switch (obj.termType){
                case 'literal':
                    obj.value=this.lastModified.value;
                    sparqlUpdate.setObject(makeTerm(this.lastModified.value));

        //fire text modified??
                    UserInputFormula.statements.push(s);
                    break;
                case 'bnode': //a request refill with text
                    var newStat;
                    var textTerm=kb.literal(this.lastModified.value,"");
                    if (s.predicate.termType=='collection'){ //case: add triple
                        var selectedPredicate=s.predicate.elements[0];
                        if (kb.any(undefined,selectedPredicate,textTerm))
                            this.showMenu(e,'DidYouMeanDialog',undefined,{'dialogTerm':kb.any(undefined,selectedPredicate,textTerm),'bnodeTerm':s.subject});
                        else{
                            kb.remove(s);
                            newStat=kb.add(s.subject,selectedPredicate,textTerm);
                        }
                        //table_refresh ??? auto?                           
                    }else{
                    kb.remove(s);
                    s=kb.add(s.subject,s.predicate,kb.literal(this.lastModified.value));
                    newStat=s;
                    }
                    UserInputFormula.statements.push(newStat);
                    break;
                case 'symbol'://no longer allow user to edit URI
                    /* 
                    kb.remove(s);
                    if(!this.statIsInverse)
                        s=kb.add(s.subject,s.predicate,kb.sym(this.lastModified.value),s.why); //fire!
                                                                           //'why' to be changed
                    else
                        s=kb.add(kb.sym(this.lastModified.value),s.predicate,s.object,s.why); //fire!!
                    // send sparql update with new values
                    sparqlUpdate.setObject(kb.sym(this.lastModified.value));*/ //
            }
        }
    }else if(this.lastModified.isNew){//generate 'Request', there is no way you can input ' (Please Input) '
        var trNode=ancestor(this.lastModified,'TR');
        var reqTerm=this.generateRequest("(To be determined. Re-type of drag an object onto this field)");
        var preStat=trNode.previousSibling.AJAR_statement; //the statement of the same predicate
        this.formUndetStat(trNode,preStat.subject,preStat.predicate,reqTerm,preStat.why,false);
        //this why being the same as the previous statement
        this.lastModified=null;
        return;        
    }
    //case modified:
    var trNode=ancestor(this.lastModified,'TR');
    
    trNode.removeChild(trNode.lastChild);
    
    var defaultpropview = this.views.defaults[s.predicate.uri];
    if (!this.statIsInverse)
        trNode.appendChild(outline.outline_objectTD(s.object, defaultpropview));
    else
        trNode.appendChild(outline.outline_objectTD(s.subject, defaultpropview));
    trNode.AJAR_statement=s;//you don't have to set AJAR_inverse because it's not changed
    //This is going to be painful when predicate-edit allowed

    this.lastModified = null;  
},

addTriple: function addTriple(e){
    var predicateTd=getTarget(e).parentNode.parentNode;
    var predicateTerm=getAbout(kb,predicateTd);
    var isInverse=predicateTd.parentNode.AJAR_inverse;
    //var titleTerm=getAbout(kb,ancestor(predicateTd.parentNode,'TD'));
    //set pseudo lastModifiedStat here
    this.lastModifiedStat=predicateTd.parentNode.AJAR_statement;

    var insertTr=this.appendToPredicate(predicateTd);

    /*
        switch (kb.whether(term,rdf('type'),OWL(?x))){
            when ?x='ObjectProperty:
            ...
        }
    */
    if (kb.whether(predicateTerm,rdf('type'),OWL('ObjectProperty'))){
        var tempTerm=kb.bnode();
        var tempType=(!isInverse)?kb.any(predicateTerm,RDFS('range')):kb.any(predicateTerm,RDFS('domain'));
        if (tempType) kb.add(tempTerm,rdf('type'),tempType);
        var tempRequest=this.generateRequest("(Type URI into this if you have one)",undefined,false,true);
        kb.add(tempTerm,kb.sym('http://www.w3.org/2006/link#uri'),tempRequest);
        /* SELECT ?labelProperty
           WHERE{
               ?labelProperty rdfs:subPropertyOf rdfs:label.
               ?labelProperty rdfs:domain tempType.
           }
        */ //this is ideal...but

        var labelChoices=kb.collection();
        var labelProperties = kb.each(undefined,RDFS('subPropertyOf'),RDFS('label'));
        for (var i=0;i<labelProperties.length;i++) {
            labelChoices.append(labelProperties[i]);
            kb.add(labelChoices,tabont('element'),labelProperties[i]);
        }
        labelChoices.append(RDFS('label'));
        kb.add(labelChoices,tabont('element'),RDFS('label'));
        kb.add(tempTerm,labelChoices,this.generateRequest(" (Error) ",undefined,false,true));

        insertTr.appendChild(outline.outline_objectTD(tempTerm));              
        var preStat=insertTr.previousSibling.AJAR_statement;
        if (!isInverse)
            this.formUndetStat(insertTr,preStat.subject,predicateTerm,tempTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,tempTerm,predicateTerm,preStat.object,preStat.why,true);
        return [insertTr.lastChild,tempTerm]; //expand signal
    } else if (kb.whether(predicateTerm,rdf('type'),OWL('DatatypeProperty'))){
        var td=insertTr.appendChild(myDocument.createElement('td'));
        this.lastModified = this.createInputBoxIn(td," (Please Input) ");
        this.lastModified.isNew=true;

        this.lastModified.select();
        this.statIsInverse=false;     
    } else { //inference work...
        var tiptext="(To be determined. Re-type of drag an object onto this field)";
        var reqTerm=this.generateRequest(tiptext,insertTr,false);
        var preStat=insertTr.previousSibling.AJAR_statement;
        if (!isInverse)
            this.formUndetStat(insertTr,preStat.subject,preStat.predicate,reqTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,reqTerm,preStat.predicate,preStat.object,preStat.why,true);
    }


    if(predicateTd.parentNode.AJAR_inverse) {//generate 'Request';
        var preStat=insertTr.previousSibling.AJAR_statement;
        var reqTerm=this.generateRequest("(This is an inverse statement. Drag a subject onto this field)");
        //I guess it's not making sense...createInputBox and then remove it..
        this.formUndetStat(insertTr,reqTerm,predicateTerm,preStat.subject,preStat.why,true);
        this.lastModified = null;
    }
    //this.statIsInverse=false;
},

/*clipboard principle: copy wildly, paste carefully
  ToDoS:
  1. register Subcollection?
  2. copy from more than one selectedTd: 1.sequece 2.collection
  3. make a clipboard class?
*/
clipboardInit: function clipboardInit(address){
    kb.add(kb.sym(address),tabont('objects'),kb.collection())
    kb.add(kb.sym(address),tabont('predicates'),kb.collection())
    kb.add(kb.sym(address),tabont('all'),kb.collection())
    //alert('clipboardInit');
    //alert(kb instanceof RDFIndexedFormula); this returns false for some reason...
},

copyToClipboard: function copyToClipboard(address,selectedTd){
    /*
    var clip  = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
    if (!clip) return false;
    var clipid = Components.interfaces.nsIClipboard;

    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    if (!trans) return false;
    
    var copytext = "Tabulator!!";

    var str   = Components.classes["@mozilla.org/supports-string;1"].
                       createInstance(Components.interfaces.nsISupportsString);
    if (!str) return false;

    str.data  = copytext;
    
    trans.addDataFlavor("text/x-moz-url");
    trans.setTransferData("text/x-mox-url", str, copytext.length * 2);
    
    clip.setData(trans, null, clipid.kGlobalClipboard);
    */
    
    var term=getTerm(selectedTd);
    switch (selectedTd.className){
        case 'selected': //table header
        case 'obj selected':
            var objects=kb.the(kb.sym(address),tabont('objects'));
            if (!objects) objects=kb.add(kb.sym(address),kb.sym(address+"#objects"),kb.collection()).object
            objects.unshift(term);
            break;
        case 'pred selected':
        case 'pred internal selected':
            var predicates=kb.the(kb.sym(address),tabont('predicates'));
            if (!predicates) predicates=kb.add(kb.sym(address),kb.sym(address+"#predicates"),kb.collection()).object;
            predicates.unshift(term);
    }

    var all=kb.the(kb.sym(address),tabont('all'));
    if (!all) all=kb.add(kb.sym(address),tabont('all'),kb.collection()).object
    all.unshift(term);
},

insertTermTo: function insertTermTo(selectedTd,term,isObject){
    switch (selectedTd.className){
        case 'undetermined selected':
            var defaultpropview = this.views.defaults[selectedTd.parentNode.AJAR_statement.predicate.uri];
            this.fillInRequest(selectedTd.nextSibling ? 'predicate':'object',selectedTd,term);
            break;
        case 'pred selected': //paste objects into this predicate          
            var insertTr=this.appendToPredicate(selectedTd);
            var preStat=selectedTd.parentNode.AJAR_statement;
            var defaultpropview = this.views.defaults[preStat.predicate.uri];
            insertTr.appendChild(outline.outline_objectTD(term, defaultpropview));
            //modify store and update here
            var isInverse=selectedTd.parentNode.AJAR_inverse;
            if (!isInverse)
                insertTr.AJAR_statement=kb.add(preStat.subject,preStat.predicate,term,preStat.why);
            else
                insertTr.AJAR_statemnet=kb.add(term,preStat.predicate,preStat.object,preStat.why);
            insertTr.AJAR_inverse=isInverse;
            UserInputFormula.statements.push(insertTr.AJAR_statement);
            break;            
        case 'selected': //header <TD>, undetermined generated
            var newTr=ancestor(selectedTd,'TABLE').lastChild.appendChild(myDocument.createElement('tr'));
            //var titleTerm=getAbout(kb,ancestor(newTr,'TD'));
            if (HCIoptions["bottom insert highlights"].enabled)
                var preStat=newTr.previousSibling.previousSibling.AJAR_statement;
            else
                var preStat=newTr.previousSibling.AJAR_statement;
            var isObject;
            if (typeof isObect=='undefined') isObject=true;
            if (isObject){//object inserted
                this.formUndetStat(newTr,preStat.subject,this.generateRequest('(TBD)',newTr,true),term,preStat.why,false);
                //defaultpropview temporaily not dealt with
                newTr.appendChild(outline.outline_objectTD(term));
            
            }else{//predicate inserted
                //existing predicate not expected
                var reqTerm=this.generateRequest("(To be determined. Re-type of drag an object onto this field)",newTr);
                this.formUndetStat(newTr,preStat.subject,term,reqTerm,preStat.why,false);

                newTr.insertBefore(outline.outline_predicateTD(term,newTr,false,false),newTr.firstChild);
            }
            break;
    } 
},

pasteFromClipboard: function pasteFromClipboard(address,selectedTd){  
    function termFrom(fromCode){
        function theCollection(from){return kb.the(kb.sym(address),tabont(from));}
        var term=theCollection(fromCode).shift();
        if (term==null){
             alert("no more element in clipboard!");
             return;
        }
        switch (fromCode){
            case 'predicates':
            case 'objects':
                var allArray=theCollection('all').elements;
                for(var i=0;true;i++){
                    if (term.sameTerm(allArray[i])){
                        allArray.splice(i,1);
                        break;
                    }
                }
                break;
            case 'all':
                var isObject=term.sameTerm(theCollection('objects').elements[0]);
                isObject ? theCollection('objects').shift():theCollection('predicates').shift(); //drop the corresponding term
                return [term,isObject];
                break;
        }
        return term;
    }
    var term;
    switch (selectedTd.className){
        case 'undetermined selected':
            term=selectedTd.nextSibling?termFrom('predicates'):termFrom('objects');
            if (!term) return;
            break;
        case 'pred selected': //paste objects into this predicate
            term=termFrom('objects');
            if (!term) return;            
            break;            
        case 'selected': //header <TD>, undetermined generated
            var returnArray=termFrom('all');
            if (!returnArray) return;
            term=returnArray[0];
            this.insertTermTo(selectedTd,term,returnArray[1]);
            return;
    }
    this.insertTermTo(selectedTd,term);                        
},

Refill: function Refill(e,selectedTd){
    tabulator.log.info("Refill"+selectedTd.textContent);
    var isPredicate=selectedTd.nextSibling;    
    if (isPredicate){ //predicateTd
        if (selectedTd.nextSibling.className=='undetermined') {
        /* SELECT ?pred
           WHERE{
               ?pred a rdf:Property.
               ?pred rdfs:domain subjectClass.
           }
        */  
        /** SELECT ?pred ?class
            WHERE{
               ?pred a rdf:Property.
               subjectClass owl:subClassOf ?class.
               ?pred rdfs:domain ?class.
           }
        */
        var subject=getAbout(kb,ancestor(selectedTd,'TABLE').parentNode);
        var subjectClass=kb.any(subject,rdf('type'));
        var sparqlText=[];
        sparqlText[0]="SELECT ?pred WHERE{\n?pred "+rdf('type')+rdf('Property')+".\n"+
                      "?pred "+RDFS('domain')+subjectClass+".}"; // \n is required? SPARQL parser bug?
        sparqlText[1]="SELECT ?pred ?class\nWHERE{\n"+
                      "?pred "+rdf('type')+rdf('Property')+".\n"+
                      subjectClass+RDFS('subClassOf')+" ?class.\n"+
                      "?pred "+RDFS('domain')+" ?class.\n}";              
        var predicateQuery=sparqlText.map(SPARQLToQuery);  
                                  
        }else{
        //------selector
        /* SELECT ?pred
           WHERE{
               ?pred a rdf:Property.
               ?pred rdfs:domain subjectClass.
               ?pred rdfs:range objectClass.
           }
        */           
        var subject=getAbout(kb,ancestor(selectedTd,'TABLE').parentNode);
        var subjectClass=kb.any(subject,rdf('type'));
        var object=selectedTd.parentNode.AJAR_statement.object;
        var objectClass=(object.termType=='literal')?RDFS('Literal'):kb.any(object,rdf('type'));
        var sparqlText="SELECT ?pred WHERE{\n?pred "+rdf('type')+rdf('Property')+".\n"+
                       "?pred "+RDFS('domain')+subjectClass+".\n"+
                       "?pred "+RDFS('range')+objectClass+".\n}"; // \n is required? SPARQL parser bug?
        var predicateQuery=SPARQLToQuery(sparqlText);
        }
        

        //-------presenter
        //ToDo: how to sort selected predicates?
        this.showMenu(e,'GeneralPredicateChoice',predicateQuery,{'isPredicate': isPredicate,'selectedTd': selectedTd});
        
	}else{ //objectTd
	    var predicateTerm=selectedTd.parentNode.AJAR_statement.predicate;
	    if (kb.whether(predicateTerm,rdf('type'),OWL('DatatypeProperty'))||predicateTerm.termType=='collection'){
	        selectedTd.className='';
	        emptyNode(selectedTd);
	        this.lastModified = this.createInputBoxIn(selectedTd," (Please Input) ");
	        this.lastModified.isNew=false;
	        
	        this.lastModified.select();
	    }
	     
	    //show menu for rdf:type
	    if (selectedTd.parentNode.AJAR_statement.predicate.sameTerm(rdf('type'))){
	       var sparqlText="SELECT ?class WHERE{?class "+rdf('type')+RDFS('Class')+".}"; 
	       //I should just use kb.each
	       var classQuery=SPARQLToQuery(sparqlText);
	       this.showMenu(e,'TypeChoice',classQuery,{'isPredicate': isPredicate});
	    }
	    
	
	}
},

AutoComplete: function AutoComplete(enterEvent,tdNode,mode){
    var InputBox=(typeof enterEvent=='object')?this:this.lastModified;//'this' is the <input> element
    var e={};
    if (!tdNode) tdNode=InputBox.parentNode //argument tdNode seems to be not neccessary
    if (!mode) mode=tdNode.nextSibling?'predicate':'all';
    e.pageX=findPos(tdNode)[0];
    e.pageY=findPos(tdNode)[1]+3*tdNode.clientHeight; //ToDo: remove this stupid kludge...
   
    if (enterEvent){ //either the real event of the pseudo number passed by OutlineKeypressPanel
        var newText=InputBox.value;
        var menu=myDocument.getElementById(outline.UserInput.menuID);
        if (typeof enterEvent=='object'){
            enterEvent.stopPropagation();  
            switch (enterEvent.keyCode){
                case 13://enter
                    var inputTerm=getAbout(kb,menu.lastHighlight)
                    var fillInType=(mode=='predicate')?'predicate':'object';
                    outline.UserInput.fillInRequest(fillInType,InputBox.parentNode,inputTerm);
                    outline.UserInput.clearMenu();
                    return;
                case 38://up
                    menu.lastHighlight.className='';
                    menu.lastHighlight=menu.lastHighlight.previousSibling;
                    menu.lastHighlight.className='activeItem';
                    return;
                case 40://down
                    menu.lastHighlight.className='';
                    menu.lastHighlight=menu.lastHighlight.nextSibling;
                    menu.lastHighlight.className='activeItem';
                    return;
                case 8://backspace
                    newText=newText.slice(0,-1);
                    break;
                default:
                    newText+=String.fromCharCode(enterEvent.charCode)
            }
        }
        //alert(InputBox.choices.length);
        //for(i=0;InputBox.choices[i].label<newText;i++); //O(n) ToDo: O(log n)
        if (mode=='all') {
            outline.UserInput.clearMenu();
            //outline.UserInput.showMenu(e,'GeneralAutoComplete',undefined,{'isPredicate':false,'selectedTd':tdNode,'choices':InputBox.choices, 'index':i});
            outline.UserInput.showMenu(e,'GeneralAutoComplete',undefined,{'inputText':newText});
        }
        var menu=myDocument.getElementById(outline.UserInput.menuID); 
        //menu.scrollTop=i*menu.firstChild.firstChild.offsetHeight+5;//5 is the padding
        //adjustment for firefox3 required
        if (!menu) return; //no matches
        if (menu.lastHighlight) menu.lastHighlight.className='';
        menu.lastHighlight=menu.firstChild.firstChild;
        menu.lastHighlight.className='activeItem';   
        return;
    }//end of autoScroll, start of menu generation
    
    InputBox.choices=[] //{NT,label}
    switch(mode){
        case 'predicate':
            for (var predNT in kb.predicateIndex){ //there is supposed to be not smushing on predicates??
                var pred=kb.fromNT(predNT);
                if (pred.termType=='symbol') //temporarily deal with symbol only
                    InputBox.choices.push({'NT':predNT,'label':predicateLabelForXML(kb.fromNT(predNT),false)})   
            }
            break;
        case 'all':
            for each (var indexedStore in [kb.subjectIndex,kb.predicateIndex,kb.objectIndex]){
            for (var theNT in indexedStore){
                var term=kb.fromNT(theNT);
                if (term) InputBox.choices.push({'NT':theNT,'label':label(term)});
            }            
            }                        
    }

    function sortLabel(a,b){
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        if (a.label == b.label) {
            if (a.NT < b.NT) return -1;
            if (a.NT > b.NT) return 1;
            if (a.NT == b.NT) return 0;
        }
    }
    InputBox.choices.sort(sortLabel);

    //alert(InputBox.choices.length); //about 1345 for all
    if (mode=='predicate')
        this.showMenu(e,'PredicateAutoComplete',undefined,{'isPredicate':true,'selectedTd':tdNode,'predicates':InputBox.choices});
    else{
        //this.showMenu(e,'GeneralAutoComplete',undefined,{'isPredicate':false,'selectedTd':tdNode,'choices':InputBox.choices});
        /*
        var choices=InputBox.choices;
        InputBox.choices=[];
        var lastChoiceNT='';
        for (var i=0;i<choices.length;i++){
            var thisNT=choices[i].NT;
            if (thisNT==lastChoiceNT) continue;
            lastChoiceNT=thisNT;
            InputBox.choices.push({'NT':choices[i].NT,'label':choices[i].label})
        }
        */
    }
},
//ToDo: shrink rows when \n+backspace
Keypress: function(e){
    if(e.keyCode==13){
        if(outline.targetOf(e).tagName!='TEXTAREA') 
            this.clearInputAndSave();
        else {//<TEXTAREA>
            var preRows=parseInt(this.lastModified.getAttribute('rows'))
            this.lastModified.setAttribute('rows',(preRows+1).toString());
            e.stopPropagation();
        }
    }
    //Remark by Kenny: If the user wants to input more lines into an one-line-only blank.
    //                 Direct him/her to a new blank (how?)
},

Mousedown: function(e){
    HCIoptions["right click to switch mode"][1].setupHere([e],"UserInput.Mousedown");
    /*
    if (e.button==2){ //right click
        UserInput.switchMode();
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
    }
    */
},
borderClick: function borderClick(e){
    if (getTarget(e).className != 'bottom-border-active') return;
    var This=outline.UserInput;
    var target=getTarget(e);//Remark: have to use getTarget instead of 'this'
    var insertTr=myDocument.createElement('tr');
    ancestor(target,'TABLE').lastChild.insertBefore(insertTr,ancestor(target,'TR').nextSibling);
    var tempTr=myDocument.createElement('tr');
    var reqTerm1=This.generateRequest("(TBD)",tempTr,true);
    insertTr.appendChild(tempTr.firstChild);
    var reqTerm2=This.generateRequest("(To be determined. Re-type of drag an object onto this field)",tempTr,false);
    insertTr.appendChild(tempTr.firstChild);
    //there should be an elegant way of doing this
    
    var preStat=ancestor(target,'TR').previousSibling.AJAR_statement;
    var isInverse=ancestor(target,'TR').previousSibling.AJAR_inverse;
    if (!isInverse)
        This.formUndetStat(insertTr,preStat.subject,reqTerm1,reqTerm2,preStat.why,false);
    else
        This.formUndetStat(insertTr,preStat.object,reqTerm1,reqTerm2,preStat.why,false);
    
		var holdingTr=myDocument.createElement('tr');
		var holdingTd=myDocument.createElement('td');
		holdingTd.setAttribute('colspan','2');
	    var bottomDiv=myDocument.createElement('div');
	    bottomDiv.className='bottom-border';
	    holdingTd.setAttribute('notSelectable','true');
	    bottomDiv.addEventListener('mouseover',This.Mouseover,false);
	    bottomDiv.addEventListener('mouseout',This.Mouseout,false);
	    bottomDiv.addEventListener('click',This.borderClick,false);
	    insertTr.parentNode.insertBefore(holdingTr,insertTr.nextSibling).appendChild(holdingTd).appendChild(bottomDiv);
},

Mouseover: function Mouseover(e){
    if (HCIoptions["bottom insert highlights"].enabled) if (e.layerX-findPos(this)[0]>30) return;
    this.className='bottom-border-active';
/*
if (getTarget(e).tagName=='SPAN'){
    var proxyDiv = document.createElement('DIV');
    proxyDiv.id="proxyDiv";
    proxyDiv.setAttribute('style',"position:absolute; visibility:hidden; top:630px; left:525px;height:50px;width:50px;background-color:#7E5B60;");
    getTarget(e).appendChild(proxyDiv);
    dragdropSpan=new YAHOO.util.DragDrop(getTarget(e),"outliner",{dragElId: "proxyDiv", centerFrame: true, resizeFrame: false});
    //dragdropSpan.setXConstraint(0,0);
    //dragdropSpan.setYConstraint(0,0);
}
*/
if (this._tabulatorMode==1){
    /**ABANDONED
    switch (getTarget(e).tagName){
        case 'TD':
            var Td=ancestor(getTarget(e),'TD');
            if(Td.className!="obj" || ancestor(Td,'TABLE').id=="outline") return;
            //I'll think about the latter case
            if(UserInput.aroundBorderBottom(e,Td))  //"this" not working, why? 
                Td.style.borderBottom='.1em solid rgb(100%,65%,0%)';
            break;
        default:
    }**/
    switch (getTarget(e).tagName){
        case 'TD':
            var preTd=getTarget(e);
            if(preTd.className=="pred") preTd.style.cursor='copy';
            break;
        //Uh...I think I might have to give up this
        case 'DIV':
            var border=getTarget(e);
            if (getTarget(e).className=="bottom-border"){
                border.style.borderColor='rgb(100%,65%,0%)';
                border.style.cursor='copy';
            }
            break;
       default:
   }
}
},

Mouseout: function(e){
    this.className='bottom-border';
if (this._tabulatorMode==1){
    var border=getTarget(e);
    if (getTarget(e).className=="bottom-border"){ 
        border.style.borderColor='transparent';
        border.style.cursor='auto';
    }
}
},

/**
 * Utilities
 */
getStatementAbout: function getStatementAbout(something){
    //var trNode=something.parentNode;
    var trNode=ancestor(something,'TR');
    try{
        var statement=trNode.AJAR_statement;
    }catch(e){
        //alert(something.textContent+" has ancestor "+trNode);
        //throw "TR not a statement TR";
        return;
    }
    //Set last modified here, I am not sure this will be ok.
    this.lastModifiedStat=trNode.AJAR_statement;
    this.statIsInverse=trNode.AJAR_inverse;
        
    return statement;
},

createInputBoxIn: function createInputBoxIn(tdNode,defaultText){
    var inputBox=myDocument.createElement('input');
    inputBox.setAttribute('value',defaultText);
    inputBox.setAttribute('class','textinput');
    if (tdNode.className!='undetermined selected') {
        inputBox.setAttribute('size','100');//should be the size of <TD>
        function UpAndDown(e){
            if (e.keyCode==38||e.keyCode==40){
                outline.OutlinerKeypressPanel(e);  
                outline.UserInput.clearInputAndSave();              
            }
        }
        inputBox.addEventListener('keypress',UpAndDown,false)
    }
    tdNode.appendChild(inputBox);
    return inputBox;
},

appendToPredicate: function appendToPredicate(predicateTd){   
    var isEnd=false;
    var trIterator;
    try{
        for(trIterator=predicateTd.parentNode.nextSibling;
        trIterator.childNodes.length==1; //number of nodes as condition
        trIterator=trIterator.nextSibling){}
    }catch(e){isEnd=true;}
    if(!isEnd && HCIoptions["bottom insert highlights"].enabled) trIterator=trIterator.previousSibling;
   
    var insertTr=myDocument.createElement('tr');
    //style stuff, I'll have to investigate appendPropertyTRs() somehow
    insertTr.style.colspan='1';
    insertTr.style.display='block';
    
    if (!DisplayOptions["display:block on"].enabled){
        insertTr.style.display='';
        if (predicateTd.hasAttribute('rowspan'))
            predicateTd.setAttribute('rowspan',parseInt(predicateTd.getAttribute('rowspan'))+1);
    }
    if (!predicateTd.hasAttribute('rowspan')) predicateTd.setAttribute('rowspan','2');
    
    if (!isEnd)
        trIterator.parentNode.insertBefore(insertTr,trIterator);
    else if (!HCIoptions["bottom insert highlights"].enabled)
        predicateTd.parentNode.parentNode.appendChild(insertTr);
    else; //anyway, this is buggy
        //predicateTd.parentNode.parentNode.insertBefore(
        
    return insertTr;
},

generateRequest: function generateRequest(tipText,trNew,isPredicate,notShow){
    var trNode;
    if(!notShow){
        if (trNew)
            trNode=trNew;
        else
            trNode=ancestor(this.lastModified,'TR');
        emptyNode(trNode);
    }
    
    //create the undetermined term
    //Choice 1:
    //var reqTerm=kb.literal("TBD");  
    //this is troblesome since RDFIndexedFormula does not allow me to add <x> <y> "TBD". twice
    //Choice 2:
    labelPriority[tabont('message').uri] = 20;
    
    var reqTerm=kb.bnode();
    kb.add(reqTerm,rdf('type'),tabont("Request"));
    if (tipText.length<10)
        kb.add(reqTerm,tabont('message'),kb.literal(tipText));
    else
        kb.add(reqTerm,tabont('message'),kb.literal(tipText));
    kb.add(reqTerm,tabont('to'),kb.literal("The User"));
    kb.add(reqTerm,tabont('from'),kb.literal("The User"));
    
    //append the undetermined td
    if (!notShow){
        if(isPredicate)
            trNode.appendChild(outline.outline_predicateTD(reqTerm,trNode,false,false));
        else
            trNode.appendChild(outline.outline_objectTD(reqTerm));
    }
    
    return reqTerm;
},

showMenu: function showMenu(e,menuType,inputQuery,extraInformation,order){
   //ToDo:order, make a class?
    var menu=myDocument.createElement('div');
    menu.id=this.menuID;
    menu.className='outlineMenu';
    //menu.addEventListener('click',false);
    menu.style.top=e.pageY+"px";
    menu.style.left=e.pageX+"px";
    myDocument.body.appendChild(menu);
    var table=menu.appendChild(myDocument.createElement('table'));
       
    menu.lastHighlight=null;;
    function highlightTr(e){
        if (menu.lastHighlight) menu.lastHighlight.className='';
        menu.lastHighlight=ancestor(getTarget(e),'TR');
        if (!menu.lastHighlight) return; //mouseover <TABLE>
        menu.lastHighlight.className='activeItem';
    }

    table.addEventListener('mouseover',highlightTr,false);
	    
    //setting for action after selecting item
    switch (menuType){
        case 'DidYouMeanDialog':            
            var selectItem=function selectItem(e){
                var target=ancestor(getTarget(e),'TR')
                if (target.childNodes.length==2 && target.nextSibling){ //Yes
                    kb.add(bnodeTerm,IDpredicate,IDterm); //used to connect the two
                    outline.UserInput.clearMenu();
                }
                else if (target.childNodes.length==2) //No
                    outline.UserInput.clearMenu();                
            }   
            break;
        case 'LimitedPredicateChoice':
            var clickedTd=extraInformation.clickedTd;         
            var selectItem=function selectItem(e){
                var selectedPredicate=getAbout(kb,getTarget(e));
                var predicateChoices=clickedTd.parentNode.AJAR_statement.predicate.elements;
                for (var i=0;i<predicateChoices.length;i++){
                    if (predicateChoices[i].sameTerm(selectedPredicate)){
                        predicateChoices.unshift(predicateChoices.splice(i,1)[0]);
                    }
                }
                outline.UserInput.clearMenu();

                //refresh the choice
                var tr=clickedTd.parentNode;
                var newTd=outline.outline_predicateTD(tr.AJAR_statement.predicate,tr);
                tr.insertBefore(newTd,clickedTd);
                tr.removeChild(clickedTd);
            }
            break;
        case 'PredicateAutoComplete':
        case 'GeneralAutoComplete':
        case 'GeneralPredicateChoice':
        case 'TypeChoice':
            var isPredicate=extraInformation.isPredicate;
            var selectedTd=extraInformation.selectedTd;
            var selectItem=function selectItem(e){
                var inputTerm=getAbout(kb,getTarget(e))
                if (isPredicate){
                    outline.UserInput.fillInRequest('predicate',selectedTd,inputTerm);
                }else{
                    //thisInput.fillInRequest('object',selectedTd,inputTerm); //why is this not working?
                    outline.UserInput.fillInRequest('object',selectedTd,inputTerm);
                }
                outline.UserInput.clearMenu();
            }
    }       
    table.addEventListener('click',selectItem,false);
    if (menuType=='DidYouMeanDialog') return;
    
    //Add Items to the list
	var bindingsCount=0;
	function addPredicateChoice(selectedQuery){
	    return function (bindings){
	    bindingsCount++; 
	    //if(bindingsCount==10) menu.style.width='11em';
        var predicate=bindings[selectedQuery.vars[0]]
	    var Label = predicateLabelForXML(predicate, false);
		//Label = Label.slice(0,1).toUpperCase() + Label.slice(1);

        var theNamespace="";	    
	    for (var name in NameSpaces){
	        if (!predicate.uri) break;//bnode
            if (string_startswith(predicate.uri,NameSpaces[name])){
	            theNamespace=name;
	            break;
	        }
	    }

        var tr=table.appendChild(myDocument.createElement('tr'));
        tr.setAttribute('about',predicate);
        var th=tr.appendChild(myDocument.createElement('th'))
        th.appendChild(myDocument.createElement('div')).appendChild(myDocument.createTextNode(Label));
        tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode(theNamespace.toUpperCase()));
        }
    }
    switch (menuType){
        case 'DidYouMeanDialog':
            var dialogTerm=extraInformation.dialogTerm;
            var bnodeTerm=extraInformation.bnodeTerm;
            //have to do style instruction passing
            menu.style.width='auto';
            
            var h1=table.appendChild(myDocument.createElement('tr'));
            var h1th=h1.appendChild(myDocument.createElement('th'))
            h1th.appendChild(myDocument.createTextNode("Did you mean..."));
            var plist=kb.statementsMatching(dialogTerm);
            var i;
            for (i=0;i<plist.length;i++) if (kb.whether(plist[i].predicate,rdf('type'),OWL('InverseFunctionalProperty'))) break;
            var IDpredicate=plist[i].predicate;
            var IDterm=kb.any(dialogTerm,plist[i].predicate);
            var text=label(dialogTerm)+" who has "+label(IDpredicate)+" "+IDterm+"?";
            var h2=table.appendChild(myDocument.createElement('tr'));
            var h2th=h2.appendChild(myDocument.createElement('th'))
            h2th.appendChild(myDocument.createTextNode(text));
            h1th.setAttribute('colspan','2');h2th.setAttribute('colspan','2');
            var ans1=table.appendChild(myDocument.createElement('tr'));
            ans1.appendChild(myDocument.createElement('th')).appendChild(myDocument.createTextNode('Yes'));
            ans1.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode('BOOLEAN'));
            var ans2=table.appendChild(myDocument.createElement('tr'));
            ans2.appendChild(myDocument.createElement('th')).appendChild(myDocument.createTextNode('No'));
            ans2.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode('BOOLEAN'));
            break;
        case 'PredicateAutoComplete':
            var predicates=extraInformation.predicates;
            for (var i=0;i<predicates.length;i++){
                var tempQuery={};
                tempQuery.vars=[];
                tempQuery.vars.push('Kenny');
                var tempBinding={};
                tempBinding.Kenny=kb.fromNT(predicates[i].NT);
                try{addPredicateChoice(tempQuery)(tempBinding);}catch(e){alert(e);}//I'll deal with bnodes later...
            }
            break;
        case 'GeneralAutoComplete':
            var inputText=extraInformation.inputText;
            var results=lb.search(inputText);
            var entries=results[0]; //[label, subject,priority]
            var types=results[1];
            if (entries.length==0){
                this.clearMenu();
                return;
            }
            for (var i=0;i<entries.length&&i<30;i++){ //do not show more than 30 items
                var thisNT=entries[i][1].toNT();
                var tr=table.appendChild(myDocument.createElement('tr'));
                tr.setAttribute('about',thisNT);
                var th=tr.appendChild(myDocument.createElement('th'))
                th.appendChild(myDocument.createElement('div')).appendChild(myDocument.createTextNode(entries[i][0]));
                var theTerm=entries[i][1];
                //var type=theTerm?kb.any(kb.fromNT(thisNT),rdf('type')):undefined;
                var type=types[i];
                var typeLabel=type?lb.label(type):"";
                tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode(typeLabel));                
            }
            /*var choices=extraInformation.choices;
            var index=extraInformation.index;
            for (var i=index-10;i<index+20;i++){ //show 30 items
                if (i<0) i=0;
                if (i==choices.length) break;
                var thisNT=choices[i].NT;
                var tr=table.appendChild(myDocument.createElement('tr'));
                tr.setAttribute('about',thisNT);
                var th=tr.appendChild(myDocument.createElement('th'))
                th.appendChild(myDocument.createElement('div')).appendChild(myDocument.createTextNode(choices[i].label));
                var theTerm=kb.fromNT(thisNT);
                var type=theTerm?kb.any(kb.fromNT(thisNT),rdf('type')):undefined;
                var typeLabel=type?label(type):"";
                tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode(typeLabel));                
            }
            //alert(extraInformation.choices.length);
            */
            break;
        default:
            switch (inputQuery.constructor.name){
            case 'Array':
                var nullFetcher=function(){};
                for(var i=0;i<inputQuery.length;i++) kb.query(inputQuery[i],addPredicateChoice(inputQuery[i]),nullFetcher);
                break;
            case 'undefined':
                alert("query is not defined");
                break;
            default:
                kb.query(inputQuery,addPredicateChoice(inputQuery),myFetcher);
            }                
    }
},//funciton showMenu

fillInRequest: function fillInRequest(type,selectedTd,inputTerm){
    var tr=selectedTd.parentNode
    var stat=tr.AJAR_statement;
    var reqTerm = (type=='object')?stat.object:stat.predicate;
    var newStat;
    var eventhandler;
    if (kb.any(reqTerm,tabont('onfillin'))){
        eventhandler = new Function("subject",kb.any(reqTerm,tabont('onfillin')).value);
    }
    if (type=='predicate'){
        tr.replaceChild(outline.outline_predicateTD(inputTerm,tr,false,false),selectedTd);
        //modify store and update here
        newStat=kb.add(stat.subject,inputTerm,stat.object) //ToDo: why and inverse
        kb.remove(stat);
    }else if (type=='object'){
        var newTd=outline.outline_objectTD(inputTerm);
        tr.replaceChild(newTd,selectedTd);
        
        //modify store and update here
        newStat=kb.add(stat.subject,stat.predicate,inputTerm);
        kb.remove(stat);
        
        this.setSelected(newTd,true);        
    }
    UserInputFormula.statements.push(newStat);
    if (eventhandler) eventhandler(stat.subject);
},

formUndetStat: function formUndetStat(trNode,subject,predicate,object,why,inverse){
    trNode.AJAR_statement=kb.add(subject,predicate,object,why);
    trNode.AJAR_inverse=inverse;
},
/** ABANDONED APPROACH
//determine whether the event happens at around the bottom border of the element
aroundBorderBottom: function(event,element){
    //alert(event.pageY);
    //alert(findPos(element)[1]);
    var elementPageY=findPos(element)[1]+38; //I'll figure out what this 38 is...
    
    function findPos(obj) { //C&P from http://www.quirksmode.org/js/findpos.html
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
    }
    
    //alert(elementPageY+element.offsetHeight-event.pageY);
    //I'm totally confused by these numbers...
    if(event.pageY-4==elementPageY+element.offsetHeight||event.pageY-5==elementPageY+element.offsetHeight) 
        return true;
    else
        return false;
},
**/
//#include emptyNode(Node) from util.js
//#include getTerm(node) from util.js

//Not so important (will become obsolete?)
switchModeByRadio: function(){
    var radio=myDocument.getElementsByName('mode');
    if (this._tabulatorMode==0 && radio[1].checked==true) this.switchMode();
    if (this._tabulatorMode==1 && radio[0].checked==true) this.switchMode();
},
_tabulatorMode: 0
//Default mode: Discovery
};

}


