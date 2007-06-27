/*
rdfparser.js -

Jim Ley's Version 0.27  Much hacked around by timbl@w3.org

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

Since 0.27:
- Wrote and used proper uri joiner fro relative to absolute (uri.js)
- Got it running on safari
- Speeded up the genid to realSubject translation (was nested loops)
- added interface to RDF store API in AJAR

Note that Triples assume sumjet and object are URI symbols, and have
a separate object, type, lang and datatype.  The last 3 are assumed to apply
to the object.  This allows RDF without bnodes as predicates, literals
as subjects, etc.
*/


// resource class for parser
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
    this.loadRDFXML=_loadRDFXML;
    this.reset = resetTriples
    this.getTriples=function() { return inTriples; }
    var callbackfn=null;
    var baseURL='';
    var doSeeAlso=false;
    var URIS=[];
    var visitedURIS=[];
    var url
    
    function getRDF(url, base, func, seeAlso) {
	// Remove any trailing slashes from URL.  (why? -tbl)
	url = url.replace(/\/*$/,'');     // */
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
	tabulator.log.debug("RDF get return status: " + obj.status +
		    "\n\tURI: " + obj.url +
		    "\n\tcontent-type: " + obj.contentType +
		    "\n\tcontent length " + obj.content.length +
		    "\n\tDOM: "+ obj.domcontent);
	var url = obj.url
	if (obj.status != 200) return callbackfn(obj.status)
	if ((obj.contentType.indexOf('+xml')<0)
		&& (obj.contentType.slice(0,15) != 'application/rdf')
		&& (obj.contentType.slice(0,10) != 'text/plain')
		&& (obj.contentType.slice(0,8) != 'text/xml')  // eg dbview
	// @@ Bug: We do NOT have permission to parse a text/plain document
		&& (obj.contentType.slice(0,15) != 'application/xml'))
	    return callbackfn('Unsupported content type '+obj.contentType);

/*	if (obj.domcontent) {
	    xml = obj.domcontent;
	    tabulator.log.debug("Parsing DOM we seem to have "+obj.domcontent)
	    return GetTriples();
	}
*/

	// For Firefox, we have to ask for permission to access the DOM
	// of a loaded document for which we already have the contents.
	// This is basically a Firefox bug.
	
	if (url.slice(7, 7+document.domain.length) != document.domain) {
	    try {
		netscape.security.PrivilegeManager.enablePrivilege(
			"UniversalBrowserRead")
	    } catch(e) {
		if(typeof alert != 'undefined') alert("Failed to get priviledge "+
		"UniversalBrowserRead to parse "+url+"\n\t"+e)
	    }
	}

  
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
			tabulator.log.debug("Exception near (new DOMParser())parseFromString: "+e)
			if (typeof alert!=null) alert("OK, I give up, you're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
		    }
		}
	    }
	} else {
	    try {
		xml=parseXML(obj.content,null);
	    } catch (e) {}

/*	    if (''+xml=='null') {         // eh?
		xml=parseXML(obj.content,SVGDoc);
		    // Batik area...
	    } */
	}
	try {
	    xmld=xml.documentElement;
	    var a=xml.documentElement.childNodes;
	    gettriples=true;
	} catch (E) {
	    tabulator.log.debug("Exception near xml.documentElement.childNodes: "+E)
	    try {
		xmld=xml.childNodes.item(0);
		gettriples=true;
	    } catch (E) {
		tabulator.log.debug("Exception near xmld=xml.childNodes.item(0): "+E)
		// if (typeof alert != null) alert("No XML Document Found, or not valid XML, or something\n Basically an error so I'm giving up.");
		gettriples=false;
		tabulator.log.debug("Document content:_______\n"+obj.content+"\n____________\n")
		return callbackfn("Can't parse XML: "+E)
	    }

 	} 
	if (gettriples) {
	    GetTriples(inTriples.length);
	}
	callbackfn(obj.status);
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
		         tabulator.log.debug("Trying ActiveXObject")
			 xml=new ActiveXObject ("Microsoft.XMLDOM");
			 xml.async=false;
			 xml.validateOnParse=false;
			 xml.resolveExternals=false;
			 xml.loadXML(xmltxt);
		 } catch (e) {
		    tabulator.log.debug('Exception near new ActiveXObject ("Microsoft.XMLDOM"): '+e)
			 try {
				 tabulator.log.debug("Trying DOMParser")
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
			 } catch (e) {
				tabulator.log.debug('Exception using DOMParser: '+e);
				 if (typeof alert!=null) alert(
				 "Error: No XML parser found. You're not ASV, Batik, IE or\n a Mozilla build or anything else a bit like them.");
			 }
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
	tabulator.log.debug("Parsing XML to RDF triples: " + xmld)
	getNamespaces(xmld);
	var xmlbase = xmld.getAttribute('xml:base');
	if (xmlbase && xmlbase!='') {
	    baseURL=xmlbase;
	}
	    
	var docNodes = xmld.childNodes
	var i, top, node
	for (i=0; i<docNodes.length; i++) {
	    node = docNodes.item(i)
	    if (node.nodeType == 1) {
		top = qnameURI(node.nodeName)
		tabulator.log.debug("Document top element: "+top)
		if (top != (RDF_NS+'RDF')) {
		    tabulator.log.debug ("Not rdf:RDF:  No code to parse this")
		    return undefined
		}
	    }
	    break;
	}
	createPredicates(xmld.childNodes);
	tabulator.log.debug("Parsing phase 1, triples: " + inTriples.length)
	for (var j=offset;j<inTriples.length;j++) {
	    var it=inTriples[j];
    //	tabulator.log.debug("Considering s="+it.subject+" p="+it.predicate+" ty="+it.type
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
    //	tabulator.log.debug("    becomes s="+it.subject+" p="+it.predicate+" ty="+it.type
    //		+ " ob="+it.object)
	}

	tabulator.log.debug("Parsing done, triples: " + inTriples.length)
	return inTriples;
    }
 
    function qnameURI(qn) {
	var colon = qn.indexOf(':');
	if (colon < 0) {
	    return Namespaces['_'] + qn // Default namespace
	} else {
	    var ns = Namespaces['_'+qn.slice(0,colon)]
	    if (typeof ns == 'undefined') {
		tabulator.log.debug("XML parse error: Unbound namespace prefix: "+qn);
		return undefined
	    }
	    return ns + qn.slice(colon+1)
	}
    }
    
    function createPredicates(els) {
	var el,i,j,attr,nn,nv,attrs,ns, old_Namespaces, subject;
	for (i=0;i<els.length;i++) {
	     subject=GenID();
	     el=els.item(i);
	     while (el && el.nodeType!=1) {
		 el=els.item(++i);
	     }
	     if (el) {
		 old_Namespaces = getNamespaces(el);
		 attrs=el.attributes;
		 var vl;
		 if (typeof el.getAttributeNS=='unknown' | typeof el.getAttributeNS=='function') {
			 vl = el.getAttributeNS(RDF_NS,'about');
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
		if (el.childNodes) {
		     AnalyseChildren(subject,el.childNodes);
		}
		Namespaces = old_Namespaces
	    } // if el
	} // for el
    } // function

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
		    var old_Namespaces = getNamespaces(el);
		    nn=el.nodeName;
		    var attrs=el.attributes;
		    vl=getVL(el);
		    if (vl && vl!='') {
			subject=vl;
		    }	
		    var j, nna, nsa, nva;
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
			     var mysubject=nva;
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
		     var old_Namespaces = Namespaces
		     var nvobj=getNodeValue(el);
		     Namespaces = old_Namespaces
		     
		     var nv=nvobj.val;
		     var typ=nvobj.type;
		     var datatype=nvobj.datatype;
		     var lang=nvobj.lang;
		     if (ns==_rdfNS && nn=='Description') {
			 var elf=el.firstChild
			 if (elf) {
			     try {
				 var nn1=String(':'+elf.nodeName+'::').split(':');
				 var ns1=nn1[1];
				 var nn1=nn1[2];
				 for (var ii=0;ii<elf.attributes.length;ii++) {
				     var attr1=elf.attributes.item(ii);
				     var nna1=String(':'+attr1.nodeName+'::').split(':');
				     var nsa1=nna1[1];
				     nna1=nna1[2];
				     var nva1=attr1.nodeValue;
				     if (nsa1!=_rdfNS && nsa1!='xmlns') {
					     inTriples.push(new Triple(subject,Namespaces['_'+nsa1]+nna1,nva1,"literal"));
				     }
				     if (nsa1==_rdfNS && nna1=='resource') {
					     ii=1000;
					     inTriples.push(new Triple(subject,Namespaces['_'+ns1]+nn1,nva1,'resource'));
				     }
				     if (nsa1==_rdfNS && nna1=='literal') {
					     ii=1000;
					     inTriples.push(new Triple(subject,Namespaces['_'+nsa1]+nn1,nva1,'resource'));
				     }
				 }
				 if (ii<1000) {
					 inTriples.push(new Triple(subject,Namespaces['_'+ns1]+nn1,elf.nodeValue,'resource'));
				 }
			     } catch (e) {} //  :-(
			 }
		     } else {
			 var vl=el.getAttribute(_rdfNS+':nodeID');
			 if (vl) {
			     nv='genid:'+vl;
			 }
			 if (ns==_rdfNS & nn=="li") {
			     inTriples.push(new Triple(subject,
				Namespaces['_'+ns]+"_"+(liCount++),nv,typ,datatype,lang));

			 } else {
				 inTriples.push(new Triple(subject,Namespaces['_'+ns]+nn,nv,typ,datatype,lang));
			 }
		     }
		     Namespaces = old_Namespaces;
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
	 var old_Namespaces = getNamespaces(el);
	 var i, j, attrs, els, subj, ns, nn, nv;
	 attrs = el.attributes;
	 var predicate = "";
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
	 var elsl2=els.length;
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
		 
		 var vl=getVL(elsi);
		 if (vl && vl!='') {
			 subj=vl;
		 }	
		 inTriples.push(new Triple(subj,Namespaces['_'+_rdfNS]+"type",Namespaces['_'+ns]+nn,"resource"));
		 var attrs2=elsi.attributes;
		 if (attrs2) {
			 for (var ii=0;ii<attrs2.length;ii++) {
				 var attr=attrs2.item(ii);
				 var nna1=String(':'+attr.nodeName+'::').split(':');
				 var nsa1=nna1[1];
				 nna1=nna1[2];
				 var nva1=attr.nodeValue;
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
	 Namespaces = old_Namespaces
	 return {val:subj,type:'resource'};
    }

    function GenID() {
	 return "genid:"+(++GlobalID);
    }

    // Returns a saved coopy of the Namespace array to be restored at end of el
    function getNamespaces(el) {
	if (!el) {
	    alert("eh? no el? "+el)
	} else {
	     var attr=el.attributes;
	     if (attr && attr.length) {
		var saved = [], nn, ns
		for (nn in Namespaces) saved[nn] = Namespaces[nn]
		var atl=attr.length;
		for (var i=0;i<atl;i++) {
			 nn=':'+attr.item(i).nodeName+"::";
			 nn=nn.split(':')[2];
//			 tabulator.log.debug("Namspace looking at attr "+nn)
			 ns=attr.item(i).nodeValue;
			 ns = URIjoin(ns, baseURL)
			 tabulator.log.debug("   parser: Namespace "+ns)
			 // @@ join base URL here
//			 Namespaces[Namespaces.length]=ns;
			 Namespaces['_'+nn] = ns;
			 if (ns==RDF_NS) {
				 _rdfNS=nn;
			 }
		}
		return saved
	    }
	}
	return Namespaces
    }


 
 function Triple(subject,predicate,object, type, datatype, lang) {
	 if (typeof object == 'undefined') {
	    tabulator.log.warn("parser: No object specified in triple:"+subject+" "+predicate)
	 }
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
	var outTriples=new Array();
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
    var match, outTriples=new Array();
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
		var match=true;
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
	var match, tl=triples.length;
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
	 var subs=Match(triples,null,"http://www.w3.org/2002/07/owl#sameAs",null);
	 var i, j, tri;
	 for (i=0;i<subs.length;i++) {
		 var subjects=SubjectOrObject(triples,subs[i].subject);
		 var objects=SubjectOrObject(triples,subs[i].object);
		 for (j=0;j<subjects.length;j++) {
			 tri=subjects[j];
			 if (tri.predicate!="http://www.w3.org/2002/07/owl#sameAs") {
				 triples.push(replaceTriple(tri,subs[i].subject,subs[i].object))
			 }
		 }
    
		 for (j=0;j<objects.length;j++) {
			 tri=objects[j];
			 if (tri.predicate!="http://www.w3.org/2002/07/owl#sameAs") {
				 triples.push(replaceTriple(tri,subs[i].subject,subs[i].object));
			 }
		 }
	 }
 }
 function replaceTriple(tri,subj,obj) {
	 var s = tri.subject;
	 var o = tri.object;
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
		tabulator.log.debug("xmlhtp = "+xmlhttp)
	}
	return xmlhttp;
 }
 
 if (typeof getURL=='undefined') {
	 getURL=function(url,fn) { 
		 var xmlhttp=new HTTP();
		 if (xmlhttp) {

			 xmlhttp.setRequestHeader('Accept','application/rdf+xml')
// Gives Error: uncaught exception: [Exception... "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIXMLHttpRequest.setRequestHeader]"
//  nsresult: "0x80004005 (NS_ERROR_FAILURE)"  location: "JS frame :: http://www.w3.org/2005/10/ajaw/rdf/parser.js :: anonymous :: line 836"  data: no]

			 xmlhttp.overrideMimeType('text/xml') ///@@  System does not recognize application/rdf+xml as xml alas
			 try {
				xmlhttp.open("GET",url,true,'test','test');
			 } catch (exception) {
			    tabulator.log.debug("Exception: " + exception)
			    fn({status: 999, content: ("Exception: " + exception),
						domcontent: undefined,
						contentType: undefined})
			    return
			 }
			 xmlhttp.onreadystatechange=function() {
				 if (xmlhttp.readyState==4) {
				    
				    fn({status:xmlhttp.status,
					    url:url,
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
//  This layer should later be integrated with the parser more

function RDFLoad(url, base, sink, callback, why) {

    function callback1(status, myRDF, sink, callback) {
	tabulator.log.debug("Callback1 status " + status)
	if (status != 200) return callback(status)
	
	tabulator.log.debug("   callback, triples: " + myRDF.getTriples().length)
	triplesToFormula(myRDF.getTriples(), sink, why)
	myRDF.reset()  // Clear RDF triple accumulator
	callback(status)
	tabulator.log.debug("Callback done, KB size now " + sink.statements.length)
	return

     }
    var myRDF = new RDFParser()  //  parser resource
    tabulator.log.debug("myRDF: "+myRDF+", why="+why)

    tabulator.log.debug("Loading: "+url)
    if (url.slice(7, 7+document.domain.length) != document.domain) {
	try {
	    netscape.security.PrivilegeManager.enablePrivilege(
		    "UniversalBrowserRead")
	} catch(e) {
	    if(typeof alert != 'undefined') alert("Failed to get priviledge "+
	    "UniversalBrowserRead to open "+url)
	}
    }
    /*   only works if script jar'd & signed -- or domainname-based security */
     myRDF.getRDFURL(url, base, function(status)
		    {callback1(status, myRDF, sink, callback)})
}
  
function RDFParseDOM(dom, base, sink, why) {
    var myRDF = new RDFParser()  //  parser resource
    tabulator.log.debug("Parsing DOM: "+dom)
    myRDF.parseDOM(dom, base, sink, why)
    return true;
}
	
function triplesToFormula(triples, F, why) {
    var i, tr
    var genidMap = []
    var lt = triples.length
    tabulator.log.debug("Converting triples why="+why)
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
	var obj
	if (tr.type=='literal') {
	    F.add(map(tr.subject), map(tr.predicate),
		    F.literal(tr.object, tr.lang, tr.datatype), why)
	} else {
	    F.add(map(tr.subject), map(tr.predicate), map(tr.object), why)
	}
	
    }

} 

