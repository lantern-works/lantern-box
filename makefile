MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

TAG?=latest
DATE := $(shell date +%s)
CONTAINERS := $(shell docker ps -a -q)


.PHONY: build

build:
	docker build --build-arg CACHEBUST="${DATE}" -t "lantern-box:${TAG}" ./src

run:
	docker run -it  \
		--volume ${PWD}/src/app/node_modules:/opt/lantern/node_modules \
		-p 8080:80 \
		-p 8443:443 \
		"lantern-box:${TAG}"

image:
	docker pull westlane/pi-maker
	docker run -it --privileged \
	--volume ${PWD}:/tmp \
	-e IMAGE_NAME="flash-to-pi.img" \
	-e IMAGE_SIZE="3G" \
	-e COPY_DIR="/tmp/src/app" \
	-e SCRIPT_DIR="/tmp/src/system" \
	-e SETUP_SCRIPT="/tmp/pi-setup" \
	westlane/pi-maker

clean:
	docker system prune -af