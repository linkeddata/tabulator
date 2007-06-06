//  Testing URI-specific functions
//
//	See RFC 2386
//
// This is or was   http://www.w3.org/2005/10/ajaw/rdf/uri.js
// 2005 W3C open source licence
//
//
//  Take a URI given in relative or absolute form and a base
//  URI, and return an absolute URI
//
//  See also http://www.w3.org/2000/10/swap/uripath.py
//

var kb = new RDFIndexedFormula()  // This uses indexing and smushing

function escapeForXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

logging = 1
ex = Namespace("http://example/com/#")

function fyi(str)
{
    if (!logging) return
    var x = document.getElementById('status');
    if (!x) return;

    var addendum = document.createElement("SPAN")
    x.appendChild(addendum)
    addendum.innerHTML = escapeForXML(str) + "<br/>";
}

function formulaTable(f) {
    var i, n, st
    str = '<table border="0">'
    for (i=0; i<f.statements.length; i++)  {
	st = f.statements[i]
	str+= '<tr>'
	str+= '<td>' + escapeForXML(st.subject.toNT()) + '</td>'
	str+= '<td>' + escapeForXML(st.predicate.toNT()) + '</td>'
	str+= '<td>' + escapeForXML(st.object.toNT()) + '</td>'
	str+= '</tr>'
    }
    return str + '</table>'
}

function solutionsTable(nbs) {
    var i, n=nbs.length, str, v, b
    str = '<table border="0" width="100%">'
    for (i=0; i<n; i++) {
	str += '<tr border="1">'
	b = nbs[i][0]
	for (v in b) {
	    str += '<td>'+ escapeForXML(v)+' -> '+
		    escapeForXML(b[v].toNT()) + '</td>'
	}
	str += '</tr>'
    }
    return str + '</table>'
}

function resutltTR(title, f,g,nbs) {
    var i, n=nbs.length,b, v
    var str = '<tr><td>' + escapeForXML(title) + '</td>' +
	    '<td>' + formulaTable(f) + '</td>' +
	    '<td>' + formulaTable(g) + '</td>' +
	    '<td>'+ solutionsTable(nbs)+'</td>';

    str += '</tr>'
    return str
}

function test() {
    var str = '<table border="1">'

    var k = new RDFIndexedFormula()
    k.add(ex('a'), ex('color'), 'Blue')
    k.add(ex('a'), ex('size'), 'large')
    k.add(ex('b'), ex('color'), 'Red')
    k.add(ex('b'), ex('size'), 'large')
    
    vx = k.variable('x')
    vy = k.variable('y')
    vz = k.variable('z')
    
    var q = new RDFIndexedFormula()
    q.add(vx, ex('size'), 'large')
    str += resutltTR("What is size large?", k, q, k.query(q))    

    q = new RDFIndexedFormula()
    q.add(vx, ex('size'), vy)
    q.add(vz, ex('size'), vy)
    str += resutltTR("What are the same size?", k, q, k.query(q))    

    // Same thing with blank node for data binding not needed
    q = new RDFIndexedFormula()
    bn = q.bnode()
    q.add(vx, ex('size'), bn)
    q.add(vz, ex('size'), bn)
    str += resutltTR("What are the same size? (using bnodes)", k, q, k.query(q))    

    q = new RDFIndexedFormula()
    q.add(vy, ex('color'), vx)
    q.add(vy, ex('size'), "large")
    str += resutltTR("What colors in large?", k, q, k.query(q))    

    // Same thing with blank node for data binding not needed
    q = new RDFIndexedFormula()
    q.add(bn, ex('color'), vx)
    q.add(bn, ex('size'), "large")
    str += resutltTR("What colors in large? (using bnodes)", k, q, k.query(q))    

    q = new RDFIndexedFormula()
    q.add(vy, ex('color'), vx)
    q.add(vy, ex('size'), "medium")
    str += resutltTR("What colors in medium? (none)", k, q, k.query(q))    


    str += '</table>'
    return str

} // test


//ends
