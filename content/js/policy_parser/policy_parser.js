//////////////////////////////
// UI Specific Functions

function viewOnt()
{
	ont = document.getElementById("domain").value;
	content.window.location.replace(ont,true); 
}

function predefined()
{
	if (document.getElementById("sentence_pref").value == "0")
	{
		document.getElementById("sentence_text").disabled = true;
		document.getElementById("sentence_menu").disabled = false;
		new_sentence_flag = false;
	}
	if (document.getElementById("sentence_pref").value == "1")
	{
		document.getElementById("sentence_text").disabled = false;
		document.getElementById("sentence_menu").disabled = true;
		new_sentence_flag = true;
	}
}

function createProgressBar(){
	const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
	var item = document.createElementNS(XUL_NS, "progressmeter"); 
	item.setAttribute("id", "pm");
	item.setAttribute("mode", "undetermined");
	item.setAttribute("value", "0");
    return item;  
}

function removeProgressBar()
{
	var element = document.getElementById("progressBox");
    while(element.hasChildNodes())
	{
		element.removeChild(element.firstChild);
    }

}

/*function moveProgressBar()
{
	var mpm = document.getElementById("pm");
	var inp = document.getElementById("inp");
	var desc = document.getElementById("desc");
	
	function setProgress()
	{
		var x = parseInt(inp.value) ;
		if(x > 70) x = 70;
		mpm.value = x;
		desc.value = x + "%";
	}
}
*/
/////////////////////////////


/////////////////////////////
// Request stuff

var request1= Util.XMLHTTPFactory();


function sendRequest(request, url) 
{
	try 
	{
		//Progress Bar magic :)
		var progressBox = document.getElementById("progressBox"); 
        var progressBar = createProgressBar(); 
        progressBox.appendChild(progressBar);
		//moveProgressBar();
		
		request.open("GET", url, true);
		request.onreadystatechange = update;
		request.send(null);
	} 
	catch(e) 
	{
		alert(e)
	}
}

function run() 
{
	var name = document.getElementById("name").value;
	var sentence = null
	
	if (document.getElementById("sentence_pref").value == "0"
		|| document.getElementById("sentence_pref").value == ""
		|| document.getElementById("sentence_pref").value == null)
	{
		sentence =document.getElementById("sentence_menu").value; 
	}
	else
	{
		sentence =document.getElementById("sentence_text").value; 
	}
	
	var domain = document.getElementById("domain").value;
  
	if (name != "")
	{
		var url = "http://scripts.mit.edu/~oshani/justparseit/code/server/run.py?name=" + escape(name) +"&sentence=" + escape(sentence) +"&domain=" + escape(domain);
		sendRequest(request1, url);
		content.window.location.replace(url,true);
	}
	else
	{
		alert("Please give a name for the policy!");
	}

}

function update() 
{
  if (request1.readyState == 4) {
    if (request1.status == 200) {
		var response = request1.responseText;
		//wait for a while!!
		window.setTimeout(removeProgressBar,4000);
    } 
	else
	{
	  removeProgressBar();
      alert("Error! Cannot parse sentence because some of the words are not found in the lexicon.");
	  content.window.location.replace("about:blank",true);
	}
  } 
}
