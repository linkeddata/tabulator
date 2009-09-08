/**
*  
* Semantic Clipboard
* Copy metadata along with the content for easy reuse
* 
* Oshani Seneviratne (oshani@mit.edu)
*
*/

//Give precedence to internally defined $ variable, if one is available 
$jq = jQuery.noConflict();

//Some mozilla specific global vars
var Transferable = Components.Constructor("@mozilla.org/widget/transferable;1", Components.interfaces.nsITransferable);
var SupportsArray = Components.Constructor("@mozilla.org/supports-array;1", Components.interfaces.nsISupportsArray);
var SupportsCString = (("nsISupportsCString" in Components.interfaces)
                       ? Components.Constructor("@mozilla.org/supports-cstring;1", Components.interfaces.nsISupportsCString)
                       : Components.Constructor("@mozilla.org/supports-string;1", Components.interfaces.nsISupportsString)
                      );
var SupportsString = (("nsISupportsWString" in Components.interfaces)
                      ? Components.Constructor("@mozilla.org/supports-wstring;1", Components.interfaces.nsISupportsWString)
                      : Components.Constructor("@mozilla.org/supports-string;1", Components.interfaces.nsISupportsString)
                     );

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
                     
/**When the user hovers over an image show whether it can be copied by displaying a tool tip*/
function findImagesThatCanBeCopied(){
    //First find all the images in the document
    var imgs = $jq("img",window.content.document);
    //Then for each of the images found, find if the parent node has any <a> children nodes
    for (var i=0; i<imgs.length; i++){
        var licenseLinks = $jq("img[src='"+imgs[i].src+"']",window.content.document).parent().children("a");
        for (var j=0; j<licenseLinks.length; j++){
            var currentNode = licenseLinks[j];
            if (currentNode.getAttribute('rel') == "license"){
                //Set the tool tip texto to specify that this image can be copied with metadata
                $jq("img[src='"+imgs[i].src+"']",window.content.document).attr("title","This image can be copied");
            } 
            else{
                //Warn saying that this image cannot be copied
                $jq("img[src='"+imgs[i].src+"']",window.content.document).attr("title","Sorry! This image cannot be copied");
            }   
        }
    }
}

/**Show images that can be used for the specific purpose*/
function showAcceptedUseOfImage(uses, txt){
  $jq.each($jq("img",window.content.document), 
	   function(){
	     var licenseEls = $jq(this,window.content.document).parent().children('a');
         //var foundUse=false;
	     for (var i=0; i<licenseEls.length; i++){
	       var licenseEl = licenseEls[i];
	       if (licenseEl.getAttribute('rel') == "license"){
            //Check if the image in question is under a license which allows the use specified by the parameter
            for (var j=0; j<uses.length; j++){
		if (licenseEl.toString() == uses[j]){

                    //Content under public domain or CC-Zero have a license like this:
                    //http://creativecommons.org/publicdomain/zero/1.0/
                    //Otherwise - The OR part
                    //The license will look like this:
                    //http://creativecommons.org/licenses/by-nd/3.0/
                    
                    //Create a <div> and append to the parent of this img tag
                    $jq($jq(this,window.content.document).parent(),window.content.document).css({'position':'relative','float':'left'});
                    $jq($jq(this,window.content.document).parent(),window.content.document).append('<div style=" position:absolute; top:30px; right:50px; padding: 5px; background: white; border: 2px solid green; -moz-border-radius: 0.75em; font-family: sans-serif;"><p>'+txt+'</p></div>');
                }
            }
	       }
	     }
	   });
}


/**
* Give visual cues to the user as to what images can be used for what purpose
*/
function toggleSemClip(event){
  var whichOption = event.target;
  //Different Use Restrictions
  var anyUse = ["http://creativecommons.org/publicdomain/zero/1.0/"];
  var commercialUse = [ "http://creativecommons.org/licenses/publicdomain/3.0/",
			"http://creativecommons.org/licenses/by-nd/3.0/", 
			"http://creativecommons.org/licenses/by-nd-sa/3.0/", 
			"http://creativecommons.org/licenses/by-sa/3.0/", 
			"http://creativecommons.org/licenses/by/3.0/"];
  var allowModifications = [ "http://creativecommons.org/publicdomain/zero/1.0/", 
			     "http://creativecommons.org/licenses/by-nc-sa/3.0/", 
			     "http://creativecommons.org/licenses/by-sa/3.0/", 
			     "http://creativecommons.org/licenses/by-n/3.0/v", 
			     "http://creativecommons.org/licenses/by/3.0/" ];
  var sameLicense = ["http://creativecommons.org/licenses/by-nc-nd-sa/3.0/", 
		     "http://creativecommons.org/licenses/by-nd-sa/3.0/", 
		     "http://creativecommons.org/licenses/by-nc-sa/3.0/", 
		     "http://creativecommons.org/licenses/by-sa/3.0/"];
  var nonCommercialUse = ["http://creativecommons.org/licenses/by-nc-nd/3.0/", 
			  "http://creativecommons.org/licenses/by-nc/3.0/", 
			  "http://creativecommons.org/licenses/by-nc-sa/3.0/",
			  "http://creativecommons.org/licenses/by-nc-nd-sa/3.0/"];
  
  if (whichOption.getAttribute('checked') == 'true'){
      switch(whichOption.id.toString()){
            case "any_use":
	        showAcceptedUseOfImage(anyUse, "No restrictions. Can be used for any purpose.");
                break;
            case "commercial_use":
                showAcceptedUseOfImage(commercialUse, "Can be used for<br/> Commercial Purposes");
                break;
            case "non_commercial_use":
                showAcceptedUseOfImage(nonCommercialUse, "Can be used for<br/> Non-Commercial Purposes Only");
                break;
            case "derivatives":
                showAcceptedUseOfImage(allowModifications, "Modifications allowed");
                break;
            case "share_alike":
                showAcceptedUseOfImage(sameLicense, "Use same license");
                break;
            case "no_use":
                showAcceptedUseOfImage(anyUse, "Cannot be reused");
                break;
            default:
        }
    }
 else if (whichOption.getAttribute('checked') == 'false'){
      switch(whichOption.id.toString()){
            case "any_use":
                break;
            case "commercial_use":
                break;
            case "non_commercial_use":
                break;
            case "derivatives":
                break;
            case "share_alike":
                break;
            case "no_use":
                break;
            default:
        }

 }
        
  /*var checked = semclipCheckbox.getAttribute('checked');
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
  */
}

