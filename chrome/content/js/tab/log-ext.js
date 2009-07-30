
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

    this.msg = function (str, type, typestr, arg) {
        if (!type) { type = this.TMESG; typestr = 'mesg'};
        if (!(tabulator.log.level & type)) return; //bitmask //do we have to use this fancy method?
        
        str = str.toString(); //type casting (require (= (type str) 'string))
        if (arg && arg.length > 1) {
            var subs = Array.prototype.slice.call(arg); // a magic for arguments -> Array
            subs.shift();
            str = tabulator.rdf.Util.string.template(str, subs)
        }        
        
        var addendum = this.document.createElementNS('http://www.w3.org/1999/xhtml','span');
        addendum.setAttribute('class', typestr);
        var now = new Date();
        addendum.innerHTML = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
                + " [" + typestr + "] "+ tabulator.Util.escapeForXML(str) + "<br/>";
        if (tabulator.log.ascending)
            this.container.appendChild(addendum);
        else
            this.container.insertBefore(addendum, this.container.firstChild);
    } //tabulator.log.msg

    //Kenny wonders what is the impact of logging on performance...
    this.warn = function(msg)    { this.msg(msg, this.TWARN, 'warn', arguments) };
    this.debug = function(msg)   { this.msg(msg, this.TDEBUG, 'dbug', arguments) };
    this.info = function(msg)    { this.msg(msg, this.TINFO, 'info', arguments) };
    this.error = function(msg)   { this.msg(msg, this.TERROR, 'eror', arguments) };
    this.success = function(msg) { this.msg(msg, this.TSUCCESS, 'good', arguments) };

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
        var doc = newContainer.ownerDocument;
        this.ele = newContainer; //this.ele is not used anywhere in this code, used elsewhere?
        this.document = doc;                
        try{
            //this is necessary in Firefox3, but throws a NOT_IMPLEMENTED error in firefox 2
            doc.adoptNode(this.container);
        }catch(e){tabulator.log.warn('Error catched by Tabulator:'+e);}
        this.ele.appendChild(this.container);
    }
}