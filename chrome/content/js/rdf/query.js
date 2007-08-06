// Matching a formula against another formula
//
//
// W3C open source licence 2005.
//
// This builds on term.js, match.js (and identity.js?)
// to allow a query of a formula.
// Here we introduce for the first time a subclass of term: variable.
//
// SVN ID: $Id: query.js 3682 2007-08-06 18:37:36Z jambo $

//  Variable
//
// Compare with RDFBlankNode.  They are similar, but a variable
// stands for something whose value is to be returned.
// Also, users name variables and want the same name back when stuff is printed

/*jsl:option explicit*/ // Turn on JavaScriptLint variable declaration checking


//The Query object.  Should be very straightforward.
function Query(name, id) {
    this.pat = kb.formula();
    this.vars = [];
    this.orderBy = [];
    this.name=name;
    this.id=id;
}

/**The QuerySource object stores a set of listeners and a set of queries.
 * It keeps the listeners aware of those queries that the source currently
 * contains, and it is then up to the listeners to decide what to do with
 * those queries in terms of displays.
 * @constructor
 * @author jambo
 */
function QuerySource() {
    /**stores all of the queries currently held by this source, indexed by ID number.
     */
    this.queries=[];
    /**stores the listeners for a query object.
     * @see TabbedContainer
     */
    this.listeners=[];

    /**add a Query object to the query source--It will be given an ID number
     * and a name, if it doesn't already have one. This subsequently adds the
     * query to all of the listeners the QuerySource knows about.
     */
    this.addQuery = function(q) {
        var i;
        if(q.name==null || q.name=="")
				    q.name="Query #"+(this.queries.length+1);
        q.id=this.queries.length;
        this.queries.push(q);
        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]!=null)
                this.listeners[i].addQuery(q);
        }
    };

    /**Remove a Query object from the source.  Tells all listeners to also
     * remove the query.
     */
    this.removeQuery = function(q) {
        var i;
        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]!=null)
                this.listeners[i].removeQuery(q);
        }
        if(this.queries[q.id]!=null)
            delete this.queries[q.id];
    };

    /**adds a "Listener" to this QuerySource - that is, an object
     * which is capable of both adding and removing queries.
     * Currently, only the TabbedContainer class is added.
     * also puts all current queries into the listener to be used.
     */
    this.addListener = function(listener) {
        var i;
        this.listeners.push(listener);
        for(i=0; i<this.queries.length; i++) {
            if(this.queries[i]!=null)
                listener.addQuery(this.queries[i]);
        }
    };
    /**removes listener from the array of listeners, if it exists! Also takes
     * all of the queries from this source out of the listener.
     */
    this.removeListener = function(listener) {
        var i;
        for(i=0; i<this.queries.length; i++) {
            if(this.queries[i]!=null)
                listener.removeQuery(this.queries[i]);
        }

        for(i=0; i<this.listeners.length; i++) {
            if(this.listeners[i]===listener) {
                delete this.listeners[i];
            }
        } 
    };
}

function viewAndSaveQuery()
{
    var newQuery = saveQuery();
    var i;
    for(i=0; i<qs.listeners.length; i++) {
        qs.listeners[i].getActiveView().view.drawQuery(newQuery);
        qs.listeners[i].updateQueryControls(qs.listeners[i].getActiveView()); 
    }
}


function saveQuery() {

    var q= new Query()
    var i, n=selection.length, j, m, tr, sel, st;
    for (i=0; i<n; i++) {
        sel = selection[i]
       	tr = sel.parentNode
       	st = tr.AJAR_statement
       	tabulator.log.debug("Selected statement: "+st)
       	if (sel.getAttribute('class').indexOf('pred') >= 0) {
            tabulator.log.info("   We have a predicate")
            makeQueryRow(q,tr)
       	}
       	if (sel.getAttribute('class').indexOf('obj') >=0) {
       		tabulator.log.info("   We have an object")
       		makeQueryRow(q,tr,true)
       	}
    }    
    
    qs.addQuery(q);

    function resetOutliner(pat) {
        optionalSubqueriesIndex=[]
        var i, n = pat.statements.length, pattern, tr;
        for (i=0; i<n; i++) {
        pattern = pat.statements[i];
        tr = pattern.tr;
        //tabulator.log.debug("tr: " + tr.AJAR_statement);
        if (typeof tr!='undefined') {
                delete tr.AJAR_pattern;
                delete tr.AJAR_variable;
        }
    }

    for (x in pat.optional)
            resetOutliner(pat.optional[x])
    }

    resetOutliner(q.pat);
    NextVariable=0;
    return q;
}

