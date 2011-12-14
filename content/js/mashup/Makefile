
#J=/devel/dig-hg/tabulator/content/js
J=..


A=/devel/dvcs.w3.org/read-write-web

all : mashlib.js mash.css

mashlib.js : $J/rdf/dist/rdflib.js
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js

# At the moment the CSS file we just copy but source locally
mash.css : ../../tabbedtab.css
	cp ../../tabbedtab.css mash.css

update :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js
	cp mashlib.js $A/src/main/resources/public/mashlib.js 
	cp mashlib.js /devel/dvcs.w3.org/read-write-web/target/scala-*/classes/public/mashlib.js
	(cd /devel/dvcs.w3.org/read-write-web; hg commit -m "New mashlib.js -- see http://dig.csail.mit.edu/hg/tabulator/raw-file/tip/content/js/mashup/Makefile")
	

$J/rdf/dist/rdflib.js :
	(cd $J/rdf; make dist/rdflib.js)



