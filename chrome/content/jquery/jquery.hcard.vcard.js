/*
 * jQuery hCard to vCard for rdfQuery @VERSION
 * http://www.w3.org/2006/vcard/hcard2rdf.xsl
 * http://www.w3.org/2006/vcard/ns#
 * some examples are from http://microformats.org/wiki/hcard-examples
 * 
 * Copyright (c) 2008 Libby Miller
 * Licensed under the MIT (MIT-LICENSE.txt)
 *
 * Depends:
 *	jquery.uri.js
 *	jquery.xmlns.js
 *	jquery.curie.js
 *	jquery.datatype.js
 *	jquery.rdf.js
 */
/*global jQuery */

(function ($) {

	var v = 'http://www.w3.org/2006/vcard/ns#';


	testForVcardClass = function () {

		var vcards = $.rdf.databank([], 
			{namespaces: 
				{ 
				v: 'http://www.w3.org/2006/vcard/ns#'
				} 
			});

		var base;

		//base element in head
		var h = $('base');
			if(h && h[0]){
				var attr = h[0].getAttribute("href");
				base = attr;
			}

		//base as attribute on html element
		if(!base){
		h = $('html');
			if(h && h[0]){
				var attr = h[0].getAttributeNS('http://www.w3.org/XML/1998/namespace','base');
				base = attr;

			}
		}

		//base as attribute on body element
		if(!base){
		h = $('body');
			if(h && h[0]){
				var attr = h[0].getAttributeNS('http://www.w3.org/XML/1998/namespace','base');
				base = attr;

			}
		}

		//loop through vcards
		var cl = $('*.vcard');
			for (var i = 0; i < cl.length; i++) {

				var c = cl[i],
				ids = $('@id'),
				root;

				//capture ID if present for the root of the vcard
				if (ids[0]) {
					root = $.rdf.resource('<' + $.uri.base() + '#' + ids[0] + '>');
				} else {
					root = $.rdf.blank('[]');
				}

				var triple = $.rdf.triple(root, $.rdf.type, $.rdf.resource('<' + v + 'Vcard>'));
				vcards.add(triple);
 
				//namenode is a new object which many name-related properties hang off
				var nameNode = $.rdf.blank("[]");
				var nameNodeFound = false;
				
				var descendants = c.getElementsByTagName('*');
				for (var k = 0; k < descendants.length; k++) {
					var x = descendants[k];
					var cName = x.className;

					var reg = /(?:^|\s)fn(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'fn>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);

						//special case "implied-n-optimization"
						//exactly two words, we make an 'n' and given-name and family-name
						reg = /^(\w+)\s+(\w+)$/
						var res = reg.exec(fn);
						 if (res) {
							nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);

							 var triple3 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'given-name>'), '"'+res[1]+'"');
							 var triple4 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'family-name>'), '"'+res[2]+'"');
				  			   vcards.add(triple3);
					  		   vcards.add(triple4);
						}
					}


					//name object. Sometimes implied, sometimes explicit
					reg = /(?:^|\s)n(?:\s|$)/					
					if (reg.exec(cName)) {
						nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}


					//names (except nickname) are all properties of the name object
					reg = /(?:^|\s)given-name(?:\s|$)/
					if (reg.exec(cName)) {

						//check for n; if not there, add it - http://microformats.org/wiki/hcard#Implied_.22n.22_Optimization
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'given-name>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
							nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}

					reg = /(?:^|\s)family-name(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'family-name>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
						nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}
					reg = /(?:^|\s)additional-name(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'additonal-name>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
						nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}
					reg = /(?:^|\s)honorific-prefix(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-prefix>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
						nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}
					reg = /(?:^|\s)honorific-suffix(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'honorific-suffix>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
						nameNodeFound = addNameNode(nameNodeFound,root,nameNode,vcards);
					}

					//end of name object handling

					//nickname is a property of the vcard not the name object
					reg = /(?:^|\s)nickname(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);

						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'nickname>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}

