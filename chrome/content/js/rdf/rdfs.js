//  Limited transitive closure for RDF-S etc
//
//
//  2007-01 Written Tim Berners-Lee
//
// 

/*jsl:option explicit*/ // Turn on JavaScriptLint variable declaration checking

/* Follow each seed node through one given type of arc
*/
RDFIndexedFormula.prototype.follow = function(seeds, pred) {
    var results = [];
    for (var i=0; i < seeds.length; i++) {
        results = results.concat(this.each(seeds[i], pred));
    }
    return results;
};

RDFIndexedFormula.prototype.followBack = function(seeds, pred) {
    var results = [];
    for (var i=0; i < seeds.length; i++) {
        results = results.concat(undefined, pred, this.each(seeds[i]));
    }
    return results;

};


/* Return the set of distinct nodes related to (start) by the transitive closure of (pred)
*/
RDFIndexedFormula.prototype.transitiveClosure = function transitiveClosure(
                                                seeds, pred, inverse) {
    var already = []; // Set: Nodes we have done already
    var results = []; // List: all we have found
//    var todo = seeds.copy() ; // List: Nodes we have yet to do
    
    // following piece of code was added by Oshani on 25th Jan 2008
    // as a replacements for seeds.copy() above
	var todo = [];
	for (var i=0; i<seeds.length; i++){
		todo.push(seeds[i]);
	}
	
    while(todo.length > 0) {
        var x = todo.pop();
        var xNT = x.toNT();
        if (already[xNT]) continue; 
        already[xNT] = true;
        results.push(x);
        var yy = inverse? this.each(undefined, pred, x) : this.each(x, pred);
        for (var i=0; i<yy.length; i++) {
            var y = yy[i];
            var yNT = y.toNT();
            if (already[yNT]) continue;
            todo.push(y);
        }
    }
    return results;
};

// Convenience functions:
RDFIndexedFormula.prototype.superProperties = function(start) {
    return this.transitiveClosure(start, tabulator.ns.rdfs('subPropertyOf'), false);
};
RDFIndexedFormula.prototype.superClasses = function(start) {
    return this.transitiveClosure(start, tabulator.ns.rdfs('subClassOf'), false);
};

RDFIndexedFormula.prototype.allClasses = function(subj){
    var classes = this.each(subj, tabulator.ns.rdf('type'));
    var superclasses = [];

   // following piece of code was commented out by Oshani on 28th Jan 2008
   // because the method superClasses accepts the entire array

//    for (var i=0; i<classes.length; i++) {
//        superclasses = superclasses.concat(this.superClasses(classes[i]));
//    }

    superclasses = superclasses.concat(this.superClasses(classes));

    return superclasses;
};

// What classes is this not in?
RDFIndexedFormula.prototype.notType = function(subj) {
    var superclasses = this.allClasses(subj);
    var disjointClasses = kb.follow(superclasses, tabulator.ns.owl('disJointWith'))
            .concat(kb.followBack(superclasses, tabulator.ns.owl('disJointWith')));
    return disjointClasses;
};

RDFIndexedFormula.prototype.compatible = function(subj, pred, inverse) {
    var preds = this.superProperties(pred);
    var domains = []; // Classes the subject (object) must be in
    for (var i=0; i<preds.length; i++) {
        ranges = ranges.concat(this.each(preds[i],
                        tabulator.ns.rdfs(inverse? 'range':'domain')));
    }
};

// Return true iff the intersection of l1 and l2
RDFIndexedFormula.prototype.clash = function(list1, list2) {
    var i;
    s = []; // Set
    for (i=0; i<list1.length; i++) {
        s[list1[i].hashString()] = true;
    }
    for (i=0; i<list2.length; i++) {
        if (s[list2[i].hashString()]) return true;
    }
    return false;
};

/**
 * This method is used to remove any redundant super classes associated with a subject
 * @author oshani@csail.mit.edu
 */
RDFIndexedFormula.prototype.redundantSuperClasses = function(seeds) {
	
	var all = this.allClasses(seeds);
	
	var redundant = [];
	var classes = [];

	//Make an associative array of classes with the respective superclasses
	for (var i=0; i<all.length; i++){
		var c = [];
		c.push(all[i]);	//Must have it in an array, since the superClasses method expects an array
		classes.push(this.superClasses(c));
	}

	//For each of the classes, find if it appears in the superclass arrays for the other classes
	// if so, remove it from the kb	
	for (var i=0; i<all.length; i++){
		var classToRemove = all[i];
		for (var j=0; j<all.length; j++){
			if (i != j){ //don't compare with the superclass array for the current class, 
						 //as it already has the same class
				var classesToCompare = classes[j];
				for (var k=0; k<classesToCompare.length; k++){
					if (classesToCompare[k].toNT() == classToRemove.toNT()){
						redundant.push(classToRemove);
						break;
					}
				}
			}
				
		}
	}
	
	return redundant;
}


// ends

