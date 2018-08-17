#!/bin/bash

echo "#############################################"
echo "## Add Services "
echo "#############################################"

function addService() {
    local svc=$1
    local label=$2
    local timer=$3

    # http service    
    echo "installing ${svc} service..."
    touch /etc/systemd/system/${svc}.service

    if [[ $timer ]]; then
        cat <<EOF >"/etc/systemd/system/${svc}.service"
[Unit]
Description=Lantern ${label} Service

[Service]
Type=simple
ExecStart=/opt/lantern/service/${svc}
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    else
        cat <<EOF >"/etc/systemd/system/${svc}.service"
[Unit]
Description=Lantern ${label} Service

[Service]
ExecStart=/opt/lantern/service/${svc}
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    fi

    cat "/etc/systemd/system/${svc}.service"


    systemctl enable ${svc}.service


    if [[ $timer ]]; then

        cat <<EOF >"/etc/systemd/system/${svc}.timer"

[Unit]
Description=Run ${svc} every ${timer} seconds

[Timer]
OnBootSec=120sec
OnUnitInactiveSec=${timer}sec


[Install]
WantedBy=multi-user.target

EOF
        cat "/etc/systemd/system/${svc}.timer"
    fi

}

# run these all the time
addService http "Web & Database"
addService ap "Access Point / Hotspot"
addService lora "LoRa Radio"

# bring these up on a timer
addService broadcast "Broadcast" 15
addService inbox "Message Inbox" 8
# addService pollinate "P2P Device Sync" 600




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