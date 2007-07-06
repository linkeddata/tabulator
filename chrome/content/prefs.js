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
    dump(aData);
    switch (aData) {
      case "setheader":
        var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                           .getService(Components.interfaces.nsIPrefBranch);
        var acceptheader = prefManager.getCharPref('network.http.accept.default');
        var value = prefManager.getBoolPref("extensions.tabulator.setheader");
        dump(value);
        if(value) {
          if(acceptheader.indexOf("application/rdf+xml")==-1) { //Let's prefer some application/rdf+xml!
            acceptheader+=",application/rdf+xml;q=0.93";
          }
          if(acceptheader.indexOf("text/rdf+n3")==-1) { //Let's prefer some text/rdf+n3
            acceptheader+=",text/rdf+n3;q=0.5"; // low for now.
          }
        } else {
          dump("trying to set");
          acceptheader = acceptheader.replace(/,application\/rdf\+xml;q=0\.93/,"");
          acceptheader = acceptheader.replace(/,text\/rdf\+n3;q=0\.5/,"");
        }
        dump("\nNew Header: "+acceptheader);
        prefManager.setCharPref('network.http.accept.default',acceptheader);
        break;
    }
  }
}
tabulatorPrefObserver.register();