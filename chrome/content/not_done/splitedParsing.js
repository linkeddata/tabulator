/* an abandoned approach, attemps to parse a RDFDocument in several times */ 

		if (this.dom.documentElement.childNodes.length < 1000){
		    parser.parse(this.dom, xhr.uri.uri, xhr.uri)
		    kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'),sf.appNode);
		    cb()
		    
		}else{
		    var parts = 6; //4 and 6 are OK but 10 is not...this is totally strange
		    var splited = Util.document.split(this.dom, parts);
		    parser.parse(splited[0], xhr.uri.uri, xhr.uri);
		    //for (var i=1;i<3;i++){
		    var i = 2
		        
    		    setInterval(function(){
    		        tabulator.log.warn("Parsing the "+i+"th part of the document");
    		        sf.addStatus(xhr, "Parsing the "+i+"th part of the document");
	    	        parser.parse(splited[i-1], xhr.uri.uri, xhr.uri);
	    	        tabulator.log.warn(i+"th part of the document parsed");	    	        
	    	        if (i==parts){
		                kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'),sf.appNode);
		                cb();
		                UniversalTimer.cancel();
		            }
		            i++;		        
		        },1000);
		        
		        //setInterval(function(){tabulator.log.warn('This is a timer test')},1000);
		    //}
		    /*
    		setTimeout(function(){
    		    sf.addStatus(xhr, "Parsing the "+4+"th part of the document");    		
	    	    parser.parse(splited[i], xhr.uri.uri, xhr.uri);
		        kb.add(xhr.uri, tabulator.ns.rdf('type'), tabulator.ns.link('RDFDocument'),sf.appNode);
		        cb();	        
		    },5000*4);
		    */		    
		//}
		
var UniversalTimer = Components.classes["@mozilla.org/timer;1"]
                     .getService(Components.interfaces.nsITimer);
function setInterval(cb, delay) {
    var timerCallback = {
        QueryInterface: function(aIID) {
            if (aIID.equals(Components.interfaces.nsISupports)
              || aIID.equals(Components.interfaces.nsITimerCallback))
                return this;
            throw Components.results.NS_NOINTERFACE;
        },
        notify: function () {
            cb();
        }
    }; 
    UniversalTimer.initWithCallback(timerCallback,delay,UniversalTimer.TYPE_REPEATING_SLACK);
}    