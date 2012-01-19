<<<<<<< HEAD
all:
	for x in content/js/*/Makefile; do \
		make -C `dirname $$x` all; \
	done
=======
all: update
	for x in js/*/Makefile; do \
		make -C `dirname $$x` all; \
	done

update:
	git submodule update --init
>>>>>>> 56c1f710a4276f26ab8bf05cfe8c9e7cae9f92b0
