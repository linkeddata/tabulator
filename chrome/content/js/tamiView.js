/**@class The SampleView class highlights all functions and fields that
 * are required for a valid tabbed view in the tabulator.
 * @constructor
 */
function TamiView(container) {

    /**queryStates holds the individual state of each query that the view can
     * currently display.  Values in queryStates should be indexed by query
     * id number.  The possible values for a query are 0=inactive, 1=active,
     * and 2=greyed out.*/
    this.queryStates=[];
    
    /**container holds the div element that this view is meant to be displayed
     * in.  It is worth noting, for clarity's sake, that this should be used as
     * this.container, not just container, since it is a field in the view 
     * class.*/
    this.container=container;
    
    /**name holds the name of this view.  Just give it a relevant name.*/
    this.name="Tami";

    /***************************************/
    /**Create the layout for the TAMI view*/
    
    /**Top level divs*/
    this.headingDiv=document.createElement('div');
    this.logDiv=document.createElement('div');
    this.policyDiv=document.createElement('div');
    this.actionsDiv=document.createElement('div');
    this.viewDiv=document.createElement('div');
    
    /**Elements*/
    this.header=document.createElement('h1');
    this.logLbl=document.createElement('label');
    this.policyLbl=document.createElement('label');
    this.logTxt=document.createElement('input');
    this.policyTxt=document.createElement('input');
    this.logBtn=document.createElement('input');
    this.policyBtn=document.createElement('input');
    this.chkComplianceBtn=document.createElement('input');
    this.outputArea=document.createElement('textarea');

    /**Add the text to the elements*/
    this.header.appendChild(document.createTextNode('TAMI Sand Box'));
    this.logLbl.appendChild(document.createTextNode('Log URI: '));
    this.policyLbl.appendChild(document.createTextNode('Policy URI: '));

    /**Set the properties of the individual elements*/
    this.logTxt.setAttribute('type','Text');
    this.logTxt.setAttribute('size','80');
    this.logBtn.setAttribute('type','Button');
    this.logBtn.setAttribute('value','Fetch Log and Edit');
    this.logBtn.style.margin='5px';
    this.policyTxt.setAttribute('type','Text');
    this.policyTxt.setAttribute('size','80');
    this.policyBtn.setAttribute('type','Button');
    this.policyBtn.setAttribute('value','Fetch Policy and Edit');
    this.policyBtn.style.margin='5px';
    this.chkComplianceBtn.setAttribute('type','Button');
    this.chkComplianceBtn.setAttribute('value','Check Compliance');
    this.chkComplianceBtn.style.margin='5px';
    this.outputArea.setAttribute('id','outputArea')
    this.outputArea.rows=16;
    this.outputArea.style.width="100%";

    /**Append all the elements to the top level divs*/
    this.headingDiv.appendChild(this.header);
    this.logDiv.appendChild(this.logLbl);
    this.logDiv.appendChild(this.logTxt);
    this.logDiv.appendChild(this.logBtn);
    this.policyDiv.appendChild(this.policyLbl);
    this.policyDiv.appendChild(this.policyTxt);
    this.policyDiv.appendChild(this.policyBtn);
    this.actionsDiv.appendChild(this.chkComplianceBtn);
    this.viewDiv.appendChild(this.outputArea);
    
    /**Finally, append everything to the container*/
    this.container.appendChild(this.headingDiv);
    this.container.appendChild(this.logDiv);
    this.container.appendChild(this.policyDiv);
    this.container.appendChild(this.actionsDiv);
    this.container.appendChild(this.viewDiv);

    /**End of Layout*/
    /***************************************/

    //Javascript is strange:
    var thisTAMIView = this;
    /**Fetches the log*/
    this.logBtn.onclick = function () {
        //TODO Edit the log
        return thisTAMIView.getResource(thisTAMIView.logTxt.value);
    }

    /**Fetches the policy*/
    this.policyBtn.onclick = function () {
        //TODO Edit the policy
        return thisTAMIView.getResource(thisTAMIView.policyTxt.value);
    }

    /**Runs the scheme code behind and shows the output in the tabulator*/
    this.chkComplianceBtn.onclick = function () {
        
        var xhr = Util.XMLHTTPFactory();
        xhr.onreadystatechange = function() {
            //TODO display the annotated transcation log (but where?)
        }
        
        var url = "http://swiss.csail.mit.edu/projects/tami/air-demo-results.ssp?log=" + escape(thisTAMIView.logTxt.value) 
                    +"&policy=" + escape(thisTAMIView.policyTxt.value);
        xhr.open("GET", url, true);
        xhr.send(null);

    }

	this.getResource = function (s) {
        document.getElementById("UserURI").value=s;
        outline.GotoFormURI();
	}    

    /**this.drawQuery takes in a query and then draws that query into the
     * container in the proper way for this view.  It should also set
     * the query's value in queryStates[q.id] to reflect that it is now
     * displayed.*/
    this.drawQuery = function(q) {
        this.container.appendChild(document.createTextNode('Drawing query with id '+q.id+' and name '+q.name));
        this.queryStates[q.id]=1;
    }

    /**this.undrawQuery removes a query from the display.  It is up to the
     * view's author whether or not the data for the data should be discarded,
     * but I suggest that it be discarded, since this gives checking and
     * unchecking the effect of "refreshing" the query.*/
    this.undrawQuery = function(q) {
        if(this.queryStates[q.id]==1) {
            this.container.appendChild(document.createTextNode('Undrawing query with id '+q.id));
            this.queryStates[q.id]=0;
        }
    }

    /**this.addQuery adds a query to the view's queryStates.  There may also
     * be some kind of preprocessing involved with this, but I would not
     * recommend it since too much preprocessing without the user requesting
     * a view to be displayed will cause unnecessary lag.*/
    this.addQuery = function(q) {
        this.container.appendChild(document.createTextNode('Adding query with id '+q.id));
        this.queryStates[q.id]=0;
    }

    /**this.removeQuery should undraw the query (Or at least, I can't think of
     * a valid scenario where that wouldn't be the case), and then delete the
     * query's value from the queryStates array.*/
    this.removeQuery = function(q) {
        this.container.appendChild(document.createTextNode('Removing query with id '+q.id));
        if(this.queryStates[q.id]!=null) {
            this.undrawQuery(q);
            delete this.queryStates[q.id];
        }
    }
}
