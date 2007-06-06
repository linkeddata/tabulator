
// test variables

var startYear = 1997;
// startMonth should be at least 5 months before end of year
var startMonth = 5;
// startDate should be at least 5 days before end of month
var startDate = 6;

var startHour = 13;
var startMinutes = 42;
var startSeconds = 30;

var endHour = 15;
var endMinutes = 0;
var endSeconds = 49;

function makeTimeStr(hour, min, sec){
    return hour + ":" + min + ":" + sec;
}
var startTimeStr = makeTimeStr(startHour, startMinutes, startSeconds);
var endTimeStr = makeTimeStr(endHour, endMinutes, endSeconds);

var start2Year = 2006;
var start2Month = 11; // months are 0-indexed
var start2Date = 29;

var start2Hour = 2;
var start2Minutes = 4;
var start2Seconds = 59;

var start2TimeStr = makeTimeStr(start2Hour, start2Minutes, start2Seconds);

function dateObjtime(time){
    var date = new Date();
    date.setTime(time);
    return date;
}

// date objects created by dateObjYMD are guaranteed to have 0 for hours, minutes, seconds
function dateObjYMD(year,month,date){
    var date = new Date(year,month,date);
    date.setFullYear(year);
    return date;
}

function cloneDateObj(dateObj){
    return dateObjtime(dateObj.getTime());
}

// event start date with time (hours, minutes, seconds) 0
var evtStartdate = dateObjYMD(startYear, startMonth, startDate);
function testEvtStartDate(){
    assertEquals("startMonth is 5", 5, startMonth);
    evtStartdate.setMonth(startMonth);
    assertEquals("evtStartDate set month " + startMonth + " but now has " + evtStartdate.getMonth(), startMonth, evtStartdate.getMonth());
    confirmDateObj(startYear, startMonth, startDate, evtStartdate, 'evtStartdate');
}

function testDateMath(){
    var today = dateObjYMD(1986,3,22);
    assertTrue("today should be a date", (today instanceof Date));
    today.setMonth(5);
    assertEquals("today should be have month 5 but:" + today, 5, today.getMonth());
}

var evtStart2date = dateObjYMD(start2Year, start2Month, start2Date);

var evtStartArray = [startYear,(startMonth + 1),startDate];
var evtStart2Array = [start2Year,(start2Month + 1),start2Date];

// event start date with time
function setHMS(dateObj, hour, min, sec){
    dateObj.setHours(hour);
    dateObj.setMinutes(min);
    dateObj.setSeconds(sec);
}
var evtStartdateWithTime = cloneDateObj(evtStartdate);
setHMS(evtStartdateWithTime, startHour, startMinutes, startSeconds);

var evtStart2dateWithTime = cloneDateObj(evtStart2date);
setHMS(evtStart2dateWithTime, start2Hour, start2Minutes, start2Seconds);

// end date same as start date
var evtEnddate = cloneDateObj(evtStartdate);
var evtEnddateArray = [startYear,(startMonth + 1),startDate];

// end date one day after start date
var evtEnddateOneDayLater = dateObjYMD(startYear,startMonth,startDate+1);
var evtEnddateOneDayLaterArray = [startYear,(startMonth + 1),startDate + 1];

// end date one month after start date
var evtEnddateOneMonthLater = dateObjYMD(startYear,startMonth+1,startDate);
var evtEnddateOneMonthLaterArray = [startYear,(startMonth + 1 + 1),startDate];

// end date one month after start date
var evtEnddateOneYearLater = dateObjYMD(startYear+1,startMonth, startDate);
var evtEnddateOneYearLaterArray = [startYear + 1,(startMonth + 1),startDate];

// assuming startDate is at least 5 days before end of month
// end date 4 (several) days after start date
var evtEnddateFourDaysLater = dateObjYMD(startYear,startMonth,startDate+4);
var evtEnddateFourDaysLaterArray = [startYear,(startMonth + 1),startDate + 4];

