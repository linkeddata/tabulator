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
    var timestamp = ''+ now.getTime();
    // http://www.w3schools.com/jsref/jsref_obj_date.asp
    var issue = kb.sym(store.uri + '#' + 'id'+timestamp);
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
tabulator.panes.field[tabulator.ns.ui('Group').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var box = dom.createElement('div');
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    var parts = kb.each(form, ui('part'));
    if (!parts) throw "No parts to form "+form;
    var p2 = parts.map(function(p) {var k = kb.any(p, ui('sequence')); return [k?k:999,p] });
    p2.sort();
    for (var i=0; i<p2.length; i++) {
        var fn = [p[i][1].uri];
        fn(dom, box, kb, subject, form, store, callback);
    }
    return;
}

/*          Select one or more cases
**
*/
tabulator.panes.field[tabulator.ns.ui('Options').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var box = dom.createElement('div');
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    var property = kb.any(form, ui('property'));
    if (!property) property = tabulator.rdf('type'); // @@ default to type (do we want defaults?)
    var cases = kb.each(form, ui('case'));
    if (!cases) throw "No cases to Options form "+form;
    var value = kb.any(subject, property);
    for (var i=0; i<cases.length; i++) {
        var test = kb.the(cases[i], ui('for'));
        if (test.sameTerm(value)) {
            var field = kb.the(cases[i], ui('use'));
            field(dom, box, kb, subject, field, store, callback);
        }
    }
    return;
}

/*          Multiple similar fields
**
*/
tabulator.panes.field[tabulator.ns.ui('Multiple').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var box = dom.createElement('table');
    var ui = tabulator.ns.ui;
    container.appendChild(box);
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property to multiple: "+form;
    var element = kb.any(form, ui('element'));
    if (!element) throw "No element to multiple: "+form;

    var count = 0;
    // box.appendChild(dom.createElement('h3')).textContents = "Fields:".
    var body = box.appendChild(dom.createElement('tr'));
    var tail = box.appendChild(dom.createElement('tr'));
    var img = tail.appendChild(dom.createElement('img'));
    img.setAttribute('src', tabulator.Icon.src.icon_add_triple); // blue plus
    var addItem = function(e, object) {
        var num = ++count;
        if (!object) object = tabulator.panes.utils.newThing(kb, store);
        var tr = box.insertBefore(dom.createElement('tr'), tail);
        var itemDone = function(ok, body) {
            if (!ok) return callback(ok, body);
            var ins = [$rdf.st(subject, property, object)]
            sparqlService.update([], ins, linkDone)
        }
        var linkDone = function(uri, ok, body) {
            return callback(ok, body);
        }
        var fn = tabulator.panes.field[element.uri];
        if (!fn) throw "In multiple, No support function for element: "+element;
        fn(dom, body, kb, object, form, store, itemDone);
        
    }

    kb.each(subject, property).map(function(obj){addItem(null, obj)}); // @@ sort by sequence numbr

    img.addEventListener('click', addItem, false);
    return box
}

/*          Text field
**
*/

tabulator.panes.field[tabulator.ns.ui('NumericField').uri] = 
tabulator.panes.field[tabulator.ns.ui('TextField').uri] = 
tabulator.panes.field[tabulator.ns.ui('MultiLineTextField').uri] =  // @@@@ For now all the same
tabulator.panes.field[tabulator.ns.ui('SingleLineTextField').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property to text field: "+form;
    var box = tabulator.panes.utils.makeDescription(dom, kb, subject, property, store, callback);
    var ui = tabulator.ns.ui;
    container.appendChild(box);
}

/*          Classifier field
**
**  Nested categories
*/

tabulator.panes.field[tabulator.ns.ui('Classifier').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var category = kb.any(form, ui('category'));
    if (!category) throw "No category for classifier: "+form;
    container.appendChild(tabulator.panes.utils.makeSelectForCategory(dom, kb, subject, category, store, callback));
}

/*          Choice field
**
**  Not nested
**  Alternative implementatons caould be 
** -- pop-up menu
** -- radio buttons
** -- auto-complete typing
*/

tabulator.panes.field[tabulator.ns.ui('Choice').uri] = function(
                                    dom, container, kb, subject, form, store, callback) {
    var property = kb.any(form, ui('property'));
    if (!property) throw "No property for Choce: "+form;
    var from = kb.any(form, ui('from'));
    if (!from) throw "No from for Choce: "+form;
    var possible = kb.each(undefined, tabulator.ns.rdf('type'), from);
    var multiple = false;
    container.appendChild(tabulator.panes.utils.makeSelectForOptions(dom, kb, subject, property,
                possible, multiple, "--"+ tabulator.Util.label(property)+"-?", store, callback));
}

///////////////////////////////////////////////////////////////////////


/*                      General purpose widgets
**
*/

