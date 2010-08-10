/*
This commit: Got Journal's Basics Working, BOOK IS NOT WORKING YET
    Summer 2010
    haoqili@mit.edu
    
    //TODO:
    1 make autocomplete (kenny's search code)
    2 Enable Tab == Enter
    3 Disable typing in lines that depend on incompleted previous lines.
 */

tabulator.Icon.src.icon_pubs = 'chrome://tabulator/content/icons/publication/publicationPaneIcon.gif';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_pubs] = 'pubs'; //hover show word


tabulator.panes.pubsPane = {
    icon: tabulator.Icon.src.icon_pubs,

    name: 'pubs',

    label: function(subject) {  // Subject is the source of the document
        //criteria for display satisfied: return string that would be title for icon, else return null
        // only displays if it is a person, copied from social/pane.js
        if (tabulator.kb.whether(
            subject, tabulator.ns.rdf('type'),
            tabulator.ns.foaf('Person'))){
            dump("the subjet is: "+subject);
                return 'pubs';
            } else {
                return null;
            }

    },

    render: function(subject, myDocument) { //Subject is source of doc, document is HTML doc element we are attaching elements to
        
        //NAMESPACES ------------------------------------------------------
        var foaf = tabulator.rdf.Namespace("http://xmlns.com/foaf/0.1/");
        //var rdf= tabulator.ns.rdf;
        var rdf = tabulator.rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
        var owl = tabulator.rdf.Namespace("http://www.w3.org/2002/07/owl/");
        var bibo = tabulator.rdf.Namespace("http://purl.org/ontology/bibo/");
        var dcterms = tabulator.rdf.Namespace('http://purl.org/dc/terms/');
        var dcelems = tabulator.rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var soics = tabulator.rdf.Namespace('http://rdfs.org/sioc/spec/');
        var kb = tabulator.kb;
        var sf = tabulator.sf;
        var updateService = new updateCenter(kb);
        var sparqlUpdater = new tabulator.rdf.sparqlUpdate(kb);

        var collections_URI = 'http://dig.csail.mit.edu/2007/wiki/docs/collections';
        var journalURI = "";
        
        var works_URI = 'http://dig.csail.mit.edu/2007/wiki/docs/works'
        var jarticleURI = "";
        
        var st_bookURI = "";
        var bookURI = "";
        var articleURI = "";

       
        // Functions -------------------------------------------------------
        
        // Generic insert_statement return function
        var returnFunc = function(uri, success, error){
          //  dump('In title, 4 in update Service \n');
            if (success){
                dump("In title, editing successful! :D\n");
            } else {
                dump("In title, Error when editing\n");
            }
        };
        
        // Creates "tag" thing as a child under "p"
        function newElement(tag, p){
            x = myDocument.createElement(tag);
            x['child'] = function(tag){return newElement(tag,x)};
            if(!p){ pubsPane.appendChild(x); }
            else{ p.appendChild(x); }
            return x;
        }
        
        //* 
        /* Makes a generic row in the form. 
        /* With structure:
        /*    <div id="divid_[arg2 word]" class="hideit" OR "active">
        /*        <div class="pubsRow"> // for CSS formating convenience
        /*            <span class="pubsWord">[Arg2 word]: </span>
        /*            <[arg3 type] id="inpid_[arg2 word]">
        /*        </div>
        /*    </div>
        //*/
        
        function removeSpaces(str){
            return str.split(' ').join('');
        }
        
        function spacetoUline(str){
            return str.split(' ').join('_').toLowerCase();
            
        }
        
        function newFormRowID(form, wordori, type){
            var outer_div = newElement('div', form);
            var word = spacetoUline(wordori);
            outer_div.id =  'divid_' + word;
            //if (word == 'journal') {
            //outer_div.className = 'active';
            // } else {
                outer_div.className = 'hideit';
            // }
            var inner_div = newElement('div', outer_div);
            inner_div.setAttribute('class', 'pubsRow');
            var word_span = newElement('span', inner_div);
            word_span.setAttribute('class', 'pubsWord');
            
            word_span.innerHTML = wordori + ': ';
            var word_box = newElement(type, inner_div);
            word_box.id = "inpid_" + word;
            return word_box;
        }


    
        // Building the HTML of the Pane, top to bottom ------------
        /// Headers
        var pubsPane = myDocument.createElement('div');
        pubsPane.setAttribute('class', 'pubsPane');

        var caption_h2 = myDocument.createElement('h2');
        caption_h2.appendChild(myDocument.createTextNode('Add your new publication'));
        pubsPane.appendChild(caption_h2);
        
        /// The form, starting with common pubs stuff
        var theForm = newElement('form', pubsPane);
        theForm.id = "the_form_id";

        /*// --- Co-Authors ----------
        newFormRowID(theForm, 'coAuthor1', 'input');
        newFormRowID(theForm, 'coAuthor2', 'input');
        newFormRowID(theForm, 'coAuthor3', 'input');  
        
        var r_moreaut = newElement('div', theForm);
        r_moreaut.setAttribute('class', 'pubsRow');
        var b_moreaut = newElement('button', r_moreaut);
        b_moreaut.id = "b_moreaut";
        b_moreaut.type = "button";
        b_moreaut.innerHTML = "More authors?";
        
        b_moreaut.addEventListener("click", function(){
            var row2 = myDocument.getElementById('divid_coAuthor2');
            var row3 = myDocument.getElementById('divid_coAuthor3');
            row2.className = 'active';
            row3.className = 'active';
        }, false);*/
        

        /// === Dropdown ----------
        //var jnlist = ['journal_title', 'year', 'title'];
        //var bklist = ['book', 'url', 'abstract'];
        // NB: The names MUST be lowercase, ' '->_ names
        var jnlist = ['journal_title', 'journal_url', 'journal_article_title'];
        var bklist = ['book', 'url', 'abstract'];
        var dropdiv = newElement('div', theForm);
        dropdiv.setAttribute('class', 'pubsRow');
        var drop = newElement('select', dropdiv);
        drop.id = 'select_id';
        var op0 = newElement('option', drop);
        op0.innerHTML = "choose publication type";
        
        var op1 = newElement('option', drop);
        op1.id = 'op1_id';
        op1.innerHTML = "journal";
        op1.addEventListener("click", function(){
            for (var i=0; i<jnlist.length; i++){
                var jnitm = myDocument.getElementById("divid_"+jnlist[i]);
                jnitm.className = 'active';
            }
            for (var x=0; x<bklist.length; x++){
                var bkitm = myDocument.getElementById("divid_"+bklist[x]);
                bkitm.className = 'hideit';
            }
        }, false);
        var op2 = newElement('option', drop);
        op2.id = 'op2_id';
        op2.innerHTML = "book";
        op2.addEventListener("click", function(){
            for (var i=0; i<jnlist.length; i++){
                var jnitm = myDocument.getElementById("divid_"+jnlist[i]);
                jnitm.className = 'hideit';
            }
            for (var x=0; x<bklist.length; x++){
                var bkitm = myDocument.getElementById("divid_"+bklist[x]);
                bkitm.className = 'active';
            }
        }, false);
        
        // This is where the "journal" and "book" sections are created. Each id is "divid_" + 2ndarg
        //// ======== JOURNAL ===============================================================
        var jtitle = newFormRowID(theForm, 'Journal Title', 'input');
        jtitle.addEventListener("keypress", function(e){
            dump("In Journal_title, 1 pressing a key \n");
            if (e.keyCode == 13 ){
                
                dump("In Journal title, 2 Enter PRESSED\n");

                var jtitle_id = myDocument.getElementById("inpid_journal_title");
                var jtitle_value = jtitle_id.value;
                
                // 0. Make a URI for this Journal
                // collections_URI = 'http://dig.csail.mit.edu/2007/wiki/docs/collections';
                var now = new Date();
                journalURI = collections_URI + "#" + now.getTime();
                dump("jURI="+journalURI+"\n");
                
                // 1. Make this journal URI type Journal
                var journaltype_add = new tabulator.rdf.Statement(kb.sym(journalURI), tabulator.ns.rdf('type'), bibo('Journal'), kb.sym(collections_URI));     
                
                // 2. Add the title for the journal
                var journal_add = new tabulator.rdf.Statement(kb.sym(journalURI), dcelems('title'), jtitle_value, kb.sym(collections_URI));
                
                var total = [journaltype_add, journal_add];

                dump('Start SU journal\n');
                sparqlUpdater.insert_statement(total, returnFunc);
                dump('DONE SU journal\n');
            }
        }, false);
        
        
        // this function makes a newFormRow and adds a listener to it
        var listenRow = function(theForm, namestr, type, thesubject, thepredicate, storeURI){
            var item = newFormRowID(theForm, namestr, type);
            item.addEventListener("keypress", function(e){
                dump("In " + namestr + ", 1pressing a key\n");
                if (e.keyCode == 13) {
                    var item_id = myDocument.getElementById("inpid_"+ spacetoUline(namestr) );
                    var item_value = item_id.value;
                    var item_trim = removeSpaces(item_value);
                    
                    // Add to URI
                    var subjectURI = "undef";
                    if (thesubject == "journal") {
                        subjectURI = journalURI;
                    }

                    var item_st = new tabulator.rdf.Statement(kb.sym(subjectURI), thepredicate, item_trim, kb.sym(storeURI));
                    dump('start SU inserting statement = ' + item_st + "\n\n");
                    sparqlUpdater.insert_statement(item_st, returnFunc);
                    dump("DONE SU for " + namestr + "\n");
                }
            }, false);
        };
        
        
        // Make journal url
        listenRow(theForm, 'Journal URL', 'input', "journal", foaf('homepage'), collections_URI);
        
        // Journal Article title
        var jarttitle = newFormRowID(theForm, 'Journal Article Title', 'input');
        jarttitle.addEventListener("keypress", function(e){
            dump("In Journal_article_title, 1 pressing a key \n");
            if (e.keyCode == 13 ){
                dump("In Journal article title, 2 Enter PRESSED\n");

                var jarttitle_id = myDocument.getElementById("inpid_journal_article_title");
                var jarttitle_value = jarttitle_id.value;
                
                // 0. Make a URI for this Journal Article
                // works_URI = 'http://dig.csail.mit.edu/2007/wiki/docs/works';
                var now = new Date();
                jarticleURI = works_URI + "#" + now.getTime();
                dump("jartURI="+jarticleURI+"\n");
                
                // 1. Make this journal article URI type AcademicArticle
                var jarttype_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), tabulator.ns.rdf('type'), bibo('AcademicArticle'), kb.sym(works_URI));
                                
                // 2. Add the title for this journal article
                var jart_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), dcelems('title'), jarttitle_value, kb.sym(works_URI));
                
                dump("The SUBJECT = "+subject+"\n");
                // 3. Add author to a creator of the journal article
                var auth_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), dcterms('creator'), subject, kb.sym(articleURI));
                
                // 4. Connect this journal article to the journal before
                var connect_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), dcterms('isPartOf'), kb.sym(journalURI), kb.sym(works_URI));
 
                var total = [jart_add, jarttype_add, auth_add, connect_add];
                
                dump('Start SU journal article\n');
                sparqlUpdater.insert_statement(total, returnFunc);
                dump('DONE SU journal article\n');
            }
        }, false);
        
        //// ========== BOOK ========EVERYTHING BELOW IS NOT WORKING YET!!!!!!!!!========================
        newFormRowID(theForm, 'book', 'input');
        
        // Extra Information
        newFormRowID(theForm, 'URL', 'input');
        newFormRowID(theForm, 'abstract', 'textarea');


        //// BOOK STUFF --- Title ----------
        var title_input = newFormRowID(theForm, 'title', 'input');
        title_input.addEventListener("keypress", function(e){
            dump("In title, 1 pressing a key \n");
            if (e.keyCode == 13 ){
                dump("In title, 2 Enter PRESSED\n");

                var title_id = myDocument.getElementById("inpid_title");
                var title_value = title_id.value;
                var title_trim = removeSpaces(title_value);
                
                articleURI = 'http://dig.csail.mit.edu/2007/wiki/docs/' + title_trim;
                          
                
                // B1. Make a URI for this title
                var uri_title = new tabulator.rdf.Statement(kb.sym(articleURI), dcelems('title'), title_value, kb.sym(articleURI));
                
                // B2. Adds creator to the title
                var uri2 = new tabulator.rdf.Statement(kb.sym(articleURI), dcelems('creator'), subject, kb.sym(articleURI));
                
                var totalst = [uri_title, uri2];
                
                dump('Start SU\n');
                sparqlUpdater.insert_statement(totalst, returnFunc);
                
                dump('DONE SU\n');
                //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            }
        }, false);
    
        //// --- Year ----------
        var year_input = newFormRowID(theForm, 'year', 'input');
        year_input.addEventListener("keypress", function(e){
            dump("In Year, 1 pressing a key \n");
            if (e.keyCode == 13 ){
                dump("In Year, 2 Enter PRESSED\n");

                var year_id = myDocument.getElementById("inpid_year");
                var year_value = year_id.value;

                // Adds year of article to http://dig.csail.mit.edu/2007/wiki/docs/ExampleTitle1
                var addyear = new tabulator.rdf.Statement(kb.sym(articleURI), dcterms('date'), year_value, kb.sym(articleURI));
                
                dump('Start SU year\n');
                sparqlUpdater.insert_statement(addyear, returnFunc);
                
                dump('DONE SU year\n');
                //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            }
        }, false);
        
        
        /* TODO Minor: empty row, but to make background stretch down below the abstract box
        var r_empty = newElement('div', theForm);
        r_empty.setAttribute('class', 'emptyRow');
        r_empty.innerHTML = " Hi ";*/
      
        return pubsPane;
    }
};

tabulator.panes.register(tabulator.panes.pubsPane, true);
