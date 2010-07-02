function runAllTests(){
	setStatus("Running all tests ...");
	// glean all @resources and perform runTest()
	setStatus("Done.");	
}

function runTest(testTargetURI, testOut){
	setStatus("Running test with " + testTargetURI);
	
	$.getScript(testTargetURI, function() {
		setStatus("Loaded " + testTargetURI);
		overallResult = test(false);
		if(overallResult) testOut.html("<span style='border: solid 2px green;'>PASSED</span>");
		else testOut.html("<span style='border: solid 2px red; padding: 1px;'>FAILED</span>");
		cleanUp();
	});
}

function setStatus(msg) {
	$("#status").html(msg);
}