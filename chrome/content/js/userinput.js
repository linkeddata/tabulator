addLoadEvent(function(){ document.getElementsByName("mode")[0].checked=true;})

var UserInput={
lastModified: null, //the last <input> being modified
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
            var inputBox=document.createElement('input');
            inputBox.setAttribute('value',obj.value);
            inputBox.setAttribute('class','textinput');
            inputBox.setAttribute('size','100'); //should be the size of <TD>
            tdNode.appendChild(inputBox);
            this.lastModified = inputBox;
        }
        
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
    try{
         var obj=this.getStatementAbout(this.lastModified).object;
    }catch(e){return;}
    
    var s=this.lastModifiedStat;
    if(this.lastModified.value != this.lastModified.defaultValue){

        if (obj.termType=='literal') obj.value=this.lastModified.value;
        //fire text modified??
        if (obj.termType=='symbol'){
            kb.remove(s);        //fire SPARQL update here
            if(!this.statIsInverse)
                s=kb.add(s.subject,s.predicate,kb.sym(this.lastModified.value),s.why); //fire!
                                                                           //'why' to be changed
            else
                s=kb.add(kb.sym(this.lastModified.value),s.predicate,s.object,s.why); //fire!!                       
        }

    };
    var trNode=ancestor(this.lastModified,'TR');
    trNode.removeChild(trNode.lastChild);
    
	var defaultpropview = views.defaults[s.predicate.uri];
	if (!this.statIsInverse)
	    trNode.appendChild(outline.outline_objectTD(s.object, defaultpropview));
	else
	    trNode.appendChild(outline.outline_objectTD(s.subject, defaultpropview));
	trNode.AJAR_statement=s;
	//This is going to be painful when predicate-edit allowed  
},

//ToDo: shrink rows when \n+backspace
Keypress: function(e){
    if(e.keyCode==13){
        if(outline.targetOf(e).tagName!='TEXTAREA') 
            this.clearInputAndSave();
        else {//<TEXTAREA>
            var preRows=eval(this.lastModified.getAttribute('rows').valueOf()) //...
            this.lastModified.setAttribute('rows',(preRows+1).toString());
        }
    }
    //Remark by Kenny: If the user wants to input more lines into an one-line-only blank.
    //                 Direct him/her to a new blank (how?)
},

//Utilities
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
//emptyNode(Node) from tabulate.js

//Not so important (will become obsolete?)
switchModeByRadio: function(){
    var radio=document.getElementsByName('mode');
    if (_tabulatorMode==0 && radio[1].checked==true) this.switchMode();
    if (_tabulatorMode==1 && radio[0].checked==true) this.switchMode();
}

};