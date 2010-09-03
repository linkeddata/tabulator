/*
   An apprach to display the requested resource but not redirected documents.
   Notice that tabulator(converter.js) is triggered only when a RDF document is fetched, so
   it's necessary to record all the redirections. Unfortunately, if you set a new property to
   these channel objects (nsIHttpChannel) you get [Exception "Cannot modify properties of a
   WrappedNative"]. My approach is to store the memory in tabulator.rc._requestMap instead of
   channel.previousRequest (store in kb might be a way, I don't know).
   The side effect of this approach may be some memory issue.
   
                                                                             2008.01.31 kennyluck
*/
//ToDo: release some memory in _requestMap once in a while or maybe a queue. By the way, I think memory control is 
//      always an important issue in the tabulator
//ToDo2: make sure that overriding notificationCallbacks would not cause conflicts with other features
//       seeAlso test.js
//ToDo3: investigate into other appraches...say gBrowser.addProgressListener?

function RequestConnector(){
    this._requestMap = []; //private
    this.getPreviousRequest = function (request) {
         //request.QueryInterface(Components.interfaces.nsIHttpChannel)
         var requestMap = this._requestMap;
         for (var i=0;i<requestMap.length;i++){
             if (request==requestMap[i][0]) {
                 var result = requestMap[i][1];
                 this._removeEntry(i);
                 return result;
             }
         }
             //How can two objects with different toString == I don't get this at all...
             //[xpconnect wrapped (nsISupports, nsIHttpChannel, nsIRequest, nsIChannel)]
             //== [xpconnect wrapped (nsISupports, nsIRequest, nsIChannel)]
             //It is worth understanding what's going on here.
          
         //The mechanism above generally works (for dc, dbpedia, Ralph's foaf).
         //Unfortunately, not working for http://www.w3.org/2001/sw/
         //The problem is this, it seems that when loading http://www.w3.org/2001/sw/
         //3 nsIHttpRequest are generated instead of 2: (originalURI --> URI)
                  
         // sw/ --> sw/  ,  sw/ --> sw/Overview.rdf  , sw/Overview.rdf --> sw/Overview.rdf
         //     303             200                                    200
         //  text/html   application/vnd.mozilla.maybe.feed          text/html
         //thie last one is redundant and is there becuase of feed sniffing, I think
         //So, this is a hack:
         if (!(requestMap.length == 0) /*&& !(request.originalURI.spec == request.URI.spec)*/){
             tabulator.log.warn("In side the hack in request.js with originalURI: %s URI: %s", 
                                  request.originalURI.spec, request.URI.spec);
             for (var i = requestMap.length-1;i>=0;i--){
                 if (requestMap[i][0].URI.spec == request.URI.spec /*&& 
                        requestMap[i][1].URI.spec == request.URI.originalURI.spec*/){
                     tabulator.log.warn("redirecting back, but this might be a failure, see request.js");                     
                     var fakePrevious = requestMap[i][1];
                     //requestMap[i][0] = request;
                     this._removeEntry(i);
                     return fakePrevious;
                 }
                 
             }
         }
         
         tabulator.log.debug("found nothing in request array");
         return null;
    };
    this.getDisplayURI = function (request){
        //returns  the URI of the first non-301 response in a sequence of redirection if there is one
        //      || request.URI.spec. seeAlso <http://lists.w3.org/Archives/Public/public-awwsw/2008Jan/0030.html>9
        var displayURI = request.URI.spec;
        
        // Does there exist an elegant way to write this?
        for (var requestIter=this.getPreviousRequest(request);requestIter;requestIter=this.getPreviousRequest(requestIter))
            if (requestIter.responseStatus != 301) displayURI = requestIter.URI.spec;
        return displayURI;
    };
    this.setPreviousRequest = function (thisRequest,previousRequest) {
         tabulator.log.debug("recording redirctions: previoiusRequest is %s with status %s, thisRequest is %s",
                               previousRequest.URI.spec, previousRequest.responseStatus, thisRequest.URI.spec);
         this._requestMap.push([thisRequest,previousRequest]);
    };
    this.releaseRequest = function (request){
        //tabulator.log.debug("attemp to remove %s", request.URI.spec);
        var requestPointer = request;
        var mapLength = this._requestMap.length;
        for (var i=mapLength-1;i>=0;i--){
            if (requestPointer==this._requestMap[i][0]) {
                requestPointer = this._requestMap[i][1];
                this._removeEntry(i);
            }
        }
    };
    this._removeEntry = function (i) {
        tabulator.log.debug("%s removed, the length of the requestMap is %s", 
                               this._requestMap[i][1].URI.spec, this._requestMap.length-1);
        tabulator.rdf.Util.RDFArrayRemove(this._requestMap, this._requestMap[i]);                
    };
}