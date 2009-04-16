/**
*  
* Semantic Clipboard
* Copy metadata along with the content for easy reuse
* 
* Oshani Seneviratne (oshani@mit.edu)
*
*/


$jq = jQuery.noConflict();

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
