/** The sidebar for the Tabulator extension**/

//doc is the document that the sidebar is embedded in.
function querySidebar(doc) {
  var ext = Components.classes["@dig.csail.mit.edu/tabext;1"].
                             createInstance(Components.interfaces.nsISupports);
  var button = document.getElementById("querySubmitButton"); 
  alert(ext.getQuerySource());
}