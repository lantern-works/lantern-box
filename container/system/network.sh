#!/bin/bash

echo "#############################################"
echo "## Discovery & Networking"
echo "#############################################"
if [[ -f /boot/config.txt ]]; then
    echo "configuring networks and discovery for raspberry pi hardware..."

    # zero-conf / bonjour / avahi to make the pi easier to find on the network
    sed -i '/^hosts: /s/files dns/files mdns dns/' /etc/nsswitch.conf
    ln -sf /usr/lib/systemd/system/avahi-daemon.service /etc/systemd/system/multi-user.target.wants/avahi-daemon.service

    # enable wireless, actual connection details will be configured by the user, likely over usb-serial.
    ln -sf /usr/lib/systemd/system/netctl-auto@.service /etc/systemd/system/multi-user.target.wants/netctl-auto@wlan0.service


    # ip forwarding
    cat "net.ipv4.ip_forward = 1" >> /etc/sysctl.d/ipv4_forwarding.conf
    
#     cat <<EOF >"/etc/dhcpcd.conf"
# interface wlan0
#     static ip_address=10.0.10.1/24
#     static routers=10.0.10.1
#     static domain_name_servers=10.0.10.1 8.8.8.8
# EOF

else
    echo "skipping network setup within docker container..."    
fi
sync