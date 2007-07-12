//This should be in n3

/* Design Issue
   kb.whether
   
   Make use of collection well
   tabont('element')
   kb.fromNT
   
   discuss literal stuff
   what are Set,List?
   
   getAbout bug...give up understanding why double click on collection works...
*/

var ThisSession=kb.the(undefined,RDFS('label'),kb.literal("This Session"));
sf.requestURI("http://dig.csail.mit.edu/2005/ajar/ajaw/js/internalKnowledge.js",ThisSession);
var thisDocTerm=kb.sym("http://dig.csail.mit.edu/2005/ajar/ajaw/tab/js/internalKnowledge.js");

//fake knowledge!! contradiction? (For smushing on URI to work)
//kb.add(kb.sym('http://www.w3.org/2006/link#uri'),rdf('type'),OWL('InverseFunctionalProperty'),thisDocTerm);
kb.add(kb.sym('http://www.w3.org/2006/link#uri'),rdf('type'),OWL('DatatypeProperty'),thisDocTerm);

//FOAF related
kb.add(foaf('nick'),RDFS('subPropertyOf'),RDFS('label'),thisDocTerm);//fake knowledge!!
kb.add(foaf('mbox'),rdf('type'),OWL('DatatypeProperty'),thisDocTerm);

kb.add(kb.sym("http://usefulinc.com/ns/doap#developer"),rdf('type'),OWL('ObjectProperty'),thisDocTerm);