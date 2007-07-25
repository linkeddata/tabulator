// Last Modified By: David Li

// Places generating SPARQL Update: onEdit and tableEditOnBlur
// SPARQL update should work for literal nodes that don't have a language spec
// multiple languages are not handled

// Method
// - when TDs are being created, attach to each TDs the subject and predicate
// - when edits occur (onEdit), reconstruct the statement; the why is the same as the subject since we only edit literal nodes
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
    this.name="Table";              //Display name of this view.
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

                // generate the subject and predicate for each tdNode 
                //**** td node creation ****//
                for (j = 0; j<numStats; j++) {
                    testStatement = q.pat.statements[j]; // <#subj> <#pred> ?v0 .
                    reSpace = / /;
                    arrayStatement = testStatement.toString().split(reSpace); // [<#subj>, <#subj>, ?v0, .]
                    if (arrayStatement[2] == v) {
                        arrayStatementForMatrixTD = [arrayStatement[0], arrayStatement[1], bindings[v]];
                        if (arrayStatement[0][0] == '?') {
                            // arrayStatement: [?v0, <#pred>, ?v1, .]
                            arrayStatementForMatrixTD[0] = bindings[arrayStatement[0]];
                        }
                        break;
                    }
                }
                //**** End td node creation ****//

                tr.appendChild(matrixTD(arrayStatementForMatrixTD));
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
        
        // Table Edit Code
        t.addEventListener('click', onClickCell, false);
        numCols = nv;
        
        // key mvmt activation code
        var a = document.createElement('a');
        th.appendChild(a); 
        a.setAttribute('id', 'anchor');
        a.focus();
        numRows = t.childNodes.length;
    }
    //***************** End drawQuery *****************//

    //***************** Table Editing *****************//

    var selectedTD;
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
    function makeKeyHandler(node) 
    {
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
        if (a != null) { a.parentNode.removeChild(a); };
        var t = document.getElementById('tabulated_data');
        t.removeEventListener('keypress', keyHandler, false);
        node.style.backgroundColor = 'white';
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
        if (!literalTD(node)) {setSelected(node); return; }
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
        
        //**** sparqlUpdate ****//
        // since we're only editing the literal nodes, the subject
        // and why are the same, except maybe for the #
        var s = node.getAttribute('s');
        var p = node.getAttribute('p');
        var o = node.getAttribute('o');
        
        // var st = kb.anyStatementMatching(
        // kb.sym(convertToURI(s)),
        // kb.sym(convertToURI(p)),
        // kb.literal(o, ''))
        //if (!st)  alert ('no statement for '+s+p+o); or throw
        //var why = st.why;
        //if (!why) alert ("Unknown provenence for {"+s+p+o+"}");
        
        // lastModifiedStat= new RDFStatement(
        // kb.sym(convertToURI(s)), 
        // kb.sym(convertToURI(p)), 
        // kb.literal(o, ''),
        // kb.sym(why))
        
        // sparqlUpdate = new sparql(kb).prepareUpdate(lastModifiedStat);
        // more in tableEditOnBlurWrap
        //**** End sparqlUpdate ****//

        inputObj.addEventListener ("blur", tableEditOnBlurWrap(node), false);
        inputObj.addEventListener ("keypress", tableEditOnKeyPressWrap(node), false);
    }
    
    function tableEditOnBlurWrap(node)
    {
        return function tableEditOnBlur(e)
        {
            var srcElem = e.target;  // getTarget(e)
            newTxt = srcElem.value;
            
            if (newTxt != '') {
                node.innerHTML = newTxt;
            }
            else {
                node.innerHTML = '---';
            }
            
            var col = node.cellIndex;
            var row = node.parentNode.rowIndex;
            setSelected(node);
            e.stopPropagation();
            e.preventDefault();
            
            //**** sparqlUpdate ****//
            //sparqlUpdate.setObject(kb.literal(newTxt, ''));
            //**** End sparqlUpdate ****//
        }
    }
    
    function tableEditOnKeyPressWrap(node) 
    {
        return function tableEditOnKeyPress(e) 
        {
            if (e.keyCode == 13) { //enter
                tableEditOnBlurWrap(node)(e);
            }
            if (e.keyCode == 27) { //esc
                tableEditOnBlurWrap(node)(e);
            }
        }
    }
   
    //***************** End Table Editing *****************//
        
    //***************** Add Row *****************//
    
    // has no about attribute = literal 
    function literalTD (tdNode) {
        if (tdNode.getAttributeNode('about')==undefined) return true; 
    }
    
    // checks using row, col specs
    function literalRC (row, col) {
        var t = thisTable.document.getElementById('tabulated_data'); 
        var tdNode = t.childNodes[row].childNodes[col];
        if (literalTD (tdNode)) return true;
    } 

    function bnodeTD (tdNode) {
        //if(tdNode.getAttribute('about')[0]=='_') return true;
    } 
    
    function bnodeRC (row, col) {
        var t = thisTable.document.getElementById('tabulated_data');
        var tdNode = t.childNodes[row].childNodes[col];
        if (bnodeTD (tdNode)) return true;
    }

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
    // use kb.sym for symbols
    // use kb.bnode for blank nodes
    // use kb.literal for literal nodes 
    function addRow () 
    {
        var i;
        var td;
        var tr = thisTable.document.createElement('tr');
        var t = thisTable.document.getElementById('tabulated_data');
        // I need to add the s, p, o nodes
        for (i=0; i<numCols; i++) {
            if (literalRC(1, i)) {
                td = createLiteralTD(); 
                //refNode = getTDNode(1, i);
                //td.setAttribute('s', refNode.getAttribute('s'));
                //td.setAttribute('p', refNode.getAttribute('p')); 
                //td.setAttribute('o', refNode.getAttribute('o'));
            }
            else if (bnodeTD(1, i)) {
                td = createBNodeTD(); 
                //refNode = getTDNode(1, i);
                //td.setAttribute('s', refNode.getAttribute('s'));
                //td.setAttribute('p', refNode.getAttribute('p')); 
                //td.setAttribute('about', refNode.getAttribute('about'));
            }
            else { 
                td = createSymbolTD(); 
                //refNode = getTDNode(1, i);
                //td.setAttribute('s', refNode.getAttribute('s'));
                //td.setAttribute('p', refNode.getAttribute('p')); 
                //td.setAttribute('about', refNode.getAttribute('about'));
            }
            tr.appendChild(td);
        }
        t.appendChild(tr);
    }
    
    function createLiteralTD() 
    {
        var td = thisTable.document.createElement("TD");
        td.innerHTML = '---';
        return td;
    }
    
    function createSymbolTD() 
    {
        var td = thisTable.document.createElement("TD");
        td.setAttribute('about', '');
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "<form> <select style=\'width:100%\'> <option> --- </option> </select> </form>";
        // SET ATTRIBUTES HERE;
        return td;
    }

    function createBNodeTD() {
        var td = thisTable.document.createElement('TD');
        bnode = kb.bnode();
        td.setAttribute('about', bnode.toNT());
        td.setAttribute('style', 'color:#4444ff');
        td.innerHTML = "<form> <select style=\'width:100%\'> <option> nonliteral </option> </select> </form>";
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
    var t = document.getElementById('tabulated_data');
    var allRows = t.childNodes;
    var colNum = src.parentNode.cellIndex;
    var firstRow = allRows[0];
    var refCol = firstRow.cells[colNum+1];
    
    for (var i = 0; i<allRows.length; i++) {
        allRows[i].cells[colNum].style.display = 'none';
    }
    
    var img = document.createElement('img');
    img.setAttribute('src', 'icons/tbl-expand.png');
    img.setAttribute('align', 'left');
    img.addEventListener('click', tableExpandWrap(src), false)
    //img.setAttribute('onclick', 'tableExpand(this)');
    refCol.insertBefore(img, refCol.firstChild);
}

function tableExpandWrap(src) {
    return function tableExpand(e) {
        var t = document.getElementById('tabulated_data');
        var allRows = t.childNodes;
        var colNum = src.parentNode.cellIndex;
        var firstRow = allRows[0];
        var refCol = firstRow.cells[colNum+1];
        
        for (var i = 0; i<allRows.length; i++) {
            allRows[i].cells[colNum].style.display = 'inline';
        }
        
        refCol.removeChild(refCol.firstChild);
    }
}
//closeQueryButton.style.border='solid #777 1px';
