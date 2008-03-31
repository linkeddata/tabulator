isExtension = true;
function isFirefox3(){ //from http://developer.mozilla.org/en/docs/Using_nsIXULAppInfo
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                          .getService(Components.interfaces.nsIXULAppInfo);
  var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                 .getService(Components.interfaces.nsIVersionComparator);
  return (versionChecker.compare(appInfo.version, "3.0a") >= 0)?true:false;
}

function openTool(url, type, width, height)
{
  width = width || 500;
  height = height || 400;
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
  var toolWindow = wm.getMostRecentWindow(type);
  if(!toolWindow)
    var w = window.openDialog(url, "_blank", "all=no,width="+width+",height="+height+",scrollbars=yes,resizable=yes,dialog=no");
  else
     toolWindow.focus();
}

window.addEventListener("load", function() { tabExtension.init(); }, false);
var kb,sf,qs,sourceWidget; //TODO:  In future, ditch these for tabulator.kb, etc
var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
  //Horrible global vars :(
  kb = tabulator.kb;
  sf = tabulator.sf;
  qs = tabulator.qs;
  lb = tabulator.lb;
  sourceWidget=tabulator.sourceWidget;
  

internals = []
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#request'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#requestedBy'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#source'] = 1;
internals['http://dig.csail.mit.edu/2005/ajar/ajaw/ont#session'] = 1;
internals['http://www.w3.org/2006/link#uri'] = 1;
internals['http://www.w3.org/2000/01/rdf-schema#seeAlso'] = 1;

// Special knowledge of properties //Don't use these anymore, dangerous
/* From now on, Namespaces are defined in xpcom.js(extension) and tabulate.js(online)
   localized at the beginning of outline.js (that is, you can still use these shortcuts,
   as long as you declare them in the appropriate scope)*/

kb.registerFormula("knowledge base");
//alert(kb.constructor.SuperClass.instances["knowledge base"]); //this is fine
//alert(RDFFormula.instances["knowledge base"]); //this returns undefined (strage scope stuff)
var views = {
    properties                          : [],
    defaults                                : [],
    classes                                 : []
}; //views

Icon = {}
Icon.src= []
Icon.tooltips= []
var iconPrefix = 'chrome://tabulator/content/';

////////////////////////// Common icons with extension version

Icon.src.icon_expand = iconPrefix + 'icons/tbl-expand-trans.png';
Icon.src.icon_more = iconPrefix + 'icons/tbl-more-trans.png'; // looks just like expand, diff semantics
// Icon.src.icon_expand = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_expand.png';
Icon.src.icon_collapse = iconPrefix + 'icons/tbl-collapse.png';
Icon.src.icon_internals = iconPrefix + 'icons/tango/22-emblem-system.png'
Icon.src.icon_instances = iconPrefix + 'icons/tango/22-folder-open.png'
Icon.src.icon_foaf = iconPrefix + 'icons/foaf/foafTiny.gif';
Icon.src.icon_shrink = iconPrefix + 'icons/tbl-shrink.png';  // shrink list back up
Icon.src.icon_rows = iconPrefix + 'icons/tbl-rows.png';
// Icon.src.Icon.src.icon_columns = 'icons/tbl-columns.png';

// Status balls:

Icon.src.icon_unrequested = iconPrefix + 'icons/16dot-blue.gif';
// Icon.src.Icon.src.icon_parse = iconPrefix + 'icons/18x18-white.gif';
Icon.src.icon_fetched = iconPrefix + 'icons/16dot-green.gif';
Icon.src.icon_failed = iconPrefix + 'icons/16dot-red.gif';
Icon.src.icon_requested = iconPrefix + 'icons/16dot-yellow.gif';
// Icon.src.icon_maximize = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_con_max.png';

// Panes:

Icon.src.icon_defaultPane = iconPrefix + 'icons/table.png';
Icon.src.icon_visit = iconPrefix + 'icons/tango/22-text-x-generic.png';
Icon.src.icon_dataContents = iconPrefix + 'icons/rdf_flyer.24.gif';  //@@ Bad .. find better
Icon.src.icon_n3Pane = iconPrefix + 'icons/w3c/n3_smaller.png';  //@@ Bad .. find better
Icon.src.icon_RDFXMLPane = iconPrefix + 'icons/22-text-xml4.png';  //@@ Bad .. find better
Icon.src.icon_imageContents = iconPrefix + 'icons/tango/22-image-x-generic.png'
Icon.src.icon_airPane = iconPrefix + 'icons/1pt5a.gif';  //@@ Ask Danny for a better icon
Icon.src.icon_LawPane = iconPrefix + 'icons/law.jpg';  //@@ Ask Danny for a better icon

