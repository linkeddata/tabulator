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
    //this.channel.contentType = /*"text/html"*/ "application/vnd.mozilla.xul+xml";
    this.listener.onStartRequest (this.channel, context);
    return;
  },

  onStopRequest: function(request,context,statusCode) {
    //var parser = Components.classes['@mozilla.org/xmlextras/domparser;1']
    //               .getService(Components.interfaces.nsIDOMParser);
    //TODO:Parse this before pageload, or let Tabulator kb do it on its own?
    //var nodeTree = parser.parseFromString(this.data, "text/xml");
    var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    var displayURI = tabulator.rc.getDisplayURI(request); //seeAlso request.js
    /*
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
    */    
    
    /*outlineHTML =
        "<?xml version=\"1.0\"?>"+
        "<?xml-stylesheet href=\"chrome://global/skin/xul.css\" type=\"text/css\"?>"+
        "<!DOCTYPE window>"+
        "<xul:window id=\"main-window\" xmlns=\"http://www.w3.org/1999/xhtml\""+
        "      xmlns:xul=\"http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul\">"+
        "    <xul:textbox type=\"autocomplete\" autocompletesearch=\"history\">"+
        "</xul:window>";*/
   /*
    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (outlineHTML, outlineHTML.length);
    this.listener.onDataAvailable (this.channel, context, sis, 0, outlineHTML.length);
    this.listener.onStopRequest (this.channel, context, statusCode);
    return;
    */
    var ios = 
          Components.classes["@mozilla.org/network/io-service;1"].
          getService(Components.interfaces.nsIIOService);
    var outlinerXUL = ios.newURI(/*"chrome://tabulator/content/textboxautocomplete.xul"*/
                                  "http://www.w3.org/",null,null);
    var channel = ios.newChannelFromURI(outlinerXUL, null);
    channel.asyncOpen(this._listener, null);
    this.listener.onStopRequest (this.channel,context, statusCode);
  },

  onDataAvailable: function(request,context,inputStream,offset,count) {
    var characterSet = this.channel.QueryInterface(Components.interfaces.nsIChannel).contentCharset;
    // First, get and initialize the converter
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    if(!characterSet || characterSet=="")
      converter.charset = /* The character encoding you want, using UTF-8 here */ "UTF-8";
    else
      converter.charset=characterSet;

    // Now, read from the stream
    var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableStream.init(inputStream);
    var chunk = scriptableStream.read(count);
    var text = converter.ConvertToUnicode(chunk);

    this.data += text;
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