function predParentOf(node)
{
   	var n=node;
   	while (true)
	{
		if (n.getAttribute('predTR'))
			return n;
		else if (n.previousSibling && n.previousSibling.nodeName == 'TR')
			n=n.previousSibling;
		else { tabulator.log.error("Could not find predParent"); return node }
	}
}

var optionalSubqueriesIndex = []

function makeQueryRow(q, tr, constraint) {
    //predtr = predParentOf(tr);
    var nodes = tr.childNodes, n = tr.childNodes.length, inverse=tr.AJAR_inverse,
        i, hasVar = 0, pattern, v, c, parentVar=null, level, pat;
    
    function makeRDFStatement(freeVar, parent) {
    	if (inverse)
	    return new RDFStatement(freeVar, st.predicate, parent)
	else
	    return new RDFStatement(parent, st.predicate, freeVar)
    }
    
    var optionalSubqueryIndex = null;

    for (level=tr.parentNode; level; level=level.parentNode) {
        if (typeof level.AJAR_statement != 'undefined') {   // level.AJAR_statement
            level.setAttribute('bla',level.AJAR_statement)  // @@? -timbl
            tabulator.log.debug("Parent TR statement="+level.AJAR_statement + ", var=" + level.AJAR_variable)
            /*for(c=0;c<level.parentNode.childNodes.length;c++) //This makes sure the same variable is used for a subject
            	if(level.parentNode.childNodes[c].AJAR_variable)
            		level.AJAR_variable = level.parentNode.childNodes[c].AJAR_variable;*/
            if (!level.AJAR_variable)
                makeQueryRow(q, level);
            parentVar = level.AJAR_variable
            var predLevel = predParentOf(level)
            if (predLevel.getAttribute('optionalSubqueriesIndex')) { 
            	optionalSubqueryIndex = predLevel.getAttribute('optionalSubqueriesIndex')
            	pat = optionalSubqueriesIndex[optionalSubqueryIndex]
            }
            break;
        }
    }
    
    if (!pat)
    	var pat = q.pat
    
    var predtr = predParentOf(tr)
    ///////OPTIONAL KLUDGE///////////
    var opt = (predtr.getAttribute('optional'))
    if (!opt) {
    	if (optionalSubqueryIndex) 
    		predtr.setAttribute('optionalSubqueriesIndex',optionalSubqueryIndex)
    	else
    		predtr.removeAttribute('optionalSubqueriesIndex')}
    if (opt){
    	var optForm = kb.formula()
    	optionalSubqueriesIndex.push(optForm);
    	predtr.setAttribute('optionalSubqueriesIndex',optionalSubqueriesIndex.length-1)
    	pat.optional.push(optForm)
    	pat=optForm
    }
    
    ////////////////////////////////

    
    var st = tr.AJAR_statement; 
       
    var constraintVar = tr.AJAR_inverse? st.subject:st.object; //this is only used for constraints
    var hasParent=true
    if (constraintVar.isBlank && constraint) 
			alert("You cannot constrain a query with a blank node. No constraint will be added.");
    if (!parentVar) {
    	hasParent=false;
    	parentVar = inverse? st.object : st.subject; //if there is no parents, uses the sub/obj
    }
    tabulator.log.debug('Initial variable: '+tr.AJAR_variable)
    v = tr.AJAR_variable? tr.AJAR_variable : kb.variable(newVariableName());
    q.vars.push(v)
    v.label = hasParent? parentVar.label : label(parentVar);
    v.label += " "+ predicateLabelForXML(st.predicate, inverse);
    pattern = makeRDFStatement(v,parentVar);
    //alert(pattern);
    v.label = v.label.slice(0,1).toUpperCase() + v.label.slice(1)// init cap
    
    if (constraint)   //binds the constrained variable to its selected value
    	pat.constraints[v]=new constraintEqualTo(constraintVar);
    	
    tabulator.log.info('Pattern: '+pattern);
    pattern.tr = tr
    tr.AJAR_pattern = pattern    // Cross-link UI and query line
    tr.AJAR_variable = v;
    tabulator.log.debug('Final variable: '+tr.AJAR_variable)
    tabulator.log.debug("Query pattern: "+pattern)
    pat.statements.push(pattern)
    return v
} //makeQueryRow

RDFVariable.prototype.isVar = 1;
RDFBlankNode.prototype.isVar = 1;
RDFBlankNode.prototype.isBlank = 1;
RDFSymbol.prototype.isVar = 0;
RDFLiteral.prototype.isVar = 0;
RDFFormula.prototype.isVar = 0;
RDFCollection.prototype.isVar = 0
// RDFList.prototype.isVar = 0;
// RDFSet.prototype.isVar = 0;


