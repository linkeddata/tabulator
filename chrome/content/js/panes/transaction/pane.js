/*   Financial Transaction Pane
**
**  This outline pane allows a user to interact with a transaction
**  downloaded from a bank statement, annotting it with classes and comments,
** trips, etc
*/

    
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
        if (t['http://www.w3.org/2000/10/swap/pim/qif#Transaction']) return "$$";
        if(kb.any(subject, Q('amount'))) return "$$$"; // In case schema not picked up

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
        
        var div = myDocument.createElement('div')
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
            
            var account = kb.any(subject, Q('toAccount'));
            var statement = kb.any(subject, Q('accordingTo'));
            var store = statement != undefined ? kb.any(statement, Q('annotationStore')) :null;
            if (store == undefined) {
                complain('(There is no annotation document for this statement\n<'
                        +statement.uri+'>,\nso you cannot classify this transaction.)')
            };
            
            var nav = myDocument.createElement('div');
            nav.setAttribute('style', 'float:right');
            div.appendChild(nav);

            var navLink = function(pred) {
                donePredicate(pred);
                var obj =  kb.any(subject, pred);
                if (!obj) return;
                var a = myDocument.createElement('a');
                a.setAttribute('href',obj.uri);
                a.setAttribute('style', 'float:right');
                nav.appendChild(a).textContent = tabulator.Util.label(obj);
                nav.appendChild(myDocument.createElement('br'));
            }

            navLink(Q('toAccount'));
            // navLink(Q('accordingTo'));
            navLink(Q('trip'));
            
            // Basic data:
            var table = myDocument.createElement('table');
            div.appendChild(table);
            var preds = ['date', 'payee', 'amount', 'in_USD', 'currency'].map(Q);
            var inner = preds.map(function(p){
                donePredicate(p);
                var value = kb.any(subject, p);
                var s = value ? tabulator.Util.labelForXML(value) : '';
                return '<tr><td style="text-align: right; padding-right: 0.6em">'+tabulator.Util.labelForXML(p)+
                    '</td><td style="font-weight: bold;">'+s+'</td></tr>';
            }).join('\n');
            table.innerHTML =  inner;

            // Classify:
            var select = tabulator.panes.utils.makeSelectForCategory(myDocument, kb,
                        subject, Q('Classified'), store, function(ok,body){
                    if (ok) {
                        setModifiedDate(store, kb, store);
                        rerender(div);
                    }
                    else complain("Failed to change state:\n"+body);
                })
            div.appendChild(select);

            

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
        
        //if (!me) complain("You do not have your Web Id set. Set your Web ID to make changes.");

        return div;
    }
}, true);

//ends


