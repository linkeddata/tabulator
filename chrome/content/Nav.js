/**
 * for creating and appending a navigating for documentation.
 * item at which user is at is highlighted/selected in the navbar.
 * The selections (for param "select") are:
 * 'Tabulator' -- tab.html
 * 'Help' -- Help.html
 * 'SPARQL Tutorial' -- tut/querytut.html
 * 'Map Tutorial' -- tut/tabmap.html
 * 'Calendar Tutorial' -- tut/tabcal.html
 * 'About' -- About.html
 * 'To Do' -- ToDo.html
 * @param container : html dom container that the Nav should go in
 */
// @param assoc   : object   // associative array (javascript object)
// assoc maps attributes to values.
// @param obj     : object   // target object
function setAttributes(obj,assoc){
    for (key in assoc){
	var value = assoc[key];
	obj.setAttribute(key, value);
    }
}

function Nav(container){
    var linkAddressMap = {'Tabulator itself':'http://dig.csail.mit.edu/2005/ajar/ajaw/tab.html', 
                          'Tabulator Home':'http://www.w3.org/2005/ajar/tab', 
                          'Help':'http://dig.csail.mit.edu/2005/ajar/ajaw/Help.html', 
                          'Query Tutorial':'http://dig.csail.mit.edu/2005/ajar/ajaw/tut/querytut.html', 
                          'Map Tutorial':'http://dig.csail.mit.edu/2005/ajar/ajaw/tut/tabmap.html', 
                          'Calendar/Timeline':'http://dig.csail.mit.edu/2005/ajar/ajaw/tut/calHelp.html', 
                          'About':'http://dig.csail.mit.edu/2005/ajar/ajaw/About.html',
                          'What\'s New':'http://dig.csail.mit.edu/2005/ajar/ajaw/whatsnew.html', 
                          'To Do':'http://dig.csail.mit.edu/2005/ajar/ajaw/ToDo.html', 
                          'Developer':'http://dig.csail.mit.edu/2005/ajar/ajaw/Developer.html', 
                          'People':'http://dig.csail.mit.edu/2005/ajar/ajaw/people/Overview.html', 
                          'Bugs':'http://dig.csail.mit.edu/issues/tabulator/'};

    var oldChildren = container.childNodes.length
    for (var x = oldChildren - 1; x >= 0; x--) {
	container.removeChild(container.childNodes[x])
    }

    var navTable = container.appendChild(document.createElement('TABLE'));
    //container.style.position = 'fixed';
    //var navTable = document.createElement('TABLE');
    //document.body.replaceChild(navTable,container);
    var navAttr = {'class':'navside', 'border':'0', 'cellpadding':'2', 'cellspacing':'2'};

    setAttributes(navTable, navAttr);
    var tbody = navTable.appendChild(document.createElement('TBODY'));
    tbody.setAttribute('style', 'background-color: rgb(238, 238, 238);');
    var array = window.location.toString().split("/");
    var select = array[array.length - 1]; //filename where we are now
    for (var link in linkAddressMap){
	var address = linkAddressMap[link];
	var tr = tbody.appendChild(document.createElement('TR'));
	var td = tr.appendChild(document.createElement('TD'));
	var anchor = td.appendChild(document.createElement('A'));
	if (address != select){
	    anchor.href = address;	    
	}
	anchor.innerHTML = link;
    }
}

Nav(document.getElementById('Nav'));

