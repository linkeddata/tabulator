
/* need to make unique calendar containers and names
 * YAHOO.namespace(namespace) returns the namespace specified 
 * and creates it if it doesn't exist
 * function 'uni' creates a unique namespace for a calendar and 
 * returns number ending
 * ex: uni('cal') may create namespace YAHOO.cal1 and return 1
 *
 * YAHOO.namespace('foo.bar') makes YAHOO.foo.bar defined as an object,
 * which can then have properties
 */

function uni(prefix){
    var n = counter();
    var name = prefix + n;
    YAHOO.namespace(name);
    return n;
}

// counter for calendar ids, 
counter = function(){
	var n = 0;
	return function(){
		n+=1;
		return n;
	}
}() // *note* those ending parens! I'm using function scope

var renderHoliday = function(workingDate, cell) { 
	YAHOO.util.Dom.addClass(cell, "holiday");
} 


/* toggles whether element is displayed
 * if elt.getAttribute('display') returns null, 
 * it will be assigned 'block'
 */
function toggle(eltname){
	var elt = document.getElementById(eltname);
	elt.style.display = (elt.style.display=='none')?'block':'none'
}

/* Example of calendar Id: cal1
 * 42 cells in one calendar. from top left counting, each table cell has
 * ID: YAHOO.cal1_cell0 ... YAHOO.cal.1_cell41
 * name: YAHOO.cal1__2006_3_2 for anchor inside calendar cell 
 * of date 3/02/2006
 * 
 */	
function VIEWAS_cal(obj) {
	prefix = 'cal';
	var cal = prefix + uni(prefix);

	var containerId = cal + 'Container';
	var table = document.createElement('table');
	
	
	// create link to hide/show calendar
	var a = document.createElement('a');
	// a.appendChild(document.createTextNode('[toggle]'))
	a.innerHTML="<small>mm-dd: " + obj.value + "[toggle]</small>";
	//a.setAttribute('href',":toggle('"+containerId+"')");
	a.onclick = function(){toggle(containerId)};
	table.appendChild(a);

	var dateArray = obj.value.split("-");
	var m = dateArray[0];
	var d = dateArray[1];
	var yr = (dateArray.length>2)?dateArray[2]:(new Date()).getFullYear();

	// hack: calendar will be appended to divCal at first, but will
	// be moved to new location
	document.getElementById('divCal').appendChild(table);
	var div = table.appendChild(document.createElement('DIV'));
	div.setAttribute('id', containerId);
	// default hide calendar
	div.style.display = 'none';
	div.setAttribute('tag','calendar');
	YAHOO[cal] = new YAHOO.widget.Calendar("YAHOO." + cal, containerId, m+"/"+yr);

	YAHOO[cal].addRenderer(m+"/"+d, renderHoliday); 

	YAHOO[cal].render();
	// document.childNodes.removeChild(table);
	return table;
}

 ///////////////////////////////////////////////////




/** 
 * @param e : DOM Event
 * This function is used to restrict input of a text field to numbers
 * @return true if the key pressed while focus is on the text field is a number, a control key that is not 'return', false otherwise.
 */
function numberfield(e){
    var key, keychar;
    if (window.event){
        key = window.event.keyCode;
    } else if (e) {
        key = e.which;
    } else {
        return true;
    }
    keychar = String.fromCharCode(key);
    // control keys
    if ((key==null) || (key==0) || (key==8) ||
        (key==9) || (key==27) ){ //key 13 is 'return'
        return true;
    } else if ((("0123456789").indexOf(keychar) >= 0)){
        return true;
    } else {
        return false;
    }
}

/**
 * @constructor
 * @class
 * Constructs a calendar table and forms for setting calendar preferences and navigation
 * @param {HTMLElement} divCal : container for calendar to show up in
 * @param {Date} Date : Javascript date object that determines which year and month the calendar is displaying
 */
