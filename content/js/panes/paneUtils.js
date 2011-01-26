/**
* Few General purpose utility functions used in the panes
* oshani@csail.mit.edu 
*/


paneUtils = {};
tabulator.panes.utils = paneUtils;
tabulator.panes.field = {}; // Form field functions by URI of field type.

// This is used to canonicalize an array
tabulator.panes.utils.unique = function(a){
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++){
      for(var x = 0, y = r.length; x < y; x++){
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}

//To figure out the log URI from the full URI used to invoke the reasoner
tabulator.panes.utils.extractLogURI = function(fullURI){
    var logPos = fullURI.search(/logFile=/);
    var rulPos = fullURI.search(/&rulesFile=/);
    return fullURI.substring(logPos+8, rulPos); 			
}

tabulator.panes.utils.shortDate = function(str) {
    var now = $rdf.term(new Date()).value;
    if (str.slice(0,10) == now.slice(0,10)) return str.slice(11,16);
    return str.slice(0,10);
}

tabulator.panes.utils.newThing = function(kb, store) {
    var now = new Date();
    // http://www.w3schools.com/jsref/jsref_obj_date.asp
    return kb.sym(store.uri + '#' + 'id'+(''+ now.getTime()));
}

	
//These are horrible global vars. To minimize the chance of an unintended name collision
//these are prefixed with 'ap_' (short for air pane) - Oshani
var ap_air = tabulator.rdf.Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
var ap_tms = tabulator.rdf.Namespace("http://dig.csail.mit.edu/TAMI/2007/amord/tms#");
var ap_compliant = ap_air('compliant-with');
var ap_nonCompliant = ap_air('non-compliant-with');
var ap_antcExpr = ap_tms('antecedent-expr');
var ap_just = ap_tms('justification');
var ap_subExpr = ap_tms('sub-expr');
var ap_description = ap_tms('description');
var ap_ruleName = ap_tms('rule-name');
var ap_prem = ap_tms('premise');
var ap_instanceOf = ap_air('instanceOf');
var justificationsArr = [];



/*                                  Form Field implementations
**
*/
/*          Group of different fields
**
*/
tabulator.panes.field[tabulator.ns.ui('Form').uri] =
tabulator.panes.field[tabulator.ns.ui('Group').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var kb = tabulator.kb;
    var box = dom.createElement('div');
    box.setAttribute('style', 'padding-left: 2em; border: 0.05em solid brown;');  // Indent a group
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    
    // Prevent loops
    var key = subject.toNT() + '|' +  form.toNT() ;
    if (already[key]) { // been there done that
        box.appendChild(dom.createTextNode("Group: see above "+key));
        var plist = [$rdf.st(subject, tabulator.ns.owl('sameAs'), subject)]; // @@ need prev subject
        tabulator.outline.appendPropertyTRs(box, plist);
        return box;
    }
    // box.appendChild(dom.createTextNode("Group: first time, key: "+key));
    already2 = {};
    for (var x in already) already2[x] = 1;
    already2[key] = 1;
    
    var parts = kb.each(form, ui('part'));
    if (!parts) throw "No parts to form "+form;
    var p2 = parts.map(function(p) {var k = kb.any(p, ui('sequence')); return [k?k:999,p] });
    p2.sort();

    var eles = [];
    var original = [];
    for (var i=0; i<p2.length; i++) {
        var field = p2[i][1];
        var t = tabulator.panes.utils.bottomURI(field); // Field type
        if (t == ui('Options').uri) {
            var dep = kb.any(field, ui('dependingOn'));
            if (dep && kb.any(subject, dep)) original[i] = kb.any(subject, dep).toNT();
        }

        var fn = tabulator.panes.utils.fieldFunction(field);
        
        var itemChanged = function(ok, body) {
            //box.appendChild(tabulator.panes.utils.errorMessage(dom, "Group: item done called."));
            if (ok) {
                //box.appendChild(tabulator.panes.utils.errorMessage(dom, "Group: item done ok"));
                for (j=0; j<p2.length; j++) {  // This is really messy.
                    var field = (p2[j][1])
                    var t = tabulator.panes.utils.bottomURI(field); // Field type
                    if (t == ui('Options').uri) {
                        var dep = kb.any(field, ui('dependingOn'));
                        //box.appendChild(tabulator.panes.utils.errorMessage(dom, "Group: depending on "+dep));
 //                       if (dep && kb.any(subject, dep) && (kb.any(subject, dep).toNT() != original[j])) { // changed
                        if (1) { // assume changed
                            var newOne = fn(dom, box, already2, subject, field, store, callback);
                            box.removeChild(newOne);
                            box.insertBefore(newOne, eles[j]);
                            box.removeChild(eles[j]);
                            original[j] = kb.any(subject, dep).toNT();
                            eles[j] = newOne;
                        } 
                    }
                }
            }
            callback(ok, body);
        }
        eles.push(fn(dom, box, already2, subject, field, store, itemChanged));
    }
    return box;
}

/*          Options: Select one or more cases
**
*/
tabulator.panes.field[tabulator.ns.ui('Options').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var kb = tabulator.kb;
    var box = dom.createElement('div');
    // box.setAttribute('style', 'padding-left: 2em; border: 0.05em dotted purple;');  // Indent Options
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    
    var dependingOn = kb.any(form, ui('dependingOn'));
    if (!dependingOn) dependingOn = tabulator.ns.rdf('type'); // @@ default to type (do we want defaults?)
    var cases = kb.each(form, ui('case'));
    if (!cases) throw "No cases to Options form "+form;
    var values;
    if (dependingOn.sameTerm(tabulator.ns.rdf('type'))) {
        values = kb.findTypeURIs(subject);
    } else { 
        var value = kb.any(subject, dependingOn);
        if (value == undefined) { 
            // complain?
        } else {
            values = {};
            values[value.uri] = true;
        }
    }
    for (var i=0; i<cases.length; i++) {
        var c = cases[i];
        var tests = kb.each(c, ui('for')); // There can be multiple 'for'
        for (var j=0; j<tests.length; j++) {
            if (values[tests[j].uri]) {
                // box.appendChild(dom.createTextNode('@@ case for:'+tests[0]));
                var field = kb.the(c, ui('use'));
                if (!field) throw "No 'use' part for case in form "+form
                tabulator.panes.utils.appendForm(dom, box, already, subject, field, store, callback);
                break;
            }
        } 
    }
    return box;
}

/*          Multiple similar fields
**
*/
tabulator.panes.field[tabulator.ns.ui('Multiple').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(kb);
    var kb = tabulator.kb;
    var box = dom.createElement('table');
    // We don't indent multiple as it is a sort of a prefix o fthe next field and has contents of one.
    // box.setAttribute('style', 'padding-left: 2em; border: 0.05em solid green;');  // Indent a multiple
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property to multiple: "+form; // used for arcs in the data
    var element = kb.any(form, ui('part')); // This is the form to use for each one
    if (!element) throw "No part to multiple: "+form;

    var count = 0;
    // box.appendChild(dom.createElement('h3')).textContents = "Fields:".
    var body = box.appendChild(dom.createElement('tr'));
    var tail = box.appendChild(dom.createElement('tr'));
    var img = tail.appendChild(dom.createElement('img'));
    img.setAttribute('src', tabulator.Icon.src.icon_add_triple); // blue plus
    img.title = "(m) Add " + tabulator.Util.label(property);
    
    var addItem = function(e, object) {
        tabulator.log.debug('Multiple add: '+object);
        var num = ++count;
        if (!object) object = tabulator.panes.utils.newThing(kb, store);
        var tr = box.insertBefore(dom.createElement('tr'), tail);
        var itemDone = function(ok, body) {
            if (ok) { // @@@ Check IT hasnt alreday been written in
                //tr.appendChild(tabulator.panes.utils.errorMessage(dom, "Multiple: item done ok"));
                if (!kb.holds(subject, property, object)) {
                    var ins = [$rdf.st(subject, property, object, store)]
                    tabulator.sparql.update([], ins, linkDone);
                }
            } else {
                tr.appendChild(tabulator.panes.utils.errorMessage(dom, "Multiple: item failed: "+body));
                callback(ok, body);
            }
        }
        var linkDone = function(uri, ok, body) {
            return callback(ok, body);
        }
        var fn = tabulator.panes.utils.fieldFunction(element);
        // box.appendChild(dom.createTextNode('multiple object: '+object ));
        fn(dom, body, already, object, element, store, itemDone);        
    }
        
    kb.each(subject, property).map(function(obj){addItem(null, obj)});

    img.addEventListener('click', addItem, true);
    return box
}

/*          Text field
**
*/
// For possible date popups see e.g. http://www.dynamicdrive.com/dynamicindex7/jasoncalendar.htm
// or use HTML5: http://www.w3.org/TR/2011/WD-html-markup-20110113/input.date.html
//

tabulator.panes.fieldParams = {};


tabulator.panes.fieldParams[tabulator.ns.ui('DateField').uri] = {
    'size': 20, 'type': 'date'};
tabulator.panes.fieldParams[tabulator.ns.ui('DateField').uri].pattern = 
    /^\s*[0-9][0-9][0-9][0-9](-[0-1]?[0-9]-[0-3]?[0-9])?(T[0-2][0-9]:[0-5][0-9](:[0-5][0-9])?)?Z?\s*$/;

tabulator.panes.fieldParams[tabulator.ns.ui('IntegerField').uri] = {
    size: 12, 'style': 'text-align: right', 'parse': parseInt };
tabulator.panes.fieldParams[tabulator.ns.ui('IntegerField').uri].pattern =
     /^\s*-?[0-9]+\s*$/;
     
tabulator.panes.fieldParams[tabulator.ns.ui('DecimalField').uri] = {
    'size': 12 , 'style': 'text-align: right', 'parse': parseFloat };
tabulator.panes.fieldParams[tabulator.ns.ui('DecimalField').uri].pattern =
    /^\s*-?[0-9]*(\.[0-9]*)?\s*$/;
    
tabulator.panes.fieldParams[tabulator.ns.ui('FloatField').uri] = {
    'size': 12, 'style': 'text-align: right', 'parse': parseFloat };
tabulator.panes.fieldParams[tabulator.ns.ui('FloatField').uri].pattern =
    /^\s*-?[0-9]*(\.[0-9]*)?((e|E)-?[0-9]*)?\s*$/; 

tabulator.panes.fieldParams[tabulator.ns.ui('SingleLineTextField').uri] = { };
tabulator.panes.fieldParams[tabulator.ns.ui('TextField').uri] = { };



tabulator.panes.field[tabulator.ns.ui('DateField').uri] = 
tabulator.panes.field[tabulator.ns.ui('NumericField').uri] = 
tabulator.panes.field[tabulator.ns.ui('IntegerField').uri] = 
tabulator.panes.field[tabulator.ns.ui('DecimalField').uri] = 
tabulator.panes.field[tabulator.ns.ui('FloatField').uri] = 
tabulator.panes.field[tabulator.ns.ui('TextField').uri] = 
tabulator.panes.field[tabulator.ns.ui('SingleLineTextField').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var ui = tabulator.ns.ui;
    var kb = tabulator.kb;

    var box = dom.createElement('div');

    var property = kb.any(form, ui('property'));
    if (!property) { box.appendChild(dom.createTextNode("Error: No property given for text field: "+form)); return box};

    box.appendChild(tabulator.panes.utils.fieldLabel(dom, property));
    var uri = tabulator.panes.utils.bottomURI(form); 
    var params = tabulator.panes.fieldParams[uri];
    if (params == undefined) params = {}; // non-bottom field types can do this
    var style = params.style? params.style : '';
    // box.appendChild(dom.createTextNode(' uri='+uri+', pattern='+ params.pattern));
    container.appendChild(box);
    var field = dom.createElement('input');
    box.appendChild(field);
    field.setAttribute('type', params.type? params.type : 'text');
    

    var size = kb.any(form, ui('size')); // Form has precedence
    field.setAttribute('size',  size?  ''+size :(params.size? ''+params.size : '20'));
    var maxLength = kb.any(form, ui('maxLength'));
    field.setAttribute('maxLength',maxLength? ''+maxLength :'4096');

    var obj = kb.any(subject, property);
    if (obj != undefined && obj.value != undefined) field.value = ''+obj.value;

    field.addEventListener("keyup", function(e) {
        if (params.pattern) field.setAttribute('style', style + (
            field.value.match(params.pattern) ?
                                'color: green;' : 'color: red;'));
    }, true);
    field.addEventListener("change", function(e) { // i.e. lose focus with changed data
        if (params.pattern && !field.value.match(params.pattern)) return;
        field.setAttribute('style', 'color: gray;'); // pending 
        var ds = kb.statementsMatching(subject, property);
        var is = $rdf.st(subject, property,
                    params.parse? params.parse(field.value) : field.value, store);// @@ Explicitly put the datatype in.
        tabulator.sparql.update(ds, is, function(ok, body) {
            if (ok) {
                field.setAttribute('style', 'color: black;');
            } else {
                box.appendChild(tabulator.panes.utils.errorMessage(dom, msg));
            }
            callback(ok, body);
        })
    }, true);
    return box;
}


/*          Multiline Text field
**
*/

tabulator.panes.field[tabulator.ns.ui('MultiLineTextField').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var ui = tabulator.ns.ui;
    var kb = tabulator.kb;
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property to text field: "+form;
    container.appendChild(tabulator.panes.utils.fieldLabel(dom, property));
    var box = tabulator.panes.utils.makeDescription(dom, kb, subject, property, store, callback);
    // box.appendChild(dom.createTextNode('<-@@ subj:'+subject+', prop:'+property));
    container.appendChild(box);
    return box;
}



/*          Boolean field
**
*/

tabulator.panes.field[tabulator.ns.ui('BooleanField').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var ui = tabulator.ns.ui;
    var kb = tabulator.kb;
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property to text field: "+form;
    var lab = kb.any(form, ui('label'));
    if (!lab) lab = tabulator.Util.label(property);
    var state = kb.any(subject, property)
    if (state == undefined) state = false; // @@ sure we want that -- or three-state?
    tabulator.log.debug('store is '+store);
    var statement = $rdf.st(subject, property, true, store);  /// @@@ lack of stsement is not enough
    var box = tabulator.panes.utils.buildCheckboxForm(dom, kb, lab, statement, state);
    container.appendChild(box);
    return box;
}

/*          Classifier field
**
**  Nested categories
** 
** @@ To do: If a classification changes, then change any dependent Options fields.
*/

tabulator.panes.field[tabulator.ns.ui('Classifier').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var kb = tabulator.kb, ui = tabulator.ns.ui, ns = tabulator.ns;
    var category = kb.any(form, ui('category'));
    if (!category) throw "No category for classifier: " + form;
    tabulator.log.debug('Classifier: store='+store);
    var checkOptions = function(ok, body) {
        if (!ok) return callback(ok, body);
        var parent = kb.any(undefined, ui('part'), form);
        if (!parent) return callback(ok, body);
        var kids = kb.each(parent, ui('part')); // @@@@@@@@@ Garbage
        kids = kids.filter(function(k){return kb.any(k, ns.rdf('type'), ui('Options'))})
        if (kids.length) tabulator.log.debug('Yes, found related options: '+kids[0])
        return callback(ok, body);
    };
    var box = tabulator.panes.utils.makeSelectForNestedCategory(dom, kb, subject, category, store, checkOptions);
    container.appendChild(box);
    return box;
}

/*          Choice field
**
**  Not nested.  Generates a link to something from a given class.
**  Optional subform for the thing selected.
**  Alternative implementatons caould be:
** -- pop-up menu (as here)
** -- radio buttons
** -- auto-complete typing
** 
** Todo: Deal with multiple.  Maybe merge with multiple code.
*/

tabulator.panes.field[tabulator.ns.ui('Choice').uri] = function(
                                    dom, container, already, subject, form, store, callback) {
    var ui= tabulator.ns.ui;
    var ns = tabulator.ns;
    var kb = tabulator.kb;
    var box = dom.createElement('div');
    container.appendChild(box);
    var property = kb.any(form, ui('property'));
    if (!property) return tabulator.panes.utils.errorMessage(dom, "No property for Choice: "+form);
    box.appendChild(tabulator.panes.utils.fieldLabel(dom, property));
    var from = kb.any(form, ui('from'));
    if (!from) throw "No from for Choice: "+form;
    var subForm = kb.any(form, ui('use'));  // Optional
    var possible = [];
    possible = kb.each(undefined, ns.rdf('type'), from);
    for (x in kb.findMembersNT(from)) {
        possible.push(kb.fromNT(x));
        // box.appendChild(dom.createTextNode("RDFS: adding "+x));
    }; // Use rdfs
    if (from.sameTerm(ns.rdf('type'))) {
        for (var p in tabulator.panes.utils.allClassURIs()) possible.push(kb.sym(p));     
    } else if (from.sameTerm(ns.owl('ObjectProperty'))) {
       if (tabulator.properties == undefined) tabulator.panes.utils.propertyTriage();
        for (var p in tabulator.properties.op) possible.push(kb.fromNT(p));     
    } else if (from.sameTerm(ns.owl('DataProperty'))) {
        if (tabulator.properties == undefined) tabulator.panes.utils.propertyTriage();
        for (var p in tabulator.properties.dp) possible.push(kb.fromNT(p));     
    }
    var object = kb.any(subject, property);
    function addSubForm(ok, body) {
        object = kb.any(subject, property);
        tabulator.panes.utils.fieldFunction(subForm)(dom, box, already,
                                        object, subForm, store, callback);
    }
    var multiple = false;
    // box.appendChild(dom.createTextNode('Choice: subForm='+subForm))
    var possible2 = tabulator.panes.utils.sortByLabel(possible);
    var selector = tabulator.panes.utils.makeSelectForOptions(
                dom, kb, subject, property,
                possible2, multiple, "--"+ tabulator.Util.label(property)+"-?",
                store, subForm ? addSubForm :callback);
    box.appendChild(selector);
    if (object && subForm) addSubForm(true, "");
    return box;
}



///////////////////////////////////////////////////////////////////////////////


tabulator.panes.utils.allClassURIs = function() {
    var set = {};
    tabulator.kb.statementsMatching(undefined, tabulator.ns.rdf('type'), undefined)
        .map(function(st){if (st.object.uri) set[st.object.uri] = true });
    tabulator.kb.statementsMatching(undefined, tabulator.ns.rdfs('subClassOf'), undefined)
        .map(function(st){
            if (st.object.uri) set[st.object.uri] = true ;
            if (st.subject.uri) set[st.subject.uri] = true });
    tabulator.kb.each(undefined, tabulator.ns.rdf('type'),tabulator.ns.rdf('type'))
        .map(function(c){if (c.uri) set[c.uri] = true});
    return set;
}

tabulator.panes.utils.propertyTriage = function() {
    if (tabulator.properties == undefined) tabulator.properties = {};
    var kb = tabulator.kb;
    var dp = {}, op = {}, no= 0, nd = 1;
    var pi = kb.predicateIndex; // One entry for each pred
    for (var p in pi) {
        var object = pi[p][0].object;
        if (object.termType == 'literal') {
            dp[p] = true;
            nd ++;
        } else {
            op[p] = true;
            no ++;
        }    
    }
    tabulator.properties.op = op;
    tabulator.properties.dp = dp;
    tabulator.log.info('propertyTriage: '+no+' non-lit, '+nd+' literal.')
}


tabulator.panes.utils.fieldLabel = function(dom, property) {
    if (property == undefined) return dom.createTextNode('@@ undefined property');
    return dom.createTextNode(tabulator.Util.label(property));
}

/*                      General purpose widgets
**
*/

tabulator.panes.utils.errorMessage = function(dom, msg) {
    var div = dom.createElement('div');
    div.setAttribute('style', 'background-color: #fdd; color:black;');
    div.appendChild(dom.createTextNode(msg));
    return div;
}
tabulator.panes.utils.bottomURI = function(x) {
    var kb = tabulator.kb;
    var ft = kb.findTypeURIs(x);
    var bot = kb.bottomTypeURIs(ft); // most specific
    var bots = []
    for (var b in bot) bots.push(b);
    if (bots.length > 1) throw "Didn't expect "+x+" to have multiple bottom types: "+bots;
    return bots[0];
}

tabulator.panes.utils.fieldFunction = function(field) {
    var uri = tabulator.panes.utils.bottomURI(field);
    var fun = tabulator.panes.field[uri];
    tabulator.log.debug("paneUtils: Going to implement field "+field+" of type "+uri)
    if (!fun) throw "No handler for field "+field+" of type "+uri
    return fun
}

// A button for editing a form (in place, at the moment)
// 
tabulator.panes.utils.editFormButton = function(dom, container, form, store, callback) {
    var b = dom.createElement('button');
    b.setAttribute('type', 'button');
    b.innerHTML = "Edit "+tabulator.Util.label(tabulator.ns.ui('Form'));
    b.addEventListener('click', function(e) {
        tabulator.panes.utils.appendForm(dom, container,
                {}, subject, tabulator.ns.ui('FormForm'), store, callback)
        container.remove(b);
    }, true);
    return b;
}

tabulator.panes.utils.appendForm = function(dom, container, already, subject, form, store, itemDone) {
    return tabulator.panes.utils.fieldFunction(form)(
                dom, container, already, subject, form, store, itemDone);
}

//          Find list of properties for class
//
// Three possible sources: Those mentioned in schemas, which exludes many;
// those which occur in the data we already have, and those predicates we
// have come across anywahere and which are not explicitly excluded from
// being used with this class.
//

tabulator.panes.utils.propertiesForClass = function(kb, c) {
    var ns = tabulator.ns;
    var explicit = kb.each(undefined, ns.rdf('range'), c);
    [ ns.rdfs('comment'), ns.dc('title'), // Generic things
                ns.foaf('name'), ns.foaf('homepage')]
        .map(function(x){explicit.push(x)});
    var members = kb.each(undefined, ns.rdf('type'), c);
    if (members.length > 60) members = members.slice(0,60); // Array supports slice? 
    var used = {};
    for (var i=0; i< (members.length > 60 ? 60 : members.length); i++)
                kb.statementsMatching(members[i], undefined, undefined)
                        .map(function(st){used[st.predicate.uri]=true});
    explicit.map(function(p){used[p.uri]=true});
    var result = [];
    for (var uri in used) result.push(kb.sym(uri));
    return result;
}



// Create entry field for a given property
/*
tabulator.panes.utils.checkProperty = function(kb, pred) {
    var data = undefined, ns = tabulator.ns;
    if (kb.holds(pred, ns.rdfs('range'), ns.owl('DataProperty'))) data = true;
    if (kb.holds(pred, ns.rdfs('range'), ns.owl('ObjectProperty'))) data = false;
    var c = kb.any(pred, ns.rdfs('range'));
    if (c) {
        if (c.uri.slice(0,34) == 'http://www.w3.org/2001/XMLSchema#' ||
        c in { 'http://www.w3.org/2000/01/rdf-schema#Literal': true, 
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral': true}) {
            if (data == false) throw "ObjectProperty has datatype range: "+c.uri; 
            data = true;
        } else {
            data = false; // Assume object then. @@ this is not necessarily true
        }
    }
    return {'data': data, 'range': c};

}

*/
tabulator.panes.utils.findClosest = function findClosest(kb, cla, prop) {
    var agenda = [cla]; // ordered - this is breadth first search
    while (agenda.length > 0) { 
        var c = agenda.shift(); // first
        // if (c.uri && (c.uri == ns.owl('Thing').uri || c.uri == ns.rdf('Resource').uri )) continue
        var lists = kb.each(c, prop);
        tabulator.log.debug("Lists for "+c+", "+prop+": "+lists.length)
        if (lists.length != 0) return lists;
        var supers = kb.each(c, tabulator.ns.rdfs('subClassOf'));
        for (var i=0; i<supers.length; i++) {
            agenda.push(supers[i]);
        }
    }
    
    return [];
}

// Which forms apply to a given subject?

tabulator.panes.utils.formsFor = function(subject) {
    var ns = tabulator.ns;
    var kb = tabulator.kb;

    var t = kb.findTypeURIs(subject);
    var bottom = kb.bottomTypeURIs(t); // most specific
    var forms = []
    for (var b in bottom) {
        // Find the most specific
        forms = forms.concat(tabulator.panes.utils.findClosest(kb, b, ns.ui('creationForm')));
    }
    tabulator.log.debug("formsFor: subject="+subject+", forms=");
    return forms;
}


tabulator.panes.utils.sortBySequence = function(list) {
    var p2 = list.map(function(p) {
        var k = tabulator.kb.any(p, tabulator.ns.ui('sequence'));
        return [k?k:999,p]
    });
    p2.sort();
    return p2.map(function(pair){return pair[1]});
}

tabulator.panes.utils.sortByLabel = function(list) {
    var p2 = list.map(function(p) {return [tabulator.Util.label(p), p]});
    p2.sort();
    return p2.map(function(pair){return pair[1]});
}



// Button to add a new whatever using a form
//
// @param form - optional form , else will look for one
// @param store - optional store else will prompt for one (unimplemented) 

tabulator.panes.utils.newButton = function(dom, kb, subject, predicate, theClass, form, store, callback)  {
    var b = dom.createElement("button");
    b.setAttribute("type", "button");
    b.innerHTML = "New "+tabulator.Util.label(theClass);
    b.addEventListener('click', function(e) {
            b.parentNode.appendChild(tabulator.panes.utils.promptForNew(
                dom, kb, subject, predicate, theClass, form, store, callback));
        }, false);
    return b;
}



//      Prompt for new object of a given class
//
//
// @param dom - the document DOM for the user interface
// @param kb - the graph which is the knowledge base we are working with
// @param subject - a term, Thing this should be linked to when made. Optional.
// @param predicate - a term, the relationship for the subject link. Optional.
// @param theClass - an RDFS class containng the object about which the new information is.
// @param store - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)
// @returns a dom object with the form DOM

tabulator.panes.utils.promptForNew = function(dom, kb, subject, predicate, theClass, form, store, callback) {
    var ns = tabulator.ns
    var box = dom.createElement('form');
    
    if (!form) {
        var lists = tabulator.panes.utils.findClosest(kb, theClass, ns.ui('creationForm'));
        if (lists.length == 0) {
            var p = box.appendChild(dom.createElement('p'));
            p.textContent = "I am sorry, you need to provide information about a "+
                tabulator.Util.label(theClass)+" but I don't know enough information about those to ask you.";
            var b = box.appendChild(dom.createElement('button'));
            b.setAttribute('type', 'button');
            b.innerHTML = "Goto "+tabulator.Util.label(theClass);
            b.addEventListener('click', function(e) {
                tabulator.outline.GotoSubject(theClass, true, undefined, true, undefined);
            }, false);
            return box;
            //throw "Do not know enough about the class "
            //+theClass+" to be able to be able to prompt for information about a new one";
        }
        tabulator.log.debug('lists[0] is '+lists[0]);
        form = lists[0];  // Pick any one
    }
    tabulator.log.debug('form is '+form);
    box.setAttribute('style', 'border: 0.05em solid brown; color: brown');
    box.innerHTML="<h3>New "+ tabulator.Util.label(theClass)
                        + "</h3>";

                        
    var formFunction = tabulator.panes.utils.fieldFunction(form);
    if (!formFunction) throw "No handler for field type: "+b;
    var object = tabulator.panes.utils.newThing(kb, store);
    var itemDone = function(ok, body) {
        if (!ok) return callback(ok, body);
        if (subject) {
            var ins = [$rdf.st(subject, predicate, object, store)];
            tabulator.sparql.update([], ins, linkDone);
        }
    }
    var linkDone = function(uri, ok, body) {
        return callback(ok, body);
    }
    tabulator.log.info("paneUtils Object is "+object)
    formFunction(dom, box, {}, object, form, store, itemDone);
    return box;
}



//      Description text area
//
// Make a box to demand a description or display existing one
//
// @param dom - the document DOM for the user interface
// @param kb - the graph which is the knowledge base we are working with
// @param subject - a term, the subject of the statement(s) being edited.
// @param predicate - a term, the predicate of the statement(s) being edited
// @param storeDoc - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)

tabulator.panes.utils.makeDescription = function(dom, kb, subject, predicate, storeDoc, callback) {
    if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(kb); // @@ Use a common one attached to each fetcher or merge with fetcher
    var group = dom.createElement('div');
    var sts = kb.statementsMatching(subject, predicate,undefined); // Only one please
    if (sts.length > 1) throw "Should not be "+sts.length+" i.e. >1 "+predicate+" of "+subject;
    if (sts.length) {
        if (sts[0].why.sameTerm(storeDoc)) {
            group.appendChild(dom.createTextNode("Note this is stored in "+sts[0].why)); // @@
        }
    }
    var desc = sts.length? sts[0].object.value : undefined;
    var field = dom.createElement('textarea');
    group.appendChild(field);
    field.rows = desc? desc.split('\n').length + 2 : 2;
    field.cols = 80
    field.setAttribute('style', 'font-size:100%; \
            background-color: white; border: 0.07em solid gray; padding: 1em; margin: 1em 2em;')
    if (sts.length) field.value = desc 
    else {
        field.value = tabulator.Util.label(predicate); // Was"enter a description here"
        field.select(); // Select it ready for user input -- doesn't work
    }

    var br = dom.createElement('br');
    group.appendChild(br);
    submit = dom.createElement('input');
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
        tabulator.sparql.update(deletions, insertions,function(uri,ok, body){
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







// Make SELECT element to select options
//
// @param subject - a term, the subject of the statement(s) being edited.
// @param predicate - a term, the predicate of the statement(s) being edited
// @param possible - a list of terms, the possible value the object can take
// @param multiple - Boolean - Whether more than one at a time is allowed 
// @param nullLabel - a string to be displayed as the
//                        option for none selected (for non multiple)
// @param storeDoc - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForOptions = function(dom, kb, subject, predicate,
                possible, multiple, nullLabel, storeDoc, callback) {
    if (!tabulator.sparql) tabulator.sparql = new tabulator.rdf.sparqlUpdate(kb);
    tabulator.log.debug('Select list length now '+ possible.length)
    var n = 0; var uris ={}; // Count them
    for (var i=0; i < possible.length; i++) {
        var sub = possible[i];
        // tabulator.log.warn('Select element: '+ sub)
        if (sub.uri in uris) continue;
        uris[sub.uri] = true; n++;
    } // uris is now the set of possible options
    if (n==0) throw "Can't do selector with no options, subject= "+subject+" possible= "+possible+"."
    
    tabulator.log.debug('makeSelectForOptions: store='+storeDoc);
    var actual = {};
    if (predicate.sameTerm(tabulator.ns.rdf('type'))) actual = kb.findTypeURIs(subject);
    else kb.each(subject, predicate).map(function(x){actual[x.uri] = true});
    
    var onChange = function(e) {
        select.disabled = true; // until data written back - gives user feedback too
        var ds = [], is = [];
        for (var i =0; i< select.options.length; i++) {
            var opt = select.options[i];
            if (!opt.AJAR_uri) continue; // a prompt
            if (opt.selected && !(opt.AJAR_uri in actual)) { // new class
                is.push(new $rdf.Statement(subject,
                    predicate, kb.sym(opt.AJAR_uri),storeDoc ));
            }
            if (!opt.selected && opt.AJAR_uri in actual) {  // old class
                ds.push(new $rdf.Statement(subject,
                    predicate, kb.sym(opt.AJAR_uri), storeDoc ));
            }
            if (opt.selected) select.currentURI =  opt.AJAR_uri;                      
        }
        var sub = select.subSelect;
        while (sub && sub.currentURI) {
            ds.push(new $rdf.Statement(subject,
                    predicate, kb.sym(sub.currentURI), storeDoc));
            sub = sub.subSelect;
        }
        tabulator.sparql.update(ds, is,
            function(uri, ok, body) {
                actual = {}; // refresh
                kb.each(subject, predicate).map(function(x){actual[x.uri] = true});
                if (ok) select.disabled = false; // data written back
                if (callback) callback(ok, body);
            });
    }
    
    var select = dom.createElement('select');
    select.setAttribute('style', 'margin: 0.6em 1.5em;')
    if (multiple) select.setAttribute('multiple', 'true');
    select.currentURI = null;
    for (var uri in uris) {
        var c = kb.sym(uri)
        var option = dom.createElement('option');
        option.appendChild(dom.createTextNode(tabulator.Util.label(c)));
        var backgroundColor = kb.any(c, kb.sym('http://www.w3.org/ns/ui#background-color'));
        if (backgroundColor) option.setAttribute('style', "background-color: "+backgroundColor.value+"; ");
        option.AJAR_uri = uri;
        if (uri in actual) {
            option.setAttribute('selected', 'true')
            select.currentURI = uri;
            //dump("Already in class: "+ uri+"\n")
        }
        select.appendChild(option);
    }
    if ((select.currentURI == null) && !multiple) {
        var prompt = dom.createElement('option');
        prompt.appendChild(dom.createTextNode(nullLabel));
        //dump("prompt option:" + prompt + "\n")
        select.insertBefore(prompt, select.firstChild)
        prompt.selected = true;
    }
    select.addEventListener('change', onChange, false)
    return select;

} // makeSelectForOptions


// Make SELECT element to select subclasses
//
// If there is any disjoint union it will so a mutually exclusive dropdown
// Failing that it will do a multiple selection of subclasses.
// Callback takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForCategory = function(dom, kb, subject, category, storeDoc, callback) {
    var log = tabulator.log;
    var du = kb.any(category, tabulator.ns.owl('disjointUnionOf'));
    var subs;
    var multiple = false;
    if (!du) {
        subs = kb.each(undefined, tabulator.ns.rdfs('subClassOf'), category);
        multiple = true;
    } else {
        subs = du.elements            
    }
    log.debug('Select list length '+ subs.length)
    if (subs.length == 0) throw "Can't do "+ (multiple?"multiple ":"")+"selector with no subclasses of category: "+category;
    if (subs.length == 1) throw "Can't do "+ (multiple?"multiple ":"")+"selector with only 1 subclass of category: "+category+":"+subs[1];
    return tabulator.panes.utils.makeSelectForOptions(dom, kb, subject, tabulator.ns.rdf('type'), subs,
                    multiple, "--classify--", storeDoc, callback);
}

// Make SELECT element to select subclasses recurively
//
// It will so a mutually exclusive dropdown, with another if there are nested 
// disjoint unions.
// Callback takes (boolean ok, string errorBody)

tabulator.panes.utils.makeSelectForNestedCategory = function(
                dom, kb, subject, category, storeDoc, callback) {
    var container = dom.createElement('span'); // Container
    var child = null;
    var select;
    var onChange = function(ok, body) {
        if (ok) update();
        callback(ok, body);
    }
    select = tabulator.panes.utils.makeSelectForCategory(
                dom, kb, subject, category, storeDoc, onChange);
    container.appendChild(select);
    var update = function() {
        // tabulator.log.info("Selected is now: "+select.currentURI);
        if (child) { container.removeChild(child); child = null;}
        if (select.currentURI && kb.any(kb.sym(select.currentURI), tabulator.ns.owl('disjointUnionOf'))) {
            child = tabulator.panes.utils.makeSelectForNestedCategory(
                dom, kb, subject, kb.sym(select.currentURI), storeDoc, callback)
            select.subSelect = child.firstChild;
            container.appendChild(child);
        }
    };
    update();
    return container;
}

	
/*  Build a checkbox from a given statement
** 
**  If the source document is editable, make the checkbox editable
** originally in socialPane
*/
tabulator.panes.utils.buildCheckboxForm = function(doc, kb, lab, statement, state) {
    tabulator.log.debug('why is '+statement.why);
    var f = doc.createElement('form');
    var input = doc.createElement('input');
    f.appendChild(input);
    var tx = doc.createTextNode(lab);
    var editable = tabulator.sparql.editable(statement.why.uri);
    tx.className = 'question';
    f.appendChild(tx);
    input.setAttribute('type', 'checkbox');
    input.checked = state;
    if (!editable) return f;
    
    var boxHandler = function(e) {
        tx.className = 'pendingedit';
        // alert('Should be greyed out')
        if (this.checked) { // Add link
            try {
                outline.UserInput.sparqler.insert_statement(statement, function(uri,success,error_body) {
                    tx.className = 'question';
                    if (!success){
                        prompts.alert(null,"Message","Error occurs while inserting "+statement+'\n\n'+error_body);
                        input.checked = false; //rollback UI
                        return;
                    }
                    kb.add(statement.subject, statement.predicate, statement.object, statement.why);                        
                })
            }catch(e){
                prompts.alert(null,"Message","Data write fails:" + e);
                input.checked = false; //rollback UI
                tx.className = 'question';
            }
        } else { // Remove link
            try {
                outline.UserInput.sparqler.delete_statement(statement, function(uri,success,error_body) {
                    tx.className = 'question';
                    if (!success){
                        prompts.alert(null,"Message","Error occurs while deleting "+statement+'\n\n'+error_body);
                        this.checked = true; // Rollback UI
                    } else {
                        kb.removeMany(statement.subject, statement.predicate, statement.object, statement.why);
                    }
                })
            }catch(e){
                prompts.alert(null,"Message","Delete fails:" + e);
                this.checked = true; // Rollback UI
                return;
            }
        }
    }
    input.addEventListener('click', boxHandler, false);
    return f;
}
  