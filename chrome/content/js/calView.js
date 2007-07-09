/**
 * @Fileoverview : calView.js contains code to create calendar view, handle query data and populate the calendar with events resulting from processing queries.
 */

/**
 * @class calView
 * @constructor : calView populates an HTML container element with the calendar view.
 * @param {HTML DOM element} container  : HTML DOM element that can contain the current view
 */
function calView(container) {
    // fields
    /**
     * @final
     * @member
     * @type String
     * Name of this view. 
     */
    this.name="Calendar";
    //All Queries currently in this view.
    var queryStates = [];
    /**
     * @member calView
     * this.queryStates exports the local variable queryStates so it can be viewed outside of the current scope
     * if this.queryStates pointer were to be set to something else, however, the local variable queryStates will not be affected, for obvious reasons. Local variable queryStates keeps track of all queries in calendar view.
     * @final
     * @type Array
     */
    this.queryStates=queryStates;

    /**
     * @final
     * @member calView
     * @type HTMLElement
     */
    this.container=container;

    var calendar = new VIEWAS_bigCal(this.container, new Date());
    
    // allEvents is an map/associative array<q.id, events>. all drawn events
    var allEvents = [];

    /**
     * drawfn places the event in the calendar tree of events according to the date specified by My, Mm, Md, and updates the current number of events shown in the calendar.
     * @param {integer} My : year
     * @param {integer} Mm : month
     * @param {integer} Md : date
     * @param {Event}   e  : event
     */
    function drawfn(My, Mm, Md, e){
	var dayevents = getSlot([My,Mm,Md], calendar.EC);
	var dup = dayEventDup(e,dayevents);
	if (!dup){
	    dayevents.push(e);
	    e.duplicates = new Array();
	    dayevents.sort(sortByEventTime);
	    // show number of events, if it is amongst currently shown queries
	    if (queryStates[e.qid]==1){
		calendar.showEventCount(My,Mm,Md);
	    }
	} else {//if (dup.qid != e.qid){
	    dup.duplicates[e.qid] = e;
	}
    }
    
    /**
     * @member calView
     * @final
     * @type Array[](String)
     * Array of hexcodes (represented as strings) for colors that calendar entries may be in. 
     */

    this.colorPad = ['A32929', '88880E', 'B1365F', 'AB8B00', '7A367A', 'BE6D00', '5229A3', 'B1440E', '29527A', '865A5A', '2952A3', '705770', '1B887A', '4E5D6C', '28754E', '5A6986', '0D7813', '4A716C', '528800', '6E6E41'];
    /**
     * @member calView
     * See also SampleView JSdocs for this.drawQuery in views.
     */
    this.drawQuery = function (q) {
        if(queryStates[q.id]!=null && queryStates[q.id]==2){
            return;
	}
        queryStates[q.id]=1;
	// come up with a color for the event cells; so far, all event cells have class 'tm'
	// queryStyles array saves the style node that is added. can be used to 
	// modify the properties of the query's event cells later.

	// class "q1" (if q.id = 1)
	var queryStyleClass = 'q' + q.id; 

	var bgcolor = this.colorPad[q.id%this.colorPad.length];

	var textcolor = 'FFFFFF';

	if (calendar.queryStyles[q.id] == undefined){
	    calendar.queryStyles[q.id] = addStyle('table.tm.' + queryStyleClass + '{background-color:#'+ bgcolor + ';color:#'+textcolor+';}');
	} // else use existing color

	calendar.updateLegend();

	//colorCellCss will add class to the event cell; store colorCellCss info in Event object for now
	var colorCellCss = function(cell){
	    YAHOO.util.Dom.addClass(cell,queryStyleClass);
	}

	// what to do with each event created from calendar data
	function eventFunction(e){
	    getSlot([q.id], allEvents).push(e);
	    eventDurForeach(e, drawfn);
	};
	
	/**
	 * @member calView
	 * this.onBinding takes an argument bindings (an associative array which is a map between variables and their RDF values) from doing RDF pattern matching
	 * The bindings are processed to create calendar events.
	 */
	// it's a little silly that this.onBinding keeps getting rebound each time this.drawQuery is invoked. will change that later. @TODO
        this.onBinding = makeTimeViewOnBindingFn(q, eventFunction, colorCellCss);

        kb.query(q, this.onBinding, myFetcher);
        // show number of events
        calendar.currentMonthEventCount();
    } //this.drawQuery

    /**
     * @member calView
     * undrawQuery removes query from calendar view.
     * See also SampleView JSdocs
     */
     this.undrawQuery = function (q) {
	function undrawfn(My, Mm, Md, e){
	    function filterSameID(e, array){
		return filter(function(e2){return (e2.id!=e.id);}, array);
	    }
	    var dayevents = getSlot([My,Mm,Md], calendar.EC);
	    var match = dayEventDup(e, dayevents);
	    if (match){
		//match.duplicates = filterSameID(e, match.duplicates);
		delete match.duplicates[e.qid];
		if (isEmpty(match.duplicates)){
		    getSlot([My, Mm], calendar.EC)[Md] = filterSameID(e, dayevents);
		}
	    }
	}

	var queryEvents = allEvents[q.id];

	// if query has already been undrawn/removed
	if (queryEvents!=undefined){
	    for (var i = 0; i < queryEvents.length; i++){
		var e = queryEvents[i];
		eventDurForeach(e, undrawfn);
	    }
	}
	var queryStyle = calendar.queryStyles[q.id];
	// if query isn't calendarable, probably doesn't have a style.
	if (queryStyle!=undefined){
	    queryStyle.parentNode.removeChild(queryStyle);
	    delete calendar.queryStyles[q.id];
	    calendar.updateLegend();
	}
  	delete allEvents[q.id];
	calendar.currentMonthEventCount();
        queryStates[q.id]=0;
    }

    /**
     * @member calView
     * this.addQuery adds query q to calendar view. if queries don't have any relevant calendar data, the query will not be added to calendar view.
     * @param {RDF query} q
     */
    this.addQuery = function (q) {
	this.queryStates[q.id]= queryHasTimeData(q) ? 0 : 2;
    }

    /**
     * @member calView
     * this.removeQuery undraws and removes the query from the calendar view.
     */
    this.removeQuery = function (q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }

    /**
     * clearView removes calendar view from the HTML container object that it was in
     */
    this.clearView = function () {
        emptyNode(this.container);
        var i;
        for(i=0; i<this.queryStates.length; i++) {
            this.queryStates[i]=0;
        }
    }
} // calView

