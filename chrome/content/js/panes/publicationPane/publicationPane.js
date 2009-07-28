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
    anchor = this;

    //add these to the xpcom.js file
    tabulator.ns.dcmi = RDFNamespace("http://purl.org/dc/dcmitype/");
    tabulator.ns.dblp = RDFNamespace("http://www4.wiwiss.fu-berlin.de/dblp/terms.rdf#");
    tabulator.ns.bibo = RDFNamespace("http://purl.org/ontology/bibo/");
    tabulator.ns.dct = RDFNamespace("http://purl.org/dc/terms/");

    //shortcuts
    var rdf = tabulator.ns.rdf;
    var rdfs = tabulator.ns.rdfs;
    var bibo = tabulator.ns.bibo;
    var dct = tabulator.ns.dct;
    var dc = tabulator.ns.dc;
    var dblp = tabulator.ns.dblp;
    var foaf = tabulator.ns.foaf;

    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript('chrome://tabulator/content/js/panes/publicationPane/PatternSearchX.js');

    this.name = 'Publication';
    this.icon = tabulator.icon.src.icon_publicationPane;

    var psx = new PatternSearchX();
    var n = psx.scut;

    function isPublication(subject) {
        var tree = n('SSO')(false, rdf('type'), null, 2,
                   [
                    n('SSN')(false, rdfs('subClassOf'), bibo('Document'), 0)
                   ]);
        return tree.fetch(subject);
    }

    function isAuthor(subject) {
        var tree = n('SNO')(false,
                   [
                    n('MSO')(false, bibo('authorList'), null, 2,
                    [
                     n('MSN')(false, null, subject, 2)
                    ]),
                    n('MSN')(false, dct('creator'), subject, 2)
                   ]);
        //alert("isAuthor("+subject.toSource()+")");
        return tree.fetch(null);
    }

    function isDocument(subject) {
        return false;
    }

    this.label = function(subject) {
        if(isPublication(subject) || isAuthor(subject)) return this.name;
        else return null;
    }

    this.renderConverter = function(subject, document, render) {
        var div = document.createElement('div');
        div.className += " tab";
        div.innerHTML = "Testing";
        return div;
    }

    var isEmpty = function(arr) {
        if(arr == null) return true;
        else if(arr.length == 0) return true;
        else return false;
    }


    var dataGatherer = new function() {
        var isAPerson = n('SSN')(false, rdf('type'), foaf('Person'), 2);
        function authorTemplate(infoAboutAuthor) {
            var personInList = [n('MSO')(true, null, null, 2,infoAboutAuthor)];
            var authorsTree = n('SNO')(false,
                              [
                               n('SSO')(false, bibo('authorList'), null, 2,personInList),
                               n('SSO')(false, bibo('contributorList'), null, 2,personInList),
                               n('MSO')(true, dct('creator'), null, 2,infoAboutAuthor),
                               n('MSO')(true, dc('creator'), null, 2,infoAboutAuthor)
                              ]);
            return authorsTree;
        }
        this.getAuthors = function(doc) {
            return authorTemplate([isAPerson]).fetch(doc);
        }
         
        // input: Symbol of type person
        var nameTree = 
           n('SNO')(false,
           [
            n('SNA')(false,
            [
             n('SSN')(true, foaf('givenname'), null, 2),
             n('SNO')(false,
             [
              n('SSN')(true, foaf('family_name'), null, 2),
              n('SSN')(true, foaf('foaf_surname'), null, 2)
             ])
            ]),
            n('SSN')(true, foaf('name'), null, 2),
            n('SSN')(true, dct('name'), null, 2)
           ]);

        // input: symbol of type person
        var titleNameTree = 
            n('SNO')(false,
            [
             n('SNA')(false,
             [
              n('SSN')(true, foaf('title'), null, 2),
              nameTree
             ]),
             nameTree
            ]);

        // returns an array of doubles containing the author's URI and name
        this.getAuthorNames = function(doc) {
            var data = authorTemplate([n('SNA')(false,[isAPerson,titleNameTree])]).fetch(doc);
            var doubles = [];
            function smush(arr) {
                var str = "";
                for(var i = 0;i < arr.length;i++) {
                    if(arr[i].termType && arr[i].termType === 'literal')
                        str += arr[i].toString();
                    else if(arr[i].constructor === Array)
                        str += smush(arr[i]);
                    if(i < arr.length-1) str += " ";
                }
                return str;
            }
            function extract(arr) {
                var double = [];
                double.push(arr[0]);
                double.push(smush(arr[1]));
                return double;
            }
            if(!data) return false;
            else if(data[0].constructor !== Array) {
                return [extract(data)];
            }
            else {
                var doubles = [];
                for(var i = 0;i < data.length;i++) {
                    doubles.push(extract(data[i]));
                }
                return doubles;
            }
        }

        this.getTitle = function(subject) {
            var tree = n('SNO')(0,
                       [
                        n('SNA')(0,
                        [
                         n('SSN')(1, bibo('shortTitle'), null, 2),
                         n('SSN')(1, dct('title'), null, 2)
                        ]),
                        n('SSN')(1, dct('title'), null, 2),
                        n('SSN')(1, bibo('shortTitle'), null, 2)
                       ]);
            return tree.fetch(subject);
        }

        // author tab
        this.getPublications = function(author) {
            var tree = n('SNG')(0,
                       [
                        n('MSO')(1, bibo('authorList'), null, 0,
                        [
                         n('SSO')(0, bibo('authorList'), null, 2,
                         [
                          n('SSN')(0, null, author, 0)
                         ])
                        ]),
                        n('MSN')(1, dct('creator'), author, 0)
                       ]);
            //alert(tree.fetch(null).toSource());
            return tree.fetch(null);
        }

        this.getPublicationTitles = function(publications) {
            var pairs = [];
            for(var i = 0;i < publications.length;i++) {
                pairs.push([publications[i], this.getTitle(publications[i]).toString()]);
            }
            return pairs;
        }
    }



    // hash table object
    function Table() {
        this.length = 0;
        this.keys = []; // for ordered searches
        this.pairs = new Object();
    }
    Table.prototype.push = function(key, value) {
        if(!this.pairs[key]) {
            this.pairs[key] = value;
            this.keys.push(key);
            this.length++;
        }
    }
    Table.prototype.pop = function() {
        if(this.length > 0) {
            var key = this.keys.pop();
            var element = this.pairs[key];
            this.pairs[key] = undefined;
            this.length--;
            return element;
        }
        else {
            return undefined;
        }
    }
    Table.prototype.remove = function(key) {
        if(this.length > 0 && this.pairs[key]) {
            for(var i = 0;i < this.length;i++) {
                if(this.keys[i] === key) {
                    this.keys.splice(i,1);
                }
            }
            this.pairs[key] = undefined;
            this.length--;
        }
    }

    this.render = function(subject, document) {
        var doc = document;
        var div = document.createElement('div');
        var menu = document.createElement('ul');
        var infoItem = document.createElement('li');
        var authorItem = document.createElement('li');
        var documentItem = document.createElement('li');
        div.appendChild(menu);
        menu.appendChild(infoItem);
        menu.appendChild(authorItem);
        menu.appendChild(documentItem);

        div.id = "publicationPane";
        menu.id = "mainMenu";

        infoItem.appendChild(document.createTextNode("Publication"));
        authorItem.appendChild(document.createTextNode("Author"));
        documentItem.appendChild(document.createTextNode("Document"));

        var renderer = new Renderer(div);
        var render = new Render(document);
        render.renderer = renderer;
        var trueFunc = function() { return true; };
        var falseFunc = function() { return false; };
        var infoTab = new Tab(infoItem, isPublication, render.Info(doc));
        var authorTab = new Tab(authorItem, isAuthor, render.Author(doc));
        var documentTab = new Tab(documentItem, isDocument, render.Document(doc));
        renderer.addTab(infoTab);
        renderer.addTab(authorTab);
        renderer.addTab(documentTab);

        renderer.initialize(subject);

        return div;
    }

    function Renderer(container) {
        var anchor = this;
        this.container = container;
        this.tabs = [];
        this.currentFocus = null;
        this.addTab = function(tab) {
            if(tab.constructor === Tab) {
                for(var i = 0;i < this.tabs.length;i++) {
                    if(tab === this.tabs[i]) { return; }
                }
                this.tabs.push(tab);
            }
        }
        this.initialize = function(subject) {
            for(var i = 0;i < this.tabs.length;i++) {
                this.tabs[i].renderTab(subject);
                this.tabs[i].activate(this.switchTo(this.tabs[i]));
            }
            for(var i = 0;i < this.tabs.length;i++) {
                if(this.tabs[i].display) {
                    this.switchTo(this.tabs[i])();
                    break;
                }
            }
        }
        this.switchTo = function(tab) {
            return function() {
                if(!tab.display) {
                    return;
                }
                if(anchor.currentFocus) {
                    anchor.currentFocus.hide();
                }
                anchor.currentFocus = tab;
                tab.show(anchor.container);
            }
        }
        this.switchToAndRender = function(subject, tab) {
            return function() {
                tab.renderTab(subject);
                anchor.switchTo(tab)();
            }
        }
    }

    function Tab(menuItem, isValid, renderDiv) {
        var anchor = this;
        this.menuItem = menuItem;
        this.display = null;
        this.isValid = isValid;
        this.renderDiv = renderDiv;

        this.show = function(container) {
            if(!this.display) {
                return;
            }
            anchor.display.style.visibility = "visible";
            if(this.display.parentNode) {
                this.display.parentNode.removeChild(this.display);
            }
            container.appendChild(this.display);
        }
        this.hide = function() {
            if(!this.display) {
                return;
            }
            this.display.style.visibility = "hidden";
            if(this.display.parentNode) {
                this.display.parentNode.removeChild(this.display);
            }
        }
        this.erase = function() {
            this.hide();
            this.display = null;
        }
        this.renderTab = function(subject) {
            if(!this.isValid(subject)) { return; }
            this.erase();
            var div = this.renderDiv(subject);
            this.display = div;
        }
        this.activate = function(listener) {
            anchor.menuItem.addEventListener("click",listener,false);
        }
    }

    function addClass(item, class) {
        item.className += " "+class;
    }
    function removeClass(item, class) {
        item.className = item.className.replace(class,'');
    }

    function Render() {
        this.renderer = null;
        this.link = function(item, subject) {
            if(!this.renderer) { return; }
            for(var i = 0;i < this.renderer.tabs.length;i++) {
                if(subject.constructor === String) {
                    if(subject.charAt(0) === '<' &&
                        subject.charAt(subject.length-1) == '>')
                        subject = subject.substring(1,subject.length-1);
                    subject = tabulator.kb.sym(subject);
                }
                var tab = this.renderer.tabs[i];
                if(tab.isValid(subject)) {
                    addClass("link",item);
                    item.addEventListener("click",this.renderer.switchToAndRender(subject,tab),false);
                    break;
                }
            }
        }
    }

    Render.prototype.Info = function(document) {
        var render = this;
        return function(subject) {
            //alert("Render.prototype.Info is getting called: "+subject.toString());
            var div = document.createElement('div');
            var title = document.createElement('h2');
            title.innerHTML = dataGatherer.getTitle(subject);
            div.appendChild(title);
            div.appendChild(document.createElement('br'));
            div.className += " tab";
            div.id = "info";

            var data = [['Author(s)',dataGatherer.getAuthorNames(subject),'pubAuthor']];

            for(var i = 0;i < data.length;i++) {
                var subDiv = appendEntry(document,data[i],render);
                if(subDiv) { div.appendChild(subDiv); }
            }
            return div;
        }
    }

    var appendEntry = function(document, entries, render) {
        if(!entries[1]) { return div; }
        var tag = entries[0];
        var data = entries[1];
        var divClass = entries[2];
        var div = document.createElement('div');
        var label = document.createTextNode(tag);
        var list = document.createElement('ul');
        for(var i = 0;i < data.length;i++) {
            li = document.createElement('li');
            if(data[i].length == 2) {
                li.innerHTML = escapeForXML(data[i][1].toString());
                render.link(li,data[i][0]);
            }
            else {
                li.innerHTML = escapeForXML(data[i][0].toString());
            }
            list.appendChild(li);
        }
        div.appendChild(label);
        div.appendChild(list);
        return div;
    }

    Render.prototype.Author = function(document) {
        return function(subject) {
            //alert("Render.prototype.Author is getting called: "+subject.toString());
            var div = document.createElement('div');
            div.id = "Author";
            div.className += " tab";
            div.innerHTML = "Testing";
            div.innerHTML += "<br />subject: "+subject.toSource();
            div.innerHTML += "<br />publication URIs: "+dataGatherer.getPublications(subject).toSource();
            div.innerHTML += "<br />publications titles: "+dataGatherer.getPublicationTitles(dataGatherer.getPublications(subject)).toSource();
            return div;
        }
    }

    Render.prototype.Document = function(document) {
        return function(subject) {
            //alert("Render.prototype.Document is getting called: "+subject.toString());
            var div = document.createElement('div');
            div.id = "Author";
            div.innerHTML = "testing->document";
            return div;
        }
    }
}, false);