// Unification: see also 
//  http://www.w3.org/2000/10/swap/term.py
// for similar things in python
//
// Unification finds all bindings such that when the binding is applied
// to one term it is equal to the other.


function RDFUnifyTerm(self, other, bindings, formula) {
    var actual = bindings[self];
    if (typeof actual == 'undefined') { // Not mapped
        if (self.isVar) {
        	/*if (self.isBlank)  //bnodes are existential variables
        	{
        		if (self.toString() == other.toString()) return [[ [], null]];
        		else return [];
        	}*/
            var b = [];
            b[self] = other;
            return [[  b, null ]]; // Match
        }
        actual = self;
    }
    if (!actual.complexType) {
        if (formula.redirection[actual]) actual = formula.redirection[actual];
        if (formula.redirection[other])  other  = formula.redirection[other];
        if (actual.sameTerm(other)) return [[ [], null]];
        return [];
    }
    if (self instanceof Array) {
        if (!(other instanceof Array)) return [];
        return RDFArrayUnifyContents(self, other, bindings)
    };
    alert('oops - code not written yet');
    return undefined;  // for lint 
//    return actual.unifyContents(other, bindings)
}; //RDFUnifyTerm



function RDFArrayUnifyContents(self, other, bindings, formula) {
    if (self.length != other.length) return []; // no way
    if (!self.length) return [[ [], null ]]; // Success
    var nbs = RDFUnifyTerm(self[0], other[0], bindings, formula);
    if (nbs == []) return nbs;
    var res = [];
    var i, n=nbs.length, nb, b2, j, m, v, nb2;
    for (i=0; i<n; i++) { // for each possibility from the first term
        nb = nbs[i][0]; // new bindings
        var bindings2 = [];
        for (v in nb) bindings2[v] = nb[v]; // copy
        for (v in bindings) bindings2[v] = bindings[v]; // copy
        var nbs2 = RDFArrayUnifyContents(self.slice(1), other.slice(1), bindings2, formula);
        m = nbs2.length;
        for (j=0; j<m; j++) {
            var nb2 = nbs2[j][0];   //@@@@ no idea whether this is used or right
            for (v in nb) nb2[v]=nb[v];
            res.push([nb2, null]);
        }
    }
    return res;
} //RDFArrayUnifyContents



//  Matching
//
// Matching finds all bindings such that when the binding is applied
// to one term it is equal to the other term.  We only match formulae.

/** if x is not in the bindings array, return the var; otherwise, return the bindings **/
function RDFBind(x, binding) {
    var y = binding[x];
    if (typeof y == 'undefined') return x;
    return y;
}



// fetcher returns > 0 if it has requested a URI to be looked up
// fetcher() waits for all the requested URIs to come in
RDFIndexedFormula.prototype.query = function(foodog, callback, fetcher) {
    if(!fetcher) {
      fetcher=myFetcher;
    } 
    //prepare, oncallback: match1
    //match1: fetcher, oncallback: match2
    //match2, oncallback: populatetable
    //    tabulator.log.debug("Query F length"+this.statements.length+" G="+foodog)
    var f = this;
    tabulator.log.debug("Query on "+this.statements.length)
//    if (kb != this) alert("@@@@??? this="+ this)
	
	//kb.remoteQuery(foodog,'http://jena.hpl.hp.com:3040/backstage',callback);
	//return;
	function branchCount ()
	{
		this.count = 1;
		var tcount = function () { this.val = 1; return this }
		this.numTasks = tcount();
		this.success = false;
		this.onFail = function(){};
		//this.onComplete = callback({foodog.vars[0]:new RDFLiteral("Done")})
		return this;
	}
	
	function optionalCallback (bindings,pat)
	{
		if (pat.optional.length==0) callback(bindings);
		//alert("OPTIONAL: "+pat.optional)
		var tcount = function () { this.val = pat.optional.length; return this};
		var tc = new tcount();
		for (x in pat.optional)
		{
			var bc = new branchCount();
			bc.onFail = function(){ callback(bindings); }
			bc.numTasks = tc;
			match(f,pat.optional[x],bindings,'',fetcher,optionalCallback,bc)
		}
		return this;
	}
	//alert("INIT OPT: "+foodog.pat.optional);
    setTimeout(function() { match(f, foodog.pat, foodog.pat.initBindings, '', fetcher, optionalCallback, new branchCount()); }, 0);
    //match(this, foodog, [], '', fetcher, callback);
    //    tabulator.log.debug("Returning from query length="+res.length+" bindings: "+bindingsDebug(res))
    /*var r, nr=res.length, b, v;
    for (r=0; r<nr; r++) {
        b = res[r][0];
        for (v in b) {
            if (v[0] == '_') { // bnodes' bindings are not to be returned
                delete res[r][0][v];
            }
        }
    }
    tabulator.log.debug("Returning from query length="+res.length+" bindings: "+bindingsDebug(res));
        
    return res;
    */
    return; //returns nothing; callback does the work
}; //query

