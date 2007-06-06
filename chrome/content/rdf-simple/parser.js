/*
rdfparser.seeAlso.js -

Version 0.27

Copyright 2002-5 Jim Ley - http://jibbering.com/
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. The name of the author may not be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Bug: <foaf:interest r:resource="../../2001/sw/DataAccess/" s:label="RDF Data Access Working Group"/>
parses the label attribute as htough it wewre a property of the subject not the resource.

Changes since 0.1 - added in code to do subPropertyOf widgies.
Changes since 0.11 - added in seeAlso code handling, and multiple URL fetching.
Changes since 0.12 - Added some Batik tweaks to get it working.
Changes since 0.13 - Added nodeID support
Changes since 0.14 - fixed rdfNS leak into global scope and xmlbase bugs reported by Ian Dickinson, added in Opera 8.5 support provided by Opera via chaals.
Changes since 0.20 - fixed type bug with default namespace reported by Jia Mi.
Changes since 0.21 - fixed datatype bug, when the datatype was null thanks to Carlo Strozzi.
Changes since 0.22 - Added support for rdf:Bag/Alt/Seq and list properties
Changes since 0.25 - fixed baseurl bug and nodeValue literal non-IE bug, thanks to Carlo Strozzi
Changes since 0.26 - new baseurl bug fix contributed by Carlo Strozzi


Note that Triples assume sumbcet and object are URI symbols, and have
a separate object, type, lang and datatype.  The last 3 are assumed to apply
to the object.  This allows RDF without bnodes as predicates, literals
as subjects, etc.
*/



