/**
*  
* Semantic Clipboard
* Copy metadata along with the content for easy reuse
* 
* Oshani Seneviratne (oshani@mit.edu)
*
*/

//we are using jquery within a Firefox extension
$jq = jQuery.noConflict();

/**
* Determine what the URI of the image is, construct the attribution XHTML
* and pass it off to the system Clipboard
*/
function copyImageWithLicense(){

    //This is the image element we are using
    var element = document.popupNode;
    //This is the image src
    var imageURI = element.src;
    
    //Then, using JQuery, find the license information
    //@@@@ could be buggy - I am using the heuristic algorithm where the image and the embedded license is within the same parent node in the DOM
    
    //Create the XHTML to embed the license
    //This should look like the following snippet
    //<div xmlns:cc="http://creativecommons.org/ns#" 
    //     about="<image URI>">
    //     <a rel="cc:attributionURL" 
    //        property="cc:attributionName" 
    //        href="<document source URI>">
    //        Name of the Person </a> / 
    //       <a rel="license" href="<the license URI>">License</a>
    //</div>
    var attributionName;
    var attributionURI;
    var licenseURI;
    var license;
    var nodes = $jq("img[src='"+imageURI+"']",window.content.document).parent().children("a");
    for (var i=0; i< nodes.length; i++){
        var currentNode = nodes[i];
        if (currentNode.getAttribute('rel') == "license"){
            licenseURI = currentNode;
        }
        //@@@ todo do the namespacing stuff - re: 'cc'
        else if (currentNode.getAttribute('rel') == "cc:attributionURL") {
            attributionURI = currentNode;
            attributionName = $jq(currentNode, window.content.document).text();
            //license = Do a table look up based on the URI? 
        }
    }
    
    //Do a license selection using a table lookup
    //Assume everybody is following the newer CC 3.0 version
    switch(licenseURI.toString()){
        case "http://creativecommons.org/licenses/by/3.0/":
            license = "Creative Commons Attribution 3.0 Unported";
            break;
        case "http://creativecommons.org/licenses/by-sa/3.0/":
            license = "Creative Commons Attribution-Share Alike 3.0 Unported";
            break;
        case "http://creativecommons.org/licenses/by-nd/3.0/":
            license = "Creative Commons Attribution-No Derivative Works 3.0 Unported";
            break;
        case "http://creativecommons.org/licenses/by-nc/3.0/":
            license = "Creative Commons Attribution-Noncommercial 3.0 Unported";
            break;
        case "http://creativecommons.org/licenses/by-nc-sa/3.0/":
            license = "Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported";
            break;
        case "http://creativecommons.org/licenses/by-nc-nd/3.0/":
            license = "Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 Unported";
            break;
        default: //@@@ What should we do, if the license displayed is not one of the known versions
            license = "Creative Commons";
    }
    var attributionXHTML = '<div xmlns:cc="http://creativecommons.org/ns#" about="'+imageURI+'" <a rel="cc:attributionURL" property="cc:attributionName" href="'+attributionURI+'" >'+attributionName+'</a> / <a rel="license" href="'+licenseURI+'">'+license+'</a>';
    
}

