#!/bin/bash

echo "#############################################"
echo "## Add Services "
echo "#############################################"

# http service
touch /etc/systemd/system/http.service
cat <<EOF >"/etc/systemd/system/http.service"
[Unit]
Description=Lantern Database & Web Service

[Service]
ExecStart=/opt/lantern/service/http
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl enable http.service


if [[ -f /boot/config.txt ]]; then

# hotspot service
    touch /etc/systemd/system/hotspot.service
    cat <<EOF >"/etc/systemd/system/hotspot.service"
    [Unit]
    Description=Lantern Hotspot Service

    [Service]
    ExecStart=/opt/lantern/service/hotspot
    Restart=always

    [Install]
    WantedBy=multi-user.target
EOF
    systemctl enable hotspot.service




# lora service
    touch /etc/systemd/system/lora.service
    cat <<EOF >"/etc/systemd/system/lora.service"
[Unit]
Description=Lantern LoRa Service

[Service]
ExecStart=/opt/lantern/service/lora
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    systemctl enable lora.service
fi


# create admin user
useradd -m -g wheel -s /usr/bin/zsh admin
echo '%wheel ALL=(ALL) ALL' | EDITOR='tee -a' visudo

# set zsh as the default shell
chsh -s /usr/bin/zsh root && chsh -s /usr/bin/zsh admin
chown admin. /home/admin/.zshrc
echo 'cd /opt/lantern/' > /home/admin/.zshrc