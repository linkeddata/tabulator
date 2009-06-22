tabulator.panes.register( {

    icon: Icon.src.icon_CVPane, //This icon should be defined in 'test.js' and 'tabulate.js'
    
    name: 'CV',

    label: 
    function(subject) 
    { return 'CV ';
    },

    /*function(subject) {   //'subject' is the source of the document
    alert(subject.location)
	if (tabulator.preferences.get('me') == subject.location)
//the criteria for displaying the pane is satisfied
		return "CV" //"the string that would be the title for the icon"
	else
   		return null;
    },*/

    render: function(subject, CVdocument) { 	//'subject' is the source of the document
						//'document' is the HTML document element we are attaching elements to

	//implement what you want to do with the pane here	
	
    content = CVdocument.createElement('div')
    content.className = "CVclass"
    x = "<html> <body> <form name=\"CV\" action=\"http://dig.csail.mit.edu/2007/wiki/sandbox/sudan#susanmb\" method=\"get\"> <p> Company: <input type=\"text\" name=\"company\"> </input>  <br /> Position: <input type=\"text\" name=\"position\"> </input> <br />  Start date: <input type=\"text\" name=\"startDate\"> </input> <br /> End date: <input type=\"text\" name=\"endDate\"> </input> </p> <input type=\"submit\" value=\"Submit\" /> <input type=\"Reset\" value=\"Reset\" /> </form> </body> </html>"
    alert(tabulator.preferences.get('me'))
    alert(CVdocument.location)

    /*content.innerHTML = x*/
        
    return content
    }
} , true); 

