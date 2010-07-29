tabulator.Icon.src.icon_pubs = 'chrome://tabulator/content/icons/publication/publicationPaneIcon.gif';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_pubs] = 'pubs'; //hover show word


tabulator.panes.pubsPane = {
    icon: tabulator.Icon.src.icon_pubs,

    name: 'pubs',

    label: function(subject) {  // Subject is the source of the document
        //criteria for display satisfied: return string that would be title for icon, else return null
        // only displays if it is a person, copied from social/pane.js
       /* if (tabulator.kb.whether(
            subject, tabulator.ns.rdf('type'),
            tabulator.ns.foaf('Person'))){
              */  return 'pubs';
            /*} else {
                return null;
            }*/

    },

    render: function(subject, myDocument) { //Subject is source of doc, document is HTML doc element we are attaching elements to

        function CustomEvents(){
            this._events ={};
        } 
        CustomEvents.prototype.addEventListener = function(en,evt){
            e= this._events;
            e[en] = e[en]||[];
            e[en].push(evt);
        }
        
        //NAMESPACES
        var foaf = tabulator.rdf.Namespace("http://xmlns.com/foaf/0.1/");
        var rdf= tabulator.ns.rdf;
        var dcterms = tabulator.rdf.Namespace('http://purl.org/dc/terms/');
        var kb = tabulator.kb;
        var sf = tabulator.sf;
        var sparqlUpdater = new tabulator.rdf.sparqlUpdate(kb);
        var Events = new CustomEvents();
        var I =kb.sym( tabulator.preferences.get('me'));

       
        //copied from social/pane.js
        function newElement(tag, p){
            x = myDocument.createElement(tag);
            x['child'] = function(tag){return newElement(tag,x)};
            if(!p){ pubsPane.appendChild(x); }
            else{ p.appendChild(x); }
            return x;
        }

        function newFormRow(form, theWord, type){
            var r_n = newElement('div', form);
            r_n.setAttribute('class', 'pubsRow');  
            var w_n = newElement('span', r_n);
            w_n.setAttribute('class', 'pubsWord');
            // Below capitalizes the first letter of theWord (becuase css is case-sensitive)
            w_n.innerHTML = theWord.charAt(0).toUpperCase() + theWord.slice(1) + ': ';
            var w_bx = newElement(type, r_n);
            w_bx.id = theWord;
        }

        function myUpdate(msg, su, callback){
            var batch = new tabulator.rdf.Statement(msg, dcterms('abstract'), I, kb.sym('http://dig.csail.mit.edu/2007/wiki/knappy'));
            su.insert_statement(batch,
                function(a, b, c){
                    callback(a, b, c, batch);
                }
            );
        }
    
        //////////////////////////////
        var pubsPane = myDocument.createElement('div');
        pubsPane.setAttribute('class', 'pubsPane');
        

        var title_h1 = myDocument.createElement('h1');
        title_h1.appendChild(myDocument.createTextNode('Publications (Pubs) Pane'));
        pubsPane.appendChild(title_h1);

        var caption_h2 = myDocument.createElement('h2');
        caption_h2.appendChild(myDocument.createTextNode('Add your new publication'));
        pubsPane.appendChild(caption_h2);

        var theForm = newElement('form', pubsPane);
        theForm.id = "the_form_id";

        newFormRow(theForm, 'title', 'input');
        newFormRow(theForm, 'year', 'input');
        newFormRow(theForm, 'coAuthor1', 'input');
        newFormRow(theForm, 'coAuthor2', 'input');
        newFormRow(theForm, 'coAuthor3', 'input');
        newFormRow(theForm, 'journal', 'input');
        newFormRow(theForm, 'URL', 'input');
        newFormRow(theForm, 'abstract', 'textarea');

        

        var r_submit = newElement('div', theForm);
        r_submit.setAttribute('class', 'pubsRow');
        var b_submit = newElement('button', r_submit);
        b_submit.type = "button";
        b_submit.innerHTML = "Submit";
        
        theForm.addEventListener("submit", function(){
            myUpdate(doc.getELementById("abstract").value,  sparqlUpdater);
        }, false);
        
        return pubsPane;
    }


};

tabulator.panes.register(tabulator.panes.pubsPane, true);
