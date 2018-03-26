#!/usr/bin/bash

iw wlan0 scan | grep "wlan0\|SSID\|signal" | paste - - - | grep "^BSS" | sort -u -k3 | grep airmoo | cut -c 5-21
