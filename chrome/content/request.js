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
//ToDo2: investigate into other appraches...say gBrowser.addProgressListener?

function RequestConnector(){
    this._requestMap = []; //private
    this.getPreviousRequest = function (request) {
         var requestMap = this._requestMap;
         for (var i=0;i<requestMap.length;i++)
             if (request==requestMap[i][0]) return requestMap[i][1];
             //How can two objects with different toString == I don't get this at all...
             //[xpconnect wrapped (nsISupports, nsIHttpChannel, nsIRequest, nsIChannel)]
             //== [xpconnect wrapped (nsISupports, nsIRequest, nsIChannel)]
             //It is worth understanding what's going on here. 
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
         this._requestMap.push([thisRequest,previousRequest]);
    };
}