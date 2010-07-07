var tc0004Passed = true;


var rdfxmlTestCaseBaseURI = "http://www.w3.org/2000/10/rdf-tests/rdfcore/";
var rdfxmlTestCaseDirs = [	"amp-in-url",
							"datatypes"
				 		];


function testTC0004(showDetails) {
	var result = "";
	var expected = "";
	var failStyle = 'style="border: solid 2px red; padding: 1px 2px;"';
	var passStyle = 'style="border: solid 2px green; padding: 1px 2px;"';
	var allResults = "<div><strong>Detailed results:</strong></div>";
	var testTitles = rdfxmlTestCaseDirs;
	var expected =   [	true,
						true
					 ];
	var n = expected.length;
	var i = 0;

	startBusy();
	for(i=0; i < n; i++) {
		allResults += "<h2>" + testTitles[i] + "</h2>";
		var dirParam = new String(testTitles[i]);
		result = eval("test" + i + "()");
		if(result != expected[i]) {
			tc0004Passed = false;
			styleResult =  failStyle;
		}
		else {
			styleResult  =  passStyle;
		}
		allResults += "<p>EXPECTED: <pre>" + expected[i]+ "</pre></p><p>RESULT: <pre " + styleResult +">"+ result + "</pre></p>";
	}
	stopBusy();
	if(showDetails) return allResults;
	else return tc0004Passed;
}

function test0(){
	var dir = rdfxmlTestCaseDirs[0];
	var tests = ["test001"];
	var testCaseURI = rdfxmlTestCaseBaseURI + dir + "/" + tests[0];
	var kbNT = getTestCaseData(testCaseURI, 'text');
	var kbRDFXML = getTestCaseData(testCaseURI, 'xml');
	var allHold = true;

	if(kbNT.statements.length == kbRDFXML.statements.length) { // the two stores have the same number of triples ...
		for(k=0; k < kbNT.statements.length; k++) { // check if each triple in the one store is actually in the other store as well
			var s = kbNT.statements[k].subject;
			var p = kbNT.statements[k].predicate;
			var o = kbNT.statements[k].object;
			var thisStatementHolds =  kbRDFXML.holds(s, p, o, undefined); // NOTE: this doesn't seem to work due to the why-part being different
			if(!thisStatementHolds) allHold = false;
		}
	}
	else {
		return false;
	}
	return allHold;
}

function test1() {
	var dir = rdfxmlTestCaseDirs[1];
    var tests = ["test001","test002"]
	var testCaseURI = rdfxmlTestCaseBaseURI + dir + "/" + tests[0];
	var kbNT = getTestCaseData(testCaseURI, 'text');
	var kbRDFXML = getTestCaseData(testCaseURI, 'xml');

	if (kbNT.statements.length == kbRDFXML.statements.length) {
		return true;
	}
	else {
		return false;
	}

}



// utility functions
function getTestCaseData(testCaseURI, format){
	var kb = new $rdf.IndexedFormula();
	var returnValue = "";
	var why = testCaseURI;
	
	if(format == 'text') {
		testCaseURI += ".nt";
	}
	if(format == 'xml') {
		testCaseURI += ".rdf";
	}
	
	
	$.ajax({
		url: testCaseURI,
		dataType: format,
		async: false,
		success: function(data) {
			if(format == 'text') {
				returnValue = parseN3FromString(testCaseURI, data, kb, why);
				returnValue =  kb;
			}
			if(format == 'xml') {
				var rdfxmlparser = new $rdf.RDFParser(kb);
				rdfxmlparser.reify = true;
				rdfxmlparser.parse(data, testCaseURI, why);
				returnValue =  kb;
			}
		},
		error: function(msg) {
			alert("Error running test: " + msg);
		}
	});
	
	return returnValue;//escapeEntities(returnValue);
}

function parseN3FromString(docURI, data, kb, why){
	var n3Parser = new $rdf.N3Parser(kb, kb, docURI, rdfxmlTestCaseBaseURI, undefined, undefined, undefined, why);
	n3Parser.loadBuf(data);
}

// the following is a rewrite from the old test cases, no used now - using N3Parser instead  

//function parseNTFromString(data, kb) {
//	var buffer = data.split("\n");

//	for (var i = 0; i < buffer.length; i++) {
		// get rid of white spaces, etc:
//		buffer[i] = buffer[i].replace(/\x0a/g,"");
//		buffer[i] = buffer[i].replace(/\x0d/g,"");
//		buffer[i] = buffer[i].replace(/\s*\.\s*$/,"");
//		buffer[i] = buffer[i].replace(/^\s*$/,"");

//		if(buffer[i][0] != "#" && buffer[i].length > 0) { // ignore comments, process each line if there is some content
//			var s, p, o, unesc;
//			unesc = buffer[i].match(/\\u[0-9A-F]{4}/g); // get the unescaped line
//			if(unesc != undefined) { // escape it on char-basis
//				for (var k = 0; k < unesc.length; k++) {
//					buffer[i] = buffer[i].replace(eval("/\\\\u" + unesc[k].slice(2)+"/g"), String.fromCharCode(parseInt(unesc[k].slice(2),16)));
//				}
//			}
//			s = buffer[i].slice(0, buffer[i].indexOf(" "));
//			buffer[i] = buffer[i].slice(buffer[i].indexOf(" ") + 1).replace(/^\s*/, "");
//			p = buffer[i].slice(0, buffer[i].indexOf(" "));
//			o = buffer[i].slice(buffer[i].indexOf(" ") + 1).replace(/^\s*/, "");
//			kb.add(kb.fromNT(s), kb.fromNT(p), kb.fromNT(o));
//		}
//	}
//    return kb;
//}