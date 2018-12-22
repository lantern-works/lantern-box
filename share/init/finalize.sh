#!/bin/bash

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi



#-----------------------------------------------------------------------------

chown -R admin:wheel /opt/lantern/

mkdir -p "/opt/lantern/logs"

if [[ -f /opt/server/package.json ]]; then
  echo "#############################################"
  echo "# lantern-serve update"
  echo "#############################################"
  # do we already have the server installed? if so, assume it's a git repository and update it...
  cd /opt/server && git pull
else
  # otherwise initialize the repository

  echo "#############################################"
  echo "# lantern-serve and app download"
  echo "#############################################"
  rm -rf /opt/server
  git clone --single-branch --branch dev https://github.com/lantern-works/lantern-serve  /opt/server
  git clone https://github.com/lantern-works/lantern-apps /opt/server/apps
  chown -R admin:wheel /opt/server/
  cd /opt/server && ls -al

  echo "#############################################"
  echo "# lantern-serve npm install"
  echo "#############################################"
  npm install

fi


# if we have certs available, allow them to be moved over to be used by our server
if [[ -d /opt/lantern/certs ]]; then
  mv "/opt/lantern/certs" "/opt/server/certs"
fi

sync



#-----------------------------------------------------------------------------
echo "#############################################"
if [[ -f /boot/config.txt ]]; then
  echo "## Raspberry Pi Image Ready"
else
  echo "## Docker Image Ready"
fi
echo "#############################################"

if [[ -f /boot/config.txt ]]; then
  # finish raspberry pi setup
  echo "updating admin password..."
  ADMIN_PASS=${ADMIN_PASS:-wins}
  echo -e "${ADMIN_PASS}\n${ADMIN_PASS}" | passwd admin
  sync
else
  # make this a docker entrypoint
  /opt/lantern/service/http & # systemd is not compatible with docker so run service manually
  su admin
  zsh # drop into our shell for convenience
  trap : TERM INT; sleep infinity & wait # keep machine running
fi

