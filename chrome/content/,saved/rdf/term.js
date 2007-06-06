// These are the classes corresponding to the RDF and N3 data models
//
// Designed to look like rdflib and cwm designs.
//
// Issues: Should the names start with RDF to make them
//          unique as program-wide symbols?
//
// W3C open source licence 2005.
//



function intern(val) {
//    fyi("Interning " + val)
    if (typeof val == 'object') return val;
    if (typeof val == 'string') return new RDFLiteral(val);
    if (typeof val == 'undefined') return undefined;
    alert("Can't intern " + val + " of type " + typeof val)
}

//	Symbol

function RDFSymbol_toNT(x) {
    return ("<" + x.uri + ">")
}

function toNT() {
    return ("<" + this.uri + ">")
}

function RDFSymbol(uri) {
    this.uri = uri
    return this
}
    
RDFSymbol.prototype.termType = 'symbol'
RDFSymbol.prototype.toString = toNT
RDFSymbol.prototype.toNT = toNT


//	Blank Node

var RDFNextId = 0;  // Gobal genid
RDFGenidPrefix = "genid:"
NTAnonymousNodePrefix = "_:n"

function RDFBlankNode() {
    this.id = RDFNextId++
    return this
}

RDFBlankNode.prototype.termType = 'bnode'

RDFBlankNode.prototype.toNT = function() {
    return NTAnonymousNodePrefix + this.id
}
RDFBlankNode.prototype.toString = RDFBlankNode.prototype.toNT    
    
//	Literal

function RDFLiteral(value, lang, datatype) {
    this.value = value
    this.lang=lang;	    // string
    this.datatype=datatype;  // term
    this.toString = RDFLiteral_toNT
    this.toNT = RDFLiteral_toNT
    return this
}

RDFLiteral.prototype.termType = 'literal'

function RDFLiteral_toNT() {
    var str = this.value
    if (typeof str != 'string') alert("Not string: "+str)
    str = str.replace(/\\/g, '\\\\');  // escape
    str = str.replace(/"/g, '\\"');  // '
    
    str = '"' + str + '"'
    if (this.datatype){
	str = str + '^^' + this.datatype.toNT
    }
    if (this.lang) {
	str = str + "@" + this.lang
    }
    return str
}

function RDFLiteralToString() {
    return this.value
}

RDFLiteral.prototype.toString = RDFLiteralToString     
RDFLiteral.prototype.toNT = RDFLiteral_toNT

//	Statement
//
//  This is a triple with an optional reason.
//
//   The reason can point to provenece or inference
//
function RDFStatement_toNT() {
    return (this.subject.toNT() + " "
		+ this.predicate.toNT() + " "
		+  this.object.toNT() +".")
}

function RDFStatement(subject, predicate, object, reason) {
    this.subject = intern(subject)
    this.predicate = intern(predicate)
    this.object = intern(object)
    if (typeof reason !='undefined') this.reason = reason
    return this
}

RDFStatement.prototype.toNT = RDFStatement_toNT
RDFStatement.prototype.toString = RDFStatement_toNT     

//	Formula
//
//	Set of statements.

function RDFFormula() {
    this.statements = []
    this.universals = []
    this.existentials = [] // unused till N3
    return this
}

function RDFFormula_toNT() {
    var str = "# " + this.statements.length + " stmts\n"
    var n = this.statements.length
    for (i=0; i<n; i++) {
	var st = this.statements[i]
	str = str + (" " + i + ")" + st + "\n")
    }
    return str
}

RDFFormula.prototype.termType = 'formula'
RDFFormula.prototype.toNT = RDFFormula_toNT
RDFFormula.prototype.toString = RDFFormula_toNT     

RDFFormula.prototype.addStatement = function(st) {
    this.statements.push(st)
}

RDFFormula.prototype.add = function(s, p, o) {
    var st = new RDFStatement(s, p, o, this)
//    fyi("Adding: "+ st)
    this.statements.push(st)
//    fyi("Added, now length ="+ this.statements.length)
}

// Convenience methods on a formula allow the creation of new RDF terms:

RDFFormula.prototype.sym = function(uri) {
    return new RDFSymbol(uri)
}

RDFFormula.prototype.literal = function(val, lang, dt) {
    return new RDFLiteral(val, lang, dt)
}

RDFFormula.prototype.bnode = function() {
    return new RDFBlankNode()
}

RDFFormula.prototype.formula = function() {
    return new RDFFormula()
}


// The namespace function generator 

function Namespace(nsuri) {
    return function(ln) { return new RDFSymbol(nsuri+ln) }
}

// Parse a single token
//
// The bnode bit should not be used on program-external values; designed
// for internal work such as storing a bnode id in an HTML attribute.

RDFFormula.prototype.fromNT = function(str) {
    var len = str.length
    var x
    if (str[0] == '<') return kb.sym(str.slice(1,len-1))
    if (str[0] == '_') {
	x = new RDFBlankNode()
	x.id = parseInt(str.slice(3))
	RDFNextId--
	return x
    }
    alert("Can't convert from NT: "+str)
}

// ends
