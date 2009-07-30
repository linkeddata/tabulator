pushback = function(e){
    
    var message = window.content.document.getElementById('message').value;
    var jsoningraph = undefined; //@@ Does not make any difference anyways
    var jsonoutgraph = '{"type": "literal", "value": "'+message+'"}';
    var debug = false;
        
    $jq.post("http://ld2sd.deri.org/pushback/pbcontroler/demo2.php", 
			{	
				ing:  jsoningraph,
				outg: jsonoutgraph,
				debug: debug
			} , 
			function(data){
                if (data){ //Update Successful
                    window.content.document.getElementById('message').value = "";
                    var result = window.content.document.getElementById('result');
                    result.setAttribute("style","margin: 1px 20px 5px 20px; text-align:center; background-color:gray");
                    result.addEventListener("click", 
                        function(){
                            this.innerHTML = "";
                            this.setAttribute("style","display:none");
                        }, false);
                    result.innerHTML = "Update Successful! <br/> The update you just did will be available at <a href='http://twitter.com/pushback_demo'>http://twitter.com/pushback_demo</a>";
                }
            }
	);
}
