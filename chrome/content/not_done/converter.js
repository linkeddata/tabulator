//<Abandoned about="newConverter">

const CLASS_ID = Components.ID("8880af33-15af-4714-aaf2-de81ed53ed26");
const CLASS_NAME = "Converts RDF to HTML";
const CONVERT_TYPE = "?from=application/rdf+xml&to=*/*";
const CONTRACT_ID = "@mozilla.org/streamconv;1"+CONVERT_TYPE;

function RDFConverter() {
  this.wrappedJSObject = this;
}


//Most code for the converter is derived from the WMLBrowser, by Matthew Wilson et al.
//See http://wmlbrowser.mozdev.org/ for more on the WML Browser.
RDFConverter.prototype = {
  listener: null,

  QueryInterface: function(aIID)
  {
    if (!(aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsIStreamConverter) ||
        aIID.equals(Components.interfaces.nsIStreamListener) ||
        aIID.equals(Components.interfaces.nsIRequestObserver)))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  onStartRequest: function(request,context) {
    this.data="";

    this.channel=request.QueryInterface(Components.interfaces.nsIChannel);
    this._request = request;
    //comment out this would break things.
    this.channel.contentType = "text/html" /*"application/vnd.mozilla.xul+xml"*/;
    //this.listener.onStartRequest (this.channel, context);
    return;
  },

  onStopRequest: function(request,context,statusCode) {
    //var parser = Components.classes['@mozilla.org/xmlextras/domparser;1']
    //               .getService(Components.interfaces.nsIDOMParser);
    //TODO:Parse this before pageload, or let Tabulator kb do it on its own?
    //var nodeTree = parser.parseFromString(this.data, "text/xml");
    var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    var displayURI = tabulator.rc.getDisplayURI(request); //seeAlso request.js
    
    request.QueryInterface(Components.interfaces.nsIChannel);
    
    var ios = 
          Components.classes["@mozilla.org/network/io-service;1"].
          getService(Components.interfaces.nsIIOService);
    var outlinerXUL = ios.newURI("chrome://tabulator/content/outliner.html"/*?uri="+displayURI*/
                                  /*"http://www.w3.org/"*/,null,null);
    var channel = ios.newChannelFromURI(outlinerXUL, null);

    channel.originalURI = ios.newURI(displayURI,null,null);
    channel.loadGroup = this._request.loadGroup;    
    channel.asyncOpen(this.listener, null);
    tabulator.displayURI.push(displayURI);

    //the point is not to stop the request so the chrome HTML is loaded with the original URI
    //this.listener.onStopRequest (this.channel,context, statusCode);
    
    
  },

  onDataAvailable: function(request,context,inputStream,offset,count) {
    //var characterSet = this.channel.QueryInterface(Components.interfaces.nsIChannel).contentCharset;
    // First, get and initialize the converter
    //var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
    //                      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    //if(!characterSet || characterSet=="")
    //  converter.charset = /* The character encoding you want, using UTF-8 here */ "UTF-8";
    //else
    //  converter.charset=characterSet;

     //Now, read from the stream
    var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableStream.init(inputStream);
    var chunk = scriptableStream.read(count);
    //var text = converter.ConvertToUnicode(chunk);

    //this.data += text;
    this.data += chunk;
    return;
  },

  asyncConvertData: function(fromType,toType,listener,context) {
    this.listener = listener;
    return;
  },
  convert: function(fromStream,fromType,toType,context) {
    //I don't know what I should really do here !
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  }
}

//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
var RDFConverterFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new RDFConverter()).QueryInterface(aIID);
  }
};

// Module
var RDFConverterModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
    catman.addCategoryEntry("@mozilla.org/streamconv;1",CONVERT_TYPE,"RDF to HTML stream converter", true, true);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return RDFConverterFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return RDFConverterModule; }

/* //test.js
-            //var uri = divs[i].getAttribute('id');

-            var uri = tabulator.displayURI.shift();

+            var uri = divs[i].getAttribute('id');

+            //var uri = tabulator.displayURI.shift();
*/
//    this.displayURI = []; //xpcom.js

// tabulator.displayURI.push(displayURI); //converter.js

    //var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    //tabulator.log.error("on onDataAvailable:"+this.listener);
    //var characterSet = this.channel.QueryInterface(Components.interfaces.nsIChannel).contentCharset;
    // First, get and initialize the converter
    //var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
    //                      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    //if(!characterSet || characterSet=="")
    //  converter.charset = /* The character encoding you want, using UTF-8 here */ "UTF-8";
    //else
    //  converter.charset=characterSet;

    // Now, read from the stream

    //var text = converter.ConvertToUnicode(chunk);

    
//</Abandoned>