/**
 * @param {string} pred : string representation of an RDF statement's predicate
 * @return a string representing the relevant calendar datatype that the object of the RDF statement that pred belongs to. If the object is not a relevant calendar datatype, null is returned;
 */
function findCalType (pred) {
    var types = {'http://www.w3.org/2002/12/cal/icaltzd#dtend':'end', 'http://www.w3.org/2002/12/cal/icaltzd#dtstart':'start', 'http://www.w3.org/2002/12/cal/icaltzd#summary':'summary', 'http://www.w3.org/2002/12/cal/icaltzd#Vevent':'event', 'http://www.w3.org/2002/12/cal/icaltzd#component':'component', 'date':'dateThing'};
    for (var key in types){
	// match: finds substrings
	if(pred.toLowerCase().match(key.toLowerCase())!=null){
	    return types[key];
	}
    }
    return null;
}

/**
 * Determines whether the queries contain any calendarable data.
 * @param {RDF query} q
 * @return {Boolean} true if the query has datatypes required for displaying the queries in calendar view
 */
function queryHasTimeData(q){
    var n = q.pat.statements.length;
    for (var i = 0; i < n; i++){
	var qst = q.pat.statements[i];
	var calType = findCalType(qst.predicate.toString());
	if (calType!=null && calType!='summary'){
	    return true;
	}
    }
    return false;
}


