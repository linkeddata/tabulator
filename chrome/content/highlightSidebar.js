/** Sidebar for highlighting options.  This is the javascript file.**/

// 1. how to togglesidebar when a document loads
// 2. how to refresh document when sidebar starts up
// 3. added the clear settings to pref
// 4. outline view, expand table
// 5. log - where does it get logged
// 6. what are the kb functions ? kb.matchedStatements, kb.each etc. 

function highlightSidebar(doc) {
	var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	
	var kb = tabulator.kb;		
		
	var ccLicenses = kb.statementsMatching(undefined, kb.sym("http://creativecommons.org/ns#license"), undefined);

	/**** Try to add the rmp ontology to codebase later ***/
	//tabulator.ns.rmp = rmp = RDFNamespace("http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#");
	var rmpLicenses = kb.statementsMatching(undefined, kb.sym("http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#restricts"), undefined);
		
	var policyURIArray = ['http://creativecommons.org/licenses/by-sa/3.0/', 'http://creativecommons.org/licenses/by/3.0/', 'http://creativecommons.org/licenses/by-nd/3.0/', 'http://creativecommons.org/licenses/by-nc-nd/3.0/', 'http://creativecommons.org/licenses/by-nc/3.0/', 'http://creativecommons.org/licenses/by-nc-sa/3.0/', 'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Commercial', 'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Depiction', 'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Employment', 
	'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Financial',
	'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Medical'];
	
	var policyLabelArray = ['CC:Attribution-ShareAlike: ', 'CC:Attribution: ', 'CC:Attribution-NoDerivs: ', 'CC:Attribution-NonCommercial-NoDerivs: ', 'CC:Attribution-NonCommercial: ', 'CC:Attribution-NonCommercial-ShareAlike: ', 'RMP:No-Commercial: ', 'RMP:No-Depiction: ', 'RMP:No-Employment: ', 'RMP:No-Financial: ', 'RMP:No-Medical: ' ];
	
	var policySaveArray = ['ccBySa', 'ccBy', 'ccByNd', 'ccByNcNd', 'ccByNc', 'ccByNcSa', 'rmpCom', 'rmpDep', 'rmpEmp', 'rmpFin', 'rmpMed'];
	
	var colorList = ['None', 'Gray', 'Blue', 'Red', 'Green', 'Magenta', 'Yellow', 'Purple', 'Teal', 'Aquamarine', 'Beige', 'Coral'];
	
	var inUseArray = new Array(policySaveArray.length);
	for (var count = 0; count < inUseArray.length; count++) {
		inUseArray[count] = 0;
	}
					
	var mainDiv = doc.getElementById('hlightdiv');
	var mainBox = doc.createElement("groupbox");
	mainBox.setAttribute('orient', 'vertical');
	mainBox.setAttribute('id', 'mainBox');
	mainDiv.appendChild(mainBox);
	
	
	function removeHighlightOption(div, newDiv) {
		div.removeChild(newDiv);
	}
	
	/*
	function applyHighlightOptions(div) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation)		                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow); 
		
		mainWindow.reload();
	}*/
	
	function saveSettings() {
		var saveDiv = doc.getElementById('kbHighlighter');
		for (var count = 1; count < saveDiv.childNodes.length; count++)
		{
			var policyDiv = saveDiv.childNodes[count];
			var saveName = policySaveArray[policyLabelArray.indexOf(policyDiv.childNodes[0].getAttribute('value'))];
			var color = policyDiv.childNodes[1].getAttribute('value');
			tabulator.preferences.set(saveName, color);	
		}
		
	}	

	function removeSettings() {
		var saveDiv = doc.getElementById('kbHighlighter');
		for (var count = 1; count < saveDiv.childNodes.length; count++)
		{
			var policyDiv = saveDiv.childNodes[count];
			var saveName = policySaveArray[policyLabelArray.indexOf(policyDiv.childNodes[0].getAttribute('value'))];
			tabulator.preferences.clear(saveName);	
		}
		
	}	
		
	function createKBHighlighter(div) {
		var newDiv = doc.createElement("groupbox");
		newDiv.setAttribute('orient', 'vertical');
		newDiv.setAttribute('id', 'kbHighlighter');
		
		var txtDiv = doc.createElement("div");
		var txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Licenses/Restrictions in Knowledge Base:');
		txtDiv.appendChild(txtLabel);
		newDiv.appendChild(txtDiv);
		
		// Loading preloaded stuff saved in tabulator.preferences
		for (var count = 0; count < policySaveArray.length; count++) {
			var loadColor = tabulator.preferences.get(policySaveArray[count]);
			var inKB = kb.statementsMatching(undefined, undefined, kb.sym(policyURIArray[count]));

			// clearing color setting not in KB
			// added by LK 12/3/09
			if ((loadColor)&&(inKB.length==0)) { 
			    tabulator.preferences.clear(policySaveArray[count]);
          		}
			if ((loadColor)&&(inKB.length > 0)) { 
				inUseArray[count] = 1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				txtLabel.setAttribute('value', policyLabelArray[count]);
				txtDiv.appendChild(txtLabel);

				/*var colorInput = doc.createElement("input");
				colorInput.setAttribute('type', 'text');
				colorInput.setAttribute('name', 'colorInput');
				colorInput.setAttribute('id', 'colorInput');
				//colorInput.setAttribute('class', 'color');
				//colorInput.setAttribute('value', '66CC00');
				txtDiv.appendChild(colorInput);
				newDiv.appendChild(txtDiv);*/

				var colMenu = doc.createElement("menulist");
				colMenu.setAttribute('id', 'colMenu ');
				colMenu.setAttribute('onmousedown', '"show()"');

				var colMenuhelper = doc.createElement("menupopup");
				for (var i = 0; i < colorList.length; i++) {
					var colOption = doc.createElement("menuitem");
					colOption.setAttribute('value', colorList[i]);
					colOption.setAttribute('label', colorList[i]);
					if (loadColor == colorList[i])
						colOption.setAttribute('selected', true);
					colMenuhelper.appendChild(colOption);
				}
				colMenu.appendChild(colMenuhelper);
				txtDiv.appendChild(colMenu);
				newDiv.appendChild(txtDiv); 
			}	
		}

		
		for (var count = 0; count < ccLicenses.length; count++) {
			if (inUseArray[policyURIArray.indexOf(ccLicenses[count].object.uri)] == 0) {
				// unsetting inUseArray added by LK 12/3/09
                                inUseArray[policyURIArray.indexOf(ccLicenses[count].object.uri)] = -1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				if (policyURIArray.indexOf(ccLicenses[count].object.uri) > -1)
				{
					txtLabel.setAttribute('value', policyLabelArray[policyURIArray.indexOf(ccLicenses[count].object.uri)]);
				}

				txtDiv.appendChild(txtLabel);

				var colMenu = doc.createElement("menulist");
				colMenu.setAttribute('id', 'colMenu ');
				colMenu.setAttribute('onmousedown', '"show()"');

				var colMenuhelper = doc.createElement("menupopup");
				for (var i = 0; i < colorList.length; i++) {
					var colOption = doc.createElement("menuitem");
					colOption.setAttribute('value', colorList[i]);
					colOption.setAttribute('label', colorList[i]);	
					colMenuhelper.appendChild(colOption);
				}
				colMenu.appendChild(colMenuhelper);
				txtDiv.appendChild(colMenu);
				newDiv.appendChild(txtDiv);	
			}
		}
		
		/******* Add same functionality for RMP licesnes *******/
		
		
		for (var count = 0; count < rmpLicenses.length; count++)
		{
			if (inUseArray[policyURIArray.indexOf(rmpLicenses[count].object.uri)] == 0)
			{		
				// unsetting inUseArray added by LK 12/3/09
                                inUseArray[policyURIArray.indexOf(rmpLicenses[count].object.uri)] = -1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				if (policyURIArray.indexOf(rmpLicenses[count].object.uri) > -1)
				{
					txtLabel.setAttribute('value', policyLabelArray[policyURIArray.indexOf(rmpLicenses[count].object.uri)]);
				}

				txtDiv.appendChild(txtLabel);

				var colMenu = doc.createElement("menulist");
				colMenu.setAttribute('id', 'colMenu ');
				colMenu.setAttribute('onmousedown', '"show()"');

				var colMenuhelper = doc.createElement("menupopup");
				for (var i = 0; i < colorList.length; i++) {
					var colOption = doc.createElement("menuitem");
					colOption.setAttribute('value', colorList[i]);
					colOption.setAttribute('label', colorList[i]);	
					colMenuhelper.appendChild(colOption);
				}
				colMenu.appendChild(colMenuhelper);
				txtDiv.appendChild(colMenu);
				newDiv.appendChild(txtDiv);
			}
		}		

		

		div.appendChild(newDiv);
	
	}	
	
	function loadSettings() {
		var loadDiv = doc.getElementById('kbHighlighter');
	
		for (var count = 0; count < policySaveArray.length; count++)
		{
			var loadColor = tabulator.preferences.get(policySaveArray[count]);

			if (loadColor)
			{			
				inUseArray[count] = 1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				txtLabel.setAttribute('value', policyLabelArray[count]);
				txtDiv.appendChild(txtLabel);

				var colMenu = doc.createElement("menulist");
				colMenu.setAttribute('id', 'colMenu ');
				colMenu.setAttribute('onmousedown', '"show()"');
				var colMenuhelper = doc.createElement("menupopup");
				for (var i = 0; i < colorList.length; i++) {
					var colOption = doc.createElement("menuitem");
					colOption.setAttribute('value', colorList[i]);
					colOption.setAttribute('label', colorList[i]);	
					colMenuhelper.appendChild(colOption);
				}
				colMenu.appendChild(colMenuhelper);
				txtDiv.appendChild(colMenu);
				alert('preload');
				loadDiv.appendChild(txtDiv);
			}
			alert('here'); 
		}

	}		
	
	
	var infoBox = doc.createElement("groupbox");
	infoBox.setAttribute('orient', 'vertical'); 

	var tmp = doc.createElement("label");
	tmp.setAttribute('value', 'Welcome to the License/Restriction Highlighter!');
	infoBox.appendChild(tmp);
	
	var buttonDiv = doc.createElement("div");	
	var saveButton = doc.createElement("button");
	saveButton.setAttribute('label', 'Save Highlighting Options');
	saveButton.addEventListener("click", function() {
		saveSettings();
		} , false);
	buttonDiv.appendChild(saveButton);	
        doc.addEventListener("load",function() {highlightSidebar();},false);
	
	//var removeButton = doc.createElement("button");
	//removeButton.setAttribute('label', 'Remove Highlighting Options');
	//removeButton.addEventListener("click", function() {
	//	removeSettings();
	//	} , false);
	//buttonDiv.appendChild(removeButton);	

	mainBox.appendChild(infoBox);
		
	createKBHighlighter(mainBox);
	
	mainBox.appendChild(buttonDiv);
}


	/*
	function setSidebarWidth(newwidth) {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserWrite");
	 var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	 .getInterface(Components.interfaces.nsIWebNavigation)
	 .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
	 .rootTreeItem
	 .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	 .getInterface(Components.interfaces.nsIDOMWindow);
	 mainWindow.menubar.visible = !mainWindow.menubar.visible;
	}
	
	setSidebarWidth(100);
	
	function createRMPHighlighter(div) {
		var colorList = ['', 'Gray', 'Blue', 'Red', 'Green', 'Magenta', 'Yellow', 'Purple', 'Teal'];
	
		var newDiv = doc.createElement("groupbox");
		newDiv.setAttribute('orient', 'vertical');
		
		var txtDiv = doc.createElement("div");
		var txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Respect My Privacy Restrictions');
		txtDiv.appendChild(txtLabel);
		newDiv.appendChild(txtDiv);
		
		// no-comm

		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'no-commercial: ');
		txtDiv.appendChild(txtLabel);
		
		var colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		var colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++) {
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);
		
		// no-depic
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'no-depiction: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++) {
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);
		
		//no-empl
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'no-employment: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);		
		
		//no-fin
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'no-financial: ');
		txtDiv.appendChild(txtLabel);
	
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++) {
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv); 
		
		//no-med
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'no-medical: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);			


		div.appendChild(newDiv);
	
	}
	
	function createCCHighlighter(div) {
		var colorList = ['', 'Gray', 'Blue', 'Red', 'Green', 'Magenta', 'Yellow', 'Purple', 'Teal'];
	
		var newDiv = doc.createElement("groupbox");
		newDiv.setAttribute('orient', 'vertical');
		
		var txtDiv = doc.createElement("div");
		var txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Creative Commons License');
		txtDiv.appendChild(txtLabel);
		newDiv.appendChild(txtDiv);
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		var txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution: ');
		txtDiv.appendChild(txtLabel);
		
		var colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		var colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);

		//attr-noderivs

		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution-NoDerivs: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);
		
		//attr-noncomm-noderivs
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution-NonCommercial-NoDerivs: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);
		
		//attr-noncomm
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution-NonCommercial: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);		
		
		//attr-noncomm-sharealike
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution-NonCommercial-ShareAlike: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);
		
		//sharealike
		
		txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Attribution-ShareAlike: ');
		txtDiv.appendChild(txtLabel);
		
		colMenu = doc.createElement("menulist");
		colMenu.setAttribute('id', 'colMenu ');
		colMenu.setAttribute('onmousedown', '"show()"');
		
		colMenuhelper = doc.createElement("menupopup");
		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);	
			colMenuhelper.appendChild(colOption);
		}
		colMenu.appendChild(colMenuhelper);
		txtDiv.appendChild(colMenu);
		newDiv.appendChild(txtDiv);			


		div.appendChild(newDiv);
	
	}	
	
	function createHighlightOption(div, subj, sCheck, sNS, pred, pCheck, pNS, obj, oCheck, oNS, col)  {
		var colorList = ['Gray', 'Blue', 'Red', 'Green', 'Magenta', 'Yellow', 'Purple', 'Teal'];
		
		var nsList = ['', 'literal', 'http', 'httph', 'ical', 'foaf', 'rdf', 'rdfs', 'owl', 'dc', 'dct', 'rss', 'xsd', 'contact', 'mo', 'cc', 'doap', 'rmp'];
		
		var newDiv = doc.createElement("groupbox");
		newDiv.setAttribute('orient', 'vertical');
		
		var txtDiv = doc.createElement("div");
		txtDiv.setAttribute('class', 'colorTab');
		txtLabel = doc.createElement("label");
		txtLabel.setAttribute('value', 'Highlight options: ');
		txtDiv.appendChild(txtLabel);
		var removeLink = doc.createElement("button");
		removeLink.setAttribute('label', 'Remove');
		removeLink.addEventListener("click", function() {
		removeHighlightOption(div, newDiv);
		} , false);
		txtDiv.appendChild(removeLink);
		
		newDiv.appendChild(txtDiv);
		
		var subjDiv = doc.createElement("div");
		subjDiv.setAttribute('class', 'colorTab');
		
		var subjLabel = doc.createElement("label");
		subjLabel.setAttribute('value', 'S: ');
		
		subjCheck = doc.createElement("checkbox");
		if (sCheck == true)
			subjCheck.setAttribute('checked', true);
			
		subjDiv.appendChild(subjCheck);
		subjDiv.appendChild(subjLabel);	
		
		subjNS = doc.createElement("menulist");
		subjNS.setAttribute('id', 'subjectNS');
		subjNS.setAttribute('onmousedown', '"show()"');
		//subjNS.setAttribute("style", "width: 150px;");
		
		subjNShelper = doc.createElement("menupopup");
		
		for (var i = 0; i < nsList.length; i++)
		{
			var subjOption = doc.createElement("menuitem");
			subjOption.setAttribute('value', nsList[i]);
			subjOption.setAttribute('label', nsList[i]);
			if ((sNS != null) && (sNS == nsList[i]))
				subjOption.setAttribute('selected', true);
			subjNShelper.appendChild(subjOption);
		}
		
		subjNS.appendChild(subjNShelper);
		
		subjDiv.appendChild(subjNS);
		
		subjTxt = doc.createElement("textbox");
		subjTxt.setAttribute('size', 20);
				
		if (subj != null)
			subjTxt.setAttribute('value', subj);
		else
			subjTxt.setAttribute('value', 'Enter subject');
		subjDiv.appendChild(subjTxt);
		
		
		var predDiv = doc.createElement("div");
		predDiv.setAttribute('class', 'colorTab');
		
		var predLabel = doc.createElement("label");
		predLabel.setAttribute('value', 'P: ');
		
		predCheck = doc.createElement("checkbox");
		if (pCheck == true)
			predCheck.setAttribute('checked', true);
			
		predDiv.appendChild(predCheck);
		predDiv.appendChild(predLabel);	
		
		predNS = doc.createElement("menulist");
		predNS.setAttribute('id', 'predNS');
		predNS.setAttribute('onmousedown', '"show()"');
		//subjNS.setAttribute("style", "width: 150px;");
		
		predNShelper = doc.createElement("menupopup");

		for (var i = 0; i < nsList.length; i++)
		{
			var predOption = doc.createElement("menuitem");
			predOption.setAttribute('value', nsList[i]);
			predOption.setAttribute('label', nsList[i]);
			if ((pNS != null) && (pNS == nsList[i]))
				predOption.setAttribute('selected', true);
			predNShelper.appendChild(predOption);
		}
		
		predNS.appendChild(predNShelper);
		
		predDiv.appendChild(predNS);
		
		predTxt = doc.createElement("textbox");
		predTxt.setAttribute('size', 20);
				
		if (pred != null)
			predTxt.setAttribute('value', pred);
		else
			predTxt.setAttribute('value', 'Enter predicate');
		predDiv.appendChild(predTxt);
		
		
		var objDiv = doc.createElement("div");
		objDiv.setAttribute('class', 'colorTab');
		
		var objLabel = doc.createElement("label");
		objLabel.setAttribute('value', 'O: ');
		
		objCheck = doc.createElement("checkbox");
		if (oCheck == true)
			objCheck.setAttribute('checked', true);
			
		objDiv.appendChild(objCheck);
		objDiv.appendChild(objLabel);	
		
		objNS = doc.createElement("menulist");
		objNS.setAttribute('id', 'objNS');
		objNS.setAttribute('onmousedown', '"show()"');
		//subjNS.setAttribute("style", "width: 150px;");
		
		objNShelper = doc.createElement("menupopup");

		for (var i = 0; i < nsList.length; i++)
		{
			var objOption = doc.createElement("menuitem");
			objOption.setAttribute('value', nsList[i]);
			objOption.setAttribute('label', nsList[i]);
			if ((oNS != null) && (oNS == nsList[i]))
				objOption.setAttribute('selected', true);			
			objNShelper.appendChild(objOption);
		}
		
		objNS.appendChild(objNShelper);
		
		objDiv.appendChild(objNS);
		
		objTxt = doc.createElement("textbox");
		objTxt.setAttribute('size', 20);
				
		if (obj != null)
			objTxt.setAttribute('value', obj);
		else
			objTxt.setAttribute('value', 'Enter Object');
		objDiv.appendChild(objTxt);
		
		
		
		var colDiv = doc.createElement("div");
		
		var colLabel = doc.createElement("label");
		colLabel.setAttribute('value', 'Color: ');
		colDiv.appendChild(colLabel);	

		colMenu = doc.createElement("menulist");
		colMenu .setAttribute('id', 'colMenu ');
		colMenu .setAttribute('onmousedown', '"show()"');
		//subjNS.setAttribute("style", "width: 150px;");
		
		colMenuhelper = doc.createElement("menupopup");

		for (var i = 0; i < colorList.length; i++)
		{
			var colOption = doc.createElement("menuitem");
			colOption.setAttribute('value', colorList[i]);
			colOption.setAttribute('label', colorList[i]);
			if ((col != null) && (col == colorList[i]))
				colOption.setAttribute('selected', true);	
			colMenuhelper.appendChild(colOption);
		}
		
		colMenu.appendChild(colMenuhelper);
		colDiv.appendChild(colMenu);
		
				
		newDiv.appendChild(subjDiv);
		newDiv.appendChild(predDiv);
		newDiv.appendChild(objDiv);
		newDiv.appendChild(colDiv);
	
		div.appendChild(newDiv);    
	}	
	*/
	
	
	/*
	tmp = doc.createElement("label");
	tmp.setAttribute('value', 'Push the button below to add a set of highlighting options.');
	infoBox.appendChild(tmp);
	tmp = doc.createElement("label");
	tmp.setAttribute('value', 'Each of the highlighting options contains a Subject (S), Predicate (P), Object (O), and Color option.');
	infoBox.appendChild(tmp);
	tmp = doc.createElement("label");
	tmp.setAttribute('value', 'Choose the checkbox for the option you want to match then choose the namespace and type in the value you want to match against.');
	infoBox.appendChild(tmp);
	tmp = doc.createElement("label");
	tmp.setAttribute('value', 'For example to highlight all the triples that contain FOAF knows, you would check the Predicate option, chooose the FOAF namespace, and type in knows in the textbox.');
	infoBox.appendChild(tmp);
	
	
	var buttonDiv = doc.createElement("div");
	var addButton = doc.createElement("button");
	addButton.setAttribute('label', 'Add Highlighting Option');
	addButton.addEventListener("click", function() {
		createCCHighlighter(mainBox);
		createRMPHighlighter(mainBox);		
		} , false);
	buttonDiv.appendChild(addButton);		
	
	var applyButton = doc.createElement("button");
	applyButton.setAttribute('label', 'Apply Highlighting Options');
	applyButton.addEventListener("click", function() {
		applyHighlightOptions(mainBox);
		} , false);
	buttonDiv.appendChild(applyButton);
	
	infoBox.appendChild(buttonDiv);
	*/	
