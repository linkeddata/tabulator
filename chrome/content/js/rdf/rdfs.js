//  Limited transitive closure for RDF-S etc
//
// This file provides  RDFIndexedFormula a formula (set of triples) which
// indexed by predicate, subject and object.
//
// It "smushes"  (merges into a single node) things which are identical 
// according to owl:sameAs or an owl:InverseFunctionalProperty
// or an owl:FunctionalProperty
//
// Missing: Equating predicates will not propagate these actions if there are >1
//
//  2007-01 Written Tim Berners-Lee
//
// 

/*jsl:option explicit*/ // Turn on JavaScriptLint variable declaration checking





// ends

