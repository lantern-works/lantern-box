from stephank/archlinux:armv6-base

#############################################
## Core Software Installs
#############################################

# Disable Signature Checks
RUN sed -i -e 's/Required DatabaseOptional/Never/g' /etc/pacman.conf

# Install Software
RUN pacman -Syu --noconfirm sudo zsh grml-zsh-config bash-completion \
    base-devel avahi nss-mdns termite-terminfo\
    wpa_supplicant wpa_actiond ifplugd crda dialog
RUN pacman -Syu --noconfirm nodejs npm python2 nano
RUN ln -s /usr/bin/python2 /bin/python
RUN ln -s /usr/bin/python2-config /bin/python-config



#############################################
## User and Shell Setup
#############################################

RUN useradd -m -g wheel -s /usr/bin/zsh admin
RUN echo '%wheel ALL=(ALL) ALL' | EDITOR='tee -a' visudo

# Set zsh as the default shell for root and admin
RUN chsh -s /usr/bin/zsh root && chsh -s /usr/bin/zsh admin
RUN chown admin. /home/admin/.zshrc

COPY bin /usr/local/bin
CMD ["/usr/local/bin/customize", "&&", "/bin/zsh"]
