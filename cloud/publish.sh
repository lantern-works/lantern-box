#!/bin/bash
docker build --build-arg CACHEBUST=$(date +%s) -t "westlane/lantern-box" ../container
docker push "westlane/lantern-box"
triton profile set-current lantern
triton-docker pull "westlane/lantern-box"
triton-compose -p lt -f triton-compose.yml up -d