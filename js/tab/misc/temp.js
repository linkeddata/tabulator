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

        var supportsContractID = "@mozilla.org/supports-array;1";
        var supportsIID = Components.interfaces.nsISupportsArray;
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
                if (pred.termType=='NamedNode') //temporarily deal with symbol only
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

//Fragment:userinput::addTriple
    /*
        switch (kb.whether(term,rdf('type'),tabulator.ns.owl(?x))){
            when ?x='ObjectProperty:
            ...
        }
    */
    if (kb.whether(predicateTerm,rdf('type'),tabulator.ns.owl('ObjectProperty'))){
        var preStat=insertTr.previousSibling.AJAR_statement;
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

        var labelChoices=kb.collection();
        var labelProperties = kb.each(undefined,tabulator.ns.rdfs('subPropertyOf'),tabulator.ns.rdfs('label'));
        for (var i=0;i<labelProperties.length;i++) {
            labelChoices.append(labelProperties[i]);
            kb.add(labelChoices,tabulator.ns.link('element'),labelProperties[i]);
        }
        labelChoices.append(tabulator.ns.rdfs('label'));
        kb.add(labelChoices,tabulator.ns.link('element'),tabulator.ns.rdfs('label'),preStat.why);
        kb.add(tempTerm,labelChoices,this.generateRequest(" (Error) ",undefined,false,true),preStat.why);

        insertTr.appendChild(outline.outline_objectTD(tempTerm));
        if (!isInverse)
            this.formUndetStat(insertTr,preStat.subject,predicateTerm,tempTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,tempTerm,predicateTerm,preStat.object,preStat.why,true);
        return [insertTr.lastChild,tempTerm]; //expand signal
    } else if (kb.whether(predicateTerm,rdf('type'),tabulator.ns.owl('DatatypeProperty'))||
               kb.whether(predicateTerm,tabulator.ns.rdfs('domain'),tabulator.ns.rdfs('Literal'))){
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

//Fragments: related to modes
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

//Fragments: related to "bottom insert highlights"
//@ border click
        if (HCIoptions["bottom insert highlights"].enabled){
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
        }
//Fragment: Click@userinput.js
else if (selectedTd.className=='undetermined selected'){
            emptyNode(selectedTd);
            this.lastModified=this.createInputBoxIn(selectedTd,"");
            this.lastModified.select();
            this.lastModified.addEventListener('keypress',this.AutoComplete,false);
        }else if (obj.termType== 'NamedNode'){
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
        /*
        if (e.type=='keypress'&&selectedTd.className=='undetermined selected') {
            var completeType=(selectedTd.nextSibling)?'predicate':'all';
            this.AutoComplete(undefined,selectedTd,completeType);
        }
        */
//Fragment: <Feature about="labelChoice">
//@ fillInRequest
            if (inputTerm.sameTerm(tabulator.ns.tabont('createNew'))){
                //<Feature about="labelChoice">
                //var newTerm=this.createNew(selectedTd);
                //var newSelected=outline.selection[0];
                //outline.outline_expand(newSelected,newTerm);
                /*<lable-choice>
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
                //return true;
                //</Feature>
                inputTerm=kb.nextSymbol(stat.why);
                //this.bnode2symbol(newTerm,inputTerm);
                isNew=true;
            }
//@ createNew
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

        /*<lable-choice>
        var labelChoices=kb.collection();
        var labelProperties = kb.each(undefined,tabulator.ns.rdfs('subPropertyOf'),tabulator.ns.rdfs('label'));
        for (var i=0;i<labelProperties.length;i++) {
            labelChoices.append(labelProperties[i]);
            kb.add(labelChoices,tabulator.ns.link('element'),labelProperties[i]);
        }
        labelChoices.append(tabulator.ns.rdfs('label'));
        kb.add(labelChoices,tabulator.ns.link('element'),tabulator.ns.rdfs('label'),preStat.why);
        kb.add(tempTerm,labelChoices,this.generateRequest(" (Error) ",undefined,false,true),preStat.why);
        */

        //insertTr.appendChild(outline.outline_objectTD(tempTerm));
        //outline.replaceTD(outline.outline_objectTD(tempTerm),selectedTd);
        if (!isInverse)
            this.formUndetStat(insertTr,preStat.subject,predicateTerm,tempTerm,preStat.why,false);
        else
            this.formUndetStat(insertTr,tempTerm,predicateTerm,preStat.object,preStat.why,true);
        return tempTerm;
