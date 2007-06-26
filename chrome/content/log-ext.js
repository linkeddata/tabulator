function onPageLoad(aEvent) {
  var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"]
                    .getService(Components.interfaces.nsISupports)
                    .wrappedJSObject;
  var doc = aEvent.originalTarget;
  var div = doc.createElement('div');
  div.setAttribute('id','logdiv');
  doc.body.appendChild(div);

  //TODO: Implement the log stuff here!
}

document.addEventListener("DOMContentLoaded", onPageLoad, null);