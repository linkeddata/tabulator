function timelineView(timelineContainer) {
    //The necessary vars for a View...
    this.name="Timeline";        //Display name of this view.
    var queryStates = [];
    this.queryStates=queryStates;          //All Queries currently in this view.
    this.container=timelineContainer; //HTML DOM parent node for this view.
    var EC = new Array();
    timelineContainer.style.height='100%';

    var resizeTimerID;
    function onResize(){
	if (resizeTimerID == null) {
	    resizeTimerID = window.setTimeout(function() {
		resizeTimerID = null;
		timeline.layout();
	    }, 500);
	}
    }

    // add another event handler to body of tabulator
    window.addEventListener("resize", function(){if (timelineContainer.style.display!='none'){onResize();}}, false);

    // vars for timelineView
    var timeline;
    var today = new Date();    
    // initializing timeline
    var eventSource = new Timeline.DefaultEventSource();

	var bandInfos = [
			 Timeline.createBandInfo({
        showEventText:  false,
			    trackHeight:    0.5,
			    trackGap:       0.2,
			    eventSource:    eventSource,
			    date:           today, //"Jun 28 2006 00:00:00 GMT",
			    width:          "20%", 
        intervalUnit:   Timeline.DateTime.YEAR, 
			    intervalPixels: 100
			    }),

			 Timeline.createBandInfo({
        eventSource:    eventSource,
			    date:           today, //"Jun 28 2006 00:00:00 GMT",
			    width:          "30%", 
			    intervalUnit:   Timeline.DateTime.MONTH, 
			    intervalPixels: 100
			    }),
			 // track markings condensed

			 Timeline.createBandInfo({
	eventSource:    eventSource,
			    date:           today, //"Jun 28 2006 00:00:00 GMT",
			    width:          "40%", 
			    intervalUnit:   Timeline.DateTime.DAY, 
			    intervalPixels: 40
			    })
	];
	bandInfos[0].syncWith = 1;
	bandInfos[1].syncWith = 2;
	
	bandInfos[0].highlight = true;
	bandInfos[1].highlight = true;
	
	// make sure layout lines up
	// bandInfos[1].eventPainter.setLayout(bandInfos[0].eventPainter.getLayout());
	// bandInfos[2].eventPainter.setLayout(bandInfos[0].eventPainter.getLayout());
	//var timelineContainer = container.appendChild(document.createElement('DIV'));
	//timelineContainer.style.height = '100%';//'370px';
	//timelineContainer.style.border = "1px solid #aaa";
	//timelineContainer.style.margin = "2em";
	var timeline = Timeline.create(timelineContainer, bandInfos);
	//end timeline initialization--------------------------------------------------//


    // allEvents is an map/associative array<q.id, events>. all drawn events
    var allEvents = [];

    //helper functions--------------------------------------------//
    //functions for adding and removing events from allEvents

    function eventFunction(e){
	//drawAllEvents();
	var dayevents = getSlot(e.startArray, EC);
	if (!dayEventDup(e,dayevents)){
	    dayevents.push(e);
	    dayevents.sort(sortByEventTime);
	    // show number of events, if it is amongst currently shown queries
	    if (queryStates[e.qid]==1){
		eventSource.loadQueryEvents([e]);
	    }
	} 
    }
    
    //end helper functions----------------------------------------//

    this.drawQuery = function (q) {
        if(this.queryStates[q.id]==2){
            return;
	}
        this.queryStates[q.id]=1;
	var colorCellCss = null;
        this.onBinding = makeTimeViewOnBindingFn(q, 
						 function(e){
						     var qe = getSlot([q.id], allEvents);
						     qe.push(e);
						     eventFunction(e)}
						 , colorCellCss);
        
        kb.query(q, this.onBinding, myFetcher);
    } //this.drawQuery

    this.undrawQuery = function (q) {
	// clear EC
	EC = new Array();
	eventSource._events.removeAll();

	delete allEvents[q.id];
        this.queryStates[q.id]=0;

	// reload EC and eventSource with events
	for (var qid in allEvents){
	    var queryEvents = allEvents[qid];
	    for (var i in queryEvents){
		var e = queryEvents[i];
		eventFunction(e);
	    }
	}

	Timeline.create(timelineContainer, bandInfos);
    }
    
    this.addQuery = function (q) {
	// adds all queries. if queries don't have any relevant calendar data,
	// the calendar will be blank.
	this.queryStates[q.id]= queryHasTimeData(q) ? 0 : 2;
    }

    this.removeQuery = function (q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }

    this.clearView = function () {
        emptyNode(this.container);
        var i;
        for(i=0; i<this.queryStates.length; i++) {
            this.queryStates[i]=0;
        }
    }
} // timelineView


TimelineViewFactory = {
    name: "Timeline View",

    findCalType: function(pred) {
        var types = {'http://www.w3.org/2002/12/cal/icaltzd#dtend':'end', 'http://www.w3.org/2002/12/cal/icaltzd#dtstart':'start', 'http://www.w3.org/2002/12/cal/icaltzd#summary':'summary', 'http://www.w3.org/2002/12/cal/icaltzd#Vevent':'event', 'http://www.w3.org/2002/12/cal/icaltzd#component':'component', 'date':'dateThing'};
        for (var key in types){
            // match: finds substrings
            if(pred.toLowerCase().match(key.toLowerCase())!=null){
                return types[key];
            }
        }
        return null;
    },

    canDrawQuery:function(q) {
        var n = q.pat.statements.length;
        for (var i = 0; i < n; i++){
            var qst = q.pat.statements[i];
            var calType = findCalType(qst.predicate.toString());
            if (calType!=null && calType!='summary'){
                return true;
            }
        }
        return false;
    },

    makeView: function(container,doc) {
        return new timelineView(container,doc);
    },

    getIcon: function() {
        return "chrome://tabulator/content/icons/appointment-new.png";
    },

    getValidDocument: function() {
        return "chrome://tabulator/content/view.html";
    }
}