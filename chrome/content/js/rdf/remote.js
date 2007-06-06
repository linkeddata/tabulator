
/*function RDFRemoteFormula(url) {
    this.statements = [];    // As in RDFFormula
    this.propertyAction = []; // What to do when getting statement with {s X o}
    //maps <uri> to f(F,s,p,o)
    this.classAction = [];   // What to do when adding { s type X }
    this.redirection = [];   // redirect to lexically smaller equivalent symbol
    this.subjectIndex = [];  // Array of statements with this X as subject
    this.predicateIndex = [];  // Array of statements with this X as subject
    this.objectIndex = [];  // Array of statements with this X as object
    
    this.remote=url;
    
	
	return this;
} /* end RDFRemoteFormula */

//RDFRemoteFormula.prototype = new RDFIndexedFormula();
//RDFRemoteFormula.prototype.constructor = RDFIndexedFormula;

   /*for (x in RDFIndexedFormula)
	{
		RDFRemoteFormula[x] = RDFIndexedFormula[x];
	}*/
	
//RDFRemoteFormula.prototype = RDFIndexedFormula.prototype;	
/* @query: a query object
 * @onreadystatechange: a function that takes xhr and returns a new callback function
*/


function onreadystateloaded (subject,callback) {
	return function (xhr, uri) {
		return function () {
			//alert(xhr.readyState);
			if (xhr.readyState != 4) {
				tdebug("entering remoteQuery, readyState=" + xhr.readyState + ", uri=" + uri);
				return false; //state 4 = complete
    		}
    		tdebug( "remoteQuery, request=" + xhr + ", uri=" + uri);
    		var statuscode;
    		try  { 
      			statuscode = xhr.status;
    		} catch (e) {
        		terror ("couldn't get request.status: e=" + e);
        		statuscode = -1; //failure
    		} //try-catch
    		//alert("Status: "+statuscode)
    		//alert(uri_docpart(subject.uri)+"@"+uri.slice(0,uri.indexOf('?')))
    		//sources_update_html(uri_docpart(subject.uri)+"@"+uri.slice(0,uri.indexOf('?')), statuscode);
    		if (statuscode != 200){
    			twarn ("Status code from "+uri+" was "+statuscode+".");
    			sources.status[externalSource(subject,uri)].state = 'failed';
    			refreshButtons(uri_docpart(subject.uri), icon_failed);
    			sources_update_html(subject.uri,statuscode,uri)
    			sources_check_callbacks()
    			return;
    		}
    		//alert(xhr.responseText);
    		doc_uri=uri_docpart(subject.uri)
    		SPARQLResultsInterpreter(sources_xml(xhr),callback,function(){
    		sources.status[externalSource(subject,uri)].state = 'fetched';
    		refreshButtons(doc_uri, icon_fetched);
    		sources_update_html(subject.uri,statuscode,uri)
    		sources_check_callbacks()})
		}
	}
}

                                                        
function sources_fetch_remote (subject, externalURI)
{
	//alert('fetch-remote')
	var uri=subject.uri
	var query = "SELECT ?pred ?obj ?isubj ?ipred WHERE { { <"+subject.uri+"> ?pred ?obj . } UNION { ?isubj ?ipred <"+subject.uri+"> . } } "
	sources.status[externalSource(uri,externalURI)].state = 'requested';
    refreshButtons(uri_docpart(uri), icon_requested);
    //alert("Final subject= "+uri);
	kb.accessRemoteStore(query, externalURI, onreadystateloaded(subject,function(bindings) {
		var pred = bindings[kb.variable('pred')];
		var obj = bindings[kb.variable('obj')];
		var isubj = bindings[kb.variable('isubj')];
		var ipred = bindings[kb.variable('ipred')];
		//alert("Sub: "+subject+"\nPred: "+pred+"\nObj: "+obj+"\nWhy: "+externalSource(subject,externalURI));
		if (pred && obj) kb.add(subject,pred,obj,kb.sym(externalSource(subject,externalURI)));
		if (isubj && ipred) kb.add(isubj,ipred,subject,kb.sym(externalSource(subject,externalURI)))
	}),uri)
}

function externalSource (subject, external)
{
	if (subject.uri) var subject=subject.uri;
	if (external.indexOf('?')>0) var external=external.slice(0,external.indexOf("?"))
	return subject+"@"+external;
}

RDFIndexedFormula.prototype.remoteQuery = function(query, externalURI, callback)
{
	var s = queryToSPARQL(query);
	kb.accessRemoteStore(s, externalURI, onreadystateloaded(callback))
}

//onreadystatechange is curried! onreadystatechange is a function that takes xhr and uri and returns 
//a new function of no variables that is an onreadystatechange callback.
RDFIndexedFormula.prototype.accessRemoteStore = function(SPARQL, externalURI, onreadystatechange, uri) {
	var base = externalURI; 
	var s=SPARQL.replace(/\n/g," ")
	s=window.escape(s)
	s=s.replace(/%20/g,"+");
	s=s.replace(/\+\++/g,"+"); //okay??? Not necessary really
	var uri = base+"?query="+s
	//alert(uri)
	tdebug("SPARQL external database uri: "+uri)
	netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");  
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");           
	tinfo("Got UniversalBrowserRead");
	var xhr = XMLHTTPFactory();
	xhr.onreadystatechange = onreadystatechange(xhr,uri);
	xhr.open('GET', uri, true);
	xhr.overrideMimeType('text/xml');
	xhr.send(null);
    setTimeout(function() { 
    if (xhr.readyState != 4) {
        xhr.abort(); 
        sources.status[uri].state = 'failed'; 
        sources_update_html(subject.uri, 'timed out'); 
        refreshButtons(uri, icon_failed); } }, 20000); //20-second timeout
}

