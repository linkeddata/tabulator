
// Problem: Find all info about x including FP IFP and =
// this is a query-time solution without smushing in the store,
// and given that EM piggybank tried that and it was too slow,
// this method has been shelved.
// It might be interesting for a TMS where the business of smushing doesn't
// mesh well with the TMS.  tbl 2005-12-3

Array.prototype.pickOne = function() { 
    for (x in this) {
	delete this[x];
	return x}

function about(kb, subject) {

    var agenda = [subject: true]  // nodes to be smushed with this one
    var done = []

    owl_sameAs = owl('sameAs')
    owl_FunctionalProperty = owl('FunctionalProperty')
    owl_InverseFunctionalProperty = owl('InverseFunctionalProperty')

    var pr, i, y
    pr = kb.each(undefined, rdfType, owl_InverseFunctionalProperty)
    var n = pr.length, ifps = []
    for(i=0, i<n, i++) ifps[pr[i].hashString()] = true

    pr = kb.each(undefined, rdfType, owl_InverseFunctionalProperty)
    n = pr.length, fps = []
    for(i=0, i<n, i++) ifps[pr[i].hashString()] = true

    fps = kb.each(undefined, rdfType, owl_FunctionalProperty)

    for(x = agenda.pickOne(); agenda != []; x = agenda.pickOne()) {
	var plist = kb.statementsMatching(x)
	var qlist = kb.statementsMatching(undefined, undefined, x)

	for (i in plist) {
	    st = plist[i]
	    if (st.plist.sameTermAs(owl_sameAs)) {
		other = st.object
		if (undefined agenda[other] && undefined done[other])
			agenda[other] = true;
	    }
	    if (ifps[(st.predicate.hashString()]) {
		fyi("IFP " + st.predicate )
	    }
	}
    }
}


