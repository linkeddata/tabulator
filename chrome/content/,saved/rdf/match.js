// Matching a formula against another formula
//
//
// W3C open source licence 2005.
//

RDFFormula.prototype.statementsMatching = function(s,p,o) {
    fyi("Each looking for "+s+" "+p+","+o)
    var results = []
    var i
    var ls = this.statements.length
    for (i=0; i<ls; i++) {
	var st = this.statements[i]
//	fyi("Each trying: " + st)
	if (RDFTermMatch(p, st.predicate) &&  // first as simplest
	    RDFTermMatch(s, st.subject) &&
	    RDFTermMatch(o, st.object)) {
		results.push(st)
	}
	    
    }
    fyi("   found " + st.length)
    return results
}

RDFFormula.prototype.anyStatementMatching = function(s,p,o) {
    fyi("Any searching "+this.statements.length+" for "+s+" "+p+","+o)
    var ls = this.statements.length
    var i
    for (i=0; i<ls; i++) {
	var st = this.statements[i]
//	fyi("Any trying: " + st)
	if (RDFTermMatch(p, st.predicate) &&  // first as simplest
	    RDFTermMatch(s, st.subject) &&
	    RDFTermMatch(o, st.object)) {
		fyi("    SUCCESS: " + st)
		return st
	}
	    
    }
    fyi("    Failure.")
    return undefined
}

function RDFTermMatch(pattern, term) {
    if (typeof pattern == 'undefined') return true;
    if (pattern.termType != term.termType) return false;
    return pattern.sameTerm(term)
}

// Each of the following ASSUMES that the other term
// is of the same termType.

RDFSymbol.prototype.sameTerm = function(other) {
    return (this.uri == other.uri)
}

RDFBlankNode.prototype.sameTerm = function(other) {
    return (this.id == other.id)
}

RDFLiteral.prototype.sameTerm = function(other) {
    return ((this.value == other.value) &&
	    (this.lang == other.lang) &&
	    (this.datatype == other.datatype));	    
}

//  Comparison for ordering
//
// These compare with ANY term
//
//
// When we smush nodes we take the lowest value. This is not
// arbitrary: we want the value actually used to be the literal
// (or list or formula). 

RDFLiteral.prototype.classOrder = 1
// RDFList.prototype.classOrder = 2
// RDFSet.prototype.classOrder = 3
RDFFormula.prototype.classOrder = 4
RDFSymbol.prototype.classOrder = 5
RDFBlankNode.prototype.classOrder = 6

RDFLiteral.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return -1
    if (this.value < other.value) return -1
    if (this.value > other.value) return -1
} 

RDFSymbol.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return -1
    if (this.uri < other.uri) return -1
    if (this.uri > other.uri) return -1
} 

RDFBlankNode.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return -1
    if (this.id < other.id) return -1
    if (this.id > other.id) return -1
} 


//  Convenience routines

RDFFormula.prototype.each = function(s,p,o) {
    var results = []
    var sts = this.statementsMatching(s,p,o)
    if (typeof s == 'undefined') {
	for (i in sts) results.push(sts[i].subject)
    }
    if (typeof p == 'undefined') {
	for (i in sts) results.push(sts[i].predicate)
    }
    if (typeof o == 'undefined') {
	for (i in sts) results.push(sts[i].object)
    }
    return results
}

RDFFormula.prototype.any = function(s,p,o) {
    var st = this.anyStatementMatching(s,p,o)
    if (typeof st == 'undefined') return undefined
    
    if (typeof s == 'undefined') return st.subject;
    if (typeof p == 'undefined') return st.predicate;
    if (typeof o == 'undefined') return st.object;

    return undefined
}

RDFFormula.prototype.the = function(s,p,o) {
    // the() should contain a check there is only one
    var x = this.any(s,p,o)
    if (typeof st == 'undefined')
	alert("No value found for" + s + " " + p + " " + o + ".")
    return x
}
 
// Not a method. For use in sorts
function RDFComparePredicateObject(self, other) {
    var x = self.predicate.compareTerm(other.predicate)
    if (x !=0) return x
    return self.object.compareTerm(other.object)
}
// ends
