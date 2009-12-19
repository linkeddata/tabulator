/** Sidebar for highlighting options.  This is the javascript file.**/

// 1. how to togglesidebar when a document loads
// 2. how to refresh document when sidebar starts up
// 3. added the clear settings to pref

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
	
	
	function saveSettings() {
		var saveDiv = doc.getElementById('kbHighlighter');
		for (var count = 1; count < saveDiv.childNodes.length; count++) {
			var policyDiv = saveDiv.childNodes[count];
			var saveName = policySaveArray[policyLabelArray.indexOf(policyDiv.childNodes[0].getAttribute('value'))];
			// modified by LK 12/18/09
			//var color = policyDiv.childNodes[1].getAttribute('value');
			var color = policyDiv.childNodes[1].getAttribute('color');
			tabulator.preferences.set(saveName, color);	
		}
		
	}	

	function removeSettings() {
		var saveDiv = doc.getElementById('kbHighlighter');
		for (var count = 1; count < saveDiv.childNodes.length; count++) {
			var policyDiv = saveDiv.childNodes[count];
			var saveName = policySaveArray[policyLabelArray.indexOf(policyDiv.childNodes[0].getAttribute('value'))];
			tabulator.preferences.clear(saveName);	
		}
		
	}	
	
	function get_random_color() {
    		var letters = '0123456789ABCDEF'.split('');
    		var color = '#';
    		for (var i = 0; i < 6; i++ ) {
        		color += letters[Math.round(Math.random() * 15)];
    		}
    		return color;
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
			//dump("\n preloaded color:" + loadColor + " count: " + count + " KB match:" + inKB);

			// clearing color setting for license/restriction not in KB
			// added by LK 12/3/09
			if ((loadColor!=null)&&(inKB.length==0)) { 
			    tabulator.preferences.clear(policySaveArray[count]);
          		}
			if (loadColor == null) {
				loadColor=get_random_color();
				tabulator.preferences.set(policySaveArray[count], loadColor);
			}
			if (inKB.length > 0) { 
				inUseArray[count] = 1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				txtLabel.setAttribute('value', policyLabelArray[count]);
				txtDiv.appendChild(txtLabel);

				// modified by Lk 12/18/09
				// adding colorpicker control
				var colorInput = doc.createElement("colorpicker");
				colorInput.setAttribute('type', 'button');
				colorInput.setAttribute('color', loadColor);
				colorInput.addEventListener("click", function() {
                			saveSettings();
                		} , false);
				txtDiv.appendChild(colorInput);
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

				if (policyURIArray.indexOf(ccLicenses[count].object.uri) > -1) {
					txtLabel.setAttribute('value', policyLabelArray[policyURIArray.indexOf(ccLicenses[count].object.uri)]);
				}

				txtDiv.appendChild(txtLabel);

				// modified by Lk 12/18/09
				// adding colorpicker control
                                var colorInput = doc.createElement("colorpicker");
                                colorInput.setAttribute('type', 'button');
                                colorInput.setAttribute('color', loadColor);
				colorInput.addEventListener("click", function() {
                                        saveSettings();
                                } , false);
                                txtDiv.appendChild(colorInput);
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

				if (policyURIArray.indexOf(rmpLicenses[count].object.uri) > -1) {
					txtLabel.setAttribute('value', policyLabelArray[policyURIArray.indexOf(rmpLicenses[count].object.uri)]);
				}

				txtDiv.appendChild(txtLabel);
			
				// modified by Lk 12/18/09
				// adding colorpicker control
                                var colorInput = doc.createElement("colorpicker");
                                colorInput.setAttribute('type', 'button');
                                colorInput.setAttribute('color', loadColor);
				colorInput.addEventListener("click", function() {
                                        saveSettings();
                                } , false);
                                txtDiv.appendChild(colorInput);
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

			if (loadColor) {			
				inUseArray[count] = 1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				txtLabel.setAttribute('value', policyLabelArray[count]);
				txtDiv.appendChild(txtLabel);

				// modified by Lk 12/18/09
				// adding colorpicker control
                                var colorInput = doc.createElement("colorpicker");
                                colorInput.setAttribute('type', 'button');
                                colorInput.setAttribute('color', loadColor);
				colorInput.addEventListener("click", function() {
                                        saveSettings();
                                } , false);
                                txtDiv.appendChild(colorInput);
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

	// commented out LK 12/18/09	
	//var buttonDiv = doc.createElement("div");	
	//var saveButton = doc.createElement("button");
	//saveButton.setAttribute('label', 'Save Highlighting Options');
	//saveButton.addEventListener("click", function() {
	//	saveSettings();
	//	} , false);
	//buttonDiv.appendChild(saveButton);	
        doc.addEventListener("load",function() {highlightSidebar();},false);
	
	mainBox.appendChild(infoBox);
		
	createKBHighlighter(mainBox);
	
	mainBox.appendChild(buttonDiv);
}

