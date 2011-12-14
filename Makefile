all:
	for x in content/js/*/Makefile; do \
		make -C `dirname $$x` all; \
	done