//          Find list of properties for class
//
// Three possible sources: Those mentioned in schemas, which exludes many;
// those which occur in the data we alreadyhave, and those predicates we
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

tabulator.panes.utils.objectEntry = function(dom, kb, pred) {

    var res = tabulator.panes.utils.checkProperty(kb, pred);
    var data = res.data, range = res.range, ns = tabulator.ns;
    if (data == undefined) {
        var container = dom.createElement('div')
        container.setAttribute('style', 'background-color: #ffffcc; border: 0.1em solid gray; ');
        container.appendChild(dom.createElement('p')).textContent =
            "I am sorry, you need to provide a "+
            tabulator.Util.label(pred)+" but I don't know enough information about that property to ask you.";
        var b = container.appendChild(dom.createElement('button'));
        b.setAttribute('type', 'button');
        b.innerHTML = "Goto "+tabulator.Util.label(pred);
        b.addEventListener('click', function(e) {
            tabulator.outline.GotoSubject(pred, true, undefined, true, undefined);
        }, false);
        return container;

        //throw "[paneUtils] Don't know enough about property to input it: "+pred.uri;
    }
    var field = dom.createElement('input');
    field.setAttribute('type','text');
    field.setAttribute('size','100');
    field.setAttribute('maxLength','2048');// No arbitrary limits
    return field;
}

tabulator.panes.utils.findClosest = function findClosest(kb, cla, prop) {
    var agenda = [cla]; // ordered - this is breadth first search
    while (agenda.length > 0) { 
        var c = agenda.shift(); // first
        // if (c.uri && (c.uri == ns.owl('Thing').uri || c.uri == ns.rdf('Resource').uri )) continue
        var lists = kb.each(c, prop);
        tabulator.log.debug("Lists for "+c+", "+prop+": "+lists.length)
        if (lists.length != 0) return lists;
        var supers = kb.each(c, ns.rdfs('subClassOf'));
        for (var i=0; i<supers.length; i++) {
            agenda.push(supers[i]);
        }
    }
    
    return [];
}

tabulator.panes.utils.newButton = function(dom, kb, subject, predicate, theClass, store, callback)  {
    var b = dom.createElement("button");
    b.setAttribute("type", "button");
    b.innerHTML = "New "+tabulator.Util.label(theClass);
    b.addEventListener('click', function(e) {
            b.parentNode.appendChild(tabulator.panes.utils.promptForNew(
                dom, kb, subject, predicate, theClass, store, callback));
        }, false);
    return b;
}

//      Prompt for new object of a given class
//
//
// @param dom - the document DOM for the user interface
// @param kb - the graph which is the knowledge base we are working with
// @param subject - a term, Thing this should be linked to when made.
// @param predicate - a term, the relationship for the subject link.
// @param theClass - an RDFS class containng the object about which the new information is.
// @param store - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)

tabulator.panes.utils.promptForNew1 = function(dom, kb, subject, predicate, theClass, store, callback) {
    var ns = tabulator.ns
    var lists =findClosest(kb, theClass, ns.ui('initialProperties'));
    var form = dom.createElement('form');
    if (lists.length == 0) {
        var p = form.appendChild(dom.createElement('p'));
        p.textContent = "I am sorry, you need to provide information about a "+
            tabulator.Util.label(theClass)+" but I don't know enough information about those to ask you.";
        var b = form.appendChild(dom.createElement('button'));
        b.setAttribute('type', 'button');
        b.innerHTML = "Goto "+tabulator.Util.label(theClass);
        b.addEventListener('click', function(e) {
            tabulator.outline.GotoSubject(theClass, true, undefined, true, undefined);
        }, false);
        return form;
        //throw "Do not know enough about the class "
        //+theClass+" to be able to be able to prompt for information about a new one";
    }
    var props = lists[0].elements;  // Pick any one
    tabulator.log.debug('lists[0] is '+lists[0]);
    tabulator.log.debug('props is '+props);
    form.innerHTML="<h2>Add new "+ tabulator.Util.label(theClass)
                        + "</h2>";
    var table = form.appendChild(dom.createElement('table'))
    var tb = table.appendChild(dom.createElement('tbody'))

    var sendNew = function() {
        sts = [];
        
        var now = new Date();
        var timestamp = ''+ now.getTime();
        // http://www.w3schools.com/jsref/jsref_obj_date.asp
        var item = kb.sym(store.uri + '#' + 'id-'+timestamp);
        sts.push(new $rdf.Statement(subject, predicate, item, store));

        for (var i=0; i<fields.length; i++) {
            fields[i].setAttribute('class','pendingedit');
            fields[i].disabled = true;
            sts.push(new $rdf.Statement(item, props[i], kb.literal(fields[i].value), store));
        }

        sts.push(new $rdf.Statement(item, ns.rdf('type'), theClass, store));

        var sendComplete = function(uri, success, body) {
            if (!success) {
                callback(success, body);
            } else {
                var div = form.parentNode;
                div.removeChild(form);
                callback(success, body);
                //if (div.rerender) rerender(div);
                //tabulator.outline.GotoSubject(issue, true, undefined, true, undefined);
            }
        }
        sparqlService.update([], sts, sendComplete);
    }

    form.addEventListener('submit', sendNew, false)
    form.setAttribute('onsubmit', "function xx(){return false;}");
    var fields = [];
    for (var i=0; i<props.length; i++) {
        var prop = props[i], tr;
        // @@ here could test for prop being a complex form specification.
        tb.appendChild(tr = dom.createElement('tr'))
            .appendChild(dom.createElement('td'))
            .textContent = tabulator.Util.label(prop);
        var field = tabulator.panes.utils.objectEntry(dom, kb,prop)
        tr.appendChild(dom.createElement('tr')).appendChild(field);
        fields.push(field);
    }
    return form;
}


