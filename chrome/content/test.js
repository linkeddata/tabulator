isExtension = true;

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

// Special knowledge of properties
tabont = Namespace("http://dig.csail.mit.edu/2005/ajar/ajaw/ont#")
foaf = Namespace("http://xmlns.com/foaf/0.1/")
rdf = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")
OWL = Namespace("http://www.w3.org/2002/07/owl#")
dc = Namespace("http://purl.org/dc/elements/1.1/")
rss = Namespace("http://purl.org/rss/1.0/")
xsd = Namespace("http://www.w3.org/TR/2004/REC-xmlschema-2-20041028/#dt-")
contact = Namespace("http://www.w3.org/2000/10/swap/pim/contact#")
mo = Namespace("http://purl.org/ontology/mo/")
//logont = Namespace("http://www.w3.org/2000/10/swap/log#");

//Namespaces for AIR (Amord in RDF) use
tms = Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
air = air = Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");

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
labelPriority = []
labelPriority[foaf('name').uri] = 10
labelPriority[dc('title').uri] = 8
labelPriority[rss('title').uri] = 6   // = dc:title?
labelPriority[contact('fullName').uri] = 4
labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
labelPriority[foaf('nick').uri] = 3
labelPriority[RDFS('label').uri] = 2

//Heavily modified from http://developer.mozilla.org/en/docs/Code_snippets:On_page_load
var tabExtension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent) {
      var catman = Components.classes["@mozilla.org/categorymanager;1"]
                           .getService(Components.interfaces.nsICategoryManager);
      catman.deleteCategoryEntry("Gecko-Content-Viewers","application/rdf+xml",false);
      var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
      httpResponseObserver.register(); // timbl
      gBrowser.addEventListener('load',function(e) {
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

            //Approach: cache the intermediate uri for an instace
            //          have to use this kind of inverseredirect becuase only rdf content-types
            //          triggers tabulator
            //Bug cases(maybe): 1. when two tabs simultaneously load a URI that returns 303
            //                  2. press stop at the mean time of the redirection and you load the
            //                     redirected document
            //ToDo: modify the URI bar (after that, there is cache problem...)
            //      perhaps store inverseredirect URI on tabs?
            if (tabExtension.inverseRedirectDirectory[uri]){
                outline.GotoSubject(kb.sym(tabExtension.inverseRedirectDirectory[uri]),true);
                tabExtension.inverseRedirectDirectory[uri]=undefined;                               
            }else{
                outline.GotoSubject(kb.sym(uri),true);
            }
            var queryButton = doc.createElement('input');
            queryButton.setAttribute('type','button');
            queryButton.setAttribute('value','Find All');
            divs[i].appendChild(queryButton);
            queryButton.addEventListener('click',outline.viewAndSaveQuery,false);
          }
        }
      },true);
      //deal with local .n3 files, I don't know what the last two arguments do...
      //also a hack on sources.js
      catman.addCategoryEntry('ext-to-type-mapping','n3','text/rdf+n3',true,true);
      var ThisSession=kb.the(undefined,RDFS('label'),kb.literal("This Session"));
      sf.requestURI("chrome://tabulator/content/internalKnowledge.n3",ThisSession);
      //gBrowser.setAttribute('ondraggesture', 'nsDragAndDrop.startDrag(event, TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragdrop' ,'nsDragAndDrop.drop(event,TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragenter','nsDragAndDrop.dragEnter(event,TabulatorOutlinerObserver)');
      gBrowser.setAttribute('ondragexit' ,'nsDragAndDrop.dragExit(event,TabulatorOutlinerObserver)');
    }
  },
  
  externalQueryRequestListener: function(e) {

  },
  inverseRedirectDirectory: {}
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

//////////////////////// HTTP Request observer
// Based on code in
// http://developer.mozilla.org/en/docs/Setting_HTTP_request_headers
// and http://developer.mozilla.org/en/docs/Observer_Notifications#HTTP_requests
// http://www.xulplanet.com/references/xpcomref/ifaces/nsIHttpChannel.html
// and http://www.xulplanet.com/references/xpcomref/ifaces/nsIChannel.html
var httpResponseObserver =
{
    observe: function(subject, topic, data) {
        if (topic == "http-on-examine-response" && typeof Components != 'undefined') { // Componenets being undefined -- why?
              var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
              var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
              // httpChannel.setRequestHeader("X-Hello", "World", false)
              if (httpChannel.responseStatus == '303') {
                  tabulator.log.warn('httpResponseObserver: status='+httpChannel.responseStatus+
                    ' '+httpChannel.responseStatusText+ ' for ' + httpChannel.originalURI.spec);
                  var newURI = httpChannel.getResponseHeader('location');
                  tabulator.log.warn('httpResponseObserver: now URI = ' + httpChannel.URI.spec + ' a ' +
                                                                          typeof httpChannel.URI.spec);
                  tabulator.log.warn('httpResponseObserver: Location: ' + newURI + ' a ' + typeof newURI);
                  tabExtension.inverseRedirectDirectory[newURI] = httpChannel.URI.spec;
              }
        }
    },

    get observerService() {
    return Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
    },

    register: function()
    {
    tabulator.log.warn('test.js: registering observer');
    //alert('test.js: registering observer')
    this.observerService.addObserver(this, "http-on-examine-response", false);
    },

    unregister: function()
    {
    this.observerService.removeObserver(this, "http-on-examine-response");
    }
};




