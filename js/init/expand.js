// Expand a script to insert the included files in place
//
// Run under node.js a la
//
// node expand.js init.js > lib.js
//

var fs = require('fs');
var prefix = '../../' ; // Take up to the directory above js

var expand = function(filename) {
    console.log("// ###### Expanding "+filename+" ##############");
    var s = fs.readFileSync(prefix + filename, 'utf8');
    var i = 0;
    var l = s.length;
    var eol = 0;
    for (i=0; eol<l; i = eol+1) {
        eol = s.indexOf('\n', i);
        if (eol < 0) eol = l;
        var line = s.slice(i, eol);
        var m = 0;
        while(line[m] == ' ' && m < line.length) m++;
        if (line.slice(m, m+2) == '//') { // Pass though comments (drop them?)
            console.log(line);
            continue;
        }
        var j = line.indexOf('tabulator.loadScript(');
        if (j >= 0) {
            var k = line.indexOf(')', j);
            var fn = line.slice(j+22, k-1); // chop quotes assuming no space
            expand(fn);
        } else {
            console.log(line);
        }
    }
    console.log("// ###### Finished expanding "+filename+" ##############");
    return;
};

expand(process.argv[2]);


// ends
