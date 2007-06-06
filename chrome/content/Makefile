# Makefile for AJAR code

VERSION=0.8

TIME=`date -u +%Y-%m-%dT%H-%MZ`
RELNAME=tabulator-$(VERSION)-$(TIME)
JSDOC=~/tabulator/jsdoc.pl
APIDIR=doc/api

S=/usr/bin
C=python $S/cwm.py

# A=/home/dsheets/tabulator/ajar/release
A=$(HOME)/tabulator/ajar/release

JSDOCCABLE=js/rdf/rdfparser.js doc/SampleView.js js/mapView.js

RDF=js/rdf/term.js js/rdf/match.js js/rdf/identity.js \
		js/rdf/remote.js \
		js/rdf/rdfparser.js js/rdf/query.js js/rdf/sources.js js/rdf/sparql.js

CAL=js/calView/assets/bigCal.css \
		js/calView/assets/calendar.css js/calView/assets/callt.gif \
		js/calView/assets/calrt.gif js/calView/assets/calx.gif \
		js/calView/calendar.js \
		js/calView/calView.js js/calView/dom.js js/calView/event.js \
		js/calView/loadEvents.js js/calView/bigCal.js \
		js/calView/yahoo.js

HERE= tab.html About.html Help.html ToDo.html js/tabulate.js js/sorttable.js \
		js/calView.js js/log.js js/mapView.js dynamic.css general.css \
		ont.rdf js/sparqlView.js tabbedtab.css js/tabviews.js js/tableView.js \
		js/util.js js/tablib.js js/uri.js README Nav.js query.rdf \
                whatsnew.html js/addView.js

ICONS= \
	icons/16dot-blue.gif icons/16dot-green.gif icons/16dot-red.gif \
	icons/16dot-yellow.gif icons/document.png \
	icons/tbl-expand-trans.png icons/tbl-collapse.png \
	icons/refresh.gif icons/retract.gif icons/compassrose.png \
        icons/optional_off.PNG icons/optional_on.PNG \
        icons/tbl-X-big.png icons/tbl-x-small.png icons/tbl-x-trans.png \
        icons/Wclocksmall.png icons/markers/0.png icons/markers/1.png \
        icons/markers/2.png icons/markers/3.png icons/markers/4.png \
        icons/markers/5.png icons/markers/6.png icons/markers/7.png \
        icons/markers/8.png icons/markers/9.png 

TIMELINE= \
        js/calView/timeline/api/styles/ethers.css js/calView/timeline/api/styles/events.css \
        js/calView/timeline/api/styles/timeline.css js/calView/timeline/api/images/dull-green-circle.png \
        js/calView/timeline/api/images/bubble-bottom.png js/calView/timeline/api/images/bubble-right-arrow.png \
        js/calView/timeline/api/images/green-circle.png js/calView/timeline/api/images/gray-circle.png \
        js/calView/timeline/api/images/dark-blue-circle.png js/calView/timeline/api/images/bubble-top-right.png \
        js/calView/timeline/api/images/bubble-right.png js/calView/timeline/api/images/dull-red-circle.png \
        js/calView/timeline/api/images/copyright.png js/calView/timeline/api/images/bubble-bottom-right.png \
        js/calView/timeline/api/images/red-circle.png js/calView/timeline/api/images/bubble-left-arrow.png \
        js/calView/timeline/api/images/close-button.png js/calView/timeline/api/images/dark-green-circle.png \
        js/calView/timeline/api/images/copyright-vertical.png js/calView/timeline/api/images/bubble-top-left.png \
        js/calView/timeline/api/images/bubble-top-arrow.png js/calView/timeline/api/images/bubble-left.png \
        js/calView/timeline/api/images/dull-blue-circle.png js/calView/timeline/api/images/bubble-bottom-left.png \
        js/calView/timeline/api/images/bubble-bottom-arrow.png js/calView/timeline/api/images/blue-circle.png \
        js/calView/timeline/api/images/dark-red-circle.png js/calView/timeline/api/images/bubble-top.png \
        js/calView/timeline/api/images/top-bubble.png js/calView/timeline/api/scripts/ext/japanese-eras.js \
        js/calView/timeline/api/scripts/l10n/zh/labellers.js js/calView/timeline/api/scripts/l10n/en/labellers.js \
        js/calView/timeline/api/scripts/l10n/ru/labellers.js js/calView/timeline/api/scripts/l10n/es/labellers.js \
        js/calView/timeline/api/scripts/l10n/fr/labellers.js js/calView/timeline/api/scripts/l10n/se/labellers.js \
        js/calView/timeline/api/scripts/l10n/it/labellers.js js/calView/timeline/api/scripts/l10n/vi/labellers.js \
        js/calView/timeline/api/scripts/util/platform.js js/calView/timeline/api/scripts/util/debug.js \
        js/calView/timeline/api/scripts/util/date-time.js js/calView/timeline/api/scripts/util/data-structure.js \
        js/calView/timeline/api/scripts/util/dom.js js/calView/timeline/api/scripts/util/graphics.js \
        js/calView/timeline/api/scripts/util/xmlhttp.js js/calView/timeline/api/scripts/ether-painters.js \
        js/calView/timeline/api/scripts/decorators.js js/calView/timeline/api/scripts/labellers.js \
        js/calView/timeline/api/scripts/painters.js js/calView/timeline/api/scripts/themes.js \
        js/calView/timeline/api/scripts/timeline.js js/calView/timeline/api/scripts/ethers.js \
        js/calView/timeline/api/scripts/layouts.js js/calView/timeline/api/scripts/units.js \
        js/calView/timeline/api/scripts/sources.js js/calView/timeline/api/loadQueryEvents.js \
        js/calView/timeline/api/timeline-api.js js/calView/timeline/api/timelineView.js


FILES=$(HERE) $(RDF) $(CAL) $(ICONS) $(TIMELINE)

doc: $(JSDOCCABLE)
	rm -rf $(APIDIR)/*
	perl $(JSDOC) $(JSDOCCABLE)
	mv js_docs_out/* $(APIDIR)
	rmdir js_docs_out

minor: $(FILES)
	svn copy . $A/tabulator/$(VERSION)

release: minor
	make release2

# To be run in 2005/ajar
release2:
	mkdir /tmp/$(RELNAME)
	cp --parents $(FILES) /tmp/$(RELNAME)
	(cd /tmp; tar cvfz $(RELNAME).tgz $(RELNAME); rm -rf $(RELNAME))
	mv /tmp/$(RELNAME).tgz $A/
	svn add $A/$(RELNAME).tgz
	echo now make new files public access and commit

data.rdf: data.n3
	$C data.n3 --rdf > data.rdf

#ends
