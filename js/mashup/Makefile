
#J=/devel/dig-hg/tabulator/content/js
J=..


A=/devel/dvcs.w3.org/read-write-web

all : mashlib.js mash.css

mashlib.js : $J/rdf/dist/rdflib.js ../init/init-mashup.js
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js

# At the moment the CSS file we just copy but source locally
mash.css : ../../tabbedtab.css
	cp ../../tabbedtab.css mash.css

update :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js
#	cp mashlib.js $A/src/main/resources/public/mashlib.js 
#	cp mashlib.js /devel/dvcs.w3.org/read-write-web/target/scala-2.9.1/classes/public/mashlib.js
#	(cd /devel/dvcs.w3.org/read-write-web; hg commit -m "New mashlib.js -- see http://dig.csail.mit.edu/hg/tabulator/raw-file/tip/content/js/mashup/Makefile")


gh-pages: mashlib.js 
	git add mashlib.js 
	git commit -m "see Makefile"
	git push origin gh-pages


alpha :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib-alpha.js
	cp mashlib-alpha.js ~/Documents/Automation/Library/Mashup/mashlib-alpha.js
	cp ../../tabbedtab.css ~/Documents/Automation/Library/Mashup/tabbedtab.css
	hg commit -m "Test mashup - see mashup makefile"  ~/Documents/Automation/Library/Mashup
	(cd ~/Documents/Automation/Library/Mashup/; hg push)

dist :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js
	cp mashlib.js ~/Documents/Automation/Library/Mashup/mashlib.js
	cp ../../tabbedtab.css ~/Documents/Automation/Library/Mashup/tabbedtab.css
	hg commit -m "Distribute mashup - see content/js/mashup/Makefile"  ~/Documents/Automation/Library/Mashup
	(cd ~/Documents/Automation/Library/Mashup/; hg push)

distribute12 : mashlib.js
	cp mashlib.js ~/Documents/2014/Financial/Data/skin-related/mashlib.js
	hg commit -m distribute12 ~/Documents/2014/Financial/Data/skin-related/mashlib.js
	(cd ~/Documents/2014/Financial/Data/skin-related/; hg push)

$J/rdf/dist/rdflib.js :
	(cd $J/rdf; make dist/rdflib.js)

clean:
	rm -f mashlib.js mash.css
