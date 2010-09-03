const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("968a15aa-83d2-4577-88dd-b493dab4deb7");
const CLASS_NAME = "the rdf/xml handler";
const CONTRACT_ID = "@dig.csail.mit.edu/tabulator;1";

const isExtension = true;


//I don't like doing this, but it is a very useful function to have around.
function setTimeout(cb, delay) {
    var timer = Components.classes["@mozilla.org/timer;1"]
                  .getService(Components.interfaces.nsITimer);
    var timerCallback = {
        QueryInterface: function(aIID) {
            if (aIID.equals(Components.interfaces.nsISupports)
              || aIID.equals(Components.interfaces.nsITimerCallback))
                return this;
            throw Components.results.NS_NOINTERFACE;
        },
        notify: function () {
            cb();
        }
    }; 
    timer.initWithCallback(timerCallback,delay,timer.TYPE_ONE_SHOT);
}


//The XPCOM Component for tabulator.
function Tabulator() {
    tabulator = this;
    this.wrappedJSObject = this;
    
    //Include pretty much all of the javascript needed for the extension:
    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript("chrome://tabulator/content/js/init/init.js");
    this.kb = new tabulator.rdf.IndexedFormula();
    this.sf = new tabulator.rdf.Fetcher(this.kb);
    this.kb.sf = this.sf;
    this.qs = new tabulator.rdf.QuerySource();
    this.sourceWidget = new SourceWidget();
    this.sourceURI = "resource://tabulator/";
    this.sparql = new tabulator.rdf.sparqlUpdate(this.kb);
    this.rc = new RequestConnector();
    this.requestCache = [];
    this.cacheEntry = {};
    this.getOutlinerHTML = function (displayURI, partial) {
        var result = "<head><title>Tabulator: Data browser</title><link rel=\"stylesheet\" href=\"chrome://tabulator/content/tabbedtab.css\" type=\"text/css\" /></head><body><div class=\"TabulatorOutline\" id=\""+displayURI+"\"><table id=\"outline\"></table></div></body>"
        //"</html>";
        return result;    
    }

    this.sourceWidget.addSource(tabulator.sourceURI);
    var sourceRow = this.sourceWidget.sources[tabulator.sourceURI];
    sourceRow.childNodes[1].textContent = "Because Tabulator says so...";

    this.kb.register('dc', "http://purl.org/dc/elements/1.1/")
    this.kb.register('rdf', "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    this.kb.register('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
    this.kb.register('owl', "http://www.w3.org/2002/07/owl#")

    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    var pref_intl = prefManager.getBranch('intl.');
    var LanguagePreference = pref_intl.getComplexValue("accept_languages", Components.interfaces.nsIPrefLocalizedString).data;

    this.lb = new Labeler(this.kb,LanguagePreference);
    this.kb.predicateCallback = tabulator.Util.AJAR_handleNewTerm;
    this.kb.typeCallback = tabulator.Util.AJAR_handleNewTerm;
}//Tabulator




// ========================================================================
// COMPONENT REGISTRATION CODE - There shouldn't be a reason to change this
// ========================================================================

// This is the implementation of your component.
Tabulator.prototype = {
    //nsISupports
    QueryInterface: function(aIID)
    {
        // add any other interfaces you support here
        if (!aIID.equals(nsISupports))
            throw Components.results.NS_ERROR_NO_INTERFACE;
        return this;
    }
}
    
//=================================================
// Note: You probably don't want to edit anything
// below this unless you know what you're doing.
//
// Factory
    var TabulatorFactory = {
        singleton: null,
        createInstance: function (aOuter, aIID)
        {
            if (aOuter != null)
                throw Components.results.NS_ERROR_NO_AGGREGATION;
            if (this.singleton == null)
                this.singleton = new Tabulator();
            return this.singleton.QueryInterface(aIID);
        }
    };

// Module
var TabulatorModule = {
    registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
    {
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
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
            return TabulatorFactory;
        
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },
    
    canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return TabulatorModule; }
