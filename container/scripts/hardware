#!/bin/bash

echo "#############################################"
echo "## Hardware Setup"
echo "#############################################"
if [[ -f /boot/config.txt ]]; then
    echo "configuring raspberry pi hardware..."

    # update hostname
    echo "lantern" > /etc/hostname

    # enable HDMI hotplug
    grep 'hdmi_force_hotplug=1' /boot/config.txt >/dev/null || echo 'hdmi_force_hotplug=1' >> /boot/config.txt

    # disable Bluetooth
    grep 'dtoverlay=pi3-disable-bt' /boot/config.txt >/dev/null || echo 'dtoverlay=pi3-disable-bt' >> /boot/config.txt

    # for LoRa console communication
    grep 'dtparam=spi=on' /boot/config.txt >/dev/null || echo 'dtparam=spi=on' >> /boot/config.txt
    grep 'dtparam=i2c=on' /boot/config.txt >/dev/null || echo 'dtparam=i2c=on' >> /boot/config.txt
    grep 'enable_uart=1' /boot/config.txt >/dev/null || echo 'enable_uart=1' >> /boot/config.txt

    cat /boot/config.txt
    sync
else
    echo "skipping hardware setup within docker container..."    
fi