// For that one we need a document with grid lines.  Make data-x-generix maybe

// actions for sources;
Icon.src.icon_retract = iconPrefix + 'icons/retract.gif';
Icon.src.icon_refresh = iconPrefix + 'icons/refresh.gif';
Icon.src.icon_optoff = iconPrefix + 'icons/optional_off.PNG';
Icon.src.icon_opton = iconPrefix + 'icons/optional_on.PNG';
Icon.src.icon_map = iconPrefix + 'icons/compassrose.png';
Icon.src.icon_retracted = Icon.src.icon_unrequested 
Icon.src.icon_retracted = Icon.src.icon_unrequested;

Icon.src.icon_time = iconPrefix+'icons/Wclocksmall.png';

// Within outline mode:

Icon.src.icon_telephone = iconPrefix + 'icons/silk/telephone.png';
Icon.src.icon_time = iconPrefix + 'icons/Wclocksmall.png';
Icon.src.icon_remove_node = iconPrefix + 'icons/tbl-x-small.png'
Icon.src.icon_add_triple = iconPrefix + 'icons/tango/22-list-add.png';
Icon.src.icon_add_new_triple = iconPrefix + 'icons/tango/22-list-add-new.png';
Icon.src.icon_show_choices = iconPrefix + 'icons/userinput_show_choices_temp.png'; // looks just like collapse, diff smmantics


Icon.tooltips[Icon.src.icon_add_triple] = 'Add more'
Icon.tooltips[Icon.src.icon_add_new_triple] = 'Add new triple'
Icon.tooltips[Icon.src.icon_remove_node] = 'Remove'
Icon.tooltips[Icon.src.icon_expand] = 'View details.'
Icon.tooltips[Icon.src.icon_collapse] = 'Hide details.'
Icon.tooltips[Icon.src.icon_shrink] = 'Shrink list.'
Icon.tooltips[Icon.src.icon_internals] = 'Under the hood'
Icon.tooltips[Icon.src.icon_instances] = 'List'
Icon.tooltips[Icon.src.icon_foaf] = 'Friends'
Icon.tooltips[Icon.src.icon_rows] = 'Make a table of data like this'
Icon.tooltips[Icon.src.icon_unrequested] = 'Fetch this resource.'
Icon.tooltips[Icon.src.icon_fetched] = 'This was fetched successfully.'
Icon.tooltips[Icon.src.icon_failed] = 'Failed to load. Click to retry.'
Icon.tooltips[Icon.src.icon_requested] = 'Being fetched. Please wait...'
Icon.tooltips[Icon.src.icon_visit] = 'View document'
Icon.tooltips[Icon.src.icon_retract] = 'Remove this source and all its data from tabulator.'
Icon.tooltips[Icon.src.icon_refresh] = 'Refresh this source and reload its triples.'

///////////////////////////////// End comon area

Icon.OutlinerIcon= function (src, width, alt, tooltip, filter)
{
	this.src=src;
	this.alt=alt;
	this.width=width;
	this.tooltip=tooltip;
	this.filter=filter;
       //filter: RDFStatement,('subj'|'pred'|'obj')->boolean, inverse->boolean (whether the statement is an inverse).
       //Filter on whether to show this icon for a term; optional property.
       //If filter is not passed, this icon will never AUTOMATICALLY be shown.
       //You can show it with termWidget.addIcon
	return this;
}

Icon.termWidgets = {}
Icon.termWidgets.optOn = new Icon.OutlinerIcon(Icon.src.icon_opton,20,'opt on','Make this branch of your query mandatory.');
Icon.termWidgets.optOff = new Icon.OutlinerIcon(Icon.src.icon_optoff,20,'opt off','Make this branch of your query optional.');
Icon.termWidgets.addTri = new Icon.OutlinerIcon(Icon.src.icon_add_triple,18,"add tri","Add a triple to this predicate");