/**
 * CalendarDoubleClick expands the RDF node of the target of the event in the outliner view
 * @param {HTML DOM Event} event
 */
function CalendarDoubleClick(event){
    var target = getTarget(event);
    var tname = target.tagName;
    tabulator.log.debug("CalendarDoubleClick: " + tname + " in "+target.parentNode.tagName);
    var aa = getAbout(kb, target);
    if (!aa) return;
    GotoSubject(aa);
}

/**
 * getSlot does DFS to find the slot
 * if slot isn't found/defined, an array is created
 * getSlot should always return an array in the case of calendar. 
 * 'slot' refers to an array in the nested arrays
 * @param {Array} arrayKey : an array of ordered keys that specify a 'slot' (a value in an array tree that is of type Array)
 * @param {Array} array    : nested arrays represent a tree
 * @return array
 */
function getSlot(arrayKey, array){
    function _getSlot(key,array){
        // get if exists, create array if doesn't
        if (array[key]==undefined){
            array[key] = new Array();
        }
	return array[key];
    }    
    
    var level = array;
    for (key in arrayKey){
        level = _getSlot(arrayKey[key], level);
    }
    return level;
}

/**
 * arrayeq compares two ordered arrays, checking to see if each corresponding element in the arrays are equal by ==
 * @param {Array} array1 : ordered array
 * @param {Array} array2 : ordered array
 * @return boolean
 */
function arrayeq(array1, array2){
    // check that they are... supersets/arrays of each other
    for (key in array1){
	if (array1[key] != array2[key]){
	    return false;
	}
    }
    for (key in array2){
	if (array1[key] != array2[key]){
	    return false;
	}
    }
    return true;
}

/**
 * @constructor Event  : calendar event object
 * @param {Array} startArray : array of length 3, of the form [{integer}year, {integer} month, {integer} date]
 * (January is month 1)
 * @param {string} startTime : HH:MM:SS...
 * @param {Array} endArray : array of length 3, of the form [{integer}year, {integer} month, {integer} date]
 * @param {string} endTime : HH:MM:SS...
 * @param {string} summary : description of event
 * @param {RDF node} obj   : the RDF object that this calendar event is associated with. may be null
 * @param {integer} qid    : id for the query that this event was created under
 * @param {HTML DOM element} info : contains HTML table that holds the information associated with this calendar event that is not actually calendarable. (e.g. location data)
 * @param {function} colorCellCss : function that will assign the cell, which is the HTML visual representation of the event, a certain class. This may be used to manipulate the cell's appearance through CSS.
 *
 */
function Event(startArray, startTime, endArray, endTime, summary, obj, qid, info, colorCellCss){

    this.startArray = startArray;
    this.startTime = startTime; // string, may be empty string
    this.startDate = getArrayTimeDateObj(startArray, startTime);
    this.endDate = getArrayTimeDateObj(endArray, endTime);
    this.endArray = endArray;
    this.endTime = endTime;
    this.summary = summary;
    this.obj = obj;
    this.id = (obj != null) ? obj.toString() + this.summary : this.startDate.toString() + this.endDate.toString() + this.startTime + this.endTime + this.summary;
    this.qid = qid;
    this.info = info; // dom node that can go into an info bubble.
    this.colorCellCss = colorCellCss;
}

/**
 * If array has no keys, return true.
 * @param {Array} array
 * @return boolean
 */
function isEmpty(array){
    for (var key in array){
        return false;
    }
    return true;
}


/**
 * @param {Array} dateArray : [{int}Year, {int}Month, {int}Date]
 * @return {Date} date : javascript Date object that represents the same date information in dateArray.
 */

function dateArray2Date(dateArray){
    var date = new Date(dateArray[0], dateArray[1]-1, dateArray[2]);
    date.setFullYear(dateArray[0]);
    return date;
}

