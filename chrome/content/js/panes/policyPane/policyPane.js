/** Policy Runner Pane
 * 
 * This Pane will allow a user to generate a log file and test it against the policy file
 * currently being displayed.
 * 
 * mjsweig@mit.edu
 */

var air = RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#");
var rdf = tabulator.ns.rdf;
var rdfs = tabulator.ns.rdfs;
var owl = tabulator.ns.owl;
var pri = RDFNamespace("http://dig.csail.mit.edu/2009/DHS-fusion/PrivacyAct/Privacy#");
var _senders = {"The CIA": pri('CIA'), "CIA": pri('CIA'), "Central Intelligence Agency": pri('CIA'), "The Central Intelligence Agency": pri('CIA'),
		"The Department of Homeland Security": pri('DHS'), "Department of Homeland Security": pri('DHS'), "DHS": pri('DHS'), "The DHS": pri('DHS'), 
                "FBI": pri('FBI'), "The FBI": pri('FBI'), "Federal Bureau of Investigation": pri('FBI'), "The Federal Bureau of Investigation": pri('FBI'),
                "Massachusetts State Police Department": pri('MSP'), "The Massachusetts State Police Department": pri('MSP')};
var _senderProps = {"maintains": pri('maintains')};
var _senderTypes = {"a system of records": "[a " + pri('System_of_Records')+ "]"};
var _senderContexts = {"Has A Court Order": pri("court_order")};
var _actions = {"change": pri('Change'), "do something with": pri('Event'), "file": pri('File'), "request information": pri('Info_Request'),
		"notify": pri('Notify'), "request": pri('Request'), "request a change to": pri('Request_Change'), "review": pri('Review'),
		"revise": pri('Revision_or_Establish'), "establish": pri('Revision_or_Establish'), "share": pri('Share'), "give": pri('Share')};
var _dataCats = {"US Persons": pri('US_Person')};
var _specialDataCats = {"PII": pri('PII'), "Personally Identifiable Information": pri('PII')};
var _dataContexts = {"in a system of records": pri('contained_in') + " [a " + pri('System_of_Records')+ "]"};
var _aMatches = {};
var _reqs = {"Massachusetts State Police Department": pri('MSP'), "The Massachusetts State Police Department": pri('MSP')};
var _reqProps = {};
var _reqTypes = {};
var _reqContexts = {};

