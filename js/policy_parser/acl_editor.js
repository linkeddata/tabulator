function test(){
	acl = new ACLEditor("http://presbrey.xvm.mit.edu/.metadata.rdf")
	acl.readMetaData();
	acl.convertHTTPMethodsToPermissions();
	for (r in acl.resourceList){
		acl.addRow(resourceList[r],peopleList[r], permissionsList[r], "TODO - Fine-grained editing: What should be here? The specific HTTP methods which are allowed? Ability to save the metadata?")
	}
}


function ACLEditor(metadatafileURI){

	this.resourceList = resourceList = {};
	this.peopleList = peopleList = {};
	this.httpMethodsList = httpMethodsList = {};
	this.permissionsList = permissionsList = {};
	this.uri = uri = metadatafileURI;

	this.convertHTTPMethodsToPermissions = function (){
	/** 
	For each of the available rules in the metadata file, the RW permissions
	are assigned based on the allowed HTTP methods. The allowed permission 
	types are:
	0 : No read or write
	1 : Read only
	2 : Write only
	3 : Read and Write 
	
	The HTTP methods that are checked along with their permission settings are:
	 (not all of them are implemented as of now)
	GET -> 1
	HEAD -> 1
	CHECKOUT -> 1
	PUT -> 2
	POST -> 3 Considering the case where the response is 201(created)
	DELETE -> 2 
	OPTIONS -> 1
	*/

		if (httpMethodsList == {}) return;
		for (rule in httpMethodsList){
			var httpMethods = httpMethodsList[rule].toString().split(",");
			var permission = 0; //the default
			for (var i=0; i<httpMethods.length; i++){
				if (httpMethods[i] == "*")
					permission = 3;
				if (permission == 0 && (httpMethods[i] == "get" || 
										httpMethods[i] == "head" || 
										httpMethods[i] == "checkout" ||
										httpMethods[i] == "options" ))
					permission = 1;
				if ((permission == 0 || permission == 1) && 
										(httpMethods[i] == "put" || 
										httpMethods[i] == "delete" ))
					permission = 2;
				if ((permission == 0 || permission == 1 || permission == 2) && 
										(httpMethods[i] == "post"))
					permission = 3;
				if (permission == 1 && (httpMethods[i] == "post" ||
										httpMethods[i] == "put" ||
										httpMethods[i] == "delete"))
					permission = 3;
				if (permission == 2 && (httpMethods[i] == "post" ||
										httpMethods[i] == "get" || 
										httpMethods[i] == "head" || 
										httpMethods[i] == "checkout" ||
										httpMethods[i] == "options" ))
					permission = 3;
			}
			permissionsList[rule] = permission;
		}
	}
	
	this.readMetaData = function (){
	/**
	Read from the metadata file and extract the rules which specify the resource, people and
	the HTTP methods allowed by the user
	*/
		var req = new XMLHttpRequest(); 
		req.open('GET', uri, false); 
		req.overrideMimeType('text/xml'); 
		req.send(null); 
		var rdfxml = req.responseXML; 
		var kb = new RDFIndexedFormula(); 
		var p = new RDFParser(kb);
		p.parse(rdfxml, uri, uri);
		var results = kb.statementsMatching(
						undefined, 
						undefined, 
						new RDFSymbol('http://www.w3.org/2001/02/acls/ns#ResourceAccessRule'));
		
		/** For each of the rules populate the users specified and based on the
		HTTP methods specify whether the resource in question is Readable,
		Writable or both. 
		*/
		for (var i = 0; i < results.length; i++) { 
			rule = results[i].subject;
			var resource = kb.statementsMatching(
						rule, 
						new RDFSymbol('http://www.w3.org/2001/02/acls/ns#hasAccessTo'),
						undefined);
			var people = kb.statementsMatching(
						rule, 
						new RDFSymbol('http://www.w3.org/2001/02/acls/ns#allow'),
						undefined);
			var httpMethod = kb.statementsMatching(
						rule, 
						new RDFSymbol('http://www.w3.org/2001/02/acls/ns#methods'),
						undefined);
			resourceList[rule] = resource[0].object;
			if (people[0].object == "*") 
				peopleList[rule] = "Everyone";
			else 
				peopleList[rule] = people[0].object;
			httpMethodsList[rule] = httpMethod[0].object;
		}
		
	}

	this.addRow = function(resource_val, person_val,privilege, more_val){
	/**
		This method adds a row in the access control settings for each rule in the metadatafile
	*/
		var new_rows = document.getElementById("add_rows");
		
		var new_row = document.createElement("row");
		
		var resource = document.createElement("label");
		resource.setAttribute("value",resource_val);
		new_row.appendChild(resource);
		
		var people = document.createElement("menulist");
		var people_types = document.createElement("menupopup");
		for (r in this.peopleList){
			var type = document.createElement("menuitem");
			type.setAttribute("label", peopleList[r]);
			type.setAttribute("value", peopleList[r]);
			if (person_val == peopleList[r]) type.setAttribute("selected","true");
			people_types.appendChild(type);
		}
		people.appendChild(people_types);
		new_row.appendChild(people);
		
		var priv = document.createElement("menulist");
		var priv_types = document.createElement("menupopup");
		
		var priv_type_denied = document.createElement("menuitem");
		priv_type_denied.setAttribute("label","No Read or Write");
		priv_type_denied.setAttribute("value","0");
		if (privilege == 0) priv_type_denied.setAttribute("selected","true");
		priv_types.appendChild(priv_type_denied);
		
		var priv_type_r = document.createElement("menuitem");
		priv_type_r.setAttribute("label","Read Only");
		priv_type_r.setAttribute("value","1");
		if (privilege == 1) priv_type_r.setAttribute("selected","true");
		priv_types.appendChild(priv_type_r);
		
		var priv_type_w = document.createElement("menuitem");
		priv_type_w.setAttribute("label","Write Only");
		priv_type_w.setAttribute("value","2");
		if (privilege == 2) priv_type_w.setAttribute("selected","true");
		priv_types.appendChild(priv_type_w);
		
		var priv_type_rw = document.createElement("menuitem");
		priv_type_rw.setAttribute("label","Read and Write");
		priv_type_rw.setAttribute("value","3");
		if (privilege == 3) priv_type_rw.setAttribute("selected","true");
		priv_types.appendChild(priv_type_rw);

		priv.appendChild(priv_types);
		new_row.appendChild(priv);
		
		var more = document.createElement("button");
		more.setAttribute("label","V");
		more.setAttribute("onclick", "alert('"+more_val+"')");
		new_row.appendChild(more);
		
		new_rows.appendChild(new_row);
	}
}