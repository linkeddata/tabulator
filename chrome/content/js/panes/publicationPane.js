/*
 * File: publicationPane.js
 * Purpose: Pane that contains publication data, such as author(s), publishing date, location, etc.
 */

/***
 * Most of the following code will change. This is a work in progress.
 ***/

var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
tabulator.icon.src.icon_publicationPane = "chrome://tabulator/content/icons/publication/publicationPaneIcon.gif";
tabulator.panes.register(tabulator.panes.publishingPane = new function() {
    //add these to the xpcom.js file
    tabulator.ns.dcmi = RDFNamespace("http://purl.org/dc/dcmitype/");
    tabulator.ns.dblp = RDFNamespace("http://www4.wiwiss.fu-berlin.de/dblp/terms.rdf#");
    tabulator.ns.bibo = RDFNamespace("http://purl.org/ontology/bibo/");
    tabulator.ns.dct = RDFNamespace("http://purl.org/dc/terms/");

    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript('chrome://tabulator/content/js/panes/patternSearch.js');

    this.name = 'Publication';
    this.icon = tabulator.icon.src.icon_publicationPane;

    var ps = new PatternSearch();
    var extract = ps.extract;
    var parse = ps.parse;

    this.label = function(subject) {
        var criteria = "(S,O,N) > (S,O,P,rdf:type) > (S,O,P,rdfs:subClassOf) > (S,O,N) > (S,N,F,bibo:Document)\n"+
                       "                                                               > (S,N,F,dblp:Article)\n"+
                       "                                                               > (S,N,F,dcmi:Text)\n"+
                       "                                                               > (S,N,F,foaf:Document)\n"+
                       "                           >                         ^";
        if(!this.isEmpty(parse(criteria).fetch(subject))) return this.name;
        else return null;
    }

    this.render = function(subject, document) {
        var div = document.createElement('div');
        div.setAttribute('id','publicationPane');

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
                             "        > (M,O,P,dct:creator)          > ["+titleNameTree+"]\n"+
                             "        > (M,O,P,dc:creator)           ^";

        var titleTree = "(S,O,N) > (S,N,P,bibo:shortTitle)\n"+
                        "        > (S,N,P,dct:title)";

        var dateTree = "(S,O,N) > (S,N,P,dct:created)\n"+
                       "        > (S,N,P,dct:date)";

        var abstractTree = "(S,O,N) > (S,N,P,dct:abstract)";

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