var policyUtils = {
		prefixes: {
			air: RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#"),
			rdf: tabulator.ns.rdf,
			rdfs: tabulator.ns.rdfs,
			owl: tabulator.ns.owl,
			pri: RDFNamespace("http://dig.csail.mit.edu/2009/DHS-fusion/PrivacyAct/Privacy#")
		},
		options: {
		},
		current: "",
		dropdown: function(ele, doc) {
			function getX(e) {
				var x = 0;
				while (e) {
					x+=e.offsetLeft;
					e = e.offsetParent;
				}
				return x;
			}
			function getY(e) {
				var y = 0;
				while (e) {
					y+= e.offsetTop;
					e = e.offsetParent;
				}
				return y;
			}
			function makePossibles(a) {
				var pos = new Array();
				for (var p in a) {
					pos[pos.length] = p;
				}
				return pos;
			}
			function editDistance(s, target){
				var c;
				d = {};
				for(var i = 0; i <= s.length; i++) {
					d[i+",0"] = i;
				}
				for(var j = 0; j <= target.length; j++) {
					d["0,"+j] = j;
				}
				for(i = 1; i <= s.length; i++) {
					for(j = 1; j <= target.length; j++) {
						if (s.charAt(i-1) == target.charAt(j-1)) {
							c = 0;
						}else{
							c = 1;
						}
						d[i+","+j] = Math.min(d[(i-1)+","+j]+1, Math.min(d[i+","+(j-1)]+1, d[(i-1)+","+(j-1)]+c));
					}
				}
				return d[s.length+","+target.length];
			};
			var possibles = new Array();
			var boxType = ele.id;
			policyUtils.current = ele.value;
			switch(boxType) {
			case "sender":
				possibles = makePossibles(_senders);
				break;
			case "sProp":
				possibles = makePossibles(_senderProps);
				break;
			case "sType":
				possibles = makePossibles(_senderTypes);
				break;
			case "sContext":
				possibles = makePossibles(_senderContexts);
				break;
			case "action":
				possibles = makePossibles(_actions);
				break;
			case "dCat":
				possibles = makePossibles(_dataCats);
				break;
			case "sDCat":
				possibles = makePossibles(_specialDataCats);
				break;
			case "dCon":
				possibles = makePossibles(_dataContexts);
				break;
			case "aMatch":
				possibles = makePossibles(_aMatches);
				break;
			case "requester":
				possibles = makePossibles(_reqs);
				break;
			case "rProp":
				possibles = makePossibles(_reqProps);
				break;
			case "rType":
				possibles = makePossibles(_reqTypes);
				break;
			case "rContext":
				possibles = makePossibles(_reqContexts);
				break;
			default:
				possibles = makePossibles({"":""});
			}
			var choiceDiv = doc.createElement("div");
			choiceDiv.setAttribute("class", "suggest");
			choiceDiv.setAttribute("style", "top: " + (getY(ele)+65) + "px; left: "+(getX(ele))+"px");
			choiceDiv.setAttribute("cellPadding", "0");
			choiceDiv.setAttribute("cellPadding", "0");
			
			var choices = doc.createElement("table");
			var cBod = doc.createElement("tbody");
			var closeMatches = new Array();
			for (var i = 0; i < possibles.length; i++) {
				var text = ele.value.toLowerCase();
				if (possibles[i].slice(0,ele.value.length).toLowerCase() == text || editDistance(possibles[i].toLowerCase(), text) <= 1) {
					closeMatches[closeMatches.length] = possibles[i];
				}
			}
			closeMatches.sort();
			for (var i = 0; i < closeMatches.length; i++) {
				var tr = doc.createElement("tr");
				var td = doc.createElement("td");
				td.setAttribute('id', 'item'+(i+1));
				td.appendChild(doc.createTextNode(closeMatches[i]));
				td.addEventListener("mouseover", function(e){
					this.setAttribute("class", "selected");
					policyUtils.current = this.firstChild.nodeValue;
				}, false);
				td.addEventListener("mouseout", function(e){
					this.setAttribute("class", "");
					policyUtils.current = doc.getElementById(boxType).value;
				}, false);
				tr.appendChild(td);
				cBod.appendChild(tr);
			}
			ele = doc.getElementById("Policy Runner Pane");
			if (doc.getElementById("choices")) ele.removeChild(doc.getElementById("choices"));
			choiceDiv.setAttribute('id', 'choices');
			choices.appendChild(cBod);
			choiceDiv.appendChild(choices);
			ele.appendChild(choiceDiv);
		}
}
policyPane = {
	
    icon: Icon.src.icon_policyPane,
    //TODO make this pane open upon loading the file, without clicking on it
    label: function(subject) {
		var policy = air('Policy');
		//only display this pane if the document contains an air:Policy that can be reasoned over
		var pol = tabulator.kb.statementsMatching(undefined, undefined, policy, subject).length;
		if (pol > 0){
			return "Policy Runner Pane";
		}else{
	   		return null;
		}
    },
    
    render: function(subject, doc) {
    	var myURI = tabulator.preferences.get('me');
    	var me = myURI ? tabulator.kb.sym(myURI) : null;
    	var div = doc.createElement("div");
		div.setAttribute("id", "Policy Runner Pane");
    	if (!me) {
    		var wdiv = doc.createElement("div");
    		wdiv.setAttribute('id', 'noWebId');
    		
    		var noid = doc.createElement("p");
    		noid.setAttribute("class", "webIDText");
    		noid.appendChild(doc.createTextNode("You need a Web ID to use this feature and you do not appear to have one.  " +
    				"Once you have selected a Web ID you will be able to save your scenario files to your server and run them " +
    				"against the current policy."));
    		
    		var makeset = doc.createElement("input");
    		makeset.setAttribute('type', "button");
    		makeset.setAttribute('value', "Make or Set a Web ID");
    		makeset.addEventListener("click", function(e){
    			wdiv.removeChild(noid);
    			wdiv.removeChild(makeset);
    			
    			var haveOrNot = doc.createElement("p");
    			haveOrNot.innerHTML = "Do you have a <a href=http://esw.w3.org/topic/WebID>Web ID?</a>";
    			
    			var yNdiv = doc.createElement("div");
    			var chooseIDdiv = doc.createElement("div");
    			
    			var yes = doc.createElement("input");
    			yes.setAttribute('id', 'yes');
    			yes.setAttribute('type', 'button');
    			yes.setAttribute('value', "Yes, I already have a Web ID");
    			yes.addEventListener('click', function(e){
    				while (chooseIDdiv.childNodes.length > 0) {
    					chooseIDdiv.removeChild(chooseIDdiv.childNodes[0]);
    				}
    				var selectDiv = doc.createElement("div");
    				selectDiv.setAttribute('id', 'sel');
    				
    				var webIDBox = doc.createElement("input");
    				webIDBox.setAttribute('type', 'text');
    				webIDBox.setAttribute('size', '80');
    				webIDBox.setAttribute('value', 'http://dig.csail.mit.edu/2008/webdav/mjsweig/');
    				webIDBox.setAttribute('id', 'webidField');
    				
    				var webIDText = doc.createElement("p");
    				webIDText.appendChild(doc.createTextNode("Enter your existing WebID here:"));
    				
    				var confirmWebId = doc.createElement("input");
    				confirmWebId.setAttribute('type', 'button');
    				confirmWebId.setAttribute('value', "Use this Web ID");
    				confirmWebId.addEventListener('click', function(e){
    					var webID = doc.getElementById("webidField").value;
    		            tabulator.preferences.set('me', webID);
    		            alert("You ID has been set to "+webID);
    		            doc.location.reload();
    				},false);
    				
    				selectDiv.appendChild(webIDText);
    				selectDiv.appendChild(webIDBox);
    				selectDiv.appendChild(confirmWebId);
    				chooseIDdiv.appendChild(selectDiv);
    			}, false);
    			
    			var no = doc.createElement("input");
    			no.setAttribute('id', 'no');
    			no.setAttribute('type', 'button');
    			no.setAttribute('value', "No, I would like to make one");
    			no.addEventListener('click', function(e){
    				while (chooseIDdiv.childNodes.length > 0) {
    					chooseIDdiv.removeChild(chooseIDdiv.childNodes[0]);
    				}
    				var makediv = doc.createElement('div');
    				makediv.setAttribute('id', 'make');
    				
    				var namePrompt = doc.createElement("p");
    				namePrompt.appendChild(doc.createTextNode("What is your full name?"));
    				
    				var name = doc.createElement("input");
    				name.setAttribute('id', 'foafname_input');
    				name.setAttribute('type', 'text');
    				name.setAttribute('size', '40');
    				
    				var initialsPrompt= doc.createElement("p");
    				initialsPrompt.appendChild(doc.createTextNode("What are your initials?"));
    				
    				var initials = doc.createElement("input");
    				initials.setAttribute('id', 'initials_input');
    				initials.setAttribute('type', 'text');
    				initials.setAttribute('size', '10');
    				
    				var urlPrompt = doc.createElement("p");
    				urlPrompt.setAttribute("class", "webIDText");
    				urlPrompt.appendChild(doc.createTextNode("You need the URI of a file which you can write to on the web. " +
    						"(The general public should be able to read it but not change it. The server should support the WebDAV protocol.)" +
    						"It will typcially look something like: http://www.example.com/users/gates/foaf.rdf"));
    				
    				var webIdUrl = doc.createElement("input");
    				webIdUrl.setAttribute('id', 'webIdUrl');
    				webIdUrl.setAttribute("type", "text");
    				webIdUrl.setAttribute('size', '80');
    				webIdUrl.setAttribute('value', 'http://');
    				
    				var makeone = doc.createElement("input");
    				makeone.setAttribute('type', 'button');
    				makeone.setAttribute('value', "Make my new Web ID!");
    				makeone.addEventListener('click', function(e){
    		            var inputField = doc.getElementById("webIdUrl");
    		            var targetURI = inputField.value;
    		            var foafname = doc.getElementById("foafname_input").value;
    		            var initials = doc.getElementById("initials_input").value;
    		            var webid;
    		            var contents = "<rdf:RDF  xmlns='http://xmlns.com/foaf/0.1/'\n"+
    		                "    xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'\n" +
    		                "    xmlns:foaf='http://xmlns.com/foaf/0.1/'>";
    		            var localid = initials;
    		            contents += "<Person rdf:about='#"+initials+"'>";
    		            contents += "<name>"+foafname+"</name>\n";
    		            contents += "</Person>\n";
    		            contents += "<foaf:PersonalProfileDocument rdf:about=''> " +
    		            		"\ <foaf:primaryTopic rdf:resource='#"+ localid +"'/> " +
    		            				"\ </foaf:PersonalProfileDocument>\n";

    		            contents += "</rdf:RDF>\n";
    		            webid = targetURI + "#" + localid;
    		            
    		            var content_type = "application/rdf+xml";
    		            var xhr = tabulator.util.XMLHTTPFactory();
    		            xhr.onreadystatechange = function (){
    		                if (xhr.readyState == 4){
    		                    var result = xhr.status;
    		                    var ele = doc.getElementById("saveStatus");
    		                    if (result == '201' || result == '204') {
    		                       ele.className = "success";
    		                       ele.innerHTML="<p>Success! A new, empty, profile has been created."+
    		                       "<br/>Your Web ID is now <br/><b><a target='me' href='"+webid+"'>"+webid+"</a></b>."+
    		                       "<br/>You can add more information to your public profile any time.</p>";
    		                       tabulator.preferences.set("me", webid);
    		                    } else {
    		                       ele.className = "failure";
    		                       ele.innerHTML="<p>There was a problem saving your public profile." +
    		                       "It has not been created." +
    		                       "<table>" +
    		                       "<tr><td>Status:</td><td>"+result+"</td></tr>" +
    		                       "<tr><td>Status text:</td><td>"+xhr.statusText+"</td></tr>" +
    		                       "</table>" +
    		                       "If you can work out what was wrong with the URI, " +
    		                       "you can change it above and try again.</p>";            
    		                    }
    		                }
    		            };
    		            xhr.open('PUT', targetURI, true);
    		            //assume the server does PUT content-negotiation.
    		            xhr.setRequestHeader('Content-type', content_type);//OK?
    		            xhr.send(contents);
    		            tabulator.log.info("sending "+"["+contents+"] to +"+targetURI);
    		            doc.location.reload();
    				}, false);
    				
    				var statusDiv = doc.createElement("div");
    				statusDiv.setAttribute('id', "saveStatus");
    				
    				makediv.appendChild(namePrompt);
    				makediv.appendChild(name);
    				makediv.appendChild(initialsPrompt);
    				makediv.appendChild(initials);
    				makediv.appendChild(urlPrompt);
    				makediv.appendChild(webIdUrl);
    				makediv.appendChild(makeone);
    				makediv.appendChild(statusDiv);
    				chooseIDdiv.appendChild(makediv);    				
    			}, false);
    			    	
    			yNdiv.appendChild(yes);
    			yNdiv.appendChild(no);
    			wdiv.appendChild(haveOrNot);
    			wdiv.appendChild(yNdiv);
    			wdiv.appendChild(chooseIDdiv);
    		}, false);
    		
    		wdiv.appendChild(noid);
    		wdiv.appendChild(makeset);
    		div.appendChild(wdiv);
    	}else {
    		/* TODO
    		 * Is $PERSON allowed to $ACTION $DATATYPE data contained in $SYSREC that is to be used for $PURPOSE 
    		 * and is $DPROPi $DOBJi to $PERSON
    		 * 
    		 * if ($PERSON $ACTION $PERSON)
    		 * 
    		 * and ($PERSON $ACTION $PERSON)
    		 * 
    		 * (additional events will need to be added somehow?)
    		 */
			var uriPrefix = myURI.slice(0,myURI.lastIndexOf("/")+1);
			var uri = uriPrefix+"log.n3";
			var facts = RDFNamespace(uriPrefix+"log#");
		    var form = doc.createElement("form");
		    form.setAttribute("id","logForm");
		    form.setAttribute("action","");
		    
		    var fieldset = doc.createElement("fieldset");
		    
		    var head = doc.createElement("h6");
		    head.appendChild(doc.createTextNode("Ask Your Question Here:"));
		    
		    var inputDiv = doc.createElement("div");
		    inputDiv.setAttribute("class", "input");
		    
		    var txtinput = doc.createElement("p");
		    txtinput.setAttribute('id', 'question');
		    
		    var sender = doc.createElement("input");
		    sender.setAttribute("type", "text");
		    sender.setAttribute("id", "sender");
		    sender.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    sender.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    
		    var senderProperty = doc.createElement("input");
		    senderProperty.setAttribute("type", "text");
		    senderProperty.setAttribute("id", "sProp");
		    senderProperty.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    senderProperty.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    
		    var senderType = doc.createElement("input");
		    senderType.setAttribute("type", "text");
		    senderType.setAttribute("id", "sType");
		    senderType.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    senderType.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var senderContext = doc.createElement("input");
		    senderContext.setAttribute("type", "text");
		    senderContext.setAttribute("id", "sContext");
		    senderContext.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    senderContext.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var action = doc.createElement("input");
		    action.setAttribute("type", "text");
		    action.setAttribute("id", "action");
		    action.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    action.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var dataCategory = doc.createElement("input");
		    dataCategory.setAttribute("type", "text");
		    dataCategory.setAttribute("id", "dCat");
		    dataCategory.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataCategory.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var specialDataCategory = doc.createElement("input");
		    specialDataCategory.setAttribute("type", "text");
		    specialDataCategory.setAttribute("id", "sDCat");
		    specialDataCategory.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    specialDataCategory.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var dataContext = doc.createElement("input");
		    dataContext.setAttribute("type", "text");
		    dataContext.setAttribute("id", "dCon");
		    dataContext.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataContext.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var actionMatch = doc.createElement("input");
		    actionMatch.setAttribute("type", "text");
		    actionMatch.setAttribute("id", "aMatch");
		    actionMatch.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    actionMatch.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var requester = doc.createElement("input");
		    requester.setAttribute("type", "text");
		    requester.setAttribute("id", "requester");
		    requester.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    requester.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var requesterProperty = doc.createElement("input");
		    requesterProperty.setAttribute("type", "text");
		    requesterProperty.setAttribute("id", "rProp");
		    requesterProperty.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    requesterProperty.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var requesterType = doc.createElement("input");
		    requesterType.setAttribute("type", "text");
		    requesterType.setAttribute("id", "rType");
		    requesterType.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    requesterType.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    var requesterContext = doc.createElement("input");
		    requesterContext.setAttribute("type", "text");
		    requesterContext.setAttribute("id", "rContext");
		    requesterContext.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    requesterContext.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    
		    
		    txtinput.appendChild(doc.createTextNode("Is a person or system from "));
		    txtinput.appendChild(sender);
		    txtinput.appendChild(doc.createTextNode(" with "));
		    txtinput.appendChild(senderProperty);
		    txtinput.appendChild(senderType);
		    txtinput.appendChild(doc.createTextNode(" who "));
		    txtinput.appendChild(senderContext);
		    txtinput.appendChild(doc.createTextNode(" permitted to "));
		    txtinput.appendChild(action);
		    txtinput.appendChild(doc.createTextNode(" data or a document about "));
		    txtinput.appendChild(dataCategory);
		    txtinput.appendChild(doc.createTextNode(" that is "));
		    txtinput.appendChild(specialDataCategory);
		    txtinput.appendChild(doc.createTextNode(" and "));
		    txtinput.appendChild(dataContext);
		    txtinput.appendChild(doc.createTextNode(" if the other party ("));
		    txtinput.appendChild(actionMatch);
		    txtinput.appendChild(doc.createTextNode(") is "));
		    txtinput.appendChild(requester);
		    txtinput.appendChild(doc.createTextNode(" with "));
		    txtinput.appendChild(requesterProperty);
		    txtinput.appendChild(requesterType);
		    txtinput.appendChild(doc.createTextNode(" who "));
		    txtinput.appendChild(requesterContext);
		    txtinput.appendChild(doc.createTextNode("?"));
		    
		    var buttondiv = doc.createElement("div");
		    
		    var c = 0;
		    var priURI = "http://dig.csail.mit.edu/2009/DHS-fusion/PrivacyAct/Privacy.n3";
		    var btninput = doc.createElement("input");
		    btninput.setAttribute("type","button");
		    btninput.setAttribute("value","Go");
		    btninput.addEventListener("click", function(){
		    	function constructLog() {
		    		function makeTriple(s, v, o) {
		    			return s + " " + v + " " + o + ".\n";
		    		}
		    		var log = "";
		    		//TODO
		    		if (_senders[doc.getElementById("sender").value]) {
		    			log += makeTriple(_senders[doc.getElementById("sender").value], rdf('type'), pri('Federal_Agency'));
		    		}
		    		if (_actions[doc.getElementById("action").value]) {
		    			log += makeTriple(facts('mainAction'), rdf('type'), _actions[doc.getElementById("action").value]);
		    		}
		    		if (_senders[doc.getElementById("sender").value]) {
		    			log += makeTriple(facts('mainAction'), pri('by'), _senders[doc.getElementById("sender").value]);
		    		}
		    		if(_reqs[doc.getElementById("requester").value]) {
		    			log += makeTriple(facts('mainAction'), pri('to'), _reqs[doc.getElementById("requester").value]);
		    		}
		    		log += facts('mainAction') + " " + pri('data') + " " + facts('data') + ".\n";
		    		if(_specialDataCats[doc.getElementById("sDCat").value]) {
		    			log += makeTriple(facts('data'), rdf('type'), _specialDataCats[doc.getElementById("sDCat").value]);
		    		}
		    		if(_dataCats[doc.getElementById('dCat').value]) {
		    			log += makeTriple(facts('subject'), rdf('type'), _dataCats[doc.getElementById('dCat').value]);
		    		}
		    		log += makeTriple(facts('data'), pri('about'), facts('subject'));
		    		if (_dataContexts[doc.getElementById("dCon").value]) {
		    			log += facts('data') + _dataContexts[doc.getElementById("dCon").value] + ".\n";
		    		}
		    		if (_senderContexts[doc.getElementById("sContext").value]) {
		    			log += makeTriple(facts('other'), rdf('type'), _senderContexts[doc.getElementById("sContext").value]);
		    		}
		    		if (_senders[doc.getElementById("sender").value] && _senderProps[doc.getElementById("sProp").value] && _senderTypes[doc.getElementById("sType").value]) {
		    			log += makeTriple(_senders[doc.getElementById("sender").value], _senderProps[doc.getElementById("sProp").value], _senderTypes[doc.getElementById("sType").value])
		    		}
		    		return log;
		    	};
		    	var xhr = tabulator.util.XMLHTTPFactory();
		    	xhr.open('PUT', uri, false);
		    	xhr.send(constructLog());
		    	var browser = top.document.getElementById("content");
		    	browser.selectedTab = browser.addTab("http://mr-burns.w3.org/cgi-bin/air_2_0.py?" +
		    			"logFile=" + uri + "&logFile=" + priURI +"&rulesFile=" + doc.URL);
		    	uri = uriPrefix + "log" + c + ".n3";
		    	facts = RDFNamespace(uriPrefix + "log" + c++ + "#");
		    }, false);
		    
		    var forgetDiv = doc.createElement("div");
		    forgetDiv.setAttribute('class', 'forget');
		    
		    var currentID = doc.createElement("p");
		    currentID.appendChild(doc.createTextNode("Your current Web ID is "));
		    var webidlink = doc.createElement("a");
		    webidlink.setAttribute('href', myURI);
		    webidlink.appendChild(doc.createTextNode(myURI));
		    currentID.appendChild(webidlink);
		    currentID.appendChild(doc.createElement("br"));
		    currentID.appendChild(doc.createTextNode("Any scenario file you generate will be saved to this space.  " +
		    		"If this is not your Web ID, or you wish to change the directory to which your files are being saved, " +
		    		"you may forget this Web ID and choose or create a new one."));
		    
		    var forget = doc.createElement("input");
		    forget.setAttribute('type', 'button');
		    forget.setAttribute('value', 'Forget My Web ID');
		    forget.addEventListener('click', function(e){
		    	tabulator.preferences.set('me','');
                alert('Your Web ID was '+myURI+'. It has been forgotten.');
                doc.location.reload();
		    },false);
		    
		    forgetDiv.appendChild(currentID);
		    forgetDiv.appendChild(forget);
		    buttondiv.appendChild(btninput);
		    inputDiv.appendChild(txtinput);
		    fieldset.appendChild(head);
		    fieldset.appendChild(inputDiv);
		    fieldset.appendChild(buttondiv);
		    form.appendChild(fieldset);
		    div.appendChild(form);
		    div.appendChild(forgetDiv);
    	}
	    div.setAttribute("class", "policy");
	    return div;
    }
};
tabulator.panes.register(policyPane, true); 
