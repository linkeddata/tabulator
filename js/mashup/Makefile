
#J=/devel/dig-hg/tabulator/content/js
J=..

all : mashlib.js mash.css

mashlib.js : $J/rdf/dist/rdflib.js ../init/init-mashup.js
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js

# At the moment the CSS file we just copy but source locally
mash.css : ../../tabbedtab.css
	cp ../../tabbedtab.css mash.css

update :
	(cd $J/rdf; rm dist/rdflib.js ; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib.js


gh-pages: update
	git add mashlib.js
	git commit -m "see Makefile"
	git push origin gh-pages


alpha :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib-alpha.js

mashlib-alpha.js :
	(cd $J/rdf; make dist/rdflib.js)
	(cd $J/init; node expand.js js/init/init-mashup.js ) > mashlib-alpha.js


$J/rdf/dist/rdflib.js :
	(cd $J/rdf; make dist/rdflib.js)

clean:
	rm -f mashlib.js mash.css
