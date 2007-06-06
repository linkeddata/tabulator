/////////////////// tests
//
// See  ../rdf/*.js and identity-test-doc.html

kb = new RDFIndexedFormula()

rdf = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
rdfs = Namespace("http://www.w3.org/2000/01/rdf-schema#")
owl = Namespace("http://www.w3.org/2002/07/owl#")
foaf = Namespace("http://xmlns.com/foaf/0.1/")
ex = Namespace("http://example/com/#")
dc = Namespace("http://purl.org/dc/elements/1.1/")
contact = Namespace("http://www.w3.org/2000/10/swap/pim/contact#")


function test1(){
    x = new RDFSymbol("http://example.com/x")
    fyi("x = " + x + " type= " + typeof x)
    kb.add(kb.sym("http://example.com/who#fty"), foaf("name"), "fred")
}

function test2(){
    x = new RDFBlankNode
    fyi("x = " + x + " type= " + typeof x)
    kb.add(x, foaf("firstname"), "Augustus")
}

function test3(){
    kb.add(kb.sym("http://example.com/"), kb.sym("example:name"), "foo")
    var y = kb.any(kb.sym("http://example.com/"), kb.sym("example:name"))
    fyi("Found y=" + y)

    y = kb.any(kb.sym("http://example.com/kajsdfh"), kb.sym("example:name"))
    fyi("Looked for wrong thing, should be undefined Found y=" + y)

    y = kb.statementsMatching(kb.sym("http://example.com/"))
    fyi("Statements matching subject:")
    for (st in y) fyi("   "+st);

}

function test_equals() {
    var kb = new RDFIndexedFormula()
    kb.add(ex('John'), ex('hairColor'), 'Yellow')
    kb.add(ex('Jack'), ex('eyeColor'), 'Green')
    kb.add(ex('John'), owl('sameAs'), ex('Jack'))
    var y = kb.the(ex('John'), ex('eyeColor'))
    fyi("John's eye color "+y)
    if (!y || y.value != 'Green') {
	fyi("****** Test failed: "+y+" should be Green")
	return false;
    }
    fyi("test_equals passed")
    return true
}

function test_IFP1() {
    var kb = new RDFIndexedFormula()
    kb.add(ex('ssn'), rdf('type'), owl('InverseFunctionalProperty'))
    kb.add(ex('Fred'), ex('ssn'), '1234')
    kb.add(ex('Jack'), ex('ssn'), '1234')
    kb.add(ex('Jack'), ex('eyeColor'), 'Green')
    var y = kb.the(ex('Fred'), ex('eyeColor'))
    fyi("Fred's eye color "+y)
    if (!y || y.value != 'Green') {
	fyi("**** Test failed: "+y+" should be Green")
	return false
    }
    else fyi("test_IFP1 passed")
    return true
}

function test_IFP2() {
    var kb = new RDFIndexedFormula()
    kb.add(ex('Fred'), ex('ssn'), '1234')
    kb.add(ex('Jack'), ex('ssn'), '1234')
    kb.add(ex('Jack'), ex('eyeColor'), 'Green')
    kb.add(ex('ssn'), rdf('type'), owl('InverseFunctionalProperty'))
    var y = kb.the(ex('Fred'), ex('eyeColor'))
    fyi("Fred's eye color "+y)
    if  (!y || y.value != 'Green') {
	fyi("*** Test failed: "+y+" should be Green")
	return false
    }
    else fyi("test_IFP2 passed")
    return true
}

function test_FP1() {
    var kb = new RDFIndexedFormula()
    kb.add(ex('mother'), rdf('type'), owl('FunctionalProperty'))
    kb.add(ex('Fred'), ex('mother'), ex('Bess'))
    var mom = kb.bnode()
    kb.add(ex('Fred'), ex('mother'), mom)
    kb.add(mom, ex('height'), '1.7')
    var y = kb.the(ex('Bess'), ex('height'))
    fyi("Bess's height "+y)
    if (!y || y.value != '1.7') {
	fyi("*** Test failed: "+y+" should be 1.7")
	return false
    }
    fyi("Passed FP1 test") 
    return true
}

function test_FP2() {
    var F = new RDFIndexedFormula()
    F.add(ex('Fred'), ex('mother'), ex('Bess'))
    var mom = F.bnode()
    F.add(ex('Fred'), ex('mother'), mom)
    F.add(mom, ex('height'), '1.7')
    F.add(ex('mother'), rdf('type'), owl('FunctionalProperty'))
    var y = F.the(ex('Bess'), ex('height'))
    fyi("Bess's height "+y)
    if (!y || y.value != '1.7') {
	fyi("*** Test failed: "+y+" should be 1.7")
	return false
    }
    fyi("Passed FP2 test")
    return true
}

function test_all() {
    var ok = true
    if (test_equals()
     && test_IFP1()
     && test_IFP2() && test_FP1() && test_FP2()) {
	fyi("Tests passed.")
	return true
    }
    return false
    
}

// _____________________________________ logging stuff

function fyi_orig(str)
{
    var x = document.getElementById('status');
    if (!x) return;
    var y = x.innerHTML; // Bug in Safari 2.0.1: < characters not escaped!
    var str2 = str
    str2 = str2.replace(/&/g, '&amp;')  // encode for XML
    str2 = str2.replace(/</g, '&lt;')
    alert("New:\n"+str2+"\nOld:\n"+y)
    x.innerHTML = y + str2 + "<br/>";
}

function fyi(str)
{
    var x = document.getElementById('status');
    if (!x) return;
    var y = x.innerHTML;
    var str2 = str
    str2 = str2.replace(/&/g, '&amp;')  // encode for XML
    str2 = str2.replace(/</g, '&lt;')
    var addendum = document.createElement("SPAN")
    x.appendChild(addendum)
    addendum.innerHTML = str2 + "<br/>";
}


function dumpStore() {
    fyi("\nStore:\n" + kb.toNT() + "\n__________\n")
}

function test() {
    test1()
    test2()
    dumpStore()
    // can we handle quotes in strings?
    kb.add(kb.sym("http://example.com/who#fty"), foaf("nick"), "Fred \"Nifty\" Yardley")
}

