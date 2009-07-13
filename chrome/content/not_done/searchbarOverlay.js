//There seems to be no XBL overlay...
//please seeAlso search.xml, an XBL document
function TabulatorSearchbarOverlay(){

var tabOverlay={
//from browser.js
getSearchBar: function BrowserSearch_getSearchBar() {
  var searchBar = document.getElementById("searchbar");
  if (searchBar) {
    var style = window.getComputedStyle(searchBar.parentNode, null);
    if (style.visibility == "visible" && style.display != "none")
      return searchBar;
  }
  return null;
}
}

    var buttonPopup = document.getAnonymousElementByAttribute(tabOverlay.getSearchBar(),'anonid','searchbar-popup');
    //var buttonPopup=tabOverlay.getSearchBar()._popup;
    var searchBar=tabOverlay.getSearchBar();
    if (!searchBar) return;
    //var menuitem = document.createElementNS(kXULNS, "menuitem");
    //menuitem.setAttribute("label", "Tabulator Labeler");
    //menuitem.setAttribute("class", "menuitem-iconic searchbar-engine-menuitem");
    //buttonPopup.insertBefore(menuitem, buttonPopup.firstChild);
    
    var originalCode=searchBar.rebuildPopup;
    searchBar.rebuildPopup=function(){
        //searchBar.rebuildPopup(); //I wonder whether this works...
        originalCode.apply(this,[]);
        var popup=this._popup;
        var menuitem = document.createElementNS(kXULNS, "menuitem");
        menuitem.setAttribute("label", "Tabulator Labeler");
        menuitem.setAttribute("id", 'searchbar-labeler');
        menuitem.setAttribute("class", "menuitem-iconic searchbar-engine-menuitem");
        //if (this._engines[i] == this.currentEngine)
        //  menuitem.setAttribute("selected", "true");
        //if (this._engines[i].iconURI)
        //  menuitem.setAttribute("src", this._engines[i].iconURI.spec);
        popup.insertBefore(menuitem, popup.firstChild);
        //menuitem.engine = this._engines[i];
    }
    function tabulatorListener(aEvent){
        if (aEvent.originalTarget.id=='searchbar-labeler'){
           //this.currentEngine={}; //conflicts...
           this.select();
           this.focus();

           //alert(this.textbox.getAttribute('autocompletesearch'));
           //alert(this.textbox.mSearchNames.length);
           this.textbox.setAttribute('autocompletesearch','labeler'); //setAttribute does not cause dynamic effect
           this.textbox.mSearchNames=['labeler']; //seeAlso autocomplete.xml
           //this.textbox.initSearchNames();
           //alert(this.textbox.getAttribute('autocompletesearch'));
           //alert(this.textbox.mSearchNames[0]);
           
           var textbox=this.textbox;
           this.textbox.onTextEntered=function (aEvent){
               var inputString=textbox.value;
               var uri;
               for (var i=0;i<lb.entry.length;i++)
                   if (lb.entry[i][0]==inputString) uri=lb.entry[i][1].uri;
               loadURI(uri,null,null,false);     
           }
        }else{ //switch back
        }
    }
    searchBar.addEventListener('command',function(e){tabulatorListener.apply(this,[e])},false);
    
}

//!!!Super Important
window.addEventListener("load", function() {TabulatorSearchbarOverlay()}, false);