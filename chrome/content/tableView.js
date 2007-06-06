function tableView(container) {

    //The necessary vars for a View...
    this.name="Table";        //Display name of this view.
    this.queryStates=[];          //All Queries currently in this view.
    this.container=container; //HTML DOM parent node for this view.
    this.container.setAttribute('ondblclick','tableDoubleClick(event)')

    //The vars specific to a tableView..
    var activeSingleQuery = null;

    this.drawQuery = function (q) {
        this.onBinding = function (bindings) {
            tinfo("making a row w/ bindings " + bindings);
            var i, tr, td
            tr = document.createElement('tr')
            t.appendChild(tr)
            for (i=0; i<nv; i++) {
                v = q.vars[i]
                tr.appendChild(matrixTD(bindings[v]))
            } //for each query var, make a row
        }

        var i, nv=q.vars.length, td, th, j, v
        var t = document.createElement('table')

        tr = document.createElement('tr')
        t.appendChild(tr)
        t.setAttribute('class', 'results sortable')
        t.setAttribute('id', 'tabulated_data'); //needed to make sortable
        emptyNode(this.container).appendChild(t) // See results as we go
        for (i=0; i<nv; i++) {
            v = q.vars[i]
            //fyi("table header cell for " + v + ': '+v.label)
            th = document.createElement('th')

            th.appendChild(document.createTextNode(v.label))
            tr.appendChild(th)
        }
        drawExport();
        kb.query(q, this.onBinding, myFetcher);
        activeSingleQuery = q;
        this.queryStates[q.id]=1;
        sortables_init();
    } //this.drawQuery
	
	function drawExport ()
	{
		var form=document.createElement('form')
		form.setAttribute('textAlign','right');
	    var but = document.createElement('input')
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
