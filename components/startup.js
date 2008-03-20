/*
Most code is derived from 
http://developer.mozilla.org/en/docs/Setting_HTTP_request_headers#Example_Code

and

//////////////////////// HTTP Request observer
// Based on code in
// http://developer.mozilla.org/en/docs/Setting_HTTP_request_headers
// and http://developer.mozilla.org/en/docs/Observer_Notifications#HTTP_requests
// http://www.xulplanet.com/references/xpcomref/ifaces/nsIHttpChannel.html
// and http://www.xulplanet.com/references/xpcomref/ifaces/nsIChannel.html

*/

const CLASS_ID = Components.ID("dd157150-f60d-11dc-95ff-0800200c9a66");
const CLASS_NAME = "Tabulator Startup Routine";
const CONTRACT_ID = "@dig.csail.mit.edu/tabulator/startup;1";

function LOG(text)
{
    // dump(text);
    //    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    //    consoleService.logStringMessage(text);
}

function myHTTPListener() { }

var tRDF_CONTENT_TYPE = {'application/rdf+xml':'XML', 'text/rdf+n3':'N3', 'text/n3':'N3',
                         'text/turtle':'N3', 'application/x-turtle': 'N3', 'application/n3': 'N3'}; 
                         
myHTTPListener.prototype = {
    
  observe: function(subject, topic, data)
  {
      if (topic == "http-on-examine-response") {
              var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
              var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
              // httpChannel.setRequestHeader("X-Hello", "World", false)
              if (httpChannel.URI.spec == tabulator.metadataURI) {
                  //this forces the page to be displayed as RDF/XML seeAlso tabulator.xul
                  tabulator.metadataURI = '';
                  httpChannel.contentType = 'application/rdf+xml';
              }
              tabulator.requestCache.push(httpChannel);
              //release cached nsIHttpChannel for 200 with content-type that isn't a RDF one.
              if (httpChannel.responseStatus == 200	&& !(httpChannel.contentType in tRDF_CONTENT_TYPE))
                  tabulator.rc.releaseRequest(httpChannel);			
              if (httpChannel.responseStatus >= 300 && httpChannel.responseStatus < 400) { //only record 30X redirects
              
                  //tabulator.log.warn(httpChannel.responseStatus+" of "+httpChannel.URI.spec+" notificationCallbacks has "+httpChannel.notificationCallbacks);
                  if (!httpChannel.notificationCallbacks || ''+httpChannel.notificationCallbacks != "[object XMLHttpRequest]"){ 
                                                                                                   //a hack not to override notificationCallbakcs set from source.js
                      httpChannel.notificationCallbacks = { //.notificationCallbacks is overridden for every 30X
                          getInterface: function (iid) {
                              if (iid.equals(Components.interfaces.nsIChannelEventSink)) {
                                  return {onChannelRedirect: function (oldC,newC,flags) {                        
                                      oldC.QueryInterface(Components.interfaces.nsIHttpChannel);
                                      newC.QueryInterface(Components.interfaces.nsIHttpChannel);
                                      //just like newC.previuosRequest = oldC;                      
                                      tabulator.rc.setPreviousRequest(newC,oldC);}}
                              }
                              return Components.results.NS_NOINTERFACE;}
                      }
                      //tabulator.log.warn(httpChannel.responseStatus+"after setting,  notificationCallbacks has "+httpChannel.notificationCallbacks);
                  }
                  /*tabulator.log.warn('httpResponseObserver: status='+httpChannel.responseStatus+
                    ' '+httpChannel.responseStatusText+ ' for ' + httpChannel.originalURI.spec);
                  var newURI = httpChannel.getResponseHeader('location');
                  tabulator.log.warn('httpResponseObserver: now URI = ' + httpChannel.URI.spec + ' a ' +
                                                                          typeof httpChannel.URI.spec);
                  tabulator.log.warn('httpResponseObserver: Location: ' + newURI + ' a ' + typeof newURI);
                  */                  
              }
      }


      if (topic == "app-startup") {

          dump("----------------------------> app-startup");

          var os = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);

          os.addObserver(this, "http-on-examine-response", false);
          return;
      }
  },
 
  QueryInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIObserver) ||
            iid.equals(Components.interfaces.nsISupports))
            return this;
        
        Components.returnCode = Components.results.NS_ERROR_NO_INTERFACE;
        return null;
    },
};

var myModule = {
    //registerSelf gets called when one of the following conditions hold:
    //1. switch to a different Firefox version 2. xpti.dat and compreg.dat don't exist
    registerSelf: function (compMgr, fileSpec, location, type) {

        var compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(CLASS_ID,
                                        CLASS_NAME,
                                        CONTRACT_ID,
                                        fileSpec,
                                        location,
                                        type);


          dump("----------------------------> registerSelf");

        var catMgr = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
        catMgr.addCategoryEntry("app-startup", CLASS_NAME, CONTRACT_ID, true, true);
        
        //deal with local .n3 files, I don't know what the last two arguments do...
        //also a hack on sources.js
        catMgr.addCategoryEntry('ext-to-type-mapping','n3','text/rdf+n3',true,true);        
    },


    getClassObject: function (compMgr, cid, iid) {

          LOG("----------------------------> getClassObject");

        return this.myFactory;
    },

    myCID: Components.ID("{9cf5f3df-2505-42dd-9094-c1631bd1be1c}"),

    myProgID: "@dougt/myHTTPListener;1",

    myName:   "Simple HTTP Listener",

    myFactory: {
        QueryInterface: function (aIID) {
            if (!aIID.equals(Components.interfaces.nsISupports) &&
                !aIID.equals(Components.interfaces.nsIFactory))
                throw Components.results.NS_ERROR_NO_INTERFACE;
            return this;
        },

        createInstance: function (outer, iid) {

          LOG("----------------------------> createInstance");

          return new myHTTPListener();
        }
    },

    canUnload: function(compMgr) {
        return true;
    }
};

function NSGetModule(compMgr, fileSpec) {
    return myModule;
}