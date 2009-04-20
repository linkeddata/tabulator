/**
 * The mapView class is a view that implements the Google Maps API to display
 * tabulator queries and their associated information on a map window.
 * MapView currently supports both latitude and longitude points, and also
 * has minimal geocoding support. ~jambo
 */
function mapView(container) {

    //The necessary vars for a View...
    /**The name field - a string.*/
    this.name="Map";
    /**States of all queries that the view currently know about.
     * 0=undrawn, 1=drawn, 2=can't draw. queryStates[q.id]=int*/
    this.queryStates=[];
    /**the HTML DOM node provided for this view.*/
    this.container=container;

    //The vars specific to a mapView...
    var map, geocoder;
    //the key displays what color matches what query.
    var key;
    var thisMapView=this; //for weird closure things.
    /**allMarkers stores the arrays of each marker set for each drawn query.
     * allMakers[q.id] yields the markers array associated with a query.*/
    var allMarkers=[];
    /**Obviously, centers and zooms a map on an array of markers, based on
     * the average coordinates of all of the markers.*/

    function centerAndZoomOnMarkers(map, markers) {
        var bounds = new GLatLngBounds(markers[0].getPoint(), markers[0].getPoint());
        var i;
        for (i=1; i<markers.length; i++) {
            bounds.extend(markers[i].getPoint());
        }
        var lat = (bounds.getNorthEast().lat() + bounds.getSouthWest().lat()) / 2.0;
        var lng = (bounds.getNorthEast().lng() + bounds.getSouthWest().lng()) / 2.0;
        if(bounds.getNorthEast().lng() < bounds.getSouthWest().lng()){
            lng += 180;
        }
        var center = new GLatLng(lat,lng)
        map.setCenter(center, map.getBoundsZoomLevel(bounds)-1);
    }

    this.onActive = function () {
        if(map!=null)
        {
            map.checkResize();
        }
        else if(GBrowserIsCompatible()){
            map = new GMap2(this.container);
            map.setCenter(new GLatLng(35,-90),4);
            map.addControl(new GSmallMapControl);
            if(geocoder==null) {
                geocoder = new GClientGeocoder();
            }
            map.checkResize();
            this.initializeKey();
        }
    }

    /**drawQuery draws a given query to the map and sets its state
     * to be 1 (drawn).  Does not draw if queryStates[q.id]==2.*/
    this.drawQuery = function (q) {
        if(this.queryStates[q.id]!=null && this.queryStates[q.id]==2)
            return;
        var markers=[];        //Will be used to temp store markers.
        var makeDark=false; //so we can alternate infoWindow item colors.
        var markerIcon = new GIcon(G_DEFAULT_ICON,'icons/markers/'+q.id%10+'.png');
        this.onBinding = function (bindings) {
            //Handles bindings returned with a callback for the query.
            tabulator.log.info("making a marker w/ bindings " + bindings);
            var nv = q.vars.length;
            var info, t, marker, point, lat, lng, i; //info holds the info bubble's DOM node
            //var tabs = [], useImage=false; //These vars control tabbing info windows.
            info = document.createElement('div');
            t=document.createElement('table');
            t.setAttribute('class','infoBubbleTable');
            info.setAttribute('class','infoBubbleDiv');
            info.appendChild(t);
            //tabs[0]=new GInfoWindowTab("General", info);
            info.setAttribute('ondblclick','mapViewDoubleClick(event)');
            for (i=0; i<nv; i++) {
                var obj = bindings[q.vars[i]];
                var geoType = q.vars[i].mapUsed;
                if(geoType!=null) {    //Found some data to use for mapping.
                    switch (geoType) {
                        case 'lat':
                            lat=obj.value; break;
                        case 'long':
                           lng=obj.value; break;
                        case 'based_near':
                            lat = kb.the(obj, kb.sym('http://www.w3.org/2003/01/geo/wgs84_pos#lat'), undefined).value;
                            lng = kb.the(obj, kb.sym('http://www.w3.org/2003/01/geo/wgs84_pos#long'), undefined).value;
                            break;
                        case 'address':
                            var street, city, country, post;
                            street=kb.the(obj, kb.sym('http://www.w3.org/2000/10/swap/pim/contact#street'), undefined).value;
                            city=kb.the(obj, kb.sym('http://www.w3.org/2000/10/swap/pim/contact#city'), undefined).value;
                            country=kb.the(obj, kb.sym('http://www.w3.org/2000/10/swap/pim/contact#country'), undefined).value;
                            post=kb.the(obj, kb.sym('http://www.w3.org/2000/10/swap/pim/contact#postalCode'), undefined).value;
                            geocoder.getLatLng(street+" "+city+" "+country+" "+post, function(newPoint) {
                                if(point==null && newPoint!=null) {  //if query didn't find another coord, and geocoding worked
                                    marker = new GMarker(newPoint, {icon:markerIcon});
                                    map.addOverlay(marker);
                                    markers[markers.length]=marker;  //place our marker in the next index.
                                    centerAndZoomOnMarkers(map, markers);
                                    var tr=document.createElement('tr'),td=document.createElement('td');
                                    td.colSpan=2;
                                    td.appendChild(document.createTextNode("("+newPoint.lat() +", "+newPoint.lng()+")"));
                                    tr.appendChild(td);t.appendChild(tr);
                                    GEvent.addListener(marker, "click", function() {
                                        marker.openInfoWindow();
                                        
                                    });
                                }
                            }); break;
                        default:
                            tabulator.log.error("Error in onBinding for MapView: findGeoType returned unknown type: "+geoType);
                            break;
                    }
                }
                else {    //Data that isn't meant to be mapped.
                    var tr = document.createElement('tr');
                    var tt = document.createElement('td');
                    tt.appendChild(document.createTextNode(q.vars[i].label));
                    tr.appendChild(tt);
                    var objNode;
                    if(obj.termType=='symbol' && isImage(obj.uri.substring(obj.uri.length-4))) {
                        var img = document.createElement('img');
                        var resizeRatio;
                        img.src=obj.uri;
                        var mapSize=map.getSize();
                        if(img.width>mapSize.width/2) {
                            resizeRatio=(mapSize.width/2)/img.width;
                            img.width=mapSize.width/2;
                            img.height*=resizeRatio;
                        }
                        if(img.height>mapSize.height/2) {
                            resizeRatio=(mapSize.height/2)/img.height;
                            img.height=mapSize.height/2;
                            img.width*=resizeRatio;
                        }
                        tr.appendChild(img);
                        t.appendChild(tr);
                        //tabs[tabs.length]=new GInfoWindowTab("Image "+tabs.length, img);
                    }
                    else {
                        objNode=makeInfoWindowObjectNode(obj,false);
                        if(makeDark) {
                            tt.setAttribute('class','dark');
                            objNode.setAttribute('class','dark');
                            makeDark=false;
                        }
                        else makeDark=true;
                        tr.appendChild(objNode);
                        t.appendChild(tr);
                    }
                }
            }

            //Add the completed point to the map -- but only if we actually got a point.
            if((lat!=undefined && lng!=undefined) || point!=undefined)
            {
                if(lat!=undefined && lng!=undefined) {
                    point = new GLatLng(lat, lng);
                }
                var tr=document.createElement('tr'),td=document.createElement('td');
                td.colSpan=2;
                td.appendChild(document.createTextNode("Location: ("+point.lat() +", "+point.lng()+")"));
                tr.appendChild(td);t.appendChild(tr);
                marker = new GMarker(point, {icon:markerIcon});
                map.addOverlay(marker);
                markers[markers.length]=marker;  //place our marker in the next index.
                centerAndZoomOnMarkers(map, markers);
                GEvent.addListener(marker, "click", function() {
                    //marker.openInfoWindowTabs(tabs,{maxWidth:map.getSize().width/2});
                    marker.openInfoWindow(info);
                });
            }
        }
        if(this.queryStates[q.id]!=2) {
            kb.query(q, this.onBinding);
            this.queryStates[q.id]=1;
            this.addKeyEntry(q);
            allMarkers[q.id]=markers;
        }
        map.checkResize();
    } //this.drawQuery

    function isImage(extension) {
        switch(extension) {
            case '.jpg':
            case '.JPG':
            case '.gif':
            case '.GIF':
            case '.png':
            case '.PNG':
                return true; break;
            default:
                return false; break;
    }
}
    /**Removes query q from the map area.  Also sets queryStates[q.id]=0.
     * Does nothing if q is not actually drawn. Deletes markers array
       from allMarkers.*/
    this.undrawQuery = function (q) {
        var i;
        if(this.queryStates[q.id]==1) {
            var markers=allMarkers[q.id];
            for(i=0; i<markers.length; i++) {
                map.removeOverlay(markers[i]);
            }
            delete allMarkers[q.id];
            this.removeKeyEntry(q);
            this.queryStates[q.id]=0;
        }
    }

    /**Adds a query --effectively makes the view aware that the query exists.
     * Also does some preprocessing-checks to see if the map can actually
     * handle this query.*/
    this.addQuery = function (q) {
        var canBeMapped = this.findMapVars(q);
        if(canBeMapped)
            this.queryStates[q.id]=0;
        else
            this.queryStates[q.id]=2;
    }

    /**Removes a query--undraws the query and then deletes the queryStates
     * entry for that query.*/
    this.removeQuery = function (q) {
        this.undrawQuery(q);
        delete this.queryStates[q.id];
    }

    /**As of yet unused.  Will, however, undraw all active queries.*/
    this.clearView = function () {
        var i;
        for(i=0; i<this.queryStates.length; i++){
            if(this.queryStates[i]!=null && this.queryStates[i]==1) {
                this.undrawQuery(q);
            }
        }
    }

    //mapView-specific functions..


    /**Used to preprocess queries.  Looks for lats and longs, addresses.
     * @returns true if q can be mapped, false otherwise.*/
    this.findMapVars = function (q) {
        var ns = q.pat.statements.length, i, pred, canBeMapped=false;
        var gotLat=false, gotLong=false;
        for(i=0; i<ns; i++) {
            pred=q.pat.statements[i].predicate.uri;
            switch(pred) {
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#location':
                case 'http://xmlns.com/foaf/0.1/based_near':
                    q.pat.statements[i].object.mapUsed='based_near';canBeMapped=true; break;
                case 'http://www.w3.org/2000/10/swap/pim/contact#address':
                    q.pat.statements[i].object.mapUsed='address';canBeMapped=true; break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#lat':
                    q.pat.statements[i].object.mapUsed='lat';
                    gotLat=true;
                    if(gotLong)
                        canBeMapped=true;
                    break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#long':
                    q.pat.statements[i].object.mapUsed='long';
                    gotLong=true;
                    if(gotLat)
                        canBeMapped=true;
                    break;
                default:
                    break;
            }
        }

        //Check the optionals, too!
        ns=q.pat.optional.length;
        for(i=0; i<ns; i++) {
            if(checkOptionals(q.pat.optional[i]))
                canBeMapped=true;
        }
        return canBeMapped;
    } 

    function checkOptionals(optional) {
        var i, canBeMapped=false, pred, gotLat=false, gotLong=false, ns = optional.statements.length;
        for(i=0; i<ns; i++) {
            pred=optional.statements[i].predicate.uri;
            switch(pred) {
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#location':
                case 'http://xmlns.com/foaf/0.1/based_near':
                    optional.statements[i].object.mapUsed='based_near';canBeMapped=true; break;
                case 'http://www.w3.org/2000/10/swap/pim/contact#address':
                    optional.statements[i].object.mapUsed='address';canBeMapped=true; break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#lat':
                    optional.statements[i].object.mapUsed='lat';
                    gotLat=true;
                    if(gotLong)
                        canBeMapped=true;
                    break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#long':
                    optional.statements[i].object.mapUsed='long';
                    gotLong=true;
                    if(gotLat)
                        canBeMapped=true;
                    break;
                default:
                    break;
            }
        }
        for(i=0;i<optional.optional.length; i++) {
            if(checkOptionals(optional.optional[i]))
                canBeMapped=true;
        }
        return canBeMapped;
    }

    this.initializeKey = function() {
        var keyArea,keyButton, keyClose, keyCloseButton, keyCloseImg;
        key=document.createElement('div');
        keyButton=document.createElement('div');
        keyArea=document.createElement('div');
        keyClose=document.createElement('div');
        keyCloseButton=document.createElement('span');
        keyCloseImg=document.createElement('img');


        keyCloseImg.src='icons/tbl-x-small.png';
        keyCloseImg.title='Close Key';
        keyClose.style.textAlign='right';
        keyClose.style.color='#777';
        keyCloseImg.onclick = function () { return thisMapView.hideKey(); }
        //keyCloseImg.style.border='solid #777 1px';
        keyClose.appendChild(keyCloseImg);
        keyClose.style.padding='2px';
        keyArea.setAttribute('class','mapKeyDiv');
        keyButton.appendChild(document.createTextNode('Show Key'));
        keyButton.onclick= function () { return thisMapView.showKey(); }
        keyArea.appendChild(keyButton);
        key.appendChild(keyClose);
        this.container.appendChild(keyArea);
        this.showKey = function () {
            keyArea.removeChild(keyButton);
            keyArea.appendChild(key);
        }
        this.hideKey = function () {
            keyArea.removeChild(key);
            keyArea.appendChild(keyButton);
        }
    }

    this.addKeyEntry = function (q) {
        var newEntry = document.createElement('div');
        var iconImg = document.createElement('img');
        iconImg.src='icons/markers/'+q.id%10+'.png'
        iconImg.width=12;
        iconImg.height=21;
 
        newEntry.setAttribute('class','keyEntry');
        newEntry.setAttribute('id',q.id);
        newEntry.appendChild(iconImg);
        newEntry.appendChild(document.createTextNode(q.name));
        key.appendChild(newEntry);
    }//this.addKeyEntry

    this.removeKeyEntry = function(q) {
        //Do what it takes to remove a key item.
        //somehow either traverse a DOM element, or maybe an array.
        //personally i would prefer if key were a DOM element, and
        //i just checked its children for things of class keyEntry.
        var children = key.childNodes;
        for(i=0;i<children.length;i++) {
            if(children[i].getAttribute('class')=='keyEntry' && children[i].getAttribute('id')==q.id) {
                key.removeChild(children[i]);
                break; //The query should really only exist as one instance.
            }
        }
    }//this.removeKeyEntry


} // mapView

