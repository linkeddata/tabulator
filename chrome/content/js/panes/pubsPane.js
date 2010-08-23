/*
    Summer 2010
    haoqili@mit.edu
    
This commit: Autocomplete, buggy basic version
NOTE: Dropdown only shows if 
1. you first visit http://dig.csail.mit.edu/2007/wiki/docs/collections
2. refresh page

Autocomplete TODO:
1. Allow dropdown interactive (arrow up down, clicks) 
... w/ userinput's autocomplete handler I think
2. Fix backspace things break problem    
    
    //TODO:
    1 make autocomplete (kenny's search code)
    2 Enable Tab == Enter
    3 Disable typing in lines that depend on incompleted previous lines.
    4 Show words fading after entered into wiki AND/OR
      More user output for links of journals created
    
    //small
    5 make change to css id's so that it corresponds to book or journal
    6 Add co-authors
    7 Use switch cases
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
            dump("pubsPane: the subject is: "+subject);
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
        
        var bookURI = "";
                
        var doctitle_value ="";
       
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

        // this function creates a new row in the form that
        // asks for a document title,
        // makes the document's URI, and
        // inserts the input title into the URI 
        // For "Book Title", puts creator into URI too 
        var rootlistenRow = function(theForm, caption_title, typeofinp, storeURI, typeofdoc){
            // Makes the new row, with id: "inpid_"+sapcetoUline(caption_title)
            var doctitle = newFormRowID(theForm, caption_title, typeofinp);
            // Add the listener
            doctitle.addEventListener("keypress", function(e){
                // Only register legal chars
                if (e.charCode != 0){
                    //NB not using elementId.value because it's offbyone
                    //var doctitle_id = myDocument.getElementById("inpid_"+ spacetoUline(caption_title));
                    //var doctitle_value = doctitle_id.value;
                    doctitle_value += String.fromCharCode(e.charCode);
                    dump("In " + caption_title + ", pressed the key="+e.keyCode+" with char=" + e.charCode +" the curinput is="+doctitle_value+"\n");
                    switch (caption_title) {
                        case 'Journal Title':
                            dump("yo journal\n");

                            dump(".a.\n\n\n In Text=" + doctitle_value+"\n");
                            tabulator.outline.UserInput.clearMenu();
                            tabulator.outline.UserInput.showMenu(e, 'JournalTitleAutoComplete', undefined, {'inputText':doctitle_value},"orderisuseless");

                            dump("========OVER=========\n");
                            break;
                        case 'Book Title':
                            dump("yo book\n");
                            break;
                        default:
                            dump("neither\n");
                    }
                } else if (e.keyCode == 13 ){
                    dump("In " + caption_title + ", 2 Enter PRESSED title=" + doctitle_value+"\n");
                    // clear dropdown menu (if any)
                    tabulator.outline.UserInput.clearMenu();
                    
                    // 0. Make a URI for this doc, storeURI#[millisecs epoch time]
                    var now = new Date();
                    var docURI = storeURI + "#" + now.getTime();
                    if (caption_title == "Journal Title"){
                        journalURI = docURI;
                        dump("journalURI="+journalURI+"\n");
                    } else if (caption_title == "Book Title"){
                        bookURI = docURI;
                        dump("bookURI="+bookURI+"\n");
                    }
                    dump("docURI="+docURI+"\n");
                    
                    // 1. Make this doc URI type specified
                    var doctype_addst = new tabulator.rdf.Statement(kb.sym(docURI), tabulator.ns.rdf('type'), typeofdoc, kb.sym(storeURI));     
                    
                    // 2. Add the title for the journal
                    var doctitle_addst = new tabulator.rdf.Statement(kb.sym(docURI), dcelems('title'), doctitle_value, kb.sym(storeURI));

                    var totalst = [doctype_addst, doctitle_addst];
                                        
                    // 3. Only for books, add creator:
                    if (caption_title == "Book Title"){
                        var creator_add = new tabulator.rdf.Statement(kb.sym(docURI), dcelems('creator'), subject, kb.sym(storeURI));
                        totalst.push(creator_add);
                    }

                    dump('Start SU' + caption_title + '\n');
                    dump('Inserting start:\n' + totalst + '\nInserting ///////\n');
                    sparqlUpdater.insert_statement(totalst, returnFunc);
                    dump('DONE SU' + caption_title + '\n');
                }
            }, false);
        };

        // this function makes a leaf level (knowing subjectURI) newFormRow
        // to put extracted info under the known subject URI
        var leaflistenRow = function(theForm, namestr, type, thesubject, thepredicate, storeURI){
            // Makes the new row, with id: "inpid_"+sapcetoUline(namestr)
            var item = newFormRowID(theForm, namestr, type);
            item.addEventListener("keypress", function(e){
                dump("In " + namestr + ", 1 pressing a key\n");
                if (e.keyCode == 13) {
                    dump("1\n");
                    var item_id = myDocument.getElementById("inpid_"+ spacetoUline(namestr) );
                    var item_value = item_id.value;
                    var item_trim = removeSpaces(item_value);
                    if (namestr == "Book Description") item_trim = item_value;
                    dump("2\n");
                    // Add to URI
                    var subjectURI = "undef";
                    if (thesubject == "journal") {
                        dump("journalURI=" + journalURI + "\n");
                        subjectURI = journalURI;
                    } else if (thesubject == "jarticle") {
                        dump("jarticleURI=" + jarticleURI + "\n");
                        subjectURI = jarticleURI;
                    } else if (thesubject == "book") {
                        dump("book\n");
                        subjectURI = bookURI;
                    }
                    dump("3\n");
                    var item_st = new tabulator.rdf.Statement(kb.sym(subjectURI), thepredicate, item_trim, kb.sym(storeURI));
                    dump('start SU for ' + namestr + "\n\n");
                    dump('Inserting start:\n' + item_st + '\nInserting ///////\n');
                    sparqlUpdater.insert_statement(item_st, returnFunc);
                    dump("DONE SU for " + namestr + "\n");
                }
            }, false);
        };
    
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
        // NB: The names MUST be lowercase, ' '->_ names
        var jnlist = ['journal_title', 'journal_url', 'journal_article_title', 'article_published_date'];
        var bklist = ['book_title', 'book_url', 'book_published_date', 'book_description'];
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
        // J1. Make journal URI, with correct type (Journal), and title
        rootlistenRow(theForm, 'Journal Title', 'input', collections_URI, bibo('Journal'));
        
        // J2. Make journal url
        leaflistenRow(theForm, 'Journal URL', 'input', "journal", foaf('homepage'), collections_URI);
        
        // J3. Journal Article title, a new URI that links to the journal URI
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
                var auth_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), dcterms('creator'), subject, kb.sym(jarticleURI));
                dump("1\n");
                // 4. Connect this journal article to the journal before
                var connect_add = new tabulator.rdf.Statement(kb.sym(jarticleURI), dcterms('isPartOf'), kb.sym(journalURI), kb.sym(works_URI));
                dump("2\n");
                var totalst = [jarttype_add, jart_add, auth_add, connect_add];
                dump("3\n");
                dump('Start SU journal article\n');
                dump('Inserting start:\n' + totalst + '\nInserting ///////\n');
                sparqlUpdater.insert_statement(totalst, returnFunc);
                dump('DONE SU journal article\n');
            }
        }, false);
        
        // J4. Add Date 
        leaflistenRow(theForm, 'Article Published Date', 'input', 'jarticle', dcterms('date'), works_URI);
        
        
        //// ======== BOOK ===============================================================
        // B1. Make "Book Title" row, with correct type (Journal), title, and creator
        rootlistenRow(theForm, 'Book Title', 'input', works_URI, bibo('Book'));
        
        // B2. Make book url
        leaflistenRow(theForm, 'Book URL', 'input', "book", foaf('homepage'), works_URI);
        
        // B3. Add Date 
        leaflistenRow(theForm, 'Book Published Date', 'input', 'book', dcterms('date'), works_URI);

        // B4. Make the abstract
        leaflistenRow(theForm, 'Book Description', 'textarea', "book", dcterms('description'), works_URI);

        
        
        /* TODO Minor: empty row, but to make background stretch down below the abstract box
        var r_empty = newElement('div', theForm);
        r_empty.setAttribute('class', 'emptyRow');
        r_empty.innerHTML = " Hi ";*/
      
        return pubsPane;
    }
};

tabulator.panes.register(tabulator.panes.pubsPane, true);
