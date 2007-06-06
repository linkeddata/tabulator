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

JSDOCCABLE=rdf/rdfparser.js doc/SampleView.js mapView.js

RDF=rdf/term.js rdf/match.js rdf/identity.js \
		rdf/remote.js \
		rdf/rdfparser.js rdf/query.js rdf/sources.js rdf/sparql.js

CAL=calView/assets/bigCal.css \
		calView/assets/calendar.css calView/assets/callt.gif \
		calView/assets/calrt.gif calView/assets/calx.gif \
		calView/calendar.js \
		calView/calView.js calView/dom.js calView/event.js \
		calView/loadEvents.js calView/bigCal.js \
		calView/yahoo.js calView/bigCal.js.Legend

HERE= tab.html About.html Help.html ToDo.html tabulate.js sorttable.js \
		calView.js log.js mapView.js dynamic.css general.css \
		ont.rdf sparqlView.js tabbedtab.css tabviews.js tableView.js \
		util.js tablib.js uri.js README Nav.js query.rdf \
                whatsnew.html addView.js

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
        calView/timeline/api/styles/ethers.css calView/timeline/api/styles/events.css \
        calView/timeline/api/styles/timeline.css calView/timeline/api/images/dull-green-circle.png \
        calView/timeline/api/images/bubble-bottom.png calView/timeline/api/images/bubble-right-arrow.png \
        calView/timeline/api/images/green-circle.png calView/timeline/api/images/gray-circle.png \
        calView/timeline/api/images/dark-blue-circle.png calView/timeline/api/images/bubble-top-right.png \
        calView/timeline/api/images/bubble-right.png calView/timeline/api/images/dull-red-circle.png \
        calView/timeline/api/images/copyright.png calView/timeline/api/images/bubble-bottom-right.png \
        calView/timeline/api/images/red-circle.png calView/timeline/api/images/bubble-left-arrow.png \
        calView/timeline/api/images/close-button.png calView/timeline/api/images/dark-green-circle.png \
        calView/timeline/api/images/copyright-vertical.png calView/timeline/api/images/bubble-top-left.png \
        calView/timeline/api/images/bubble-top-arrow.png calView/timeline/api/images/bubble-left.png \
        calView/timeline/api/images/dull-blue-circle.png calView/timeline/api/images/bubble-bottom-left.png \
        calView/timeline/api/images/bubble-bottom-arrow.png calView/timeline/api/images/blue-circle.png \
        calView/timeline/api/images/dark-red-circle.png calView/timeline/api/images/bubble-top.png \
        calView/timeline/api/images/top-bubble.png calView/timeline/api/scripts/ext/japanese-eras.js \
        calView/timeline/api/scripts/l10n/zh/labellers.js calView/timeline/api/scripts/l10n/en/labellers.js \
        calView/timeline/api/scripts/l10n/ru/labellers.js calView/timeline/api/scripts/l10n/es/labellers.js \
        calView/timeline/api/scripts/l10n/fr/labellers.js calView/timeline/api/scripts/l10n/se/labellers.js \
        calView/timeline/api/scripts/l10n/it/labellers.js calView/timeline/api/scripts/l10n/vi/labellers.js \
        calView/timeline/api/scripts/util/platform.js calView/timeline/api/scripts/util/debug.js \
        calView/timeline/api/scripts/util/date-time.js calView/timeline/api/scripts/util/data-structure.js \
        calView/timeline/api/scripts/util/dom.js calView/timeline/api/scripts/util/graphics.js \
        calView/timeline/api/scripts/util/xmlhttp.js calView/timeline/api/scripts/ether-painters.js \
        calView/timeline/api/scripts/decorators.js calView/timeline/api/scripts/labellers.js \
        calView/timeline/api/scripts/painters.js calView/timeline/api/scripts/themes.js \
        calView/timeline/api/scripts/timeline.js calView/timeline/api/scripts/ethers.js \
        calView/timeline/api/scripts/layouts.js calView/timeline/api/scripts/units.js \
        calView/timeline/api/scripts/sources.js calView/timeline/api/loadQueryEvents.js \
        calView/timeline/api/timeline-api.js calView/timeline/api/timelineView.js


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
