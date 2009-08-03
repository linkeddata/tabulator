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

function editDistance(s, target){
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
policyPane = {
    icon: Icon.src.icon_policyPane,

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
		var div = doc.createElement("div");
		div.setAttribute("id", "Policy Runner Pane");
	    
	    var form = doc.createElement("form");
	    form.setAttribute("id","logForm");
	    form.setAttribute("action","");
	    
	    var fieldset = doc.createElement("fieldset");
	    
	    var head = doc.createElement("p");
	    head.appendChild(doc.createTextNode("Enter Log File Here"));
	    
	    var div1 = doc.createElement("div");
	    div1.setAttribute("style","margin:10px");
	    
	    var txtinput = doc.createElement("Textarea");
	    txtinput.setAttribute("id","log");
	    txtinput.setAttribute("rows","10");
	    txtinput.setAttribute("cols","70");
	    
	    var buttondiv = doc.createElement("div");
	    
	    var btninput = doc.createElement("input");
	    btninput.setAttribute("type","button");
	    btninput.setAttribute("value","Go");
		var uri = "http://dig.csail.mit.edu/2008/webdav/mjsweig/log.n3";
	//	webdav.manager.register(uri, function(uri, success) {alert(success);});
	//	webdav.manager.set_data(uri, "test");
	//	webdav.manager.save_file(uri, "test", function(){});
		xhr = tabulator.util.XMLHTTPFactory();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				alert(xhr.status + " " + xhr.statusText);
			}
		};
		xhr.open('PUT', uri, true);
		xhr.send("test");
	    btninput.addEventListener("click", function(){
	//    	var browser = top.document.getElementById("content");
	//    	browser.selectedTab = browser.addTab(decodeURIComponent("http://mr-burns.w3.org/cgi-bin/air_2_0.py?" +
	//    			"logFile=" + uri + "&rulesFile=" + doc.URL));
	    }, false);
	
	    buttondiv.appendChild(btninput);
	    div1.appendChild(txtinput);
	    fieldset.appendChild(head);
	    fieldset.appendChild(div1);
	    fieldset.appendChild(buttondiv);
	    form.appendChild(fieldset);
	    div.appendChild(form);
	    div.setAttribute("style","border: 3px groove red");
		return div;
    }
};
tabulator.panes.register(policyPane, true); 
