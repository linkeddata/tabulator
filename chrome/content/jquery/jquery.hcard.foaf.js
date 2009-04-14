/*
 * jQuery hCard to vCard for rdfQuery @VERSION
 * largely based on http://www.ibiblio.org/hhalpin/homepage/notes/vcardtable.html, with some changes
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

	var f = 'http://xmlns.com/foaf/0.1/';
	var g = 'http://www.w3.org/2003/01/geo/wgs84_pos#';


	testForVcardClass = function () {

		var vcards = $.rdf.databank([],{
			namespaces: { 
				foaf: 'http://xmlns.com/foaf/0.1/', geo: "http://www.w3.org/2003/01/geo/wgs84_pos#"
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

			var triple = $.rdf.triple(root, $.rdf.type, $.rdf.resource('<' + f + 'Person>'));
			vcards.add(triple);
 
			var descendants = c.getElementsByTagName('*');
			for (var k = 0; k < descendants.length; k++) {
				var x = descendants[k];
				var cName = x.className;

				var reg = /(?:^|\s)fn(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'name>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);

					//special case "implied-n-optimization"
					//exactly two words, we add firstName and surname
					reg = /^(\w+)\s+(\w+)$/
					var res = reg.exec(fn);
					if (res) {
						 var triple3 = $.rdf.triple(root, $.rdf.resource('<' + f + 'firstName>'), '"'+res[1]+'"');
						 var triple4 = $.rdf.triple(root, $.rdf.resource('<' + f + 'surname>'), '"'+res[2]+'"');
						vcards.add(triple3);
						vcards.add(triple4);
					}
				}


				reg = /(?:^|\s)n(?:\s|$)/					
				if (reg.exec(cName)) {
				//not mapped
				}
				reg = /(?:^|\s)given-name(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'firstName>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);
				}
				reg = /(?:^|\s)family-name(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'surname>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);
				}

				reg = /(?:^|\s)additional-name(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)honorific-prefix(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'title>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);
				}

				reg = /(?:^|\s)honorific-suffix(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

//nickname
				reg = /(?:^|\s)nickname(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'nick>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);
				}

//url is a resource 
				reg = /(?:^|\s)url(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getUrlType(x);
					if(fn.indexOf('/')==0){
						if(base){
							if(base.lastIndexOf("/")==base.length-1){
								base = base.substring(0,base.length-1)
							}
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'homepage>'), $.rdf.resource('<' + base +'' + fn + '>'));							
						}else{
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'homepage>'), $.rdf.resource('<' + $.uri.base() +'' + fn + '>'));
						}
			vcards.add(triple1);
					} else if(fn.indexOf('http://')==-1){
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'homepage>'), $.rdf.literal('"'+fn+'"'));
						vcards.add(triple1);
					} else {
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'homepage>'), $.rdf.resource('<'+fn+'>'));
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
							//because it's rdf, we want mailto 
							if(fn.indexOf("mailto:")!=0){
								fn = 'mailto:' + fn;
							}
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + '' + mbox + '>'), $.rdf.resource('<'+fn+'>'));
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
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'mbox>'), $.rdf.resource('<'+fn+'>'));
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
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'phone>'), $.rdf.resource('<tel:'+val+'>'));
						vcards.add(triple1);
						var props = ["phone"];
						var val = '';
							
						for (var j = 0; j < telDescendants.length; j++) {
							var y=telDescendants[j];
							var yName = y.className;

							if(yName.indexOf('type')!=-1){

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
				 			  var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + '' + props[k] + '>'), $.rdf.resource('<tel:'+val+'>'));
								vcards.add(triple1);
							}
						}
					}
				   }

				reg = /(?:^|\s)adr(?:\s|$)/
				var adrNode = $.rdf.blank("[]");
				var adrType="adr";
				if (reg.exec(cName)) {
					//not mapped to foaf
				}

				reg = /(?:^|\s)label(?:\s|$)/
				if (reg.exec(cName)) {
					//not mapped to foaf
				}
		

/*

geo:

  <span class="geo">
	 <abbr class="latitude" title="48.816667">N 48¡ 81.6667</abbr>
	 <abbr class="longitude" title="2.366667">E 2¡ 36.6667</abbr>
  </span>

- also in a short form

- mapped to geo ns: http://www.w3.org/2003/01/geo/wgs84_pos#, http://www.w3.org/2003/01/geo/

*/

				reg = /(?:^|\s)geo(?:\s|$)/
				if (reg.exec(cName)) {
					var geoDescendants = x.getElementsByTagName('*');
					var val = getTextType(x);
						//short form
					if(val.indexOf(";")!=-1){
						var lat= val.substring(0,val.indexOf(";"));
						var lo= val.substring(val.indexOf(";")+1);
						var triple1 = $.rdf.triple(root, $.rdf.resource('<' + g + 'lat>'), $.rdf.literal('"'+lat+'"'));
						vcards.add(triple1);
						var triple6 = $.rdf.triple(root, $.rdf.resource('<' + g + 'long>'), $.rdf.literal('"'+lo+'"'));
						vcards.add(triple6);
					}

					for (var j = 0; j < geoDescendants.length; j++) {
						var y = geoDescendants[j];
						var val = getTextType(y);
						var prop = y.className;
						if(prop=="latitude"){
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + g + 'lat>'), $.rdf.literal('"'+val+'"'));
							vcards.add(triple1);
						}
						if(prop=="longitude"){
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + g + 'long>'), $.rdf.literal('"'+val+'"'));
							vcards.add(triple1);
						}
					 }
				}



				reg = /(?:^|\s)tz(?:\s|$)/
				if (reg.exec(cName)) {
					//not mapped
				}

				reg = /(?:^|\s)photo(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getUrlType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'depiction>'), $.rdf.resource('<'+fn+'>'));
					vcards.add(triple1);
				}

				reg = /(?:^|\s)logo(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getUrlType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'logo>'), $.rdf.resource('<'+fn+'>'));
					vcards.add(triple1);
				}

				reg = /(?:^|\s)sound(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
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
//@@ should this be prop = birthday?
						if(prop=="bday"){
							var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'birthday>'), $.rdf.literal('"'+val+'"'));
							vcards.add(triple1);
						}
					}else{
						for (var j = 0; j < bdayDescendants.length; j++) {
							 var y = bdayDescendants[j];
							 var val = y.getAttribute("title");
							 var prop = y.className;
//@@ should this be prop = birthday?
							 if(prop=="bday"){
								 var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'birthday>'), $.rdf.literal('"'+val+'"'));
								 vcards.add(triple1);
							 }
						}
					}
				}

				reg = /(?:^|\s)title(?:\s|$)/
				if (reg.exec(cName)) {
					var fn = getTextType(x);
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'title>'), $.rdf.literal('"'+fn+'"'));
					vcards.add(triple1);
				 }

