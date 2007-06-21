//addLoadEvent(function(){ document.getElementsByName("mode")[0].checked=true;});
//TODO: The mode-switch buttons need to be removed.

var UserInput={
lastModified: null, //the last <input> being modified, .isNew indicates whether it's a new input
lastModifiedStat: null, //the last statement being modified
statIsInverse: false, //whether the statement is an inverse

switchMode: function(){ //should be part of global UI
    switch (_tabulatorMode){
        case 0://discovery -> edit
            _tabulatorMode=1;
	        var outliner=document.getElementById('browser');
	        //outliner.style.cursor="url('icons/pencil_small.png')"; //not working as of now
	        document.getElementsByName('mode')[1].checked=true;
	        break;
	    case 1://edit -> discovery
	        _tabulatorMode=0;
	        this.clearInputAndSave();	        
            document.getElementsByName('mode')[0].checked=true;
            break;
        default:
            alert("mode does not exist");
    }
},
    
Click: function(e){
    if (!e) //e==undefined : Keyboard Input
        var target=selection[0];
    else
        var target=outline.targetOf(e);
    if (target.tagName == 'INPUT' || target.tagName=='TEXTAREA') return; //same box clicked
    try{
        var obj=this.getStatementAbout(target).object;
        var trNode=ancestor(target,'TR');
    }catch(e){return;}
    this.clearInputAndSave();
    
    var tdNode=trNode.lastChild;
    //ignore clicking trNode.firstChild (be careful for <div> or <span>)    
    if (target!=tdNode && ancestor(target,'TD')!=tdNode) return;     
    
    if (obj.termType== 'literal'){
        tdNode.removeChild(tdNode.firstChild); //remove the text
        
        if (obj.value.match('\n')){//match a line feed and require <TEXTAREA>
             var textBox=document.createElement('textarea');
             textBox.appendChild(document.createTextNode(obj.value));
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
            //var e2=document.createEvent("MouseEvents");
            //e2.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
            //inputBox.dispatchEvent(e2);
        //---------------------------------------------------------------------------
    }else if (obj.termType== 'symbol'){
        emptyNode(tdNode);
        tdNode.appendChild(document.createTextNode("<"));
        var inputBox=document.createElement('input');
        inputBox.setAttribute('value',obj.uri);
        inputBox.setAttribute('class','textinput');
        inputBox.setAttribute('size',obj.uri.length.toString());
        tdNode.appendChild(inputBox);
        tdNode.appendChild(document.createTextNode(">"));
        
        inputBox.select();
        this.lastModified = inputBox;
        //Kenny: What if the user just want to edit the title?
    }
    if(e) e.stopPropagation();
},

clearInputAndSave: function(){
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
        else if (obj.termType=='literal') {
            obj.value=this.lastModified.value;
            // send sparql update with new values
            //sparqlUpdate.setObject(makeTerm(this.lastModified.value));
        }
        //fire text modified??
        else if (obj.termType=='symbol'){
            kb.remove(s);
            if(!this.statIsInverse)
                s=kb.add(s.subject,s.predicate,kb.sym(this.lastModified.value),s.why); //fire!
                                                                           //'why' to be changed
            else
                s=kb.add(kb.sym(this.lastModified.value),s.predicate,s.object,s.why); //fire!!
            // send sparql update with new values
            sparqlUpdate.setObject(kb.sym(this.lastModified.value));
        }
    }else if(this.lastModified.isNew){//generate 'Request', there is no way you can input ' (Please Input) '
        this.generateRequest("(To be determined. Re-type of drag an object onto this field)");
        return;        
    }
    //case modified:
    var trNode=ancestor(this.lastModified,'TR');
    trNode.removeChild(trNode.lastChild);
    
    var defaultpropview = views.defaults[s.predicate.uri];
    if (!this.statIsInverse)
        trNode.appendChild(outline.outline_objectTD(s.object, defaultpropview));
    else
        trNode.appendChild(outline.outline_objectTD(s.subject, defaultpropview));
    trNode.AJAR_statement=s;//you don't have to set AJAR_inverse because it's not changed
    //This is going to be painful when predicate-edit allowed

    this.lastModified = null;  
},

addTriple: function(e){
    var predicateTd=getTarget(e).parentNode.parentNode;
    var predicateTerm=getAbout(kb,predicateTd);
    //set pseudo lastModifiedStat here
    this.lastModifiedStat=predicateTd.parentNode.AJAR_statement;

   
    var isEnd=false;
    var trIterator;
    try{
        for(trIterator=predicateTd.parentNode.nextSibling;
        trIterator.childNodes.length==1; //number of nodes as condition
        trIterator=trIterator.nextSibling){}
    }catch(e){isEnd=true;}
    var insertTr=document.createElement('tr');
    //AJAR_statement not set yet
    
    //style stuff, I'll have to investigate appendPropertyTRs() somehow
    insertTr.style.colspan='1';
    insertTr.style.display='block';
    if (!predicateTd.hasAttribute('rowspan')) predicateTd.setAttribute('rowspan','2');
    
    var td=insertTr.appendChild(document.createElement('td'));
    this.lastModified = this.createInputBoxIn(td," (Please Input) ");
    this.lastModified.isNew=true;
    if (!isEnd)
        trIterator.parentNode.insertBefore(insertTr,trIterator);
    else
        predicateTd.parentNode.parentNode.appendChild(insertTr);
    this.lastModified.select();

    if(predicateTd.parentNode.AJAR_inverse) {//generate 'Request';
        this.generateRequest("(This is an inverse statement. Drag a subject onto this field)");
        //I guess it's not making sense...createInputBox and then remove it..
    }
    this.statIsInverse=false;
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

Mouseover: function(e){
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
if (_tabulatorMode==1){
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
if (_tabulatorMode==1){
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
getStatementAbout: function(something){
    var trNode=ancestor(something,'TR');
    try{
        var statement=trNode.AJAR_statement;
    }catch(e){
        //throw "TR not a statement TR";
        return;
    }
    //Set last modified here, I am not sure this will be ok.
    this.lastModifiedStat=trNode.AJAR_statement;
    this.statIsInverse=trNode.AJAR_inverse;
        
    return statement;
},

createInputBoxIn: function(tdNode,defaultText){
    var inputBox=document.createElement('input');
    inputBox.setAttribute('value',defaultText);
    inputBox.setAttribute('class','textinput');
    inputBox.setAttribute('size','100'); //should be the size of <TD>
    tdNode.appendChild(inputBox);
    return inputBox;
},

generateRequest: function(tipText){
    var trNode=ancestor(this.lastModified,'TR');
    trNode.removeChild(trNode.lastChild);
    textTd=document.createElement('td');
    textTd.className='undetermined';
    textTd.appendChild(document.createTextNode(tipText));
    trNode.appendChild(textTd);
    this.lastModified=null;
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
//#include emptyNode(Node) from tabulate.js

//Not so important (will become obsolete?)
switchModeByRadio: function(){
    var radio=document.getElementsByName('mode');
    if (_tabulatorMode==0 && radio[1].checked==true) this.switchMode();
    if (_tabulatorMode==1 && radio[0].checked==true) this.switchMode();
}

};