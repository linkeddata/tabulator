// These are the classes corresponding to the RDF and N3 data models
//
// Designed to look like rdflib and cwm designs.
//
// Issues: Should the names start with RDF to make them
//      unique as program-wide symbols?
//
// W3C open source licence 2005.
//

//	Symbol

$rdf.Empty = function() {
	return this;
};

$rdf.Empty.prototype.termType = 'empty';
$rdf.Empty.prototype.toString = function () { return "()" };
$rdf.Empty.prototype.toNT = function () { return "@@" };

$rdf.Symbol = function( uri ) {
    this.uri = uri;
    this.value = uri;   // -- why? -tim
    return this;
}

$rdf.Symbol.prototype.termType = 'symbol';
$rdf.Symbol.prototype.toString = function () { return ("<" + this.uri + ">"); };
$rdf.Symbol.prototype.toNT = $rdf.Symbol.prototype.toString;

//  Some precalculated symbols
$rdf.Symbol.prototype.XSDboolean = new $rdf.Symbol('http://www.w3.org/2001/XMLSchema#boolean');
$rdf.Symbol.prototype.XSDdateTime = new $rdf.Symbol('http://www.w3.org/2001/XMLSchema#dateTime');
$rdf.Symbol.prototype.integer = new $rdf.Symbol('http://www.w3.org/2001/XMLSchema#integer');

//	Blank Node

if (typeof $rdf.NextId != 'undefined') {
    $rdf.log.error('Attempt to re-zero existing blank node id counter at '+$rdf.NextId);
} else {
    $rdf.NextId = 0;  // Global genid
}
$rdf.NTAnonymousNodePrefix = "_:n";

$rdf.BlankNode = function ( id ) {
    /*if (id)
    	this.id = id;
    else*/
    this.id = $rdf.NextId++
    this.value = id ? id : this.id.toString();
    return this
};

$rdf.BlankNode.prototype.termType = 'bnode';
$rdf.BlankNode.prototype.toNT = function() {
    return $rdf.NTAnonymousNodePrefix + this.id
};
$rdf.BlankNode.prototype.toString = $rdf.BlankNode.prototype.toNT;

//	Literal

$rdf.Literal = function (value, lang, datatype) {
    this.value = value
    if (lang == "" || lang == null) this.lang = undefined;
    else this.lang = lang;	  // string
    if (datatype == null) this.datatype = undefined;
    else this.datatype = datatype;  // term
    return this;
}

