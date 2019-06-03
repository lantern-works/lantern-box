MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
TAG?=latest
DATE := $(shell date +%s)

.PHONY: build

clone: 
	# clone lantern-server if not already here on system
	test -s ./lantern/server || git clone --single-branch --branch master https://github.com/lantern-works/lantern-serve  ./lantern/server
	# generate platform package javascript for the server using above repository
	cd ./lantern/server && make pack
	# clone latest apps for the lantern-serve (you can customize this if you want to run your own)
	test -s ./lantern/server/apps || git clone --single-branch --branch master https://github.com/lantern-works/lantern-apps  ./lantern/server/apps

build: clone
	# build the docker image
	docker build --build-arg CACHEBUST="${DATE}" -t "lantern-box:${TAG}" .

docker: build
	# run the docker image
	docker run -it  \
		--volume ${PWD}/lantern/server:/lantern/server \
		-e SSL_CERTIFICATE="/lantern/server/web/certs/cert.pem" \
		-e SSL_PRIVATE_KEY="/lantern/server/web/certs/privkey.pem" \
        -e SSL_CA="/lantern/server/web/certs/SectigoRSADomainValidationSecureServerCA.crt,/lantern/server/web/certs/AddTrustExternalCARoot.crt,/lantern/server/web/certs/USERTrustRSAAddTrustCA.crt" \
		-p 80:80 \
		-p 443:443 \
		-m 512M \
		"lantern-box:${TAG}"

rpi: clone
	docker run -it --privileged \
	--volume ${PWD}:/tmp \
	-e IMAGE_NAME="flash-to-pi.img" \
	-e IMAGE_SIZE="3G" \
	-e COPY_DIR="/tmp/lantern" \
	-e SCRIPT_DIR="/tmp/init" \
	-e SETUP_SCRIPT="/tmp/Pifile" \
	westlane/pi-maker

clean:
	docker system prune -af


flash: 
	etcher ./build/flash-to-pi.img
