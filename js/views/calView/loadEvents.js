
/* one way to add events to the calendar would be to add cell renderers 
 * that add content to the cell.
 * In any case, using cell-rendering to add events would be silly,
 * with n^2 growth
 */


// testing placing content inside a calendar cell.
// write 'foo' on 2006/3/22

/* returns the calendar cell associated with the calendar and date
 * @param calName	:	string	//specify calendar name. ex: "cal1"
 * @param aDate		:	array	//date field array. ex: [2004,5,25]
 *
 * there are many other ways to do this
 * 
 */
/* getCalCell2 deprecated. see getCalCell below */
function getCalCell2(calName, aDate){
	function parseForAnchor(aDate){
		var y = aDate[0]
			var m = aDate[1]
			var d = aDate[2]
			return '__'+y+'_'+m+'_'+d
			}
	
	var targetDate = parseForAnchor(aDate);
	var targetA=document.getElementsByName('YAHOO.'+calName+targetDate)[0];
	return (targetA!=null) ? targetA.parentNode : null;
}

// use cellDates and cells of calendar. assumes Calendar_Core, which has field cellDates
// aDate: an array of [y,m,d]

function gccCalendarCore(cal, aDate){
    var date = new Date(aDate[0], aDate[1]-1, aDate[2]);
    // to avoid '10' being interpreted as '1910'
    date.setFullYear(aDate[0]);
    if (!cal.isDateOOM(date)){
      // find cell
      var cellIndex = indexOfDateInArray(aDate, cal.cellDates);
      if (cellIndex > -1){
	  return cal.cells[cellIndex];
      }
    }
    return null;
}

function getCalCell(calName, aDate){
	var cal = YAHOO[calName];
	if (cal instanceof YAHOO.widget.Calendar_Core){
      return gccCalendarCore(cal, aDate);
	} else if (cal instanceof YAHOO.widget.CalendarGroup){
		// cal.setChildFunction(fnName, fn);
		// cal.CallChildFunction(fnName);
      for (var p=0; p<cal.pageCount;++p){
        var page = cal.pages[p];
        if (page instanceof YAHOO.widget.Calendar_Core){
          var cell = gccCalendarCore(page, aDate);
          if (cell!=undefined){return cell;}
        }
      }
	}
	return null;
}

// dates of format: [y,m,d]
function dateInRange(testDate, minDate, maxDate){
	function numInRange(testN, minN, maxN){
		return (testN >= minN && testN <= maxN);
	}

	// could be done with &&'s
	for (i = 0; i < testDate.length; i++){
		if (!numInRange(testDate[i], minDate[0], maxDate[0])){
			return false;
		}
	}

	return true;
}

/* retrieves the names of calendars that were made
 * and returns an array of "cal1","cal2" strings
 * *deprecated*
 */
function getCalIds(){
	var calsfound = new Array()
	for (key in YAHOO){
		if (key.indexOf("cal") == 0){
			calsfound.push(key)
		}
	}
	return calsfound
}
