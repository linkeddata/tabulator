/*   Category Pane
**
**  This outline pane allows the user to select which sublclasses
** something is a member of in a tree-organized class hierarchy.
** This could equally well be used for any other hierarchical set of things
** such as nested geograpgical regions or nested time periods,
** or for a class of a related thing, such of class of person in the picture.
** Maybe this hsoul dbe split off as a widget for tagging within other panes.
*/

// @@ These RDFS bits should clearly be moved to a js/rdf/rdfs.js file but the last one of
// those was removed so I am keep this here for now! tim

$rdf.Formula.prototype.findTypeURIs = function (subject) {
    // Get all the Classes of which we can RDFS-infer the subject is a member
    // ** @@ This will loop is there is a class subclass loop which is actually valid
    // Returns a hash table where key is URI of type and value is statement why we think so.
    // Does NOT return terms, returns URI strings.

    var sts = this.statementsMatching(subject, undefined, undefined); // fast
    var rdftype = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    var types = [];
    for (var i=0; i < sts.length; i++) {
        st = sts[i];
        if (st.predicate.uri == rdftype) {
            types[st.object.uri] = st;
        } else {
            // $rdf.log.warn('types: checking predicate ' + st.predicate.uri);
            var ranges = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#domain'))
            for (var j=0; j<ranges.length; j++) {
                types[ranges[j].uri] = st; // A pointer to one part of the inference only
            }
        }
    }
    var sts = this.statementsMatching(undefined, undefined, subject); // fast
    for (var i=0; i < sts.length; i++) {
        st = sts[i];
        var domains = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#range'))
        for (var j=0; j < domains.length; j++) {
            types[domains[j].uri] = st;
        }
    }
    
    var done = {}; // Classes we have looked up
    var go = true;
    for(;go;) {
        go = false;
        var agenda = {};
        for (var t in types) agenda[t] = types[t]; // Take a copy
        for (var t in agenda) {
            var sups = this.each(this.sym(t), this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'));
            for (var i=0; i<sups.length; i++) {
                var s = sups[i].uri;
                if (s in done) continue;
                if (s in agenda) continue;
                types[s] = types[t];
                go = true;
            }
            done[t] = agenda[t];
            delete types[t];
        }
        
    }
    // $rdf.log.warn('Types: ' + types.length); 
    return done;
};
        
/* Find the types in the list which have no *stored* supertypes
** We exclude the universal class, owl:Things and rdf:Resource, as it is not information-free.*/
        
$rdf.Formula.prototype.topTypeURIs = function(types) {
    var tops = [];
    for (var u in types) {
        var sups = this.each(this.sym(u), this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'));
        var k = 0
        for (var j=0; j < sups.length; j++) {
            if (sups[j].uri != 'http://www.w3.org/2000/01/rdf-schema#Resource') {
                k++; break;
            }
        }
        if (!k) tops[u] = types[u];
    }
    if (tops['http://www.w3.org/2000/01/rdf-schema#Resource'])
        delete tops['http://www.w3.org/2000/01/rdf-schema#Resource'];
    if (tops['http://www.w3.org/2002/07/owl#Thing'])
        delete tops['http://www.w3.org/2002/07/owl#Thing'];
    return tops;
}

/* Find the types in the list which have no *stored* subtypes
** These are a set of classes which provide by themselves complete
** information -- the other classes are redundant for those who
** know the class DAG.
*/
    
$rdf.Formula.prototype.bottomTypeURIs = function(types) {
    var bots = [];
    for (var u in types) {
        var subs = this.each(undefined, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'),this.sym(u));
        var bottom = true;
        for (var i=0; i<subs.length; i++) {
            if (subs[i].uri in types) {
                bottom = false;
                break;
            }
        }
        if (bottom) bots[u] = types[u];
    }
    return bots;
}
   
//            var categorizables = { 'http://www.w3.org/2000/10/swap/pim/qif#Transaction': true ,
//                                    'http://www.w3.org/2000/10/swap/pim/qif#Classified': true };

    
// These used to be in js/init/icons.js but are better in the pane.
tabulator.Icon.src.icon_categorize = iconPrefix + 'icons/22-categorize.png';
tabulator.Icon.tooltips[tabulator.Icon.src.icon_categorize] = 'Categories'

tabulator.panes.register( {

    icon: tabulator.Icon.src.icon_categorize,
    
    name: 'category',
    
    // Does the subject deserve a categorizing pane?
    label: function(subject) {
        var kb = tabulator.kb
        var t = kb.findTypeURIs(subject);
        //@@@ t = kb.topTypeURIs(t);
        var classes = 0;
        for (var u in t) classes++;
        //@@@@  if (classes==0) return null ;  // None, suppress pane
        
        // Not if a class itself (maybe need a different pane for that):
        if (t['http://www.w3.org/2000/01/rdf-schema#Class']) return null; 
        if (t['http://www.w3.org/2002/07/owl#Class']) return null;
        
        return "Categorize "+classes; // Yes under other circumstances (while testing at least!)

    },

    render: function(subject, myDocument) {
        var kb = tabulator.kb;
    
        var div = myDocument.createElement("div")
        div.setAttribute('class', 'categoryPane');
        
        var types = kb.findTypeURIs(subject);
        var tops = kb.topTypeURIs(types);
        var bots = kb.bottomTypeURIs(types);

        /////////////// debug 
        /*
        var str = "";
        for (var t in types) str = str + t + ",  ";
        var debug = div.appendChild(myDocument.createTextNode('Types: '+str)) // @@@
        
        var str = "";
        for (var t in bots) str = str + t + ",  ";
        var debug = div.appendChild(myDocument.createTextNode('. Bots: '+str)) // @@@
        */
        
        function domForClass(c, force) {
            var tr = myDocument.createElement('TR');
            tr.setAttribute('class', 'categoryClass');
            var anchor = myDocument.createElement('A');
            if (c.uri) anchor.setAttribute('href', c.uri);
            anchor.setAttribute('class', c.uri in types ? 'categoryIn' : 'categoryOut')
            if (c.uri in bots) anchor.setAttribute('class', 'categoryBottom');
            var lab = tabulator.Util.label(c);
            lab = lab.slice(0,1).toUpperCase() + lab.slice(1);
            if (c.uri in types) lab += " *";
            anchor.appendChild(myDocument.createTextNode(lab));
            tr.appendChild(anchor);
            
            if (c.uri) {
                var st = types[c.uri];
                if (st) {
                    if (st.uri) { // just a subsumption
                        /* nothing */
                    } else if (st.why) {// specific statement
                        var anchor = myDocument.createElement('A');
                        anchor.appendChild(myDocument.createTextNode(
                            "  ("+
                            tabulator.Util.label(st.subject)+" "+
                            tabulator.Util.label(st.predicate)+" "+
                            tabulator.Util.label(st.object)+")"));
                        if (st.why.uri) anchor.setAttribute('href', st.why.uri)
                        anchor.setAttribute('class', 'categoryWhy')
                        tr.appendChild(anchor);
                    }
                }
            }
            var table = null;
            
            var makeSelectForSubs = function(subs, multiple) {
                var n = 0; uris ={};
                for (var i=0; i < subs.length; i++) {
                    var sub = subs[i];
                    if (sub.uri in uris) continue;
                    uris[sub.uri] = true; n++;
                }
                if (n>0) {
                    var select = myDocument.createElement('select');
                    if (multiple) select.setAttribute('multiple', 'true'); //@@ Later, check whether classes are disjoint.
                    select.innerHTML = "<option>-- classify --</option>";
                    for (var uri in uris) {
                        var option = myDocument.createElement('option');
                        option.appendChild(myDocument.createTextNode(tabulator.Util.label(kb.sym(uri))));
                        option.setAttribute('name', uri);
                        if (uri in types) option.setAttribute('selected', 'true')
                        select.appendChild(option);
                    }
                    return select;
                }
                return null;
            
            } // makeSelectForSubs
            
            var subClassesAsNT = {};
            var disjointSubclassLists = kb.each(c, kb.sym('http://www.w3.org/2002/07/owl#disjointUnionOf'));
            if (disjointSubclassLists) {
                for (j=0; j<disjointSubclassLists.length; j++) {
                    td.appendChild(myDocument.createTextNode('subs:'+subs));
                    var subs = disjointSubclassLists[j].elements;
                    var sel = makeSelectForSubs(subs, false); // Not multiple
                    if (sel) tr.appendChild(sel); 
                    for (var i=0; i<subs.length; i++) {
                        subClassesAsNT[subs[i].toNT()] = true; // Could be blank node
                    }
                }
            }
            
            
            var subs = kb.each(undefined, kb.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), c);
            if (subs) {
                if (!table) {
                    table = myDocument.createElement('TABLE')
                    table.setAttribute('class', 'categoryTable');
                    tr.appendChild(table);
                }
                
                var uris = {}; // remove duplicates (why dups?) and count
                var n = 0;
                for (var i=0; i < subs.length; i++) {
                    var sub = subs[i];
                    if (sub.uri in uris) continue;
                    uris[sub.uri] = true; n++;
                }
//@@
                for (uri in uris) {
                    if (uri in types) {
                        table.appendChild(domForClass(kb.sym(uri), false))
//                    } else if (c.uri && ((c.uri in bots) || (c.uri in categorizables))) {
//                        table.appendChild(domForClass(kb.sym(uri), false))
                    }
                }
            }

            return tr;
        }
        
        for (var u in tops) {
            var c = kb.sym(u);
            var tr = domForClass(c);
            div.appendChild(tr);
        }
        
        
        
        return div;
    }
}, true);

//ends


