/*   Financial Transaction Pane
**
**  This outline pane allows a user to interact with a transaction
**  downloaded from a bank statement, annotting it with classes and comments,
** trips, etc
*/

    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_money = iconPrefix +
    'js/panes/transaction/22-pixel-068010-3d-transparent-glass-icon-alphanumeric-dollar-sign.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_money] = 'Transaction'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_money,
    
    name: 'transaction',
    
    // Does the subject deserve this pane?
    label: function(subject) {
        var Q = $rdf.Namespace('http://www.w3.org/2000/10/swap/pim/qif#');
        var kb = tabulator.kb;
        var t = kb.findTypeURIs(subject);
        if (t['http://www.w3.org/2000/10/swap/pim/qif#Transaction']) return "£$";
        if(kb.any(subject, Q('amount'))) return "£$€"; // In case schema not picked up

        return null; // No under other circumstances (while testing at least!)
    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb;
        var ns = tabulator.ns;
        var WF = $rdf.Namespace('http://www.w3.org/2005/01/wf/flow#');
        var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
        var DCT = $rdf.Namespace('http://purl.org/dc/terms/');
        var UI = $rdf.Namespace('http://www.w3.org/ns/ui#');
        var Q = $rdf.Namespace('http://www.w3.org/2000/10/swap/pim/qif#');
        
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'transactionPane');
        div.innherHTML='<h1>Transaction</h1><table><tbody><tr>\
        <td>%s</tr></tbody></table>\
        <p>This is a pane under development.</p>';

        var commentFlter = function(pred, inverse) {
            if (!inverse && pred.uri == 
                'http://www.w3.org/2000/01/rdf-schema#comment') return true;
            return false
        }
        
        var setModifiedDate = function(subj, kb, doc) {
            var deletions = kb.statementsMatching(subject, DCT('modified'));
            var deletions = deletions.concat(kb.statementsMatching(subject, WF('modifiedBy')));
            var insertions = [ $rdf.st(subject, DCT('modified'), new Date(), doc) ];
            if (me) insertions.push($rdf.st(subject, WF('modifiedBy'), me, doc) );
            sparqlService.update(deletions, insertions, function(uri, ok, body){});
        }

        var complain = function complain(message){
            var pre = myDocument.createElement("pre");
            pre.setAttribute('style', 'color: grey');
            div.appendChild(pre);
            pre.appendChild(myDocument.createTextNode(message));
        } 
        var thisPane = this;
        var rerender = function(div) {
            var parent  = div.parentNode;
            var div2 = thisPane.render(subject, myDocument);
            parent.replaceChild(div2, div);
        };


        //      Description text area
        //
        // Make a box to demand a description or display existing one
        var makeDescription = function(myDocument, subject, predicate, storeDoc, callback) {
            var group = myDocument.createElement('div');
            var sts = kb.statementsMatching(subject, predicate,undefined,storeDoc); // Only one please
            if (sts.length > 1) throw "Should not be "+sts.length+" i.e. >1 "+predicate+" of "+subject;
            var desc = sts.length? sts[0].object.value : undefined;
            var field = myDocument.createElement('textarea');
            group.appendChild(field);
            field.rows = desc? desc.split('\n').length + 2 : 2;
            field.cols = 80
            field.setAttribute('style', 'font-size:100%; \
                    background-color: white; border: 0.07em solid gray; padding: 1em; margin: 1em 2em;')
            if (sts.length) field.value = desc 
            else {
                field.value = "Please enter a description here"
                field.select(); // Select it ready for user input -- doesn't work
            }

            var br = myDocument.createElement('br');
            group.appendChild(br);
            submit = myDocument.createElement('input');
            submit.setAttribute('type', 'submit');
            submit.disabled = true; // until the filled has been modified
            submit.value = "Save "+tabulator.Util.label(predicate); //@@ I18n
            submit.setAttribute('style', 'float: right;');
            group.appendChild(submit);

            var groupSubmit = function(e) {
                submit.disabled = true;
                field.disabled = true;
                var deletions = desc ? sts[0] : undefined; // If there was a desciption, remove it
                insertions = field.value.length? new $rdf.Statement(subject, predicate, field.value, storeDoc) : [];
                sparqlService.update(deletions, insertions,function(uri,ok, body){
                    if (ok) { desc = field.value; field.disabled = false;};
                    if (callback) callback(ok, body);
                })
            }

            submit.addEventListener('click', groupSubmit, false)

            field.addEventListener('keypress', function(e) {
                    submit.disabled = false;
                }, false);
            return group;
        }

        //  Form to collect data about a New Transaction
        //
        var newTransactionForm = function(myDocument, kb, trip, superTransaction) {
            var form = myDocument.createElement('form');
            var stateStore = kb.any(trip, WF('stateStore'));

            var sendNewTransaction = function() {
                titlefield.setAttribute('class','pendingedit');
                titlefield.disabled = true;
                sts = [];
                
                var now = new Date();
                var timestamp = ''+ now.getTime();
                // http://www.w3schools.com/jsref/jsref_obj_date.asp
                var transaction = kb.sym(stateStore.uri + '#' + 'Iss'+timestamp);
                sts.push(new $rdf.Statement(transaction, WF('trip'), trip, stateStore));
                var title = kb.literal(titlefield.value);
                sts.push(new $rdf.Statement(transaction, DC('title'), title, stateStore))
                
                // sts.push(new $rdf.Statement(transaction, ns.rdfs('comment'), "", stateStore))
                sts.push(new $rdf.Statement(transaction, DCT('created'), new Date(), stateStore));

                var initialStates = kb.each(trip, WF('initialState'));
                if (initialStates.length == 0) complain('This trip has no initialState');
                for (var i=0; i<initialStates.length; i++) {
                    sts.push(new $rdf.Statement(transaction, ns.rdf('type'), initialStates[i], stateStore))
                }
                if (superTransaction) sts.push (new $rdf.Statement(superTransaction, WF('dependent'), transaction, stateStore));
                var sendComplete = function(uri, success, body) {
                    if (!success) {
                        //dump('Tabulator transaction pane: can\'t save new transaction:\n\t'+body+'\n')
                    } else {
                        // dump('Tabulator transaction pane: saved new transaction\n')
                        div.removeChild(form);
                        rerender(div);
                        tabulator.outline.GotoSubject(transaction, true, undefined, true, undefined);
                        // tabulator.outline.GoToURI(transaction.uri); // ?? or open in place?
                    }
                }
                sparqlService.update([], sts, sendComplete);
            }
            form.addEventListener('submit', sendNewTransaction, false)
            form.setAttribute('onsubmit', "function xx(){return false;}");
            var states = kb.any(trip, WF('transactionClass'));
            classLabel = tabulator.Util.labelForXML(states);
            form.innerHTML = "<h2>Add new "+ (superTransaction?"sub ":"")+
                    classLabel+"</h2><p>Title of new "+classLabel+":</p>";
            var titlefield = myDocument.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','100');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input
            form.appendChild(titlefield);
            return form;
        };
        
       //       Form for a new message
        //
        var newMessageForm = function(myDocument, kb, about, storeDoc) {
            var form = myDocument.createElement('form');
            var transaction = about;

            var sendMessage = function() {
                // titlefield.setAttribute('class','pendingedit');
                // titlefield.disabled = true;
                field.setAttribute('class','pendingedit');
                field.disabled = true;
                sts = [];
                
                var now = new Date();
                var timestamp = ''+ now.getTime();
                // http://www.w3schools.com/jsref/jsref_obj_date.asp
                var message = kb.sym(storeDoc.uri + '#' + 'Msg'+timestamp);
                sts.push(new $rdf.Statement(about, ns.wf('message'), message, storeDoc));
                // sts.push(new $rdf.Statement(message, ns.dc('title'), kb.literal(titlefield.value), storeDoc))
                sts.push(new $rdf.Statement(message, ns.sioc('content'), kb.literal(field.value), storeDoc))
                sts.push(new $rdf.Statement(message, DCT('created'), new Date(), storeDoc));
                if (me) sts.push(new $rdf.Statement(message, ns.foaf('maker'), me, storeDoc));

                var sendComplete = function(uri, success, body) {
                    if (!success) {
                        //dump('Tabulator transaction pane: can\'t save new message:\n\t'+body+'\n')
                    } else {
                        form.parentNode.removeChild(form);
                        rerender(div);
                    }
                }
                sparqlService.update([], sts, sendComplete);
            }
            form.addEventListener('submit', sendMessage, false)
            form.setAttribute('onsubmit', "function xx(){return false;}");
            // label = tabulator.Util.label(ns.dc('title')); // Localise
            // form.innerHTML = "<p>"+label+":</p>";
                    
/*
            var titlefield = myDocument.createElement('input')
            titlefield.setAttribute('type','text');
            titlefield.setAttribute('size','80');
            titlefield.setAttribute('style', 'margin: 0.1em 1em 0.1em 1em');
            titlefield.setAttribute('maxLength','2048');// No arbitrary limits
            titlefield.select() // focus next user input - doesn't work @@
            form.appendChild(titlefield);
*/
            form.appendChild(myDocument.createElement('br'));

            var field = myDocument.createElement('textarea');
            form.appendChild(field);
            field.rows = 8;
            field.cols = 80;
            field.setAttribute('style', 'font-size:100%; \
                    background-color: white; border: 0.07em solid gray; padding: 0.1em; margin: 0.1em 1em 0.1em 1em')

            form.appendChild(myDocument.createElement('br'));

            submit = myDocument.createElement('input');
            submit.setAttribute('type', 'submit');
            //submit.disabled = true; // until the filled has been modified
            submit.value = "Send"; //@@ I18n
            submit.setAttribute('style', 'float: right;');
            form.appendChild(submit);

            return form;
        };
                             
 // //////////////////////////////////////////////////////////////////////////////       
        
        
        
        var sparqlService = new tabulator.rdf.sparqlUpdate(kb);

 
        var plist = kb.statementsMatching(subject)
        var qlist = kb.statementsMatching(undefined, undefined, subject)

        var t = kb.findTypeURIs(subject);

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;


        //              Render a single transaction
        
        if (1) {  // (t['http://www.w3.org/2000/10/swap/pim/qif#Transaction']) {

            var trip = kb.any(subject, WF('trip'));
            var ns = tabulator.ns
            var predicateURIsDone = {};
            var donePredicate = function(pred) {predicateURIsDone[pred.uri]=true};
            donePredicate(ns.rdf('type'));
            donePredicate(ns.dc('title'));
            
            
            var setPaneStyle = function() {
                var mystyle = "padding: 0.5em 1.5em 1em 1.5em; ";
                if (account) {
                    var backgroundColor = kb.any(account,UI('background-color'));
                    if (backgroundColor) mystyle += "background-color: "
                                +backgroundColor.value+"; ";
                }
                div.setAttribute('style', mystyle);
            }
            setPaneStyle();
            
            var table = myDocument.createElement('tr');
            var preds = ['date', 'payee', 'amount', 'in_USD', 'currency'].map(Q);            
            var account = kb.any(subject, Q('account'));
            var statement = kb.any(subject, Q('accordingTo'));
            var store = statement ? kb.any(statement, UI('annotationStore')) :null;
           if (!store) {
                complain('(There is no annotation document for this statement'
                        +statement.uri+', so you cannot classify this transaction.)')
            }

               
            table.innerHTML = preds.map(function(p){
                var value = kb.any(subject, p);
                var s = value ? tabulator.Util.labelForXML(value) : '';
                table.innerHTML += '<tr><th>'+tabulator.Util.labelForXML(p)+'</th><td>'+s+'</td></tr>';
            }).join();
            div.appendChild(table);
            
            var amount = kb.any(subject, Q('amount'));
            var payee = kb.any(subject, Q('payee'));
            var account = kb.any(subject, Q('account'));

            var select = tabulator.panes.utils.makeSelectForCategory(myDocument, kb,
                        subject, Q('Transaction'), store, function(ok,body){
                    if (ok) {
                        setModifiedDate(store, kb, store);
                        rerender(div);
                    }
                    else complain("Failed to change state:\n"+body);
                })
            div.appendChild(select);


            var cats = kb.each(trip, WF('transactionCategory')); // zero or more
            for (var i=0; i<cats.length; i++) {
                div.appendChild(tabulator.panes.utils.makeSelectForCategory(myDocument, 
                        kb, subject, cats[i], store, function(ok,body){
                    if (ok) {
                        setModifiedDate(store, kb, store);
                        rerender(div);
                    }
                    else complain("Failed to change category:\n"+body);
                }));
            }
            
            if (trip) {
                var a = myDocument.createElement('a');
                a.setAttribute('href',trip.uri);
                a.setAttribute('style', 'float:right');
                div.appendChild(a).textContent = tabulator.Util.label(trip);
                donePredicate(ns.wf('trip'));
            }


            div.appendChild(myDocument.createElement('br'));


            // Add in simple comments about the transaction

            tabulator.outline.appendPropertyTRs(div, plist, false,
                function(pred, inverse) {
                    if (!inverse && pred.uri == 
                        "http://www.w3.org/2000/01/rdf-schema#comment") return true;
                    return false
                });

            div.appendChild(myDocument.createElement('tr'))
                        .setAttribute('style','height: 1em'); // spacer
            
            // Remaining properties
            tabulator.outline.appendPropertyTRs(div, plist, false,
                function(pred, inverse) {
                    return !(pred.uri in predicateURIsDone)
                });
            tabulator.outline.appendPropertyTRs(div, qlist, true,
                function(pred, inverse) {
                    return !(pred.uri in predicateURIsDone)
                });

        } // end of render tranasaction instance
        
        if (!me) complain("You do not have your Web Id set. Set your Web ID to make changes.");

        return div;
    }
}, true);

//ends


