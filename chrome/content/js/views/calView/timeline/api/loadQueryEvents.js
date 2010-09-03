Timeline.DefaultEventSource.prototype.loadQueryEvents = function(queryEvents) {
    var added = false;
    for (var i in queryEvents){
	var e = queryEvents[i];
	var evt = new Timeline.DefaultEventSource.Event
	    (e.startDate, //start
	     e.endDate,   //end
	     e.startDate, //latest start
	     e.endDate,   //earliest end
	     e.endDate.getTime() == e.startDate.getTime(),//( e.endDate.getTime() - e.startDate.getTime())<1000 , 
	     //(not isDuration)... if start end are in same second
	     e.summary,   //title
	     e.info.innerHTML  //description. info bubble like mapview?
	     //null,        //img
	     //null,        //link
	     //null,        //icon
	     //null,        //color
	     //null         //textcolor
	     );
	evt._node = e; //node;
	evt.getProperty = function(name) {
	    return this._node.getAttribute(name);
	    // definitely totaly useless
	};
	
	this._events.add(evt);
	
	added = true;
    }
    
    if (added) {
	for (var i = 0; i < this._listeners.length; i++) {
	    this._listeners[i].onAddMany();
	}
    }
};

