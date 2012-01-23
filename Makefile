all: update
	for x in js/*/Makefile; do \
		make -C `dirname $$x` all; \
	done

.PHONY: all update

update:
	git submodule update --init

gh-pages: all
	git branch -D gh-pages ||:
	git checkout -b gh-pages
	git add -f js/rdf
	git add -f js/mashup/*.js
	git commit -m 'gh-pages: latest build'
	git push -f origin gh-pages
	git checkout master