/**
 * @param {Array} dateArray : [{int}Year, {int}Month, {int}Date]
 * @param {string} t : time of the formate HH:MM:SS
 * @return {Date} date : javascript Date object that represents the same date/time information in dateArray and t.
 */
function getArrayTimeDateObj(dateArray,t){
    var date = dateArray2Date(dateArray);
    function helper(str, f){
	if (str!=undefined){
	    var n = f(str);
	    if (!isNaN(n)){
		return n;
	    }
	}
	return 0;	
    }
    function parseHour(str){return helper(str, function(str){return parseInt(str.substr(0,2), 10) ;}) ;}
    function parseMin(str){ return helper(str, function(str){return parseInt(str.substr(3,2), 10) ;}) ;}
    function parseSec(str){ return helper(str, function(str){return parseInt(str.substr(6,2), 10) ;}) ;}
    //date.setFullYear(dateArray[0],dateArray[1]-1,dateArray[2]);
    date.setHours(parseHour(t));
    date.setMinutes(parseMin(t));
    date.setSeconds(parseSec(t));
    date.setMilliseconds(0);
    return date;
}

/**
 * sortByEventTime is a comparator for calendar events. 
 * @param {event} e1
 * @param {event} e2
 * @return {integer} positive integer if event e2 starts later than event e1; 0 if they start at the same time; negative integer if event e2 starts before event e1.
 */
function sortByEventTime(e1,e2){
    // both events should have starttimes for comparison
    var date1 = e1.startDate; //getEventDateObj(e1);
    var date2 = e2.startDate; //getEventDateObj(e2);
    return date1.getTime() - date2.getTime();
}




/**
 * @param {RDF query} q
 * @param {function} eventFunction
 * @param {function} colorCellCss
 * @return {function} : makeTimeViewOnBindingFn returns a function that handles bindings (mapping between variables and RDF nodes), processing them for calendarable date/time data.
 * Timeline view and calendar view work on the same kind of calendarable date/time data, but process the resulting events differently.
 */
