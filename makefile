MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
TAG?=latest
DATE := $(shell date +%s)

.PHONY: build

build:
	# clone lantern-server if not already here on system
	test -s ./share/lantern/server || git clone --single-branch --branch master https://github.com/lantern-works/lantern-serve  ./share/lantern/server
	# generate platform package javascript for the server using above repository
	cd ./share/lantern/server && make pack
	# clone latest apps for the lantern-serve (you can customize this if you want to run your own)
	test -s ./share/lantern/server/apps || git clone --single-branch --branch master https://github.com/lantern-works/lantern-apps  ./share/lantern/server/apps
	# build the docker image
	docker build --build-arg CACHEBUST="${DATE}" -t "lantern-box:${TAG}" ./share

run:
	# run the docker image
	docker run -it  \
		--volume ${PWD}/share/lantern/server:/lantern/server \
		-e SSL_CERTIFICATE="/lantern/server/certs/cert.pem" \
		-e SSL_PRIVATE_KEY="/lantern/server/certs/privkey.pem" \
		-p 80:80 \
		-p 443:443 \
		-p 8765:8765 \
		-m 512M \
		"lantern-box:${TAG}"

image:
	docker run -it --privileged \
	--volume ${PWD}/share:/tmp \
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
