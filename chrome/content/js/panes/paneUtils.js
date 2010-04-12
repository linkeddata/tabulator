/**
* Few General purpose utlity functions used in the panes
* oshani@csail.mit.edu 
*/

paneUtils = {};


//These are horrible global vars. To minimize the chance of an unintended name collision
//these are prefixed with 'ap_' (short for air pane) 
var ap_air = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
var ap_tms = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
var ap_compliant = ap_air('compliant-with');
var ap_nonCompliant = ap_air('non-compliant-with');
var ap_antcExpr = ap_tms('antecedent-expr');
var ap_just = ap_tms('justification');
var ap_subExpr = ap_tms('sub-expr');
var ap_description = ap_tms('description');
var ap_ruleName = ap_tms('rule-name');
var ap_prem = ap_tms('premise');
var ap_instanceOf = ap_air('instanceOf');

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
	
/**
ExtractFileURIs method was changed to extract all the URIs and load from the source fetcher. So, instead of the object that has several properties including the 'rulesFile', 'sender', 'receiver', etc. Now we just spit out all the individual components of the URI */
paneUtils.extractFileURIs = function(fullURI){

    fullURI = unescape(fullURI); //Otherwise we have to account for the escaped characters -- ugly!
    
    var re = /\s*(?:[&?]logFile=)|(?:[&?]rulesFile=)|(?:[&?]sender=)|(?:[&?]receiver=)|(?:[&?]data=)|(?:[&?]dataParsed=)\s*/;
    uris=fullURI.toString().split(re);
	return uris; 			
}
	
//Extract and lookup all the files, so that the labels appear properly
paneUtils.preFetchDocs = function(uri){
    var uris = this.extractFileURIs(uri);
    if (uris.length > 0){
        for (var i=1; i< uris.length; i++){ //Start from 1 because we don't want to lookup the URI for the reasoner.
            //sf.lookUpThing(kb.sym(unescape(uris[i])));
        }
    }
}

/**
ExtractFileURIs method was changed to extract all the URIs and load from the source fetcher. So, instead of the object that has several properties including the 'rulesFile', 'sender', 'receiver', etc. Now we just spit out all the individual components of the URI */
extractFileURIs = function(fullURI){

    fullURI = unescape(fullURI); //Otherwise we have to account for the escaped characters -- ugly!
    
    var re = /\s*(?:[&?]logFile=)|(?:[&?]rulesFile=)|(?:[&?]sender=)|(?:[&?]receiver=)|(?:[&?]data=)|(?:[&?]dataParsed=)\s*/;
    uris=fullURI.split(re);
	return uris; 			
}

    
