#!/bin/bash

echo "#############################################"
echo "## Software Installs"
echo "#############################################"

# disable Signature Checks
sed -i -e 's/Required DatabaseOptional/Never/g' /etc/pacman.conf

#install other system requirements
pacman -Syu --noconfirm sudo nano zsh grml-zsh-config \
    bash-completion termite-terminfo \
    nodejs npm python2 python2-pip base-devel \
    create_ap avahi nss-mdns wpa_supplicant \
    wpa_actiond ifplugd crda dialog wget unzip

ln -s /usr/bin/python2 /bin/python
ln -s /usr/bin/python2-config /bin/python-config

pip2 install --upgrade pip

# install customized RF95 library for LoRa based on RadioHead
wget https://raw.githubusercontent.com/lantern-works/pyRF95/master/rf95.py -P /usr/lib/python2.7/site-packages/
pip2 install persist-queue PyYAML spidev RPi.GPIO


# install SublimeText remote editor for dev convenience
wget -O /usr/local/bin/rsub https://raw.github.com/aurora/rmate/master/rmate
chmod a+x /usr/local/bin/rsub