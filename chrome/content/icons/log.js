//TODO: tabulator = {} should be moved to some file that is loaded before
//      all of the other ones are, so that its declaration isn't in a
//      really strange place.
var tabulator = {};
tabulator.log = {};

/////////////////////////  Logging
//
//bitmask levels
TNONE = 0; 
TERROR = 1;
TWARN = 2;
TMESG = 4;
TSUCCESS = 8;
TINFO = 16;
TDEBUG = 32;
TALL = 63;

tabulator.log.level=TERROR+TWARN+TMESG;
tabulator.log.ascending=false;

function escapeForXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

tabulator.log.msg =function (str, type, typestr) {
    if (!type) { type = TMESG; typestr = 'mesg'};
    if (!(tabulator.log.level & type)) return; //bitmask
    var log_area = document.getElementById('status');
    if (!log_area) return;
    
    var addendum = document.createElement("span");
    addendum.setAttribute('class', typestr);
    var now = new Date();
    addendum.innerHTML = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
            + " [" + typestr + "] "+ escapeForXML(str) + "<br/>";
    if (tabulator.log.ascending)
        log_area.appendChild(addendum);
    else
        log_area.insertBefore(addendum, log_area.firstChild);
} //tabulator.log.msg

tabulator.log.warn = function(msg) { tabulator.log.msg(msg, TWARN, 'warn') };
tabulator.log.debug = function(msg)   { tabulator.log.msg(msg, TDEBUG, 'dbug') };
tabulator.log.info = function(msg)    { tabulator.log.msg(msg, TINFO, 'info') };
tabulator.log.error = function(msg)   { tabulator.log.msg(msg, TERROR, 'eror') };
tabulator.log.success = function(msg) { tabulator.log.msg(msg, TSUCCESS, 'good') };

/** clear the log window **/
tabulator.log.clear = function(){
    var x = document.getElementById('status');
    if (!x) return;
    //x.innerHTML = "";
    emptyNode(x);
} //clearStatus

/** set the logging level **/
tabulator.log.setLevel = function(x) {
    tabulator.log.level = TALL;
    tabulator.log.debug("Log level is now "+x);
    tabulator.log.level = x;
}

tabulator.log.dumpStore = function(){
    var l = tabulator.log.level
    tabulator.log.level = TALL;
    tabulator.log.debug("\nStore:\n" + kb + "__________________\n");
    tabulator.log.debug("subject index: " + kb.subjectIndex[0] + kb.subjectIndex[1]);
    tabulator.log.debug("object index: " + kb.objectIndex[0] + kb.objectIndex[1]);
    tabulator.log.level = l;
}

tabulator.log.dumpHTML = function(){
    var l = tabulator.log.level;
    tabulator.log.level = TALL;
    tabulator.log.debug(document.innerHTML);
    tabulator.log.level = l
}