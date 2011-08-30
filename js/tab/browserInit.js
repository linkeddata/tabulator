// Used.

var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;

tabulator.isExtension = true;

function isFirefox3(){ //from http://developer.mozilla.org/en/docs/Using_nsIXULAppInfo
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
        .getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
        .getService(Components.interfaces.nsIVersionComparator);
    return (versionChecker.compare(appInfo.version, "3.0a") >= 0)?true:false;
}

window.addEventListener("load", function() { tabExtension.init(); }, false);

//@@ jambo commented out this line on 2010-05-27 to prevent 
//tabulator.kb.registerFormula("knowledge base");

var tOpenOutliner = function(e) {
    tabulatorDetectMetadata();//defined in tabulator.xul
    var doc = e.originalTarget;
    var divs = doc.getElementsByTagName('div');
    for(var i=0;i<divs.length;i++) {
        if(divs[i].className.search("TabulatorOutline")!=-1) {
            var uri = tabulator.requestUUIDs[divs[i].getAttribute('id')];
            if( !uri ) {
                continue;
            }
            var table = doc.createElement('table');
            table.setAttribute('id','outline');
            divs[i].appendChild(table);
            var outline = new tabulator.OutlineObject(doc);
            outline.init();
            //table.outline = outline;
            //alert(table.outline);
            
            var nsIURI = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService)
                .newURI(uri, null, null); //ToDo: make sure the encoding is correct
            //this is the best I can do for now. The history entry is not altered so there will be
            //bugs when reloading sessions or goBack/goForth. --kenny
            gBrowser.getBrowserForDocument(doc).webNavigation.setCurrentURI(nsIURI);
            //It's not straightforward to get the browser from the inner document, there should
            //be a better way
            
            var queryButton = doc.createElement('input');
            queryButton.setAttribute('id','queryButton');
            queryButton.setAttribute('style','display:none;');
            queryButton.setAttribute('type','button');
            queryButton.setAttribute('value',"Find All");
            //divs[i].appendChild(queryButton);
            doc.body.appendChild(queryButton);
            queryButton.addEventListener('click',outline.viewAndSaveQuery,false);
            
            outline.GotoSubject(tabulator.kb.sym(uri),true);
        }
    }
    
};

//Delete the main handler for application/rdf+xml, so that our stuff works instead.
var tabExtension = {
    init: function() {
        
        var appcontent = document.getElementById("appcontent");   // browser
        if(appcontent) {
            //var catman = Components.classes["@mozilla.org/categorymanager;1"]
            //    .getService(Components.interfaces.nsICategoryManager);
            //catman.deleteCategoryEntry("Gecko-Content-Viewers","application/rdf+xml",false);
            var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
            gBrowser.addEventListener('load',tOpenOutliner,true);
            var ThisSession=tabulator.kb.the(undefined,tabulator.ns.rdfs('label'),tabulator.kb.literal("This Session"));
            
            //deal with this later
            //@@ jambo removed JUST THE FOLLOWING LINE on 2010-05-27 to speed up browser load.
            //if (!isFirefox3())  sf.requestURI("chrome://tabulator/content/internalKnowledge.n3",ThisSession);
            //gBrowser.setAttribute('ondraggesture', 'nsDragAndDrop.startDrag(event, TabulatorOutlinerObserver)');
            //gBrowser.setAttribute('ondragdrop' ,'nsDragAndDrop.drop(event,TabulatorOutlinerObserver)');
            //gBrowser.setAttribute('ondragenter','nsDragAndDrop.dragEnter(event,TabulatorOutlinerObserver)');
            //gBrowser.setAttribute('ondragexit' ,'nsDragAndDrop.dragExit(event,TabulatorOutlinerObserver)');
        }
    },
    
};
