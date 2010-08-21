/*
This commit: Use sparqlUpdater instead of updateService for insert_statement
    Summer 2010
    haoqili@mit.edu
    Partially copied from social/pane.js
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
        var rdf= tabulator.ns.rdf;
        var dcterms = tabulator.rdf.Namespace('http://purl.org/dc/terms/');
        var dcelems = tabulator.rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var soics = tabulator.rdf.Namespace('http://rdfs.org/sioc/spec/');
        var kb = tabulator.kb;
        var sf = tabulator.sf;
        var updateService = new updateCenter(kb);
        var sparqlUpdater = new tabulator.rdf.sparqlUpdate(kb);
       // var Events = new CustomEvents();
//        var I =kb.sym( tabulator.preferences.get('me'));

       
        // Functions -------------------------------------------------------
        function newElement(tag, p){
            x = myDocument.createElement(tag);
            x['child'] = function(tag){return newElement(tag,x)};
            if(!p){ pubsPane.appendChild(x); }
            else{ p.appendChild(x); }
            return x;
        }

        function newFormRowID(form, theWord, type){
            var r_n = newElement('div', form);
            r_n.id =  'r_' + theWord;
           // r_n.className = (first==true ? 'active' : 'hideit'); 
            if (theWord == 'journal') {
                r_n.className = 'active';
            } else {
                r_n.className = 'hideit';
            }
            var w_n = newElement('span', r_n);
            w_n.setAttribute('class', 'pubsWord');
            // Below capitalizes the first letter of theWord (becuase css is case-sensitive)
            w_n.innerHTML = theWord.charAt(0).toUpperCase() + theWord.slice(1) + ': ';
            var w_bx = newElement(type, r_n);
            w_bx.id = theWord;
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
            return w_bx;
        }
        
        function removeSpaces(str){
            return str.split(' ').join('');
        }
    
        // Building the HTML of the Pane, top to bottom ------------
        /// Titles
        var pubsPane = myDocument.createElement('div');
        pubsPane.setAttribute('class', 'pubsPane');

        var caption_h2 = myDocument.createElement('h2');
        caption_h2.appendChild(myDocument.createTextNode('Add your new publication'));
        pubsPane.appendChild(caption_h2);
        
        /// The form, starting with common pubs stuff
        var theForm = newElement('form', pubsPane);
        theForm.id = "the_form_id";

        var title_input = newFormRow(theForm, 'title', 'input');
        title_input.addEventListener("keypress", function(e){
            dump("In title, 1 pressing a key \n");
            if (e.keyCode == 13 ){
                dump("In title, 2 Enter PRESSED\n");
                
                var returnFunc = function(uri, success, error){
                  //  dump('In title, 4 in update Service \n');
                    if (success){
                        dump("In title, editing successful! :D\n");
                    } else {
                        dump("In title, Error when editing\n");
                    }
                };

                var title_id = myDocument.getElementById("title");
                var title_value = title_id.value;
                var title_trim = removeSpaces(title_value);
                
                dump("trimmed = " + title_trim + "\n");
                
                // README: Directions:
                // 1. In any pubsPane's Title box, put in a title, say "Example Title 1"
                // 2. Press enter
                // 3. Navigate to the no-spaces-version of your title: http://dig.csail.mit.edu/2007/wiki/docs/ExampleTitle1
                // 4. B1 adds a "title" to this URI, B2 adds a "creator" Joe Lambda to this URI
                          
                
                // B1. Make a URI directly for articles
                var uri_title = new tabulator.rdf.Statement(kb.sym('http://dig.csail.mit.edu/2007/wiki/docs/' + title_trim), dcelems('title'), title_value, kb.sym('http://dig.csail.mit.edu/2007/wiki/docs/' + title_trim));
                
                // B2. Testing inserting 2 things
                var uri2 = new tabulator.rdf.Statement(kb.sym('http://dig.csail.mit.edu/2007/wiki/docs/' + title_trim), dcelems('creator'), subject, kb.sym('http://dig.csail.mit.edu/2007/wiki/docs/' + title_trim));
                
                var totalst = [uri_title, uri2];
                
                dump('Start SU\n');
                sparqlUpdater.insert_statement(totalst, returnFunc);
                
                dump('DONE SU\n');
                //\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

                
            }
        }, false);
    
        newFormRow(theForm, 'year', 'input');

        // Co-author parts
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
            var row2 = myDocument.getElementById('r_coAuthor2');
            var row3 = myDocument.getElementById('r_coAuthor3');
            row2.className = 'active';
            row3.className = 'active';
        }, false);
        

        // Stuff that depends on type of publication

        //Dropdown
        var dropdiv = newElement('div', theForm);
        dropdiv.setAttribute('class', 'pubsRow');
        var drop = newElement('select', dropdiv);
        drop.id = 'select_id';
        var op1 = newElement('option', drop);
        op1.id = 'op1_id';
        op1.innerHTML = "journal";
        op1.addEventListener("click", function(){
            var rowj = myDocument.getElementById('r_journal');
            var rowb = myDocument.getElementById('r_book');
            rowj.className = 'active';
            rowb.className = 'hideit';
        }, false);
        var op2 = newElement('option', drop);
        op2.id = 'op2_id';
        op2.innerHTML = "book";
        op2.addEventListener("click", function(){
            var rowj = myDocument.getElementById('r_journal');
            var rowb = myDocument.getElementById('r_book');
            rowb.className = 'active';
            rowj.className = 'hideit';
        }, false);
        
        newFormRowID(theForm, 'journal', 'input');
        newFormRowID(theForm, 'book', 'input');
        
        // Extra Information
        newFormRowID(theForm, 'URL', 'input');
        newFormRowID(theForm, 'abstract', 'textarea');


        // Submit button / testing showing and hiding for now
        var r_submit = newElement('div', theForm);
        r_submit.setAttribute('class', 'submitRow');
        var b_submit = newElement('button', r_submit);
        b_submit.id = "buttonid";
        b_submit.type = "button";
        b_submit.innerHTML = "Submit";
        b_submit.className = "active";
        
        // See/Hide Button test       
        var c_submit = newElement('button', r_submit);
        c_submit.id = "cid";
        c_submit.type = "button";
        c_submit.innerHTML = "See Button";
        
        var d_submit = newElement('button', r_submit);
        d_submit.id = "did";
        d_submit.type = "button";
        d_submit.innerHTML = "hide it";
        
        c_submit.addEventListener("click", function(){//show words
            var b = myDocument.getElementById('buttonid');
            dump('in c');
            b.className = "active";
            }, false);
            
        d_submit.addEventListener("click", function(){
            var b = myDocument.getElementById('buttonid');
            dump('in d');
            b.className = '';
            }, false);
        
        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;
        dump("IS THIS ME? " + me);
        
        // Testing stuff with b_submit
        b_submit.addEventListener("click", function(){
            dump('one: start\n');
            //var myst = new tabulator.rdf.Statement(kb.sym('http://dig.csail.mit.edu/2007/wiki/people/JoeLambda'), foaf('made'), "This_is_a_test");
            var myst = new tabulator.rdf.Statement(kb.sym('http://dig.csail.mit.edu/2007/wiki/people/JoeLambda'), foaf('made'), "This_is_a_test", kb.sym('http://dig.csail.mit.edu/2007/wiki/people/JoeLambda'));
            dump('two:' + myst + ' ||\n');
            updateService.insert_statement(myst,
                function(uri, success, error){
                    dump('three: in SU\n');
                    if (success){
                        dump("Editing successful! :D");
                    } else {
                        dump("Error when editing");
                    }
                }
            );
            dump('four: end\n');
        }, false);
        
        
        
        return pubsPane;
    }


};

tabulator.panes.register(tabulator.panes.pubsPane, true);