/**
* Determine what the URI of the image is, construct the attribution XHTML
* and pass it off to the system Clipboard
*/
function copyImageWithLicense(){

    findImagesThatCanBeCopied();

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
    var attributionXHTML = '<div xmlns:cc="http://creativecommons.org/ns#" about="'+imageURI+'">By <a rel="cc:attributionURL" property="cc:attributionName" href="'+attributionURI+'" > '+attributionName+'</a> / <a rel="license" href="'+licenseURI+'">'+license+'</a></div>';
    
    // generate the Unicode and HTML versions
    var imageWithAttributionXHTML = '<div><img src="'+imageURI+'"/>'+attributionXHTML+'</div>';
    var unicodeRepresentation = imageURI+' by '+attributionName+ ' from '+ attributionURI +' is licensed under '+license+' ( '+licenseURI+' ).';
    
  copyToClipboard(imageWithAttributionXHTML, unicodeRepresentation);  
  //alert(pasteFromClipboard());
}

/**Get the Mozilla clipboard interface*/
function getClipboard()
{
    const kClipboardContractID = "@mozilla.org/widget/clipboard;1";
    const kClipboardIID = Components.interfaces.nsIClipboard;
    return Components.classes[kClipboardContractID].getService(kClipboardIID);
}

/**Check whether the data formats that have been copied to the clipboard and the target data formats are matching*/
function canPaste()
{
    const kClipboardIID = Components.interfaces.nsIClipboard;

    var clipboard = getClipboard();
    var flavourArray = new SupportsArray;
    var flavours = ["text/html", "text/unicode"];
   
    for (var i = 0; i < flavours.length; ++i){
        var kSuppString = new SupportsCString;
        kSuppString.data = flavours[i];
        flavourArray.AppendElement(kSuppString);
    }
   
    return clipboard.hasDataMatchingFlavors(flavourArray, kClipboardIID.kGlobalClipboard);
}

/**Copies the data to the clipboard 
* @@@ be warned about the data flavors - as a result this could be a bit flaky
*/
function copyToClipboard(html,unicode){

    // 1. get the clipboard service
    var clipboard = getClipboard();

    // 2. create the transferable
    var trans = new Transferable;

    if ( trans && clipboard) {
        // 3. register the data flavors
        trans.addDataFlavor("text/html");
        //trans.addDataFlavor("text/unicode");

        // 4. create the data objects
        var unicodeStr = new SupportsString;
        var htmlStr = new SupportsString;

        // get the data
        htmlStr.data = html;
        unicodeStr.data = html;

        // 5. add data objects to transferable
        trans.setTransferData("text/unicode", unicodeStr,
                              unicodeStr.data.length*2 ); // double byte data
        trans.setTransferData("text/html", htmlStr, 
                              unicodeStr.data.length*2 );

        clipboard.setData(trans, null,
                          Components.interfaces.nsIClipboard.kGlobalClipboard );

        return true;         
    }
    return true;
} 

/**Not really used - beacuse a specific editor application is not implemented
* nevertheless this code would be useful in the future
*/
function pasteFromClipboard(){
    
    if (!canPaste()) {
        dump("Attempting to paste with no useful data on the clipboard");
        return;
    }
    // 1. get the clipboard service
    var clipboard = getClipboard();

    // 2. create the transferable
    var trans = new Transferable;

    if (!trans || !clipboard) {
        dump("Failed to get either a transferable or a clipboard");
        return;
    }
    // 3. register the data flavors you want, highest fidelity first!
    //trans.addDataFlavor("text/html");
    trans.addDataFlavor("text/unicode");

    // 4. get transferable from clipboard
    clipboard.getData ( trans, Components.interfaces.nsIClipboard.kGlobalClipboard);

    // 5. ask transferable for the best flavor. Need to create new JS
    //    objects for the out params.
    var flavour = { };
    var data = { };

    var str       = new Object();  
    var strLength = new Object();  

    trans.getTransferData("text/unicode", str, strLength);
    var data = str.value.QueryInterface(Components.interfaces.nsISupportsString).data;
    dump(data);
    //var items = new Array();
    /*switch (flavour.value) {
        case "text/html":
        case "text/unicode":
            alert("unicode");
            break;
        default: 
            dump("Unknown clipboard type: " + flavour.value);
    }*/

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
