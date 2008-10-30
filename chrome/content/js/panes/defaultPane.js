/*   Default Pane
**
**  This outline pane contains the properties which are
**  normaly displayed to the user. See also: innternalPane
*/
tabulator.panes.register({
    icon: Icon.src.icon_defaultPane,
    
    label: function(subject) { return 'about ';},
    
    filter: function(pred, inverse) {
        if (typeof tabulator.panes.internalPane.predicates[pred.uri] != 'undefined')
            return false;
        if (inverse && (pred.uri == 
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")) return false;
        return true;
    },
    
    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        var outline = tabulator.outline; //@@
        tabulator.log.info("@defaultPane.render, myDocument is now " + myDocument.location);    
        subject = kb.canon(subject);
        var div = myDocument.createElement('div')
        
        div.setAttribute('class', 'defaultPane')
//        appendRemoveIcon(div, subject, div);
                  
        var plist = kb.statementsMatching(subject)
        tabulator.outline.appendPropertyTRs(div, plist, false, defaultPane.filter)
        plist = kb.statementsMatching(undefined, undefined, subject)
        tabulator.outline.appendPropertyTRs(div, plist, true, defaultPane.filter)
        if ((subject.termType == 'symbol' && 
             outline.UserInput.updateService.editMethod(kb.sym(Util.uri.docpart(subject.uri)), kb))
             || (subject.termType == 'bnode' &&
             outline.UserInput.updateService.editMethod(kb.subjectIndex[subject.hashString()][0].why)
                //check the document containing the definition of the bnode
            /*! && HCIoptions["bottom insert highlights"].enabled*/)) {
            var holdingTr = myDocument.createElement('tr'); //these are to minimize required changes
            var holdingTd = myDocument.createElement('td'); //in userinput.js
            holdingTd.setAttribute('colspan','2');
            holdingTd.setAttribute('notSelectable','true');
            var img = myDocument.createElement('img');
            img.src = Icon.src.icon_add_new_triple;
            img.className='bottom-border-active'
            //img.addEventListener('click',thisOutline.UserInput.borderClick,false);
            div.appendChild(holdingTr).appendChild(holdingTd).appendChild(img);          
        }        
        return div    
    },
}, true);

// ends
    