// assuming startMonth is at least 5 months before end of year
// end date 4 (several) months after start date
var evtEnddateFourMonthsLater = dateObjYMD(startYear,startMonth+4,startDate);
var evtEnddateFourMonthsLaterArray = [startYear,(startMonth + 1 + 4),startDate];

// end date 4 (several) years after start date
var evtEnddateFourYearsLater = dateObjYMD(startYear+4,startMonth,startDate);
var evtEnddateFourYearsLaterArray = [startYear + 4,(startMonth + 1),startDate];

var longagoYear = 1;
var longagoMonth = 1;
var longagoDate = 1;

var longago = dateObjYMD(longagoYear, longagoMonth, longagoDate);

var longagoArray = [longagoYear,longagoMonth+1,longagoDate];


var allStartArrays = [evtStartArray, 
		      evtStart2Array];
		     
var allEndArrays = [evtEnddateArray, 
		    evtEnddateOneDayLaterArray,
		    evtEnddateOneMonthLaterArray,
		    evtEnddateOneYearLaterArray,
		    evtEnddateFourDaysLaterArray,
		    evtEnddateFourMonthsLaterArray,
		    evtEnddateFourYearsLaterArray];

var miscArrays = [longagoArray];

var allDateArrays = allStartArrays.concat(allEndArrays).concat(miscArrays);

var allStartObjs =[evtStartdate,
		   evtStart2date];

var allEndObjs = [evtEnddate,
		  evtEnddateOneDayLater,
		  evtEnddateOneMonthLater,
		  evtEnddateOneYearLater,
		  evtEnddateFourDaysLater,
		  evtEnddateFourMonthsLater,
		  evtEnddateFourYearsLater];
		   
var miscObjs = [longago];

var allDateObjs =  allStartObjs.concat(allEndObjs).concat(miscObjs);

var allStartNames = ['evtStartdate',
		     'evtStart2date'];

var allEndNames = ['evtEnddate',
		   'evtEnddateOneDayLater',
		   'evtEnddateOneMonthLater',
		   'evtEnddateOneYearLater',
		   'evtEnddateFourDaysLater',
		   'evtEnddateFourMonthsLater',
		   'evtEnddateFourYearsLater'];

var miscNames = ['longago'];

var allDateNames = allStartNames.concat(allEndNames).concat(miscArrays);



function confirmDateObj(year, month, date, dateObj, dateObjname){
    assertEquals(dateObjname + " should have year " + year + " dateObj:" + dateObj.toString(), year, dateObj.getFullYear());
    assertEquals(dateObjname + " should have month " + month + " (months are zero indexed)" + " dateObj:" + dateObj.toString(),month, dateObj.getMonth());
    assertEquals(dateObjname + " should have date " + date + " dateObj:" + dateObj.toString(), date, dateObj.getDate());

}

// making sure are test variables are valid

function testDateObjects(){
    assertEquals("should have same number of datearrays as dateobjs",allDateArrays.length, allDateObjs.length);
    assertEquals("should have same number of date names as dateobjs",allDateObjs.length, allDateNames.length);
    for (var i = 0; i < allDateObjs.length; i++){
	var datearray = allDateArrays[i];
	var dateobj = allDateObjs[i];
	var datename = allDateNames[i];
	confirmDateObjWithArray(datearray, dateobj, datename);
    }
}

function confirmDateObjWithArray(datearray, dateobj, datename){
	var year = datearray[0];
	var month = datearray[1] - 1;
	var date = datearray[2];
	confirmDateObj(year, month, date, dateobj, datename);
}

// testing dateArray2Date
function confirmFunctionArraytoDateObj(dateArray, dateObjname){
    var newname = "new" + dateObjname;
    var newdateObj = dateArray2Date(dateArray);
    confirmDateObjWithArray(dateArray, newdateObj, newname);
}

function testArray2Date(){
    for (var i = 0; i < allDateObjs.length; i++){
	var dateArray = allDateArrays[i];
	var dateObj = allDateObjs[i];
	var dateName = allDateNames[i];
	confirmFunctionArraytoDateObj(dateArray, dateName);
    }
}


