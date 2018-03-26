#!/usr/bin/bash

#echo "mac.sh started"

iw wlan0 scan | grep "wlan0\|SSID:\|signal" | paste - - - | grep "^BSS" | grep -v associated | sort -u -k3 | grep $1 | cut -c 5-21
