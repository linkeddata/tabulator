loader.loadSubScript("chrome://tabulator/content/js/views/sorttable.js"/*, rootObj*/);
loader.loadSubScript("chrome://tabulator/content/js/views/tableView.js"/*, rootObj*/);
loader.loadSubScript("chrome://tabulator/content/js/views/mapView-ext.js"/*, rootObj*/);
loader.loadSubScript("chrome://tabulator/content/js/views/calView.js"/*, rootObj*/);
loader.loadSubScript("chrome://tabulator/content/js/views/calView/timeline/api/timelineView.js"/*, rootObj*/);

tabulator.views=[];

tabulator.registerViewType = function(viewFactory) {
    if(viewFactory) {
        tabulator.views.push(viewFactory);
    } else {
        tabulator.log.error("ERROR: View class not found.");
    }
};
    
tabulator.drawInBestView = function(query) {
    for(var i=tabulator.views.length-1; i>=0; i--) {
        if(tabulator.views[i].canDrawQuery(query)) {
            tabulator.drawInView(query,tabulator.views[i]);
            return true;
        }
    }
    tabulator.log.error("ERROR: That query can't be drawn! No valid views were found.");
    return false;
};
    
tabulator.drawInView = function(query,viewFactory,alert) {
    //get a new doc, generate a new view in doc, add and draw query.
    
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var gBrowser = wm.getMostRecentWindow("navigator:browser").getBrowser();
    onLoad = function(e) {
        var doc = e.originalTarget;
        var container = doc.getElementById('viewArea');
        var newView = viewFactory.makeView(container,doc);
        tabulator.qs.addListener(newView);
        newView.drawQuery(query);
        gBrowser.selectedBrowser.removeEventListener('load',onLoad,true);
    }
    var viewURI = viewFactory.getValidDocument(query)
    if(viewURI) {
        gBrowser.selectedTab = gBrowser.addTab(viewFactory.getValidDocument(query));
    } else {
        return; //TODO: This might be reached on an error.
    }
};
    
tabulator.registerViewType(TableViewFactory);
tabulator.registerViewType(MapViewFactory);
tabulator.registerViewType(CalViewFactory);
tabulator.registerViewType(TimelineViewFactory);
