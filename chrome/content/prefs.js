/*  Preferences Handling for Tabulator extension.
**
** Contains a listenr for changes in prefernces,
** as well as set and get of user prefereces specifically for tabulator.
** See also the preferences.js file in the online version.
*/
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                   .getService(Components.interfaces.nsIPrefBranch);
try {
    var value = prefManager.getBoolPref("extensions.tabulator.setheader");
} catch(e) {
    prefManager.setBoolPref("extensions.tabulator.setheader",true);
}


var tabulatorPrefObserver =
{
  register: function()
  {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);
    this._branch = prefService.getBranch("extensions.tabulator.");
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this._branch.addObserver("", this, false);
  },

  unregister: function()
  {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData)
  {
    if(aTopic != "nsPref:changed") return;
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
    switch (aData) {
      case "setheader":
        var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefBranch);
        var acceptheader = prefManager.getCharPref('network.http.accept.default');
        var value = prefManager.getBoolPref("extensions.tabulator.setheader");
        if(value) {
          if(acceptheader.indexOf("application/rdf+xml")==-1) { //Let's prefer some application/rdf+xml!
            acceptheader+=",application/rdf+xml;q=0.93";
          }
          if(acceptheader.indexOf("text/rdf+n3")==-1) { //Let's prefer some text/rdf+n3
            acceptheader+=",text/rdf+n3;q=0.5"; // low for now.
          }
        } else {
          acceptheader = acceptheader.replace(/,application\/rdf\+xml;q=0\.93/,"");
          acceptheader = acceptheader.replace(/,text\/rdf\+n3;q=0\.5/,"");
        }
        prefManager.setCharPref('network.http.accept.default',acceptheader);
        break;
    }
  }
}
tabulatorPrefObserver.register();

//////////////////////////////////////////////////////////////////////////

//   Cookie-like user preference handling
//  See preferences.js in the online version



tabulator.preferences = {};


// See http://www.xulplanet.com/references/xpcomref/ifaces/nsIPrefBranch.html
// 
tabulator.preferences.PREFID = '@mozilla.org/preferences;1';
tabulator.preferences.nsIPrefBranch = Components.interfaces.nsIPrefBranch;
tabulator.preferences.PREF = Components.classes[tabulator.preferences.PREFID].getService(Components.interfaces.nsIPrefBranch);

tabulator.preferences.get = function(key) {
    var prefstring = 'tabulator.' + key;
    var type = tabulator.preferences.PREF.getPrefType(prefstring);
    var nsIPrefBranch = Components.interfaces.nsIPrefBranch;
    switch (type) {
        case nsIPrefBranch.PREF_STRING:
            return tabulator.preferences.PREF.getCharPref(prefstring);
            break;
        case nsIPrefBranch.PREF_INT:
            return tabulator.preferences.PREF.getIntPref(prefstring);
            break;
        default:
            alert('Unexpected type of preference:'+type+' for '+prefstring)
            return null
        case nsIPrefBranch.PREF_INVALID:
            return null;
            break;
        case nsIPrefBranch.PREF_BOOL:
            return tabulator.preferences.PREF.getBoolPref(prefstring);
            break;
    }
}

tabulator.preferences.set = function(key, val) {
    tabulator.preferences.PREF.setCharPref('tabulator.'+key, val);
}

// added by LK for highlightsidebar 12/02/09 
// https://developer.mozilla.org/en/NsIPrefBranch
tabulator.preferences.clearBranch = function(branch) {
    tabulator.preferences.PREF.deleteBranch('tabulator.'+branch);
}
tabulator.preferences.clear = function(key) {
    tabulator.preferences.PREF.clearUserPref('tabulator.'+key);
}
// ends


 
