function onPageLoad(aEvent) {
  //alert("DOMContentLoaded");
  var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"]
                    .getService(Components.interfaces.nsISupports)
                    .wrappedJSObject;
  var doc = aEvent.originalTarget;
  var div = doc.createElement('div');
  div.setAttribute('id','logdiv');
  doc.body.appendChild(div);
  tabulator.log.setContainer(div);

}
/* //All these don't work in firefox 3, so setContainer is called in log.xul
window.addEventListener("DOMContentLoaded", onPageLoad, null);
window.addEventListener('load', onPageLoad, null);
alert("test");
*/