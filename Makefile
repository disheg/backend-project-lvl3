install:
	npm install
lint:
	npx eslint .
publish:
	npm publish --dry-run
make test:
	npx -n --experimental-vm-modules jest