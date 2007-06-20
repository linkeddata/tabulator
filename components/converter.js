const CLASS_ID = Components.ID("8880af33-15af-4714-aaf2-de81ed53ed26");
const CLASS_NAME = "Converts RDF to HTML";
const CONVERT_TYPE = "?from=application/rdf+xml&to=*/*";
const CONTRACT_ID = "@mozilla.org/streamconv;1"+CONVERT_TYPE;

function RDFConverter() {
  this.wrappedJSObject = this;
}

//Most code for the converter is derived from the WMLBrowser, by Matthew Wilson.
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

    this.data = '';
    this.unencodeddata = '';
    this.uri = request.QueryInterface (Components.interfaces.nsIChannel).URI.spec;

    // Sets the charset if it is available. (For documents loaded from the
    // filesystem, this is not set.)
    this.charset =
       request.QueryInterface (Components.interfaces.nsIChannel)
           .contentCharset;

    this.channel = request;
    this.channel.contentType = "text/html";
    // All our data will be coerced to UTF-8
    this.channel.contentCharset = "UTF-8";

    this.listener.onStartRequest (this.channel, context);

    return;
  },

  onStopRequest: function(request,context,statusCode) {
    
    var converter = Components
        .classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = this.charset;

    try {
        this.data = converter.ConvertToUnicode (this.unencodeddata);
    } catch (failure) {
        this.data += this.unencodeddata;
    }

    // Strip leading whitespace
    this.data = this.data.replace (/^\s+/,'');

    // Parse the content into an XMLDocument
    var parser =
        Components.classes['@mozilla.org/xmlextras/domparser;1']
             .getService(Components.interfaces.nsIDOMParser);
    var originalDoc = parser.parseFromString(this.data, "text/xml");

    var targetDocument = 
        "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"+
        "<html id='docHTML'>"+
        "    <head>"+
        "        <title>Tabulator: Async Javascript And Semantic Web</title>"+
        "        <link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" />"+
        "    </head>"+
        "    <body>"+
        "        <div class=\"TabulatorOutline\" id=\""+this.uri+"\">"+
        "            <table id=\"outline\"></table>"+
        "        </div>"+
        "    </body>"+
        "</html>";

    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (targetDocument, targetDocument.length);
    this.listener.onDataAvailable (this.channel, context, sis, 0, targetDocument.length);

    this.listener.onStopRequest (this.channel, context, statusCode);
  },

  onDataAvailable: function(request,context,inputStream,offset,count) {
    // TODO For more recent Mozilla versions, we can use the
    // 'convertFromByteArray' methods.  Creating a string first leaves us with
    // the risk of problems, eg a 0 byte indicating the end of a string
    var si = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
    si = si.QueryInterface(Components.interfaces.nsIScriptableInputStream);
    si.init(inputStream);

    // This is basically a string containing a UTF-16 character for each
    // byte of the original data
    var unencoded = si.read (count);

    // Default charset
    if (this.charset == undefined || this.charset == '') {
       this.charset = 'UTF-8';
    }

    this.unencodeddata += unencoded;
    return;
  },

  asyncConvertData: function(fromType,toType,listener,context) {
    this.listener = listener;
    return;
  },
  convert: function(fromStream,fromType,toType,context) {
    return fromStream;
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
