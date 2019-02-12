#!/bin/bash

trap "exit" INT

# disable signature checks
sed -i -e "s/SigLevel    = Required DatabaseOptional/SigLevel = Never/g" /etc/pacman.conf


echo "#############################################"
echo "## System Upgrade "
echo "#############################################"
pacman -Syu --noconfirm --ignore ca-certificate-utils --ignore ca-certificates-mozilla


echo "#############################################"
echo "## CA Certificate Fix "
echo "#############################################"
# https://bugs.archlinux.org/task/53217
pacman -S --noconfirm --overwrite  ca-certificates-utils  --overwrite ca-certificates-mozilla

curl https://lantern.link/api/info

if [[ ! -s /etc/ca-certificates/extracted/ca-bundle.trust.crt ]]; then
	echo "WARNING: missing required ca-bundle trust file"
	echo "WARNING: cannot continue without SSL support..."
	exit 1
fi


echo "#############################################"
echo "## SSL Check "
echo "#############################################"
curl https://lantern.link/api/info

echo "#############################################"
echo "## Install eInk Controller "
echo "#############################################"
curl -O -J -L https://github.com/lantern-works/red-ink/releases/download/v0.0.1/red-ink /lantern/bin/red-ink


echo " "
echo "#############################################"
echo "## Base Software Install "
echo "#############################################"
pacman -Sy --needed --noconfirm base-devel glibc gcc


echo "#############################################"
echo "## Git Install "
echo "#############################################"
pacman -Sy --needed --noconfirm git


echo "#############################################"
echo "## Python Install"
echo "#############################################"
pacman -Sy --needed --noconfirm python2 python2-pip



echo "#############################################"
echo "## Node Installs"
echo "#############################################"
pacman -Sy --needed --noconfirm npm


echo "#############################################"
echo "## Access Point"
echo "#############################################"

pacman -Sy --noconfirm --needed wpa_actiond wpa_supplicant \
	create_ap hostapd dnsmasq avahi nss-mdns



echo "#############################################"
echo "## Misc Installs"
echo "#############################################"
pacman -Sy --noconfirm --needed zsh grml-zsh-config \
    bash-completion tmux sudo nano ifplugd crda     


echo "#############################################"
echo "## Clock Setup "
echo "#############################################"
# set locale so that tmux does not complain 
# (we are not trying for accuracy due to offline system)
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen

echo "#############################################"
echo "## Python Setup"
echo "#############################################"
# sets default python environment
ln -s /usr/bin/python2 /bin/python
ln -s /usr/bin/python2-config /bin/python-config

echo "#############################################"
echo "## spidev"
echo "#############################################"
pip2 install  spidev

echo "#############################################"
echo "## RPi.GPIO"
echo "#############################################"
pip2 install RPi.GPIO

echo "#############################################"
echo "## rf96"
echo "#############################################"
# install customized RF95 library for LoRa based on RadioHead
curl -L -o /usr/lib/python2.7/site-packages/rf95.py https://raw.githubusercontent.com/lantern-works/pyRF95/master/rf95.py

echo "#############################################"
echo "## rsub"
echo "#############################################"
# install SublimeText remote editor for dev convenience
curl -L -o /usr/local/bin/rsub https://raw.githubusercontent.com/aurora/rmate/master/rmate
chmod a+x /usr/local/bin/rsub

echo "#############################################"
echo "## Final SSL Check "
echo "#############################################"
curl https://lantern.link/api/info

sync
