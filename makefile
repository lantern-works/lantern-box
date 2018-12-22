MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash

TAG?=latest
DATE := $(shell date +%s)
CONTAINERS := $(shell docker ps -a -q)


.PHONY: build

build:
	docker build --build-arg CACHEBUST="${DATE}" -t "lantern-box:${TAG}" ./share

run:
	docker run -it  \
		-p 80 \
		-p 443 \
		-p 8765 \
		-m 512M \
		"lantern-box:${TAG}"

image:
	docker pull westlane/pi-maker
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