/** prepare -- sets the index of the item to the possible matches
    * @param f - formula
    * @param item - an RDFStatement, possibly w/ vars in it
    * @param bindings - 
* @returns true if the query fails -- there are no items that match **/
function prepare(f, item, bindings) {
    item.nvars = 0;
    item.index = null;
    if (!f.statements) tabulator.log.warn("@@@ prepare: f is "+f);
//    tabulator.log.debug("Prepare: f has "+ f.statements.length);
    tabulator.log.debug("Prepare: Kb size "+f.statements.length+" Preparing "+item);
    
    var t,c,terms = [item.subject,item.predicate,item.object],ind = [f.subjectIndex,f.predicateIndex,f.objectIndex];
    for (i=0;i<3;i++)
    {
    	//alert("Prepare "+terms[i]+" "+(terms[i] in bindings));
    	if (terms[i].isVar && !(terms[i] in bindings)) {
        	item.nvars++;
    	} else {
        	var t = RDFBind(terms[i], bindings); //returns the RDF binding if bound, otherwise itself
        	//if (terms[i]!=RDFBind(terms[i],bindings) alert("Term: "+terms[i]+"Binding: "+RDFBind(terms[i], bindings));
        	if (f.redirection[t.hashString()]) t = f.redirection[t.hashString()]; //redirect
        	termIndex=ind[i]
        	item.index = termIndex[t.hashString()];
        	if (typeof item.index == 'undefined') {
            	tabulator.log.debug("prepare: no occurrence [yet?] of term: "+ t);
            	item.index = [];
        	}
    	}
    }
    	
    if (item.index == null) item.index = f.statements;
    // tabulator.log.debug("Prep: index length="+item.index.length+" for "+item)
    tabulator.log.debug("prepare: index length "+item.index.length +" for "+ item);
    return false;
} //prepare
    
/** sorting function -- negative if self is easier **/
// We always prefer to start with a URI to be able to browse a graph
// this is why we put off items with more variables till later.
function easiestQuery(self, other) {
    if (self.nvars != other.nvars) return self.nvars - other.nvars;
    return self.index.length - other.index.length;
}