makeTimeViewOnBindingFn = function(q, eventFunction, colorCellCss){
    var alternateColor = false;
    return function (bindings) {

	function parseDateHelper(str, start, n, default_value){
	    if (str!=undefined){
		var substr = str.substr(start,n);
		if (substr!=""){
		    return parseInt(substr, 10);
		}
	    }
	    return default_value;	    
	}

	function parseY(str){return parseDateHelper(str, 0, 4, null)};
	function parseM(str){return parseDateHelper(str, 5, 2, null)};
	function parseD(str){return parseDateHelper(str, 8, 2, 1)};
	function parseT(str){return (str!=undefined) ? str.slice(11) : 'time';}
            
	function dateStr2Array(str){
	    var array = new Array();
	    array[0] = parseY(str);
	    array[1] = parseM(str);
	    array[2] = parseD(str);
	    return array;
	}

	var Aarray;//Ay, Am, Ad, At;
	var At;
	var Barray;//By, Bm, Bd, Bt;
	var Bt;
	var summary, object;

	var info = document.createElement('div');
	var t = info.appendChild(document.createElement('table'));

            
	// if everything needed is defined
	function allDefined(array){
	    if (array == undefined){
		return false;
	    } else {
		for (var key in array){
		    if (array[key]==undefined){
			return false;
		    }
		}
		return true;
	    }
	}

	function readSt(){
	    // helper function            
	    tabulator.log.info("making a calendar w/ bindings " + bindings);
        
	    function contains(str, array){
		for (i = 0; i<array.length; i++){
		    if (array[i]==str){
			return true;
		    }
		}
		return false;
	    }
	    function isFrag(calType){
		var eventFrag = ['end','start','summary'];
		return contains(calType,eventFrag);
	    }
		
	    function calDF(calType){
		// helper function
		function dateStr(dt){
		    if (dt==undefined){
			//debugger;
			return null;
		    }
		    return  (dt.value!=undefined) ? dt.value : kb.any(dt, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#dateTime'), undefined);
		}
		    
		switch(calType){
		    // disallow Vcalendar for now
		    
		    // 		    case 'Vcalendar':
		    // 		    // settle Vcalendar children first, depth-first
		    // 		    // Vcal can have many components

		    // 		    return function(obj){
		    // 			var comps = kb.each(obj, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#component'), undefined);
		    // 			map(calDF('component'), comps);
		    // 		    }
		    
		case 'component':
		    // the only calendar components I know of are events.
		    return function(obj){
			// var event = kb.the(obj, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#Vevent'), undefined);
			var event = obj;
			return calDF('event')(event);
		    }
		case 'event':
		    return function(obj){
			var dtstart = kb.any(obj, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#dtstart'), undefined);
			if (dtstart==undefined){
			    return; // an event without a start time shouldn't be plotted.
			} else {
			    calDF('start')(dtstart);
			}
			// dtend might not be specified for event
			// if I use kb.the, it will complain if no hits return.
			    
			var dtend = kb.any(obj, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#dtend'), undefined);
			if (dtend != undefined){
			    calDF('end')(dtend);
			}
			
			var queriedSummary = kb.any(obj, kb.sym('http://www.w3.org/2002/12/cal/icaltzd#summary'), undefined);
			if (queriedSummary) {
			    summary = queriedSummary.value;
			}
			//summary.final = true;
			return obj;
		    }
		case 'start':
		    return function(obj){
			var datestrA = dateStr(obj);
			// YYYY MM DD time string
			Aarray = dateStr2Array(datestrA);
			At = parseT(datestrA); // string
			if (summary==undefined){
			    summary = 'dtstart';
			} else {//if (!summary.final){
			    summary = summary + ' dtstart';
			}
		    }
		case 'end':
		    return function(obj){
			var datestrB = dateStr(obj);
			Barray = dateStr2Array(datestrB);
			Bt = parseT(datestrB); // string
			if (summary==undefined){
			    summary = 'dtend';
			} else {//if (!summary.final){
			    summary = summary + ' dtend';
			}
		    }
		case 'summary':
		    return function(obj){
			summary = obj.value;
		    }
		case 'dateThing':
		    return function(obj){
			// 			var sublabel = label(sub);
			// 			if (summary==undefined){//((summary==undefined) || !summary.final){
			// 			    summary = (sublabel!=undefined) ? sublabel : sub.toString();
			// 			}
			summary = obj.toString();
			calDF('start')(obj);
			return obj;
		    }
		default:
		    return function(obj, varlabel){
			// what to do with non-calendar information
			var tr = t.appendChild(document.createElement('tr'));
			var td = tr.appendChild(document.createElement('td'));
			t.style.border = '1px';
			t.setAttribute('background-color','blue');
			td.appendChild(document.createTextNode(varlabel));
			var objtd = matrixTD(obj,false);
			objtd.addEventListener('dblclick', function(event){GotoSubject(obj, true); event.stopPropagation();}, false);
			objtd.style.backgroundColor = (alternateColor) ? '#CCFFFF' : 'white';
			td.style.backgroundColor = (alternateColor) ? 'white' : '#CCFFFF';
			alternateColor = !alternateColor;
			tr.appendChild(objtd);
		    }
		}
		// for each query var, handle data
	    }
		

	    // markQueryStatementCaltypes
	    var ns = q.pat.statements.length;
	    for (var i=0; i<ns; i++){
		var qst = q.pat.statements[i];
		var pred = qst.predicate.uri;
		var obj = (qst.object.isVar==1) ? bindings[qst.object] : qst.object;
		obj.cal = findCalType(pred);
	    }
	    
	    var nv = q.vars.length;//q.pat.statements.length;
	    for (var i=0; i<nv; i++) {
		//@todo we should only look at the obj/sub is it is a variable
		var obj = bindings[q.vars[i]];//(qst.object.isVar==1)? bindings[qst.object] : qst.object;
		//var sub = (qst.subject.isVar==1)? bindings[qst.subject] : qst.subject;
		var calType = obj.cal;//findCalType(pred.toString());
		var varlabel = q.vars[i].label;
		var obj = calDF(calType)(obj, varlabel);
		if (obj){
		    return obj;
		}
	    }
	    //return object; // need to put valid object here.
	}
            
	var obj = readSt();
	summary = (summary!=undefined)? summary : "summary";
	    
	if (Barray == null || !allDefined(Barray)){//[By,Bm,Bd]
	    Barray = copyArray(Aarray);
	    Bt = At;
	}
	// if someone selected dtend.
	if (Aarray == null || !allDefined(Aarray)){
	    Aarray = copyArray(Barray);
	    At = Bt;
	}
	// just gone through all the vars, try creating something *now*
	if (allDefined(Aarray.concat(At).concat(summary))){//[Ay, Am, Ad, At, summary]
	    // create JS Event object
	    //var infostr = info.innerHTML;
	    var e = new Event(Aarray, At, Barray, Bt, summary, obj, q.id, info, colorCellCss);
	    // adds the event to days it spans in EC
	    eventFunction(e);
	}
    }
}

//functions for adding and removing events from EC and allEvents
/**
 * @param {event} e
 * @param {Array<e>} dayevents
 * @return {Object} : compares the e's id with the ids' of the events in dayevents, returning matching event in dayevent with the same id. If no matching event found, null is returned.
 */
function dayEventDup(e, dayevents){
    for (i = 0; i<dayevents.length; i++){
	var e2 = dayevents[i];
	if (e2.id == e.id){
	    return e2;
	}
    }
    return null;
}
    
/**
 * eventDurForeach calls drawfn with My (the year), Mm (month), Md (date) of each date between event e's start and end times.
 * @param {event} e
 * @param {function} drawfn
 */

function eventDurForeach(e, drawfn){
    var msPerDay = 86400000;
    var Adate = dateArray2Date(e.startArray);
    var Bdate = dateArray2Date(e.endArray);
	
    var Atime = Adate.getTime();
    var Btime = Bdate.getTime();
    for (var k = Atime; k <= Btime; k+=msPerDay){
	var middleDate = new Date();
	middleDate.setTime(k);
	var My = middleDate.getFullYear();
	var Mm = middleDate.getMonth() + 1;
	var Md = middleDate.getDate();
	// add to total events if not duplicate
	drawfn(My, Mm, Md, e);
    }
}


/** eventMouseCoord detects mouse coordinates of click event and calls fn with them.
 * @param e : event
 * @param fn : function that takes in X,Y coordinates of mouse position : fn(mousex, mousey)
 */
function eventMouseCoord(e, fn) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) 	{
	posx = e.pageX;
	posy = e.pageY;
    }
    else if (e.clientX || e.clientY) 	{
	posx = e.clientX + document.body.scrollLeft
	    + document.documentElement.scrollLeft;
	posy = e.clientY + document.body.scrollTop
	    + document.documentElement.scrollTop;
    }
    // posx and posy contain the mouse position relative to the document
    fn(posx, posy);
}

/**
 * returns new array with the same keys and values
 * @param {Array} copyFromArray : array that is being copied
 * @return {Array} 
 */
function copyArray(copyFromArray){
    if (copyFromArray == undefined){
	return null;
    } else {
	var tempArray = new Array();
	for (var key in copyFromArray){
	    tempArray[key] = copyFromArray[key];
	}
	return tempArray;
    }
}


CalViewFactory = {
    name: "Calendar View",

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
        return new calView(container,doc);
    },

    getIcon: function() {
        return "chrome://tabulator/content/icons/x-office-calendar.png";
    },

    //Generate a document URI which will display this query.
    getValidDocument: function(q) {
        return "chrome://tabulator/content/calendar.html?query="+q.id;
    }
}