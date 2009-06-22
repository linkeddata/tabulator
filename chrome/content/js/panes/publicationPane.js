/*
 * File: publicationPane.js
 * Purpose: Pane that contains publication data, such as author(s), publishing date, location, etc.
 */

/***
 * Most of the following code will change. This is a work in progress.
 ***/

tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
tabulator.panes.register(tabulator.panes.publishingPane = {
    name: 'Publication',

    icon: Icon.src.icon_publicationPane,
	
    label: function(subject) {
        typeTriples = tabulator.kb.statementsMatching(subject,tabulator.ns.rdf('type'),null,null); // Stores all the 'types' of the URI in an array
        if(typeTriples == null) return null;
        else if(typeTriples.length == 0) return null;
        for(var ind = 0;ind < typeTriples.length;ind++) {
            if(typeTriples[ind] == null) continue;
            else if(typeTriples[ind].length == 0) continue;
            else if(tabulator.kb.whether(typeTriples[ind].object,tabulator.ns.rdfs('subClassOf'),tabulator.ns.bibo('Document'),null))
                return this.name;
        }
        return null;
    },

    render: function(subject, document) {
        var div = document.createElement('div');
        var bibo = tabulator.ns.bibo; // for aesthetics
        var dct = tabulator.ns.dct;

        var mainTags = ["Title","Short Title","Abstract","Short Description","Subject","Created"];
        var mainPredicateURIs = [[dct('title')],[bibo('shortTitle')],[dct('abstract'),bibo('abstract')],
                                 [bibo('shortDescription')],[dct('subject')],[dct('created')]];

        var authorTags = ["Authors(s)","Creator"];
        var authorPredicateURIs = [[bibo('authorList')],[dct('creator')]];
        var authorIfContainerURIs = [[bibo('Person')]];

        var indexingTags = ["EISSN","ISSN-10","ISSN-13"];

        var mainDiv = this.getInfoDiv(document,subject,mainTags,mainPredicateURIs,null);
        div.appendChild(mainDiv);
        var authorDiv = this.getInfoDiv(document,subject,authorTags,authorPredicateURIs,authorIfContainerURIs);
        div.appendChild(authorDiv);
        // var indexingDiv = 
   
        return div;
    },

    /* Helper Functions */
    getInfoDiv: function(document,subject,tags,uris) {
        var div = document.createElement('div');
        var data = new Array();
        for(var index = 0;index < uris.length;index++) {
            data.push(this.getObjectURIs(subject,uris[index]));
            div = this.appendEntry(document,div,tags[index],data[index]);
        }
        return div;
    },

    getObjectURIs: function(subject,filterURIs,ifCollectionFilterURIs) { // Last term can be null; safety for possible collections|bnodes
        var objects = new Array();
        for(var i = 0;i < filterURIs.length;i++) {
            var queried = tabulator.kb.statementsMatching(subject,filterURIs[i],null,null);
            if(queried == null)
                continue;
            else if(queried.length == 0)
                continue;
            for(var j = 0;j < queried.length;j++) {
                alert(queried[j].object.termType);
                if(queried[j].object.termType === 'literal')
                    objects.push(queried[j].object);
                else if(queried[j].object.termType === 'symbol')
                    objects.push(queried[j].object);
                else if(queried[j].object.termType === 'bnode') {
                    var collectionObjects = this.getObjectURIs(queried[j].object);
                    if(collectionObjects == null) continue; // Empty bnode
                    for(var k = 0;k < collectionObjects.length;k++) {
                        alert(ifCollectionFilterURIs.toSource());
                        var matchedCont = this.getObjectURIs(collectionObjects[k],ifCollectionFilterURIs,null);
                        if(matchedCont != null)
                            objects.concat();
                    }
                }
                else if(queried[j].object.termType === 'collection') { }
            }
        }
        if(objects.length == 0) return null;
        else return objects;
    },

    // This function was being troublesome. After some tinkering, it turns out that instantiating a string with
    // double quotes instead of single quotes fixes the issue. NOTE: double quotes are safer.
    appendEntry: function(doc,div,tag,data) {
        if(data == null) return div;
        var subDiv = doc.createElement('div');
        var label = doc.createTextNode(tag); //<---- This was the problem. WTH? / Double quotes fixed it. Weird.
        list = doc.createElement('ul');
        for(var index = 0;index < data.length;index++) {
            li = doc.createElement('li');
            li.innerHTML = escapeForXML(data[index].toString());
            list.appendChild(li);
        }
        div.appendChild(subDiv);
        subDiv.appendChild(label);
        subDiv.appendChild(list);
        return div;
    }   
}, false);