var match_index = 0; //index
/** matches a pattern formula against the knowledge base, e.g. to find matches for table-view
* @param f - knowledge base formula
* @param g - pattern formula (may have vars)
* @param bindingsSoFar  - bindings accumulated in matching to date
* @param level - spaces to indent stuff also lets you know what level of recursion you're at
* @param fetcher - function (term, requestedBy) - myFetcher / AJAR_handleNewTerm / the sort
* @returns nothing **/
function match(f, g, bindingsSoFar, level, fetcher, callback, branchCount) {
    tabulator.log.debug("match: f has "+f.statements.length+", g has "+g.statements.length)
    var pattern = g.statements;
    if (pattern.length == 0) { //when it's satisfied all the pattern triples
        tabulator.log.msg("REACHED CALLBACK WITH BINDINGS:")
        for (var b in bindingsSoFar) {
	    tabulator.log.msg("b=" + b + ", bindingsSoFar[b]=" + bindingsSoFar[b])
	}
        if (callback) callback(bindingsSoFar,g)
        branchCount.count--
        branchCount.success=true
        tabulator.log.debug("Branch Count at end: "+branchCount.count)
        return [[ [], null ]]; // Success
    }
    var item, i, n=pattern.length;
    //tabulator.log.debug(level + "Match "+n+" left, bs so far:"+bindingDebug(bindingsSoFar))

    // Follow links from variables in query
    if (fetcher) {   //Fetcher is used to fetch URIs, function first term is a URI term, second is the requester
        var id = "match" + match_index++;
	var fetchResource = function (requestedTerm, id) {
      var path = requestedTerm.uri;
      if(path.indexOf("#")!=-1) {
          path=path.split("#")[0];
      }
	    sf.addCallback('done', function(uri) {
			       if ((kb.canon(kb.sym(uri)).uri != path) && (uri != kb.canon(kb.sym(path)))) {
				   return true
			       }

			       match(f, g, bindingsSoFar, level, fetcher, // @@tbl was match2
				      callback, branchCount)
			       return false
			   })
            fetcher(requestedTerm, id)	    
	}
        for (i=0; i<n; i++) {
            item = pattern[i];  //for each of the triples in the query
            if (item.subject in bindingsSoFar
		&& bindingsSoFar[item.subject].uri
		&& sf.getState(kb.sym(Util.uri.docpart(bindingsSoFar[item.subject].uri))) == "unrequested") {
		//fetch the subject info and return to id
		fetchResource(bindingsSoFar[item.subject],id)
		return; //@@tbl
            } else if (item.object in bindingsSoFar
		       && bindingsSoFar[item.object].uri
		       && sf.getState(kb.sym(Util.uri.docpart(bindingsSoFar[item.object].uri))) == "unrequested") {
                fetchResource(bindingsSoFar[item.object], id)
		return; //@@tbl
//            } else {
//		match2(f, g, bindingsSoFar, level, fetcher, callback,
//		       branchCount)
	    }
        }
//    } else {
        match2(f, g, bindingsSoFar, level, fetcher, callback, branchCount)
    }
    return; //when the sources have been fetched, match2 will be called
}
/** match2 -- stuff after the fetch **/
function match2(f, g, bindingsSoFar, level, fetcher, callback, branchCount) //post-fetch
{
    var pattern = g.statements, n = pattern.length, i;
    for (i=0; i<n; i++) {  //For each statement left in the query, run prepare
        item = pattern[i];
        tabulator.log.info("match2: item=" + item + ", bindingsSoFar=" + bindingDebug(bindingsSoFar));
        prepare(f, item, bindingsSoFar);
    }
    pattern.sort(easiestQuery);
    // tabulator.log.debug("Sorted pattern:\n"+pattern)
    var item = pattern[0];
    var rest = f.formula();
    rest.optional = g.optional;
    rest.constraints = g.constraints;
    rest.statements = pattern.slice(1); // No indexes: we will not query g. 
    tabulator.log.debug(level + "Match2 searching "+item.index.length+ " for "+item+
            "; bindings so far="+bindingDebug(bindingsSoFar));
    //var results = [];
    var c, nc=item.index.length, nbs1, x;
    for (c=0; c<nc; c++) {   // For each candidate statement
        var st = item.index[c]; //for each statement in the item's index, spawn a new match with that binding 
        nbs1 = RDFArrayUnifyContents(
                [item.subject, item.predicate, item.object],
        [st.subject, st.predicate, st.object], bindingsSoFar, f);
        tabulator.log.info(level+" From first: "+nbs1.length+": "+bindingsDebug(nbs1))
        var k, nk=nbs1.length, nb1, v;
        branchCount.count+=nk;
        for (k=0; k<nk; k++) {  // For each way that statement binds
            var bindings2 = [];
            var newBindings1 = nbs1[k][0]; 
            if (!constraintsSatisfied(newBindings1,g.constraints)) {branchCount--; continue;}
            for (v in newBindings1) bindings2[v] = newBindings1[v]; // copy
            for (v in bindingsSoFar) bindings2[v] = bindingsSoFar[v]; // copy
            match(f, rest, bindings2, level+ '  ', fetcher, callback, branchCount); //call match
        }
    }
    branchCount.count--;
    tabulator.log.debug("BranchCount: "+branchCount.count);
    if (branchCount.count == 0 && !branchCount.success)
    {
    	branchCount.numTasks.val--;
    	//alert(branchCount.numTasks.val)
    	tabulator.log.debug("Branch finished. Tasks remaining: "+branchCount.numTasks.val+" Optional array length: "+g.optional.length);
    	if (branchCount.numTasks.val==0) branchCount.onFail();
    	//if (g.optional.length == 0 && branchCount.numTasks.val < 1) { branchCount.onComplete();}
    	//if (!branchCount.optional && branchCount.numTasks.val == -1) branchCount.onComplete();
    }
    //return results;
} //match

function constraintsSatisfied(bindings,constraints)
{
	var res=true;
	for (x in bindings) {
		if (constraints[x]) {
			var test = constraints[x].test;
			if (!test(bindings[x]))
				res=false;
    	}
	}
	return res;
}

///////////// Debug strings

function bindingsDebug(nbs) {
    var str = "Bindings:\n";
    var i, n=nbs.length;
    for (i=0; i<n; i++) {
        str+= bindingDebug(nbs[i][0])+'\n';
    };
    return str;
} //bindingsDebug

function bindingDebug(b) {
        var str = "", v;
        for (v in b) {
	    str += "    "+v+" -> "+b[v];
        }
        return str;
}

// ends
