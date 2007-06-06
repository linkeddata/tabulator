# Test data for smushing

#W=../../../..
S=$(SWAP)
C=python $S/cwm.py

.SUFFIXES:	.rdf .n3

.n3.rdf:
	$C $< --rdf > $@

#ifp.rdf: ifp.n3
#	$C ifp.n3 --rdf > ifp.rdf

,all: ifp.rdf ifp-meta.rdf  manifest.rdf test-labels.rdf
	touch ,all

ifp.rdf: ifp.n3
	$C ifp.n3 --rdf > ifp.rdf
ifp-meta.rdf: ifp-meta.n3
	$C ifp-meta.n3 --rdf > ifp-meta.rdf

test-labels.rdf : test-labels.n3
	$Cx keys.nn3 test-labels.n3 --rdf=z > test-labels.rdf
