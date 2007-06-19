dump("AlsoLoading");
// You can change these if you like
const CLASS_ID = Components.ID("8880af33-15af-4714-aaf2-de81ed53ed26");
const CLASS_NAME = "Converts RDF to HTML";
const CONVERT_TYPE = "?from=application/rdf+xml&to=*/*";
const CONTRACT_ID = "@mozilla.org/streamconv;1"+CONVERT_TYPE;

// This is your constructor.
// You can do stuff here.
function RDFConverter() {
  // you can cheat and use this
  // while testing without
  // writing your own interface
  this.wrappedJSObject = this;
}

// This is the implementation of your component.
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
        this.logger.logStringMessage ("wmlbrowser: Failure converting unicode using charset " + this.charset);
        this.logger.logStringMessage (failure);
        this.data += this.unencodeddata;
    }
    //this.logger.logStringMessage (this.data);

    // Strip leading whitespace
    this.data = this.data.replace (/^\s+/,'');

    // Replace any external DTD declarations with an internal DTD subset
    this.data = this.data.replace
        (/<!DOCTYPE\s+wml\s+PUBLIC\s+['"].*?["']\s+["'].*?['"]>/,
         '<!DOCTYPE wml [ <!ENTITY quot "&#34;"> <!ENTITY apos "&#39;"> <!ENTITY nbsp  "&#160;"> <!ENTITY shy "&#173;"> ]>');

    //this.logger.logStringMessage (this.data);

    // Parse the content into an XMLDocument
    var parser =
        Components.classes['@mozilla.org/xmlextras/domparser;1']
             .getService(Components.interfaces.nsIDOMParser);
    var originalDoc = parser.parseFromString(this.data, "text/xml");
    // Determine whether there was an error parsing the document
/*    var error = this.isErrorDocument (originalDoc);
    // And choose a stylesheet accordingly
    var xslt = error ? "chrome://wmlbrowser/content/errors.xsl" :"chrome://wmlbrowser/content/wml.xsl";

    var processor = this.getXSLTProcessor();

    // Use an XMLHttpRequest object to load our own stylesheet.
    var styleLoad =
        Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
    styleLoad.open ("GET", xslt, false); // synchronous load
    styleLoad.overrideMimeType("text/xml");
    styleLoad.send(undefined);

    var targetDocument;
    // Get the transformed document
    try {
        processor.importStylesheet (styleLoad.responseXML.documentElement);
        var transformedDocument = processor.transformToDocument (originalDoc);
        targetDocument = this.serializeToString (transformedDocument);
    } catch (e) {
        // If we couldn't perform the transformation then we probably
        // hit a termination message.
        targetDocument = this.getTransformFailureDocument();
    }

    // Bit of a hack for now, can we do this in XSLT?
    if (error) {
        targetDocument = targetDocument.replace (/Location: .+/, 'Location: ' + this.uri);
    }*/
    //this.logger.logStringMessage (targetDocument);
    /*
    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (Document, targetDocument.length);
    // Pass the data to the main content listener
    this.listener.onDataAvailable (this.channel, aContext, sis, 0, targetDocument.length);

    this.listener.onStopRequest (this.channel, aContext, aStatusCode);*/
    //TODO:Pass the HTML for a normal tabulator outline in targetDocument to this.listener
    //then execute onDataAvailable, onStopRequest as above.
    var targetDocument = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"> <html id='docHTML'><head><title>Tabulator: Async Javascript And Semantic Web</title><link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" /></head><body><div ondblclick=\"TabulatorDoubleClick(event)\" class=\"TabulatorOutline\" id=\""+this.uri+"\"><table id=\"outline\"></table></div></body></html>";
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

    // Try and detect the XML encoding if declared in the file and not
    // already known. This will fail with UTF-16 etc I think.
    if ((this.charset == undefined || this.charset == '') && 
         unencoded.match(/<?xml\s+version\s*=\s*["']1.0['"]\s+encoding\s*=\s*["'](.*?)["']/)) {
        //this.logger.logStringMessage ("got encoding match " + RegExp.$1);

        this.charset = RegExp.$1;
    } else {
        //this.logger.logStringMessage ("No encoding match found (or already got charset: " + this.charset + ")");
    }

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