//url is a resource if it has http:// in it
					reg = /(?:^|\s)url(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						if(fn.indexOf('/')==0){

							if(base){
								if(base.lastIndexOf("/")==base.length-1){
								   base = base.substring(0,base.length-1)
								}
								var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.resource('<' + base +'' + fn + '>'));							
							}else{
								  var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.resource('<' + $.uri.base() +'' + fn + '>'));
							}
							   vcards.add(triple1);
					   } else if(fn.indexOf('http://')==-1){
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.literal('"'+fn+'"'));
							   vcards.add(triple1);
					   } else {
						   var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'url>'), $.rdf.resource('<'+fn+'>'));
							   vcards.add(triple1);
					   }
					}
/*
email

e.g.
  <a class="email" href="mailto:neuroNOSPAM@t37.net">
	 <span class="type">pref</span><span>erred email</span>
  </a>
*/	
					reg = /(?:^|\s)email(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						var emailDescendants = x.getElementsByTagName('*');
						for (var j = 0; j < emailDescendants.length; j++) {
							var y=emailDescendants[j];
							var yName= y.className;
							if(yName.indexOf('type')!=-1){
								var type = getUrlType(y);

								var prop = "email";
								if(type.toLowerCase()=="home" || type.toLowerCase()=="personal"){
									prop="personalEmail";
								}
								if(type.toLowerCase()=="work" || type.toLowerCase()=="office"){
									prop="workEmail";
								}
								if(type.toLowerCase()=="mobile"){
									prop="mobileEmail";
								}

								//because it's rdf, we want mailto (vcard is the reverse
								if(fn.indexOf("mailto:")!=0){
									fn = 'mailto:' + fn;
								}
								var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.resource('<'+fn+'>'));
								vcards.add(triple1);
															 
							}
						}
						if(emailDescendants.length==0){

								//because it's rdf, we want mailto (vcard is the reverse)
								if(fn.indexOf("mailto:")!=0){
									fn = 'mailto:' + fn;
								}							
								if(fn.indexOf("?")!=-1){
								fn = fn.substring(0,fn.indexOf("?"));
							}
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'email>'), $.rdf.resource('<'+fn+'>'));
							vcards.add(triple1);
						}
					 
					}

/*

tel
	<div class="tel">
	<dt>Phone (<span class="type">home</span>)</dt>
	<dd><span class="value">+438123418</span></dd>
	</div>

*/

					reg = /(?:^|\s)tel(?:\s|$)/
					if (reg.exec(cName)) {

						var telDescendants = x.getElementsByTagName('*');
						if(telDescendants.length==0){
						var val = getUrlType(x);

							if(val.indexOf("tel:")==0){
								  val=val.substring(4);
							}
							if(val.indexOf("fax:")==0){
								  val=val.substring(4);
							}
							if(val.indexOf("modem:")==0){
								  val=val.substring(6);
							}

							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'tel>'), $.rdf.resource('<tel:'+val+'>'));
							vcards.add(triple1);
						}

						var props = ["tel"];

						var val = '';
							
						for (var j = 0; j < telDescendants.length; j++) {
							var y=telDescendants[j];
							var yName = y.className;

							if(yName.indexOf('type')!=-1){
								var type = y.getAttribute("title");
									if(!type){
									 	type = y.textContent;
									 }
								if(type && type.toLowerCase()=="cell"){
									props.push("mobileTel");
								}									   
								if(type && type.toLowerCase()=="work" || type.toLowerCase()=="office"){
									props.push("workTel");
								}
								if(type && type.toLowerCase()=="fax") {
									props.push("fax");
								}
								if(type && type.toLowerCase()=="home"){
									props.push("homeTel");
								}

							}else if(yName.indexOf('value')!=-1){
								val = val + y.textContent;							  
							}

						}


//do we need to separate with '-'?
							if(val){

								if(val.indexOf("tel:")==0){
								   val=val.substring(4);
								}
								if(val.indexOf("fax:")==0){
								   val=val.substring(4);
								}
								if(val.indexOf("modem:")==0){
								   val=val.substring(6);
								}

								for(var k = 0; k < props.length; k++){
				 				  	var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + props[k] + '>'), $.rdf.resource('<tel:'+val+'>'));
									vcards.add(triple1);
								}
							}
					}