function mapViewDoubleClick(event) {
    var target = getTarget(event);
    var aa = getAbout(kb, target);
    if (!aa) return;
    GotoURI(aa.uri);
}

function makeInfoWindowObjectNode(obj,asImage) {
    var newNode = document.createElement('td');
    if (!obj) var obj = new RDFLiteral(".");
    /*if  ((obj.termType == 'symbol') || (obj.termType == 'bnode')) {
        td.setAttribute('style', 'color:#4444ff');
    }*/
    var image
    if (obj.termType == 'literal') {
        var text=document.createTextNode(obj.value)
        newNode.textAlign='right';
        newNode.appendChild(text);
    } else if ((obj.termType == 'symbol') || (obj.termType == 'bnode')){
        if (asImage) {
            var img = AJARImage(obj.uri, label(obj));
            img.setAttribute('class', 'pic');
            newNode.appendChild(img);
        } else {
            var text=document.createTextNode(label(obj));
            newNode.textAlign='right';
            newNode.setAttribute('about', obj.toNT());
            newNode.setAttribute('style', 'color:#4444ff');
            newNode.appendChild(text);
        }
    }
    return newNode;
}

MapViewFactory = {
    name: "Map View",

    checkOptionals: function(optional) {
        var i, canBeMapped=false, pred, gotLat=false, gotLong=false, ns = optional.statements.length;
        for(i=0; i<ns; i++) {
            pred=optional.statements[i].predicate.uri;
            switch(pred) {
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#location':
                case 'http://xmlns.com/foaf/0.1/based_near':
                    optional.statements[i].object.mapUsed='based_near';return true; break;
                case 'http://www.w3.org/2000/10/swap/pim/contact#address':
                    optional.statements[i].object.mapUsed='address';return true; break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#lat':
                    optional.statements[i].object.mapUsed='lat';
                    gotLat=true;
                    if(gotLong)
                        return true;
                    break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#long':
                    optional.statements[i].object.mapUsed='long';
                    gotLong=true;
                    if(gotLat)
                        return true;
                    break;
                default:
                    break;
            }
        }
        for(i=0;i<optional.optional.length; i++) {
            if(checkOptionals(optional.optional[i]))
                return true;
        }
        return canBeMapped;
    },

    canDrawQuery:function(q) {
        var ns = q.pat.statements.length, i, pred, canBeMapped=false;
        var gotLat=false, gotLong=false;
        for(i=0; i<ns; i++) {
            pred=q.pat.statements[i].predicate.uri;
            switch(pred) {
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#location':
                case 'http://xmlns.com/foaf/0.1/based_near':
                    q.pat.statements[i].object.mapUsed='based_near';return true; break;
                case 'http://www.w3.org/2000/10/swap/pim/contact#address':
                    q.pat.statements[i].object.mapUsed='address';return true; break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#lat':
                    q.pat.statements[i].object.mapUsed='lat';
                    gotLat=true;
                    if(gotLong)
                        return true;
                    break;
                case 'http://www.w3.org/2003/01/geo/wgs84_pos#long':
                    q.pat.statements[i].object.mapUsed='long';
                    gotLong=true;
                    if(gotLat)
                        return true;
                    break;
                default:
                    break;
            }
        }

        ns=q.pat.optional.length;
        for(i=0; i<ns; i++) {
            if(checkOptionals(q.pat.optional[i]))
                return true;
        }

    },

    makeView: function(container,doc) {
        return new mapView(container,doc);
    },

    getIcon: function() {
        return "chrome://tabulator/content/icons/map.png";
    },

    getValidDocument: function() {
        return "http://dig.csail.mit.edu/2007/tab/map.html";
    }
}