LanguagePreference = "en"
/* //dealt with labeler
labelPriority = []
labelPriority[foaf('name').uri] = 10
labelPriority[dc('title').uri] = 8
labelPriority[rss('title').uri] = 6   // = dc:title?
labelPriority[contact('fullName').uri] = 4
labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
labelPriority[foaf('nick').uri] = 3
labelPriority[RDFS('label').uri] = 2
*/

var tOpenOutliner = function(e) {
        tabulatorDetectMetadata();//defined in tabulator.xul
        var doc = e.originalTarget;
        var divs = doc.getElementsByTagName('div');
        for(var i=0;i<divs.length;i++) {
          if(divs[i].className.search("TabulatorOutline")!=-1) {
            //Inject an outline here!!
            //I believe this approach is buggy when loading a HTML with this className...
            var uri = divs[i].getAttribute('id');
            var table = doc.createElement('table');
            table.setAttribute('id','outline');
            divs[i].appendChild(table);
            var outline = new Outline(doc);
            outline.init();
            //table.outline = outline;
            //alert(table.outline);

            var nsIURI = Components.classes["@mozilla.org/network/io-service;1"]
                                   .getService(Components.interfaces.nsIIOService)
                                   .newURI(uri, null, null); //ToDo: make sure the encoding is correct
            //this is the best I can do for now. The history entry is not altered so there will be
            //bugs when reloading sessions or goBack/goForth. --kenny
            gBrowser.getBrowserForDocument(doc).webNavigation.setCurrentURI(nsIURI);
            //It's not straightforward to get the browser from the inner document, there should
            //be a better way
            outline.GotoSubject(kb.sym(uri),true);

            var queryButton = doc.createElement('input');
            queryButton.setAttribute('type','button');
            queryButton.setAttribute('value','Find All');
            divs[i].appendChild(queryButton);
            queryButton.addEventListener('click',outline.viewAndSaveQuery,false);
          }
        }
      
      };
//Heavily modified from http://developer.mozilla.org/en/docs/Code_snippets:On_page_load
var tabExtension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent) {
      var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
      catman.deleteCategoryEntry("Gecko-Content-Viewers","application/rdf+xml",false);
      //var pluginDocFac = '@mozilla.org/content/plugin/document-loader-factory;1';
      //catman.addCategoryEntry('Gecko-Content-Viewers', 'application/rdf+xml', pluginDocFac, true, true);
      var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
      gBrowser.addEventListener('load',tOpenOutliner,true);
      gBrowser.addProgressListener(tLoadURIObserver, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
      var ThisSession=kb.the(undefined,tabulator.ns.rdfs('label'),kb.literal("This Session"));
      
      //everything ought to have a URI, but chrome may not be suitable because it maps to file:
      //so resource: or about: may be a good URI for the source of tabulator generated triples
      //ex. resource://gre/res/html.css is the html default css
      tabulator.sourceWidget.addSource(tabulator.sourceURI);
      var sourceRow = tabulator.sourceWidget.sources[tabulator.sourceURI];
      sourceRow.childNodes[1].textContent = "Because Tabulator says so...";
      //deal with this later
      if (!isFirefox3())  sf.requestURI("chrome://tabulator/content/internalKnowledge.n3",ThisSession);
      //gBrowser.setAttribute('ondraggesture', 'nsDragAndDrop.startDrag(event, TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragdrop' ,'nsDragAndDrop.drop(event,TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragenter','nsDragAndDrop.dragEnter(event,TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragexit' ,'nsDragAndDrop.dragExit(event,TabulatorOutlinerObserver)');
    }
  },
  
  externalQueryRequestListener: function(e) {

  }
}

