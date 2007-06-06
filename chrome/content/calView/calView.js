// scripts for yahoo calendar view

// Yahoo! does not host the YUI Library components for public use


//include('calView/timeline/api/timeline-api.js');
include('calView/yahoo.js');
include('calView/dom.js');
include('calView/event.js');
include('calView/calendar.js');
include('calView/loadEvents.js');
include('calView/bigCal.js');
include('calView/timeline/api/loadQueryEvents.js');


function include(linkstr){
    var lnk = document.createElement('script');
    lnk.setAttribute('type', 'text/javascript');
    lnk.setAttribute('src', linkstr);
    document.getElementsByTagName('head')[0].appendChild(lnk);
    return lnk;
}

function include_css(linkstr) {
    var lnk = document.createElement('link');
    lnk.setAttribute('rel', 'stylesheet');
    lnk.setAttribute('type', 'text/css');
    lnk.setAttribute('href', linkstr);
    document.getElementsByTagName('head')[0].appendChild(lnk);
    return lnk;
}
// add calendar stylesheet
include_css('calView/assets/calendar.css');
include_css('calView/assets/bigCal.css');


function addStyle(str){
	var style = document.createElement('style');
	style.innerHTML=str;
    document.getElementsByTagName('head')[0].appendChild(style);
    return style;
}

addStyle('td.holiday{background-color:yellow;font-weight:bold;}');

// @param assoc   : object   // associative array (javascript object)
// assoc maps attributes to values.
// @param obj     : object   // target object
function setAttributes(obj,assoc){
    for (key in assoc){
	var value = assoc[key];
	obj.setAttribute(key, value);
    }
}
