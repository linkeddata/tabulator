/*      Serialization
*/

__Serializer = function(f){
    this.f = f;
}

Serializer = function(f) {return new __Serializer(f)}; 

/* The scan is to find out which nodes will have to be the roots of trees
** in the serialized form. This will be any symbols, and any bnodes
** which hve more or less than one incoming arc, and any bnodes which have
** one incoming arc but it is a loop back to itself.
*/

__Serializer.prototype.scan = function() {
    var sts = this.f.statements;
    var incoming = [];
    var subjects = [];
    for (var i = 0; i<sts.length; i++) {
        var x = sts[i].object;
        if (!incoming[x]) incoming[x] = [];
        incoming[x].push(sts[i].subject) // List of things which will cause this to be printed
        subjects[sts[i]] = 1;
    }
    subjects.sort();
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
    for (x in subjects) {
        if ((x.termType != 'bnode') || (incoming[x].length != 1)){
            roots.push(x);
            continue;
        }
        if (accountedFor(incoming[x][0]), x) {
            continue;
        }
        roots.push(x);
        loopBreakers[x] = 1;
    }
    return roots;
}