/*
  Opening a URI of the same document will not send a new HttpRequest or even fire
  a DOM 'load' event. This observer handles onLocationChange, an event that triggers
  the RSS icon and the security icon. Of course, this is a hack.
*/
var tLoadURIObserver = {
  QueryInterface : function(aIID)
  {
    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsIXULBrowserWindow) ||
        aIID.equals(Components.interfaces.nsISupports))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },
  //this fires after the page is scrolled before a newpage is loaded.
  onLocationChange:function(aWebProgress, aRequest, aLocation){
    if (aLocation){
    //tabulator.log.warn("onLocationChange: currentURI is %s, aLocation is %s"
    //                    , gBrowser.currentURI.spec, aLocation.spec);
    }    
       //this filters out 'open in new window' , this filters out switching tabs
    if (aWebProgress.DOMWindow == content && gBrowser.selectedBrowser == this._lastBrowser && aLocation){
      //neglect non-outlner pages...
      if (tabulator.hasOutliner(content.document)){;
      //Not uri of the same document -> return.
      if (Util.uri.docpart(this._lastURI.spec) == Util.uri.docpart(aLocation.spec) /*&&
          aLocation.spec.indexOf('#') > -1*/){
            
      //throw new Error(aLocation.spec);
      if (this._lastURI.spec != aLocation.spec){
        tabulator.log.warn("Reloading because this is a hashed URI");
        BrowserReload();
      }
      //fixup the docuemnt. This is also triggered when goBack/goForth, which might be undesirable.      
      //content.document.documentElement.innerHTML = tabulator.getOutlinerHTML(aLocation.spec);
      //tOpenOutliner({'originalTarget':content.document}); //dangerous, content.document not wrapped
      }
      }              
    }
    //always do this to record lastBrowser and lastURI
    this._lastBrowser = gBrowser.selectedBrowser;    
    this._lastURI = gBrowser.currentURI;
  },
  _lastBrowser:null,
  _lastURI:null,  
  onSecurityChange:function(){
    return;
  },
  onStateChange:function(){
    return;
  },
  onStatusChange:function(){
    return;
  },
  onProgressChange:function(){
    return;
  }
}

document.addEventListener("TabulatorQueryRequest", function(e) {tabExtension.externalQueryRequestListener(e);},false,true);

function OutlineLoader(target,uri) {
  onLoadEvent = function(e) {
    var doc = e.originalTarget;
    //The following might be shaky: if there are loading bugs, check this first    
    var outline = new Outline(e.originalTarget);
    outline.GotoSubject(kb.sym(uri),true);
    var queryButton = doc.createElement('input');
    queryButton.setAttribute('type','button');
    queryButton.setAttribute('value','Find All');
    doc.body.appendChild(queryButton);
    queryButton.addEventListener('click',outline.viewAndSaveQuery,false);
    //TODO: Figure out the BROWSER from the event.
    target.removeEventListener("load",onLoadEvent , true);
  }
  return onLoadEvent;
}    

  function AJARImage(src, alt, tt) {
    if (!tt && Icon.tooltips[src]) tt = Icon.tooltips[src]
    //var sp = document.createElement('span')
    var image = content.document.createElement('img')
    image.setAttribute('src', src)
    if (typeof alt != 'undefined') image.setAttribute('alt', alt)
    if (typeof tt != 'undefined') image.setAttribute('title',tt)
    return image
  }

termWidget={}

termWidget.construct = function ()
{
	td = document.createElement('TD')
	td.setAttribute('class','iconTD')
	td.setAttribute('notSelectable','true')
	td.style.width = '0px';
	return td
}

termWidget.addIcon = function (td, icon)
{
	var img = AJARImage(icon.src,icon.alt,icon.tooltip)
	var iconTD = td.childNodes[1];
	var width = iconTD.style.width;
	width = parseInt(width);
	width = width + icon.width;
	iconTD.style.width = width+'px';
	iconTD.appendChild(img);
}

termWidget.removeIcon = function (td, icon){
  var iconTD = td.childNodes[1];
  var width = iconTD.style.width;
  width = parseInt(width);
  width = width - icon.width;
  iconTD.style.width = width+'px';
  for (var x = 0; x<iconTD.childNodes.length; x++){
    var elt = iconTD.childNodes[x];
    var eltSrc = elt.src;
    var baseURI = content.document.location.href.split('?')[0]; // ignore first '?' and everything after it
    var relativeIconSrc = Util.uri.join(icon.src,baseURI);
    if (eltSrc == relativeIconSrc) {
      iconTD.removeChild(elt);
    }
  }
}

termWidget.replaceIcon = function (td, oldIcon, newIcon)
{
	termWidget.removeIcon (td, oldIcon)
	termWidget.addIcon (td, newIcon)
}


function emptyNode(node) {
  var nodes = node.childNodes, len = nodes.length, i
  for (i=len-1; i>=0; i--)
    node.removeChild(nodes[i])
  return node
}

function string_startswith(str, pref) { // missing library routines
    return (str.slice(0, pref.length) == pref);
}




