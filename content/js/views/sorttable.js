//addEvent(window, "load", sortables_init);

var SORT_COLUMN_INDEX;

// 
function sortables_init() {
  //alert("Entered sortables_init");
  // Find all tables with class sortable and make them sortable
  if (!document.getElementsByTagName) return;
  tbls = document.getElementsByTagName("table");
  //alert(tbls);
  //alert(tbls.length);
  for (ti=0;ti<tbls.length;ti++) {
    thisTbl = tbls[ti];
    //alert((' '+thisTbl.className+' ').indexOf("sortable"))
    if (((' '+thisTbl.className+' ').indexOf("sortable") != -1) && (thisTbl.id)) {
      //initTable(thisTbl.id);
      //alert ("yes! " + thisTbl.id);
      ts_makeSortable(thisTbl);
    }
  }
}

function ts_makeSortable(table) {
  //alert("Entered ts_makeSortable");
  var firstRow; //first childNode of the table. for some reason rows doesn't work?!
  tabulator.log.debug("making sortable: " + table.id + table.rows + table.rows.length + table.childNodes.length);
  // tabulator.log.debug("table contents: " + table.innerHTML); Long!
  //if (table.rows && table.rows.length > 0) {
  if (table.childNodes && table.childNodes.length > 0) {
    //tabulator.log.debug("found first row");
    firstRow = table.firstChild;
  }
  if (!firstRow) {
    tabulator.log.warn("no first row found"); return;
  } //stop
  
  // We have a first row: assume it's the header, and make its contents clickable links
  for (var i=0;i<firstRow.cells.length;i++) {
    var cell = firstRow.cells[i];
    var txt = ts_getInnerText(cell);
//NOTE THAT I HAVE REMOVED SPACING AND FUNCTIONS ASSOCIATED WITH REMOVECOLUMN BECAUSE
//THE FUNCTION DOESN"T EXIST --ALERER
    tabulator.log.debug("making header clickable: " + txt); // See style sheet: float right changes order!
    cell.innerHTML = 
    //'<img src="icons/tbl-x-small.png" onclick="deleteColumn(this)" title="Delete Column." class="deleteCol"> </img>' +
    '<a href="#" class="sortheader" onclick="ts_resortTable(this);return false;">' +
        '<span class="sortarrow"></span>' + txt+'</a>'
        //alert(cell.innerHTML);
  }
}

function ts_getInnerText(el) {
  if (typeof el == "string") {alert("string"); return el;}
  if (typeof el == "undefined") {alert("undefined"); { return el };}
  if (el.innerText) {alert("third cond"); return el.innerText; } //Not needed but it is faster
  var str = "";
  
  var cs = el.childNodes;
  var l = cs.length;
  for (var i = 0; i < l; i++) {
    switch (cs[i].nodeType) {
    case 1: //ELEMENT_NODE
        str += ts_getInnerText(cs[i]);
      break;
    case 3: //TEXT_NODE
        str += cs[i].nodeValue;
      break;
    }
  }
  //tabulator.log.debug("got inner text: " + str);
  return str;
}

