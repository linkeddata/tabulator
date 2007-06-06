function TestStore() {
    this.bn = 97 // 'a'
    this.triples = []
    this.collections = {}
    this.sym = function (uri) {
        return {val: uri, type: "sym"}
    }
    this.collection = function () {
        var store = this
	var c = new Object()
	c.val = this.bn++
	c.type = "collection"
	c.elements = []
	c.append = function (el) { this.elements[this.elements.length]=el }
	c.close = function () {
	    var rdfns = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	    if (this.elements.length == 0) {
	        store.add(this,store.sym(rdfns+"first"),store.sym(rdfns+"nil"))
		return
	    }
	    var cn = this
	    store.add(cn,store.sym(rdfns+"first"),this.elements[0])
	    for (var x=1; x<this.elements.length; x++) {
	        var nn = store.bnode()
		store.add(cn,store.sym(rdfns+"rest"),nn)
		cn = nn
	        store.add(cn,store.sym(rdfns+"first"),this.elements[x])
	    }
	    store.add(cn,store.sym(rdfns+"rest"),store.sym(rdfns+"nil"))
	}
	return c
    }
    this.bnode = function () {
        return {val: this.bn++, type: "bnode"}
    }
    this.literal = function (val, lang, type) {
        return {val: val, datatype: type, type: "literal", lang: lang}
    }
    this.add = function (s,p,o,w) {
	if (o.type == "literal" && o.datatype
	    == "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral") {
	    var val = ""
	    var xmls = new XMLSerializer()
	    for (var x=0; x < o.val.childNodes.length; x++) {
	        val += xmls.serializeToString(o.val.childNodes[x])
	    }
	    o.val = val
	}
        if (s.type == "bnode" || s.type == "collection") {
	    s = "_:"+String.fromCharCode(s.val)
	}
	else {
	    s = "<"+s.val+">"
	}
	s += " <" + p.val + "> "
        if (o.type == "literal") {
            s += "\"" + o.val + "\""
            if (o.datatype != "") { s += "^^<"+o.datatype+">" }
	    if (o.lang != "") { s += "@"+o.lang }
        }
	else if (o.type == "bnode" || o.type == "collection") {
	    s += "_:"+String.fromCharCode(o.val)
	}
        else {
            s += "<" + o.val + ">"
        }
        this.triples[this.triples.length] = s + " ."
    }
}

function finishBenchmark(tbl) {
    function sum (arr) {
	var s = 0
	for (var x=0;x<arr.length;x++) {
	    s+=arr[x]
	}
	return s
    }
    tbl.setAttribute("bench:runNum",
		     parseInt(tbl.getAttribute("bench:runNum"))+1)
    var mean = sum(speed)/speed.length
    var diffsq = sum(map(function (x) { return (mean-x)*(mean-x) },speed))
    var stddev = Math.sqrt(diffsq/speed.length)
    document.getElementById('stat').textContent = mean + ", " + stddev
}

function reportResults(tbl,iternum,results) {
    var row = document.createElement('tr')
    var lbl = document.createElement('td')
    var p = document.createElement('td')
    lbl.appendChild(document.createTextNode(iternum))
    row.appendChild(lbl)
    p.appendChild(document.createTextNode(results['speed']
					  +", "
					  +results['triples'].length))
    p.onclick = function () { alert(results['triples'].join("\n")) }
    row.appendChild(p)
    tbl.appendChild(row)
}

function runBenchmark(tbl,file,reportFunc,doneFunc) {
    var run = function () {
	var s = new TestStore()
	var p = new RDFParser(s)
	p.reify = p.forceRDF = true
	var d = dom.cloneNode(true)
	var begin, v
	var x = tbl.getAttribute("bench:runNum")
	begin = new Date().getTime()
	p.parse(d,"http://example.com/")
	v = new Date().getTime() - begin
	reportFunc(tbl,x,{'triples': s.triples, 'speed': v})
	speed[speed.length] = v
	if (x < 25) { setTimeout(run,0) }
	if (x = 25) { doneFunc(tbl) }
    }
    var xhr = XMLHTTPFactory()
    xhr.open("GET",file, false)
    xhr.send("")
    var dom = xhr.responseXML.documentElement
    run()
}

function setupBenchmark() {
    speed = []
    var file = document.getElementById('fileTxt')
    var run = document.getElementById('runBtn')
    var tbl = document.getElementById('perfTable')
    tbl.setAttribute("bench:runNum","1")
    run.onclick = function (e) { runBenchmark(tbl,
					      file.value,
					      reportResults,
					      finishBenchmark) }
}

window.onload = setupBenchmark

function fyi() {}
function tdebug() {}
function twarn() {}
function terror() {}





