
function TabulatorLogger () {
    this.document = Components.classes["@mozilla.org/xul/xul-document;1"].createInstance()

    this.TNONE = 0; 
    this.TERROR = 1;
    this.TWARN = 2;
    this.TMESG = 4;
    this.TSUCCESS = 8;
    this.TINFO = 16;
    this.TDEBUG = 32;
    this.TALL = 63;
    this.level = this.TERROR+this.TWARN+this.TMESG;
    this.ascending = false;

    this.ele=null;
    this.container=this.document.createElementNS('http://www.w3.org/1999/xhtml','html:div');

    this.msg = function (str, type, typestr) {
        if (!type) { type = this.TMESG; typestr = 'mesg'};
        if (!(tabulator.log.level & type)) return; //bitmask
        
        var addendum = this.document.createElementNS('http://www.w3.org/1999/xhtml','span');
        addendum.setAttribute('class', typestr);
        var now = new Date();
        addendum.innerHTML = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
                + " [" + typestr + "] "+ escapeForXML(str.toString()) + "<br/>";
        if (tabulator.log.ascending)
            this.container.appendChild(addendum);
        else
            this.container.insertBefore(addendum, this.container.firstChild);
    } //tabulator.log.msg

    this.warn = function(msg)    { this.msg(msg, this.TWARN, 'warn') };
    this.debug = function(msg)   { this.msg(msg, this.TDEBUG, 'dbug') };
    this.info = function(msg)    { this.msg(msg, this.TINFO, 'info') };
    this.error = function(msg)   { this.msg(msg, this.TERROR, 'eror') };
    this.success = function(msg) { this.msg(msg, this.TSUCCESS, 'good') };

    this.clear = function(){
        //x.innerHTML = "";
        //TODO: Is emptyNode out of scope? I dunno.
        emptyNode(this.container);
    } //clearStatus

    this.setLevel = function(x) {
        tabulator.log.level = this.TALL;
        tabulator.log.debug("Log level is now "+x);
        tabulator.log.level = x;
    }

    this.dumpStore = function(){
        var l = tabulator.log.level
        tabulator.log.level = this.TALL;
        tabulator.log.debug("Store:");
        tabulator.log.debug(tabulator.kb.toString());
        tabulator.log.debug("__________________");
        tabulator.log.level = l;
    }

    this.setContainer = function(newContainer) {
        this.ele = newContainer;
        this.ele.appendChild(this.container);
    }
}