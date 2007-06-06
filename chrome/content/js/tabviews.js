
/**The TabbedContainer object is a QueryListener.  It can be added as a
 *listener to a querySource object in order to receive relevant queries
 *from that object.
 *@constructor
 *@author jambo
 */
function TabbedContainer(source) {
    /** The QuerySource for this tabbedContainer.*/
    this.source=source;
    /** A set of the tabs and their associated view objects.*/
    this.tabControls=[];
    /** A set of checkboxes/radiobuttons corresponding to queries.*/
    this.queryControls=[];
    /** Contains a reference to the view class currently being displayed.*/
    this.activeView=null;

    var openQueryButton, closeQueryButton;
    function initQueryBarButtons() {
        closeQueryButton=document.createElement('img');
        openQueryButton =document.createElement('img');
        openQueryButton.src='icons/tbl-expand.png';
        openQueryButton.style.border='solid #777 1px';
        openQueryButton.title='Show Query Bar';
        openQueryButton.onclick=function () { return displayQueryColumn(); };
        closeQueryButton.src='icons/tbl-x-small.png';
        closeQueryButton.style.border='solid #777 1px';
        closeQueryButton.title='Hide Query Bar';
        closeQueryButton.onclick=function () { return suppressQueryColumn(); };
        document.getElementById('openQuerySpan').appendChild(openQueryButton);
        document.getElementById('closeQuerySpan').appendChild(closeQueryButton);
        closeQueryButton.style.margin='3px';
        openQueryButton.style.margin='3px';
        openQueryButton.style.display='none';
    }
    initQueryBarButtons();

    /**this.addQuery goes through the entire array of tabControls and adds the
     *query q to each.  It also creates a checkbox associated with the query.
     *@param q The query to be added.*/
    this.addQuery = function(q) {
        var i;
        //Generate a new queryControl (checkbox+name)
        var control = new checkboxControl(q, this);
        this.queryControls[q.id]=control;
        document.getElementById('queryChoices').appendChild(control.div);

        //Let all views know that this query exists.
        for(i=0; i<this.tabControls.length; i++) {
            if(this.tabControls[i]!=null)
                this.tabControls[i].view.addQuery(q);
        }
    };
    /**remove the query from this TabbedContainer and all of its underlying
     * views.  Also deletes the checkbox.
     * @param q The query to be removed.*/
    this.removeQuery = function(q) {
        var i;
        //remove query from all views.
        for(i=0; i<this.tabControls.length; i++) {
            if(this.tabControls[i]!=null)
                this.tabControls[i].view.removeQuery(q);
        }

        //remove checkbox.
        if(this.queryControls[q.id]!=null) {
            document.getElementById('queryChoices').removeChild(this.queryControls[q.id].div);
            delete this.queryControls[q.id];
        }
    }

    /**adds a view of type viewType (pass the class), and optionally sets it up
     * to handle multiple queries, depending on the value of isMultiView.
     * a new tab and container are created for the view.
     * @param viewType The class name of the view to be added.
     * @param isMultiView A boolean flag that determines if a view can handle multiple queries.
     * @param permanent A boolean flag that makes a view unremovable iff permanent==true*/
    this.addView = function(viewType, isMultiView, permanent) {
        var tabsDiv = document.getElementById("tabs");
        var wins = document.getElementById("viewWindows");

        var control;
        var cont = document.createElement("div");
        wins.appendChild(cont);
        var tempView = new viewType(cont);
        var index=this.tabControls.length;

        var newTab = document.createElement("a");
        newTab.setAttribute("class", "inactive");
        newTab.appendChild(document.createTextNode(tempView.name));
        if(!permanent) {
          // add a little 'x' to remove this view
          newTab.removeButton = newTab.appendChild(document.createElement('img'));
  
          newTab.removeButton.setAttribute('src', 'icons/tbl-x-small.png');
          newTab.removeButton.setAttribute('title', 'Close View.');
          newTab.removeButton.setAttribute('type', 'button');
          newTab.removeButton.style.border='solid';
          newTab.removeButton.style.borderWidth = '1px';
   
          newTab.removeButton.style.cursor='pointer';
          newTab.removeButton.style.padding='0';
   
          var foo = this; // is there a better way?
          newTab.removeButton.onclick = function(e){foo.removeView(tempView);};
        }
  
        if (isMultiView!=null && isMultiView)
            control = new tabControl(newTab, tempView, true);
        else
            control = new tabControl(newTab, tempView, false);

        var thisContainer = this;
        newTab.onclick=function () {
            return thisContainer.makeActive(control);
        }


        tabsDiv.appendChild(newTab);

        cont.style.width = "100%";
        cont.style.height= "100%";

        this.tabControls.push(control);
        if (this.tabControls.length == 1) {  //This is the first (default) view.
            this.makeActive(this.tabControls[0]);
        } else {
            cont.style.display = "none";
        }

    }

    /**removes a view from the tab area
     * @param view The view to be removed.*/
    this.removeView = function(view) {
        var i;
        for(i=0; i<this.source.queries.length; i++) {
            if(this.source.queries[i]!=null)
                view.removeQuery(this.source.queries[i]);
        }

        for(i=0; i<this.tabControls.length; i++) {
            if(this.tabControls[i]!=null) {
                if(this.tabControls[i].view===view) {
                    view.container.parentNode.removeChild(view.container);
                    this.tabControls[i].tab.parentNode.removeChild(this.tabControls[i].tab);
                    delete this.tabControls[i];
                }
            }
        }
    }

    /**Makes a view active: sets its div style to block and sets all other divs
     * that are associated with tabs in this tabbedcontainer to display:none.
     * @param control The tab to be made active.*/
    this.makeActive = function(control) {
        var i;
        if(this.activeView!=null) {
            for(i=0; i<this.tabControls.length; i++) {
                if(this.tabControls[i]!=null && this.tabControls[i].tab.getAttribute('class')=='active') {
                    this.tabControls[i].tab.setAttribute('class','inactive');
                    this.tabControls[i].view.container.style.display='none';
                }
            }
        }

        this.activeView=control;
        control.tab.setAttribute('class','active');
        control.view.container.style.display='block';
        this.updateQueryControls(control);      
        if(control.view.onActive!=null)
            control.view.onActive();
        if(this.source.queries.length==1 && control.view.queryStates[this.source.queries[0].id]==0 &&
            !this.queryControls[0].checkbox.checked && !this.queryControls[0].checkbox.disabled) {
                this.queryControls[0].checkbox.checked=true;
                control.view.drawQuery(this.source.queries[0]);
        }
    } //this.makeActive

    /**@returns the view currently being displayed (as a tabControl object).*/
    this.getActiveView = function() {
        return this.activeView;
    }

    /**Refreshes the query controls to reflect the queryStates array of the
     * active view.
     * @param control the control corresponding to the active view tab.*/
    this.updateQueryControls= function (control) {
        if(control.isMultiView) {
            for(i=0;i<this.queryControls.length;i++) {
                if(this.queryControls[i]!=null) {
                    this.queryControls[i].checkbox.setAttribute('type','checkbox');
                    switch(control.view.queryStates[i]) {
                        case 0: this.queryControls[i].checkbox.disabled=false;
                                this.queryControls[i].checkbox.checked=false; break;
                        case 1: this.queryControls[i].checkbox.disabled=false;
                                this.queryControls[i].checkbox.checked=true; break;
                        case 2: this.queryControls[i].checkbox.checked=false;
                                this.queryControls[i].checkbox.disabled=true; break;
                        default:this.queryControls[i].checkbox.checked=false;
                                this.queryControls[i].checkbox.disabled=true; break;
                    }
                }
            }
        }                           
        else {
            var activeControl;
            for(i=0;i<this.queryControls.length;i++) {
                if(this.queryControls[i]!=null) {
                    this.queryControls[i].checkbox.setAttribute('type','radio');
                    switch(control.view.queryStates[i]) {
                        case 0: this.queryControls[i].checkbox.disabled=false;
                                this.queryControls[i].checkbox.checked=false; break;
                        //With radio buttons, having buttons that were checked
                        //when switching from another view causes problems.
                        //thus, we activate the radio button LAST.
                        case 1: activeControl=this.queryControls[i]; break;
                        case 2: this.queryControls[i].checkbox.disabled=true; break;
                        default:this.queryControls[i].checkbox.checked=false;
                                this.queryControls[i].checkbox.disabled=true; break;
                    }
                }
            }
            //NOW we set the selected radio button to be active.
            if(activeControl!=null) {
                activeControl.checkbox.disabled=false;
                activeControl.checkbox.checked=true;
            }
        }
    }//this.updateQueryControls.

    function suppressQueryColumn() {
        openQueryButton.style.display='inline';
        document.getElementById('querySelect').style.display='none';
        document.getElementById('queryTableData').style.width='0%';
        document.getElementById('viewTableData').style.width='100%';
    }

    function displayQueryColumn() {
        openQueryButton.style.display='none';
        document.getElementById('querySelect').style.display='block';
        document.getElementById('queryTableData').style.width='20%';
        document.getElementById('viewTableData').style.width='80%';
    }
}

