/*Preference and Configuration

  Q: What is this?
  A: This is where I store optional codes and make them into preferences.
  Q: How do I use it?
  A: Here is how I use it. 
     Step 1: Wrap your code into a function with necesssary arguments.
     Step 2: OptionCollection.addOption(name,function)
     Step 3: Call this piece of code by OptionCollection[name].setupHere(arguments,location)
             where "arguments" is an array of arguments (corresponding to arguments of Step 1)
                   "location" is extra information about where the option is set up.
                   
     Remarks: If there is more than one piece corresponding to an option, use 
              Option.addMoreCode(function) and access pieces of codes by using 
              OptionCollection[name][index].setupHere instead
    
     Step 4: Remember to enable the option (default enabled=false) if you want to test it
  Q: Future?
  A: It should be easy to extend this architecture to contain "hooks", that is you should be able to
     insert code into certain location defined by Step 3.
                                                                2007-06-15 kennyluck
             
*/ 


function Option(code){ //{class Option}
    this.code=code;
    this.length=1;
    this.enabled=false;
    this.setupHere=
    function (arg,message,defaultCode){
        //which is faster? eval or Function?

        this.message=message;//you should input message
        this.defaultCode=defaultCode;        
        //eval:
        //for (var i=0;i<arguments.length;i+=2) eval("var "+arguments[i]+"="+arguments[i+1].toString());
        //if (this.enabled) eval(this.code);
        
        //Function:        
        //if (this.enabled) Function("e",this.code).apply(this,arguments); 
        
        //Neither: (why didn't I find this solution in the past few hours...)
        if (this.enabled) 
            this.code.apply(this,arg);
        else if (defaultCode)
            this.defaultCode.apply(this,arg);
    };
    this.addMoreCode=function (func){
        if (this.length==1) this[0]=new Option(this.code);
        this[this.length]=new Option(func);
        this.length++;
    }
    this.enable=function(){
        this.enabled=true;
        if (this.length>1)
            for(var i=0;i<this.length;i++)
                this[i].enabled=true;
    }
}

function OptionCollection(){ //{class OptionCollection}
    this.addOption=
    function(description,code){
        this[description]=new Option(code);
    };
}

/* Utility */

//Magic number 13 only works for functions with no arguments!!
function getFunctionBody(func){
    return func.toSource().substring(func.name.length+13,func.toSource().length-1)
}

/** 
  * Human Computer Interaction Options
  **/
var HCIoptions=new OptionCollection();

//right click to switch mode
function temp_RCTSM0(){
    window.addEventListener('mousedown',UserInput.Mousedown,false);
    document.getElementById('outline').oncontextmenu=function(){return false;};
}
HCIoptions.addOption("right click to switch mode",temp_RCTSM0);
delete temp_RCTSM0;

function temp_RCTSM1(e){
    if (e.button==2){ //right click
        UserInput.switchMode();
        if(e){
            e.preventDefault();
            e.stopPropagation();
        }
    }
}
HCIoptions["right click to switch mode"].addMoreCode(temp_RCTSM1);
delete temp_RCTSM1;

function temp_RCTSM2(){
    function thoseRadios(){
        var menuDiv=document.getElementById('MenuBar');
        var labelWrite=document.createElement('label');
        labelWrite.innerHTML='<input type="radio" onclick="UserInput.switchModeByRadio()" name="mode" value="1"><img src="icons/pencil_small.png" title="Edit Mode" /></input>'
        var labelBrowse=document.createElement('label');
        labelBrowse.innerHTML='<input type="radio" onclick="UserInput.switchModeByRadio()" name="mode" value="0" checked><img src="icons/discovery_small.png" title="Discovery Mode" /></input>'
        menuDiv.insertBefore(labelWrite,menuDiv.childNodes[6]); //6!! text nodes suck!
        menuDiv.insertBefore(labelBrowse,menuDiv.childNodes[6]);
    }
    addLoadEvent(thoseRadios);
    addLoadEvent(function(){ document.getElementsByName("mode")[0].checked=true;});
}
HCIoptions["right click to switch mode"].addMoreCode(temp_RCTSM2);
delete temp_RCTSM2;

//able to edit in Discovery Mode by mouse
function temp_ATEIDMBM0(sel,e,node){
    if (sel) UserInput.Click(e);
}
HCIoptions.addOption("able to edit in Discovery Mode by mouse",temp_ATEIDMBM0);
delete temp_ATEIDMBM0;

function temp_ATEIDMBM1(node,termWidget){
    termWidget.addIcon(node,Icon.termWidgets.addTri);
}
HCIoptions["able to edit in Discovery Mode by mouse"].addMoreCode(temp_ATEIDMBM1);
delete temp_ATEIDMBM1;

function temp_ATEIDMBM2(node){
    termWidget.removeIcon(node,Icon.termWidgets.addTri);
}
HCIoptions["able to edit in Discovery Mode by mouse"].addMoreCode(temp_ATEIDMBM2);
delete temp_ATEIDMBM2;

//favorite dock
function temp_FD0(){
    include("js/calView/yahoo-dom-event.js");
    include("js/calView/dragdrop.js");
}

HCIoptions.addOption("favorite dock",temp_FD0);
delete temp_FD0;


/** 
  * Source Options
  **/
var SourceOptions=new OptionCollection();

//javascript2rdf
function javascript2rdf0()
{
    include("js/misc/javascript2rdf.js");
}
SourceOptions.addOption("javascript2rdf",javascript2rdf0);
delete javascript2rdf0;

function javascript2rdf1(subject)
{
    if (string_startswith(subject.uri,"javascript:")) 
        RDFizers["javascript2rdf"].load(subject.uri);
    else
	    sf.lookUpThing(subject)
}
SourceOptions["javascript2rdf"].addMoreCode(javascript2rdf1);
delete javascript2rdf1;

function javascript2rdf2(URITitlesToStop)
{
    if(URITitlesToStop.length==0) URITitlesToStop.push("javascript:");
}
SourceOptions["javascript2rdf"].addMoreCode(javascript2rdf2);
delete javascript2rdf2;

/**
  * Preferences
  **/
//HCIoptions["right click to switch mode"].enable();
HCIoptions["able to edit in Discovery Mode by mouse"].enable();
//HCIoptions["favorite dock"].enabled=true;

//##Enable this to play with javascript:variableName
//'javascript:document' is not working fine but 'javascript:document.firstChild' is OK
//SourceOptions["javascript2rdf"].enable();


//ToDo:
//0.Able to query OptionCollections
//1.SourceOptions, ShowingOptions
//2.Someone's preference, option dependency


/* Instances Approach
function HCIoption(){ //{class HCIoption} HCI:Human Computer Interaction
    //register "is rdf:type of"
    this.constructor.instances.push();
}
HCIoption.instances=[];
*/



HCIoptions["right click to switch mode"][2].setupHere([],"end of configuration.js");
SourceOptions["javascript2rdf"][0].setupHere([],"end of configuration.js");
///////////////////////////////////end of configurauration.js



