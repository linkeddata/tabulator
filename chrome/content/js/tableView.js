// Places generating SPARQL Update: onEdit and tableEditOnBlur
// SPARQL update should work for literal nodes that don't have a language spec
// multiple languages are not handled

// Method
// - when TDs are being created, attach to each TDs the subject and predicate
// - when edits occur (onEdit), reconstruct the statement and send that to the sparqlUpdate object
// - the why is the same as the subject since we only edit literal nodes
// - when edits are done (tableEditOnBlur), send the newTxt with setObject
// - there are no pointers to things in the original store

function tableView(container,doc) 
{
    /*if(isExtension) {
        tabulator = Components.classes["dig.csail.mit.edu/tabulator;1"].
            getService(Components.interfaces.nsISupports).wrappedJSObject;
        //wrap sparql update code with if(isExtension).
        //tabulator.sparql.*;  //see js/sparqlUpdate.js
    }*/
    //tabulator.log.test('Entered tableView');
    var numRows; // assigned in makeKeyHandler, includes header
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
    //tabulator.log.test('Entered drawQuery');
        this.onBinding = function (bindings) 
        {
            //tabulator.log.test('Entered onBinding');
            var i, tr, td;
            //tabulator.log.info('making a row w/ bindings ' + bindings);
            tr = thisTable.document.createElement('tr');
            t.appendChild(tr);
            numStats = q.pat.statements.length; // Added
            for (i=0; i<nv; i++) {
                v = q.vars[i];

                // generate the subject and predicate for each tdNode in the tableView for a statement for sparqlUpdate
                //**** td node creation ****//
                for (j = 0; j<numStats; j++) {
                testStatement = q.pat.statements[j];
                reSpace = / /;
                arrayStatement = testStatement.toString().split(reSpace);
                if (arrayStatement[2] == v) {
                    arrayStatementForMatrixTD = [arrayStatement[0], arrayStatement[1], bindings[v]];
                    if (arrayStatement[0][0] == '?') {
                        // arrayStatement of form: [?v0, <#tab>, ?v1]
                        arrayStatementForMatrixTD[0] = bindings[arrayStatement[0]];
                    }
                    break;
                }
                }
                //**** End td node creation ****//

                tr.appendChild(matrixTD(arrayStatementForMatrixTD)); // Changed
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
        
/*         function deleteColumn(src) {

// I need an array of all the rows in the table, use the table ID
// I need the row number of the cell that was clicked
    var allRows= document.getElementById('tabulated_data').rows;
    var colNum = src.parentNode.cellIndex
    
    for (var i=0; i<allRows.length; i++) {
        allRows[i].deleteCell(colNum);
    }
} */
        
        
        var th;
        for (i=0; i<nv; i++) {
            v = q.vars[i];
            tabulator.log.debug("table header cell for " + v + ': '+v.label)
            th = thisTable.document.createElement('th');
            text = document.createTextNode(v.label + '<img src=\'icons/tbl-x-small.png\' onclick=\'deleteColumn(this)\'></img>')
            
            sp = document.createElement('div');
            //span.addEventListener('click', deleteColumn(e), false);
            
            th.appendChild(text);
            tr.appendChild(th);
        }
        
        
        kb.query(q, this.onBinding);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        
        drawExport();
        drawAddRow();
        sortables_init();
        
        // Table Edit Code
        t.addEventListener('click', onClickCell, false);
        numCols = nv;
        
        //********** key mvmt activation code *********//
        var a = document.createElement('a');
        th.appendChild(a); 
        a.setAttribute('id', 'anchor');
        a.focus();
        //********** End key mvmt activation code *****//
    }
    //***************** End drawQuery *****************//

    //***************** Table Editing *****************//

    var selectedTD; // null to selectedTD whenever clearSelected is called?
    var keyHandler;
    
    function onClickCell(e) 
    {
        if (selectedTD != null) clearSelected(selectedTD);
        var node = e.target;
        if (node.firstChild && node.firstChild.tagName == "INPUT") return;
        setSelected(node);
        var t = document.getElementById('tabulated_data');
        numRows = t.childNodes.length;
    }
    
    function getRowIndex(node)
    { 
        var trNode = node.parentNode;
        var rowArray = trNode.parentNode.childNodes;
        var rowArrayLength = trNode.parentNode.childNodes.length;
        for (i = 1; i<rowArrayLength; i++) {
            if (rowArray[i].innerHTML == trNode.innerHTML) return i;
        }
    }
    
    // use this wrapper so that the node can be passed to the event handler
    function makeKeyHandler(node) {
        return function keyHandler(e) 
        {
            var oldRow = getRowIndex(node); //includes header
            var oldCol = node.cellIndex;
            var t = document.getElementById('tabulated_data');
            clearSelected(node);
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
                onEdit(node);
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
        // focus fix: add an anchor node, focus on it, then remove the anchor
        var a = document.createElement('a');
        a.setAttribute('id', 'focustest');
        node.appendChild(a);
        a.focus();

        var t = document.getElementById('tabulated_data');
        keyHandler = makeKeyHandler(node);
        t.addEventListener('keypress', keyHandler, false);
        node.style.backgroundColor = "#8F3";
        
        selectedTD = node;
        selectedTD.addEventListener('click', onCellClickSecond, false);
    }
    
    function onCellClickSecond(e)
    {
        selectedTD.removeEventListener('click', onCellClickSecond, false); 
        // this is odd, but it works
        if (e.target == selectedTD) {
            clearSelected(selectedTD);
            onEdit(selectedTD);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    
    function clearSelected(node)
    {
        var a = document.getElementById('focustest');
        if (a != null) {a.parentNode.removeChild(a);};
        var t = document.getElementById('tabulated_data');
        t.removeEventListener('keypress', keyHandler, false);
        node.style.backgroundColor = 'white';
        // include this?
        // selectedTD.RemoveEventListener('click', onCellClickSecond, false);
    }

    var lastModifiedStat;
    var sparqlUpdate;
    
    function convertToURI(x) { // x = <http://test>
        if (x[0] = '<') {
            return x.toString().match(/[^<].*[^>]/)[0];
        } else {return x;}
    }
    
    function convertToSymbol(x) { // x = <http://test>
        uri = convertToURI(x);
        return kb.sym(uri);
    }
    
    function convertToLiteral(x) { // x = "David Li"
        return kb.literal(x, ''); // parser requires second arg
        // Handle other languages here
    }
    
    function onEdit(node)
    {
        if (literalTD(node)) {setSelected(node); return; }
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
        } else { // node of the form <td />
            var parent = node.parentNode;
            var newTD = thisTable.document.createElement('TD');
            parent.replaceChild(newTD, node);
            newTD.appendChild(inputObj);
        }
        
        //**** sparqlUpdate code ****//
        // since we're only editing the literal nodes, the subject
        // and why are the same, except maybe for the #
        lastModifiedStatement= new RDFStatement(
        kb.sym(convertToURI(node.getAttribute('s'))), 
        kb.sym(convertToURI(node.getAttribute('p'))), 
        kb.literal(oldTxt, ''),
        kb.sym(convertToURI(node.getAttribute('s'))))
        
        sparqlUpdate = new sparql(kb).prepareUpdate(lastModifiedStatement);
        // more in tableEditOnBlurWrap
        //**** sparqlUpdate code ****//

        inputObj.addEventListener ("blur", tableEditOnBlurWrap(node), false);
        inputObj.addEventListener ("keypress", tableEditOnKeyPressWrap(node), false);
    }
    
    function tableEditOnBlurWrap(node)
    {
        return function tableEditOnBlur(e)
        {
            var srcElem = e.target;  // getTarget(e)
            newTxt = srcElem.value;
            node.innerHTML = newTxt;

            var col = node.cellIndex;
            var row = node.parentNode.rowIndex;
            setSelected(node);
            // Add code here to handle SPARQL query.  
            // Make a call to clearInputAndSave.
            e.stopPropagation();
            e.preventDefault();
            
            //**** sparqlUpdate ****//
            sparqlUpdate.setObject(kb.literal(newTxt, ''));
            //**** sparqlUpdate ****//
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
    
    // checks to see if a TD element has the about attribute to determine if it is a literal node
    function literalTD (tdNode) 
    {
        if (tdNode.getAttributeNode('about') != null) return true; 
    }
    
    // same as the above except it checks using row, col specifications
    function literalRC (row, col) 
    {
        var t = thisTable.document.getElementById('tabulated_data'); 
        var tdNode = t.childNodes[row].childNodes[col];
        if (literalTD (tdNode)) return true;
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
            if (literalRC(numRows-1, i)) 
                td = createNonLiteralTD();
            else 
                td = createLiteralTD();
            tr.appendChild(td);
        }
        t.appendChild(tr);
    }
    
    function createLiteralTD() 
    {
        var td = thisTable.document.createElement("TD");
        td.innerHTML = " ";
        return td;
    }
    
    function createNonLiteralTD() 
    {
        var td = thisTable.document.createElement("TD");
        td.setAttribute('about', '');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "<form> <select style=\'width:100%\'> <option> nonliteral </option> </select> </form>";
        // SET ATTRIBUTES HERE;
        return td;
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

function deleteColumn (src) {
    var allRows = document.getElementById('tabulated_data').childNodes;
    var colNum = src.parentNode.cellIndex;
    
    for (var i = 0; i<allRows.length; i++) {
        allRows[i].deleteCell(colNum);
    }
}