//      Prompt for new object of a given class
//
//
// @param dom - the document DOM for the user interface
// @param kb - the graph which is the knowledge base we are working with
// @param subject - a term, Thing this should be linked to when made.
// @param predicate - a term, the relationship for the subject link.
// @param theClass - an RDFS class containng the object about which the new information is.
// @param store - The web document being edited 
// @param callback - takes (boolean ok, string errorBody)
// @returns a dom object with the form DOM

tabulator.panes.utils.promptForNew2 = function(dom, kb, subject, predicate, theClass, store, callback) {
    var ns = tabulator.ns
    var lists =findClosest(kb, theClass, ns.ui('creationForm'));
    // if (!lists) throw "Can't create a new "+theClass+" as no creationForm.";
    var box = dom.createElement('form');
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
    var form = lists[0];  // Pick any one
    tabulator.log.debug('lists[0] is '+lists[0]);
    tabulator.log.debug('form is '+form);
    box.innerHTML="<h2>Add new "+ tabulator.Util.label(theClass)
                        + "</h2>";

                        
    var ft = kb.findTypeURIs(form);
    var bot = bottomTypeURIs(ft); // most specific
    var bots = []
    for (var b in bot) bots.push(b);
    if (bots.length > 1) throw "Don't expect multiple field types: "+bots;
    b = bots[0];
    formFunction = tabulator.panes.field[b]
    if (!formFunction) throw "No handler for field type: "+b;
    formFunction(dom, box, kb, subject, form, store, callback);
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
    var sparqlService = new tabulator.rdf.sparqlUpdate(kb); // @@ Use a common one attached to each fetcher or merge with fetcher
    var group = dom.createElement('div');
    var sts = kb.statementsMatching(subject, predicate,undefined,storeDoc); // Only one please
    if (sts.length > 1) throw "Should not be "+sts.length+" i.e. >1 "+predicate+" of "+subject;
    var desc = sts.length? sts[0].object.value : undefined;
    var field = dom.createElement('textarea');
    group.appendChild(field);
    field.rows = desc? desc.split('\n').length + 2 : 2;
    field.cols = 80
    field.setAttribute('style', 'font-size:100%; \
            background-color: white; border: 0.07em solid gray; padding: 1em; margin: 1em 2em;')
    if (sts.length) field.value = desc 
    else {
        field.value = "enter a description here"
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
    var sparqlService = new tabulator.rdf.sparqlUpdate(kb);
    tabulator.log.debug('Select list length now '+ possible.length)
    var n = 0; var uris ={}; // Count them
    for (var i=0; i < possible.length; i++) {
        var sub = possible[i];
        // tabulator.log.warn('Select element: '+ sub)
        if (sub.uri in uris) continue;
        uris[sub.uri] = true; n++;
    } // uris is now the set of possible options
    if (n==0) throw "Can't do selector with no options, subject= "+subject+" possible= "+possible+"."
    
    var actual = {};
    kb.each(subject, predicate).map(function(x){actual[x.uri] = true});
    
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
                    predicate, kb.sym(opt.AJAR_uri),storeDoc ));
            }
            if (opt.selected) select.currentURI =  opt.AJAR_uri;                      
        }
        var sub = select.subSelect;
        while (sub && sub.currentURI) {
            ds.push(new $rdf.Statement(subject,
                    predicate, kb.sym(sub.currentURI),storeDoc));
            sub = sub.subSelect;
        }
        sparqlService.update(ds, is,
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
    var types = kb.findTypeURIs(subject);
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
**  If the source document is ediable, make the checkbox editable
** originally in socialPane
*/
tabulator.panes.utils.buildCheckboxForm = function(doc, kb, lab, statement, state) {
    var f = doc.createElement('form');
    var input = doc.createElement('input');
    f.appendChild(input);
    var tx = doc.createTextNode(lab);
    var editable = outline.UserInput.updateService.editMethod(
        kb.sym(tabulator.rdf.Util.uri.docpart(statement.why.uri)), kb);
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
  