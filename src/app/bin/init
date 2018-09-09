#!/bin/bash

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi


function parse_yaml {
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}

function set_perms {
  echo "setting permissions for app directory..."
  chgrp wheel .
  chmod g+rw .
  chgrp wheel -R $(ls | awk '{if($1 != "node_modules"){ print $1 }}')
  chmod g+s .
  chmod o= -R $(ls | awk '{if($1 != "node_modules"){ print $1 }}')
  chmod g+rw -R $(ls | awk '{if($1 != "node_modules"){ print $1 }}')
  chgrp wheel ./node_modules
  chmod g+rwx ./node_modules
}


#-----------------------------------------------------------------------------

  echo "#############################################"
if [[ -f /tmp/lantern-init ]]; then
  DID_INIT=true
  echo "# Re-Initialize"
else
  DID_INIT=false
  echo "# Initialize"
fi
  echo "#############################################"

# enter into app directory and read config file if available

PLATFORM_DIR="/opt/lantern"
MODULE_DIR="/opt/lantern/node_modules/lantern-serve"

cd /opt/lantern/

# make log directory
mkdir -p "${PLATFORM_DIR}/logs"

if [[ -f ./config.yml ]]; then
  eval $(parse_yaml ./config.yml)
  cat ./config.yml
fi

# refresh node modules and make sure we have everything needed to run services

if [[ "${DID_INIT}" == "true" ]]; then
  echo "skipping node module we already installed..."
else
  echo "installing lantern-serve..."
  if [[ -d $MODULE_DIR ]]; then
    echo "lantern-serve already installed..."
  else
    npm install lantern-works/lantern-serve#box --build-from-source=sqlite3   
  fi
fi

ln -s "${PLATFORM_DIR}/sslcert" "${MODULE_DIR}/sslcert" 
ln -s "${PLATFORM_DIR}/logs" "${MODULE_DIR}/logs"
ls -al "${MODULE_DIR}/public"
cd $MODULE_DIR
cat package.json
npm run load-db
npm run load-apps
cd $PLATFORM_DIR
set_perms

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
  touch /tmp/lantern-init
  sync
else
  # make this a docker entrypoint
  ./service/http & # systemd is not compatible with docker so run service manually
  touch /tmp/lantern-init
  su admin
  zsh # drop into our shell for convenience
  trap : TERM INT; sleep infinity & wait # keep machine running
fi

