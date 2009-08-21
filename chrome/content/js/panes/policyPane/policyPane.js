/** Policy Runner Pane
 * 
 * This Pane will allow a user to generate a log file and test it against the policy file
 * currently being displayed.
 * 
 * mjsweig@mit.edu
 */
var prefixes = {
	air: RDFNamespace("http://dig.csail.mit.edu/TAMI/2007/amord/air#"),
	rdf: tabulator.ns.rdf,
	rdfs: tabulator.ns.rdfs,
	owl: tabulator.ns.owl,
	pri: RDFNamespace("http://dig.csail.mit.edu/2009/DHS-fusion/PrivacyAct/Privacy#")
};
function Person(name) {
	this.name = name.replace(/\s+/, "_");
	this.output = "";
}
var policyUtils = {
		options: {
			actions: {"change": prefixes.pri('Change'), "do something with": prefixes.pri('Event'), "file": prefixes.pri('File'), "request information": prefixes.pri('Info_Request'),
				"notify": prefixes.pri('Notify'), "request": prefixes.pri('Request'), "request a change to": prefixes.pri('Request_Change'), "review": prefixes.pri('Review'),
				"revise": prefixes.pri('Revision_or_Establish'), "establish": prefixes.pri('Revision_or_Establish'), "share": prefixes.pri('Share'), "give": prefixes.pri('Share')},
			agencies: {"The CIA": prefixes.pri('CIA'), "CIA": prefixes.pri('CIA'), "Central Intelligence Agency": prefixes.pri('CIA'), "The Central Intelligence Agency": prefixes.pri('CIA'),
				"The Department of Homeland Security": prefixes.pri('DHS'), "Department of Homeland Security": prefixes.pri('DHS'), "DHS": prefixes.pri('DHS'), "The DHS": prefixes.pri('DHS'), 
				"FBI": prefixes.pri('FBI'), "The FBI": prefixes.pri('FBI'), "Federal Bureau of Investigation": prefixes.pri('FBI'), "The Federal Bureau of Investigation": prefixes.pri('FBI'),
				"Massachusetts State Police Department": prefixes.pri('MSP'), "The Massachusetts State Police Department": prefixes.pri('MSP')},
			citizenships: {"United States": prefixes.pri("US_Person"), "Other": prefixes.pri("Person")},
			employerTypes: {"Federal Agency": prefixes.pri("Federal_Agency"), "Government Agency": prefixes.pri("Government_Agency"), "State Agency": prefixes.pri("State_Agency"),
				"Local Agency": prefixes.pri("Local_Agency"), "Tribal Agency": prefixes.pri("Tribal_Agency"), "Foreign Government": prefixes.pri("Foreign_Government"),
				"Census Bureau": prefixes.pri("Census_Bureau"), "National Archives and Records Administration": prefixes.pri("National_Archives_Records_Admin"),
				"United States Legislative Body": prefixes.pri("US_Legislative_Body"), "Legislative Body": prefixes.pri("Legislative_Body"), 
				"Consumer Reporting Agency": prefixes.pri("Consumer_Reporting_Agency"), "Federal Register": prefixes.pri("Federal_Register"), "Private Sector": prefixes.pri("Private_Sector")},
			titles: {"Employee": prefixes.pri("employedBy"), "Head Of": prefixes.pri("headOf"), "Archivist": prefixes.pri("Archivist_or_designee"), "Archivist's Designee": prefixes.pri("Archivist_or_designee"),
				"Comptroller General": prefixes.pri("Comptroller_General_or_designee"), "Comptroller General's Designee": prefixes.pri("Comptroller_General_or_designee")},
			uses: {"Need to Know": prefixes.pri("Need_to_Know"), "required by the Freedom of Information Act": prefixes.pri("FOIA_5_USC_552"), "A routine Use": prefixes.pri("routine_use"),
				"Census": prefixes.pri("Census"), "Statistics Research": prefixes.pri("Stats_Research"), "Historical Record": prefixes.pri("Historical_Record"), "Archivists Evaluation": prefixes.pri("Archivists_Evaluation"),
				"Law Enforcement": prefixes.pri("law_enforcement"), "Health and Safety": prefixes.pri("health_safety"), "Title 31": prefixes.pri("31_USC_3711e"), "Acknowledgement": prefixes.pri("Acknowledgment"),
				"Compulsory Legal Process": prefixes.pri("compulsory_legal_process"), "Refusal": prefixes.pri("Refusal"), "44 U.S.C. Section 3103": prefixes.pri("44_USC_3103")},
			data: {"Personally Identifiable Information": prefixes.pri("PII"), "An Accounting of a disclosure": prefixes.pri("Accounting"), "Consent": prefixes.pri("Consent"), "Written Consent": prefixes.pri("Written_Consent"),
				"Law Enforcement Data": prefixes.pri("law_enforcement"), "Not Individually Identifiable": prefixes.pri("Not_II"), "A Written Request": prefixes.pri("Written_Request"), "Court Order": prefixes.pri("Court_Order"),
				"Statement": prefixes.pri("statement"), "Statistics Only Assertion": prefixes.pri("Stats_Only"), "System of Records": prefixes.pri("System_of_Records"), "Written Assurrance": prefixes.pri("Written_Assurrance")},
			dataProps: {"about": prefixes.pri("about"), "authorized": prefixes.pri("authorized"), "disagrees with": prefixes.pri("disagrees_with"), "fair to": prefixes.pri("fair_to"), "of": prefixes.pri("of"),
				"purpose": prefixes.pri("purpose"), "record of": prefixes.pri("record_of"), "source": prefixes.pri("source"), "used in": prefixes.pri("used_in"), "a": prefixes.rdf("type"), "contains": prefixes.pri("contains")},
			dataLocs: {"A System of Records": "[a "+ prefixes.pri("System_of_Records")+"]"},
			aMatches: {},
			dataVals: {}
		},
		people: {},
		current: "",
		getX: function(e) {
			var x = 0;
			while (e) {
				x+=e.offsetLeft;
				e = e.offsetParent;
			}
			return x;
		},
		getY: function(e) {
			var y = 0;
			while (e) {
				y+= e.offsetTop;
				e = e.offsetParent;
			}
			return y;
		},
		dropdown: function(ele, doc, person) {
			function makePossibles(a) {
				var pos = new Array();
				if (a instanceof Array) {
					for (var i = 0; i < a.length; i++) {
						pos[pos.length] = a[i].name.replace("_", " ");
					}
				}else {
					for (var p in a) {
						pos[pos.length] = p;
					}
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
				possibles = makePossibles(policyUtils.people);
				break;
			case "action":
				possibles = makePossibles(policyUtils.options.actions);
				break;
			case "dType":
				possibles = makePossibles(policyUtils.options.data);
				break;
			case "dLoc":
				possibles = makePossibles(policyUtils.options.dataLocs);
				break;
			case "dPurp":
				possibles = makePossibles(policyUtils.options.uses);
				break;
			case "dProp":
				possibles = makePossibles(policyUtils.options.dataProps);
				break;
			case "dVal":
				possibles = makePossibles(policyUtils.options.dataVals);
				break;
			case "aMatch":
				possibles = makePossibles(policyUtils.options.aMatches);
				break;
			case "requester":
				possibles = makePossibles(policyUtils.people);
				break;
			case "citizenship":
				possibles = makePossibles(policyUtils.options.citizenships);
				break;
			case "employerName":
				possibles = makePossibles(policyUtils.options.agencies);
				break;
			case "employerType":
				possibles = makePossibles(policyUtils.options.employerTypes);
				break;
			case "jobName":
				possibles = makePossibles(policyUtils.options.titles);
				break;
			default:
				possibles = makePossibles({"":""});
			}
			var choiceDiv = doc.createElement("div");
			choiceDiv.setAttribute("class", "suggest");
			if (!person) {
				choiceDiv.setAttribute("style", "top: " + (policyUtils.getY(ele)+65) + "px; left: "+(policyUtils.getX(ele))+"px");
			}else {
				choiceDiv.setAttribute("style", "top: " + (policyUtils.getY(ele)+25) + "px; left: "+(policyUtils.getX(ele))+"px");
			}
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
				tr.addEventListener("mouseover", function(e){
					this.setAttribute("class", "selected");
					policyUtils.current = this.firstChild.firstChild.nodeValue;
				}, false);
				tr.addEventListener("mouseout", function(e){
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
};
policyPane = {
	
    icon: Icon.src.icon_policyPane,
    //TODO make this pane open upon loading the file, without clicking on it
    label: function(subject) {
		var policy = prefixes.air('Policy');
		//only display this pane if the document contains an air:Policy that can be reasoned over
		var pol = tabulator.kb.statementsMatching(undefined, undefined, policy, subject).length;
		if (pol > 0){
			return "Policy Runner Pane";
		}else{
	   		return null;
		}
    },
    
    render: function(subject, doc) {
    	policyUtils.people = {};
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
			var uriPrefix = myURI.slice(0,myURI.lastIndexOf("/")+1);
			var uri = uriPrefix+"log.n3";
			prefixes.facts = RDFNamespace(uriPrefix+"log#");
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
		    sender.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
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
		    action.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    var dataType = doc.createElement("input");
		    dataType.setAttribute("type", "text");
		    dataType.setAttribute("id", "dType");
		    dataType.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataType.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    dataType.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    var dataLocation = doc.createElement("input");
		    dataLocation.setAttribute("type", "text");
		    dataLocation.setAttribute("id", "dLoc");
		    dataLocation.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataLocation.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    dataLocation.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    var dataPurpose = doc.createElement("input");
		    dataPurpose.setAttribute("type", "text");
		    dataPurpose.setAttribute("id", "dPurp");
		    dataPurpose.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataPurpose.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    dataPurpose.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    var dataProperty = doc.createElement("input");
		    dataProperty.setAttribute("type", "text");
		    dataProperty.setAttribute("id", "dProp");
		    dataProperty.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataProperty.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    dataProperty.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    var dataValue = doc.createElement("input");
		    dataValue.setAttribute("type", "text");
		    dataValue.setAttribute("id", "dVal");
		    dataValue.addEventListener("keyup", function(e){
		    	if (this.value != "") {
		    		policyUtils.dropdown(this, doc);
		    	}else{
		    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
		    		policyUtils.current = "";
		    	}
		    }, false);
		    dataValue.addEventListener("blur", function(e){
				this.value = policyUtils.current;
				policyUtils.current = "";
		    	if (doc.getElementById("choices")) {
		    		div.removeChild(doc.getElementById("choices"));
		    	}
		    }, false);
		    dataValue.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
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
		    actionMatch.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
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
		    requester.addEventListener("focus", function(e){
		    	policyUtils.current = this.value;
		    }, false);
		    
		    
		    txtinput.appendChild(doc.createTextNode("Is "));
		    txtinput.appendChild(sender);
		    txtinput.appendChild(doc.createTextNode(" permitted to "));
		    txtinput.appendChild(action);
		    txtinput.appendChild(doc.createTextNode(" data that is "));
		    txtinput.appendChild(dataType);
		    txtinput.appendChild(doc.createTextNode(" and contained in "));
		    txtinput.appendChild(dataLocation);
		    txtinput.appendChild(doc.createTextNode(" that is to be used for "));
		    txtinput.appendChild(dataPurpose);
		    txtinput.appendChild(doc.createTextNode(" and is "));
		    txtinput.appendChild(dataProperty);
		    txtinput.appendChild(dataValue);
		    txtinput.appendChild(doc.createTextNode(" if the other party ("));
		    txtinput.appendChild(actionMatch);
		    txtinput.appendChild(doc.createTextNode(") is "));
		    txtinput.appendChild(requester);
		    txtinput.appendChild(doc.createTextNode("?"));
		    
		    var peopleDiv = doc.createElement("div");
		    peopleDiv.setAttribute('id', 'peopleDiv');
		    
		    var addPerson = doc.createElement("input");
		    addPerson.setAttribute('type', "button");
		    addPerson.setAttribute('value', 'Add Person');
		    addPerson.setAttribute('id','addPerson');
		    addPerson.addEventListener("click", function(){
		    	var newPersonDiv = doc.createElement("div");
		    	newPersonDiv.setAttribute('class', "newPerson");
		    	
		    	var personTable = doc.createElement("table");
		    	personTable.setAttribute('class', 'personInput');
		    	var personTBody = doc.createElement("tbody");
		    	personTable.appendChild(personTBody);
		    	
		    	var nameRow = doc.createElement("tr");
		    	var nameLabel = doc.createElement("td");
		    	nameLabel.appendChild(doc.createTextNode("Name:"));
		    	var nameTD = doc.createElement("td");
		    	var name = doc.createElement("input");
		    	name.setAttribute("type", "text");
		    	name.setAttribute('id', 'personName');
		    	nameTD.appendChild(name);
		    	nameRow.appendChild(nameLabel);
		    	nameRow.appendChild(nameTD);
		    	
		    	var citizenshipLabel = doc.createElement("td");
		    	citizenshipLabel.appendChild(doc.createTextNode("Citizenship:"));
		    	var citizenshipTD = doc.createElement("td");
		    	var citizenship = doc.createElement("input");
		    	citizenship.setAttribute("type","text");
		    	citizenship.setAttribute('id', "citizenship");
		    	citizenship.addEventListener("keyup", function(e){
			    	if (this.value != "") {
			    		policyUtils.dropdown(this, doc, true);
			    	}else{
			    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
			    		policyUtils.current = "";
			    	}
			    }, false);
			    citizenship.addEventListener("blur", function(e){
					this.value = policyUtils.current;
					policyUtils.current = "";
			    	if (doc.getElementById("choices")) {
			    		div.removeChild(doc.getElementById("choices"));
			    	}
			    }, false);
			    citizenship.addEventListener("focus", function(e){
			    	policyUtils.current = this.value;
			    }, false);
		    	citizenshipTD.appendChild(citizenship);
		    	nameRow.appendChild(citizenshipLabel);
		    	nameRow.appendChild(citizenshipTD);
		    	personTBody.appendChild(nameRow);
		    	
		    	var employerRow = doc.createElement("tr");
		    	var employerNameLabel = doc.createElement("td");
		    	employerNameLabel.appendChild(doc.createTextNode("Employer:"));
		    	var employerNameTD = doc.createElement("td");
		    	var employerName = doc.createElement("input");
		    	employerName.setAttribute('type', 'text');
		    	employerName.setAttribute('id', 'employerName');
		    	employerName.addEventListener("keyup", function(e){
			    	if (this.value != "") {
			    		policyUtils.dropdown(this, doc, true);
			    	}else{
			    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
			    		policyUtils.current = "";
			    	}
			    }, false);
			    employerName.addEventListener("blur", function(e){
					this.value = policyUtils.current;
					policyUtils.current = "";
			    	if (doc.getElementById("choices")) {
			    		div.removeChild(doc.getElementById("choices"));
			    	}
			    }, false);
			    employerName.addEventListener("focus", function(e){
			    	policyUtils.current = this.value;
			    }, false);
		    	employerNameTD.appendChild(employerName);
		    	employerRow.appendChild(employerNameLabel);
		    	employerRow.appendChild(employerNameTD);
		    	
		    	var employerTypeLabel = doc.createElement("td");
		    	employerTypeLabel.appendChild(doc.createTextNode("Employer Type:"));
		    	var employerTypeTD = doc.createElement("td");
		    	var employerType = doc.createElement("input");
		    	employerType.setAttribute('type', 'text');
		    	employerType.setAttribute('id', 'employerType');
		    	employerType.addEventListener("keyup", function(e){
			    	if (this.value != "") {
			    		policyUtils.dropdown(this, doc, true);
			    	}else{
			    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
			    		policyUtils.current = "";
			    	}
			    }, false);
			    employerType.addEventListener("blur", function(e){
					this.value = policyUtils.current;
					policyUtils.current = "";
			    	if (doc.getElementById("choices")) {
			    		div.removeChild(doc.getElementById("choices"));
			    	}
			    }, false);
			    employerType.addEventListener("focus", function(e){
			    	policyUtils.current = this.value;
			    }, false);
		    	employerTypeTD.appendChild(employerType);
		    	employerRow.appendChild(employerTypeLabel);
		    	employerRow.appendChild(employerTypeTD);
		    	
//		    	var employerSubGroupLabel = doc.createElement("td");
//		    	employerSubGroupLabel.appendChild(doc.createTextNode("Employer Sub Group:"));
//		    	var employerSubGroupTD = doc.createElement("td");
//		    	var employerSubGroup = doc.createElement("input");
//		    	employerSubGroup.setAttribute('type', 'text');
//		    	employerSubGroupTD.appendChild(employerSubGroup);
//		    	employerRow.appendChild(employerSubGroupLabel);
//		    	employerRow.appendChild(employerSubGroupTD);
//		    	
//		    	var employmentTypeLabel = doc.createElement("td");
//		    	employmentTypeLabel.appendChild(doc.createTextNode("Employment Type:"));
//		    	var employmentTypeTD = doc.createElement("td");
//		    	var employmentType = doc.createElement("input");
//		    	employmentType.setAttribute('type', 'text');
//		    	employmentTypeTD.appendChild(employmentType);
//		    	employerRow.appendChild(employmentTypeLabel);
//		    	employerRow.appendChild(employmentTypeTD);
		    	personTBody.appendChild(employerRow);
		    	
		    	var employmentActivitiesRow = doc.createElement("tr");
		    	var jobNameLabel = doc.createElement("td");
		    	jobNameLabel.appendChild(doc.createTextNode("Job:"));
		    	var jobNameTD = doc.createElement("td");
		    	var jobName = doc.createElement("input");
		    	jobName.setAttribute('type', 'text');
		    	jobName.setAttribute('id', 'jobName');
		    	jobName.addEventListener("keyup", function(e){
			    	if (this.value != "") {
			    		policyUtils.dropdown(this, doc, true);
			    	}else{
			    		if (doc.getElementById("choices")) div.removeChild(doc.getElementById("choices"));
			    		policyUtils.current = "";
			    	}
			    }, false);
			    jobName.addEventListener("blur", function(e){
					this.value = policyUtils.current;
					policyUtils.current = "";
			    	if (doc.getElementById("choices")) {
			    		div.removeChild(doc.getElementById("choices"));
			    	}
			    }, false);
			    jobName.addEventListener("focus", function(e){
			    	policyUtils.current = this.value;
			    }, false);
		    	jobNameTD.appendChild(jobName);
		    	employmentActivitiesRow.appendChild(jobNameLabel);
		    	employmentActivitiesRow.appendChild(jobNameTD);
		    	
//		    	var jobLocationLabel = doc.createElement("td");
//		    	jobLocationLabel.appendChild(doc.createTextNode("Location:"));
//		    	var jobLocationTD = doc.createElement("td");
//		    	var jobLocation = doc.createElement("input");
//		    	jobLocation.setAttribute('type', 'text');
//		    	jobLocationTD.appendChild(jobLocation);
//		    	employmentActivitiesRow.appendChild(jobLocationLabel);
//		    	employmentActivitiesRow.appendChild(jobLocationTD);
//		    	
//		    	var jobLocationTypeLabel = doc.createElement("td");
//		    	jobLocationTypeLabel.appendChild(doc.createTextNode("Location Type:"));
//		    	var jobLocationTypeTD = doc.createElement("td");
//		    	var jobLocationType = doc.createElement("input");
//		    	jobLocationType.setAttribute('type', 'text');
//		    	jobLocationTypeTD.appendChild(jobLocationType);
//		    	employmentActivitiesRow.appendChild(jobLocationTypeLabel);
//		    	employmentActivitiesRow.appendChild(jobLocationTypeTD);
		    	personTBody.appendChild(employmentActivitiesRow);
		    	
		    	var sysRecRow = doc.createElement("tr");
		    	var sysRecLabel = doc.createElement("td");
		    	sysRecLabel.appendChild(doc.createTextNode("Maintains a System of Records"));
		    	var sysRecTD = doc.createElement("td");
		    	var sysRec = doc.createElement("input");
		    	sysRec.setAttribute('type', 'checkbox');
		    	sysRec.setAttribute('id', 'sysRec');
		    	sysRecTD.appendChild(sysRec);
		    	sysRecRow.appendChild(sysRecLabel);
		    	sysRecRow.appendChild(sysRecTD);
		    	personTBody.appendChild(sysRecRow);
		    	
		    	
		    	var done = doc.createElement("input");
		    	done.setAttribute("type", "button");
		    	done.setAttribute("value", "OK");
		    	done.addEventListener("click", function(){
		    		if (name.value.search(/\w/) == -1) {
		    			alert("You must enter a name");
		    		}else {
			    		var facts = prefixes.facts;
			    		var pri = prefixes.pri;
			    		var rdf = prefixes.rdf;
			    		var person = new Person(name.value);
			    		if (citizenship.value.search(/\w/)!= -1) {
			    			person.citizenship = citizenship.value;
			    		}
			    		if (employerName.value.search(/\w/)!= -1) {
			    			person.employerName = employerName.value;
			    		}
			    		if (employerType.value.search(/\w/)!= -1) {
			    			person.employerType = employerType.value;
			    		}
			    		if (jobName.value.search(/\w/)!= -1) {
			    			person.jobName = jobName.value;
			    		}
			    		if (policyUtils.options.citizenships[citizenship.value]) {
			    			person.output += facts(person.name) + " " + rdf('type') + " " + policyUtils.options.citizenships[citizenship.value] + ".\n";
			    		}else {
			    			person.output += facts(person.name) + " " + rdf('type') + " " + pri("Person") + ".\n";
			    		}
			    		if (employerName.value.search(/\w/)!= -1) {
			    			if(jobName.value == "Head Of") {
			    				person.output += facts(person.name) + " " + pri("headOf") + " " + (policyUtils.options.agencies[employerName.value]||facts(employerName.value.replace(/\s+/, "_"))) + ".\n";
			    			}else {
			    				person.output += facts(person.name) + " " + pri("employedBy") + " " + (policyUtils.options.agencies[employerName.value]||facts(employerName.value.replace(/\s+/, "_"))) + ".\n";
			    			}
			    			if(jobName.value != "Head Of" && jobName.value != "Employee" && policyUtils.options.titles[jobName.value]) {
			    				person.output += facts(person.name) + " " + rdf('type') + " " + policyUtils.options.titles[jobName.value] + ".\n";
			    			}
			    			if (policyUtils.options.employerTypes[employerType.value]) {
			    				person.output += (policyUtils.options.agencies[employerName.value]||facts(employerName.value.replace(/\s+/, "_"))) + " " + rdf('type') + " " + policyUtils.options.employerTypes[employerType.value] + ".\n";
			    			}
			    		}
			    		if (sysRec.checked && person.employerName) {
			    			person.sysRec = facts(person.employerName + "_SR");
			    			policyUtils.options.dataLocs[person.employerName + "'s System"] = person.sysRec;
			    			person.output += (policyUtils.options.agencies[employerName.value]||facts(employerName.value.replace(/\s+/, "_"))) + " " + pri("maintains") + " " + person.sysRec + ".\n";
			    		}
			    		if (doc.getElementById(person.name)) {
			    			doc.getElementById(person.name).setAttribute('id', 'sldkjf');
			    		}
			    		policyUtils.people[person.name.replace("_", " ")] = person;
						doc.getElementById('peopleDiv').appendChild(createPeopleList());
			    		doc.getElementById("logForm").setAttribute('style', 'visibility: visible');
			    		var personInfo = doc.createElement("table");
			    		personInfo.setAttribute('id', person.name);
			    		personInfo.setAttribute('class', 'personView');
			    		if (citizenship.value.search(/\w/)!= -1) {
			    			var citRow = doc.createElement("tr");
			    			citRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode("Citizenship: ")));
			    			citRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode(citizenship.value)));
			    			personInfo.appendChild(citRow);
			    		} 
			    		if (employerName.value.search(/\w/)!= -1) {
			    			var enRow = doc.createElement("tr");
			    			enRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode("Employer: ")));
			    			enRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode(employerName.value)));
			    			personInfo.appendChild(enRow);
			    		}
			    		if (employerType.value.search(/\w/)!= -1) {
			    			var etRow = doc.createElement("tr");
			    			etRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode("Employer Type: ")));
			    			etRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode(employerType.value)));
			    			personInfo.appendChild(etRow);
			    		}
			    		if (jobName.value.search(/\w/)!= -1) {
			    			var jnRow = doc.createElement("tr");
			    			jnRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode("Title: ")));
			    			jnRow.appendChild(doc.createElement('td').appendChild(doc.createTextNode(jobName.value)));
			    			personInfo.appendChild(jnRow);
			    		}
			    		if (sysRec.checked) {
			    			var srRow = doc.createElement("tr");
			    			srRow.appendChild(doc.createTextNode("Maintains a System of Records"));
			    			personInfo.appendChild(srRow);
			    		}
			    		doc.getElementById("Policy Runner Pane").appendChild(personInfo);
				    	this.parentNode.parentNode.removeChild(this.parentNode);
		    		}
		    	}, false);
		    	var cancel = doc.createElement("input");
		    	cancel.setAttribute("type", "button");
		    	cancel.setAttribute("value", "Cancel");
		    	cancel.addEventListener("click", function(){
			    	doc.getElementById("logForm").setAttribute('style', 'visibility: visible');
			    	this.parentNode.parentNode.removeChild(this.parentNode);
		    	}, false);
		    	
		    	newPersonDiv.appendChild(personTable);
		    	newPersonDiv.appendChild(done);
		    	newPersonDiv.appendChild(cancel);
		    	doc.getElementById("Policy Runner Pane").appendChild(newPersonDiv);
		    	doc.getElementById("logForm").setAttribute('style', 'visibility: hidden');
		    }, false);
			function createPeopleList() {
				var peopleDiv = doc.getElementById('peopleDiv');
				if (peopleDiv && doc.getElementById("peopleList")) peopleDiv.removeChild(doc.getElementById("peopleList"));
		    	var peopleList = doc.createElement("table");
			    peopleList.setAttribute("id", "peopleList");
			    var peopleRow = doc.createElement("tr");
			    var peopleHeading = doc.createElement("th");
			    peopleHeading.appendChild(doc.createTextNode("PEOPLE:"));
			    peopleRow.appendChild(peopleHeading);
			    for (var p in policyUtils.people) {
			    	var td = doc.createElement("td");
			    	td.addEventListener("mouseover", function(){
			    		doc.getElementById(this.firstChild.nodeValue.replace(" ", "_")).setAttribute('style', 'visibility: visible; top: ' + (policyUtils.getY(this) + 65) + 'px; left: '+ policyUtils.getX(this) + 'px;');
			    	}, false);
			    	td.addEventListener("mouseout", function(){
			    		doc.getElementById(this.firstChild.nodeValue.replace(" ", "_")).setAttribute('style', 'visibility: hidden');
			    	}, false);
			    	td.appendChild(doc.createTextNode(p));
			    	peopleRow.appendChild(td);
			    }
			    peopleList.appendChild(peopleRow);
			    peopleList.setAttribute("class", 'peopleList');
			    return peopleList;
			}
		    peopleDiv.appendChild(addPerson);
			peopleDiv.appendChild(createPeopleList());
		    
		    /*TODO*/
		    var moreDiv = doc.createElement("div");
		    moreDiv.setAttribute('id', 'moreEvents');
		    
		    var ifButton = doc.createElement("input");
		    ifButton.setAttribute('type', 'button');
		    ifButton.setAttribute("value", "IF...");
		    ifButton.addEventListener("click", function(){
		    	this.parentNode.removeChild(this);
		    	var ifInput = doc.createElement("p");
		    	
		    	ifInput.appendChild(doc.createTextNode("If "));
		    }, false);
		    
		    
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
		    		for (var p in policyUtils.people) {
		    			log += policyUtils.people[p].output;
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
		    	prefixes.facts = RDFNamespace(uriPrefix + "log" + c++ + "#");
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
		    moreDiv.appendChild(ifButton);
		    buttondiv.appendChild(btninput);
		    inputDiv.appendChild(txtinput);
		    fieldset.appendChild(head);
		    fieldset.appendChild(peopleDiv);
		    fieldset.appendChild(inputDiv);
		    fieldset.appendChild(moreDiv);
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