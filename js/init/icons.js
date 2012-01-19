tabulator.Icon = {};
tabulator.Icon.src= []
tabulator.Icon.tooltips= []

var iconPrefix = tabulator.iconPrefix; // e.g. 'chrome://tabulator/content/';

////////////////////////// Common icons with extension version

tabulator.Icon.src.icon_expand = iconPrefix + 'icons/tbl-expand-trans.png';
tabulator.Icon.src.icon_more = iconPrefix + 'icons/tbl-more-trans.png'; // looks just like expand, diff semantics
// Icon.src.icon_expand = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_expand.png';
tabulator.Icon.src.icon_collapse = iconPrefix + 'icons/tbl-collapse.png';
tabulator.Icon.src.icon_internals = iconPrefix + 'icons/tango/22-emblem-system.png'
tabulator.Icon.src.icon_instances = iconPrefix + 'icons/tango/22-folder-open.png'
tabulator.Icon.src.icon_foaf = iconPrefix + 'icons/foaf/foafTiny.gif';
tabulator.Icon.src.icon_social = iconPrefix + 'icons/social/social.gif';
tabulator.Icon.src.icon_mb = iconPrefix + 'icons/microblog/microblog.png';
tabulator.Icon.src.icon_shrink = iconPrefix + 'icons/tbl-shrink.png';  // shrink list back up
tabulator.Icon.src.icon_rows = iconPrefix + 'icons/tbl-rows.png';
// Icon.src.Icon.src.icon_columns = 'icons/tbl-columns.png';

// Status balls:

tabulator.Icon.src.icon_unrequested = iconPrefix + 'icons/16dot-blue.gif';
// tabulator.Icon.src.Icon.src.icon_parse = iconPrefix + 'icons/18x18-white.gif';
tabulator.Icon.src.icon_fetched = iconPrefix + 'icons/16dot-green.gif';
tabulator.Icon.src.icon_failed = iconPrefix + 'icons/16dot-red.gif';
tabulator.Icon.src.icon_requested = iconPrefix + 'icons/16dot-yellow.gif';
// Icon.src.icon_maximize = iconPrefix + 'icons/clean/Icon.src.Icon.src.icon_con_max.png';

// Panes:
tabulator.Icon.src.icon_CVPane = iconPrefix + 'icons/CV.png';
tabulator.Icon.src.icon_defaultPane = iconPrefix + 'icons/about.png';
tabulator.Icon.src.icon_visit = iconPrefix + 'icons/tango/22-text-x-generic.png';
tabulator.Icon.src.icon_dataContents = iconPrefix + 'icons/rdf_flyer.24.gif';  //@@ Bad .. find better
tabulator.Icon.src.icon_n3Pane = iconPrefix + 'icons/w3c/n3_smaller.png';  //@@ Bad .. find better
tabulator.Icon.src.icon_RDFXMLPane = iconPrefix + 'icons/22-text-xml4.png';  //@@ Bad .. find better
tabulator.Icon.src.icon_imageContents = iconPrefix + 'icons/tango/22-image-x-generic.png'
tabulator.Icon.src.icon_airPane = iconPrefix + 'icons/1pt5a.gif';  
tabulator.Icon.src.icon_LawPane = iconPrefix + 'icons/law.jpg';  
tabulator.Icon.src.icon_pushbackPane = iconPrefix + 'icons/pb-logo.png';  

// For photo albums (By albert08@csail.mit.edu)
tabulator.Icon.src.icon_photoPane = iconPrefix + 'icons/photo_small.png';
tabulator.Icon.src.icon_tagPane = iconPrefix + 'icons/tag_small.png';
tabulator.Icon.src.icon_TinyTag = iconPrefix + 'icons/tag_tiny.png';
tabulator.Icon.src.icon_photoBegin = iconPrefix + 'icons/photo_begin.png';
tabulator.Icon.src.icon_photoNext = iconPrefix + 'icons/photo_next.png';
tabulator.Icon.src.icon_photoBack = iconPrefix + 'icons/photo_back.png';
tabulator.Icon.src.icon_photoEnd = iconPrefix + 'icons/photo_end.png';
tabulator.Icon.src.icon_photoImportPane = iconPrefix + 'icons/flickr_small.png';
//Icon.src.icon_CloseButton = iconPrefix + 'icons/close_tiny.png';
//Icon.src.icon_AddButton = iconPrefix + 'icons/addphoto_tiny.png';