/*

adr

example:
  <span class="adr">
	 <span class="street-address">12 rue Danton</span>
	 <span class="locality">Le Kremlin-Bicetre</span>
	 <span class="postal-code">94270</span>
	 <span class="country-name">France</span>
  </span>

*/

					reg = /(?:^|\s)adr(?:\s|$)/
					var adrNode = $.rdf.blank("[]");
					var adrType="adr";


					if (reg.exec(cName)) {

//check for type

					var adrParentDescendants = c.getElementsByTagName('*');
						for(var l = 0; l < adrParentDescendants.length; l++){
							var d = adrParentDescendants[l];
							if(d.getAttribute("class")=="type"){

								if(val=="home" || val=="personal"){
									adrType="homeAdr";
								}
								if(val=="work" || val=="office"){
									adrType="workAdr";
								}

							}
						}
					 var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + adrType + '>'), adrNode);
					vcards.add(triple1);
					 var triple5 = $.rdf.triple(adrNode, $.rdf.type, '<'+v+'Address>');
					vcards.add(triple5);

						var adrDescendants = x.getElementsByTagName('*');
						for (var j = 0; j < adrDescendants.length; j++) {
							var y=adrDescendants[j];
							var val=y.textContent;
							var prop= y.className;

								if(prop!=""){
									  var triple1 = $.rdf.triple(adrNode, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
									 vcards.add(triple1);
								}
						}


					}

//label
					reg = /(?:^|\s)label(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);

						var triple1 = $.rdf.triple(nameNode, $.rdf.resource('<' + v + 'label>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);

					}


/*

geo:

  <span class="geo">
	 <abbr class="latitude" title="48.816667">N 48¡ 81.6667</abbr>
	 <abbr class="longitude" title="2.366667">E 2¡ 36.6667</abbr>
  </span>

- also in a short form

*/

					reg = /(?:^|\s)geo(?:\s|$)/
					if (reg.exec(cName)) {
						var geoDescendants = x.getElementsByTagName('*');
						var val = getTextType(x);

							//short form
							if(val.indexOf(";")!=-1){
							
								var lat= val.substring(0,val.indexOf(";"));
								var lo= val.substring(val.indexOf(";")+1);

								var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'latitude>'), $.rdf.literal('"'+lat+'"'));
							   	vcards.add(triple1);

								var triple6 = $.rdf.triple(root, $.rdf.resource('<' + v + 'longitude>'), $.rdf.literal('"'+lo+'"'));
							   	vcards.add(triple6);
							}

							 for (var j = 0; j < geoDescendants.length; j++) {
								 var y = geoDescendants[j];
								var val = getTextType(y);

								 var prop = y.className;
								 	if(prop=="lat" || prop=="long"){
		 							  var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
									 vcards.add(triple1);
									}

	   						}
					}



//tz, photo, logo, sound, are straightforward

					reg = /(?:^|\s)tz(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);

						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'tz>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}


					reg = /(?:^|\s)photo(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'photo>'), $.rdf.resource('<'+fn+'>'));
						  vcards.add(triple1);
					}

					reg = /(?:^|\s)logo(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'logo>'), $.rdf.resource('<'+fn+'>'));
						  vcards.add(triple1);
					}

					reg = /(?:^|\s)sound(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'sound>'), $.rdf.resource('<'+fn+'>'));
						  vcards.add(triple1);

					}


/*

bday:

	<div class="bday">
	<dt>Birthday</dt>
	<dd>
		<abbr class="value" title="1985-10-27T00:00:00Z">October 27, 1985</abbr>
	</dd>
	</div>

*/

					reg = /(?:^|\s)bday(?:\s|$)/
					if (reg.exec(cName)) {

						var bdayDescendants = x.getElementsByTagName('*');

						if(bdayDescendants.length==0){
							var val = x.getAttribute("title");
							var prop = x.className;
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
							   vcards.add(triple1);
						
						}else{

							 for (var j = 0; j < bdayDescendants.length; j++) {
								 var y = bdayDescendants[j];
								 var val = y.getAttribute("title");
								 var prop = y.className;
								 var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
					   			vcards.add(triple1);
							}
						}
					}



