#!/bin/bash

echo "#############################################"
echo "## Software Installs"
echo "#############################################"

# disable Signature Checks
sed -i -e 's/Required DatabaseOptional/Never/g' /etc/pacman.conf

#install other system requirements
pacman -Syu --noconfirm sudo nano zsh grml-zsh-config \
    bash-completion tmux git \
    nodejs npm python2 python2-pip base-devel \
    create_ap hostapd dnsmasq avahi nss-mdns wpa_supplicant \
    wpa_actiond ifplugd crda sqlite

ln -s /usr/bin/python2 /bin/python
ln -s /usr/bin/python2-config /bin/python-config

# set locale so that tmux does not complain
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen

pip2 install --upgrade pip

pip2 install persist-queue PyYAML spidev RPi.GPIO

# install customized RF95 library for LoRa based on RadioHead
curl -L -o /usr/lib/python2.7/site-packages/rf95.py https://raw.githubusercontent.com/lantern-works/pyRF95/master/rf95.py

# install SublimeText remote editor for dev convenience
curl -L -o /usr/local/bin/rsub https://raw.githubusercontent.com/aurora/rmate/master/rmate
chmod a+x /usr/local/bin/rsub

sync
