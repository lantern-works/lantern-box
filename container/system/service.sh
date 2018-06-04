#!/bin/bash

echo "#############################################"
echo "## Add Services "
echo "#############################################"

function addService() {
    local svc=$1
    local label=$2

    # http service    
    echo "installing ${svc} service..."
    touch /etc/systemd/system/${svc}.service
    cat <<EOF >"/etc/systemd/system/${svc}.service"
    [Unit]
    Description=Lantern ${label} Service

    [Service]
    ExecStart=/opt/lantern/service/${svc}
    Restart=always

    [Install]
    WantedBy=multi-user.target
EOF
    systemctl enable ${svc}.service
}

addService http "Web & Database"
addService broadcast "Broadcast"
addService ap "Access Point / Hotspot"
addService lora "LoRa Radio"
addService inbox "Message Inbox"


echo "#############################################"
echo "## Adjust File System "
echo "#############################################"

# create admin user
useradd -m -g wheel -s /usr/bin/zsh admin
echo '%wheel ALL=(ALL) NOPASSWD:ALL' | EDITOR='tee -a' visudo

# set zsh as the default shell
chsh -s /usr/bin/zsh root && chsh -s /usr/bin/zsh admin
chown admin. /home/admin/.zshrc
echo 'cd /opt/lantern/' >> /home/admin/.zshrc
echo 'alias rl="sudo systemctl restart lora"' >> /home/admin/.zshrc
echo 'export PATH=/opt/lantern/bin/:/opt/lantern/service:$PATH' >> /home/admin/.zshrc
sync