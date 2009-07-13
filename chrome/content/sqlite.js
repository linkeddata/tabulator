/**
*  
* "$sqlite" can be used to instantiate any database which can ve used globally within Firefox
*
* For more information on the Mozilla <-> SQLite, MozIStorageConnection API refer to:
* https://developer.mozilla.org/en/Storage and
* http://codesnippets.joyent.com/posts/show/1030
*
* Oshani Seneviratne (oshani@mit.edu)
*
*/

var $sqlite = {
	storageService: [],
	mDBConn: [],
	
	_initService : function(file){
		var db = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		db.append(file);
		this.storageService[file] = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
		this.mDBConn[file] = (this.storageService[file]).openDatabase(db);
			
	},
	
	select : function(file,sql,param){
		if (this.storageService[file]== undefined){
                    this._initService(file);
		}
		var ourTransaction = false;
		if ((this.mDBConn[file]).transactionInProgress){
			ourTransaction = true;
			(this.mDBConn[file]).beginTransactionAs((this.mDBConn[file]).TRANSACTION_DEFERRED);
		}
		var statement = (this.mDBConn[file]).createStatement(sql);
                if (param){
			for (var m=2, arg=null; arg=arguments[m]; m++) {
				statement.bindUTF8StringParameter(m-2, arg);
			}
		}
		try{
			var dataset = [];
			while (statement.executeStep()){
				var row = [];
				for(var i=0,k=statement.columnCount; i<k; i++){
					row[statement.getColumnName(i)] = statement.getUTF8String(i);
				}
				dataset.push(row);
			}
			// return dataset;	
		}
		finally {
			statement.reset();
		}
		if (ourTransaction){
			(this.mDBConn[file]).commitTransaction();
		}
        return dataset;	
	},
	
	
	cmd : function(file,sql,param){
		if (this.storageService[file] == undefined){
	                    this._initService(file);
		}
		var ourTransaction = false;
		if ((this.mDBConn[file]).transactionInProgress){
			ourTransaction = true;
			(this.mDBConn[file]).beginTransactionAs((this.mDBConn[file]).TRANSACTION_DEFERRED);
		}
		var statement = (this.mDBConn[file]).createStatement(sql);
		if (param){
			for (var m=2, arg=null; arg=arguments[m]; m++) {
				statement.bindUTF8StringParameter(m-2, arg);
			}
		}
		try{
			statement.execute();
		}
		finally {
			statement.reset();
		}
		if (ourTransaction){
			(this.mDBConn[file]).commitTransaction();
		}
	}	

}

//End of useful code

//******************************************************************

/**
//@@ The following code sample illustrates how the the above sqlite object can be used

//some variables
//assuming db file is in user's profile directory:
var myDBFile = 'semclip.sqlite';

// Create the Database
var myCreateDBQuery = 'CREATE TABLE IF NOT EXISTS metadata_tbl (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(15));';

//Insert data into the database
var myInsertQuery = 'INSERT INTO metadata_tbl(title) VALUES("book title1");';
var myInsertQueryParameterized = 'INSERT INTO metadata_tbl(title) VALUES(?1);';

var mySelectQuery = 'SELECT id,title FROM metadata_tbl';
var mySelectQueryParameterized = 'SELECT id,title FROM metadata_tbl WHERE id = ?1 AND title = ?2';

// For anything other than SELECT statement, use $sqlite.cmd() :
 
// creating a DB:
function test_createDB(){
	$sqlite.cmd(myDBFile,myCreateDBQuery);
}	

// simple add record:
function test_addRecord(){
	$sqlite.cmd(myDBFile,myInsertQuery);
}

// parameterized add record, add parameters as much as you want:	
function test_addRecordParameterized(){
	// for example, adding 3 records:
	for(var i = 1 ; i < 4; i++){
		$sqlite.cmd(myDBFile,myInsertQueryParameterized,'book title'+i+'');
	}
}

// for SELECT, use $sqlite.select() :

// simple select:
function test_Select(){
	var myArray1 = $sqlite.select(myDBFile,mySelectQuery);
	// Now you can loop through the array:
	for(var j=0;j<myArray1.length;j++){
		// change this as you wish:
		alert(myArray1[j]['title']);
	}
}

// select with bound parameters, add parameters as much as you want:
function test_SelectParameterized(){
	var myArray1 = $sqlite.select(myDBFile,mySelectQueryParameterized,'1','book title1');
	// Now you can loop through the array:
	for(var j=0;j<myArray1.length;j++){
		// change this as you wish:
		alert(myArray1[j]['title']);
	}
}
*/