/**A tabControl is a simple little object that contains the tab and its
 * associated view.  tabControl also contains a field isMultiView,
 * which flags whether or not this view can handle multiple queries.*/
function tabControl(tab, view, mult)
{
    this.tab = tab;
    this.view = view;
    this.isMultiView = mult;
}

/**A checkboxControl is another simple object that contains the checkbox
 * for a query, the query's name (which needs to be made editable),
 * and could contain any other options (such as "delete this query from
 * the container").*/
function checkboxControl(q, container) {
    var tempTD, table = document.createElement('table'), tr = document.createElement('tr');
    //The entire control is contained inside of a div.
    this.div=document.createElement('div');
    this.checkbox=document.createElement('input');
    this.text=document.createElement('input');
    this.text.setAttribute('type','text');
    this.deleteButton=document.createElement('input');
    this.deleteButton.setAttribute('type','button');

    if(container.getActiveView().isMultiView)
        this.checkbox.setAttribute('type','checkbox');
    else
        this.checkbox.setAttribute('type','radio');
    this.checkbox.setAttribute('name','queryControl');
    this.checkbox.setAttribute('class','queryControl');
    this.checkbox.value=q.id;

    this.text.setAttribute('class','tabQueryName');
    this.text.value=q.name;
    this.text.maxLength=32;

    this.deleteButton.setAttribute('class','delQueryButton');
    this.deleteButton.value="x";

    var thisCheckbox=this;
    this.checkbox.onclick=function() {
        return thisCheckbox.doClick();
    };

    this.text.onchange=function() {
        return thisCheckbox.updateName();
    };

    this.deleteButton.onclick=function() {
        return thisCheckbox.delQueryClick();
    };

    /**this.doClick does the proper behavior for a checkbox or a radio button
     * depending on the type of the currently active view.*/
    this.doClick = function() {
        var active=container.getActiveView();
        if(thisCheckbox.checkbox.checked==true) {
            //multiView
            if(active.isMultiView)
                active.view.drawQuery(q);
            //singleQueryView
            else {
                var i;
                for(i=0; i<active.view.queryStates.length; i++) {
                    if(active.view.queryStates[i]==1)
                    active.view.undrawQuery(container.source.queries[i]);
                }
                active.view.drawQuery(q);
            }
        }
        //unchecking in a multiView.
        else
            return active.view.undrawQuery(q);
    }
    
    this.updateName = function() {
        if(thisCheckbox.text.value=="")
            thisCheckbox.text.value="Query #"+(q.id+1);
        q.name=thisCheckbox.text.value;
    }

    this.delQueryClick = function() {
        container.source.removeQuery(q);
    }

    this.getQuery = function() {
        return q;
    }

    //don't forget to actually add the DOM elements to the div!
    this.div.setAttribute('class','checkboxDiv');
    tempTD=document.createElement('td');
    tempTD.setAttribute('class','checkboxTD');
    tempTD.appendChild(this.checkbox);
    tr.appendChild(tempTD);
    tempTD=document.createElement('td');
    tempTD.setAttribute('class','checkboxTD');
    tempTD.setAttribute('width','100%');
    tempTD.appendChild(this.text);
    tr.appendChild(tempTD);
    tempTD=document.createElement('td');
    tempTD.setAttribute('class','checkboxTD');
    tempTD.appendChild(this.deleteButton);
    tr.appendChild(tempTD);
    this.div.appendChild(tr);
}//checkboxControl


