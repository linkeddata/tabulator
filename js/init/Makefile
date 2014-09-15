


#  Actually depends on many other .js files
mashlib.js : expand.js init-mashup.js ../rdf/dist/rdflib.js
	node expand.js js/init/init-mashup.js > mashlib.js



update :
	rm mashlib.js
	make mashlib.js
	echo "Now remind timbl run make update in /devel/WWW/2011/datastuff/init to spread the mashlib"
