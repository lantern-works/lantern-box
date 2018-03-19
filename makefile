MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail
.DEFAULT_GOAL := build

TAG?=latest
DATE := $(shell date +%s)

build:
	docker build -t "lantern-core:${TAG}" ./container

run:
	docker run -it "lantern-core:${TAG}"