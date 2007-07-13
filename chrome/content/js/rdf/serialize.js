/*      Serialization
*/

__Serializer = function(outline, f, write, base, flags){
    this.f = f;
    this.outline = outline;
    this.write = write;
    this.base = base;
    this.flags = this.flags? this.flags : "";

    this.incoming = [];
    this.subjects = [];
}

Serilizer = function(outline, f, write, base, flags) {return new __Serializer(self, f, write, base, flags)}; 

/* The scan is to find out which nodes will have to be the roots of trees
** in the serialized form. This will be any symbols, and any bnodes
** which hve more or less than one incoming arc, and any bnodes which have
** one incoming arc but it is a loop back to itself.
*/

__Serializer.prototype.scan = function() {
    var sts = self.f.statements;
    for (var i = 0; i<sts.length; i++) {
        var x = sts[i].object;
        if (!this.incoming[x]) this.incoming[x] = [];
        this.incoming[x].push(sts[i].subject) // List of things which will cause this to be printed
        this.subjects[sts[i]] = 1;
    }
    this.subjects.sort();
    var roots = [];
    var loopBreakers = [];
    
    function accountedFor(x, start) {
        if (x.termType != 'bnode') return true; // will be subject
        var zz = this.incoming[x];
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
        if (accountedFor(incoming[x][0], x) {
            continue;
        }
        roots.push(x);
        loopBreakers[x] = 1;
    }
    return roots;
}

__Serializer.prototype.outlineStyle(parent) {

    // To do:  Only take data from one graph
    //         Expand automatically

    var roots = this.scan();
    for (var i=0; i<roots.length(); i++) {
        var tr = myDocument.createElement("TR");
        tr.style.verticalAlign="top";
        var td = this.outline.outline_objectTD(subject, undefined, tr)
        tr.appendChild(td)
        table.appendChild(tr);
        outline_expand(td, subject)
    }
    
}