/**The DebugView is a very simplistic sample single-query view that
 * really doesn't have any big functionality other than printing
 * out a query pattern.*/
function DebugView(container) {
    /*queryStates holds the individual state of each query that the view can
     *currently display.  Values in queryStates should be indexed by query
     *id number.  The possible values for a query are 0=inactive, 1=active,
     *and 2=greyed out.*/
    this.queryStates=[];
    
    /*container holds the div element that this view is meant to be displayed
     *in.  It is worth noting, for clarity's sake, that this should be used as
     *this.container, not just container, since it is a field in the view 
     *class.*/
    this.container=container;
    
    /*this.name holds the name of this view.  Just give it a relevant name.*/
    this.name="Debug";

    /**this.drawQuery takes in a query and then draws that query into the
     * container in the proper way for this view.  It should also set
     * the query's value in queryStates[q.id] to reflect that it is now
     * displayed.*/
    this.drawQuery = function(q) {
        var i;
        this.container.appendChild(document.createTextNode('Drawing query with id '+q.id+' and name '+q.name));
        this.container.appendChild(document.createElement('br'));
        this.container.appendChild(document.createTextNode('QUERY PATTERN========='));
        this.container.appendChild(document.createElement('br'));
        for(i=0; i<q.pat.statements.length; i++) {
            this.container.appendChild(document.createTextNode('-       '+q.pat.statements[i]));
            this.container.appendChild(document.createElement('br'));
        }
        this.container.appendChild(document.createTextNode('END QUERY PATTERN====='));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=1;
    }

    /**this.undrawQuery removes a query from the display.  It is up to the
     * view's author whether or not the data for the data should be discarded,
     * but I suggest that it be discarded, since this gives checking and
     * unchecking the effect of "refreshing" the query.*/
    this.undrawQuery = function(q) {
        this.container.appendChild(document.createTextNode('Undrawing query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=0;
    }

    /**this.addQuery adds a query to the view's queryStates.  There may also
     * be some kind of preprocessing involved with this, but I would not
     * recommend it since too much preprocessing without the user requesting
     * a view to be displayed will cause unnecessary lag.*/
    this.addQuery = function(q) {
        this.container.appendChild(document.createTextNode('Adding query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.queryStates[q.id]=0;
    }

    /**this.removeQuery should undraw the query (Or at least, I can't think of
     * a valid scenario where that wouldn't be the case), and then delete the
     * query's value from the queryStates array.*/
    this.removeQuery = function(q) {
        this.container.appendChild(document.createTextNode('Removing query with id '+q.id));
        this.container.appendChild(document.createElement('br'));
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }
}

//================================
//The actual initialization code!!
//================================
function WindowOnload(f) {
    var prev = window.onload;
    window.onload = function () {
        if (prev) {
            prev();
        }
        f();
    };
}

/**Only one real global var created for tabbed views, qs = the query source.
 * In reality, it should probably be contained inside of some other object.
 * For now, though, this will do.*/
var qs = new QuerySource();

// addViewToTC : adds a view to the tabbed container,
// add adds the queries to the new view.
var addViewToTC = function(){alert('tab container has not finished initializing');};

function tabViewsInit() {

    var tc = new TabbedContainer(qs);
    addViewToTC = function(sourceView){
	// get name of view from text field
	var textfield = document.getElementById('ViewName');
	var multiQuery = document.getElementById('multiQuery');
	var viewName = textfield.value;

	try{var viewfn = eval(viewName);
	    tc.addView(viewfn, multiQuery.checked);
	    var tabIndex = tc.tabControls.length -1;

      if(sourceView)
          tc.removeView(sourceView);
      tc.addView(AddView,false,true);
	    // the newly added view should be in the last tab
	    var view = tc.tabControls[tabIndex].view;
      tc.makeActive(tc.tabControls[tabIndex+1]);
	    // add current queries to new view
	    for (var i=0; i < qs.queries.length; i++){
		var q = qs.queries[i];
		view.addQuery(q);
	    }
	}catch(error){
	    //@TODO need better handling
	    //alert(error);
	    throw error;
	}
    };
    //Write in all views to be used below!!!
    //--------------------------------------
    tc.addView(tableView, false);
    tc.addView(mapView, true);
    tc.addView(calView, true);
    tc.addView(timelineView, true);
    tc.addView(sparqlView,false);
    tc.addView(AddView, false, true);
    //----------------end view declarations!
    qs.addListener(tc);
}

WindowOnload(tabViewsInit);
