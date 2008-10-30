/*   Social Pane
**
**  This outline pane provides social network functions
**  Using for example the FOAF ontology.
**  Goal:  A *distributed* version of facebook, advogato, etc etc
**  - Similarly easy user interface, but data storage distributed
**  - Read and write both user-private (address book) and public data clearly
*/
tabulator.panes.register( {

    icon: Icon.src.icon_foaf,
    
    name: 'social',

    label: function(subject) {
        if (!tabulator.kb.whether(
            subject, tabulator.ns.rdf( 'type'), tabulator.ns.foaf('Person'))) return null;
        return "Friends";
    },

    render: function(s, myDocument) {
        var thisOutline = tabulator.outline;
        var kb = tabulator.kb
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'socialPane');
        var foaf = tabulator.ns.foaf;
        // Image top right
        var src = kb.any(s, foaf('img'));
        if (!src) src = kb.any(s, foaf('depiction'));
        if (src) {
            var img = myDocument.createElement("IMG")
            img.setAttribute('src', src.uri) // w640 h480
            img.class = 'foafPic';
            div.appendChild(img)
        }
        var name = kb.any(s, foaf('name'));
        if (!name) name = '???';
        var h3 = myDocument.createElement("H3");
        h3.appendChild(myDocument.createTextNode(name));

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;
        var div2 = myDocument.createElement("div");

        if (!me || me_uri == s.uri) {  // If we know who me is, don't ask for other people
            var f = myDocument.createElement('form');
            div.appendChild(f);
            var input = myDocument.createElement('input');
            f.appendChild(input);
            var tx = myDocument.createTextNode("This is you");
            tx.className = 'question';
            f.appendChild(tx);
            var myHandler = function(e) {
                // alert('this.checked='+this.checked);
                var uri = this.checked? s.uri : '';
                tabulator.preferences.set('me', uri);
                alert('Your own URI is now ' + (uri?uri:'reset. To set it again, find yourself and check "This is you".'));
            }
            input.setAttribute('type', 'checkbox');
            input.checked = (me_uri == s.uri);
            input.addEventListener('click', myHandler, false);
        }
        var common = function(x,y) { // Find common members of two lists
    //            var dict = [];
            var both = [];
            for(var i=0; i<x.length; i++) {
    //                dict[x[i].uri] = true;
                for(var j=0; j<y.length; j++) {
                    if (y[j].sameTerm(x[i])) {
                        both.push(y[j]);
                        break;
                    }
                }

            }
            return both;
        }
        var plural = function(n, s) {
            var res = ' ';
            res+= (n ? n : 'No');
            res += ' ' + s;
            if (n != 1) res += 's';
            return res;
        }
        
        var people = function(n) {
            var res = ' ';
            res+= (n ? n : 'no');
            if (n == 1) return res + ' person';
            return res + ' people';
        }
        var say = function(str) {
            var tx = myDocument.createTextNode(str);
            var p = myDocument.createElement('p');
            p.appendChild(tx);
            div.appendChild(p);
        }
        
        var buildCheckboxForm = function(lab, statement, state) {
            var f = myDocument.createElement('form');
            var input = myDocument.createElement('input');
            f.appendChild(input);
            var tx = myDocument.createTextNode(lab);
            tx.className = 'question';
            f.appendChild(tx);
            input.setAttribute('type', 'checkbox');
            var boxHandler = function(e) {
                tx.className = 'pendingedit';
                // alert('Should be greyed out')
                if (this.checked) { // Add link
                    try {
                        thisOutline.UserInput.sparqler.insert_statement(statement, function(uri,success,error_body) {
                            tx.className = 'question';
                            if (!success){
                                alert("Error occurs while inserting "+statement+'\n\n'+error_body);
                                input.checked = false; //rollback UI
                                return;
                            }
                            kb.add(statement.subject, statement.predicate, statement.object, statement.why);                        
                        })
                    }catch(e){
                        alert("Data write fails:" + e);
                        input.checked = false; //rollback UI
                        tx.className = 'question';
                    }
                } else { // Remove link
                    try {
                        thisOutline.UserInput.sparqler.delete_statement(statement, function(uri,success,error_body) {
                            tx.className = 'question';
                            if (!success){
                                alert("Error occurs while deleting "+statement+'\n\n'+error_body);
                                this.checked = true; // Rollback UI
                            } else {
                                kb.removeMany(statement.subject, statement.predicate, statement.object, statement.why);
                            }
                        })
                    }catch(e){
                        alert("Delete fails:" + e);
                        this.checked = true; // Rollback UI
                        return;
                    }
                }
            }
            input.checked = state;
            input.addEventListener('click', boxHandler, false)
            return f;
        }
        
        var knows = foaf('knows');
    //        var givenName = kb.sym('http://www.w3.org/2000/10/swap/pim/contact#givenName');
        var familiar = kb.any(s, foaf('givenname')) || kb.any(s, foaf('firstName')) ||
                    kb.any(s, foaf('nick')) || kb.any(s, foaf('name'));
        if (familiar) familiar = familiar.value;
        var friends = kb.each(s, knows);
        
        // Do I have a public profile document?
        var profile = null; // This could be  SPARQL
        var editable = false;
        if (me) {
            var works = kb.each(undefined, foaf('primaryTopic'), me)
            for (var i=0; i<works.length; i++) {
                if (kb.whether(works[i], tabulator.ns.rdf('type'),
                                            foaf('PersonalProfileDocument'))) {

                    editable = thisOutline.sparql.prototype.editable(works[i].uri, kb);
                    if (!editable) { 
                        say("Your profile <"+works[i].uri+"> is not remotely editable.");
                    } else {
                        profile = works[i];
                        break;
                    }
                }
            }

            if (me_uri == s.uri ) { // This is about me
                if (!profile) {
                    say("I couldn't find an editable personal profile document.");
                } else  {
                    say("Editing your profile <"+profile.uri+">.");
                }
            } else { // This is about someone else
                // My relationship with this person
                var incoming = kb.whether(s, knows, me);
                var outgoing = false;
                var outgoingSt = kb.statementsMatching(me, knows, s);
                if (outgoingSt.length) {
                    outgoing = true;
                    if (!profile) profile = outgoingSt.why;
                } // Do I have an EDITABLE profile?
                if (profile) editable = thisOutline.sparql.prototype.editable(profile.uri, kb)

                var msg = 'You and '+familiar
                if (!incoming) {
                    if (!outgoing) {
                        msg = msg + ' do not know each other.';
                    } else {
                        msg = 'You know '+familiar+ ' (unconfirmed)';
                    }
                } else {
                    if (!outgoing) {
                        msg = familiar + ' knows you (unconfirmed).';
                    } else {
                        msg = msg + ' know each other.';
                    }
                }
                var tr = myDocument.createElement('tr');
                div.appendChild(tr);
                tr.appendChild(myDocument.createTextNode(msg))


                if (editable) {
                    var f = buildCheckboxForm("You know " + familiar,
                            new RDFStatement(me, knows, s, profile), outgoing)
                    div.appendChild(f);
                } // editable
                 
                if (friends) {
                    var myFriends = kb.each(me, foaf('knows'));
                    // div.appendChild(myDocument.createTextNode( '(You have '+myFriends.length+' acqaintances.) '))
                    if (myFriends) {
                        var mutualFriends = common(friends, myFriends);
                        var tr = myDocument.createElement('tr');
                        div.appendChild(tr);
                        tr.appendChild(myDocument.createTextNode(
                                    'You'+ (familiar? ' and '+familiar:'') +' know'+
                                    people(mutualFriends.length)+' in common'))
                        if (mutualFriends) {
                            for (var i=0; i<mutualFriends.length; i++) {
                                tr.appendChild(myDocument.createTextNode(
                                    ',  '+ label(mutualFriends[i])));
                            }
                        }
                    }
                    var tr = myDocument.createElement('tr');
                    div.appendChild(tr);
                } // friends
            } // About someone else
        } // me is defined
        
        // div.appendChild(myDocument.createTextNode(plural(friends.length, 'acqaintance') +'. '));

        var plist = kb.statementsMatching(s, knows)
        thisOutline.appendPropertyTRs(div, plist, false, function(pred){return true;})

        // Experimental: Use QDOS's reverse index to get incoming links
        var f = kb.formula();
        var mboxes = kb.each(s, foaf('mbox'));
        for (var i=0; i<mboxes.length; i++) {
            var email = mboxes[i];
            if (email.uri) {
                var reverse = 'http://foaf.qdos.com/reverse?ifp=' + email.uri; // @@ encode?? ask Steve
                f.add(s, tabulator.ns.rdfs('seeAlso'), kb.sym(reverse)); //@@@ better pred? @@Hack
            }
        }
        thisOutline.appendPropertyTRs(div, f.statements, false, function(pred){return true;})

        return div;
    }  // render()

}, true);  // tabulator.panes.register({})

if (tabulator.preferences.get('me')) {
    tabulator.sf.lookUpThing(tabulator.kb.sym(tabulator.preferences.get('me')));
};
//ends

