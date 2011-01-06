// scripts for yahoo calendar view

// Yahoo! does not host the YUI Library components for public use


//include('calView/timeline/api/timeline-api.js');
include('js/calView/yahoo.js');
include('js/calView/dom.js');
include('js/calView/event.js');
include('js/calView/calendar.js');
include('js/calView/loadEvents.js');
include('js/calView/bigCal.js');
include('js/calView/timeline/api/loadQueryEvents.js');


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
include_css('js/calView/assets/calendar.css');
include_css('js/calView/assets/bigCal.css');


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
