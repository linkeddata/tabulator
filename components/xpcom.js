const nsISupports = Components.interfaces.nsISupports;

const CLASS_ID = Components.ID("968a15aa-83d2-4577-88dd-b493dab4deb7");
const CLASS_NAME = "the rdf/xml handler";
const CONTRACT_ID = "@dig.csail.mit.edu/tabulator;1";

function Tabulator() {
  var thisTabulator=this;
  this.wrappedJSObject = this;
  //Define all tabulator fields and functions HERE:
  this.kb;
  this.qs;
  this.sf;
  this.views=[];

  this.registerView = function(view) {
    if(view) {
      this.views.push(view);
    } else {
      alert("ERROR: View class not found.");
    }
  }

  this.drawInBestView = function(query) {
    for(var i=0; i<this.views.length; i++) {
      if(this.views[i].canDrawQuery(query)) { //TODO:Maybe an RDF-based mechanism for this?
        this.drawInView(query,this.views[i]);
        return true;
      }
    }
    alert("ERROR: That query can't be drawn! Do you have a table view?");
    return false;
  }

  this.drawInView = function(query,view,alert) {
    //get a new doc, generate a new view in doc, add and draw query.
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var gBrowser = wm.getMostRecentWindow("navigator:browser").getBrowser();
    onLoad = function(e) {
        var doc = e.originalTarget;
        var container = doc.getElementById('viewArea');
        var newView = new view(container,doc);
        thisTabulator.qs.addListener(newView);
        newView.drawQuery(query);
        gBrowser.selectedBrowser.removeEventListener('load',onLoad,true);
    }
    gBrowser.selectedTab = gBrowser.addTab("chrome://tabulator/content/view.html");
    gBrowser.selectedBrowser.addEventListener('load',onLoad,true);
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