function VIEWAS_bigCal(divCal, Date) {
    var cal = uni('cal') + 'mcal';
    var containerId = cal + 'Container';
    // visual calendar will be within table
    var table = document.createElement('table');
    table.style.width = '100%';
    //table.style.height = '100%';

    var EC = new Array();
    /**
     * @type Array
     * @member VIEWAS_bigCal
     * EC is the event calender array tree where the events are ordered and stored
     */
    this.EC = EC;
    /**
     * @final
     * @member VIEWAS_bigCal
     * @param newEC
     * setEC replaces the old EC with a newEC
     */
    this.setEC = function(newEC){
	this.EC = newEC;
	EC = newEC;
    }

    /**
     * @member calView
     * this.queryStyles is a map of query id to the css style of the query events.
     * This allows us to customize the appearance of events by which query they belong to.
     * @final
     * @type Array
     */
    this.queryStyles=[];    


    var infoShown;

    /*--------------------------------------------------*/
    /* helper functions for creating and displaying events.
     * 
     */

    /** goes to the yr, mth specified and fetches events to display*/
    function gotoMonth(yr,mth){
	if ((typeof yr) == 'number' && (typeof mth) == 'number' && !isNaN(yr) && !isNaN(mth)){
	    YAHOO[cal].setYear(yr);
	    YAHOO[cal].setMonth(mth-1);
	    YAHOO[cal].render();
	    //setTimeout(function(){displayMonthEventCount(yr, mth)},0);
	    displayMonthEventCount(yr,mth);
	}
    }

    /**
     * @param {int} y : year
     * @param {int} m : month
     * displayMonthEvents fetches the events stored in EC and displays them.
     * (if the currently displayed month isn't the one specfied by 'y' and 'm', the events won't show up
    */
    function displayMonthEvents(y,m){
        var daysArray;
        if (EC[y]!=undefined && EC[y][m]!=undefined){
            daysArray = EC[y][m];
            for (var i in daysArray){
                showEventCount(y,m,i,true);
            }
        }
    }
    
    // shows the number of events per day for that y (year) and m (month)
    function displayMonthEventCount(y,m){
        var daysArray;
        if (EC[y]!=undefined && EC[y][m]!=undefined){
            daysArray = EC[y][m];
            for (var i in daysArray){
                var day = daysArray[i];
		showEventCount(y,m,i);
            }
        }
    }
    
    // @param all : if true, show all the event summaries in the day.
    //              else (e.g. if undefined or null), look to combo box for number of events to display
    function showEventCount(y,m,d, all){
        // figure out how many events are displayed,
        // and how many are merely represented as numbers
        // by looking at combo box numEventBox

        // show number of events for that day
        var pageMonth = YAHOO[cal].pageDate.getMonth() + 1;
        var pageYear = YAHOO[cal].pageDate.getFullYear();
        var targetcell = getCalCell(cal, [y,m,d]);
        if (y==pageYear && m==pageMonth && targetcell!=null){
            var dayEvents = getSlot([y,m,d], EC);
	    var showNum;
	    var comboNum = parseInt(document.getElementById('numEventsPerDayComboBox').value, 10);

	    if (all){
		showNum = dayEvents.length;
	    } else {
		showNum = (dayEvents.length<=comboNum) ? dayEvents.length : comboNum;
	    }

	    var eventcell = document.createElement('div');
	    eventcell.style.width="100%";
	    eventcell.style.height="100%";

	    var oldNode = targetcell.childNodes[1];
	    // completely replace this table
	    targetcell.replaceChild(eventcell, oldNode);

	    var n = dayEvents.length - showNum; // what's left; number of events that haven't been shown

	    var events = eventcell.appendChild(document.createElement('div'));

	    events.style.width = "100%";
	    events.style.height = "100%";
	    events.style.overflow = "auto";
	    events.style.marginTop = "-1.1em"; // hack.
	    // show first showNum events
	    events.appendChild(document.createElement('br'));
	    for (var i = 0; i<showNum; i++){
		var cell = createEventCell(dayEvents[i]);
		events.appendChild(cell);
	    }
	    // only need a link if (1) something more to show (2) need to collapse and have some place to collapse to
	    if (n!=0 || (all && (showNum > comboNum))){ 
		var nEvents = eventcell.insertBefore(document.createElement('a'), events);
		nEvents.addEventListener('click', function(e){showEventCount(y,m,d, all? null : true);e.stopPropagation();}, false);
		var image = AJARImage(all ? Icon.src.icon_collapse : Icon.src.icon_expand);
		//var image = AJARImage(Icon.src.icon_expand);
		image.setAttribute('border','none');
		nEvents.appendChild(image);
		var small = nEvents.appendChild(document.createElement('SMALL'));
		small.innerHTML = all ? "collapse" : n + " more";// event" + plural;

		nEvents.style.position="relative";
		nEvents.style.top = "0";
		nEvents.style.zIndex="1"; // to get a nEvents to be above events.
		nEvents.appendChild(document.createElement('div')); // ... kcah		    
		nEvents.style.backgroundColor = "white";
	    }
        }
    }

    // create event cell
    //* Event may have colorCellCss info; if it is present, use it.
    function createEventCell(e){
        var eventcell = document.createElement('table');
        eventcell.setAttribute('class', 'tm');
        // if event stretches across several days
        var time = (arrayeq(e.startArray,e.endArray)) ? e.startTime + "~" + e.endTime : 
	    "->" + e.endArray[0] + "-" + e.endArray[1] + "-" + e.endArray[2];
        eventcell.appendChild(document.createTextNode(time + "\n"));
        eventcell.appendChild(document.createTextNode(e.summary + "\n"));
	if (e.colorCellCss!=null){ // event has specified color
	    e.colorCellCss(eventcell);
	}
	if (e.obj!=null){
	    // to enable going back to tree view upon doubleclicking calendar event
	    eventcell.setAttribute('about', e.obj.toNT());
	    //eventcell.setAttribute('ondblclick',"CalendarDoubleClick(event)");
	    eventcell.addEventListener('dblclick', CalendarDoubleClick, false);
	}
	eventcell.showEventInfo = function(event){
	    eventMouseCoord(event, function(x,y){
		if (infoShown){
		    infoShown.onclick();//close info
		}
		var div = document.createElement('div');
		YAHOO.util.Dom.addClass(div, 'info');
		div.style.left = x + 2;
		div.style.top = y + 2;

		e.info.style.backgroundColor = "white";
		e.info.style.width="100%";
		e.info.style.height="100%";
		e.info.style.overflow = "auto";
		div.appendChild(e.info);
		divCal.appendChild(div);
		infoShown = div;

		div.onclick = function(){
		    divCal.removeChild(div);
		    infoShown = false;
		}
	    });
	}
	
	if (e.info!=null){
	    eventcell.setAttribute('onclick', "this.showEventInfo(event)");
	}
        return eventcell;
    }
    
    
    // displays the current month's event count
    function currentMonthEventCount(){
        var pageYear = YAHOO[cal].pageDate.getFullYear();
        var pageMonth = YAHOO[cal].pageDate.getMonth() + 1;
	// refresh calendar
	gotoMonth(pageYear, pageMonth);
        displayMonthEventCount(pageYear, pageMonth);
    }

    // find months with greatest and least events --------------------//
    // sums all the elements of an array
    function sumArray(array){
	var id = 0;
	for (var i in array){
	    id+=array[i];
	}
	return id;
    }
    
    // basically a tree of calendar events (could be by year, month, day),
    // returns the number of subevents

    function totalEvents(time){
      if (time instanceof Array){
        return sumArray(time.map(totalEvents));
      } else if (time instanceof Event){
        return 1;
      }
    }

    // maps func (function) across the values of assoc (associate array, with 'entries of keys and values')
    function assocMap(func, assoc){
      var newassoc = [];
      for (var key in assoc){
        newassoc[key] = func(assoc[key]);
      }
      return newassoc;
    }

    // returns a function 'f' that takes an associated array 'assoc' as its argument.
    // function 'f' will compare the values of the 'assoc' and return the key of the 
    // most extreme value based on 'compare'
    // ('compare' is a function that takes in 2 values and returns a boolean as the result of the comparison)
    function mostvalKey(compare){
	return function(assoc){
	    var bestVal;
	    var bestKey;
	    for (var key in assoc){
		if (bestVal==null || compare(bestVal, assoc[key])){
		    bestVal = assoc[key];
		    bestKey = key;
		}
	    }
	    return bestKey;
	}
    }
    
    // maxnumKey : returns the key of the greatest value in the array.
    // minnumKey : returns the key of the least value in the array.
    var maxnumKey = mostvalKey(function(bestVal, elt){ return (elt > bestVal || bestVal == null);});
    var minnumKey = mostvalKey(function(bestVal, elt){ return (elt < bestVal || bestVal == null);});
    

    //returns an array of the form [year,month] representing the month with the greatest/least number of events

    function mostEventMonth(mostvalKey){
	return function(EC){
	    // yearEventNum : assoc array with:
	    //     keys : year (ex. '2006')
	    //     values : greatest number of events to occur in a single month within year (ex. 12)
	    
	    // yearMonth : assoc array with:
	    //     keys : year (ex. '2006')
	    //     values : month of year that has the greatest number of events (compared to all other months in year)
	    //              (ex. '11' for november)
	    var yearEventNum = [];
	    var yearMonth = [];
	    for (var year in EC){
		var yearMonthEvents = assocMap(totalEvents, EC[year]);
		var monthWithMostEvents = mostvalKey(yearMonthEvents);

		yearMonth[year] = parseInt(monthWithMostEvents, 10);
		yearEventNum[year] = yearMonthEvents[monthWithMostEvents];
	    }
	    var mostYear = mostvalKey(yearEventNum);
	    var mostMonth = yearMonth[mostYear];
	    // check to see that mostEventMonth has nonzero events
	    var numberOfevents = totalEvents(EC[mostYear][mostMonth]);
	    return (numberOfevents > 0) ? [parseInt(mostYear, 10), parseInt(mostMonth, 10)] : [NaN, NaN];
	}
    }
    
    // maxEventMonth : the month with the greatest number of events in EC
    var maxEventMonth = mostEventMonth(maxnumKey);
    var minEventMonth = mostEventMonth(minnumKey); //probably won't be useful. who knows.

    // returns an array with all the keys of 'array'
    function keys(array){
	var keylst = [];
	for (var key in array){
	    keylst.push(key);
	}
	return keylst;
    }
    
    function most(compare, array){
	var best;
	for (var key in array){
	    var elt = array[key];
	    if (best==null || compare(best, elt)){
		best = elt;
	    }
	}
	return best;
    }

    var min = function(array){
	return most(function(best, elt){
	    return (elt < best);}, array)
    }

    var max = function(array){
	return most(function(best, elt){
	    return (elt > best);}, array)
    }

    function mostEvent(EC, sortby){
	if (EC instanceof Array){
	    var keylst = keys(EC);
	    keylst.sort(sortby);
	    for (var i=0; i<keylst.length; i++){
		var most = keylst[i];
		// DFS
		var dateArray = mostEvent(EC[most], sortby);
		if (dateArray!=null){
		    return dateArray;
		}
	    }
	    // no dateArray found
	    return null;
	} else if (EC instanceof Event){
	    return EC.startArray;
	}
	return null;
    }

    // return starting date of first event
    var minnum = function(a, b){return parseInt(a,10) - parseInt(b,10);}
    var firstEvent = function(EC){
	return mostEvent(EC, minnum);
    }

    var maxnum = function(a, b){return parseInt(b,10) - parseInt(a,10);}
    var lastEvent = function(EC){
	return mostEvent(EC, maxnum);
    }

    // finds next month with events
    // events that occur before the current event/month should be ignored
    // @param ymarray : array of the form [year, month]
    var navEventMonth = function(ECarray, ymarray, compare){
	var yearlist = keys(ECarray);
	yearlist.sort(compare);
	var currentYear = ymarray[0];
	var currentMonth = ymarray[1];
	for (var i = 0; i < yearlist.length; i++){
	    var year = yearlist[i];
	    var compareTime = compare(year, currentYear);
	    if (compareTime == 0){ // look for next month with events in current year
		var monthlist = keys(ECarray[year]);
		monthlist.sort(compare);
		for (var j = 0; j < monthlist.length; j++){
		    var month = monthlist[j];
		    //for (var month in ECarray[year]){
		    if (compare(month, currentMonth) > 0){ // a later month in the same year
			var monthEvents = ECarray[year][month];
			if (totalEvents(monthEvents) > 0){ // has events
			    return [parseInt(year,10), parseInt(month,10)];
			}
		    }
		}
	    } else if (compareTime > 0){ // later year
		var yearEvents = ECarray[year]
		var startDate = mostEvent(yearEvents, compare); // return earliest month with events 
		if (startDate!=null){
		    var month = startDate[1];
		    return [parseInt(year,10), parseInt(month,10)];
		}
	    }
	}
	return null;
    }


    var nextEventMonth = function(EC, ymarray){
	return navEventMonth(EC, ymarray, minnum); // always begin with sameTimePeriod == true
    }

    var prevEventMonth= function(EC, ymarray){
	return navEventMonth(EC, ymarray, maxnum);
    }

    /*-------------------- end helper functions -------------------*/

    /*------------ interface exporting functions ------------------*/
    /**
     * @member VIEWAS_bigCal
     * @final 
     * @param {int} y : year (ex. 2006)
     * @param {int} m : month (ex. 1 (for January))
     * @param {int} d : date
     * @param {boolean} all : if true, show all the event summaries in the day, else (e.g. if undefined or null), look to combo box for number of events to display
     */
    this.showEventCount = showEventCount;
    /**
     * displays the current month's event count
     * @member VIEWAS_bigCal
     */
    this.currentMonthEventCount = currentMonthEventCount;


    /*------------------------ end interface ----------------------*/
    
    // create other elements that go into divCal
    // some of these elements depend on the creation of the calendar.

    // a2 : displays all events (with summaries) in a calendar
    var a2 = document.createElement('a');
    a2.onclick = function(){displayMonthEvents(YAHOO[cal].pageDate.getFullYear(),YAHOO[cal].pageDate.getMonth() + 1);};

    (function(){var img = AJARImage(Icon.src.icon_expand); img.setAttribute('border','none'); a2.appendChild(img);})();
    a2.appendChild(document.createTextNode("Display All Events"));

    // a3 : displays only a certain number of the event summaries in the calendar view,
    // depending on what the threshold was set at
    var a3 = document.createElement('a');
    a3.onclick = function(){displayMonthEventCount(YAHOO[cal].pageDate.getFullYear(),YAHOO[cal].pageDate.getMonth() + 1);};

    (function(){var img = AJARImage(Icon.src.icon_collapse); img.setAttribute('border','none'); a3.appendChild(img);})();
    a3.appendChild(document.createTextNode("Collapse All Events"));

    // link to toggle calendar options from view
    // so far, the options are: 
    // (1) jumping to a certain year/month
    // (2) how many event summaries should be shown for each day of the month
    var a4 = document.createElement('a');
    a4.setAttribute('title','jump to any year/month or choose how many events to display each day');
    a4.onclick = function(){
	if (ymform.style.display == 'none'){
	    ymform.style.display = 'block';
	    a4.innerHTML = '( hide Calendar Navigation Form )';
	} else {
	    ymform.style.display = 'none';
	    a4.innerHTML = '( show Calendar Navigation Form )';
	}
    }

    // form for selecting new month to view.
    var ymform = document.createElement('form');
    a4.onclick();

    // link to calendar view documentation
    var calHelp = document.createElement('a');
    calHelp.setAttribute('href','http://dig.csail.mit.edu/2005/ajar/ajaw/tut/calHelp.html');
    calHelp.innerHTML = "Calendar View Help";

    // load all elements into divCal in order
    var legendContainer = divCal.appendChild(document.createElement('div'));
    var legendLabel = legendContainer.appendChild(document.createTextNode('show legend'));
    var legend = legendContainer.appendChild(document.createElement('table'));
    //legendContainer.style.align = "right";
    legendContainer.setAttribute('class', 'mapKeyDiv');
    legendContainer.style.width = "7em";

    /**
     * Returns a legend matching the queries with the color of their events
     */
    this.createLegend = function(){
	var legend = document.createElement('div');
	legend.style.display = (legendLabel.data == "show legend") ? "none" : "block";
	for (var qid in this.queryStyles){
	    var table = legend.appendChild(document.createElement('table'));
	    YAHOO.util.Dom.addClass(table, 'tm');
	    //kcah
	    YAHOO.util.Dom.addClass(table, 'q' + qid);
	    table.appendChild(document.createTextNode('Query #' + (parseInt(qid, 10) + 1)));
	}
	return legend;
    }

    this.updateLegend = function(){
	// swap in new legend
	var newlegend = this.createLegend();
	legend.parentNode.replaceChild(newlegend, legend);
	legend = newlegend;
    }

    legendContainer.onclick = function(){
	var display = (legendLabel.data == "show legend");
	legendLabel.data = display ? "hide legend" : "show legend";
	legend.style.display = display ? "block":"none";
    }

    var menu1 = divCal.appendChild(document.createElement('table'));

    menu1.setAttribute('cellpadding','5');

    var menutr = menu1.appendChild(document.createElement('tr'));
    var menutd1 = menutr.appendChild(document.createElement('td'));
    menutd1.appendChild(a3);
    var menutd2 = menutr.appendChild(document.createElement('td'));
    menutd2.appendChild(a2);
    var menutd3 = menutr.appendChild(document.createElement('td'));
    menutd3.appendChild(a4);
    var menutd4 = menutr.appendChild(document.createElement('td'));
    menutd4.appendChild(calHelp);

    for (var i = 0; i < menutr.childNodes.length; i++){
	var tdchild = menutr.childNodes[i];
	tdchild.style.margin='5px';
	tdchild.style.backgroundColor='white';
    }

    divCal.appendChild(document.createElement('BR'));
    divCal.appendChild(document.createElement('BR'));
    divCal.appendChild(ymform);
    divCal.appendChild(table);

    var div = table.appendChild(document.createElement('DIV'));

    // calNav : a table with cells containing links that help navigate in the calendar
    var calNav = div.appendChild(document.createElement('TABLE'));

    div.setAttribute('id', containerId);
    //div.style.height='100%';
    div.style.width='100%';

    var m = Date.getMonth() + 1;
    var d = Date.getDate();
    var yr = Date.getFullYear();

    YAHOO[cal] = new YAHOO.widget.Calendar("YAHOO." + cal, containerId, m+"/"+yr);

    // change CSS style just for *this* calendar
    YAHOO[cal].Style.CSS_CELL = 'bigcalcell';
    
    // show full weekday name. ex: "Monday"
    YAHOO[cal].Config.Options.LOCALE_WEEKDAYS = YAHOO[cal].Config.Locale.WEEKDAYS_LONG;

    // modify behavior of moving to next month
    YAHOO[cal].nextMonth = function()
        {
            YAHOO[cal].addMonths(1);
                // additional, update schedule
                // synchronization!
                // yield for uh 0 seconds?
            setTimeout(function(){currentMonthEventCount()},0);
        }
    
    YAHOO[cal].previousMonth = function()
        {
            YAHOO[cal].subtractMonths(1);
            setTimeout(function(){currentMonthEventCount()},0);
        }
    
    
    YAHOO[cal].render();
    
    var ylabel = ymform.appendChild(document.createTextNode("Year: "));
    var ytext = ymform.appendChild(document.createElement('input'));
    var ytextAttr = {'id':'yearInputTextBox', 'value':YAHOO[cal].pageDate.getFullYear(), 'maxlength':'6', 'size':'6', 'onKeyPress':'return numberfield(event)'};
    setAttributes(ytext, ytextAttr);
    
    var mlabel = ymform.appendChild(document.createTextNode("Month: "));
    var mbox = ymform.appendChild(document.createElement('select'));
    
    var mthlst = YAHOO[cal].Config.Locale.MONTHS_LONG;
    mbox.setAttribute('id','monthComboBox');
    for (var month in mthlst){
        var option = document.createElement('option');
        option.setAttribute('value', month);
        option.innerHTML = mthlst[month];
        mbox.appendChild(option);
    }

    
    var submit = ymform.appendChild(document.createElement('input'));
    submit.onclick = function(){
        // get year and month
        var yr = parseInt(document.getElementById('yearInputTextBox').value, 10);
        var mth = parseInt(document.getElementById('monthComboBox').value, 10);
        if (isNaN(yr) || isNaN(mth)){
            alert("destination year must be positive integer!");
        }
	gotoMonth(yr, mth+1);
    }
    submit.setAttribute('type','button');
    submit.setAttribute('value','goto');
    

    ymform.appendChild(document.createElement('BR'));
    ymform.appendChild(document.createElement('BR'));
    var divOptions = ymform.appendChild(document.createElement('DIV'));
    var formOptions = divOptions.appendChild(document.createElement('form'));
    var numEventBox = formOptions.appendChild(document.createElement('select'));
    numEventBox.setAttribute('id','numEventsPerDayComboBox');
    for (var i = 0; i<=10; i++){
        var option = document.createElement('option');
        option.setAttribute('value', i);
        option.innerHTML = i;
        if (i==5){
            option.setAttribute('selected','selected');
        }
        numEventBox.appendChild(option);
    }
    numEventBox.addEventListener('change',currentMonthEventCount,false);
    var numEventLabel = formOptions.appendChild(document.createTextNode('events per day'));

    calNav.cellPadding = 5;
    calNav.width = '100%';
    var tr = calNav.appendChild(document.createElement('TR'));
    var td1 = tr.appendChild(document.createElement('TD'));
    td1.align = 'center';
    var td2 = tr.appendChild(document.createElement('TD'));
    td2.align = 'center';
    var td3 = tr.appendChild(document.createElement('TD'));
    td3.align = 'center';
    var td4 = tr.appendChild(document.createElement('TD'));
    td4.align = 'center';
    var td5 = tr.appendChild(document.createElement('TD'));
    td5.align = 'center';
    
    var firstEventA = td1.appendChild(document.createElement('a'));
    var prevEventA = td2.appendChild(document.createElement('a'));
    var maxEventA = td3.appendChild(document.createElement('a'));
    var nextEventA = td4.appendChild(document.createElement('a'));
    var lastEventA =  td5.appendChild(document.createElement('a'));


    //when clicking navEventMonthGoto, must advance by at least one month to month with events, if possible
    navEventMonthGoto = function(navEventMth){ // just a wrapper
	return function(){
	    var pageMonth = YAHOO[cal].pageDate.getMonth() + 1;
	    var pageYear = YAHOO[cal].pageDate.getFullYear();
	    var navEventPair = navEventMth(EC,[pageYear, pageMonth]);
	    if (navEventPair != undefined){
		var yr = navEventPair[0];
		var mth = navEventPair[1];
		gotoMonth(yr, mth);
	    }
	}
    }

    prevEventA.gotoMonth = navEventMonthGoto(prevEventMonth);
    nextEventA.gotoMonth = navEventMonthGoto(nextEventMonth,1);
    prevEventA.onclick = prevEventA.gotoMonth;
    nextEventA.onclick = nextEventA.gotoMonth;

    prevEventA.innerHTML = '< previous event month';
    nextEventA.innerHTML = 'next event month >';

    maxEventA.gotoMonth =  function(){
      var maxEventPair = maxEventMonth(EC);
      var yr = maxEventPair[0];
      var mth = maxEventPair[1];
      gotoMonth(yr, mth);
    };

    maxEventA.onclick = maxEventA.gotoMonth;
    maxEventA.innerHTML = '(month with most events)';

    firstEventA.gotoMonth = function(){
	var dateArray = firstEvent(EC);
	if (dateArray!=null){
	    var yr = dateArray[0];
	    var mth = dateArray[1];
	    gotoMonth(yr, mth);
	} else {
	    //alert('no first event found');
	}
    }

    firstEventA.onclick = firstEventA.gotoMonth
    firstEventA.innerHTML = '<< first event';

    lastEventA.gotoMonth = function(){
	var dateArray = lastEvent(EC);
	if (dateArray!=null){
	    var yr = dateArray[0];
	    var mth = dateArray[1];
	    gotoMonth(yr, mth);
	} else {
	    //alert('no last event found');
	}
    }

    lastEventA.onclick = lastEventA.gotoMonth;
    lastEventA.innerHTML = 'last event >>';
}

