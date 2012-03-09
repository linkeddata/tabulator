all: update_submodules
	make -C js/rdf all
	make -C js/mashup all

update: pull

update_submodules:
	@@if [ -d .git ]; then \
		if git submodule status | grep -q -E '^-'; then \
			git submodule update --init --recursive; \
		else \
			git submodule update --init --recursive --merge; \
		fi; \
	fi;

pull_submodules:
	@@git submodule foreach "git pull \$$(git config remote.origin.url)"
	@@git submodule summary

pull: pull_submodules
	@@git pull ${REMOTE} ${BRANCH}

gh-pages: all
	git branch -D gh-pages ||:
	git checkout -b gh-pages
	git add -f js/rdf
	git add -f js/mashup/*.js
	git commit -m 'gh-pages: latest build'
	git push -f origin gh-pages
	git checkout master

clean:
	make -C js/mashup clean

status:
	@pwd
	@git branch -v
	@git status -s
	@make -sC js/rdf status

writable:
	@sed -i -re 's/git:\/\/github.com\//git@github.com:/' .git/config
	@make -sC js/rdf writable

.PHONY: all clean update update_submodules pull_submodules pull
