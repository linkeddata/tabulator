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
    function (arg,message){
        //which is faster? eval or Function?

        this.message=message;//you should input message        
        //eval:
        //for (var i=0;i<arguments.length;i+=2) eval("var "+arguments[i]+"="+arguments[i+1].toString());
        //if (this.enabled) eval(this.code);
        
        //Function:        
        //if (this.enabled) Function("e",this.code).apply(this,arguments); 
        
        //Neither: (why didn't I find this solution in the past few hours...)
        if (this.enabled) this.code.apply(this,arg);

    };
    this.addMoreCode=function (func){
        if (this.length==1) this[0]=new Option(this.code);
        this[this.length]=new Option(func);
        this.length++;
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

//able to edit in Discovery Mode by mouse


/**
  * Preferences
  **/
//ToDo: Option.enable();
//HCIoptions["right click to switch mode"][0].enabled=true;
//HCIoptions["right click to switch mode"][1].enabled=true;


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




