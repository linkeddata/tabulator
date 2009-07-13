var store_location = "http://dig.csail.mit.edu/2008/webdav/policy.n3"; //the default value

function store()
{
	store_location = document.getElementById("store_location").value;
	webdav.manager.register(store_location, function(store_location, success){});
	webdav.manager.save_file(store_location, request1.responseText, fetch);
}

function fetch()
{
	content.window.location.replace(store_location,true);
//	alert("The generated policy was successfully saved at "+store_location);
}

function view()
{
	store();
}

function success()
{
        //TODO: Do something on the callback?
}
