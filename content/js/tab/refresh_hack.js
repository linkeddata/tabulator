/**
   This is a hack to fix the Tabulator caching
   
   If a document was updated, the Firefox Reload button on the toolbar did not reload the contents of the document. Firefox needed to be restarted. But with this fix, you don't have to do it any more!

   Caution:
   This hack could still be very buggy. In fact the key combitation CMD+R (on a Mac) for Reload doesn't work. But you can click the button on the tool bar, and reload the contents.

   [There was the time when the following snippet didn't work at all. And there was a time when you have to click twice to get it work. All the same code.]

Nov 26, 2008 - K and Ilaria reported of an "Unresponsive Script" pointing to sources.js when reloading some pages, for example www.google.com/news/
This was fixed by checking if there are any divs by the class name "TabulatorOutline"

   -kenny, albert and oshani
 */

window.addEventListener("load", function(){
	var reload = document.getElementById('reload-button');
	function RDF_reload() {
		var element = content.document.body.childNodes;
		if (element.length > 2) {
			if (element[1].className == "TabulatorOutline") {
				var sf = tabulator.sf;
				var kb = tabulator.kb;
				var thing = kb.sym(content.document.location.href);
				sf.objectRefresh(thing);
			}
		}
	}
	reload.addEventListener("click",RDF_reload, false);
},false);


