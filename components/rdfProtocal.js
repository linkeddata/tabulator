//Copy and paste from http://www.nexgenmedia.net/docs/protocol/

// Test protocol related
const kSCHEME = "rdf";
const kPROTOCOL_NAME = "RDF Protocol";
const kPROTOCOL_CONTRACTID = "@mozilla.org/network/protocol;1?name=" + kSCHEME;
const kPROTOCOL_CID = Components.ID("723d8536-3644-11dc-8314-0800200c9a66");

// Mozilla defined
const kSIMPLEURI_CONTRACTID = "@mozilla.org/network/simple-uri;1";
const kIOSERVICE_CONTRACTID = "@mozilla.org/network/io-service;1";
const STANDARDURL_CONTRACTID = "@mozilla.org/network/standard-url;1";
const nsISupports = Components.interfaces.nsISupports;
const nsIIOService = Components.interfaces.nsIIOService;
const nsIProtocolHandler = Components.interfaces.nsIProtocolHandler;
const nsIURI = Components.interfaces.nsIURI;
const nsIStandardURL     = Components.interfaces.nsIStandardURL;

function RDFProtocol()
{
}

RDFProtocol.prototype =
{
  QueryInterface: function(iid)
  {
    if (!iid.equals(nsIProtocolHandler) &&
        !iid.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  scheme: kSCHEME,
  defaultPort: -1,
  protocolFlags: nsIProtocolHandler.URI_NORELATIVE |
                 nsIProtocolHandler.URI_NOAUTH,
  
  allowPort: function(port, scheme)
  {
    return false;
  },

  newURI: function(spec, charset, baseURI)
  {
    var uri = Components.classes[kSIMPLEURI_CONTRACTID].createInstance();
    if (uri instanceof nsIURI){
        uri.spec = spec;
        return uri;
    }
    else
       throw Components.results.NS_ERROR_NO_INTERFACE;
    //var uri = Components.classes[STANDARDURL_CONTRACTID].createInstance(nsIURI);
    //uri.spec = spec;
    //return uri;
    
    //var cls = Components.classes[STANDARDURL_CONTRACTID];
    //var url = cls.createInstance(nsIStandardURL);
    //url.init(nsIStandardURL.URLTYPE_STANDARD,80, spec, charset, baseURI);

    //return url.QueryInterface(nsIURI);
  },

  newChannel: function(aURI)
  {
    // aURI is a nsIUri, so get a string from it using .spec
    var rdfURI = aURI.spec;

    // strip away the kSCHEME: part
    //mySearchTerm = mySearchTerm.substring(mySearchTerm.indexOf(":") + 1, mySearchTerm.length);    
    //mySearchTerm = encodeURI(mySearchTerm);

    //dump("[mySearchTerm=" + mySearchTerm + "]\n");
    //var finalURL = "";
    /*
    try{ 
      // Get the preferences service
      var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);

      var prefBranch = prefService.getBranch(null);
  
      var defaultSearchURL = prefBranch.getComplexValue("browser.search.defaulturl",
                             Components.interfaces.nsIPrefLocalizedString).data;

      var searchDS = Components.classes["@mozilla.org/rdf/datasource;1?name=internetsearch"]
                               .getService(Components.interfaces.nsIInternetSearchService);

      var searchEngineURI = prefBranch.getCharPref("browser.search.defaultengine");
      if (searchEngineURI) {          
        searchURL = searchDS.GetInternetSearchURL(searchEngineURI, mySearchTerm, 0, 0, {value:0});
        if (searchURL)
          defaultSearchURL = searchURL;      
      }
      dump("[Search Protocol Success: " + defaultSearchURL + "]")
    } catch (e){
      dump("[Search Protocol failed to get the search pref: " + e + "]\n");
    }

   finalURL = defaultSearchURL + mySearchTerm;
    */
    /* create dummy nsIURI and nsIChannel instances */
    var ios = Components.classes[kIOSERVICE_CONTRACTID]
                        .getService(nsIIOService);
    //return ios.newChannel("javascript:document.location.href='" + finalURL + "'", null, null);
    var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    kb = tabulator.kb;
    
    var rdfDictionary = Components.classes["@mozilla.org/rdf/rdf-service;1"]
                         .getService(Components.interfaces.nsIRDFService);
    var rdfSource = rdfDictionary.GetDataSource(rdfURI);

    var counter=0;
    var subjectEnumerator = rdfSource.GetAllResources();
    while (subjectEnumerator.hasMoreElements()){
        var subject=subjectEnumerator.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
        var predicateEnumerator=rdfSource.ArcLabelsOut(subject);
        while (predicateEnumerator.hasMoreElements()){
            var predicate=predicateEnumerator.getNext().QueryInterface(Components.interfaces.nsIRDFResource);
            //var object=rdfSource.GetTarget(subject,predicate,true);
            
            var objectEnumerator=rdfSource.GetTargets(subject,predicate,true);
            while (objectEnumerator.hasMoreElements()){
                counter++;
                //cannot cast direcly, use """instance of""" instead
                //try{var object=objectEnumerator.getNext().QueryInterface(Components.interfaces.nsIRDFLiteral);}
                //catch(e){return ios.newChannel("chrome://tabulator/content/outliner.html?subject="+counter,null,null);}
                
                var object=objectEnumerator.getNext();
                if (object instanceof Components.interfaces.nsIRDFLiteral)
                    kb.add(kb.sym(subject.Value),kb.sym(predicate.Value),kb.literal(object.Value),kb.sym(rdfURI));                    
                else if(object instanceof Components.interfaces.nsIRDFResource)
                    kb.add(kb.sym(subject.Value),kb.sym(predicate.Value),kb.sym(object.Value),kb.sym(rdfURI));                    
            }
            
            //return ios.newChannel("chrome://tabulator/content/outliner.html?subject="+object.Value,null,null);    
        }             
    }                   
    return ios.newChannel("chrome://tabulator/content/outliner.html?subject="+rdfURI,null,null);
    //return ios.newChannel("chrome://tabulator/content/outliner.html",null,null);

  }
}

var RDFProtocolFactory = {

createInstance: function (outer, iid)
{
  if (outer != null)
    throw Components.results.NS_ERROR_NO_AGGREGATION;

  if (!iid.equals(nsIProtocolHandler) &&
      !iid.equals(nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;

  return new RDFProtocol();
}

}


/**
 * JS XPCOM component registration goop:
 *
 * We set ourselves up to observe the xpcom-startup category.  This provides
 * us with a starting point.
 */

var RDFProtocalModule = {

registerSelf: function (compMgr, fileSpec, location, type)
{
  compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  compMgr.registerFactoryLocation(kPROTOCOL_CID,
                                  kPROTOCOL_NAME,
                                  kPROTOCOL_CONTRACTID,
                                  fileSpec, 
                                  location, 
                                  type);
},

getClassObject: function (compMgr, cid, iid)
{
  if (!cid.equals(kPROTOCOL_CID))
    throw Components.results.NS_ERROR_NO_INTERFACE;

  if (!iid.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    
  return RDFProtocolFactory;
},

canUnload: function (compMgr)
{
  return true;
}

}

//starting point
function NSGetModule(){ return RDFProtocalModule;}