function RDFParser() {
	var RDF_NS="http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	var RDFS_NS="http://www.w3.org/2000/01/rdf-schema#";

	this.Version="0.30.tbl";
	var C=0;
	var _rdfNS="";
	var GlobalID=0;
	var realSubject=[];
	var inTriples=[];
	var Namespaces=[];
	var xmld=null;
	var xml=null;
	this.Match=Match;
	this.getSingleObject=SingleObject;
	this.getSingleObjectResource=SingleObjectResource;
	this.getRDFURL=getRDF;
	this.parseDOM = parseDOM;
//	this.getRDFNode=GetTriplesNode;
	this.loadRDFXML=_loadRDFXML;
	this.reset = resetTriples
	this.getTriples=function() { return inTriples; }
	var callbackfn=null;
	var baseURL='';
	var doSeeAlso=false;
	var URIS=[];
	var visitedURIS=[];
	
	function getRDF(url, base, func, seeAlso) {
		// Remove any trailing slashes from URL.
		url = url.replace(/\/*$/,'');     // */
		if (typeof url=='object') {
			URIS=url.splice(1,url.length);
			url=url[0];
		}
		callbackfn=func;
		if (base) {
		    baseURL = base
		} else {
		    if (url.indexOf('#')==-1) {
			    baseURL=url;
		    } else {
			    baseURL=url.substr(0,url.indexOf('#'));
		    }
		}
		if (seeAlso) {
			doSeeAlso=true;
		}
		visitedURIS[url]=true;
		getURL(url,ReturnRDF);
	}

 function resetTriples() {
     inTriples = []
     realSubject = []
     Namespaces=[];
 }
 function ReturnRDF(obj) {
	fyi("RDF get return status: " + obj.status +
		    "\n\tcontent-type: " + obj.contentType +
		    "\n\tcontent length " + obj.content.length +
		    "\n\tdom: "+ obj.domcontent);
	if (obj.status != 200) return callbackfn(obj.status)

  
	if (typeof parseXML=='undefined') {
		try {
			xml=new ActiveXObject ("Microsoft.XMLDOM");
			xml.async=false;
			xml.validateOnParse=false;
			xml.resolveExternals=false;
			xml.loadXML(obj.content);
		} catch (e) {
			if (obj.domcontent) {
				xml=obj.domcontent;
			} else {
				try {
					Document.prototype.loadXML = function (s) {
						var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
						while (this.hasChildNodes()) this.removeChild(this.lastChild);
						for (var i = 0; i < doc2.childNodes.length; i++) {
							this.appendChild(this.importNode(doc2.childNodes[i], true));
						}
					}
					xml=document.implementation.createDocument('', '', null);
					xml.loadXML(obj.content);
				} catch (e) {
					if (typeof alert!=null) alert("OK, I give up, you're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
				}
			}
		}
	} else {
		try {
			xml=parseXML(obj.content,null);
		} catch (e){}
		if (''+xml=='null') {
			xml=parseXML(obj.content,SVGDoc);
			// Batik area...
		}
	}
	try {
		xmld=xml.documentElement;
		var a=xml.documentElement.childNodes;
		gettriples=true;
	} catch (E) {
		try {
			xmld=xml.childNodes.item(0);
			gettriples=true;
  	} catch (E) {
			if (typeof alert != null) alert("No XML Document Found, or not valid XML, or something\n Basically an error so I'm giving up.");
			gettriples=false;
		}
 	} 
	if (gettriples) {
		GetTriples(inTriples.length);
	}
	if (doSeeAlso) {
		doSeeAlsos();
	}
	if (URIS.length==0) {
		doSubProperties();
		doOwlSameAs();
		callbackfn(obj.status);
	}
	if (URIS.length>0) {
		url=URIS.pop();
		if (!visitedURIS[url]) {
  		if (url.indexOf('#')==-1) {
				baseURL=url;
			} else {
				baseURL=url.substr(0,url.indexOf('#'));
			}
			doSeeAlso=false;
			getURL(url,ReturnRDF);
		}
	}
 }
 
 function parseDOM(dom, base, sink, why) {
	resetTriples()
	baseURL = base
	xmld = dom
	GetTriples(0)
 	triplesToFormula(inTriples, sink, why)
	resetTriples()  // Clear RDF triple accumulator
 }
 
 function _loadRDFXML(xmltxt) {
	 if (typeof parseXML=='undefined') {
		 try {
		         fyi("Trying ActiveXObject")
			 xml=new ActiveXObject ("Microsoft.XMLDOM");
			 xml.async=false;
			 xml.validateOnParse=false;
			 xml.resolveExternals=false;
			 xml.loadXML(xmltxt);
		 } catch (e) {
/*			 try {      */
				 fyi("Trying DOMParser")
				 Document.prototype.loadXML = function (s) {
					 var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
					 while (this.hasChildNodes()) {
						 this.removeChild(this.lastChild);
					 }
					 for (var i = 0; i < doc2.childNodes.length; i++) {
						 this.appendChild(this.importNode(doc2.childNodes[i], true));
					 }
				 }
				 xml=document.implementation.createDocument('', '', null);
				 xml.loadXML(xmltxt);
/* @@			 } catch (e) {
//				 if (typeof alert!=null) alert(
//				 "Error: No XML parser found. You're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
			 }    @@ */
		 }
	 } else {
		 xml=parseXML(xmltxt,null);
	 }
	 try {
		 var a=xml.documentElement.childNodes;
		 gettriples=true;
	 } catch (E) {
		 if (typeof alert!=null) {
			 alert("No XML Document Found.");
			 gettriples=false;
		 }
	 } 
	 if (gettriples) {
		 GetTriples();
	 }
 }


 
function GetTriples(offset) {
  fyi("Parsing XML to RDF triples: " + xmld)
  getNamespaces(xmld);
  xmlbase=xmld.getAttribute('xml:base');
	if (xmlbase && xmlbase!='') {
		baseURL=xmlbase;
	}
  createPredicates(xmld.childNodes);
  fyi("Parsing phase 1, triples: " + inTriples.length)
  for (var j=offset;j<inTriples.length;j++) {
	var it=inTriples[j];
//	fyi("Considering s="+it.subject+" p="+it.predicate+" ty="+it.type
//		+ " ob="+it.object)
	if (!it.object) { it.object=""; it.type="literal" }
	it.subject = URIjoin(it.subject, baseURL)

	if ( it.type=="resource")  it.object = URIjoin(it.object, baseURL)

	if (it.type!="literal" && it.object==RDF_NS+"Description") {
		inTriples.splice(j--,1); // oops  @@ fix the original parsing?
	}
	var s2 = realSubject[it.subject]
	if (s2) it.subject = s2
	s2 = realSubject[it.object]
	if (s2) it.object = s2
//	fyi("    becomes s="+it.subject+" p="+it.predicate+" ty="+it.type
//		+ " ob="+it.object)
  }
 /*  I think this may have taken a long time with big files -tbl
   for (i=0;i<genids.length;i++) {
	if (genids[i].subject) {
		g=genids[i].id;
		for (j=offset;j<inTriples.length;j++) {
			if (inTriples[j].subject==g) {
				inTriples[j].subject=genids[i].subject;
			}
			if (inTriples[j].object==g) {
				inTriples[j].object=genids[i].subject;
			}
		}
	}
  }
  */
  fyi("Parsing done, triples: " + inTriples.length)
  return inTriples;
 }
 
 /*
 function GetTriplesNode(node,baseURL) {
	 xml=node.getOwnerDocument();
	 getNamespaces(xmld);
	 createPredicates(node.childNodes);
	 for (i=0;i<genids.length;i++) {
		 g=genids[i].id;
		 for (j=0;j<inTriples.length;j++) {
			 if (inTriples[j].subject==g) {
				 inTriples[j].subject=genids[i].subject;
			 }
			 if (inTriples[j].subject==g) {
				 inTriples[j].subject=genids[i].subject;
			 }
			 if (inTriples[j].object==g) {
				 inTriples[j].object=genids[i].subject;
			 }
			 if (inTriples[j].subject.indexOf('#')==0 || inTriples[j].subject.length==0) {
				 inTriples[j].subject=baseURL+inTriples[j].subject;
			 }
			 if (inTriples[j].object.indexOf('#')==0 || inTriples[j].object.length==0) {
				 inTriples[j].object=baseURL+inTriples[j].object;
			 }
		 }
	 }
	 return inTriples;
 }
 
 */
 
 function createPredicates(els) {
	 var el,i,j,attr,nn,nv,attrs,ns;
	 for (i=0;i<els.length;i++) {
		 subject=GenID();
		 el=els.item(i);
		 while (el && el.nodeType!=1) {
			 el=els.item(++i);
		 }
		 if (el) {
			 getNamespaces(el);
			 attrs=el.attributes;
			 if (typeof el.getAttributeNS=='unknown' | typeof el.getAttributeNS=='function') {
				 vl=el.getAttributeNS(RDF_NS,'about');
				 if (!vl) {
					 vl=el.getAttributeNS(RDF_NS,'ID');
					 if (vl) {
						 vl='#'+vl;
					 }
					 if (!vl) {
						 vl=el.getAttributeNS(RDF_NS,'nodeID');
						 if (vl) {
							 vl='genid:'+vl;
						 }
					 }
				 }
			 } else {
				 vl=el.getAttribute(_rdfNS+':about');
				 if (!vl) {
					 vl=el.getAttribute(_rdfNS+':ID');
					 if (vl) {
						 vl='#'+vl;
					 }
					 if (!vl) {
						 vl=el.getAttribute(_rdfNS+':nodeID');
						 if (vl) {
							 vl='genid:'+vl;
						 }
					 }
				 }
			 }
			 if (vl && vl!='') {
				 subject=vl;
			 }
			 for (j=0;j<attrs.length;j++) {
				 attr=attrs.item(j);
				 nn=String(':'+attr.nodeName+'::').split(':');
				 ns=nn[1];
				 nn=nn[2];
				 nv=attr.nodeValue;
				 if (ns!=_rdfNS && ns!='xmlns') {
					 inTriples.push(new Triple(subject,Namespaces['_'+ns]+nn,nv,"literal")); // Bug?? subject correct
				 }
				 if (ns==_rdfNS && nn=='about') {
					 realSubject[subject] = nv;
					 if (!(Namespaces['_'+_rdfNS]+"type"=="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
					    && Namespaces['_'+ns]+el.nodeName=="http://www.w3.org/1999/02/22-rdf-syntax-ns#rdf:Description")) {
					    // @@ Do what?
					 }
				 }
			 }
		 }
		 if (el) {
			 nn=String(':'+el.nodeName+'::').split(':');
			 ns=nn[1];
			 nn=nn[2];
			 if (ns!=_rdfNS) {
				 if (el.nodeName.indexOf(':')==-1) {
					 ses=['','',el.nodeName];
				 } else {
					 var ses=String(':'+el.nodeName+'::').split(':');
				 }
				 inTriples.push(new Triple(subject,Namespaces['_'+_rdfNS]+"type",Namespaces['_'+ses[1]]+ses[2],"resource"));
			 }
		 }
		 if (el && el.childNodes) {
			 AnalyseChildren(subject,el.childNodes);
		 }
	 }
 }

 function getVL(el) {
	 var vl;
	 if (typeof el.getAttributeNS=='unknown' | typeof el.getAttributeNS=='function') {
		 vl=el.getAttributeNS(RDF_NS,'about');
		 if (!vl) {
			 vl=el.getAttributeNS(RDF_NS,'ID');
			 if (vl) {
				 vl='#'+vl;
			 }
		 }
	 } else {
		 vl=el.getAttribute(_rdfNS+':about');
		 if (!vl) {
			 vl=el.getAttribute(_rdfNS+':ID');
			 if (vl) {
				 vl='#'+vl;
			 }
		 }
	 }
	 return vl;
 }

 function AnalyseChildren(subject,els) {
	 var liCount=1;
	 var el,i,n,attr,nn,nv,attr,ns,elsl;
	 if (els) {
		 elsl=els.length;
		 for (var i=0;i<elsl;i++) {
			 el=els.item(i);
			 while (el && el.nodeType!=1) {
				 el=els.item(++i);
			 }
			 if (el) {
				 getNamespaces(el);
				 nn=el.nodeName;
				 attrs=el.attributes;
				 vl=getVL(el);
				 if (vl && vl!='') {
					 subject=vl;
				 }	
				 for (j=0;j<attrs.length;j++) {
					 attr=attrs.item(j);
					 nna=String(':'+attr.nodeName+'::').split(':');
					 nsa=nna[1];
					 nna=nna[2];
					 nva=attr.nodeValue;
					 if (nsa!=_rdfNS && nsa!='xmlns') {
						 if (Namespaces['_'+nsa]) {
							 inTriples.push(new Triple(subject,Namespaces['_'+nsa]+nna,nva,"literal"));
						 }
					 }
					 if (nsa==_rdfNS && nna=='about') {
						 mysubject=nva;
						 realSubject[subject] = nva;
						 if (!(Namespaces['_'+_rdfNS]+"type"=="http://www.w3.org/1999/02/22-rdf-syntax-ns#type" && Namespaces['_'+ns]+el.nodeName=="http://www.w3.org/1999/02/22-rdf-syntax-ns#rdf:Description")) {
							 inTriples.push(new Triple(subject,Namespaces['_'+_rdfNS]+"about",mysubject,"resource"));
						 }
					 }
				 }
				 if (nn.indexOf(':')==-1) {
					 ns='';
				 } else {
					 ns=nn.split(':')[0];
					 nn=nn.split(':')[1];
				 }
				 nvobj=getNodeValue(el);
				 nv=nvobj.val;typ=nvobj.type;datatype=nvobj.datatype;lang=nvobj.lang;
				 if (ns==_rdfNS && nn=='Description') {
					 var elf=el.firstChild
						 if (elf) {
							 try {
								 nn1=String(':'+elf.nodeName+'::').split(':');
								 ns1=nn1[1];
								 nn1=nn1[2];
								 for (var ii=0;ii<elf.attributes.length;ii++) {
									 attr1=elf.attributes.item(ii);
									 nna1=String(':'+attr1.nodeName+'::').split(':');
									 nsa1=nna1[1];
									 nna1=nna1[2];
									 nva1=attr1.nodeValue;
									 if (nsa1!=_rdfNS && nsa1!='xmlns') {
										 inTriples.push(new Triple(subject,Namespaces['_'+nsa1]+nna1,nva1,"literal"));
									 }
									 if (nsa1==_rdfNS && nna1=='resource') {
										 ii=1000;
										 inTriples.push(new Triple(subject,Namespaces['_'+ns1]+nn1,nva1,'resource'));
									 }
									 if (nsa1==_rdfNS && nna1=='literal') {
										 ii=1000;
										 inTriples.push(new Triple(subject,Namespaces['_'+nsa1]+nn1,nv1,'resource'));
									 }
								 }
								 if (ii<1000) {
									 inTriples.push(new Triple(subject,Namespaces['_'+ns1]+nn1,elf.nodeValue,'resource'));
								 }
							 } catch (e) {}
						 }
				 } else {
					 vl=el.getAttribute(_rdfNS+':nodeID');
					 if (vl) {
						 nv='genid:'+vl;
					 }
					 if (ns==_rdfNS & nn=="li") {
						 inTriples.push(new Triple(subject,Namespaces['_'+ns]+"_"+(liCount++),nv,typ,datatype,lang));

					 } else {
						 inTriples.push(new Triple(subject,Namespaces['_'+ns]+nn,nv,typ,datatype,lang));
					 }
				 }
			 }
		 } 
	 }
 }		
 
 function getFCVal(el) {
	 if (el.firstChild.xml) {
		 return el.firstChild.xml;
	 } else {
		 return el.firstChild.nodeValue;
	 }
 }
 function getNodeValue(el) {
	 getNamespaces(el);
	 var i,attr,els,subj;
	 attrs=el.attributes;
	 predicate="";
	 for (j=0;j<attrs.length;j++) {
		 attr=attrs.item(j);
		 nn=String(':'+attr.nodeName+'::').split(':');
		 ns=nn[1];
		 nn=nn[2];
		 nv=attr.nodeValue;
		 if (ns==_rdfNS && nn=='parseType' && nv=='Resource') {
			 subj=GenID();
			 AnalyseChildren(subj,el.childNodes);
			 return {val:subj,type:'resource'};
		 }
		 if (ns==_rdfNS && nn=='datatype') {
			 try {
				 return {val:getFCVal(el),type:'literal',datatype:nv};
			 }catch (e) {
				 return {val:"",type:'literal',datatype:nv};
			 }
		 }
		 if (ns=='xml' && nn=='lang') {
			 return {val:getFCVal(el),type:'literal',lang:nv};
		 }
		 if (ns==_rdfNS && nn=='about') {
			 return {val:nv,type:'resource'};
		 }
		 if (ns==_rdfNS && nn=='resource') {
			 return {val:nv,type:'resource'};
		 }
		 if (ns==_rdfNS && nn=='literal') {
			 return {val:getFCVal(el),type:'literal'};
		 }
	 }
	 els=el.childNodes;
	 elsl2=els.length;
	 if (elsl2==0) {
		 return "";
	 }
	 if (elsl2==1 && els.item(0).nodeType==3) {
		 return {val:els.item(0).nodeValue,type:'literal'};
	 }
	 var iii=0;
	 while (els.item(iii) && els.item(iii).nodeType==3) {
		 iii++;
	 }
	 var elsi=els.item(iii);
	 subj=GenID();
	 if (elsi!=null) {
		 nn=String(':'+elsi.nodeName+'::').split(':');
		 if (nn.length==4) {
			 ns="";nn=nn[1];
		 } else {
			 ns=nn[1];
			 nn=nn[2];
		 }
		 
		 vl=getVL(elsi);
		 if (vl && vl!='') {
			 subj=vl;
		 }	
		 inTriples.push(new Triple(subj,Namespaces['_'+_rdfNS]+"type",Namespaces['_'+ns]+nn,"resource"));
		 attrs2=elsi.attributes;
		 if (attrs2) {
			 for (var ii=0;ii<attrs2.length;ii++) {
				 var attr=attrs2.item(ii);
				 nna1=String(':'+attr.nodeName+'::').split(':');
				 nsa1=nna1[1];
				 nna1=nna1[2];
				 nva1=attr.nodeValue;
				 if (nsa1!=_rdfNS && nsa1!='xmlns') {
					 inTriples.push(new Triple(subj,Namespaces['_'+nsa1]+nna1,nva1,"literal"));
				 }
			 }
			 if ((typeof elsi.getAttributeNS=='unknown' | typeof elsi.getAttributeNS=='function') && elsi.getAttributeNS(RDF_NS,'about')!='') {
				 realSubject[subj] = elsi.getAttributeNS(RDF_NS,'about');
			 } else {
				 if (elsi.getAttribute(_rdfNS+':about')!='') {
					 realSubject[subj] = elsi.getAttribute(_rdfNS+':about');
				 }
			 }
		 }
		 AnalyseChildren(subj,elsi.childNodes);
	 }
	 return {val:subj,type:'resource'};
 }

 function GenID() {
	 return "genid:"+(++GlobalID);
 }

//  Enters the namespace against "_"+ the prefix and ALSO against a number.
//  (This is maybe because one can't iterate over the associative array?)
 function getNamespaces(el) {
	 if (el) {
		 var nn,ns;
		 var attr=el.attributes;
		 if (attr) {
			 var atl=attr.length;
			 for (var i=0;i<atl;i++) {
				 nn=':'+attr.item(i).nodeName+"::";
				 nn=nn.split(':')[2];
				 ns=attr.item(i).nodeValue;
				 Namespaces[Namespaces.length]=ns;
				 Namespaces['_'+nn]=Namespaces[Namespaces.length-1];
				 if (ns==RDF_NS) {
					 _rdfNS=nn;
				 }
			 } 
		 }
	 }
 }


 
 function Triple(subject,predicate,object, type, datatype, lang) {
	 this.subject=subject;
	 this.predicate=predicate;
	 this.object=object;
	 this.type=type;
	 this.lang=lang;
	 this.datatype=datatype;
	 return this;
 }

 function SubjectOrObject(triples,uri) {
	if (triples==null) {
		triples=inTriples;
	}
	outTriples=new Array();
	for (var i=0;i<triples.length;i++) {
		var ti=triples[i];
		if (ti.subject==uri || ti.object==uri) {
			outTriples.push(ti);
		}
	}
	return outTriples;
 }

function Match(triples,s,p,o) {
	if (triples==null) {
		triples=inTriples;
	}
	outTriples=new Array();
	for (var i=0;i<triples.length;i++) {
		var ti=triples[i];
		match=true;
		if (!(s==null || ti.subject==s)) {
			match=false;
		}
		if (!(p==null || ti.predicate==p)) {
			match=false;
		}
		if (!(o==null || ti.object==o)) {
			match=false;
		}
		if (match) {
			outTriples.push(ti);
		}
	}
	return outTriples;
 }


function SingleObject(triples,s,p,o) {
	if (triples==null) {
		triples=inTriples;
	}
	for (var i=0;i<triples.length;i++) {
		var ti=triples[i];
		match=true;
		if (!(s==null || ti.subject==s)) {
			match=false;
		}
		if (!(p==null || ti.predicate==p)) {
			match=false;
		}
		if (match) {
			return(ti.object);
		}
	}
	return "";
 }

function SingleObjectResource(triples,s,p,o) {
	if (triples==null) {
		triples=inTriples;
	}
	tl=triples.length;
	for (var i=0;i<tl;i++) {
		var ti=triples[i];
		match=true;
		if (!(s==null || ti.subject==s)) {
			match=false;
		}
		if (!(p==null || ti.predicate==p)) {
			match=false;
		}
		if (!(ti.type=='resource')) {
			match=false;
		}
		if (match) {
			return(ti.object);
		}
	}
	return "";
 }

 function doOwlSameAs(triples) {
	 if (triples==null) {
		 triples=inTriples;
	 }
	 subs=Match(triples,null,"http://www.w3.org/2002/07/owl#sameAs",null);
	 for (i=0;i<subs.length;i++) {
		 var subjects=SubjectOrObject(triples,subs[i].subject);
		 var objects=SubjectOrObject(triples,subs[i].object);
		 for (j=0;j<subjects.length;j++) {
			 var tri=subjects[j];
			 if (tri.predicate!="http://www.w3.org/2002/07/owl#sameAs") {
				 triples.push(replaceTriple(tri,subs[i].subject,subs[i].object))
			 }
		 }
		 for (j=0;j<objects.length;j++) {
			 var tri=objects[j];
			 if (tri.predicate!="http://www.w3.org/2002/07/owl#sameAs") {
				 triples.push(replaceTriple(tri,subs[i].subject,subs[i].object));
			 }
		 }
	 }
 }
 function replaceTriple(tri,subj,obj) {
	 var s=tri.subject;
	 var o=tri.object;
	 if (s==subj) {
		 s=obj;
	 } else {
		 if (s==obj) {
			 s=subj;
		 }
	 }
	 if (o==subj) {
		 o=obj;
	 } else {
		 if (o==obj) {
			 o=subj;
		 }
	 }
	 return new Triple(s,tri.predicate,o,tri.type,tri.datatype,tri.lang);
 }

 function doSubProperties(triples) {
	 if (triples==null) {
		 triples=inTriples;
	 }
	 subs=Match(triples,null,RDFS_NS+"sameAs",null);
	 for (i=0;i<subs.length;i++) {
		 props=Match(triples,null,subs[i].subject,null);
		 for (j=0;j<props.length;j++) {
			 triples.push(new Triple(props[j].subject,subs[i].object,props[j].object,props[j].type));
		 }
	 }
 }

 function doSeeAlsos() {
	 var subs=Match(inTriples,null,RDFS_NS+"seeAlso",null);
	 for (i=0;i<subs.length;i++) {
		 if (!URIS[subs[i].object]) {
			 URIS.push(subs[i].object);
			 URIS[subs[i].object]=URIS[URIS.length-1];
		 }
	 }
 }


// See http://developer.apple.com/internet/webcontent/xmlhttpreq.html


function HTTP() {
	var xmlhttp;
	/*@cc_on @*/
	/*@if (@_jscript_version >= 5)
		try {
		xmlhttp=new ActiveXObject("Msxml2.XMLHTTP")
		} catch (e) {
		try {
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
		} catch (E) {
    xmlhttp=false
		}
		}
		@else
		xmlhttp=false
		@end @*/
	if (!xmlhttp) {
		try {
			xmlhttp = new XMLHttpRequest();
		} catch (e) {
			xmlhttp=false;
		}
		fyi("xmlhtp = "+xmlhttp)
	}
	return xmlhttp;
 }
 
 if (typeof getURL=='undefined') {
	 getURL=function(url,fn) { 
		 var xmlhttp=new HTTP();
		 if (xmlhttp) {
//			 xmlhttp.setRequestHeader('Accept','application/rdf+xml')
// Error: uncaught exception: [Exception... "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIXMLHttpRequest.setRequestHeader]"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"  location: "JS frame :: http://www.w3.org/2005/10/ajaw/rdf/parser.js :: anonymous :: line 836"  data: no]
			 xmlhttp.overrideMimeType('text/xml') ///@@  System does not recognize application/rdf+xml as xml alas
			 try {
			    xmlhttp.open("GET",url,true,'test','test');
			 } catch (exception) {
			    fyi("Exception: " + exception)
			    fn({status: 999, content: ("Exception: " + exception),
						domcontent: undefined,
						contentType: undefined})
			    return
			 }
			 xmlhttp.onreadystatechange=function() {
				 if (xmlhttp.readyState==4) {
//				    if ((xmlhttp.status != 200)
//					&& (typeof alert!=null))
//					    alert("Error: HTTP response: "+xmlhttp.status);
				    
				    fn({status:xmlhttp.status,
						content:xmlhttp.responseText,
						domcontent:xmlhttp.responseXML,
						contentType:xmlhttp.getResponseHeader("Content-Type")})
				    
				 }
			 }
			 xmlhttp.send(null);
		 } else {
			 //Some Appropriate Fallback...
			 if (typeof alert!=null) {
				 alert("OK, I give up, you're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
			 }
		 }
	 }
 }
 if (typeof postURL=='undefined') {
	 postURL=function(url,txt,fn,type,enc) {
		 var xmlhttp=new HTTP();
		 if (xmlhttp) {
			 xmlhttp.open("POST",url,true,'test','test');
			 if (enc) xmlhttp.setRequestHeader("Content-Encoding",enc)
				 if (type) xmlhttp.setRequestHeader("Content-Type",type)
					 xmlhttp.onreadystatechange=function() {
					 if (xmlhttp.readyState==4) {
						 fn({status:xmlhttp.status,content:xmlhttp.responseText,
										domcontent:xmlhttp.responseXML,
										contentType:xmlhttp.getResponseHeader("Content-Type")});
					 }
				 }
			 xmlhttp.send(txt);
		 } else {
			 //Some Appropriate Fallback...
			 if (typeof alert!=null) {
				 alert("Error. can't make XMLHTTP object.OK, I give up: you're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
			 }
		 }
	 }
 }
} // RDFParser()



//////////////////////// Interface to term.js etc
//
// The interface is in the style of cwm and rdlib
//  This layer shoulkd later be integrated with the parse more

function RDFLoad(url, base, sink, callback, why) {

    function callback1(status, myRDF, sink, callback) {
	fyi("Callback1 status " + status)
	if (status != 200) return callback(status)
	
	fyi("   callback, triples: " + myRDF.getTriples().length)
	triplesToFormula(myRDF.getTriples(), sink, why)
	myRDF.reset()  // Clear RDF triple accumulator
	callback(status)
	fyi("Callback done, KB size now " + sink.statements.length)
	return

     }
    var myRDF = new RDFParser()  //  parser resource
    fyi("myRDF: "+myRDF+", why="+why)

    fyi("Loading: "+url)
/*     netscape.security.PrivilegeManager.enablePrivilege(
    "UniversalPreferencesRead")  only works if script jar'd & signed */
     myRDF.getRDFURL(url, base, function(status)
		    {callback1(status, myRDF, sink, callback)})
}
  
function RDFParseDOM(dom, base, sink, why) {
    var myRDF = new RDFParser()  //  parser resource
    fyi("Parsing DOM: "+dom)
    myRDF.parseDOM(dom, base, sink, why)
    return;
}
	
function triplesToFormula(triples, F, why) {
    var i, tr
    var genidMap = []
    var lt = triples.length
    fyi("Converting triples why="+why)
    function map(uri) {
	var term
	if (uri.slice(0,6) =='genid:') {
	    if (typeof genidMap[uri] == 'undefined') {
		term = F.bnode()
		genidMap[uri] = term
	    } else {
		term = genidMap[uri]
	    }
	    return term
	}
	return F.sym(uri)
    }

    for (i=0; i<lt; i++) {
	tr = triples[i]
	if (typeof tr.subject == 'undefined') {
	    fyi(i + ")triple s=" + tr.subject + ", p=" + tr.predicate + 
		", o=" + tr.object +  ", lang=" + tr.lang + ", dt=" + tr.datatype)
	    fyi("    ignored!"); // For some reason all-undefined statements
	    continue
	}
	var obj
	if (tr.type=='literal') {
	    F.add(map(tr.subject), map(tr.predicate),
		    F.literal(tr.object, tr.lang, tr.datatype), why)
	} else {
	    F.add(map(tr.subject), map(tr.predicate), map(tr.object), why)
	}
	
    }

} 

