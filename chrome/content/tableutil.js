function Namespace(nsuri) {
    return function(ln) { return new RDFSymbol(nsuri+ln) }
}

foaf = Namespace("http://xmlns.com/foaf/0.1/")
RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")
dc = Namespace("http://purl.org/dc/elements/1.1/")
rss = Namespace("http://purl.org/rss/1.0/")
contact = Namespace("http://www.w3.org/2000/10/swap/pim/contact#")

LanguagePreference="en";

labelPriority = []
labelPriority[foaf('name').uri] = 10
labelPriority[dc('title').uri] = 8
labelPriority[rss('title').uri] = 6   // = dc:title?
labelPriority[contact('fullName').uri] = 4
labelPriority['http://www.w3.org/2001/04/roadmap/org#name'] = 4
labelPriority[foaf('nick').uri] = 3
labelPriority[RDFS('label').uri] = 2

function RDFSymbol_toNT(x) {
    return ("<" + x.uri + ">")
}

function toNT() {
    return RDFSymbol_toNT(this)
}

function RDFSymbol(uri) {
    this.uri = uri
    return this
}
RDFSymbol.prototype.sameTerm = function(other) {
    if (!other) { return false }
    return ((this.termType == other.termType) && (this.uri == other.uri))
}

RDFSymbol.prototype.compareTerm = function(other) {
    if (this.classOrder < other.classOrder) return -1
    if (this.classOrder > other.classOrder) return +1
    if (this.uri < other.uri) return -1
    if (this.uri > other.uri) return +1
    return 0
}

RDFSymbol.prototype.termType = 'symbol'
RDFSymbol.prototype.toString = toNT
RDFSymbol.prototype.toNT = toNT
RDFSymbol.prototype.hashString = RDFSymbol.prototype.toNT;
RDFSymbol.prototype.isVar = 0;
RDFSymbol.prototype.classOrder = 5

//  Some precalculaued symbols

RDFSymbol.prototype.XSDboolean = new RDFSymbol('http://www.w3.org/2001/XMLSchema#boolean');
RDFSymbol.prototype.integer = new RDFSymbol('http://www.w3.org/2001/XMLSchema#integer');