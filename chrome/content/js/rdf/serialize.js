/*      Serialization
*/

__Serializer = function(){
    this._flags = "";
    /* pass */
}

Serializer = function() {return new __Serializer()}; 


/* Accumulate Namespaces
** 
** These are only hints.  If two overlap, only one gets used
** There is therefore no guarantee in general.
*/

//__Serializer.prototype.setPrefixForURI = function(prefix, uri) {
//    this.prefixes[uri] = prefix;
//}

/* The scan is to find out which nodes will have to be the roots of trees
** in the serialized form. This will be any symbols, and any bnodes
** which hve more or less than one incoming arc, and any bnodes which have
** one incoming arc but it is an uninterrupted loop of such nodes back to itself.
** This should be kept linear time with repect to the number of statements.
** Note it does not use any indexing.
*/


// Todo:
//  - Sort the statements by subject, pred, object
//  - do stuff about the docu first and then (or first) about its primary topic.

__Serializer.prototype.rootSubjects = function(sts) {
    var incoming = [];
    var subjects = [];

    for (var i = 0; i<sts.length; i++) {
        var x = sts[i].object;
        if (!incoming[x]) incoming[x] = [];
        incoming[x].push(sts[i].subject) // List of things which will cause this to be printed
        var ss =  subjects[sts[i].subject.toNT()]; // Statements with this as subject
        if (!ss) ss = [];
        ss.push(sts[i]);
        subjects[sts[i].subject.toNT()] = ss; // Make hash. @@ too slow for formula?
        tabulator.log.debug(' sz potential subject: '+sts[i].subject)
    }

    var roots = [];
    var loopBreakers = [];
    
    function accountedFor(x, start) {
        if (x.termType != 'bnode') return true; // will be subject
        var zz = incoming[x];
        if (zz.length != 1) return true;
        if (loopBreakers[x]) return true;
        if (zz[0] == start) return false;
        return accountedFor(zz[0], start);
    }
    for (var xNT in subjects) {
//        var x = subjects[x][0].subject; // could use    kb.fromNT(xNT)
        var x = kb.fromNT(xNT);
        if ((x.termType != 'bnode') || !incoming[x] || (incoming[x].length != 1)){
            roots.push(x);
            tabulator.log.debug(' sz actual subject -: ' + x)
            continue;
        }
        if (accountedFor(incoming[x][0]), x) {
            continue;
        }
        roots.push(x);
        tabulator.log.debug(' sz potential subject *: '+sts[i].subject)
        loopBreakers[x] = 1;
    }
    return [roots, subjects];
}

