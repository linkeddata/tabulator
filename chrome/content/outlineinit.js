/**
    This is for outliner features that only work in the extension version, say drag and drop.
    I am always happy creating new files.
                                                             2007.07.11  kennyluck
**/

//#includedIn chrome://tabulator/tabulator.xul
//#require_once chrome://global/nsDragAndDrop.js

/*alert(gBrowser);alert(gBrowser.tagName);
if (!tabulator_gBrowser) {
    var tabulator_wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
               .getService(Components.interfaces.nsIWindowMediator);
    var tabulator_gBrowser = tabulator_wm.getMostRecentWindow("navigator:browser")
}
*/


//ToDos
//1.Recover normal funtionality
//2.Investigate into Gecko drag and drop
//3.Cross Tag Drag And Drop
//4.Firefox native rdf store
var TabulatorOutlinerObserver={

onDrop: function(e,aXferData,dragSession){
    //alert("drop");
    var url = transferUtils.retrieveURLFromData(aXferData.data, aXferData.flavour.contentType);
    if (!url) return;
    var targetTd=selection[0];
    var table=ancestor(ancestor(targetTd,'TABLE').parentNode,'TABLE');
    var thisOutline=table.outline;
    thisOutline.UserInput.insertTermTo(targetTd,kb.sym(url));
},

onDragEnter: function(e,dragSession){ //enter or exit something
    for (var targetTd=e.originalTarget;targetTd;targetTd=targetTd.parentNode){
        if (targetTd.tabulatorSelect) {
            if (selection[0]) selection[0].tabulatorDeselect();
            targetTd.tabulatorSelect();
            break;
        }
    }
},

onDragExit: function(e,dragSession){
    //if (e.originalTarget.tabulatorDeselect) e.originalTarget.tabulatorDeselect();
},

/*
onDragStart: function(aEvent,aXferData,aDragAction){
    var dragTarget=ancestor(aEvent.target,'TD');
    //var nt=dragTarget.getAttribute('about');
    //ToDo:text terms
    var term=getAbout(kb,dragTarget);
    aXferData.data = this.URItoTransferDataSet(term.uri);
    alert("start");
},
*/

getSupportedFlavours: function(){
    var flavourSet = new FlavourSet();
    //flavourSet.appendFlavour("text/rdfitem")
    //flavourSet.appendFlavour("moz/rdfitem");
    flavourSet.appendFlavour("text/x-moz-url");
    flavourSet.appendFlavour("text/unicode");
    flavourSet.appendFlavour("application/x-moz-file", "nsIFile");
    return flavourSet;
},

URItoTransferDataSet: function(uri){
    var dataSet = new TransferDataSet();
    var data = new TransferData();
    data.addDataForFlavour("text/x-moz-url", uri);
    dataSet.push(data);
    return dataSet;
}

}
/*
var ondraging=false; //global variable indicating whether ondraging (better choice?)
var testGlobal = function test(e){alert(e.originalTarget);e.originalTarget.className='selected';e.preventDefault();};
var activateDrag = function (e){
   if (!ondraging){
       alert('activate test');
       ondraging=true;
   }
};
*/
//tabulator_gBrowser.setAttribute('ondragdrop','testGlobal(event)');
//tabulator_gBrowser.setAttribute('ondragenter','activateDrag(event)');

//gBrowser.addEventListener('dragdrop',test,true);