from stephank/archlinux:armv6-base

#############################################
## Core Software Installs
#############################################

# disable Signature Checks
RUN sed -i -e 's/Required DatabaseOptional/Never/g' /etc/pacman.conf

# install node.js dependencies
RUN pacman -Syu --noconfirm nodejs npm python2 base-devel 
RUN ln -s /usr/bin/python2 /bin/python
RUN ln -s /usr/bin/python2-config /bin/python-config
RUN npm config set unsafe-perm true
RUN mkdir -p /opt/lantern/
WORKDIR /opt/lantern/
RUN npm install express pouchdb-core pouchdb-adapter-node-websql \
    pouchdb-adapter-http pouchdb-mapreduce pouchdb-replication express-pouchdb
RUN npm config set unsafe-perm false

# install network requirements
RUN pacman -Syu --noconfirm avahi nss-mdns wpa_supplicant \
    wpa_actiond ifplugd crda dialog

#install other system requirements
RUN pacman -Syu --noconfirm sudo nano zsh grml-zsh-config \
    bash-completion termite-terminfo



#############################################
## User and Shell Setup
#############################################

# create admin user
RUN useradd -m -g wheel -s /usr/bin/zsh admin
RUN echo '%wheel ALL=(ALL) ALL' | EDITOR='tee -a' visudo

# set zsh as the default shell
RUN chsh -s /usr/bin/zsh root && chsh -s /usr/bin/zsh admin
RUN chown admin. /home/admin/.zshrc

# copy scripts for runtime customization
COPY bin /usr/local/bin
CMD ["/usr/local/bin/customize", "&&", "/bin/zsh"]
