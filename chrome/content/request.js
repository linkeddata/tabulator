function RequestConnector(){
    this.requestMap = []; //private
    this.getPreviousRequest = function (request) {
         var requestMap = this.requestMap;
         for (var i=0;i<requestMap.length;i++)
             if (request==requestMap[i][0]) return requestMap[i][1];
             //How can two objects with different toString == I don't get this at all...
         return null;
    };
    this.getDisplayURI = function (request){
        //returns  the URI of the first non-301 response in a sequence of redirection if there is one
        //      || request.URI.spec
        var displayURI = request.URI.spec;
        
        // Does there exist an elegant way to write this?
        for (var requestIter=request;requestIter;requestIter=this.getPreviousRequest(requestIter))
            if (requestIter.responseStatus != 301) displayURI = requestIter.URI.spec;
        return displayURI;
    };
    this.setPreviousRequest = function (thisRequest,previousRequest) {
         this.requestMap.push([thisRequest,previousRequest]);
    };
}