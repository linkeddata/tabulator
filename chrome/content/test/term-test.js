/////////////////// tests
//
// See  term.js and test..html

kb = new RDFFormula()

foaf = Namespace("http://xmlns.com/foaf/0.1/")

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
    for st in y:
	fyi("   "+st)

}

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

