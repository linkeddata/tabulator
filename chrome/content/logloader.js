function onPageLoad(aEvent) {
  var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"]
                    .getService(Components.interfaces.nsISupports)
                    .wrappedJSObject;
  var doc = aEvent.originalTarget;
  var div = doc.createElement('div');
  div.setAttribute('id','logdiv');
  doc.body.appendChild(div);
  tabulator.log.setContainer(div);
}
document.addEventListener("DOMContentLoaded", onPageLoad, null);