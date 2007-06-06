function sparqlView(container) {

    //The necessary vars for a View...
    this.name="SPARQL";        //Display name of this view.
    this.queryStates=[];          //All Queries currently in this view.
    this.container=container; //HTML DOM parent node for this view.
    //this.container.setAttribute('ondblclick','tableDoubleClick(event)')
    //qs.addQuery()
    
    this.container.setAttribute('id','SPARQLText')    	
    this.textForm=document.createElement('form');
    this.textArea=document.createElement('textarea');
    this.textArea.setAttribute('id','SPARQLTextArea')
    this.textArea.rows=25;
    this.textArea.style.width="100%";
    this.myButton=document.createElement('input');
    this.myButton.setAttribute('type','Button');
    this.myButton.setAttribute('value','Submit SPARQL');
    this.myButton.style.margin='5px'
    this.saveButton=document.createElement('input');
    this.saveButton.setAttribute('type','Button');
    this.saveButton.setAttribute('value','Get link to selected query');
    this.saveButton.style.margin='5px'
    this.linkArea=document.createElement('textarea');
    this.linkArea.setAttribute('id','SPARQLLink')
    this.linkArea.rows=1;
    this.linkArea.style.width="100%";
    this.linkArea.style.display="none";
    this.textForm.appendChild(this.textArea);
    this.textForm.appendChild(this.myButton);
    this.textForm.appendChild(this.saveButton);
    this.textForm.appendChild(this.linkArea);
    this.container.appendChild(this.textForm);
	
	this.activeQuery=null;
    //Javascript is strange:
    var thisSPARQLView = this
    this.myButton.onclick = function () {
        return thisSPARQLView.qSPARQLText();
    }
    
    var thisSPARQLView = this;
    this.saveButton.onclick = function () {
        return thisSPARQLView.sparqlLink();
    }

    this.drawQuery = function(q) {
 		    this.textArea.value=queryToSPARQL(q);
 		    for (x in this.queryStates)
 		    	if (this.queryStates[x]==1) this.queryStates[x]=0;
 		    this.activeQuery=q;
 		    this.queryStates[q.id]=1;
    }
    
    this.undrawQuery = function(q) {
        this.textArea.value=""
        this.queryStates[q.id]=0;
	  }
    
    this.addQuery = function (q) {
 /*   	if (this.activeQuery)  this.queryStates[q.id]=0;
 		else {
 			this.queryStates[q.id]=1;
        	this.drawQuery(q);
        	this.activeQuery = q;
        }
 	*/	this.queryStates[q.id]=0
    } //this.addQuery

    this.removeQuery = function (q) {
    	if (this.queryStates[q.id]==1) this.undrawQuery(q);
    	if (this.activeQuery && q.id == this.activeQuery.id) this.activeQuery=null;
    	delete this.queryStates[q.id];
        return;
    }

	this.qSPARQLText = function () {
		var txt=this.textArea.value;
		//alert(txt);
		var q=SPARQLToQuery(txt);
		qs.addQuery(q);
	    sortables_init(); //make table headers sortable
	}    
	
	this.sparqlLink = function () {
		if (!this.activeQuery) { alert("You must select a query, or submit your SPARQL query, before creating a link."); return;}
		var txt=queryToSPARQL(this.activeQuery)
		txt=txt.replace(/\n/g," ")
		txt=window.escape(txt)
		txt=txt.replace(/%20/g,"+");
		txt=txt.replace(/\+\++/g,"+");
		var parMark=(location.href.indexOf('?')==-1)?'?':'&'
		txt = location.href+parMark+"query="+txt+"&sname="+this.activeQuery.name
		thisSPARQLView.linkArea.style.display =""
		thisSPARQLView.linkArea.value = txt
	}
} // sparqlView
