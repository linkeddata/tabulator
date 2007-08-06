//Fragment: scrolling

        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
        var gBrowser = wm.getMostRecentWindow("navigator:browser").getBrowser();
        //var brower=gBrowser.selectedTab.contentWindow;
        //gBrowser.selectedTab=gBrowser.addTab("http://www.w3.org/");
        //alert(gBrowser);alert(gBrowser.contentWindow);alert(gBrowser.contentDocument);
        var myWindow=gBrowser.contentWindow; //get it scroll! Yeah!!   
        //alert(window);alert(brower);

        //alert(gBrowser.addTab);alert(gBrowser.scroll);alert(gBrowser.scrollBy)
        //gBrowser.scrollBy(0,100);
        
        //var thisHtml=selection[0].owner
        if (selection[0]){   
	        var PosY=findPos(selection[0])[1];
	        if (PosY+selection[0].clientHeight > myWindow.scrollY+myWindow.innerHeight) getEyeFocus(selection[0],true,true,myWindow);
	        if (PosY<myWindow.scrollY+54) getEyeFocus(selection[0],true,false,myWindow);
	    }

//Fragment: global clipboard	    
    var clip  = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
    //if (!clip) return false;
    var clipid = Components.interfaces.nsIClipboard;
    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
    //if (!trans) return false;
    //trans.addDataFlavor("text/unicode");
    //trans.addDataFlavor("text/x-moz-url");
    trans.addDataFlavor("application/x-moz-file","nsIFile");
    var str       = new Object();
    var strLength = new Object();    
    
    //var PBFlavourSet=new FlavourSet();
    //PBFlavourSet.appendFlavour("application/x-moz-file","nsIFile");
    clip.getData(trans, clipid.kGlobalClipboard);


    /*
    function getClipboardTransferable(aFlavourList){
        var clip  = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
        if (!clip) return false;
        var clipid = Components.interfaces.nsIClipboard;
        
        const supportsContractID = "@mozilla.org/supports-array;1";
        const supportsIID = Components.interfaces.nsISupportsArray;
        var supportsArray = Components.classes[supportsContractID].createInstance(supportsIID);
        var trans = nsTransferable.createTransferable();
        //for (var flavour in aFlavourList) 
        //    trans.addDataFlavor(flavour);
        trans.addDataFlavor("application/x-moz-file","nsIFile");
        clip.getData(trans, clipid.kGlobalClipboard);
        supportsArray.AppendElement(trans);
        return supportsArray;            
    }
    */
    //var dataInClipboard=nsTransferable.get(PBFlavourSet,getClipboardTransferable,false);
    trans.getTransferData("application/x-moz-file", str, strLength);
    //trans.getTransferData("text/unicode",str,strLength);
    //trans.getTransferData("text/x-moz-url",str,strLength);
    //alert(str);alert(str.value);alert(strLength.value);
    str.value.QueryInterface(Components.interfaces.nsISupportsString);
    alert(str.value.data);alert(str.value.data.length);
    //str.value.QueryInterface(Components.interfaces.nsIFile);
    var dataArray=[];
    dataArray[0] = FlavourToXfer(str.value, strLength.value, new Flavour("application/x-moz-file","nsIFile"));
    var transferData=new TransferDataSet(dataArray);
    var theData=transferData.first.first;
    //alert(theData.flavour.dataIIDKey);
    //alert(theData);alert(theData.flavour.contentType);
    alert(transferUtils.retrieveURLFromData(theData.data, theData.flavour.contenType));
        
    //if (str) str       = str.value.QueryInterface(Components.interfaces.nsISupportsString);
    //alert(str.data);
    
//Fragment:userinput::autocomplete
    
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
            /*
            for each (var indexedStore in [kb.subjectIndex,kb.predicateIndex,kb.objectIndex]){
            for (var theNT in indexedStore){
                var term=kb.fromNT(theNT);
                if (term) InputBox.choices.push({'NT':theNT,'label':label(term)});
            }            
            }
            */                        
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
       