////////////////////////////////////////////////////////

    
__Serializer.prototype.toN3 = function(sts, namespaces, flags) {
    var indent = 4;
    var width = 80;
    var subjects = null; // set later

    var prefixes = [];
    var px;
    for (px in namespaces) {
        prefixes[namespaces[px]] = px;
    }

    predMap = {
        'http://www.w3.org/2002/07/owl#sameAs': '=',
        'http://www.w3.org/2000/10/swap/log#implies': '=>',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'a'
    }
    

    
    if (!flags) flags = '';
    
    ////////////////////////// Arrange the bits of text 

    var spaces=function(n) {
        var s='';
        for(var i=0; i<n; i++) s+=' ';
        return s
    }

    treeToLine = function(tree) {
        var str = '';
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            if (i!=0) str += ' ';
            if (typeof branch == 'string')
                str += branch;
            else str += treeToLine(branch);
        }
        return str;
    }
    
    // Convert a nested tree of lists and strings to a string
    treeToString = function(tree, level) {
        var str = '';
        if (!level) level = 0;
        for (var i=0; i<tree.length; i++) {
            var branch = tree[i];
            if (typeof branch == 'string') {
                if (branch.length == '1' && str.slice(-1) == '\n') {
                    if (",.;".indexOf(branch) >=0)
                        str = str.slice(0,-1) + branch + '\n'; //  slip punct'n on end
                    else if ("])}".indexOf(branch) >=0)
                        str = str.slice(0,-1) + ' ' + branch + '\n';
                    else
                        str += spaces(indent*level) +branch +'\n'; 
                }
                else
                    str += spaces(indent*level) +branch +'\n'; 
            } else {
                var substr = treeToString(branch, level +1);
                if (branch.length > 1 && substr.length < 10*(width-indent*level) && // Save time on huge bits
                            substr.indexOf('"""') < 0) {// Don't mess up multiline strings
                    var line = treeToLine(branch);
                    // print("Line: "+line);
                    if (line.length < (width-indent*level))
                        substr = spaces(indent*(level+1))+line+'\n';
                }
                str += substr;
            }
        }
        return str;
    };

    ////////////////////////////////////////////// Structure
    
    
    function statementListToTree(statements) {
        // print('Statement tree for '+statements.length);
        var res = [];
        var pair = __Serializer.prototype.rootSubjects(statements);
        var roots = pair[0];
        // print('Roots: '+roots)
        subjects = pair[1];
        results = []
        for (var i=0; i<roots.length; i++) {
            root = roots[i];
            results.push(subjectTree(root))
        }
        return results;
    }
    
    // The tree for a subject
    function subjectTree(subject) {
        return [ termToN3(subject) ].concat([propertyTree(subject)]).concat(["."]);
    }
    

    // The property tree for a single subject or anonymos node
    function propertyTree(subject) {
        // print('Proprty tree for '+subject);
        var results = []
        var lastPred = null;
        var sts = subjects[subject.toNT()]; // relevant statements
        sts.sort();
        var objects = [];
        for (var i=0; i<sts.length; i++) {
            var st = sts[i];
            if (st.predicate.uri == lastPred) {
                objects.push(',');
            } else {
                if (lastPred) {
                    results=results.concat([objects]).concat([';']);
                    objects = [];
                }
                results.push(predMap[st.predicate.uri] ?
                            predMap[st.predicate.uri] : termToN3(st.predicate));
            }
            lastPred = st.predicate.uri;
            objects.push(objectTree(st.object));
        }
        results=results.concat([objects]);
        return results;
    }

    // Convert a set of statements into a nested tree of lists and strings
    function objectTree(obj) {
        // print('Object tree for '+obj);
        switch(obj.termType) {
            case 'symbol':
            case 'literal':
                return termToN3(obj);
                
            case 'bnode':
                return  ['['].concat(propertyTree(obj)).concat([']']);
                
            case 'collection':
                var res = ['('];
                for (i=0; i<obj.length; i++) {
                    res += objectTree(obj[i]);
                }
                return  res.concat([')']);
            case 'formula':
                var res = ['{'];
                res = res.concat(statementListToTree(obj.statements));
                return  res.concat(['}']);
        }
    }
    
    ////////////////////////////////////////////// Terms
    
    //  Deal with term level things
    
    function termToN3(term) {
        switch(term.termType) {
            case 'bnode':
            case 'variable':  return term.toNT();
            case 'literal':
                var str = stringToN3(term.value);
                if (term.lang) str+= '@' + term.lang;
                if (term.dt) str+= '^^' + termToN3(term.dt);
                return str;
            case 'symbol':
                return symbolToN3(term.uri);
            default:
                throw "Internal: termToN3 cannot handle "+term+" of termType+"+term.termType
                return ''+term;
        }
    }
    
    function symbolToN3(uri) {  // c.f. symbolString() in notation3.py
        var j = uri.indexOf('#');
        if (j<0 && flags.indexOf('/') < 0) {
            j = uri.lastIndexOf('/');
        }
        if (j >= 0 && flags.indexOf('p') < 0)  { // Can split at namespace
            var canSplit = true;
            for (var k=j+1; k<uri.length; k++) {
                if (_notNameChars.indexOf(uri[k]) >=0) {
                    canSplit = false; break;
                }
            }
            if (canSplit) {
                var localid = uri.slice(j+1);
                var namesp = uri.slice(0,j+1);
                if (this.defaultNamespace && this.defaultNamespace == namesp
                    && flags.indexOf('d') < 0) {// d -> suppress default
                    if (flags.indexOf('k') >= 0 &&
                        this.keyords.indexOf(localid) <0)
                        return localid; 
                    return ':' + localid;
                }
                var prefix = prefixes[namesp];
                if (prefix) return prefix + ':' + localid;
                if (uri.slice(0, j) == this.base)
                    return '<#' + localid + '>';
                // Fall though if can't do qname
            }
        }
        if (flags.indexOf('r') < 0 && this.base)
            uri = uri.refTo(this.base, uri);
        else if (flags.indexOf('u') >= 0)
            uri = backslashUify(uri);
        else uri = hexify(uri);
        return '<'+uri+'>';
    }
    
    function stringToN3(str) {
        return '"""'+str+'"""'; //    @@ Placeholder for the real thing!
    }

    // Body of toN3:
    
    var tree = statementListToTree(sts);
//    print('Tree: '+tree);
    return treeToString(tree);
    
}

// String ecaping utilities

function hexify(str) { // also used in parser
    var res = '';
    for (var i=0; i<str.length; i++) {
        k = str.charCodeAt(i);
        if (k>126 || k<33)
            res += '%' + ('0'+n.toString(16)).slice(-2); // convert to upper?
        else
            res += str[i];
    }
    return res;
}


function backslashUify(str) {
    var res = '';
    for (var i=0; i<str.length; i++) {
        k = str.charCodeAt(i);
        if (k>65535)
            res += '\U' + ('00000000'+n.toString(16)).slice(-8); // convert to upper?
        else if (k>126) 
            res += '\u' + ('0000'+n.toString(16)).slice(-4);
        else
            res += str[i];
    }
    return res;
}

