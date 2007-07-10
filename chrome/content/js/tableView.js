function tableView(container,doc) 
{
    if(isExtension) {
        tabulator = Components.classes["dig.csail.mit.edu/tabulator;1"].
            getService(Components.interfaces.nsISupports).wrappedJSObject;
        //wrap sparql update code with if(isExtension).
        //tabulator.sparql.*;  //see js/sparqlUpdate.js
    }
    var numRows; // assigned in makeKeyListener
    var numCols; // assigned at bottom of onClickCell
    var activeSingleQuery = null;
    
    thisTable = this;  // fixes a problem with calling this.container
    this.document=null;
    if(doc)
        this.document=doc;
    else
        this.document=document;
    
    // The necessary vars for a View
    this.name="Table";               //Display name of this view.
    this.queryStates=[];            //All Queries currently in this view.
    this.container=container;       //HTML DOM parent node for this view.
    this.container.setAttribute('ondblclick','tableDoubleClick(event)');
    // this.container.setAttribute('onclick', 'onClickCell');
    
    //***************** this.drawQuery *****************//
    this.drawQuery = function (q) 
    {
        this.onBinding = function (bindings) 
        {
            var i, tr, td;
            tabulator.log.info("making a row w/ bindings " + bindings);
            tr = thisTable.document.createElement('tr');
            t.appendChild(tr);
            for (i=0; i<nv; i++)
            {
                v = q.vars[i];
                //alert("calling matrixTD");
                //alert(matrixTD(bindings[v]).innerHTML);
                //alert(bindings[v].termType);
                tr.appendChild(matrixTD(bindings[v]));
            } //for each query var, make a row
        }

        var i, td, th, j, v;
        var t = thisTable.document.createElement('table');
        var tr = thisTable.document.createElement('tr');
        
        nv = q.vars.length;
        
        t.appendChild(tr);
        t.setAttribute('class', 'results sortable'); //needed to make sortable
        t.setAttribute('id', 'tabulated_data'); 
        
        emptyNode(thisTable.container).appendChild(t); // See results as we go
        
        for (i=0; i<nv; i++)
        {
            v = q.vars[i];
            //tabulator.log.debug("table header cell for " + v + ': '+v.label)
            th = thisTable.document.createElement('th');
            th.appendChild(thisTable.document.createTextNode(v.label));
            tr.appendChild(th);
        }
        
        kb.query(q, this.onBinding, myFetcher);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        
        drawExport();
        drawAddRow();
        sortables_init();
        
        t.addEventListener('click', onClickCell, false);
        numCols = nv;
        
        //********** key mvmt activation code *********//
        var a = document.createElement('a');
        th.appendChild(a); 
        a.setAttribute('id', 'anchor');
        a.focus();
        //********** key mvmt activation code *********///
    }
    //***************** End drawQuery *****************//

    //***************** Table Editing *****************//
    var selectedNode;
    var listener;
    function onClickCell(e) 
    {
        if (selectedNode != null) clearSelected(selectedNode);
        var node = e.target;
        // check this
        if (node.firstChild && node.firstChild.tagName == "INPUT") return;
        setSelected(node);
        var t = document.getElementById('tabulated_data');
        numRows = t.childNodes.length - 1; // numRows - 1 is the number of rows minus the header
    }
    
    function getRowIndex(node)
    { // given a node, returns the row that the node is on
        var trNode = node.parentNode
        var rowArray = trNode.parentNode.childNodes;
        var rowArrayLength = trNode.parentNode.childNodes.length;
        for (i = 1; i<rowArrayLength; i++) {
            if (rowArray[i].innerHTML == trNode.innerHTML) return i;
        }
    }
    
    // use this wrapper so that the node can be passed to the event handler
    function makeKeyListener(node) {
        return function keyListener(e) 
        {
            var iRow = getRowIndex(node);
            var iCol = node.cellIndex;
            var t = document.getElementById('tabulated_data');
            clearSelected(node);
            if(e.keyCode==37) { //left
                row = iRow;
                col = (iCol>0)?(iCol-1):iCol;
                var newNode = getTDNode(row, col);
                setSelected(newNode);
            }
            if (e.keyCode==38) { //up
                row = (iRow>1)?(iRow-1):iRow;
                col = iCol;
                var newNode = getTDNode(row, col)
                setSelected(newNode);
                newNode.scrollIntoView(false); // ...
            }
            if (e.keyCode==39) { //right
                row = iRow;
                col = (iCol<numCols-1)?(iCol+1):iCol;
                var newNode = getTDNode(row, col);
                setSelected(newNode);
            }
            if (e.keyCode==40) { //down
                row = (iRow<numRows)?(iRow+1):iRow;
                col = iCol;
                var newNode = getTDNode(row, col);
                setSelected(newNode);
                newNode.scrollIntoView(false);
            }
            if (e.keyCode==13) { //return
                onEdit(node);
            }
            e.stopPropagation();
            e.preventDefault();
        }
    }
    
    function getTDNode(iRow, iCol)
    {
        var t = document.getElementById('tabulated_data');
        //return t.rows[iRow].cells[iCol];  // relies on tbody
        return t.childNodes[iRow].childNodes[iCol];
    }
    
    function setSelected(node) 
    {
        if (!node) return;
        if (node.tagName != "TD") return;
        // FOCUS FIX: add an anchor node, focus on it, then remove the node
        var a = document.createElement('a');
        a.setAttribute('id', 'focustest');
        node.appendChild(a);
        a.focus();

        var t = document.getElementById('tabulated_data');
        listener = makeKeyListener(node);
        t.addEventListener('keypress', listener, false);
        node.style.backgroundColor = "#8F3";
        
        selectedNode = node;
        selectedNode.addEventListener('click', onCellClickSecond, false);
    }
    
    function onCellClickSecond(e) 
    {
        selectedNode.removeEventListener('click', onCellClickSecond, false); 
        // DOES THIS WORK?
        if (e.target == selectedNode) {
            clearSelected(selectedNode);
            onEdit(selectedNode);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    
    function clearSelected(node) 
    {
        var a = document.getElementById('focustest');
        if (a != null) {a.parentNode.removeChild(a);};
        var t = document.getElementById('tabulated_data');
        t.removeEventListener('keypress', listener, false);
        node.style.backgroundColor = 'white';
    }

    function onEdit(node)
    {
        if (literalNodeTD(node)) {setSelected(node); return; }
        var t = document.getElementById('tabulated_data');

        var oldTxt = node.innerHTML;
        var inputObj = document.createElement('INPUT');
        inputObj.type = "TEXT";
        inputObj.style.width = "99%";
        inputObj.value = oldTxt;
        
        if (!oldTxt)
            inputObj.value = ' ';
        if (node.firstChild) { // node of the form <td> text </td>
            node.replaceChild(inputObj, node.firstChild);
            inputObj.select();
        } else { // we have a node of the form <td />
            var parent = node.parentNode;
            var newTD = thisTable.document.createElement('TD');
            parent.replaceChild(newTD, node);
            newTD.appendChild(inputObj);
        }
        inputObj.addEventListener ("blur", tableEditOnBlurWrap(node), false);  
        inputObj.addEventListener ("keypress", tableEditOnKeyPressWrap(node), false);
    }
    
    function tableEditOnBlurWrap(node)
    {
        return function tableEditOnBlur(e) 
        {
            var srcElem = e.target;  // getTarget(e)
            node.innerHTML = srcElem.value

            var col = node.cellIndex;
            var row = node.parentNode.rowIndex;
            setSelected(node);
            // Add code here to handle SPARQL query.  
            // Make a call to clearInputAndSave.
            e.stopPropagation();
            e.preventDefault();
        }
    }
    
    function tableEditOnKeyPressWrap(node) 
    {
        return function tableEditOnKeyPress(e) 
        {
            if (e.keyCode == 13) {
                tableEditOnBlurWrap(node)(e);
            }
        }
    }
    //***************** End Table Editing *****************//
        
    //***************** Add Row *****************//
    function drawAddRow () 
    {
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
    
    function addRow () 
    {
        var i;
        var td;
        var tr = thisTable.document.createElement('tr');
        var t = thisTable.document.getElementById('tabulated_data');
        for (i=0; i<numCols; i++) {
            if (literalNodeRC(numRows, i)) 
                td = createNonLiteralNode();
            else 
                td = createLiteralNode();
            tr.appendChild(td);
        }
        t.appendChild(tr);
    }
    
    function createLiteralNode() 
    {
        var td = thisTable.document.createElement("TD");
        td.innerHTML = " ";
        return td;
    }
    
    function createNonLiteralNode() 
    {
        var td = thisTable.document.createElement("TD");
        td.setAttribute('about', '');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "<form> <select style=\'width:100%\'> <option> nonliteral </option> </select> </form>";
        // SET ATTRIBUTES HERE;
        return td;
    }
    
    // checks to see if a TD element has the about attribute to determine if it is a literal node
    function literalNodeTD (tdNode) 
    {
        if (tdNode.getAttributeNode('about') != null) return true; 
    }
    
    // same as the above except it checks using row, col specifications
    function literalNodeRC (row, col) 
    {
        var t = thisTable.document.getElementById('tabulated_data'); 
        var tdNode = t.childNodes[row].childNodes[col];
        if (literalNodeTD (tdNode)) return true;
    }
    //***************** End Add Row *****************//

    function drawExport () 
    {
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

    this.undrawQuery = function(q) 
    {
        if(q===activeSingleQuery) 
        {
            this.queryStates[q.id]=0;
            activeSingleQuery=null;
            emptyNode(this.container);
        }
    }

    this.addQuery = function(q) 
    {
        this.queryStates[q.id]=0;
    }

    this.removeQuery = function (q) 
    {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
        return;
    }

    this.clearView = function () 
    {
        this.undrawQuery(activeSingleQuery);
        activeSingleQuery=null;
        emptyNode(this.container);
    }
} // tableView

function tableDoubleClick(event) 
{
    var target = getTarget(event);
    var tname = target.tagName;
    var aa = getAbout(kb, target);
    tabulator.log.debug("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName)
    if (!aa) return;
    GotoSubject(aa);
}

function exportTable()
{
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