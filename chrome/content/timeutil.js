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