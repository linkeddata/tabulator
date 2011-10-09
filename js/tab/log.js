// Log of diagnositics -- non-extension versions

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

tabulator.log.alert = alert;
tabulator.log.level=TERROR+TWARN+TMESG;
tabulator.log.ascending = false;

tabulator.log.msg = function (str, type, typestr) {
    if (!type) { type = TMESG; typestr = 'mesg'};
    if (!(tabulator.log.level & type)) return; //bitmask
    
    if (typeof document != 'undefined') { // Not AJAX environment

        
        var log_area = document.getElementById('status');
        if (!log_area) return;
        
        // Local version to reduce dependencies
        var escapeForXML = function(str) { // don't use library one in case ithasn't been loaded yet
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        };
        
        var addendum = document.createElement("span");
        addendum.setAttribute('class', typestr);
        var now = new Date();
        addendum.innerHTML = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
                + " [" + typestr + "] "+ escapeForXML(str) + "<br/>";
        if (!tabulator.log.ascending)
            log_area.appendChild(addendum);
        else
            log_area.insertBefore(addendum, log_area.firstChild);


    } else if (typeof console != 'undefined') { // node.js
        console.log(msg);
        
    } else {
        var f = (dump ? dump : print );
        if (!f) throw "log: No way to output message: "+str;
        f("Log: "+str + '\n');
    }
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
    if (1) { // For Henry Story
        var sz = Serializer();
        //sz.suggestNamespaces(kb.namespaces);
        str = sz.statementsToN3(kb.statements);
        tabulator.log.level = TALL;
        tabulator.log.debug('\n'+str);
    } else {  // crude
        tabulator.log.level = TALL;
        tabulator.log.debug("\nStore:\n" + kb + "__________________\n");
        tabulator.log.debug("subject index: " + kb.subjectIndex[0] + kb.subjectIndex[1]);
        tabulator.log.debug("object index: " + kb.objectIndex[0] + kb.objectIndex[1]);
    }
    tabulator.log.level = l;
}

tabulator.log.dumpHTML = function(){
    var l = tabulator.log.level;
    tabulator.log.level = TALL;
    tabulator.log.debug(document.innerHTML);
    tabulator.log.level = l
}