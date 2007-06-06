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


function testCanon() {
    var canonCases = [
	[ "http://example.com/foo bar", 'http://example.com/foo%20bar'],
	[ 'fran%c3%83%c2%a7ois' , 'fran%C3%83%C2%A7ois'  ],
	[ 'a', 'a' ],
	[ '%4e' , 'N' ],
	[  '%9d', '%9D' ],
	[  '%2f', '%2F'  ],
	[  '%2F', '%2F' ],
    ];

}

function test() {
    var testCases = [["foo:xyz", "bar:abc", "bar:abc"],
                 ['http://example/x/y/z', 'http://example/x/abc', '../abc'],
                 ['http://example2/x/y/z', 'http://example/x/abc', 'http://example/x/abc'],
                 ['http://ex/x/y/z', 'http://ex/x/r', '../r'],
                 //             ['http://ex/x/y/z', 'http://ex/r', '../../r'],    // DanC had this.
                 ['http://ex/x/y', 'http://ex/x/q/r', 'q/r'],
                 ['http://ex/x/y', 'http://ex/x/q/r#s', 'q/r#s'],
                 ['http://ex/x/y', 'http://ex/x/q/r#s/t', 'q/r#s/t'],
                 ['http://ex/x/y', 'ftp://ex/x/q/r', 'ftp://ex/x/q/r'],
                 ['http://ex/x/y', 'http://ex/x/y', ''],
                 ['http://ex/x/y/', 'http://ex/x/y/', ''],
                 ['http://ex/x/y/pdq', 'http://ex/x/y/pdq', ''],
                 ['http://ex/x/y/', 'http://ex/x/y/z/', 'z/'],
                 ['file:/swap/test/animal.rdf', 'file:/swap/test/animal.rdf#Animal', '#Animal'],
                 ['file:/e/x/y/z', 'file:/e/x/abc', '../abc'],
                 ['file:/example2/x/y/z', 'file:/example/x/abc', '/example/x/abc'],  // TBL
                 ['file:/ex/x/y/z', 'file:/ex/x/r', '../r'],
                 ['file:/ex/x/y/z', 'file:/r', '/r'],        // I prefer this. - tbl
                 ['file:/ex/x/y', 'file:/ex/x/q/r', 'q/r'],
                 ['file:/ex/x/y', 'file:/ex/x/q/r#s', 'q/r#s'],
                 ['file:/ex/x/y', 'file:/ex/x/q/r#', 'q/r#'],
                 ['file:/ex/x/y', 'file:/ex/x/q/r#s/t', 'q/r#s/t'],
                 ['file:/ex/x/y', 'ftp://ex/x/q/r', 'ftp://ex/x/q/r'],
                 ['file:/ex/x/y', 'file:/ex/x/y', ''],
                 ['file:/ex/x/y/', 'file:/ex/x/y/', ''],
                 ['file:/ex/x/y/pdq', 'file:/ex/x/y/pdq', ''],
                 ['file:/ex/x/y/', 'file:/ex/x/y/z/', 'z/'],
                 ['file:/devel/WWW/2000/10/swap/test/reluri-1.n3', 
                  'file://meetings.example.com/cal#m1',
		   'file://meetings.example.com/cal#m1'],
                 ['file:/home/connolly/w3ccvs/WWW/2000/10/swap/test/reluri-1.n3', 
		    'file://meetings.example.com/cal#m1', 
		    'file://meetings.example.com/cal#m1'],
                 ['file:/some/dir/foo', 'file:/some/dir/#blort', './#blort'],
                 ['file:/some/dir/foo', 'file:/some/dir/#', './#'],

                 // From Graham Klyne Thu, 20 Feb 2003 18:08:17 +0000
                 ["http://example/x/y%2Fz", "http://example/x/abc", "abc"],
                 ["http://example/x/y/z", "http://example/x%2Fabc", "/x%2Fabc"],
                 ["http://example/x/y%2Fz", "http://example/x%2Fabc", "/x%2Fabc"],
                 ["http://example/x%2Fy/z", "http://example/x%2Fy/abc", "abc"],
                 // Ryan Lee
                 ["http://example/x/abc.efg", "http://example/x/", "./"],
		 // Tim BL 2005-11-28  A version of the uri.js URIjoin() failed:
		 ['http://www.w3.org/People/Berners-Lee/card.rdf',
		    'http://www.w3.org/2002/01/tr-automation/tr.rdf',
		    '../../2002/01/tr-automation/tr.rdf']
                 ]
    var n = testCases.length
    var i
    var str = "<table><tr><th>Base</th><th>Absolute</th><th>Relative</th>"
		+ "<th>join(rel, base)</th><th></th></tr>\n"
		
    for(i=0; i<n; i++) {
	var c = testCases[i]
	var base = c[0]
	var abs = c[1]
	var rel = c[2]
	var abs2 = URIjoin(rel, base)
	style = ""
	if (abs2 != abs) {
//	    alert("URI join test failed: join("+base+", "+rel+") should be "+
//			abs +", was "+ abs2)
	    style = 'style="color: red"'
	}
	str+= ("<tr><td>"+ base +"</td><td>"+ abs +"</td><td>"+ rel +
	    "</td><td "+style+">"+abs2+"</td><td></td></tr>\n")
    }
    return str + "</table>\n"
} // test


//ends
