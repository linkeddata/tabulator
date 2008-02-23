const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("968a15aa-83d2-4577-88dd-b493dab4deb7");
const CLASS_NAME = "the rdf/xml handler";
const CONTRACT_ID = "@dig.csail.mit.edu/tabulator;1";

//TODO: Maybe replace with a real check.
const isExtension = true;

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

function Tabulator() {
    tabulator = this;
    this.wrappedJSObject = this;
    
    //Include the javascript that makes up the backend:
    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript("chrome://tabulator/content/log-ext.js");
    this.log = new TabulatorLogger();

    loader.loadSubScript("chrome://tabulator/content/sources-ext.js");
    loader.loadSubScript("chrome://tabulator/content/js/util.js");
    loader.loadSubScript("chrome://tabulator/content/js/rdf/sparql.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/term.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/match.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/rdfparser.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/serialize.js"/*,rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/n3parser.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/identity.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/rdfs.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/query.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/rdf/sources.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/uri.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/sorttable.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/tableView.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/mapView-ext.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/calView.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/calView/timeline/api/timelineView.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/sparqlUpdate.js"/*, rootObj*/);
    loader.loadSubScript("chrome://tabulator/content/js/labeler.js");
    loader.loadSubScript("chrome://tabulator/content/request.js");

    this.kb = new RDFIndexedFormula();

    // Namespaces for general use
    this.ns = {};
    this.ns.link = this.ns.tab = this.ns.tabont = RDFNamespace("http://www.w3.org/2007/ont/link#")
    this.ns.http = RDFNamespace("http://www.w3.org/2007/ont/http#");
    this.ns.httph = RDFNamespace("http://www.w3.org/2007/ont/httph#");
    this.ns.ical = RDFNamespace("http://www.w3.org/2002/12/cal/icaltzd#");
    this.ns.foaf = RDFNamespace("http://xmlns.com/foaf/0.1/");
    this.ns.rdf = rdf = RDFNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    this.ns.rdfs = rdfs = RDFNamespace("http://www.w3.org/2000/01/rdf-schema#");
    this.ns.owl = owl = RDFNamespace("http://www.w3.org/2002/07/owl#");
    this.ns.dc = dc = RDFNamespace("http://purl.org/dc/elements/1.1/");
    this.ns.rss = rss = RDFNamespace("http://purl.org/rss/1.0/");
    this.ns.xsd = xsd = RDFNamespace("http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-");
    this.ns.contact = contact = RDFNamespace("http://www.w3.org/2000/10/swap/pim/contact#");
    this.ns.mo = mo = RDFNamespace("http://purl.org/ontology/mo/");


    this.sf = new SourceFetcher(this.kb);
    this.kb.sf = this.sf;
    this.qs = new QuerySource();
    this.sourceWidget = new SourceWidget();
    this.sourceURI = "resource://tabulator/";
    this.sparql = new sparql(this.kb);
    this.rc = new RequestConnector();
    //var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    //var updater = tabulator.sparql.prepareUpdate(newStatement);
    //updater.setObject(kb.sym('http://web.mit.edu/jambo/www/foaf.rdf#jambo'));



    //GLOBALS
    kb =this.kb;
    sf =this.sf;
    qs =this.qs;

    kb.register('dc', "http://purl.org/dc/elements/1.1/")
    kb.register('rdf', "http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    kb.register('rdfs', "http://www.w3.org/2000/01/rdf-schema#")
    kb.register('owl', "http://www.w3.org/2002/07/owl#")

    internals = []
    internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#request'] = 1;
    internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#requestedBy'] = 1;
    internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#source'] = 1;
    internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#session'] = 1;
    internals['http://www.w3.org/2006/link#uri'] = 1;
    internals['http://www.w3.org/2000/01/rdf-schema#seeAlso'] = 1;

    // Special knowledge of properties
    tabont = RDFNamespace("http://dig.csail.mit.edu/2005/ajar/ajaw/ont#")
    foaf = RDFNamespace("http://xmlns.com/foaf/0.1/")
    rdf = RDFNamespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    RDFS = RDFNamespace("http://www.w3.org/2000/01/rdf-schema#")
    OWL = RDFNamespace("http://www.w3.org/2002/07/owl#")
    dc = RDFNamespace("http://purl.org/dc/elements/1.1/")
    rss = RDFNamespace("http://purl.org/rss/1.0/")
    xsd = RDFNamespace("http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-")
    contact = RDFNamespace("http://www.w3.org/2000/10/swap/pim/contact#")
    mo = RDFNamespace("http://purl.org/ontology/mo/")

    Icon = {}
    Icon.src= []
    Icon.tooltips= []

    var iconPrefix = 'chrome://tabulator/content/';
    Icon.src.icon_unrequested = iconPrefix+'icons/16dot-blue.gif';
    Icon.src.icon_fetched = iconPrefix+'icons/16dot-green.gif';
    Icon.src.icon_failed = iconPrefix+'icons/16dot-red.gif';
    Icon.src.icon_requested = iconPrefix+'icons/16dot-yellow.gif'
    Icon.src.icon_expand = iconPrefix+'icons/tbl-expand-trans.png';
    Icon.src.icon_collapse = iconPrefix+'icons/tbl-collapse.png';
    Icon.src.icon_remove_node = iconPrefix+'icons/tbl-x-small.png'
    Icon.src.icon_shrink = iconPrefix+'icons/tbl-shrink.png';
    Icon.src.icon_optoff = iconPrefix+'icons/optional_off.PNG';
    Icon.src.icon_opton = iconPrefix+'icons/optional_on.PNG';
    Icon.src.icon_add_triple = iconPrefix+'icons/userinput_add_triple.png';

    Icon.tooltips[Icon.src.icon_remove_node]='Remove this.'
    Icon.tooltips[Icon.src.icon_expand]='View details.'
    Icon.tooltips[Icon.src.icon_collapse] = 'Hide details.'
    Icon.tooltips[Icon.src.icon_collapse] = 'Hide list.'
    Icon.tooltips[Icon.src.icon_rows] = 'Make a table of data like this'
    Icon.tooltips[Icon.src.icon_unrequested] = 'Fetch this resource.'
    Icon.tooltips[Icon.src.icon_fetched] = 'This was fetched successfully.'
    Icon.tooltips[Icon.src.icon_failed] = 'Failed to load. Click to retry.'
    Icon.tooltips[Icon.src.icon_requested] = 'Being fetched. Please wait...'
    Icon.tooltips[Icon.src.icon_visit] = 'View the HTML content of this page within tabulator.'
    Icon.tooltips[Icon.src.icon_retract] = 'Remove this source and all its data from tabulator.'
    Icon.tooltips[Icon.src.icon_refresh] = 'Refresh this source and reload its triples.'

    Icon.OutlinerIcon= function (src, width, alt, tooltip, filter)
    {
            this.src=src;
            this.alt=alt;
            this.width=width;
            this.tooltip=tooltip;
            this.filter=filter;
           //filter: RDFStatement,('subj'|'pred'|'obj')->boolean, inverse->boolean (whether the statement is an inverse).
           //Filter on whether to show this icon for a term; optional property.
           //If filter is not passed, this icon will never AUTOMATICALLY be shown.
           //You can show it with termWidget.addIcon
            return this;
    }

    Icon.termWidgets = {}
    Icon.termWidgets.optOn = new Icon.OutlinerIcon(Icon.src.icon_opton,20,'opt on','Make this branch of your query mandatory.');
    Icon.termWidgets.optOff = new Icon.OutlinerIcon(Icon.src.icon_optoff,20,'opt off','Make this branch of your query optional.');
    Icon.termWidgets.addTri = new Icon.OutlinerIcon(Icon.src.icon_add_triple,18,"add tri","Add a triple to this predicate");


    LanguagePreference = "en"
    labelPriority = []
    labelPriority[foaf('name').uri] = 10
    labelPriority[dc('title').uri] = 8
    labelPriority[rss('title').uri] = 6   // = dc:title?
    labelPriority[contact('fullName').uri] = 4
    labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
    labelPriority[foaf('nick').uri] = 3
    labelPriority[RDFS('label').uri] = 2

    this.lb = new Labeler(this.kb,LanguagePreference);

    kb.predicateCallback = AJAR_handleNewTerm;
    kb.typeCallback = AJAR_handleNewTerm;

    function AJAR_handleNewTerm(kb, p, requestedBy) {
        if (p.termType != 'symbol') return;
        var docuri = Util.uri.docpart(p.uri);
        var fixuri;
        if (p.uri.indexOf('#') < 0) { // No hash

            // @@ major hack for dbpedia Categories, which spred indefinitely
            //I think cygri said we don't need this anymore
            //if (string_startswith(p.uri, 'http://dbpedia.org/resource/Category:')) return;  

    /*
            if (string_startswith(p.uri, 'http://xmlns.com/foaf/0.1/')) {
                fixuri = "http://dig.csail.mit.edu/2005/ajar/ajaw/test/foaf"
                // should give HTTP 303 to ontology -- now is :-)
            } else
    */
            //Don't do this to DC or I can't get the label of dc:title
            //if (string_startswith(p.uri, 'http://purl.org/dc/elements/1.1/')
            //           || string_startswith(p.uri, 'http://purl.org/dc/terms/')) {
            //    fixuri = "http://dublincore.org/2005/06/13/dcq";
                //dc fetched multiple times
            //} else if (string_startswith(p.uri, 'http://xmlns.com/wot/0.1/')) {
            if (string_startswith(p.uri, 'http://xmlns.com/wot/0.1/')) {
                fixuri = "http://xmlns.com/wot/0.1/index.rdf";
            } else if (string_startswith(p.uri, 'http://web.resource.org/cc/')) {
    //            tabulator.log.warn("creative commons links to html instead of rdf. doesn't seem to content-negotiate.");
                fixuri = "http://web.resource.org/cc/schema.rdf";
            }
        }
        if (fixuri) {
            docuri = fixuri
        }
        //Too slow..come on, this is lagging.
        //if (sf.getState(kb.sym(docuri)) != 'unrequested') return;
        if (typeof sf.requested[docuri] != 'undefined') return;
        
        if (fixuri) {   // only give warning once: else happens too often
            tabulator.log.warn("Assuming server still broken, faking redirect of <" + p.uri +
                "> to <" + docuri + ">")	
        }
        sf.requestURI(docuri, requestedBy);
    } //AJAR_handleNewTerm

    function string_startswith(str, pref) { // missing library routines
        return (str.slice(0, pref.length) == pref);
    }

      this.views=[];

      this.registerViewType = function(viewFactory) {
        if(viewFactory) {
          this.views.push(viewFactory);
        } else {
          alert("ERROR: View class not found.");
        }
      }

      this.drawInBestView = function(query) {
        for(var i=this.views.length-1; i>=0; i--) {
          if(this.views[i].canDrawQuery(query)) { //TODO:Maybe an RDF-based mechanism for this?
            this.drawInView(query,this.views[i]);
            return true;
          }
        }
        alert("ERROR: That query can't be drawn! Do you not have a table view?");
        return false;
      }

      this.drawInView = function(query,viewFactory,alert) {
        //get a new doc, generate a new view in doc, add and draw query.
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
        var gBrowser = wm.getMostRecentWindow("navigator:browser").getBrowser();
        onLoad = function(e) {
            var doc = e.originalTarget;
            var container = doc.getElementById('viewArea');
            var newView = viewFactory.makeView(container,doc);
            tabulator.qs.addListener(newView);
            newView.drawQuery(query);
            gBrowser.selectedBrowser.removeEventListener('load',onLoad,true);
        }
        var viewURI = viewFactory.getValidDocument(query)
        if(viewURI) {
            gBrowser.selectedTab = gBrowser.addTab(viewFactory.getValidDocument(query));
        } else {
            return; //TODO:Some kind of error? is this even an error? maybe it doesnt display to a URI.
        }
        //gBrowser.selectedBrowser.addEventListener('load',onLoad,true);
      }

      //this.registerViewType(OutlinerViewFactory);  
      this.registerViewType(TableViewFactory);
      this.registerViewType(MapViewFactory);
      this.registerViewType(CalViewFactory);
      this.registerViewType(TimelineViewFactory);
      
    OutlinerViewFactory = {
        name: "Outliner View",

        canDrawQuery: function(q) {
            return true;
        },

        makeView: function(container,doc) {
            return new tableView(container,doc);
        },

        getIcon: function() {
            return "chrome://tabulator/content/icons/table.png";
        },

        getValidDocument: function(q) {
            return "chrome://tabulator/content/table.html?query="+q.id;
        }
    } 

}//Tabulator

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
