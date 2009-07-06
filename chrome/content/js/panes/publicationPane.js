/*
 * File: publicationPane.js
 * Purpose: Pane that contains publication data, such as author(s), publishing date, location, etc.
 */

/***
 * Most of the following code will change. This is a work in progress.
 ***/

//load('RDFTreeSearcher.js');

tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
tabulator.panes.register(tabulator.panes.publishingPane = {
    name: 'Publication',

    icon: Icon.src.icon_publicationPane,
	
    label: function(subject) {
        typeTriples = tabulator.kb.statementsMatching(subject,tabulator.ns.rdf('type'),null,null); // Stores all the 'types' of the URI in an array
        if(this.isEmpty(typeTriples)) return null;
        for(var ind = 0;ind < typeTriples.length;ind++) {
            if(this.isEmpty(typeTriples[ind])) continue;
            else if(tabulator.kb.whether(typeTriples[ind].object,tabulator.ns.rdfs('subClassOf'),tabulator.ns.bibo('Document'),null))
                return this.name;
        }
        return null;
    },

    render: function(subject, document) {
        var div = document.createElement('div');
        var bibo = tabulator.ns.bibo; // for aesthetics
        var foaf = tabulator.ns.foaf;
        var dct = tabulator.ns.dct;
        var owl = tabulator.ns.owl;
        var rdf = tabulator.ns.rdf;

        var ps = new PatternSearch();

        var authorTree = ps.MOBN([
                                  ps.SOPN(bibo('authorList'),[
                                                              ps.MOTN(foaf('Person'),[
                                                                                      ps.SPEN(dct('name')),
                                                                                      ps.ABN([
                                                                                              ps.SPEN(foaf('givenname')),
                                                                                              ps.SPEN(foaf('family_name'))
                                                                                             ])
                                                                                     ])
                                                             ]),
                                  ps.MOPN(dct('creator'),[
                                                          ps.SPEN(dct('name'))
                                                         ])
                                 ]);

        var titleTree = ps.SOBN([
                                 ps.SPEN(bibo('shortTitle')),
                                 ps.SPEN(dct('title'))
                                ]);

        var dateTree = ps.SOBN([
                                ps.SPEN(dct('date'))
                               ]);

        var dataToAssemble = [['Author(s)',ps.parseResults(authorTree.fetch(subject))],
                              ['Title',ps.parseResults(titleTree.fetch(subject))],
                              ['Date created',ps.parseResults(dateTree.fetch(subject))]];

        for(var i = 0;i < dataToAssemble.length;i++)
            div = this.appendEntry(document, div, dataToAssemble[i][0], dataToAssemble[i][1]);
   
        return div;
    },

    /* Helper Functions */
    // This function was being troublesome. After some tinkering, it turns out that instantiating a string with
    // double quotes instead of single quotes fixes the issue. NOTE: double quotes are safer.
    appendEntry: function(doc,div,tag,data) {
        if(data == null) return div;
        var subDiv = doc.createElement('div');
        var label = doc.createTextNode(tag);
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
    },

    isEmpty: function(arr) {
        if(arr == null) return true;
        else if(arr.length == 0) return true;
        else return false;
    }
}, false);
