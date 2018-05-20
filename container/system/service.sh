#!/bin/bash

echo "#############################################"
echo "## Add Services "
echo "#############################################"

# http service    
echo "installing http service..."
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
    echo "installing access point service..."
    # ap service
    touch /etc/systemd/system/ap.service
    cat <<EOF >"/etc/systemd/system/ap.service"
[Unit]
Description=Lantern Access Point Service

[Service]
ExecStart=/opt/lantern/service/ap
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    systemctl enable ap.service



    # lora service
    echo "installing lora service..."
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
echo 'cd /opt/lantern/' >> /home/admin/.zshrc
echo 'export PATH=/opt/lantern/bin/:/opt/lantern/service:$PATH' >> /home/admin/.zshrc
sync