function onPageLoad(aEvent) {
  var doc = aEvent.originalTarget;
  var div = doc.createElement('div');
  div.setAttribute('id','sourcesdiv');
  doc.body.appendChild(div);
  //TODO: Implement the sources stuff here!
  var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"]
                    .getService(Components.interfaces.nsISupports)
                    .wrappedJSObject;
  tabulator.sourceWidget.setContainer(div);
  document.addEventListener("unload",tabulator.sourceWidget.clearContainer,true);
}

//Load up the source widget when stuff happens.
document.addEventListener("DOMContentLoaded", onPageLoad, null);