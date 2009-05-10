const CLASS_ID = Components.ID("8880af33-15af-4714-abf7-de82ed54ee26");
const CLASS_NAME = "Converts N3 to HTML";
const CONVERT_TYPE = "?from=text/n3&to=*/*";
const LEGACY_CONVERT_TYPE = "?from=text/rdf+n3&to=*/*";
const CONTRACT_ID = "@mozilla.org/streamconv;1"+CONVERT_TYPE;
const LEGACY_CONTRACT_ID = "@mozilla.org/streamconv;1"+LEGACY_CONVERT_TYPE;

function N3Converter() {
  this.wrappedJSObject = this;
}


//Most code for the converter is derived from the WMLBrowser, by Matthew Wilson et al.
//See http://wmlbrowser.mozdev.org/ for more on the WML Browser.
N3Converter.prototype = {
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
    this.channel.contentType = "text/html";
    this.listener.onStartRequest (this.channel, context);
    return;
  },

  onStopRequest: function(request,context,statusCode) {
    //var parser = Components.classes['@mozilla.org/xmlextras/domparser;1']
    //               .getService(Components.interfaces.nsIDOMParser);
    //TODO:Parse this before pageload, or let Tabulator kb do it on its own?
    //var nodeTree = parser.parseFromString(this.data, "text/xml");
    var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    var displayURI = tabulator.rc.getDisplayURI(request);
    var outlineHTML = 
        "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"+
        "<html id='docHTML'>"+
        "    <head>"+
        "        <title>Tabulator: Async Javascript And Semantic Web</title>"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" />"+
        "    </head>"+
        "    <body>"+
        "        <div class=\"TabulatorOutline\" id=\""+displayURI+"\">"+
        "            <table id=\"outline\"></table>"+
        "        </div>"+
        "    </body>"+
        "</html>";

    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (outlineHTML, outlineHTML.length);
    this.listener.onDataAvailable (this.channel, context, sis, 0, outlineHTML.length);
    this.listener.onStopRequest (this.channel, context, statusCode);
    return;
  },

  onDataAvailable: function(request,context,inputStream,offset,count) {
    var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableStream.init(inputStream);
    var chunk = scriptableStream.read(count);
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
var N3ConverterFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new N3Converter()).QueryInterface(aIID);
  }
};

// Module
var N3ConverterModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, LEGACY_CONTRACT_ID, aFileSpec, aLocation, aType);
    var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
    catman.addCategoryEntry("@mozilla.org/streamconv;1",CONVERT_TYPE,"N3 to HTML stream converter", true, true);
    catman.addCategoryEntry("@mozilla.org/streamconv;1",LEGACY_CONVERT_TYPE,"Legacy N3 to HTML stream converter", true, true);
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
      return N3ConverterFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return N3ConverterModule; }