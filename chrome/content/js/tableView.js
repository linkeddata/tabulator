// Last Modified By: David Li

// Places generating SPARQL Update: onEdit and tableEditOnBlur
// SPARQL update should work for literal nodes without a language spec
// method: in matrixTD attach a pointer to the statement on 
// each td, called stat

// SPARQL todo:
// currently, SPARQL update is turned off when the add row button is pressed
// use the SPARQL query pattern for doing the add row

// Other todo:
// prevent users from entering their own values in autosuggest
// add the hotkey control+shift+a to add a new row

var autoCompArray = [];

function tableView(container,doc) 
{
    /*if(isExtension) {
        tabulator = Components.classes["dig.csail.mit.edu/tabulator;1"].
            getService(Components.interfaces.nsISupports).wrappedJSObject;
        //wrap sparql update code with if(isExtension).
        //tabulator.sparql.*;  //see js/sparqlUpdate.js
    }*/
    var numRows; // assigned in click, includes header
    var numCols; // assigned at bottom of click
    var activeSingleQuery = null;
    
    thisTable = this;  // fixes a problem with calling this.container
    this.document=null;
    if(doc)
        this.document=doc;
    else
        this.document=document;
    
    // The necessary vars for a View
    this.name="Table";              //Display name of this view.
    this.queryStates=[];            //All Queries currently in this view.
    this.container=container;       //HTML DOM parent node for this view.
    this.container.setAttribute('ondblclick','tableDoubleClick(event)');
    
    /*****************************************************
    drawQuery 
    ******************************************************/

    this.drawQuery = function (q) {
        this.onBinding = function (bindings) {
            var i, tr, td;
            //tabulator.log.info('making a row w/ bindings ' + bindings);
            tr = thisTable.document.createElement('tr');
            t.appendChild(tr);
            numStats = q.pat.statements.length; // Added
            for (i=0; i<nv; i++) {
                v = q.vars[i];
                // generate the subj and pred for each tdNode 
                for (j = 0; j<numStats; j++) {
                    var testStat = q.pat.statements[j];
                    // statClone = <#s> <#p> ?v0 .
                    var statClone = new RDFStatement(testStat.subject,
                    testStat.predicate, testStat.object, testStat.why);
                    if (statClone.object == v) {
                        statClone.object = bindings[v];
                        var testString = statClone.subject.toString();
                        if (testString[0] == '?') { 
                            // statClone = ?v0 <#p> <#o> .
                            statClone.subject = bindings[statClone.subject];
                        }
                        break;
                    }
                }
                tr.appendChild(matrixTD(statClone.object, statClone));
            } //for each query var, make a row
        }

        var i, td, th, j, v;
        var t = thisTable.document.createElement('table');
        var tr = thisTable.document.createElement('tr');
        var nv = q.vars.length;
        
        t.appendChild(tr);
        t.setAttribute('class', 'results sortable'); //needed to make sortable
        t.setAttribute('id', 'tabulated_data'); 
        
        emptyNode(thisTable.container).appendChild(t); // See results as we go

        for (i=0; i<nv; i++) {
            v = q.vars[i];
            tabulator.log.debug("table header cell for " + v + ': '+v.label)
            text = document.createTextNode(v.label)
            th = thisTable.document.createElement('th');
            // a = document.createElement('a');
            // th.appendChild(a);
            // text = document.createTextNode(v.label);
            
            th.appendChild(text);
            tr.appendChild(th);
        }
        
        kb.query(q, this.onBinding);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        
        drawExport();
        drawAddRow();
        sortables_init();
        
        // Table Edit
        t.addEventListener('click', click, false);
        numCols = nv;
        numRows = t.childNodes.length;
        
        // auto completion array
        var entryArray = lb.entry;
        for (i = 0; i<lb.entry.length; i++) {
            autoCompArray.push(entryArray[i][0]); // autoCompArray is global
            entryArray = entryArray.slice(0);
        }
    }
    //***************** End drawQuery *****************//

    function drawExport () {
        var form= thisTable.document.createElement('form');
        var but = thisTable.document.createElement('input');
        form.setAttribute('textAlign','right');
        but.setAttribute('type','button');
        but.setAttribute('id','exportButton');
        but.addEventListener('click',exportTable,true);
        but.setAttribute('value','Export to HTML');
        form.appendChild(but);
        thisTable.container.appendChild(form);
    }

    this.undrawQuery = function(q) {
        if(q===activeSingleQuery) 
        {
            this.queryStates[q.id]=0;
            activeSingleQuery=null;
            emptyNode(this.container);
        }
    }

    this.addQuery = function(q) {
        this.queryStates[q.id]=0;
    }

    this.removeQuery = function (q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
        return;
    }

    this.clearView = function () {
        this.undrawQuery(activeSingleQuery);
        activeSingleQuery=null;
        emptyNode(this.container);
    }
    
    /***************************************************** 
    Table Editing 
    ******************************************************/
    var selTD;
    var inputObj;
    var sparqlUpdate;
    var sparqlTest='true'; 
    // sparqlTest = 'false' when addRow is called
    
    function clearSelected(node) {
        var a = document.getElementById('focus');
        if (a != null) { a.parentNode.removeChild(a); };
        var t = document.getElementById('tabulated_data');
        t.removeEventListener('keypress', keyHandler, false);
        node.style.backgroundColor = 'white';
    }
    
    function clickSecond(e) {
        selTD.removeEventListener('click', clickSecond, false); 
        if (e.target == selTD) {
            clearSelected(selTD);
            onEdit();
            e.stopPropagation();
            e.preventDefault();
        }
    }
    
    function setSelected(node) {
        if (!node) alert('not a node');
        if (node.tagName != "TD") alert("not a TD");
        var a = document.createElement('a');
        a.setAttribute('id', 'focus');
        node.appendChild(a);
        a.focus();

        var t = document.getElementById('tabulated_data');
        t.addEventListener('keypress', keyHandler, false);
        node.style.backgroundColor = "#8F3";
        
        selTD = node;
        selTD.addEventListener('click', clickSecond, false);
    }
    
    function click(e) {
        if (selTD != null) clearSelected(selTD);
        var node = e.target;
        if (node.firstChild && node.firstChild.tagName == "INPUT") return;
        setSelected(node);
        var t = document.getElementById('tabulated_data');
        numRows = t.childNodes.length;
    }
    
    function getRowIndex(node) { 
        var trNode = node.parentNode;
        var rowArray = trNode.parentNode.childNodes;
        var rowArrayLength = trNode.parentNode.childNodes.length;
        for (i = 1; i<rowArrayLength; i++) {
            if (rowArray[i].innerHTML == trNode.innerHTML) return i;
        }
    }
    
    function keyHandler(e) {
        var oldRow = getRowIndex(selTD); //includes header
        var oldCol = selTD.cellIndex;
        var t = document.getElementById('tabulated_data');
        clearSelected(selTD);
        if(e.keyCode==37) { //left
            newRow = oldRow;
            newCol = (oldCol>0)?(oldCol-1):oldCol;
            var newNode = getTDNode(newRow, newCol);
            setSelected(newNode);
        }
        if (e.keyCode==38) { //up
            newRow = (oldRow>1)?(oldRow-1):oldRow;
            newCol = oldCol;
            var newNode = getTDNode(newRow, newCol)
            setSelected(newNode);
            newNode.scrollIntoView(false); // ...
        }
        if (e.keyCode==39) { //right
            newRow = oldRow;
            newCol = (oldCol<numCols-1)?(oldCol+1):oldCol;
            var newNode = getTDNode(newRow, newCol);
            setSelected(newNode);
        }
        if (e.keyCode==40) { //down
            newRow = (oldRow<numRows-1)?(oldRow+1):oldRow;
            newCol = oldCol;
            var newNode = getTDNode(newRow, newCol);
            setSelected(newNode);
            newNode.scrollIntoView(false);
        }
        if (e.keyCode==13) { //enter
            onEdit();
        }
        if (e.shiftKey && e.keyCode == 9) {  //shift+tab
            newRow = oldRow;
            newCol = (oldCol>0)?(oldCol-1):oldCol;
            if (oldCol == 0) {
                newRow = oldRow-1;
                newCol = numCols-1;
            }
            if (oldRow==1) {newRow=1;}
            if (oldRow==1 && oldCol==0) {newRow=1; newCol = 0;}
            
            var newNode = getTDNode(newRow, newCol);
            setSelected(newNode);
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        if (e.keyCode == 9) { // tab
            newRow = oldRow;
            newCol = (oldCol<numCols-1)?(oldCol+1):oldCol;
            if (oldCol == numCols-1) {
                newRow = oldRow+1;
                newCol = 0;
            }
            if (oldRow == numRows-1) {newRow = numRows-1;}
            if (oldRow == numRows-1 && oldCol == numCols-1) 
            {newRow = numRows-1; newCol = numCols-1}
            
            var newNode = getTDNode(newRow, newCol);
            setSelected(newNode);
        }
        if (e.keyCode == 17 && e.keyCode == 16 && e.keyCode == 65) { 
            // ctrl+shift+a: hotkey for addRow; doesn't work
            alert('add row hotkey');
            addRow();
        }
        e.stopPropagation();
        e.preventDefault();
    }
    
    function getTDNode(iRow, iCol) {
        var t = document.getElementById('tabulated_data');
        //return t.rows[iRow].cells[iCol];  // relies on tbody
        return t.childNodes[iRow].childNodes[iCol];
    }
    
    function onEdit() {
        if ((selTD.getAttribute('autocomp') == undefined) && 
        (selTD.getAttribute('type') == 'sym')) 
        { 
            setSelected(selTD); return; 
        }
        
        var t = document.getElementById('tabulated_data');
        var oldTxt = selTD.innerHTML;
        inputObj = document.createElement('INPUT');
        inputObj.type = "TEXT";
        inputObj.style.width = "99%";
        inputObj.value = oldTxt;
        
        // replace old text with input box
        if (!oldTxt)
            inputObj.value = ' ';  // ????
        if (selTD.firstChild) { // selTD = <td> text </td>
            selTD.replaceChild(inputObj, selTD.firstChild);
            inputObj.select();
        } else { // selTD = <td />
            var parent = selTD.parentNode;
            var newTD = thisTable.document.createElement('TD');
            parent.replaceChild(newTD, selTD);
            newTD.appendChild(inputObj);
        }
        
        // make autocomplete input or just regular input
        if (selTD.getAttribute('autocomp') == 'true') {
            autoSuggest(inputObj, autoCompArray);
        }
        else {
            inputObj.addEventListener ("blur", 
            tableEditOnBlur, false);
            inputObj.addEventListener ("keypress", 
            tableEditOnKeyPress, false);
        }
        
        if (sparqlTest=='true') {
            sparqlUpdate = new sparql(kb).prepareUpdate(selTD.stat);
        }
    }
    
    function tableEditOnBlur(e) { 
        newText = inputObj.value;
        selTD.setAttribute('about', newText);
        if (newText != '') {
            selTD.innerHTML = newText;
        }
        else {
            selTD.innerHTML = '---';
        }
        setSelected(selTD);
        e.stopPropagation();
        e.preventDefault();
        
        if (sparqlTest=='true') {
            sparqlUpdate.setObject(kb.literal(newText, ''));
        }
    }

    function tableEditOnKeyPress(e) {
        if (e.keyCode == 13) { //enter
            tableEditOnBlur(e);
        }
    }
    
    function saveRow(newText) { // 
        alert(newText);
    }
        
    //***************** End Table Editing *****************//
        
    /******************************************************
    Add Row
    *******************************************************/
    // node type checking
    function literalRC (row, col) {
        var t = thisTable.document.getElementById('tabulated_data'); 
        var tdNode = t.childNodes[row].childNodes[col];
        if (tdNode.getAttribute('type') =='lit') return true;
    } 

    function bnodeRC (row, col) {
        var t = thisTable.document.getElementById('tabulated_data');
        var tdNode = t.childNodes[row].childNodes[col];
        if (tdNode.getAttribute('type') =='bnode') return true;
    }

    function symbolRC(row, col) {
        var t = thisTable.document.getElementById('tabulated_data');
        var tdNode = t.childNodes[row].childNodes[col];
        if (tdNode.getAttribute('type') == 'sym') return true;
    }
    // End note type checking
    
    function drawAddRow () {
        var form = thisTable.document.createElement('form');
        var but = thisTable.document.createElement('input');
        form.setAttribute('textAlign','right');
        but.setAttribute('type','button');
        but.setAttribute('id','addRowButton');
        but.addEventListener('click',addRow,true);
        but.setAttribute('value','+');
        form.appendChild(but);
        thisTable.container.appendChild(form);
    }
    
    // use kb.sym for symbols
    // use kb.bnode for blank nodes
    // use kb.literal for literal nodes 
    function addRow () {
        sparqlTest='false';
        var i; var td; var tr = thisTable.document.createElement('tr');
        var t = thisTable.document.getElementById('tabulated_data');
        // I need to add the s, p, o to each node
        for (i=0; i<numCols; i++) {
            if (literalRC(1, i)) {
                td = createLiteralTD(); 
                refNode = getTDNode(1, i);
                td.setAttribute('s', refNode.getAttribute('s'));
                td.setAttribute('p', refNode.getAttribute('p')); 
                td.setAttribute('about', '---');
                //this gets assigned when you edit
            }
            else if (bnodeRC(1, i)) {
                td = createBNodeTD(); 
            }
            else if (symbolRC (1, i)) { 
                td = createSymbolTD();
                refNode = getTDNode(1, i);
                td.setAttribute('s', refNode.getAttribute('s'));
                td.setAttribute('p', refNode.getAttribute('p')); 
                td.setAttribute('about', '---');
                // this gets assigned when you edit
                // I need to create fake paths for the entire graph,
                // this only handles the end point
            }
            else {alert('addRow problem')} // throw error eventually
            tr.appendChild(td);
        }
        t.appendChild(tr);
    }
    
    // td creation for each type
    function createLiteralTD() {
        var td = thisTable.document.createElement("TD");
        td.setAttribute('type', 'lit');
        td.innerHTML = '---';
        return td;
    }
    
    function createSymbolTD() {
        var td = thisTable.document.createElement("TD");
        td.setAttribute('type', 'sym');
        td.setAttribute('autocomp', 'true');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "---";
        return td;
    }

    function createBNodeTD() {
        var td = thisTable.document.createElement('TD');
        bnode = kb.bnode();
        td.setAttribute('o', bnode.toNT());
        td.setAttribute('type', 'bnode');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "---";
        return td;
    }
    //***************** End Add Row *****************//

    /******************************************************
    Autosuggest box
    *******************************************************/
    // mostly copied from http://gadgetopia.com/post/3773
    // counter to help create unique ID's
    var idCounter = 0;
    function autoSuggest(elem, suggestions)
    {
        //The 'me' variable allow you to access the AutoSuggest object
        //from the elem's event handlers defined below.
        var me = this;
        //A reference to the element we're binding the list to.
        this.elem = elem;
        this.suggestions = suggestions;
        //Arrow to store a subset of eligible suggestions that match the user's input
        this.eligible = new Array();
        //The text input by the user.
        this.inputText = null;
        //A pointer to the index of the highlighted eligible item. -1 means nothing highlighted.
        this.highlighted = -1;
        //A div to use to create the dropdown.
        this.div = document.getElementById("autosuggest");
        //Do you want to remember what keycode means what? Me neither.
        var TAB = 9;
        var ESC = 27;
        var KEYUP = 38;
        var KEYDN = 40;
        var ENTER = 13;
        //We need to be able to reference the elem by id. If it doesn't have an id, set one.
        if(!elem.id) {
            var id = "autosuggest" + idCounter;
            idCounter++;
            elem.id = id;
        }

        /********************************************************
        onkeydown event handler for the input elem.
        Enter key = use the highlighted suggestion, if there is one.
        Esc key = get rid of the autosuggest dropdown
        Up/down arrows = Move the highlight up and down in the suggestions.
        ********************************************************/
        elem.onkeydown = function(ev)
        {
            var key = me.getKeyCode(ev);

            switch(key)
            {
                case ENTER:
                me.useSuggestion();
                me.hideDiv();
                break;

                case ESC:
                me.hideDiv();
                break;

                case KEYUP:
                if (me.highlighted > 0)
                {
                    me.highlighted--;
                }
                me.changeHighlight(key);
                break;

                case KEYDN:
                if (me.highlighted < (me.eligible.length - 1))
                {
                    me.highlighted++;
                }
                me.changeHighlight(key);
                break; 
            }
        };

        /********************************************************
        onkeyup handler for the elem
        If the text is of sufficient length, and has been changed, 
        then display a list of eligible suggestions.
        ********************************************************/
        elem.onkeyup = function(ev) 
        {
            var key = me.getKeyCode(ev);
            switch(key) {
            //The control keys were already handled by onkeydown, so do nothing.
            case TAB:
            case ESC:
            case KEYUP:
            case KEYDN:
                return;
                
            default:
                if (this.value != me.inputText && this.value.length > 0) {
                    me.inputText = this.value;
                    me.getEligible();
                    me.createDiv();
                    me.positionDiv();
                    me.showDiv();
                }
                else {
                    me.hideDiv();
                }
            }
        };
        
        this.suggestionUsed = 'false';
        /********************************************************
        Insert the highlighted suggestion into the input box, and 
        remove the suggestion dropdown.
        ********************************************************/
        this.useSuggestion = function() 
        { // This is where I can move the onblur stuff
            if (this.highlighted > -1) {
                this.elem.value = this.eligible[this.highlighted];
                
                var newText = this.elem.value;
                selTD.innerHTML = newText;
                //setSelected(selTD);
                saveRow(newText);
                
                this.hideDiv();
                this.suggestionUsed = 'true'
                
                //It's impossible to cancel the Tab key's default behavior. 
                //So this undoes it by moving the focus back to our field right after
                //the event completes.
                //setTimeout("document.getElementById('" + this.elem.id + "').focus()",0);
            }
        };

        /********************************************************
        Display the dropdown. Pretty straightforward.
        ********************************************************/
        this.showDiv = function()
        {
            this.div.style.display = 'block';
        };

        /********************************************************
        Hide the dropdown and clear any highlight.
        ********************************************************/
        this.hideDiv = function()
        {
            this.div.style.display = 'none';
            this.highlighted = -1;
        };

        /********************************************************
        Modify the HTML in the dropdown to move the highlight.
        ********************************************************/
        this.changeHighlight = function()
        {
            var lis = this.div.getElementsByTagName('LI');
            for (i in lis) {
                var li = lis[i];
                if (this.highlighted == i) {
                    li.className = "selected";
                }
                else {
                    li.className = "";
                }
            }
        };

        /********************************************************
        Position the dropdown div below the input text field.
        ********************************************************/
        this.positionDiv = function()
        {
            var el = this.elem;
            var x = 0;
            var y = el.offsetHeight;

            //Walk up the DOM and add up all of the offset positions.
            while (el.offsetParent && el.tagName.toUpperCase() != 'BODY') {
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
            }

            x += el.offsetLeft;
            y += el.offsetTop;

            this.div.style.left = x + 'px';
            this.div.style.top = y + 'px';
        };

        /********************************************************
        Build the HTML for the dropdown div
        ********************************************************/
        this.createDiv = function()
        {
            var ul = document.createElement('ul');

            //Create an array of LI's for the words.
            for (i in this.eligible) {
                var word = this.eligible[i];

                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href="javascript:false";
                a.innerHTML = word;
                li.appendChild(a);

                if (me.highlighted == i) {
                    li.className = "selected";
                }

                ul.appendChild(li);
            }

            this.div.replaceChild(ul,this.div.childNodes[0]);

            /********************************************************
            mouseover handler for the dropdown ul
            move the highlighted suggestion with the mouse
            ********************************************************/
            ul.onmouseover = function(ev)
            {
                //Walk up from target until you find the LI.
                var target = me.getEventSource(ev);
                while (target.parentNode && target.tagName.toUpperCase() != 'LI')
                {
                    target = target.parentNode;
                }
            
                var lis = me.div.getElementsByTagName('LI');
                

                for (i in lis)
                {
                    var li = lis[i];
                    if(li == target)
                    {
                        me.highlighted = i;
                        break;
                    }
                }
                me.changeHighlight();
            };

            /********************************************************
            click handler for the dropdown ul
            insert the clicked suggestion into the input
            ********************************************************/
            ul.onclick = function(ev)
            {
                me.useSuggestion();
                me.hideDiv();
                me.cancelEvent(ev);
                return false;
            };

            this.div.className="suggestion_list";
            this.div.style.position = 'absolute';

        };

        /********************************************************
        determine which of the suggestions matches the input
        ********************************************************/
        this.getEligible = function()
        {
            this.eligible = new Array();
            for (i in this.suggestions) 
            {
                var suggestion = this.suggestions[i];
                
                if(suggestion.toLowerCase().indexOf(this.inputText.toLowerCase()) == "0")
                {
                    this.eligible[this.eligible.length]=suggestion;
                }
            }
        };
        
        this.getKeyCode = function(ev)
        {
            if(ev) {
                return ev.keyCode;
            }
        };

        this.getEventSource = function(ev)
        {
            if(ev) {
                return ev.target;
            }
        };

        this.cancelEvent = function(ev)
        {
            if(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
    } // autosuggest
} // tableView

function tableDoubleClick(event) {
    alert('double clicked');
    var target = getTarget(event);
    var tname = target.tagName;
    var aa = getAbout(kb, target); 
    tabulator.log.debug("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName)
    if (!aa) return;
    GotoSubject(aa);
}

function exportTable() {
    /*sel=document.getElementById('exportType')
    var type = sel.options[sel.selectedIndex].value
    
    switch (type)
    {
        case 'cv':

            break;
        case 'html':
*/
    var win=window.open('table.html','Save table as HTML');
    var tbl=thisTable.document.getElementById('tabulated_data');
    win.document.write('<TABLE>');
    for(j=0;j<tbl.childNodes[0].childNodes.length;j++)
    {
        win.document.write('<TH>'+ts_getInnerText(tbl.childNodes[0].cells[j])
            +'</TH>')
    }
    for(i=1;i<tbl.childNodes.length;i++)
    {
        var r=tbl.childNodes[i];
        var j;
        win.document.write('<TR>');
        for(j=0;j<r.childNodes.length;j++) {
            var about = ""
            if (r.childNodes[j].attributes['about'])
                about=r.childNodes[j].attributes['about'].value;
            win.document.write('<TD about="'+about+'">');
            win.document.write(ts_getInnerText(r.childNodes[j]));
            win.document.write('</TD>');
        }
        win.document.write('</TR>');
    }
    win.document.write('</TABLE>');
    win.document.uri='table.html'
    win.document.close();
    /*          break;
        case 'sparql':
            //makeQueryLines();
            var spr = document.getElementById('SPARQLText')
            spr.setAttribute('class','expand')
            document.getElementById('SPARQLTextArea').value=queryToSPARQL(myQuery);
            //SPARQLToQuery("PREFIX ajar: <http://dig.csail.mit.edu/2005/ajar/ajaw/data#> SELECT ?v0 ?v1 WHERE { ajar:Tabulator <http://usefulinc.com/ns/doap#developer> ?v0 . ?v0 <http://xmlns.com/foaf/0.1/birthday> ?v1 . }")
            //matrixTable(myQuery, sortables_init)
                //sortables_init();
            break;
        case '': 
            alert('Please select a file type');
            break;
    }*/
}

TableViewFactory = {
    name: "Table View",

    canDrawQuery: function(q) {
        return true;
    },

    makeView: function(container,doc) {
        return new tableView(container,doc);
    },

    getIcon: function() {
        return "chrome://tabulator/content/icons/table.png";
    },

    getValidDocument: function(q) {
        return "chrome://tabulator/content/table.html?query="+q.id;
    }
}

function deleteColumn (src) { // src = the original delete image
    var t = document.getElementById('tabulated_data');
    var colNum = src.parentNode.cellIndex;
    var allRows = t.childNodes;
    var firstRow = allRows[0];
    var rightCell = firstRow.cells[colNum+1]; //header
    if (colNum>0) {var leftCell = firstRow.cells[colNum-1];}
    var numCols = firstRow.childNodes.length;
    
    for (var i = 0; i<allRows.length; i++) {
        allRows[i].cells[colNum].style.display = 'none';
    }
    
    var img = document.createElement('img'); // points left
    img.setAttribute('src', 'icons/tbl-expand-l.png');
    img.setAttribute('align', 'left');
    img.addEventListener('click', makeColumnExpand(src), false);
    
    var imgR = document.createElement('img'); // points right
    imgR.setAttribute('src', 'icons/tbl-expand.png');
    imgR.setAttribute('align', 'right');
    imgR.addEventListener('click', makeColumnExpand(src), false);
    
    if (colNum == numCols-1 || rightCell.style.display =='none') 
        leftCell.insertBefore(imgR, leftCell.firstChild);
    else rightCell.insertBefore(img, rightCell.firstChild);
}

function makeColumnExpand(src) { //src = the original delete image
    return function columnExpand(e) {
        var t = document.getElementById('tabulated_data');
        var colNum = src.parentNode.cellIndex; 
        var allRows = t.childNodes;
        var firstRow = allRows[0];
        var rightCell = firstRow.cells[colNum+1];

        if (colNum>0) {var leftCell = firstRow.cells[colNum-1];}
        var numCols = firstRow.childNodes.length;
        var currCell = src.parentNode;
        
        for (var i = 0; i<allRows.length; i++) {
            allRows[i].cells[colNum].style.display = 'table-cell';
        }
        
        if (colNum == numCols-1 || rightCell.style.display =='none') 
            { leftCell.removeChild(leftCell.firstChild);}
        else rightCell.removeChild(rightCell.firstChild);
    }
}

function convertToURI(x) { // x = <http://test>
    if (x[0] = '<') {
        return x.toString().match(/[^<].*[^>]/)[0];
    } else {return x;}
}

function matrixTD(obj, st, asImage, doc) { 

	if (!doc) doc=document;
    var td = doc.createElement('TD');
    td.stat = st; // pointer to the statement
    if (!obj) var obj = new RDFLiteral(".");
    if  ((obj.termType == 'symbol') || (obj.termType == 'bnode') || 
    (obj.termType == 'collection')) {
		td.setAttribute('about', obj.toNT());
		td.setAttribute('style', 'color:#4444ff');
    }
    
    if (obj.termType =='symbol') {
        td.setAttribute('type', 'sym');
    }
    if (obj.termType =='bnode') {
        td.setAttribute('type', 'bnode');
    }
    if (obj.termType =='literal') {
        td.setAttribute('type', 'lit');
    }
    
    var image;
    if (obj.termType == 'literal') {
        td.setAttribute('about', obj.value);
        td.appendChild(doc.createTextNode(obj.value));
    } 
    else if ((obj.termType == 'symbol') || (obj.termType == 'bnode') || (obj.termType == 'collection')) {
        if (asImage) {
            image = AJARImage(mapURI(obj.uri), label(obj), label(obj));
            image.setAttribute('class', 'pic');
            td.appendChild(image);
        }
        else {
            td.appendChild(doc.createTextNode(label(obj)));
        }
    }
    return td;
}