// For that one we need a document with grid lines.  Make data-x-generix maybe

// actions for sources;
tabulator.Icon.src.icon_retract = iconPrefix + 'icons/retract.gif';
tabulator.Icon.src.icon_refresh = iconPrefix + 'icons/refresh.gif';
tabulator.Icon.src.icon_optoff = iconPrefix + 'icons/optional_off.PNG';
tabulator.Icon.src.icon_opton = iconPrefix + 'icons/optional_on.PNG';
tabulator.Icon.src.icon_map = iconPrefix + 'icons/compassrose.png';
tabulator.Icon.src.icon_retracted = tabulator.Icon.src.icon_unrequested 
tabulator.Icon.src.icon_retracted = tabulator.Icon.src.icon_unrequested;

tabulator.Icon.src.icon_time = iconPrefix+'icons/Wclocksmall.png';

// Within outline mode:

tabulator.Icon.src.icon_telephone = iconPrefix + 'icons/silk/telephone.png';
tabulator.Icon.src.icon_time = iconPrefix + 'icons/Wclocksmall.png';
tabulator.Icon.src.icon_remove_node = iconPrefix + 'icons/tbl-x-small.png'
tabulator.Icon.src.icon_add_triple = iconPrefix + 'icons/tango/22-list-add.png';
tabulator.Icon.src.icon_add_new_triple = iconPrefix + 'icons/tango/22-list-add-new.png';
tabulator.Icon.src.icon_show_choices = iconPrefix + 'icons/userinput_show_choices_temp.png'; // looks just like collapse, diff smmantics

// Inline Justification
tabulator.Icon.src.icon_display_reasons = iconPrefix + 'icons/tango/22-help-browser.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_display_reasons] = 'Display explanations';

// Other tooltips
tabulator.Icon.tooltips[tabulator.Icon.src.icon_add_triple] = 'Add more'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_add_new_triple] = 'Add one'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_remove_node] = 'Remove'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_expand] = 'View details.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_collapse] = 'Hide details.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_shrink] = 'Shrink list.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_internals] = 'Under the hood'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_instances] = 'List'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_foaf] = 'Friends'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_rows] = 'Make a table of data like this'
// Note the string '[Tt]his resource' can be replaced with an actual URI by the code
tabulator.Icon.tooltips[tabulator.Icon.src.icon_unrequested] = 'Fetch this.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_fetched] = 'Fetched successfully.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_failed] = 'Failed to load. Click to retry.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_requested] = 'This is being fetched. Please wait...'

tabulator.Icon.tooltips[tabulator.Icon.src.icon_visit] = 'View document'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_retract] = 'Remove this source and all its data from tabulator.'
tabulator.Icon.tooltips[tabulator.Icon.src.icon_refresh] = 'Refresh this source and reload its triples.'

///////////////////////////////// End comon area

tabulator.Icon.OutlinerIcon= function (src, width, alt, tooltip, filter)
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

tabulator.Icon.termWidgets = {}
tabulator.Icon.termWidgets.optOn = new tabulator.Icon.OutlinerIcon(tabulator.Icon.src.icon_opton,20,'opt on','Make this branch of your query mandatory.');
tabulator.Icon.termWidgets.optOff = new tabulator.Icon.OutlinerIcon(tabulator.Icon.src.icon_optoff,20,'opt off','Make this branch of your query optional.');
tabulator.Icon.termWidgets.addTri = new tabulator.Icon.OutlinerIcon(tabulator.Icon.src.icon_add_triple,18,"add tri","Add one");
// Ideally: "New "+label(subject)

