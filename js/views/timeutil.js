//     @@@@ Note only works with extension

// isExtension=true;

if ((typeof lb) == "undefined") {
      lb = Components.classes["@dig.csail.mit.edu/tabulator;1"] // @@@ tabulator.isExtension
                    .getService(Components.interfaces.nsISupports)
                    .wrappedJSObject.lb;
}

function uni(prefix){
    var n = counter();
    var name = prefix + n;
    YAHOO.namespace(name);
    return n;
}

counter = function(){
	var n = 0;
	return function(){
		n+=1;
		return n;
  }
}();

Icon = {};
Icon.src=[];
Icon.tooltips=[];
var iconPrefix = 'chrome://tabulator/content/';
Icon.src.icon_expand = iconPrefix+'icons/tbl-expand-trans.png';
Icon.src.icon_collapse = iconPrefix+'icons/tbl-collapse.png';
Icon.tooltips[Icon.src.icon_expand]='View details.'
Icon.tooltips[Icon.src.icon_collapse] = 'Hide details.'

function matrixTD(obj, st, asImage, doc) {
    if (!doc) doc=document;
    var td = doc.createElement('TD');
    td.stat = st; // pointer to the statement for the td
    if (!obj) var obj = new RDFLiteral(".");
    if  ((obj.termType == 'NamedNode') || (obj.termType == 'BlankNode') ||
    (obj.termType == 'collection')) {
        td.setAttribute('about', obj.toNT());
        td.setAttribute('style', 'color:#4444ff');
    }

    if (obj.termType =='NamedNode') {
        td.setAttribute('type', 'sym');
    }
    if (obj.termType =='BlankNode') {
        td.setAttribute('type', 'BlankNode');
    }
    if (obj.termType =='Literal') {
        td.setAttribute('type', 'lit');
    }

    var image;
    if (obj.termType == 'Literal') {
        td.setAttribute('about', obj.value);
        td.appendChild(doc.createTextNode(obj.value));
    }
    else if ((obj.termType == 'NamedNode') || (obj.termType == 'BlankNode') || (obj.termType == 'collection')) {
        if (asImage) {
            image = AJARImage(mapURI(obj.uri), label(obj), label(obj));
            image.setAttribute('class', 'pic');
            td.appendChild(image);
        }
        else {
            td.appendChild(doc.createTextNode(label(obj)));
        }
    }
    return td;
}