//title, role are simple

					reg = /(?:^|\s)title(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);

						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'title>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}
						
					reg = /(?:^|\s)role(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
					  
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'role>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}
 
//org is trickier

					reg = /(?:^|\s)org(?:\s|$)/
					if (reg.exec(cName)) {
						var orgDescendants = x.getElementsByTagName('*');
						var orgNode = $.rdf.blank("[]");
						var subnodes = false;

						for (var j = 0; j < orgDescendants.length; j++) {
							var y = orgDescendants[j];
							var val = getUrlType(y);
							var prop = y.className;
							if(val && prop){
								var triple3 = $.rdf.triple(orgNode, $.rdf.resource('<' + v + '' + prop + '>'), $.rdf.literal('"'+val+'"'));
								vcards.add(triple3);
								subnodes=true;
							}
						}
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'org>'), orgNode);
						var triple2 = $.rdf.triple(orgNode, $.rdf.type, $.rdf.resource('<' + v + 'Organization>')); //should check if it has a name
						  vcards.add(triple1);
						  vcards.add(triple2);

						if(!subnodes){
						var fn = getUrlType(x);

							var triple4 = $.rdf.triple(orgNode, $.rdf.resource('<' + v + 'organization-name>'), $.rdf.literal('"'+fn+'"'));

							   vcards.add(triple4);

						}
						
					}



//category note class are simple

					reg = /(?:^|\s)category(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'category>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);

					}

					reg = /(?:^|\s)note(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'note>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);

					}

					reg = /(?:^|\s)class(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'class>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}

//key

					reg = /(?:^|\s)key(?:\s|$)/
					if (reg.exec(cName)) {
						var data = x.getAttribute('title');
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'key>'), $.rdf.resource('<'+data+'>'));
						  vcards.add(triple1);
					}

//mailer, uid (should uid be literal?)

					reg = /(?:^|\s)mailer(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getTextType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'mailer>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}

					reg = /(?:^|\s)uid(?:\s|$)/
					if (reg.exec(cName)) {
						var fn = getUrlType(x);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'uid>'), $.rdf.literal('"'+fn+'"'));
						  vcards.add(triple1);
					}

//rev 

					reg = /(?:^|\s)rev(?:\s|$)/
					if (reg.exec(cName)) {
						var data = x.getAttribute('title');
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'rev>'), $.rdf.resource('<'+data+'>'));
						  vcards.add(triple1);
					}
				}
			}
		return vcards;

	   };


	//helper functions
	getUrlType = function (x){
		var fn;
		if(x.getAttribute("data")){
			  fn = x.getAttribute("data");
		}else if(x.getAttribute("href")){
			 fn = x.getAttribute("href");
		}else if(x.getAttribute("src")){
			 fn = x.getAttribute("src");
		}else{							
			 fn = x.textContent;
		}	 
		return fn;
	}

	getTextType = function(x){
		var fn;
 		if(x.getAttribute("title")){
			fn = x.getAttribute("title");
		}else if(x.getAttribute("alt")){
			fn = x.getAttribute("alt");
		}else{							
			fn = x.textContent;
		}
		return fn;
	}
	
	addNameNode = function(nameNodeFound, root, nameNode, vcards){
		if(!nameNodeFound){
			 var triple1 = $.rdf.triple(root, $.rdf.resource('<' + v + 'n>'), nameNode);
			 var triple2 = $.rdf.triple(nameNode, $.rdf.type, $.rdf.resource('<' + v + 'Name>'));
			vcards.add(triple1);
			vcards.add(triple2);
		}
		return true;	  
	}
	
	gleaner = function (options) {
		var trips = [];
		var vcards = testForVcardClass();

  		for (i = 0; i < vcards.triples().length; i += 1) {
			//alert(vcards.triples()[i]);
			trips.push(vcards.triples()[i]);
		}

		//alert(trips);
		return trips;	   
	},
	$.rdf.gleaners.push(gleaner);

})(jQuery);