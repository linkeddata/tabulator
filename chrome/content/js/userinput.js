//places to generate SPARQL update: clearInputAndSave() pasteFromClipboard()->insertTermTo();
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
    this.namespaces={};
    for (var name in tabulator.ns) {
        this.namespaces[name] = tabulator.ns[name]();
    }
    var NameSpaces=this.namespaces;
    var sparqlService=new sparql(kb);
    if (!UserInputFormula){
        UserInputFormula=new RDFFormula();
        UserInputFormula.superFormula=kb;
        UserInputFormula.registerFormula("Your Work"); 
    }

    return {
    sparqler: sparqlService,
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
        var This=outline.UserInput;
        if (selectedTd){
            var isNew = false;
            if(selectedTd.className.indexOf("undetermined")!=-1) {
                isNew=true;
            }
            //prevent editing predicates, headers, and table containers.
            if(selectedTd.firstChild.nodeName=="TABLE" || selectedTd.colSpan==2
               || (!isNew && selectedTd.className.indexOf("pred")!=-1)) {
                return true;
            }
            var target=selectedTd;
            var object=getAbout(kb,target) || this.getStatementAbout(target).object;
            if(object) {
                if(selectedTd.className.indexOf(" pendingedit")!=-1) {
                    alert("The node you attempted to edit has a request still pending.\n"+
                          "Please wait for the request to finish (the text will turn black)\n"+
                          "before editing this node again.");
                    return true;
                }
                var nodeCopy = selectedTd.cloneNode(true);
                nodeCopy.className="obj";
                selectedTd.className+=" pendingedit";
                if (object.termType=='symbol' || object.termType=='literal') {
    /* Jim's:
                    if(selectedTd.parentNode.AJAR_inverse) {
                        selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                        alert("Editing inverse statements is not yet enabled.\n"+
                           "You could try editing the statement at the node that it originated from.");
                        return true;
                    }
    */
                    var oldParent = selectedTd.parentNode;
                    This.performAutoCompleteEdit(selectedTd,"object",isNew,function(succeeded) {
                        if(selectedTd.className.indexOf(" pendingedit"!=-1)) {
                            selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                        }
                        if(succeeded) {
                            //alert("I should replace that TD");
                        } else {
                            //alert("Yeah so I heard.");
                            outline.UserInput.deselectAll();
                            var newTD =  outline.outline_objectTD(
                                    selectedTd.parentNode.AJAR_inverse
                                    ? oldParent.AJAR_statement.subject
                                    : oldParent.AJAR_statement.object)
                            outline.replaceTD(newTD,oldParent.lastChild);
                            outline.UserInput.setSelected(newTD,true);
                        }
                        return true;
                    });
                    return true;
                } else if (isNew) {
                    //alert("adding new");
                    var completeType=(selectedTd.nextSibling)?"predicate":"object";
                    var parentTr = selectedTd.parentNode;
                    //alert(completeType);
                    if(completeType=="predicate") { //perform a routine.
                        This.performAutoCompleteEdit(selectedTd,completeType,isNew,function(succeeded) {
                            if(selectedTd.className.indexOf(" pendingedit"!=-1)) {
                                selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                            }
                            //TODO:This callback will decide if the next node should be filled.
                            if(succeeded) {
                                selectedTd=parentTr.firstChild;
                                outline.UserInput.deselectAll();
                                outline.UserInput.setSelected(selectedTd.nextSibling,true);
                                This.performAutoCompleteEdit(selectedTd.nextSibling,"object",true,function(succeeded) {
                                    if(selectedTd.className.indexOf(" pendingedit"!=-1)) {
                                        selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                                    }
                                    if(succeeded) {
                                        //alert("I should replace that TR");
                                    } else {
                                        //alert("Yeah so I heard.");
                                        selectedTd.parentNode.parentNode.removeChild(selectedTd.parentNode);
                                    }
                                    return true;
                                });
                            } else {
                                //alert("Yeah so I heard.");
                                selectedTd.parentNode.parentNode.removeChild(selectedTd.parentNode);
                                //todo: fix the store.
                            }
                            return true;
                        });
                    } else { //edit
                        var oldParent = selectedTd.parentNode;
                        This.performAutoCompleteEdit(selectedTd,completeType,isNew,function(succeeded) {
                            if(selectedTd.className.indexOf(" pendingedit"!=-1)) {
                                selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                            }
                            if(succeeded) {
                                //alert("I should replace that TR");
                            } else {
                                //alert("Yeah so I heard.");
                                //oldParent.parentNode.removeChild(oldParent);
                                var trIterator = oldParent;
                                var removedTr = trIterator;
                                for(trIterator = removedTr; trIterator.childNodes.length==1; trIterator=trIterator.previousSibling) {
                                    //This loop finds the TR which contains the predicate name.
                                }
                                if (trIterator==removedTr){ //already were at it.
                                    var theNext=trIterator.nextSibling;
                                    if (theNext.nextSibling&&theNext.childNodes.length==1){
                                        var predicateTd=trIterator.firstChild;
                                        predicateTd.setAttribute('rowspan',parseInt(predicateTd.getAttribute('rowspan'))-1);
                                        theNext.insertBefore(trIterator.firstChild,theNext.firstChild);           
                                    }
                                    removedTr.parentNode.removeChild(removedTr);
                                } else if (!DisplayOptions["display:block on"].enabled){
                                    var predicateTd=trIterator.firstChild;
                                    predicateTd.setAttribute('rowspan',parseInt(predicateTd.getAttribute('rowspan'))-1);
                                    removedTr.parentNode.removeChild(removedTr);
                                }
                            }
                            return true;
                        });
                    }
                    return true;
                } else if (object.termType=="bnode"){ //non-new bnode
                    alert("There was an error in identifying this node, or the node is a blank node.\n"+
                          "Editing of blank nodes is not yet fully supported.");
                    if(selectedTd.className.indexOf(" pendingedit"!=-1)) {
                        selectedTd.className=selectedTd.className.replace(/ pendingedit/g, "");
                    }
                }
            }
        }
        /*//if (target.tagName == 'INPUT' || target.tagName=='TEXTAREA') return; //same box clicked
        var about = this.getStatementAbout(target); // timbl - to avoid alert from random clicks
        if (!about) return;
        try{
            var obj = about.object;
            var trNode=ancestor(target,'TR');
        }catch(e){
            alert('userinput.js: '+e+getAbout(kb,selectedTd));
            tabulator.log.error(target+" getStatement Error:"+e);
        }
        //this.clearInputAndSave();
        
        try{var tdNode=trNode.lastChild;}catch(e){tabulator.log.error(e+"@"+target);}
        //seems to be a event handling problem of firefox3
        if (e.type!='keypress'&&(selectedTd.className=='undetermined selected'||selectedTd.className=='undetermined')){
            this.Refill(e,selectedTd);
            return;
        }*/
        //ignore clicking trNode.firstChild (be careful for <div> or <span>)    
        /*if (e.type!='keypress'&&target!=tdNode && ancestor(target,'TD')!=tdNode) return;     
        
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
        //}
        /*
        if (e.type=='keypress'&&selectedTd.className=='undetermined selected') {
            var completeType=(selectedTd.nextSibling)?'predicate':'all';
            this.AutoComplete(undefined,selectedTd,completeType);
        }
        */
        if(e && e.stopPropagation && selectedTd) e.stopPropagation();
        if(e && e.preventDefault) e.preventDefault();
        return true; //this is not a valid modification
    },

    backOut: function backOut(){
        this.deleteTriple(this.lastModified.parentNode,true);
        this.lastModified=null;
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
        var s=this.lastModifiedStat; //when 'isNew' this is set at addTriple()
        var inverse = this.lastModifiedInverse;
        if(this.lastModified.value != this.lastModified.defaultValue){
            if (this.lastModified.value == ''){
                //ToDo: remove this
                this.lastModified.value=this.lastModified.defaultValue;
                this.clearInputAndSave();
                return;
            } else if (this.lastModified.isNew) {
                s=new RDFStatement(s.subject,s.predicate,kb.literal(this.lastModified.value),s.why);
                // TODO: DEFINE ERROR CALLBACK
                var trCache=ancestor(this.lastModified,'TR');
                try{sparqlService.insert_statement(s, function(uri,success,error_body){
                    if (!success){
                        alert("Error occurs while inserting "+s+'\n\n'+error_body);
                        outline.UserInput.deleteTriple(trCache.lastChild,true);
                    }                    
                })}catch(e){
                    alert('Error inserting '+s+':\n'+e);
                    return;
                }
                s=kb.add(s.subject,s.predicate,kb.literal(this.lastModified.value),s.why);
            }else{ 
                switch (obj.termType){
                    case 'literal':
                        // generate path and nailing from current values
                        sparqlUpdate = sparqlService.update_statement(s);
                        // TODO: DEFINE ERROR CALLBACK
                        var trCache=ancestor(this.lastModified,'TR');
                        var oldValue=this.lastModified.defaultValue;
                        try{sparqlUpdate.set_object(makeTerm(this.lastModified.value), function(uri,success,error_body){
                            if (!success){
                                obj.value=oldValue;
                                alert("Error occurs while editing "+s+'\n\n'+error_body);
                                trCache.lastChild.textContent=oldValue;
                            }                                   
                        })}catch(e){
                             alert("You can not edit statement about this blank node object "+
                                   "becuase it is not identifiable. (Tabulator Bug)");
                             return;
                        }
                        obj.value=this.lastModified.value;
                        UserInputFormula.statements.push(s);
                        break;
                    case 'bnode': //a request refill with text
                        var newStat;
                        var textTerm=kb.literal(this.lastModified.value,"");
                        if (s.predicate.termType=='collection'){ //case: add triple
                            var selectedPredicate=s.predicate.elements[0];
                            if (kb.any(undefined,selectedPredicate,textTerm)){
                                if (!e){ //keyboard
                                    var tdNode=this.lastModified.parentNode;
                                    e={}
                                    e.pageX=findPos(tdNode)[0];
                                    e.pageY=findPos(tdNode)[1]+tdNode.clientHeight;
                                }
                                this.showMenu(e,'DidYouMeanDialog',undefined,{'dialogTerm':kb.any(undefined,selectedPredicate,textTerm),'bnodeTerm':s.subject});
                            }else{
                                var s1=ancestor(ancestor(this.lastModified,'TR').parentNode,'TR').AJAR_statement;
                                var s2=kb.add(s.subject,selectedPredicate,textTerm,s.why);
                                var type=kb.the(s.subject,rdf('type'));
                                var s3=kb.anyStatementMatching(s.subject,rdf('type'),type,s.why);
                                // TODO: DEFINE ERROR CALLBACK
                                //because the table is reapinted, so...
                                var trCache=ancestor(ancestor(this.lastModified,'TR'),'TD').parentNode;
                                try{sparqlService.insert_statement([s1,s2,s3], function(uri,success,error_body){
                                    if (!success){
                                        kb.remove(s2);kb.remove(s3);
                                        alert("Error occurs while editing "+s1+'\n\n'+error_body);
                                        outline.UserInput.deleteTriple(trCache.lastChild,true);
                                    }
                                })}catch(e){
                                    alert("You can not edit statement about this blank node object "+
                                    "becuase it is not identifiable. (Tabulator Bug)");
                                    return;
                                }
                                kb.remove(s);
                                newStat=kb.add(s.subject,selectedPredicate,textTerm,s.why);
                                //a subtle bug occurs here, if foaf:nick hasn't been dereferneced,
                                //this add will cause a repainting
                            }
                            var enclosingTd=ancestor(this.lastModified.parentNode.parentNode,'TD');
                            outline.outline_expand(enclosingTd,s.subject,defaultPane,true);
                            outline.walk('right',outline.focusTd);                         
                        }else{
                            var st=new RDFStatement(s.subject,s.predicate,kb.literal(this.lastModified.value),s.why)
                            // TODO: DEFINE ERROR CALLBACK
                            var trCache=ancestor(this.lastModified,'TR');
                            try{sparqlService.insert_statement(st, function(uri,success,error_body){
                                if (!success){           
                                    alert("Error occurs while inserting "+st+'\n\n'+error_body);
                                    outline.UserInput.deleteTriple(trCache.lastChild,true);
                                }
                            })}catch(e){
                                alert("You can not edit statement about this blank node object "+
                                      "becuase it is not identifiable. (Tabulator Bug)");
                                return;
                            }
                            kb.remove(s);
                            newStat=s=kb.add(s.subject,s.predicate,kb.literal(this.lastModified.value),s.why);;
                        }
                        UserInputFormula.statements.push(newStat);
                        break;
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
        }else if(s.predicate.termType=='collection'){
            kb.removeMany(s.subject);
            var upperTr=ancestor(ancestor(this.lastModified,'TR').parentNode,'TR');
            var preStat=upperTr.AJAR_statement;
            var reqTerm=this.generateRequest("(To be determined. Re-type of drag an object onto this field)");
            this.formUndetStat(upperTr,preStat.subject,preStat.predicate,reqTerm,preStat.why,false);
            outline.replaceTD(outline.outline_objectTD(reqTerm,defaultpropview),upperTr.lastChild);
            this.lastModified=null;
            return;
        }else if((s.object.termType=='bnode'&&!this.statIsInverse)||
                  s.subject.termType=='bnode'&&this.statIsInverse){
            this.backOut();
            return;
        }
        //case modified:
        var trNode=ancestor(this.lastModified,'TR');
            
        var defaultpropview = this.views.defaults[s.predicate.uri];
        if (!this.statIsInverse)
            outline.replaceTD(outline.outline_objectTD(s.object, defaultpropview),trNode.lastChild);
        else
            outline.replaceTD(outline.outline_objectTD(s.subject, defaultpropview),trNode.lastChild);
        trNode.AJAR_statement=s;//you don't have to set AJAR_inverse because it's not changed
        //This is going to be painful when predicate-edit allowed
        this.lastModified = null;  
    },

    deleteTriple: function deleteTriple(selectedTd,isBackOut){
        if(selectedTd.className.indexOf(" pendingedit")!=-1) {
            alert("The node you attempted to edit has a request still pending.\n"+
                  "Please wait for the request to finish (the text will turn black)\n"+
                  "before editing this node again.");
            return;
        } else {
            selectedTd.className+=" pendingedit";
        }
        var removedTr;var afterTr;
        var s=this.getStatementAbout(selectedTd);
        if (!isBackOut&&
            !kb.whether(s.object,rdf('type'),tabulator.ns.link('Request')) && // Better to check provenance not internal?
            !kb.whether(s.predicate,rdf('type'),tabulator.ns.link('Request')) &&
            !kb.whether(s.subject,rdf('type'),tabulator.ns.link('Request'))){
            try{sparqlService.delete_statement(s, function(uri,success,error_body){
                if(selectedTd.className.indexOf(" pendingedit")!=-1) {
                    selectedTd.className=selectedTd.className.replace(/ pendingedit/g,"");
                }
                if (success && error_body==""){
                    kb.remove(s);
                    outline.walk('down');
                    var trIterator = selectedTd.parentNode;
                    var removedTr = trIterator;
                    for(trIterator = removedTr; trIterator.childNodes.length==1; trIterator=trIterator.previousSibling) {
                        //This loop finds the TR which contains the predicate name.
                    }
                    if (trIterator==removedTr){
                        var theNext=trIterator.nextSibling;
                        if (theNext.nextSibling&&theNext.childNodes.length==1){
                            var predicateTd=trIterator.firstChild;
                            predicateTd.setAttribute('rowspan',parseInt(predicateTd.getAttribute('rowspan'))-1);
                            theNext.insertBefore(trIterator.firstChild,theNext.firstChild);           
                        }
                        removedTr.parentNode.removeChild(removedTr);
                    } else if (!DisplayOptions["display:block on"].enabled){
                        var predicateTd=trIterator.firstChild;
                        predicateTd.setAttribute('rowspan',parseInt(predicateTd.getAttribute('rowspan'))-1);
                        removedTr.parentNode.removeChild(removedTr);
                    }
                } else {
                    alert("The selected statement: \n"+s+"\ncould not be removed from the document.\n"+
                          "The server returned an error:\n"+error_body);
                }
            })}catch(e){
                if(selectedTd.className.indexOf(" pendingedit")!=-1) {
                    selectedTd.className=selectedTd.className.replace(/ pendingedit/g,"");
                }
                alert("The selected node could not be deleted because it was not\n"+
                      "uniquely identified in the store.  This is a known issue.");
                return;
            }
        }
    },

    addTriple: function addTriple(e){
        var predicateTd=getTarget(e).parentNode.parentNode;
        var predicateTerm=getAbout(kb,predicateTd);
        var isInverse=predicateTd.parentNode.AJAR_inverse;
    /* Jim's:
        if(isInverse) {
            alert("Editing inverse statements is not yet enabled.\n"+
                  "You could try editing the statement at the node that it originated from.");
            return; //this.formUndetStat(insertTr,reqTerm,preStat.predicate,preStat.object,preStat.why,true);
        }
    */
        //var titleTerm=getAbout(kb,ancestor(predicateTd.parentNode,'TD'));
        //set pseudo lastModifiedStat here
        this.lastModifiedStat = predicateTd.parentNode.AJAR_statement;
        this.statIsInverse = predicateTd.parentNode.AJAR_inverse;

        var insertTr=this.appendToPredicate(predicateTd);
        var reqTerm = this.generateRequest(" ",insertTr,false);
        var preStat=insertTr.previousSibling.AJAR_statement;
        
        if (!isInverse) // Kenny's
            this.formUndetStat(insertTr,preStat.subject,preStat.predicate,reqTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,reqTerm,preStat.predicate,preStat.object,preStat.why,true);    
        this.deselectAll();
        this.setSelected(insertTr.lastChild,true);
              var e={type:'keypress'};
              this.Click(e,insertTr.lastChild);
        //this.startFillInText(insertTr.lastChild);
        //this.statIsInverse=false;
    },

    /*clipboard principle: copy wildly, paste carefully
      ToDoS:
      1. register Subcollection?
      2. copy from more than one selectedTd: 1.sequece 2.collection
      3. make a clipboard class?
    */
    clipboardInit: function clipboardInit(address){
        kb.add(kb.sym(address),tabulator.ns.link('objects'),kb.collection())
        kb.add(kb.sym(address),tabulator.ns.link('predicates'),kb.collection())
        kb.add(kb.sym(address),tabulator.ns.link('all'),kb.collection())
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
                var objects=kb.the(kb.sym(address),tabulator.ns.link('objects'));
                if (!objects) objects=kb.add(kb.sym(address),kb.sym(address+"#objects"),kb.collection()).object
                objects.unshift(term);
                break;
            case 'pred selected':
            case 'pred internal selected':
                var predicates=kb.the(kb.sym(address),tabulator.ns.link('predicates'));
                if (!predicates) predicates=kb.add(kb.sym(address),kb.sym(address+"#predicates"),kb.collection()).object;
                predicates.unshift(term);
        }

        var all=kb.the(kb.sym(address),tabulator.ns.link('all'));
        if (!all) all=kb.add(kb.sym(address),tabulator.ns.link('all'),kb.collection()).object
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
                var st = outline.UserInput.makeStatementToInsert(term, preStat, isInverse);
                insertTr.AJAR_statement = kb.add(st.subject, st.predicate, st.object, st.why);                
                try{sparqlService.insert_statement(st, function(uri,success,error_body){
                    if (!success){
                        alert("Error occurs while inserting "+insertTr.AJAR_statement+'\n\n'+error_body);
                        outline.UserInput.deleteTriple(insertTr.lastChild,true);
                    } else {
                      // pass
                    }                  
                })}catch(e){
                    alert("You can not edit statement about this blank node object "+
                          "becuase it is not identifiable. (Tabulator Bug)");
                    outline.UserInput.deleteTriple(insertTr.lastChild,true);
                    return;
                }            
                insertTr.AJAR_inverse=isInverse;
                UserInputFormula.statements.push(insertTr.AJAR_statement);
                break;            
            case 'selected': //header <TD>, undetermined generated
                var paneDiv=ancestor(selectedTd,'TABLE').lastChild;
                var newTr=paneDiv.insertBefore(myDocument.createElement('tr'),paneDiv.lastChild);
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
                    outline.walk('moveTo',newTr.firstChild);
                    this.startFillInText(newTr.firstChild);            
                }else{//predicate inserted
                    //existing predicate not expected
                    var reqTerm=this.generateRequest("(To be determined. Re-type of drag an object onto this field)",newTr);
                    this.formUndetStat(newTr,preStat.subject,term,reqTerm,preStat.why,false);

                    newTr.insertBefore(outline.outline_predicateTD(term,newTr,false,false),newTr.firstChild);
                    outline.walk('moveTo',newTr.lastChild);
                    this.startFillInText(newTr.lastChild);                  
                }
                break;
        } 
    },

    pasteFromClipboard: function pasteFromClipboard(address,selectedTd){  
        function termFrom(fromCode){
            function theCollection(from){return kb.the(kb.sym(address),tabulator.ns.link(from));}
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

    startFillInText: function startFillInText(selectedTd){
        alert("startFillInText called");
        switch (this.inputInformationAbout(selectedTd)){
            case 'DatatypeProperty-like':
                this.clearMenu();
                    selectedTd.className='';
                    emptyNode(selectedTd);
                    this.lastModified = this.createInputBoxIn(selectedTd," (Please Input) ");
                    this.lastModified.isNew=false;
                    
                    this.lastModified.select();
                    break;            
            case 'ObjectProperty-like':
            case 'predicate':
            case 'no-idea':
                    var e={type:'keypress'};
                    this.Click(e,selectedTd);
                    this.AutoComplete(1);//1 does not stand for anything but [&= true]
        }
    },

    Refill: function Refill(e,selectedTd){
        alert('Refill called');
        tabulator.log.info("Refill"+selectedTd.textContent);
        var isPredicate = selectedTd.nextSibling;    
        if (isPredicate){ //predicateTd
            if (selectedTd.nextSibling.className=='undetermined') {
            /* Make set of proprties to propose for a predicate.
            The  naive approach is to take those which have a class
            of the subject as their domain.  But in fact we must offer anything which
            is not explicitly excluded, by having a domain disjointWith a
            class of the subject.
            SELECT ?pred
               WHERE{
                   ?pred a rdf:Property.
                   ?pred rdfs:domain subjectClass.
               }
            */  
            /*  SELECT ?pred ?class
                WHERE{
                   ?pred a rdf:Property.
                   subjectClass owl:subClassOf ?class.
                   ?pred rdfs:domain ?class.
               }
            */
            /*  SELECT ?pred 
                WHERE{
                   subject a ?subjectClass.
                   ?pred rdfs:domain ?subjectClass.
                }
            */
                var subject=getAbout(kb,ancestor(selectedTd,'TABLE').parentNode);
                if (0) {
                    var subjectClass=kb.any(subject,rdf('type'));
                    var sparqlText=[];
                    var endl='.\n';
                    sparqlText[0]="SELECT ?pred WHERE{\n?pred "+rdf('type')+rdf('Property')+".\n"+
                                  "?pred "+tabulator.ns.rdfs('domain')+subjectClass+".}"; // \n is required? SPARQL parser bug?
                    sparqlText[1]="SELECT ?pred ?class\nWHERE{\n"+
                                  "?pred "+rdf('type')+rdf('Property')+".\n"+
                                  subjectClass+tabulator.ns.rdfs('subClassOf')+" ?class.\n"+
                                  "?pred "+tabulator.ns.rdfs('domain')+" ?class.\n}";
                    sparqlText[2]="SELECT ?pred WHERE{\n"+
                                      subject+rdf('type')+kb.variable("subjectClass")+endl+
                                      kb.variable("pred")+tabulator.ns.rdfs('domain')+kb.variable("subjectClass")+endl+
                                  "}";              
                    var predicateQuery=sparqlText.map(SPARQLToQuery);  
                } else {
                    var badClasses = kb.notType(subject); // what can't it be?
                }
            }else{
                //------selector
                /* SELECT ?pred
                   WHERE{
                       ?pred a rdf:Property.
                       ?pred rdfs:domain subjectClass.
                       ?pred rdfs:range objectClass.
                   }
                */
                //Candidate
                /* SELECT ?pred
                   WHERE{
                       subject a ?subjectClass.
                       object a ?objectClass.
                       ?pred rdfs:domain ?subjectClass.
                       ?pred rdfs:range ?objectClass.
                */            
                var subjectClass=kb.any(subject,rdf('type'));
                var object=selectedTd.parentNode.AJAR_statement.object;
                var objectClass=(object.termType=='literal')?tabulator.ns.rdfs('Literal'):kb.any(object,rdf('type'));
                //var sparqlText="SELECT ?pred WHERE{\n?pred "+rdf('type')+rdf('Property')+".\n"+
                //               "?pred "+tabulator.ns.rdfs('domain')+subjectClass+".\n"+
                //               "?pred "+tabulator.ns.rdfs('range')+objectClass+".\n}"; // \n is required? SPARQL parser bug?
                var sparqlText="SELECT ?pred WHERE{"+subject+rdf('type')+"?subjectClass"+".\n"+
                               object +rdf('type')+"?objectClass"+".\n"+
                               "?pred "+tabulator.ns.rdfs('domain')+"?subjectClass"+".\n"+
                               "?pred "+tabulator.ns.rdfs('range')+"?objectClass"+".\n}"; // \n is required? SPARQL parser bug?
                var predicateQuery = SPARQLToQuery(sparqlText);
            }
            

            //-------presenter
            //ToDo: how to sort selected predicates?
            this.showMenu(e,'GeneralPredicateChoice',predicateQuery,{'isPredicate': isPredicate,'selectedTd': selectedTd});
            
            }else{ //objectTd
                var predicateTerm=selectedTd.parentNode.AJAR_statement.predicate;
                if (kb.whether(predicateTerm,rdf('type'),tabulator.ns.owl('DatatypeProperty'))||
                    predicateTerm.termType=='collection'||
                    kb.whether(predicateTerm,tabulator.ns.rdfs('range'),tabulator.ns.rdfs('Literal'))){
                    selectedTd.className='';
                    emptyNode(selectedTd);
                    this.lastModified = this.createInputBoxIn(selectedTd," (Please Input) ");
                    this.lastModified.isNew=false;
                    
                    this.lastModified.select();
                }
                 
                //show menu for rdf:type
                if (selectedTd.parentNode.AJAR_statement.predicate.sameTerm(rdf('type'))){
                   var sparqlText="SELECT ?class WHERE{?class "+rdf('type')+tabulator.ns.rdfs('Class')+".}"; 
                   //I should just use kb.each
                   var classQuery=SPARQLToQuery(sparqlText);
                   this.showMenu(e,'TypeChoice',classQuery,{'isPredicate': isPredicate,'selectedTd': selectedTd});
                }
                
            
            }
    },
/*
    AutoComplete: function AutoComplete(enterEvent,tdNode,mode){
        alert('AutoComplete called');
        //Firefox 2.0.0.6 makes this not working? 'this' becomes [object HTMLInputElement]
        //                                           but not [wrapped ...]
        //var InputBox=(typeof enterEvent=='object')?this:this.lastModified;//'this' is the <input> element
        var InputBox=this.lastModified||outline.selection[0].firstChild;
        var e={};
        if (!tdNode) tdNode=InputBox.parentNode //argument tdNode seems to be not neccessary
        if (!mode) mode=tdNode.nextSibling?'predicate':'all';
        e.pageX=findPos(tdNode)[0];
        e.pageY=findPos(tdNode)[1]+tdNode.clientHeight;
       
        if (enterEvent){ //either the real event of the pseudo number passed by OutlineKeypressPanel
            var newText=InputBox.value;
            var menu=myDocument.getElementById(outline.UserInput.menuID);
            if (typeof enterEvent=='object'){
                enterEvent.stopPropagation();  
                switch (enterEvent.keyCode){
                    case 13://enter
                    case 9: // tab
                        if (!menu) {
                            outline.UserInput.clearInputAndSave();
                            return;
                        }
                        var inputTerm=getAbout(kb,menu.lastHighlight)
                        var fillInType=(mode=='predicate')?'predicate':'object';
                        if (outline.UserInput.fillInRequest(fillInType,InputBox.parentNode,inputTerm))
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
                        // if(inputNode.value.length!=0) {
                         //   newText=newText.slice(0,-1);
                         //   inputNode.value=inputNode.value
                        break;
                    case 27://esc to enter literal
                        if (!menu){
                            outline.UserInput.backOut();
                            return;
                        }
                        outline.UserInput.clearMenu();                   
                        //Not working? I don't know.
                        //InputBox.removeEventListener('keypress',outline.UserInput.Autocomplete,false);
                        return;
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
                outline.UserInput.showMenu(e,'GeneralAutoComplete',undefined,{'inputText':newText,'selectedTd': tdNode});
                if (typeof enterEvent=='number'){
                    var table=myDocument.getElementById(outline.UserInput.menuID).firstChild;
                    var h1=table.insertBefore(myDocument.createElement('tr'),table.firstChild);
                    var h1th=h1.appendChild(myDocument.createElement('th'));
                    h1th.appendChild(myDocument.createTextNode("New..."));
                    h1.setAttribute('about',tabulator.ns.tabont('createNew'));
                }                 
            }else if(mode=='predicate'){
                outline.UserInput.clearMenu();
                outline.UserInput.showMenu(e,'PredicateAutoComplete',undefined,{'inputText':newText,'isPredicate':true,'selectedTd':tdNode});
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
    },
    */
    //ToDo: shrink rows when \n+backspace
    Keypress: function(e){
        if(e.keyCode==13){
            /*if(outline.targetOf(e).tagName!='TEXTAREA') 
                //this.clearInputAndSave();
            else {//<TEXTAREA>
                var preRows=parseInt(this.lastModified.getAttribute('rows'))
                this.lastModified.setAttribute('rows',(preRows+1).toString());
                e.stopPropagation();
            }*/
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
    
    //  Add a new row to a property list ( P and O)
    //  Called when the blue cross under the whole pane is clicked.
    //
    borderClick: function borderClick(e){
        if (getTarget(e).className != 'bottom-border-active') return;
        var This=outline.UserInput;
        var target=getTarget(e);//Remark: have to use getTarget instead of 'this'
        
        //Take the why of the last TR and write to it.
        if (ancestor(target,'TR').previousSibling &&  // there is a previous predicate/object line
                ancestor(target,'TR').previousSibling.AJAR_statement) {
            preStat=ancestor(target,'TR').previousSibling.AJAR_statement;
            isInverse=ancestor(target,'TR').previousSibling.AJAR_inverse;
        } else { // no previous row: write to the document defining the subject
            var subject=getAbout(kb,ancestor(target.parentNode.parentNode,'TD'));
            var doc=kb.sym(Util.uri.docpart(subject.uri));
            preStat = new RDFStatement(subject,tabulator.ns.rdf('type'),
                            tabulator.ns.rdf('type'),doc);
            isInverse = false;
        }


        if (!preStat){
            var subject=getAbout(kb,ancestor(target.parentNode.parentNode,'TD'));
            var doc=kb.sym(Util.uri.docpart(subject.uri));
            preStat=new RDFStatement(subject,undefined,undefined,doc);
        }

        var isDoc = kb.statementsMatching(preStat.subject,kb.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),kb.sym("http://www.w3.org/2007/ont/link#Document"));
        if(isDoc && preStat.why.termType=="bnode") {
            preStat.why=preStat.subject;
        }
        
        var insertTr=myDocument.createElement('tr');
        ancestor(target,'TABLE').lastChild.insertBefore(insertTr,ancestor(target,'TR'));
        var tempTr=myDocument.createElement('tr');
        var reqTerm1=This.generateRequest("(TBD)",tempTr,true);
        insertTr.appendChild(tempTr.firstChild);
        var reqTerm2=This.generateRequest("(To be determined. Re-type of drag an object onto this field)",tempTr,false);
        insertTr.appendChild(tempTr.firstChild);
        //there should be an elegant way of doing this
        //if completely, take the default docuemnt to write
        if (!preStat){
            var subject=getAbout(kb,ancestor(target.parentNode.parentNode,'TD'));
            var doc=kb.sym(Util.uri.docpart(subject.uri));
            preStat=new RDFStatement(subject,undefined,undefined,doc);
        }
        if (!isInverse)
            This.formUndetStat(insertTr,preStat.subject,reqTerm1,reqTerm2,preStat.why,false);
        else
            This.formUndetStat(insertTr,preStat.object,reqTerm1,reqTerm2,preStat.why,false);
            This.deselectAll();
      This.setSelected(insertTr.firstChild,true);
            var e2={type:'keypress'};
            This.Click(e2,outline.selection[0]);
            //This.AutoComplete(1);//1 does not stand for anything but [&= true]
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

    inputInformationAbout: function inputInformationAbout(selectedTd){
        var predicateTerm=selectedTd.parentNode.AJAR_statement.predicate; 
        if(kb.whether(predicateTerm,tabulator.ns.rdf('type'),tabulator.ns.owl('DatatypeProperty'))||
           kb.whether(predicateTerm,tabulator.ns.rdfs('range'),tabulator.ns.rdfs('Literal'))||
               predicateTerm.termType=='collection')
                return 'DatatypeProperty-like';
            else if (kb.whether(predicateTerm,rdf('type'),tabulator.ns.owl('ObjectProperty')))
                return 'ObjectProperty-like';
            else
                return 'no-idea';	       
    },
     
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
        this.lastModifiedStat = trNode.AJAR_statement;
        this.statIsInverse = trNode.AJAR_inverse;
            
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

    createNew: function createNew(selectedTd,isInverse){
        alert("createnew");
        var insertTr=selectedTd.parentNode;
        //var preStat=insertTr.previousSibling.AJAR_statement;
        var preStat=insertTr.AJAR_statement;
        var predicateTerm=preStat.predicate;
            
        var tempTerm=kb.bnode();
        var tempType=(!isInverse)?kb.any(predicateTerm,tabulator.ns.rdfs('range')):kb.any(predicateTerm,tabulator.ns.rdfs('domain'));
        if (tempType) kb.add(tempTerm,rdf('type'),tempType,preStat.why);
        var tempRequest=this.generateRequest("(Type URI into this if you have one)",undefined,false,true);
        kb.add(tempTerm,kb.sym('http://www.w3.org/2006/link#uri'),tempRequest,preStat.why);
        /* SELECT ?labelProperty
           WHERE{
               ?labelProperty rdfs:subPropertyOf rdfs:label.
               ?labelProperty rdfs:domain tempType.
           }
        */ //this is ideal...but

        // This is commented out in Kenny's - the old turnk.. is it needed/ what does it do?
        var labelChoices=kb.collection();  
        var labelProperties = kb.each(undefined,tabulator.ns.rdfs('subPropertyOf'),tabulator.ns.rdfs('label'));
        for (var i=0;i<labelProperties.length;i++) {
            labelChoices.append(labelProperties[i]);
            kb.add(labelChoices,tabulator.ns.link('element'),labelProperties[i]);
        }
        labelChoices.append(tabulator.ns.rdfs('label'));
        kb.add(labelChoices,tabulator.ns.link('element'),tabulator.ns.rdfs('label'),preStat.why);
        kb.add(tempTerm,labelChoices,this.generateRequest(" (Error) ",undefined,false,true),preStat.why);
        // up to here 

        //insertTr.appendChild(outline.outline_objectTD(tempTerm));
        outline.replaceTD(outline.outline_objectTD(tempTerm),selectedTd);              
        if (!isInverse)
            this.formUndetStat(insertTr,preStat.subject,predicateTerm,tempTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,tempTerm,predicateTerm,preStat.object,preStat.why,true);
        return tempTerm;
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
        else if (!HCIoptions["bottom insert highlights"].enabled){
            var table=predicateTd.parentNode.parentNode;
            table.insertBefore(insertTr,table.lastChild);
        }
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
        labelPriority[tabulator.ns.link('message').uri] = 20;
        
        // We must get rid of this clutter in the store.
        var reqTerm=kb.bnode();
        kb.add(reqTerm,rdf('type'),tabulator.ns.link("Request"));
        if (tipText.length<10)
            kb.add(reqTerm,tabulator.ns.link('message'),kb.literal(tipText));
        else
            kb.add(reqTerm,tabulator.ns.link('message'),kb.literal(tipText));
    //    kb.add(reqTerm,tabulator.ns.link('to'),kb.literal("The User"));   Ends up all over the store
    //    kb.add(reqTerm,tabulator.ns.link('from'),kb.literal("The User"));
        
        //append the undetermined td
        if (!notShow){
            if(isPredicate)
                trNode.appendChild(outline.outline_predicateTD(reqTerm,trNode,false,false));
            else
                trNode.appendChild(outline.outline_objectTD(reqTerm));
        }
        
        return reqTerm;
    },

    showMenu: function showMenu(e,menuType,inputQuery,extraInformation,order,inputNode){
       //ToDo:order, make a class?
        alert('showMenu called');
        var This=this;
        var menu=myDocument.createElement('div');
        menu.id=this.menuID;
        menu.className='outlineMenu';
        //menu.addEventListener('click',false);
        menu.style.top=e.pageY+"px";
        menu.style.left=e.pageX+"px";
        myDocument.body.appendChild(menu);
        var table=menu.appendChild();  /// @@ eh? needs a param -timbl
           
        menu.lastHighlight=null;;
        function highlightTr(e){
            if (menu.lastHighlight) menu.lastHighlight.className='';
            menu.lastHighlight=ancestor(getTarget(e),'TR');
            if (!menu.lastHighlight) return; //mouseover <TABLE>
            menu.lastHighlight.className='activeItem';
        }

        table.addEventListener('mouseover',highlightTr,false);
        var selectItem
        //setting for action after selecting item
        switch (menuType){
            case 'PredicateAutoComplete':
            case 'GeneralAutoComplete':
            case 'GeneralPredicateChoice':
            case 'TypeChoice':
                var isPredicate=extraInformation.isPredicate;
                var selectedTd=extraInformation.selectedTd;
                selectItem=function (e) {
                    var inputTerm=getAbout(kb,getTarget(e))
                    if (/*isPredicate*/true){
                        //if (outline.UserInput.fillInRequest('predicate',selectedTd,inputTerm))
                            inputNode.value="<"+inputTerm.uri+">";
                            outline.UserInput.clearMenu();
                    }else{
                        //thisInput.fillInRequest('object',selectedTd,inputTerm); //why is this not working?
                        //if (outline.UserInput.fillInRequest('object',selectedTd,inputTerm))
                            inputNode.value=kb.sym(inputTerm.uri);
                            //inputNode.parentNode.parentNode.click();
                            outline.UserInput.clearMenu();
                    }
                }
        } // switch menuType
               
        table.addEventListener('mouseup',selectItem,true);
        
        //Add Items to the list
        function addMenuItem(predicate){
            if (table.firstChild && table.firstChild.className=='no-suggest') table.removeChild(table.firstChild);
            var Label = predicateLabelForXML(predicate, false);
            //Label = Label.slice(0,1).toUpperCase() + Label.slice(1);

            var theNamespace="?";   
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
        function addPredicateChoice(selectedQuery){
            return function (bindings){
                var predicate=bindings[selectedQuery.vars[0]]
                addMenuItem(predicate);
            }
        }
        switch (menuType){
            case 'PredicateAutoComplete':
                var inputText=extraInformation.inputText;
                var results=lb.searchAdv(inputText,undefined,'predicate');
                var entries=results[0];
                if (entries.length==0){
                    this.clearMenu();
                    return;
                }
                for (var i=0;i<entries.length&&i<30;i++) //do not show more than 30 items
                    addMenuItem(entries[i][1]);
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
                    var typeLabel=type?label(type):"";
                    tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode(typeLabel));                
                }
                break;
            default:
                var tr=table.appendChild(myDocument.createElement('tr'));
                tr.className='no-suggest';
                var th=tr.appendChild(myDocument.createElement('th'))
                th.appendChild(myDocument.createElement('div'))
                  .appendChild(myDocument.createTextNode("No suggested choices. Try to type instead."));
                tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode("OK"));
                var This=this;
                function clearMenu(e){This.clearMenu();e.stopPropagation;};
                tr.addEventListener('click',clearMenu,'false');
                                            
                var nullFetcher=function(){};
                switch (inputQuery.constructor.name){
                case 'Array':
                    for(var i=0;i<inputQuery.length;i++) kb.query(inputQuery[i],addPredicateChoice(inputQuery[i]),nullFetcher);
                    break;
                case 'undefined':
                    alert("query is not defined");
                    break;
                default:
                    kb.query(inputQuery,addPredicateChoice(inputQuery),nullFetcher);
                }                
        }
    },//funciton showMenu

    makeStatementToInsert: function(inputTerm, stat, inverse){
        // Either save the new statement to the old source or else the subject
        var target = stat.why;
        if (!outline.sparql.prototype.editable(target.uri, outline.kb))
            target = inverse? stat.object : stat.subject; // left hand side
        if (!outline.sparql.prototype.editable(target.uri, outline.kb))
            throw ('Not editable: '+target)
        if (!inverse)
            return new RDFStatement(stat.subject, stat.predicate, inputTerm, target);
        else
            return new RDFStatement(inputTerm, stat.predicate, stat.object, target);
    },


    fillInRequest: function fillInRequest(type, selectedTd, inputTerm){
        alert("fillinrequest");
        var tr=selectedTd.parentNode;
        var stat=tr.AJAR_statement; var isInverse=tr.AJAR_inverse;
        var reqTerm = (type=='object')?stat.object:stat.predicate;
        var newStat;
        var doNext=false;
        var eventhandler;
        if (kb.any(reqTerm,tabulator.ns.link('onfillin'))){
            eventhandler = new Function("subject",kb.any(reqTerm,tabulator.ns.link('onfillin')).value);
        }
        if (type=='predicate'){
            var newTd;
            if (selectedTd.nextSibling.className!='undetermined'){
                var s= new RDFStatement(stat.subject,inputTerm,stat.object,stat.why);
                // TODO: DEFINE ERROR CALLBACK
                try{sparqlService.insert_statement(s, function(uri,success,error_body){
                    if (!success){
                        outline.UserInput.deleteTriple(newTd,true);
                        alert("Error occurs while inserting "+tr.AJAR_statement+'\n\n'+error_body);
                    }
                })}catch(e){
                    alert("You can not edit statement about this blank node object "+
                          "becuase it is not identifiable. (Tabulator Bug)");
                    return;
                }
                this.lastModified=null;
            }else{
                outline.walk('right');
                doNext=true;
            }
            outline.replaceTD(newTd=outline.outline_predicateTD(inputTerm,tr,false,false),selectedTd);
            //modify store and update here
            newStat=kb.add(stat.subject,inputTerm,stat.object,stat.why) //ToDo: why and inverse
            tr.AJAR_statement=newStat;
            kb.remove(stat);
        }else if (type=='object'){
            if (inputTerm.sameTerm(tabulator.ns.tabont('createNew'))){
                var newTerm=this.createNew(selectedTd);
                var newSelected=outline.selection[0];
                outline.outline_expand(newSelected,newTerm);
                
                
                /*   Supressed:  Offer a set of label attributes to allow the user to name the new thing
                var trIterator;
                for (trIterator=newSelected.firstChild.childNodes[1].firstChild;
                         trIterator; trIterator=trIterator.nextSibling) {
                    var st=trIterator.AJAR_statement;
                    if (!st) continue;
                    if (st.predicate.termType=='collection') break;
                }
                var e={type:'click'};
                this.Click(e,trIterator.lastChild);
                outline.walk('moveTo',trIterator.lastChild);
                */
                return true;
            }        
            var newTd=outline.outline_objectTD(inputTerm);
            if (!selectedTd.previousSibling||selectedTd.previousSibling.className!='undetermined'){
                var s = outline.UserInput.makeStatementToInsert(inputTerm, stat, isInverse);
              //<SPARQLUpdate>
                try{sparqlService.insert_statement(s, function(uri,success,error_body){
                    if (!success){
                        alert("Error occurs while inserting "+tr.AJAR_statement+'\n\n'+error_body);
                        outline.UserInput.deleteTriple(newTd,true);
                    }
                })}catch(e){
                    alert("Unable to add data: "+e);
                    return;
                }
                this.lastModified=null;
            }else{
                outline.walk('left');
                doNext=true;
            }              
            outline.replaceTD(newTd,selectedTd);        
            //modify store and update here
            if (!isInverse)
            newStat=kb.add(stat.subject,stat.predicate,inputTerm,stat.why);
            else
                newStat=kb.add(inputTerm,stat.predicate,stat.object,stat.why);
            tr.AJAR_statement=newStat;
            kb.remove(stat);
            if (isNew) outline.outline_expand(outline.selection[0],inputTerm);  
        }
        UserInputFormula.statements.push(newStat);
        if (eventhandler) eventhandler(stat.subject);
        if (doNext)
            this.startFillInText(outline.selection[0]);
        else
            return true; //can clearMenu
    },

    formUndetStat: function formUndetStat(trNode,subject,predicate,object,why,inverse){
        trNode.AJAR_inverse=inverse;
        return trNode.AJAR_statement=new RDFStatement(subject,predicate,object,why);
    },
 
    //Not so important (will become obsolete?)
    switchModeByRadio: function(){
        var radio=myDocument.getElementsByName('mode');
        if (this._tabulatorMode==0 && radio[1].checked==true) this.switchMode();
        if (this._tabulatorMode==1 && radio[0].checked==true) this.switchMode();
    },
    _tabulatorMode: 0,
    //Default mode: Discovery

    // Jim:
    //====================================================
    //functions that have been defined by jambo are below.
    //====================================================

    //var newTd=outline.outline_objectTD(newStatement.object);
    //var newTd=outline.outline_predicateTD(inputTerm,tr,false,false)
    //outline.replaceTD(newTd,selectedTd); 

    insertInputNode: function(myTD) {
        var inputNode = outline.document.createElement("input");
        inputNode.setAttribute("type","text");
        inputNode.style.border="none";
        if(myTD.className.indexOf("obj")!=-1) {
          var obj = myTD.parentNode.AJAR_statement.object;
          inputNode.defaultValue=obj.value || lb.label(obj) || "<"+obj.uri+">";
        } else if (myTD.nextSibling) { //pred of a new statement
          inputNode.defaultValue=="";
        } else { //obj of a new statement
          inputNode.defaultValue=="";
        }
        emptyNode(myTD);
        myTD.appendChild(inputNode);
        //add focus listeners.
        return inputNode;
    },

    insertAutoCompleteMenu: function(myTD,inputNode,type,isNew,internalListener) {
        var menu = 1;

        //add event listeners.
        inputNode.addEventListener("keypress",function(e) {
            if(e.keyCode==8) {
                if(inputNode.selectionStart!=inputNode.selectionEnd &&
                   inputNode.selectionEnd==inputNode.value.length) {
                    inputNode.value = inputNode.value.slice(0,inputNode.selectionStart);
                }
            }
            return;
        },true);
        inputNode.addEventListener("keyup",function(e) {
            e.stopPropagation();
            var newText=inputNode.value;
            var menu=myDocument.getElementById(outline.UserInput.menuID);
            dump("keyEvent");
            switch (e.keyCode){
                case 13://enter
                    inputNode.blur();
                    return;
                case 38://up
                    if(menu.lastHighlight.previousSibling) {
                        var e = {};
                        e.target=menu.lastHighlight.previousSibling;
                        menu.highlightTr(e);
                    }
                    return;
                case 40://down
                    if(menu.lastHighlight.nextSibling) {
                        var e = {};
                        e.target=menu.lastHighlight.nextSibling;
                        menu.highlightTr(e);
                    }
                    return;
                case 8://backspace
                    break;
                case 27://esc to enter literal
                    outline.UserInput.clearMenu();
                    return;
                    break;
                default:
                    //newText+=String.fromCharCode(e.charCode)
            }
            if(inputNode.selectionStart!=inputNode.selectionEnd
               && inputNode.selectionEnd == inputNode.value.length) { //Ignore autocomplete text.
                inputNode.value=inputNode.value.slice(0,inputNode.selectionStart);
                newText=inputNode.value;
            }
            if (type=="object") {
                outline.UserInput.clearMenu();
                outline.UserInput.newShowMenu(e,'GeneralAutoComplete',{'inputText':newText,'selectedTd': myTD}, inputNode,internalListener);        
            }else if(type=="predicate"){
                outline.UserInput.clearMenu();
                outline.UserInput.newShowMenu(e,'PredicateAutoComplete',{'inputText':newText,'isPredicate':true,'selectedTd':myTD},inputNode,internalListener);
            }
            var menu=myDocument.getElementById(outline.UserInput.menuID); 
            if (!menu) return; //no matches
            if (menu.lastHighlight) menu.lastHighlight.className='';
            var e = {};
            e.target = menu.firstChild.firstChild;
            menu.highlightTr(e); 
            return menu;
        },true);
        inputNode.select();
        return menu;
    },

    makeInternal: function(inputString) {
        if (inputString[0]=="<" && inputString[inputString.length-1]==">") {
            newObjectValue=kb.sym(inputString.substr(1,inputString.length-2));
        } else {
            newObjectValue=kb.literal(inputString);
        }
        return newObjectValue;
    },


    createUpdateListener: function(myTD,inputNode,type,isNew,cb) {
        var internalListener;
        if(isNew) {
            internalListener = function(e) {
                var menu = outline.document.getElementById(outline.UserInput.menuID);
                if(!inputNode || (inputNode==e.target && e.type!="blur")
                   || inputNode.parentNode==e.target) {
                    return null;  //still actually editing
                }  else if (inputNode.value=="" || inputNode.value ==inputNode.defaultValue) {
                    inputNode.removeEventListener("blur",internalListener,true);
                    try { //sometimes blur events fire twice (Crazy ff behavior).
                        myTD.removeChild(inputNode);
                    } catch(e) {
                        return;
                    }
                    outline.UserInput.clearMenu();
                    cb(false);
                } else { //this is an insert that we should submit.
                    if(menu && menu.lastHighlight) { //User picked a menu item.
                        inputNode.value=getAbout(kb,menu.lastHighlight);
                        outline.UserInput.clearMenu();
                    }
                    inputNode.removeEventListener("blur",internalListener,true);
                    try {  //see above try/catch block.
                        myTD.removeChild(inputNode);
                    } catch(e) {
                        return;
                    }
                    var newValue = outline.UserInput.makeInternal(inputNode.value);
                    var oldStatement = myTD.parentNode.AJAR_statement;
                    var newStatement;
                    if(type=="predicate") {  //Awkward special case: getting a pred.
                       if(newValue.termType=="literal") {
                         cb(false);
                       } else {
                         newStatement = new RDFStatement(oldStatement.subject,newValue,oldStatement.object,oldStatement.why);
                         myTD.parentNode.AJAR_statement = newStatement;
                         var newTd=outline.outline_predicateTD(newValue,myTD.parentNode,false,false)
                         outline.replaceTD(newTd,myTD); 
                         cb(true);
                       }
                       return;
                    } else { // Presumbaly getting the object
                        newStatement = outline.UserInput.makeStatementToInsert(newValue,
                                    oldStatement, myTD.parentNode.AJAR_inverse);
                        newTD=outline.outline_objectTD(myTD.parentNode.AJAR_inverse
                                    ? newStatement.subject : newStatement.object);
                        newTD.className+=" pendingedit";
                        outline.replaceTD(newTD,myTD);
                        myTD=newTD; 
                        sparqlService.insert_statement(newStatement, function(uri,success,error_body){
                            if(myTD.className.indexOf(" pendingedit")!=-1) {
                                myTD.className=myTD.className.replace(/ pendingedit/g,"");
                            }
                            if (success && error_body.length==0){
                                newStatement = kb.add(newStatement.subject,newStatement.predicate,newStatement.object,newStatement.why)
                                myTD.parentNode.AJAR_statement=newStatement;
                                cb(true);
                            } else {
                                alert("Failed to insert new statement: "+newStatement
                                      +"\into <"+uri+"> :\n" + error_body);
                                cb(false);
                            }
                        });
                    }
                    return;
                }
            }
        } else { // not isNew
            internalListener = function(e) {
                var menu = outline.document.getElementById(outline.UserInput.menuID);
                if(!inputNode || (inputNode==e.target && e.type!="blur") || inputNode.parentNode==e.target) {
                    return null;
                }  else if ((inputNode.value=="" || inputNode.value==inputNode.defaultValue)) { //No edit occurred.
                    inputNode.removeEventListener("blur",internalListener,true);
                    try {
                        myTD.removeChild(inputNode);
                    } catch(e) {
                        return;
                    }
                    outline.UserInput.clearMenu();
                    cb(false);
                } else {
                    if(menu && menu.lastHighlight) {
                        inputNode.value=getAbout(kb,menu.lastHighlight);
                        outline.UserInput.clearMenu();
                    }
                    inputNode.removeEventListener("blur",internalListener,true);
                    try {
                        myTD.removeChild(inputNode);
                    } catch(e) {
                        return;
                    }
                    var newValue = outline.UserInput.makeInternal(inputNode.value);
                    var oldStatement = myTD.parentNode.AJAR_statement;
                    var newStatement;
                    var sparqlUpdate = sparqlService.update_statement(oldStatement);
                    newStatement = new RDFStatement(oldStatement.subject,oldStatement.predicate, newValue,oldStatement.why);
                    var newTD=outline.outline_objectTD(newStatement.object);
                    newTD.className+=" pendingedit";
                    outline.replaceTD(newTD,myTD);
                    myTD=newTD;
                    sparqlUpdate.set_object(newValue, function(uri,success,error_body){
                        if(myTD.className.indexOf(" pendingedit")!=-1) {
                            myTD.className=myTD.className.replace(/ pendingedit/g,"");
                        }
                        if (success && error_body.length==0){
                            //myTD.parentNode.AJAR_statement=newStatement;
                            kb.remove(oldStatement);
                            newStatement = kb.add(newStatement.subject,newStatement.predicate,newStatement.object,newStatement.why);
                            myTD.parentNode.AJAR_statement=newStatement;
                            cb(true);
                        } else {
                            alert("Failed to insert new statement: "+newStatement
                                  +"\ninto document <"+uri+">:\n\t"+ error_body);
                            cb(false);
                        }
                    });
                }
                return;
            }
        }
        return internalListener;
    },

    performAutoCompleteEdit: function(myTD,/*String "predicate" || "object" || "literal" */ type, isNew, cb) {

        //insert the input text node
        var inputNode,menu,listener;
        inputNode = this.insertInputNode(myTD);
        this.activeEditNode=inputNode;
        if(!inputNode) {
            cb(false);
            return;
        }

        //insert the menu
        var internalListener = this.createUpdateListener(myTD,inputNode,type,isNew,cb);
        menu = this.insertAutoCompleteMenu(myTD,inputNode,type,isNew,internalListener);
        if(!menu) {
            cb(false);
            return;
        }
        inputNode.addEventListener("blur",internalListener,true);

        //set some style and some flags to prevent the user from trying to edit while updating.

        inputNode.focus();
        return inputNode;
    },

    // Make pop-up menu for autocomplete input
    newShowMenu: function (e,menuType,extraInformation,inputNode,listener) {
        var This=this;
        var menu=myDocument.createElement('div');
        menu.id=this.menuID;
        menu.className='outlineMenu';
        //menu.style.top=e.pageY+"px";
        //menu.style.left=e.pageX+"px";
        myDocument.body.appendChild(menu);
        var table=menu.appendChild(myDocument.createElement('table'));
        var selectedTd=extraInformation.selectedTd;
        menu.lastHighlight=null;;

        function highlightTr(e){
            if(getTarget(e).nodeName=="TABLE") {
                return;
            }
            if (menu.lastHighlight) menu.lastHighlight.className='';
            menu.lastHighlight=ancestor(getTarget(e),'TR');
            var oldInputValue = inputNode.value;
            if(inputNode.selectionStart!=inputNode.selectionEnd) {
                oldInputValue = inputNode.value.slice(0,inputNode.selectionStart);
            }
            inputNode.value=menu.lastHighlight.firstChild.firstChild.innerHTML;
            inputNode.value=oldInputValue+inputNode.value.slice(oldInputValue.length,inputNode.value.length);
            if(inputNode.value.toLowerCase()!=oldInputValue.toLowerCase()) {
                inputNode.selectionStart=oldInputValue.length;
                inputNode.selectionEnd=inputNode.value.length;
            }
            if (!menu.lastHighlight) return; //mouseover <TABLE>
            menu.lastHighlight.className='activeItem';
        }
        menu.highlightTr=highlightTr;

        table.addEventListener('mouseover',highlightTr,false);
        
        var selectItem;
        //setting for action after selecting item
        switch (menuType){
            case 'PredicateAutoComplete':
            case 'GeneralAutoComplete':
            case 'GeneralPredicateChoice':
            case 'TypeChoice':
                var isPredicate = extraInformation.isPredicate;
                selectItem = function (e){
                    if(!e.target || getTarget(e).nodeName=="TABLE") {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                    }
                    var inputTerm=getAbout(kb,getTarget(e))
                    inputNode.blur();
                }
        }
        table.addEventListener('mousedown',selectItem,true);
        
        //Add Items to the list
        function addMenuItem(predicate){
            if (table.firstChild && table.firstChild.className=='no-suggest') table.removeChild(table.firstChild);
                var Label = predicateLabelForXML(predicate, false);
                    //Label = Label.slice(0,1).toUpperCase() + Label.slice(1);

            var theNamespace = "??";    
                for (var name in NameSpaces) {
                    if (!predicate.uri) break; //bnode
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
        function addPredicateChoice(selectedQuery){
            return function (bindings){
                var predicate=bindings[selectedQuery.vars[0]]
                addMenuItem(predicate);
            }
        }
        function newObjectMenuLine() {
            var tr=table.appendChild(myDocument.createElement('tr'));
            tr.setAttribute('about', '*createNew'); // magic flag
            tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode("New..."));                
            return tr;
        }
        function objectByURIMenuLine() {
            var tr=table.appendChild(myDocument.createElement('tr'));
            tr.setAttribute('about', '*byURI'); // magic flag
            tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createElement("input"));                
            return tr;
        }
        switch (menuType){
            case 'PredicateAutoComplete':
                var inputText=extraInformation.inputText;
                var results=lb.searchAdv(inputText, undefined, 'predicate');
                var entries=results[0];
                if (entries.length==0){
                    this.clearMenu();
                    return;
                }
                for (var i=0;i<entries.length && i<10;i++) //do not show more than 10 items
                    addMenuItem(entries[i][1]);
                break;
            case 'GeneralAutoComplete':
                var inputText=extraInformation.inputText;
                var results=lb.search(inputText);
                var entries=results[0]; //[label, subject, priority]
                var types=results[1];
                if (entries.length==0){
                    this.clearMenu();
                    return;
                }
                
                table.appendChild(newObjectMenuLine()); //timbl

                for (var i=0;i<entries.length && i<10;i++){ //do not show more than 10 items
                    var thisNT=entries[i][1].toNT();
                    var tr=table.appendChild(myDocument.createElement('tr'));
                    tr.setAttribute('about',thisNT);
                    var th=tr.appendChild(myDocument.createElement('th'))
                    th.appendChild(myDocument.createElement('div')).appendChild(myDocument.createTextNode(entries[i][0]));
                    var theTerm=entries[i][1];
                    //var type=theTerm?kb.any(kb.fromNT(thisNT),rdf('type')):undefined;
                    var type=types[i];
                    var typeLabel=type?label(type):"-";
                    tr.appendChild(myDocument.createElement('td')).appendChild(myDocument.createTextNode(typeLabel));                
                }
                break;
            default:            
        }
        selectedTd.appendChild(menu);
    }//funciton showMenu

};

}
