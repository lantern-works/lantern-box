MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail
.DEFAULT_GOAL := build

TAG?=latest
DATE := $(shell date +%s)
CONTAINERS := $(shell docker ps -a -q)

build:
	docker build -t "lantern-core:${TAG}" ./container

run:
	docker run --name "lantern-core" -it  \
		--volume ${PWD}/container/app/node_modules:/opt/lantern/node_modules \
		--env-file _env \
		-p 8080:80 \
		"lantern-core:${TAG}"

image:
	docker run -it --privileged \
	--volume ${PWD}:/tmp \
	--env-file _env \
	-e IMAGE_NAME="lantern.img" \
	-e COPY_DIR="/tmp/container/app" \
	-e SCRIPT_DIR="/tmp/container/scripts" \
	-e SETUP_SCRIPT="/tmp/pi-setup" \
	pi-maker

clean:
	docker system prune -af