function ts_resortTable(lnk) {
  // get the span
  //tabulator.log.debug ("entering ts_resortTable");
  var span;
  //var th = lnk.parentNode;
  //alert(th.innerHTML);
  for (var ci=0;ci<lnk.childNodes.length;ci++) {
    if (lnk.childNodes[ci].tagName && lnk.childNodes[ci].tagName.toLowerCase() == 'span') span = lnk.childNodes[ci];
  }
  var spantext = ts_getInnerText(span);
  var td = lnk.parentNode;
  var column = td.cellIndex;
  var table = getParent(td,'TABLE');
  //tabulator.log.debug("got spantext,td,column,table: " + spantext + td + column + table);
  
  // Work out a type for the column
  //if (table.rows.length <= 1) return;
  if (table.childNodes.length <= 1) return;
  //tabulator.log.debug("getting sort type...");
  var itm = ts_getInnerText(table.lastChild.cells[column]); //test data, so to speak
  sortfn = ts_sort_caseinsensitive;
  if (itm.match(/^\d\d[\/-]\d\d[\/-]\d\d\d\d$/)) sortfn = ts_sort_date;
  if (itm.match(/^\d\d[\/-]\d\d[\/-]\d\d$/)) sortfn = ts_sort_date;
  if (itm.match(/^[£$]/)) sortfn = ts_sort_currency;
  if (itm.match(/^[\d\.]+$/)) sortfn = ts_sort_numeric;
  SORT_COLUMN_INDEX = column;
  //tabulator.log.debug("sort type selected: " + sortfn);
  var firstRow = new Array();
  var newRows = new Array();
  //for (i=0;i<table.rows[0].length;i++) { firstRow[i] = table.rows[0][i]; }
  //for (j=1;j<table.rows.length;j++) { newRows[j-1] = table.rows[j]; }
  for (i=0;i<table.firstChild.length;i++) { firstRow[i] = table.firstChild[i]; }
  for (j=1;j<table.childNodes.length;j++) { newRows[j-1] = table.childNodes[j]; }
  
  //tabulator.log.debug ("calling array sort fn");
  newRows.sort(sortfn);
  
  if (span.getAttribute("sortdir") == 'down') {
    ARROW = document.createElement('img');
    ARROW.setAttribute('src', 'icons/tbl-up.png');
    ARROW.setAttribute('height', '10');
    ARROW.setAttribute('width', '10');
    ARROW.setAttribute('border','none');
    newRows.reverse();
    span.setAttribute('sortdir','up');
  } else {
    //ARROW = '&nbsp;&nbsp;&darr;';
    ARROW = document.createElement('img');
    ARROW.setAttribute('src', 'icons/tbl-down.png');
    ARROW.setAttribute('height', '10');
    ARROW.setAttribute('width', '10');
    ARROW.setAttribute('border','none');
    span.setAttribute('sortdir','down');
  }
  
  //tabulator.log.debug ("moving rows around");
    // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
    // don't do sortbottom rows
  for (i=0;i<newRows.length;i++) {
    if (!newRows[i].className || (newRows[i].className
        && (newRows[i].className.indexOf('sortbottom') == -1)))
    table.appendChild(newRows[i]);
    }
    // do sortbottom rows only
  for (i=0;i<newRows.length;i++) { if (newRows[i].className && (newRows[i].className.indexOf('sortbottom') != -1)) table.appendChild(newRows[i]);}
  
    // Delete any other arrows there may be showing
  var allspans = document.getElementsByTagName("span");
  for (var ci=0;ci<allspans.length;ci++) {
    if (allspans[ci].className == 'sortarrow') {
      if (getParent(allspans[ci],"table") == getParent(lnk,"table")) { // in the same table as us?
        allspans[ci].innerHTML = '';
      }
    }
  }
  
  span.appendChild(ARROW); // the border around it might be a CSS style
}

function getParent(el, pTagName) {
  if (el == null) return null;
  else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase())  // Gecko bug, supposed to be uppercase
    return el;
  else
    return getParent(el.parentNode, pTagName);
}
function ts_sort_date(a,b) {
    // y2k notes: two digit years less than 50 are treated as 20XX, greater than 50 are treated as 19XX
  aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
  bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
  if (aa.length == 10) {
    dt1 = aa.substr(6,4)+aa.substr(3,2)+aa.substr(0,2);
  } else {
    yr = aa.substr(6,2);
    if (parseInt(yr) < 50) { yr = '20'+yr; } else { yr = '19'+yr; }
    dt1 = yr+aa.substr(3,2)+aa.substr(0,2);
  }
  if (bb.length == 10) {
    dt2 = bb.substr(6,4)+bb.substr(3,2)+bb.substr(0,2);
  } else {
    yr = bb.substr(6,2);
    if (parseInt(yr) < 50) { yr = '20'+yr; } else { yr = '19'+yr; }
    dt2 = yr+bb.substr(3,2)+bb.substr(0,2);
  }
  if (dt1==dt2) return 0;
  if (dt1<dt2) return -1;
  return 1;
}

function ts_sort_currency(a,b) { 
  aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g,'');
  bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g,'');
  return parseFloat(aa) - parseFloat(bb);
}

function ts_sort_numeric(a,b) { 
  aa = parseFloat(ts_getInnerText(a.cells[SORT_COLUMN_INDEX]));
  if (isNaN(aa)) aa = 0;
  bb = parseFloat(ts_getInnerText(b.cells[SORT_COLUMN_INDEX])); 
  if (isNaN(bb)) bb = 0;
  return aa-bb;
}

function ts_sort_caseinsensitive(a,b) {
  aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]).toLowerCase();
  bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]).toLowerCase();
  if (aa==bb) return 0;
  if (aa<bb) return -1;
  return 1;
}

function ts_sort_default(a,b) {
  aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
  bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
  if (aa==bb) return 0;
  if (aa<bb) return -1;
  return 1;
}
