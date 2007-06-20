// original document written by: ?
// table editing added by: David Li

function tableView(container,doc) {
    this.document=null;
    if(doc)
      this.document=doc;
    else
      this.document=document;
    //The necessary vars for a View...
    this.name="Table";        //Display name of this view.
    this.queryStates=[];          //All Queries currently in this view.
    this.container=container; //HTML DOM parent node for this view.
    this.container.setAttribute('ondblclick','tableDoubleClick(event)')
    // this.container.setAttribute('onclick', 'onClickCell');
    //alert(container.parentNode.innerHTML);

    //alert (document.getElementsByName("Table"))
    //The vars specific to a tableView..
    var activeSingleQuery = null;
    // q is a query object
    this.drawQuery = function (q) {
        this.onBinding = function (bindings) {
            var i, tr, td;
            tinfo("making a row w/ bindings " + bindings);
            tr = this.document.createElement('tr');
            t.appendChild(tr);
            for (i=0; i<nv; i++) {
                v = q.vars[i];
                //alert("calling matrixTD");
                //alert(matrixTD(bindings[v]).innerHTML);
                //alert(bindings[v].termType);
                tr.appendChild(matrixTD(bindings[v]));
            } //for each query var, make a row
        }
        var i, nv=q.vars.length, td, th, j, v;
        var t = this.document.createElement('table');
        var tr = this.document.createElement('tr');
        
        t.appendChild(tr);
        t.setAttribute('class', 'results sortable'); //changed back to 'results sortable'!?
        t.setAttribute('id', 'tabulated_data'); //needed to make sortable
        emptyNode(this.container).appendChild(t); // See results as we go
        for (i=0; i<nv; i++) {
            v = q.vars[i]; //'v0?'
            //alert(q.vars);
            //alert(q);
            //alert(v);
            //alert(v.label);
            //fyi("table header cell for " + v + ': '+v.label)
            th = this.document.createElement('th');
            th.appendChild(this.document.createTextNode(v.label));
            tr.appendChild(th);
        }
        drawExport();
        //alert(kb.query(q, this.onBinding, myFetcher));
        kb.query(q, this.onBinding, myFetcher);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        sortables_init();
        
        // alert (container.innerHTML);
        // This is the eventListener for Table Editing
        document.getElementById('tabulated_data').addEventListener('click', onClickCell, false);

        function onClickCell(e) {
            srcElem = getTarget(e);
            if (srcElem.tagName == "TH") return;
            else onEdit(e);
        }

        //Use getTdNode to avoid div and span elements
        function gettdNode(e) {
            var srcElem = getTarget(e);
            var tdNode = ancestor(srcElem, "TD");
            return tdNode;
        }

        function onEdit(e) {
            var tdNode = gettdNode(e);
            //alert(tdNode.className);
            var oldTxt = tdNode.innerHTML;
            var inputObj = document.createElement('INPUT');
            if (tdNode.className != 'editable') return;
            if (tdNode.firstChild && tdNode.firstChild.tagName == "INPUT") return;
            inputObj.style.width = "99%";
            inputObj.value = oldTxt;
            inputObj.type = "TEXT";
            inputObj.addEventListener ("blur", focusLost, false);
            inputObj.addEventListener ("keypress", checkForEnter, false);
            tdNode.replaceChild(inputObj, tdNode.firstChild);
            inputObj.select();
        }

        function focusLost(e) {
            var objSrcElm = getTarget(e);
            objSrcElm.parentNode.innerHTML = objSrcElm.value;
            //Add code here to handle SPARQL query.  Make a call to clearInputAndSave.  
        }

        function checkForEnter(e) {
            if (e.keyCode == 13) focusLost (e);
        }
    } //this.drawQuery

    function drawExport () {
        var form=this.document.createElement('form')
        form.setAttribute('textAlign','right');
        var but = this.document.createElement('input')
        but.setAttribute('type','button')
        but.setAttribute('id','exportButton')
        but.onclick=exportTable // they should all be like this?
        but.setAttribute('value','Export to HTML')
        form.appendChild(but)
        container.appendChild(form);
    }

    this.undrawQuery = function(q) {
        if(q===activeSingleQuery) {
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
} // tableView

function tableDoubleClick(event) {
    var target = getTarget(event)
    var tname = target.tagName
    fyi("TabulatorDoubleClick: " + tname + " in "+target.parentNode.tagName)
    var aa = getAbout(kb, target)
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
    var tbl=this.document.getElementById('tabulated_data');
    win.document.write('<TABLE>');
    for(j=0;j<tbl.childNodes[0].childNodes.length;j++)
    {
	win.document.write('<TH>'+ts_getInnerText(tbl.childNodes[0].cells[j])
			   +'</TH>')
    }
    for(i=1;i<tbl.childNodes.length;i++)
    {
	var r=tbl.childNodes[i]
	win.document.write('<TR>')
	var j
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
    /*			break;
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