/**
* The following code is copied from nsContextMenu.js
* The only change done to the original function was 
* "this.showItem("context-copyimage-License", this.onImage);"
* This is because the context menu item 'Copy Image with Licnese'
* appears in every right click, unless we specify that we only want
* it to display with images
*/
nsContextMenu.prototype.initClipboardItems = function() {
    // Copy depends on whether there is selected text.
    // Enabling this context menu item is now done through the global
    // command updating system
    // this.setItemAttr( "context-copy", "disabled", !this.isTextSelected() );
    goUpdateGlobalEditMenuItems();

    this.showItem("context-undo", this.onTextInput);
    this.showItem("context-sep-undo", this.onTextInput);
    this.showItem("context-cut", this.onTextInput);
    this.showItem("context-copy",
                  this.isContentSelected || this.onTextInput);
    this.showItem("context-paste", this.onTextInput);
    this.showItem("context-delete", this.onTextInput);
    this.showItem("context-sep-paste", this.onTextInput);
    this.showItem("context-selectall",
                  !(this.onLink || this.onImage) || this.isDesignMode);
    this.showItem("context-sep-selectall", this.isContentSelected );

    // XXX dr
    // ------
    // nsDocumentViewer.cpp has code to determine whether we're
    // on a link or an image. we really ought to be using that...

    // Copy email link depends on whether we're on an email link.
    this.showItem("context-copyemail", this.onMailtoLink);

    // Copy link location depends on whether we're on a non-mailto link.
    this.showItem("context-copylink", this.onLink && !this.onMailtoLink);
    this.showItem("context-sep-copylink", this.onLink && this.onImage);

    //@line 350 "/builds/tinderbox/Fx-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/browser/base/content/nsContextMenu.js"
    // Copy image contents depends on whether we're on an image.
    this.showItem("context-copyimage-contents", this.onImage);
    this.showItem("context-copyimage-License", this.onImage);
    //@line 353 "/builds/tinderbox/Fx-Mozilla1.9-Release/Darwin_8.8.4_Depend/mozilla/browser/base/content/nsContextMenu.js"
    // Copy image location depends on whether we're on an image.
    this.showItem("context-copyimage", this.onImage);
    this.showItem("context-sep-copyimage", this.onImage);
}
    
/**
* Enable/Disable semantic clipboard
*/
function toggleSemClip(){
    var checked = semclipCheckbox.getAttribute('checked');
    try {
        if(checked=='true'){
            //Show all the images which has a CC license attached with a red border 
            $jq("a[rel='license']", window.content.document).parent().children("img").css({border: 'dotted 2px red'});
        }
        else{
            //Remove the attached CSS class
            $jq("a[rel='license']", window.content.document).parent().children("img").css({border: 'dotted 0px red'});
        }
    }
    catch(e) {
          alert(e);
    }
}

/**
* The insertMetadata function will put the all the extracted RDF data into 
* a database
*/
function insertMetadata(data){

	//some variables
	//assuming db file is in user's profile directory:

	//Insert data into the database
	var myInsertQuery = 'INSERT INTO metadata_tbl(about, title, description, creator, tags, lat, '+
		'long, attributionURL, attributionName) VALUES('+
		'"'+data[0]+'",'+
		'"'+data[1]+'",'+
		'"'+data[2]+'",'+
		'"'+data[3]+'",'+
		'"'+data[4]+'",'+
		'"'+data[5]+'",'+
		'"'+data[6]+'",'+
		'"'+data[7]+'",'+
		'"'+data[8]+'");';
	$sqlite.cmd(myDBFile,myInsertQuery);
}

/**
* queryMetadata is used in the paste action, where the database is queried for a given 
* key (which is mapped to an actual field), and a value (which is mapped to an identifying value)
*/
function queryMetadata(key, value){

	var mySelectQuery = 'SELECT * FROM metadata_tbl WHERE ' +key+' = '+value;
	var resultSet = $sqlite.select(myDBFile,mySelectQuery);
	// Now you can loop through the result set yoi get from executing the query:
	for(var j=0;j<resultSet.length;j++){
		// change this as you wish:
		//alert(resultSet[j]['about'] + " and " + resultSet[j]['title']);
	}
}

var myDBFile = 'semclip.sqlite';

// Create the Database
var myCreateDBQuery = 'CREATE TABLE IF NOT EXISTS metadata_tbl ('+
	' id INTEGER PRIMARY KEY AUTOINCREMENT,'+
	' about VARCHAR(15), '+
	' title VARCHAR(15), '+
	' description VARCHAR(50), '+
	' creator VARCHAR(15), '+
	' tags VARCHAR(15), '+
	' lat VARCHAR(15), '+
	' long VARCHAR(15), '+
	' attributionURL VARCHAR(30), '+
	' attributionName VARCHAR(15));';

$sqlite.cmd(myDBFile,myCreateDBQuery);

// This data should correspond to the real data obtained from the the RDFa embedded in the page
data = ["data 0", "data 1", "data 2", "data 3", "data 4", "data 5", "data 6", "data 7", "data 8", "data 9"];

insertMetadata(data);
queryMetadata('about', '"data 0"');
