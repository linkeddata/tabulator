all: update
	for x in js/*/Makefile; do \
		make -C `dirname $$x` all; \
	done

.PHONY: all update

update:
	git submodule update --init
