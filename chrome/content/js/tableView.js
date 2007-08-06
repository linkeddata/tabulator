// Last Modified By: David Li

// Places generating sparql update: inputObjBlur, saveAddRowText
// method: in matrixTD attach a pointer to the statement on each td, called stat

// hotkeys: end adds a new row

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
    var autoCompArray = [];
    var entryArray = [];
    var qps; // assigned in onBinding
    
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
    this.drawQuery = function (q)
    {
        this.onBinding = function (bindings) {
            var i, tr, td;
            //tabulator.log.info('making a row w/ bindings ' + bindings);
            tr = thisTable.document.createElement('tr');
            t.appendChild(tr);
            numStats = q.pat.statements.length; // Added
            qps = q.pat.statements;
            for (i=0; i<nv; i++) {
                v = q.vars[i];
                // generate the subj and pred for each tdNode 
                for (j = 0; j<numStats; j++) {
                    var stat = q.pat.statements[j];
                    // statClone = <#s> <#p> ?v0 .
                    var statClone = new RDFStatement(stat.subject, stat.predicate, stat.object);
                    if (statClone.object == v) {
                        statClone.object = bindings[v];
                        var sSubj = statClone.subject.toString();
                        if (sSubj[0] == '?') { 
                            // statClone = ?v0 <#p> <#o> .
                            statClone.subject = bindings[statClone.subject];
                        }
                        break;
                    }
                }
                var st = kb.anyStatementMatching(statClone.subject, statClone.predicate, statClone.object);
                if (!st) {alert('no statement for '+st.subject+st.predicate+st.object);}
                if (!st.why) {alert("Unknown provenence for {"+st.subject+st.predicate+st.object+"}");}
                tr.appendChild(matrixTD(st.object, st));
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

        for (i=0; i<nv; i++) { // create the header
            v = q.vars[i];
            tabulator.log.debug("table header cell for " + v + ': '+v.label)
            text = document.createTextNode(v.label)
            th = thisTable.document.createElement('th');
            th.appendChild(text);
            tr.appendChild(th);
        }
        
        kb.query(q, this.onBinding); // pulling in the results of the query
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        
        drawExport();
        drawAddRow();
        sortables_init();
        
        // table edit
        t.addEventListener('click', click, false);
        numCols = nv;
        
        // auto completion array
        entryArray = lb.entry;
        for (i = 0; i<lb.entry.length; i++) {
            autoCompArray.push(entryArray[i][0].toString());
            entryArray = entryArray.slice(0);
        }
    }  //***************** End drawQuery *****************//

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
    
    function clearSelected(node) {
        if (!node) {return;}
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
        if (!node) {return;}
        if (node.tagName != "TD") {return;}
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
    
    function getTDNode(iRow, iCol) {
        var t = document.getElementById('tabulated_data');
        //return t.rows[iRow].cells[iCol];  // relies on tbody
        return t.childNodes[iRow].childNodes[iCol];
    }
    
    function keyHandler(e) {
        var oldRow = getRowIndex(selTD); //includes header
        var oldCol = selTD.cellIndex;
        var t = document.getElementById('tabulated_data');
        clearSelected(selTD);
        if (e.keyCode == 35) { //end
            addRow();
        }
        if (e.keyCode==13) { //enter
            onEdit();
        }
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
        e.stopPropagation();
        e.preventDefault();
    }
    
    function onEdit() {
        if ((selTD.getAttribute('autocomp') == undefined) && 
        (selTD.getAttribute('type') == 'sym')) 
        {
            setSelected(selTD); return; 
        }
        
        var t = document.getElementById('tabulated_data');
        var oldTxt = selTD.innerHTML;
        inputObj = document.createElement('input');
        inputObj.type = "text";
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
        inputObj.addEventListener ("blur", inputObjBlur, false);
        inputObj.addEventListener ("keypress", inputObjKeyPress, false);
    }
    
    function inputObjBlur(e) { 
        document.getElementById("autosuggest").style.display = 'none';
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
        
        if (!selTD.stat) {saveAddRowText(newText); return;};
        sparqlUpdate = new sparql(kb).prepareUpdate(selTD.stat);
        sparqlUpdate.setObject(kb.literal(newText, ''));
    }

    function inputObjKeyPress(e) {
        if (e.keyCode == 13) { //enter
            inputObjBlur(e);
        }
    } //***************** End Table Editing *****************//
        
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
    } // end note type checking
    
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
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "---";
        td.setAttribute('autocomp', 'true');
        return td;
    }

    function createBNodeTD() {
        var td = thisTable.document.createElement('TD');
        td.setAttribute('type', 'bnode');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "---";
        bnode = kb.bnode();
        td.setAttribute('o', bnode.toNT());
        return td;
    } //end td creation
    
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
        var i; var td; var tr = thisTable.document.createElement('tr');
        var t = thisTable.document.getElementById('tabulated_data');
        // create the td nodes for the new row
        // for each td node add the object variable like ?v0
        for (i=0; i<numCols; i++) {
            if (symbolRC (1, i)) {
                td = createSymbolTD();
                td.v = qps[i].object
            }
            else if (literalRC(1, i)) {
                td = createLiteralTD(); 
                td.v = qps[i].object
            }
            else if (bnodeRC(1, i)) {
                td = createBNodeTD();
                td.v = qps[i].object
            }
            else {alert('addRow problem')} 
            tr.appendChild(td);
        }
        t.appendChild(tr);
        // highlight the td in the first column of the new row
        numRows = t.childNodes.length;
        clearSelected(selTD);
        newRow = numRows-1;
        newCol = 0;
        selTD = getTDNode(newRow, newCol); // first td of the row
        setSelected(selTD);
        // clone the qps array and attach a pointer to the clone on the first td of the row
        var qpsClone = [];
        for (i = 0; i<qps.length; i++) {
            var stat = qps[i];
            var newStat = new RDFStatement(stat.subject, stat.predicate, stat.object, stat.why);
            qpsClone[i] = newStat;
        }
        selTD.qpsClone = qpsClone; // remember that right now selTD is the first td of the row, qpsClone is not a 100% clone
    }
    
    function saveAddRowText(newText) {
        var td = selTD;
        var type = td.getAttribute('type');
        // get the qps which is stored on the first cell of the row
        var qpsc = getTDNode(getRowIndex(td), 0).qpsClone;
        var row = getRowIndex(td);
        // make sure the user has made a selection
        function validate() {
            for (i = 0; i<autoCompArray.length; i++) {
                if (newText == autoCompArray[i]) {
                    return true;
                } 
            }
            return false;
        }
        
        if (validate() == false && type == 'sym') {
            alert('Please make a selection');
            td.innerHTML = '---'; clearSelected(td); setSelected(selTD);
            return;
        }
        
        function getMatchingSym(text) {
            for (i=0; i<autoCompArray.length; i++) {
                if (newText==autoCompArray[i]) {
                    return entryArray[i][1];
                }
            }
            alert('no matching sym');
        }
        
        // fill in the query pattern based on the newText
        for (i = 0; i<numCols; i++) {
            if (qpsc[i].subject == td.v) { // subject is a variable
            // find the type and replace the qps with the correct type of node
                if (type == 'sym') {qpsc[i].subject = getMatchingSym(newText);}
                if (type == 'lit') {qpsc[i].subject = kb.literal(newText);}
                if (type == 'bnode') {qpsc[i].subject = kb.bnode();}
            }
            if (qpsc[i].object == td.v) { // object is a variable
            // find the type and replace the qps with the correct type of node
                if (type == 'sym') {qpsc[i].object = getMatchingSym(newText);}
                if (type == 'lit') {qpsc[i].object = kb.literal(newText);}
                if (type == 'bnode') {qpsc[i].object = kb.bnode();}
            }
        }
        
        // check if all the variables in the query pattern have been filled out
        var qpscComplete = true; 
        for (i = 0; i<numCols; i++) {
            if (qpsc[i].subject.toString()[0]=='?') {qpscComplete = false;}
            if (qpsc[i].object.toString()[0]=='?') {qpscComplete = false;}
        }
        // if all the variables in the query pattern have been filled out, then attach stat pointers to each node, add the stat to the store, and perform the sparql update
        if (qpscComplete == true) {
            for (i = 0; i<numCols; i++) {
                var st = kb.anyStatementMatching(qpsc[i].subject, qpsc[i].predicate, qpsc[i].object); // existing statement for symbols
                if (!st) { // brand new statement for literals
                    var why = qpsc[0].subject;
                    st = new RDFStatement(qpsc[i].subject, qpsc[i].predicate, qpsc[i].object, why);
                    kb.add(st.subject, st.predicate, st.object, st.why);
                }
                var td = getTDNode(row, i);
                td.stat = st; 
                // sparql update
                sparqlUpdate = new sparql(kb).prepareUpdate(td.stat);
                sparqlUpdate.setObject(td.stat.object);
            }
        }
    } //***************** End Add Row *****************//

    /******************************************************
    Autosuggest box
    *******************************************************/
    // mostly copied from http://gadgetopia.com/post/3773
    function autoSuggest(elem, suggestions)
    {
        //The 'me' variable allow you to access the AutoSuggest object
        //from the elem's event handlers defined below.
        var me = this;
        //Arrow to store a subset of eligible suggestions that match the user's input
        var eligible = new Array();
        //A pointer to the index of the highlighted eligible item. -1 means nothing highlighted.
        var highlighted = -1;
        //A div to use to create the dropdown.
        var div = document.getElementById("autosuggest");
        //Do you want to remember what keycode means what? Me neither.
        var TAB = 9;
        var ESC = 27;
        var KEYUP = 38;
        var KEYDN = 40;
        var ENTER = 13;

        /********************************************************
        onkeyup event handler for the input elem.
        Enter key = use the highlighted suggestion, if there is one.
        Esc key = get rid of the autosuggest dropdown
        Up/down arrows = Move the highlight up and down in the suggestions.
        ********************************************************/
        elem.onkeyup = function(ev)
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
                if (highlighted > 0)
                {
                    highlighted--;
                }
                me.changeHighlight(key);
                break;

                case KEYDN:
                if (highlighted < (eligible.length - 1))
                {
                    highlighted++;
                }
                me.changeHighlight(key);
                
                case 16: break;

                default:
                if (elem.value.length > 0) {
                    me.getEligible();
                    me.createDiv();
                    me.positionDiv();
                    me.showDiv();
                    tabulator.log.error(elem.value);
                }
                else {
                    me.hideDiv();
                }
            }
        };

        /********************************************************
        Insert the highlighted suggestion into the input box, and 
        remove the suggestion dropdown.
        ********************************************************/
        this.useSuggestion = function() 
        { // This is where I can move the onblur stuff
            if (highlighted > -1) {
                elem.value = eligible[highlighted];
                this.hideDiv();
 
                setTimeout("document.getElementById('" + elem.id + "').focus()",0);
            }
        };

        /********************************************************
        Display the dropdown. Pretty straightforward.
        ********************************************************/
        this.showDiv = function()
        {
            div.style.display = 'block';
        };

        /********************************************************
        Hide the dropdown and clear any highlight.
        ********************************************************/
        this.hideDiv = function()
        {
            div.style.display = 'none';
            highlighted = -1;
        };

        /********************************************************
        Modify the HTML in the dropdown to move the highlight.
        ********************************************************/
        this.changeHighlight = function()
        {
            var lis = div.getElementsByTagName('LI');
            for (i in lis) {
                var li = lis[i];
                if (highlighted == i) {
                    li.className = "selected";
                    elem.value = li.firstChild.innerHTML;
                }
                else {
                    if (!li) return; // fixes a bug involving "li has no properties"
                    li.className = "";
                }
            }
        };

        /********************************************************
        Position the dropdown div below the input text field.
        ********************************************************/
        this.positionDiv = function()
        {
            var el = elem;
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

            div.style.left = x + 'px';
            div.style.top = y + 'px';
        };

        /********************************************************
        Build the HTML for the dropdown div
        ********************************************************/
        this.createDiv = function()
        {
            var ul = document.createElement('ul');

            //Create an array of LI's for the words.
            for (i in eligible) {
                var word = eligible[i];

                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href="javascript:false";
                a.innerHTML = word;
                li.appendChild(a);

                if (highlighted == i) {
                    li.className = "selected";
                }

                ul.appendChild(li);
            }

            div.replaceChild(ul,div.childNodes[0]);

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
            
                var lis = div.getElementsByTagName('LI');
                

                for (i in lis)
                {
                    var li = lis[i];
                    if(li == target)
                    {
                        highlighted = i;
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
            div.className="suggestion_list";
            div.style.position = 'absolute';
        }; // createDiv

        /********************************************************
        determine which of the suggestions matches the input
        ********************************************************/
        this.getEligible = function()
        {
            eligible = new Array();
            for (i in suggestions) 
            {
                var suggestion = suggestions[i];
                
                if(suggestion.toLowerCase().indexOf(elem.value.toLowerCase()) == "0")
                {
                    eligible[eligible.length]=suggestion;
                }
            }
        };
        
        this.getKeyCode = function(ev) {
            if(ev) { return ev.keyCode;}
        };

        this.getEventSource = function(ev) {
            if(ev) { return ev.target; }
        };

        this.cancelEvent = function(ev) {
            if(ev) { ev.preventDefault(); ev.stopPropagation(); }
        }
    } // autosuggest
    //document.write('<div id="autosuggest"><ul></ul></div>');
} // tableView

function tableDoubleClick(event) {
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
    else rightCell.insertBefore(img, rightCell.firstChild)
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

function matrixTD(obj, st, asImage, doc) {
    if (!doc) doc=document;
    var td = doc.createElement('TD');
    td.stat = st; // pointer to the statement for the td
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