/*						  
				reg = /(?:^|\s)role(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}
*/ 
//org is trickier. using member for a member

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
							if(prop=="organization-name"){
								var triple3 = $.rdf.triple(orgNode, $.rdf.resource('<' + f + 'name>'), $.rdf.literal('"'+val+'"'));
								vcards.add(triple3);
								subnodes=true;
							}
						}
					}
					var triple1 = $.rdf.triple(root, $.rdf.resource('<' + f + 'member>'), orgNode);
					var triple2 = $.rdf.triple(orgNode, $.rdf.type, $.rdf.resource('<' + f + 'Organization>')); //should check if it has a name
					vcards.add(triple1);
					vcards.add(triple2);

					if(!subnodes){
						var fn = getUrlType(x);
						var triple4 = $.rdf.triple(orgNode, $.rdf.resource('<' + f + 'name>'), $.rdf.literal('"'+fn+'"'));
						vcards.add(triple4);
					}
				}


				reg = /(?:^|\s)category(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)note(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)class(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)key(?:\s|$)/
				if (reg.exec(cName)) {
				 //not mapped
				}

				reg = /(?:^|\s)mailer(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)uid(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
				}

				reg = /(?:^|\s)rev(?:\s|$)/
				if (reg.exec(cName)) {
				//not mapped
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
	};

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
	};
		
		gleaner = function (options) {
			var trips = [];
			var vcards = testForVcardClass();

			for (i = 0; i < vcards.triples().length; i += 1) {
				  //alert(vcards.triples()[i]);
				  trips.push(vcards.triples()[i]);
			}

		//alert(trips);
		return trips;	   
	};
	$.rdf.gleaners.push(gleaner);

})(jQuery);
