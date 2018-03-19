MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail
.DEFAULT_GOAL := build

TAG?=latest
DATE := $(shell date +%s)

build:
	docker build -t "lantern-core:${TAG}" ./container

run:
	docker run --name "lantern-core" -it  \
		--volume ${PWD}/container/ext_node_modules:/opt/node_modules \
		--env-file _env \
		-p 8080:80 \
		"lantern-core:${TAG}"
