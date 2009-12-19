/** Sidebar for highlighting options.  This is the javascript file.**/

// 1. how to togglesidebar when a document loads
// 2. how to refresh document when sidebar starts up
// 3. added the clear settings to pref

function highlightSidebar(doc) {
	var tabulator = Components.classes["@dig.csail.mit.edu/tabulator;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	
	var kb = tabulator.kb;		
	

	var policyURIArray =   ['http://creativecommons.org/licenses/by-sa/3.0/', 
				'http://creativecommons.org/licenses/by/3.0/', 
				'http://creativecommons.org/licenses/by-nd/3.0/', 
				'http://creativecommons.org/licenses/by-nc-nd/3.0/', 
				'http://creativecommons.org/licenses/by-nc/3.0/', 
				'http://creativecommons.org/licenses/by-nc-sa/3.0/', 
				'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Commercial', 
				'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Depiction', 
				'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Employment', 
				'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Financial',
				'http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#No-Medical'];
	
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
			//var saveName = policySaveArray[policyLabelArray.indexOf(policyDiv.childNodes[0].getAttribute('value'))];
			// modified by LK 12/18/09
			//var color = policyDiv.childNodes[1].getAttribute('value');
			var color = policyDiv.childNodes[1].getAttribute('color');
			var saveName = policyDiv.childNodes[0].getAttribute('href');
			tabulator.preferences.set(saveName, color);	
		}
		
	}	

	function removeSettings() {
		var saveDiv = doc.getElementById('kbHighlighter');
		for (var count = 1; count < saveDiv.childNodes.length; count++) {
			var policyDiv = saveDiv.childNodes[count];
			var color = policyDiv.childNodes[1].getAttribute('color');
			var saveName = policyDiv.childNodes[0].getAttribute('href');
			tabulator.preferences.clear(saveName);	
		}
		
	}	
	
	function getRandomColor() {
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

		// list of all licenses and restrictions in the kb	
		var ccLicenses = kb.statementsMatching(undefined, kb.sym("http://creativecommons.org/ns#license"), undefined);
		var rmpLicenses = kb.statementsMatching(undefined, kb.sym("http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#restricts"), undefined);

		//dump("\n\n\n RMP: " + rmpLicenses);
		//dump("\n CC: " + ccLicenses);
		var license = rmpLicenses.concat(ccLicenses);
		dump("\n RMP + CC: " + license);
		var processedLicense = new Array();

		// loading all licenses or restrictions found
		//for (var count = 0; count < policyURIArray.length; count++) {
		for (var count = 0; count < license.length; count++) {

			var curLicense = license[count].object.uri;
			dump("\n License: " + curLicense);

			if (processedLicense[curLicense] != null) { continue }
			//var loadColor = tabulator.preferences.get(policyURIArray[count]);

			var loadColor = tabulator.preferences.get(curLicense);
			var inKB = kb.statementsMatching(undefined, undefined, kb.sym(curLicense));
			dump("\n inKB: " + inKB);

			//var inKB = kb.statementsMatching(undefined, undefined, kb.sym(policyURIArray[count]));
			//var rmpKB = kb.statementsMatching(undefined, kb.sym("http://dig.csail.mit.edu/2008/02/rmp/rmp-schema#restricts"), kb.sym(policyURIArray[count]));
			//var ccKB = kb.statementsMatching(undefined, kb.sym("http://creativecommons.org/ns#license"), kb.sym(policyURIArray[count]));
			//var inKB = rmpKB + ccKB;

			// clearing color setting for license/restriction not in KB
			// added by LK 12/3/09
			if ((loadColor!=null)&&(inKB.length==0)) { 
			    //tabulator.preferences.clear(policyURIArray[count]);
			    tabulator.preferences.clear(curLicense);
          		}
			if ((loadColor == null)&&(inKB.length > 0)) {
				loadColor=getRandomColor();
				//tabulator.preferences.set(policyURIArray[count], loadColor);
				tabulator.preferences.set(curLicense, loadColor);
			}
			dump("\n preloaded color:" + loadColor + " count: " + count + " KB match:" + inKB);

			if (inKB.length > 0) { 
				// setting processedLicense	
				processedLicense[curLicense] = "done";

			        //var policyLabel = kb.statementsMatching(kb.sym(policyURIArray[count]), kb.sym("http://www.w3.org/2000/01/rdf-schema#label"));
			        var policyLabel = kb.statementsMatching(kb.sym(curLicense), kb.sym("http://www.w3.org/2000/01/rdf-schema#label"));
				dump("\n Policy label: " + policyLabel);
				//inUseArray[count] = 1;
				var txtDiv = doc.createElement("div");
				txtDiv.setAttribute('class', 'colorTab');
				var txtLabel = doc.createElement("label");

				//txtLabel.setAttribute('value', policyLabelArray[count]);
				txtLabel.setAttribute('value', policyLabel[0].object);
				//txtLabel.setAttribute('href', policyURIArray[count]);
				txtLabel.setAttribute('href', curLicense);
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

	/*	
	function loadSettings() {
		var loadDiv = doc.getElementById('kbHighlighter');
	
		for (var count = 0; count < policyURIArray.length; count++) {
			var loadColor = tabulator.preferences.get(policyURIArray[count]);

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

	}*/
	
	
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
	
	//mainBox.appendChild(buttonDiv);
}