//function Event(startArray, startTime, endArray, endTime, summary, obj, qid, info, colorCellCss)
// create array of events to work with

var eventArray0 = new Array();
var eventArray1 = new Array();

for (var s = 0; s < allStartObjs.length; s++){
    var startArray = allStartArrays[s];
    var startObj = allStartObjs[s];
    var startName = allStartNames[s];
    var startTime = startTimeStr;
    for (var e = 0; e < allEndObjs.length; e++){
	var endArray = allEndArrays[e];
	var endObj = allEndObjs[e];
	var endName = allEndNames[e];
	var endTime = endTimeStr;
	var eventNumber = eventArray0.length; //(s*allEndObjs.length) + e;
	var summary = "event " + eventNumber + " " + startName + " " + endName;
	var colorCellCss  = document.createElement('style');
	// assign all events the same query i
	var qid = 0;
	var info = document.createTextNode("info:" + summary);
	var obj = null;
	var event = new Event(startArray, startTime, endArray, endTime, summary, obj, qid, info, colorCellCss);
	var eventduplicate = new Event(startArray, startTime, endArray, endTime, summary, obj, qid, info, colorCellCss);
	eventArray0.push(event);
	eventArray1.push(eventduplicate);
    }
}


// each event has an id. this id helps filter out duplicates in the calendar. 
// when the event doesn't have a corresponding rdf object, must compare event start/end times and summary.
function testEventDuplicateId(){
    // events created with the same parameters should end up with the same id.
    for (var i = 0; i < eventArray0.length; i++){
	var event = eventArray0[i];
	var eventduplicate = eventArray1[i];
	var eventName = "event" + i;
	assertEquals(eventName + " should have same id as " + eventName + "duplicate", event.id, eventduplicate.id);
    }
}



function testGetSlot1(){
    var testArray1 = new Array();
    var arrayKey = allStartArrays[0];
    var slot = getSlot(arrayKey, testArray1);
    assertTrue("testArray1 should have slot for arrayKey:" + arrayKey.toString(), (testArray1[arrayKey[0]][arrayKey[1]][arrayKey[2]]!=undefined));
}

// placing events in the EC (event calendar) with getSlot



// should initialize the 'slots' specified by the arrayKeys (first argument)
// as empty arrays
		     
function testGetSlot(){
    var testArray0 = new Array();
    // should return empty arrays
    for (var i = 0; i < allDateArrays.length; i++){
	var arrayKey = allDateArrays[i];
	assertTrue("arrayKey should be an array", (arrayKey instanceof Array));
	assertEquals("arrayKey should have length 3", 3, arrayKey.length);
	var slot = getSlot(arrayKey, testArray0);
	assertTrue("slot from getSlot should be an empty array", (slot instanceof Array));
	assertTrue("getslot should return empty array for this array key " + arrayKey,
		   isEmpty(slot));
    }
    assertTrue("testArray0 should be defined", (testArray0!=undefined));
    assertTrue("testArray0 should no longer be empty", !isEmpty(testArray0));

    // make sure all the slots defined by the datearrays are simply empty arrays
    function helper(arrayTree, arrayKey){
	var level = arrayTree;
	for (var i = 0; i < arrayKey.length; i++){
	    var key = arrayKey[i];
	    level = level[key];
	    assertTrue("slot should be defined. arrayTreeLevel:" + level + " key:" + key.toString(), (level!=undefined));
	}
	assertTrue("slot defined by datearray should be an array foo " + arrayKey.toString() + " but:" + level + " at i = " + i, (level instanceof Array));
	assertTrue("array slot defined by datearray should be empty", isEmpty(level));
    }
    for (var i = 0; i < allDateArrays.length; i++){
	var arrayKey = allDateArrays[i];
	helper(testArray0, arrayKey);
    }

}

function testEventTree(){
  for (var i = 0; i < eventArray0.length; i++){
    var event = eventArray0[i];
    var arrayKey = event.startArray;
    
  }
}
