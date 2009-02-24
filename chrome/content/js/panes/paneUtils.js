/**
* Few General purpose utlity functions used in the panes
* oshani@csail.mit.edu 
*/

paneUtils = {};

// This is used to canonicalize an array
paneUtils.unique = function(a){
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++){
      for(var x = 0, y = r.length; x < y; x++){
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}

//To figure out the log URI from the full URI used to invoke the reasoner
paneUtils.extractLogURI = function(fullURI){
	var logPos = fullURI.search(/logFile=/);
	var rulPos = fullURI.search(/&rulesFile=/);
	return fullURI.substring(logPos+8, rulPos); 			
}
	
	