$rdf.Literal.prototype.termType = 'literal'    
$rdf.Literal.prototype.toString = function() {
    return ''+this.value;
};
$rdf.Literal.prototype.toNT = function() {
    var str = this.value
    if (typeof str != 'string') {
        if (typeof str == 'number') return ''+str;
	throw Error("Value of RDF literal is not string: "+str)
    }
    str = str.replace(/\\/g, '\\\\');  // escape
    str = str.replace(/\"/g, '\\"');
    str = '"' + str + '"'  //';

    if (this.datatype){
        str = str + '^^' + this.datatype.toNT()
    }
    if (this.lang) {
        str = str + "@" + this.lang;
    }
    return str;
};

$rdf.Collection = function() {
    this.id = $rdf.NextId++;  // Why need an id? For hashstring.
    this.elements = [];
    this.closed = false;
};

$rdf.Collection.prototype.termType = 'collection';

$rdf.Collection.prototype.toNT = function() {
    return $rdf.NTAnonymousNodePrefix + this.id
};

$rdf.Collection.prototype.toString = $rdf.Collection.prototype.toNT ;

$rdf.Collection.prototype.append = function (el) {
    this.elements.push(el)
}
$rdf.Collection.prototype.unshift=function(el){
    this.elements.unshift(el);
}
$rdf.Collection.prototype.shift=function(){
    return this.elements.shift();
}
        
$rdf.Collection.prototype.close = function () {
    this.closed = true
}


//      Convert Javascript representation to RDF term object
//
$rdf.term = function(val) {
    if (typeof val == 'object')
        if (val instanceof Date) return new $rdf.Literal(
            ''+val.getUTCFullYear()+'-'+(val.getUTCMonth()+1)+'-'+val.getUTCDate()+
            'T'+val.getUTCHours()+':'+val.getUTCMinutes()+':'+val.getUTCSeconds()+'Z',
            undefined, $rdf.Symbol.prototype.XSDdateTime);
        else return val;
    if (typeof val == 'string') return new $rdf.Literal(val);
    if (typeof val == 'number') return new $rdf.Literal(val); // @@ differet types
    if (typeof val == 'boolean') return new $rdf.Literal(val?"1":"0", undefined, 
                                                       $rdf.Symbol.prototype.XSDboolean);
    if (typeof val == 'undefined') return undefined;
    throw ("Can't make term from " + val + " of type " + typeof val);
}

//	Statement
//
//  This is a triple with an optional reason.
//
//   The reason can point to provenece or inference
//

$rdf.Statement = function(subject, predicate, object, why) {
    this.subject = $rdf.term(subject)
    this.predicate = $rdf.term(predicate)
    this.object = $rdf.term(object)
    if (typeof why !='undefined') {
        this.why = why;
    }
    return this;
}

$rdf.Statement.prototype.toNT = function() {
    return (this.subject.toNT() + " "
            + this.predicate.toNT() + " "
            +  this.object.toNT() +" .");
};

$rdf.Statement.prototype.toString = $rdf.Statement.prototype.toNT;

//	Formula
//
//	Set of statements.

$rdf.Formula = function() {
    this.statements = []
    this.constraints = []
    this.initBindings = []
    this.optional = []
    this.superFormula = null;
    return this;
};


$rdf.Formula.prototype.termType = 'formula';
$rdf.Formula.prototype.toNT = function() {
    return "{" + this.statements.join('\n') + "}"
};
$rdf.Formula.prototype.toString = $rdf.Formula.prototype.toNT;

$rdf.Formula.prototype.add = function(subj, pred, obj, why) {
    this.statements.push(new $rdf.Statement(subj, pred, obj, why))
}

// Convenience methods on a formula allow the creation of new RDF terms:

$rdf.Formula.prototype.sym = function(uri,name) {
    if (name != null) {
        if (!$rdf.ns[uri]) throw 'The prefix "'+uri+'" is not set in the API';
        uri = $rdf.ns[uri] + name
    }
    return new $rdf.Symbol(uri)
}

$rdf.Formula.prototype.literal = function(val, lang, dt) {
    return new $rdf.Literal(val.toString(), lang, dt)
}

$rdf.Formula.prototype.bnode = function(id) {
    return new $rdf.BlankNode(id)
}

$rdf.Formula.prototype.formula = function() {
    return new $rdf.Formula()
}

$rdf.Formula.prototype.collection = function () { // obsolete
    return new $rdf.Collection()
}

$rdf.Formula.prototype.list = function (values) {
    li = new $rdf.Collection();
    if (values) {
        for(var i = 0; i<values.length; i++) {
            li.append(values[i]);
        }
    }
    return li;
}
/*  I'm not sure where this came from but I'm taking it out
as it isn't something we need in the library. Suspect unused. - tim

$rdf.Formula.instances={};
$rdf.Formula.prototype.registerFormula = function(accesskey){
    var superFormula = this.superFormula || this;
    $rdf.Formula.instances[accesskey] = this;
    var formulaTerm = superFormula.bnode();
    superFormula.add(formulaTerm, this.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),superFormula.sym("http://www.w3.org/2000/10/swap/log#Formula"));
    superFormula.add(formulaTerm, this.sym("http://xmlns.com/foaf/0.1/name"), superFormula.literal(accesskey));
    superFormula.add(formulaTerm, this.sym("http://www.w3.org/2007/ont/link#accesskey"), superFormula.literal(accesskey));
}
*/

/*  Variable
**
** Variables are placeholders used in patterns to be matched.
** In cwm they are symbols which are the formula's list of quantified variables.
** In sparl they are not visibily URIs.  Here we compromise, by having
** a common special base URI for variables.
*/

$rdf.Variable = function(rel) {
    this.base = "varid:"; // We deem variabe x to be the symbol varid:x 
    this.uri = $rdf.Util.uri.join(rel, this.base);
    return this;
}

$rdf.Variable.prototype.termType = 'variable';
$rdf.Variable.prototype.toNT = function() {
    if (this.uri.slice(0, this.base.length) == this.base) {
	return '?'+ this.uri.slice(this.base.length);} // @@ poor man's refTo
    return '?' + this.uri;
};

$rdf.Variable.prototype.toString = $rdf.Variable.prototype.toNT;
$rdf.Variable.prototype.classOrder = 7;

$rdf.Formula.prototype.variable = function(name) {
    return new $rdf.Variable(name);
};

$rdf.Variable.prototype.hashString = $rdf.Variable.prototype.toNT;


// The namespace function generator 

$rdf.Namespace = function (nsuri) {
    return function(ln) { return new $rdf.Symbol(nsuri+(ln===undefined?'':ln)) }
}

$rdf.Formula.prototype.ns = function(nsuri) {
    return function(ln) { return new $rdf.Symbol(nsuri+(ln===undefined?'':ln)) }
}


// Parse a single token
//
// The bnode bit should not be used on program-external values; designed
// for internal work such as storing a bnode id in an HTML attribute.
// Not coded for literals.

$rdf.Formula.prototype.fromNT = function(str) {
    var len = str.length
    var ch = str.slice(0,1)
    if (ch == '<') return this.sym(str.slice(1,len-1))
    if (ch == '"') return this.literal(str.slice(1,len-1)) // @@ does not lang ot datatype or encoding -- used for URIs ONLY
    if (ch == '_') {
	var x = new $rdf.BlankNode();
	x.id = parseInt(str.slice(3));
	$rdf.NextId--
	return x
    }
    if (ch == '?') {
        var x = new $rdf.Variable(str.slice(1));
        return x;
    }
    throw "Can't convert from NT: "+str;
    
}

// ends
