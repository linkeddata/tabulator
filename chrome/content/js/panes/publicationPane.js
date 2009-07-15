/*
 * File: publicationPane.js
 * Purpose: Pane that contains publication data, such as author(s), publishing date, location, etc.
 */

/***
 * Most of the following code will change. This is a work in progress.
 ***/

//load('RDFTreeSearcher.js');

var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
tabulator.panes.register(tabulator.panes.publishingPane = new function() {
    this.name = 'Publication';
    this.icon = Icon.src.icon_publicationPane;
	
    this.label = function(subject) {
        var typeTriples = tabulator.kb.statementsMatching(subject,tabulator.ns.rdf('type'),null,null); // Stores all the 'types' of the URI in an array
        if(this.isEmpty(typeTriples)) return null;
        for(var ind = 0;ind < typeTriples.length;ind++) {
            if(this.isEmpty(typeTriples[ind])) continue;
            else if(tabulator.kb.whether(typeTriples[ind].object,tabulator.ns.rdfs('subClassOf'),tabulator.ns.bibo('Document'),null))
                return this.name;
        }
        return null;
    }

    this.render = function(subject, document) {
        var div = document.createElement('div');
        div.setAttribute('id','publicationPane');
        var bibo = tabulator.ns.bibo; // for aesthetics
        var foaf = tabulator.ns.foaf;
        var dct = tabulator.ns.dct;
        var owl = tabulator.ns.owl;
        var rdf = tabulator.ns.rdf;

        var ps = new PatternSearch();
        var extract = ps.extract;
        var parse = ps.parse;

        var nameTree = "(S,O,N) > (S,A,N) > (S,N,P,foaf:givenname)\n"+
                       "                  > (S,O,N) > (S,N,P,foaf:family_name)\n"+
                       "                            > (S,N,P,foaf:surname)\n"+
                       "        > (S,N,P,foaf:name)\n"+
                       "        > (S,N,P,dct:name)";

        var titleNameTree = "(S,O,N) > (S,A,N) > (S,N,P,foaf:title)\n"+
                            "                  > ["+nameTree+"]\n"+
                            "        >         ^";

        var personNameTree = "(S,O,N) > (M,O,T,foaf:Person) > ["+titleNameTree+"]";

        var authorNameTree = "(S,O,N) > (S,O,P,bibo:authorList)      > ["+personNameTree+"]\n"+
                             "        > (S,O,P,bibo:contributorList) ^\n"+
                             "        > (M,O,P,dct:creator)          > ["+titleNameTree+"]";

        var titleTree = "(S,O,N) > (S,N,P,bibo:shortTitle)\n"+
                        "        > (S,N,P,dct:title)";

        var dateTree = "(S,O,N) > (S,N,P,dct:created)\n"+
                       "        > (S,N,P,dct:date)";

        var abstractTree = "(S,O,N) > (S,N,P,dct:abstract)";

        alert(parse(authorNameTree).fetch(subject).toSource());

        var dataToAssemble = [['Author(s)',extract(parse(authorNameTree).fetch(subject)),'pubAuthor'],
                              ['Title',extract(parse(titleTree).fetch(subject)),'pubTitle'],
                              ['Date created',extract(parse(dateTree).fetch(subject)),'pubDateCreated'],
                              ['Abstract',extract(parse(abstractTree).fetch(subject)),'pubAbstract']];

        for(var i = 0;i < dataToAssemble.length;i++)
            div = this.appendEntry(document, div, dataToAssemble[i][0], dataToAssemble[i][1], dataToAssemble[i][2]);
   
        return div;
    }

    /* Helper Functions */
    // This function was being troublesome. After some tinkering, it turns out that instantiating a string with
    // double quotes instead of single quotes fixes the issue. NOTE: double quotes are safer.
    this.appendEntry = function(doc,div,tag,data,divClass) {
        if(data == null) return div;
        var subDiv = doc.createElement('div');
        subDiv.setAttribute('class',divClass);
        var label = doc.createTextNode(tag);
        var list = doc.createElement('ul');
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

    this.isEmpty = function(arr) {
        if(arr == null) return true;
        else if(arr.length == 0) return true;
        else return false;
    }
}, false);
