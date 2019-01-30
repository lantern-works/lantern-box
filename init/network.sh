#!/bin/bash

echo "#############################################"
echo "## Discovery & Networking"
echo "#############################################"
if [[ -f /boot/config.txt ]]; then
    echo "configuring networks and discovery for raspberry pi hardware..."

    # zero-conf / bonjour / avahi to make the pi easier to find on the network
    sed -i '/^hosts: /s/files dns/files mdns dns/' /etc/nsswitch.conf
    ln -sf /usr/lib/systemd/system/avahi-daemon.service /etc/systemd/system/multi-user.target.wants/avahi-daemon.service

    # enable wireless, actual connection details will be configured by the user
    ln -sf /usr/lib/systemd/system/netctl-auto@.service /etc/systemd/system/multi-user.target.wants/netctl-auto@wlan0.service

    # setup hosts
    echo '127.0.0.1 localhost lantern.link' >> /etc/hosts

else
    echo "skipping network setup within docker container..."    
fi
sync