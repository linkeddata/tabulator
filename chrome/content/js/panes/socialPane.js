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
            tips.appendChild(p);
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
                        outline.UserInput.sparqler.insert_statement(statement, function(uri,success,error_body) {
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
                        outline.UserInput.sparqler.delete_statement(statement, function(uri,success,error_body) {
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
        
        var span = function(html) {
            var s = myDocument.createElement('span');
            s.innerHTML = html;
            return s;
        }
        
        var oneFriend = function(friend, confirmed) {
            var box = myDocument.createElement('div');
            box.className = 'friendBox';

            var src = kb.any(friend, foaf('img')) || kb.any(friend, foaf('depiction'));
            if (src) {
                var img = myDocument.createElement("IMG")
                img.setAttribute('src', src.uri)
                img.className = 'foafThumb';
                box.appendChild(img)
            }

            var t = myDocument.createTextNode(label(friend));
            if (confirmed) t.className = 'confirmed';
            if (friend.uri) {
                var a = myDocument.createElement('a');
                a.setAttribute('href', friend.uri);
                a.appendChild(t);
                box.appendChild(a);
            } else {
                box.appendChild(t);
            }
            
            var uris = kb.uris(friend);
            for(var i=0; i<uris.length; i++) {
                outline.appendAccessIcon(box, uris[i]);
            }
            return box;
        }
        //////////// Body of render():
        
        var outline = tabulator.outline;
        //alert('render this='+this);
        var thisPane = this; // For re-render
        var kb = tabulator.kb
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'socialPane');
        var foaf = tabulator.ns.foaf;

        var tools = myDocument.createElement('div');
        tools.className = 'navBlock';
        div.appendChild(tools);
        var main = myDocument.createElement('div');
        main.className = 'mainBlock';
        div.appendChild(main);
        var tips = myDocument.createElement('div');
        tips.className ='navBlock';
        div.appendChild(tips);


        // Image top left
        var src = kb.any(s, foaf('img')) || kb.any(s, foaf('depiction'));
        if (src) {
            var img = myDocument.createElement("IMG")
            img.setAttribute('src', src.uri) // w640 h480
            img.className = 'foafPic';
            tools.appendChild(img)
        }
        var name = kb.any(s, foaf('name'));
        if (!name) name = '???';
        var h3 = myDocument.createElement("H3");
        h3.appendChild(myDocument.createTextNode(name));

        var me_uri = tabulator.preferences.get('me');
        var me = me_uri? kb.sym(me_uri) : null;
        var div2 = myDocument.createElement("div");

        
        // If the user has no WebID that we know of
        if (!me) {
            var box = myDocument.createElement('div');
            var p = myDocument.createElement('p');
            box.appendChild(p);
            box.className="mildNotice";
            p.innerHTML = ("Tip:  Do you have <a target='explain' href='http://esw.w3.org/topic/WebID'>" +
                "web ID</a>?<br/><i>  ");
            var but = myDocument.createElement('input');
            box.appendChild(but);
            but.setAttribute('type', 'button');
            but.setAttribute('value', 'Make or set A Web ID');
            var makeOne = function() {
                // document.location = "chrome://tabulator/content/webid.html";
                var w = window.open("chrome://tabulator/content/webid.html",
                'webid', "resizable=yes,scrollbars=yes");
            }
            but.addEventListener('click', makeOne, false);
            tips.appendChild(box); 
        } else {  // We do have a webid
            var but = myDocument.createElement('input');
            tips.appendChild(but);
            but.className = 'WebIDCancelButton';
            but.setAttribute('type', 'button');
            but.setAttribute('value', 'Forget my Web ID');
            var zapIt = function() {
                tabulator.preferences.set('me','');
                alert('Your Web ID was '+me_uri+'. It has been forgotten.');
                // div.parentNode.replaceChild(thisPane.render(s, myDocument), div);
            }
            but.addEventListener('click', zapIt, false);
        }

        var thisIsYou = (me && kb.sameThings(me,s));

        if (!me || thisIsYou) {  // If we know who me is, don't ask for other people
        
            var f = myDocument.createElement('form');
            tools.appendChild(f);
            var input = myDocument.createElement('input');
            f.appendChild(input);
            var tx = myDocument.createTextNode("This is you");
            tx.className = 'question';
            f.appendChild(tx);
            var myHandler = function(e) {
                // alert('this.checked='+this.checked);
                var uri = this.checked? s.uri : '';
                tabulator.preferences.set('me', uri);
                alert('Your own Web ID is now ' + (uri?uri:'reset. To set it again, find yourself and check "This is you".'));
                // div.parentNode.replaceChild(thisPane.render(s, myDocument), div);
            }
            input.setAttribute('type', 'checkbox');
            input.checked = (thisIsYou);
            input.addEventListener('click', myHandler, false);
        }
/*
        if (thisIsYou) {  // This is you
            var h = myDocument.createElement('h2');
            h.appendChild(myDocument.createTextNode('Your public profile'));
            tools.appendChild(h);
        }
*/
        var knows = foaf('knows');
    //        var givenName = kb.sym('http://www.w3.org/2000/10/swap/pim/contact#givenName');
        var familiar = kb.any(s, foaf('givenname')) || kb.any(s, foaf('firstName')) ||
                    kb.any(s, foaf('nick')) || kb.any(s, foaf('name'));
        if (familiar) familiar = familiar.value;
        var friends = kb.each(s, knows);
        
        // Do I have a public profile document?
        var profile = null; // This could be  SPARQL { ?me foaf:primaryTopic [ a foaf:PersonalProfileDocument ] }
        var editable = false;
        if (me) {
            var works = kb.each(undefined, foaf('primaryTopic'), me)
            var message = "";
            for (var i=0; i<works.length; i++) {
                if (kb.whether(works[i], tabulator.ns.rdf('type'),
                                            foaf('PersonalProfileDocument'))) {

                    editable = outline.sparql.prototype.editable(works[i].uri, kb);
                    if (!editable) { 
                        message += ("Your profile <"+escapeForXML(works[i].uri)+"> is not remotely editable.");
                    } else {
                        profile = works[i];
                        break;
                    }
                }
            }

            if (thisIsYou) { // This is about me
                if (!profile) {
                    say(message + "\nI couldn't find an editable personal profile document.");
                } else  {
                    say("Editing your profile <"+escapeForXML(profile.uri)+">.");
                     // Do I have an EDITABLE profile?
                    editable = outline.sparql.prototype.editable(profile.uri, kb);
                }
            } else { // This is about someone else
                // My relationship with this person

                var h3 = myDocument.createElement('h3');
                h3.appendChild(myDocument.createTextNode('You and '+familiar));
                tools.appendChild(h3);

                cme = kb.canon(me);
                var incoming = kb.whether(s, knows, cme);
                var outgoing = false;
                var outgoingSt = kb.statementsMatching(cme, knows, s);
                if (outgoingSt.length) {
                    outgoing = true;
                    if (!profile) profile = outgoingSt.why;
                }

                var msg = "<a href='"+me_uri+"'>You</a> and <a href='"+
                        escapeForXML(s.uri)+"'>"+escapeForXML(familiar)+"</a>"
                if (!incoming) {
                    if (!outgoing) {
                        msg = msg + ' do not know each other.';
                    } else {
                        msg = 'You know '+escapeForXML(familiar)+ ' (unconfirmed)'; // beware encoding attacks @@
                    }
                } else {
                    if (!outgoing) {
                        msg = escapeForXML(familiar) + ' knows you (unconfirmed).';
                    } else {
                        msg = msg + ' know each other.';
                    }
                }
                var tr = myDocument.createElement('tr');
                tools.appendChild(tr);
                tr.innerHTML = msg;


                if (editable) {
                    var f = buildCheckboxForm("You know " + familiar,
                            new RDFStatement(me, knows, s, profile), outgoing)
                    tools.appendChild(f);
                } // editable
                 
                if (friends) {
                    var myFriends = kb.each(me, foaf('knows'));
                    // div.appendChild(myDocument.createTextNode( '(You have '+myFriends.length+' acqaintances.) '))
                    if (myFriends) {
                        var mutualFriends = common(friends, myFriends);
                        var tr = myDocument.createElement('tr');
                        tools.appendChild(tr);
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
                    tools.appendChild(tr);
                } // friends
            } // About someone else
        } // me is defined
        // End of you and s
        
        // div.appendChild(myDocument.createTextNode(plural(friends.length, 'acqaintance') +'. '));


        // Find the intersection and difference sets
        var outgoing = kb.each(s, foaf('knows'));
        var incoming = kb.each(undefined, foaf('knows'), s);
        var confirmed = [];
        var unconfirmed = [];
        var requests = [];
        
        for (var i=0; i<outgoing.length; i++) {
            var friend = outgoing[i];
            var found = false;
            for (var j=0; j<incoming.length; j++) {
                if (incoming[j].sameTerm(friend)) {
                    found = true;
                    break;
                }
                
            }
            if (found) confirmed.push(friend);
            else unconfirmed.push(friend);
        } // outgoing

        for (var i=0; i<incoming.length; i++) {
            var friend = incoming[i];
            var lab = label(friend);
            var found = false;
            for (var j=0; j<outgoing.length; j++) {
                if (outgoing[j].sameTerm(friend)) {
                    found = true;
                    break;
                }
                
            }
            if (!found) requests.push(friend);
        } // incoming

//        cases = [['Confirmed friends', confirmed],['Unconfirmed friends', unconfirmed],['Friend Requests', requests]];
        cases = [['friends', outgoing],['Friend Requests', requests]];
        for (var i=0; i<cases.length; i++) {
            var thisCase = cases[i];
            var friends = thisCase[1];
            if (friends.length == 0) continue; // Skip empty sections (sure?)
            
            var h3 = myDocument.createElement('h3');
            h3.appendChild(myDocument.createTextNode(thisCase[0]));
            main.appendChild(h3);

            for (var j=0; j<friends.length; j++) {
                main.appendChild(oneFriend(friends[j]));
            }
                
        }
            
        // var plist = kb.statementsMatching(s, knows)
        // outline.appendPropertyTRs(div, plist, false, function(pred){return true;})

        // Experimental: Use QDOS's reverse index to get incoming links
        var f = kb.formula();
        var lookup = 'http://foaf.qdos.com/reverse/?path=' + encodeURIComponent(s.uri);
        f.add(s, tabulator.ns.rdfs('seeAlso'), kb.sym(lookup)); //@@@ better pred? @@Hack
        
        outline.appendPropertyTRs(tips, f.statements, false, function(pred){return true;})

        var h3 = myDocument.createElement('h3');
        h3.appendChild(myDocument.createTextNode('Basic Information'));
        tips.appendChild(h3);

        var preds = [ tabulator.ns.foaf('homepage') , tabulator.ns.foaf('openid'),
                tabulator.ns.foaf('weblog'),  tabulator.ns.foaf('nick'),
                tabulator.ns.foaf('workplaceHomepage'),  tabulator.ns.foaf('schoolHomepage')];
        for (var i=0; i<preds.length; i++) {
            var pred = preds[i];
            var sts = kb.statementsMatching(s, pred);
            if (sts.length == 0) {
                // if (editable) say("No home page set. Use the blue + icon at the bottom of the main view to add information.")
            } else {
                outline.appendPropertyTRs(tips, sts, false, function(pred){return true;});
            }
        }

        return div;
    }  // render()

}, false);  // tabulator.panes.register({})

if (tabulator.preferences.get('me')) {
    tabulator.sf.lookUpThing(tabulator.kb.sym(tabulator.preferences.get('me')));
};
//ends

