from stephank/archlinux:armv6-base

EXPOSE 80

# install setup scripts to prepare system
RUN mkdir -p /tmp/system
WORKDIR /tmp/system
COPY system/hardware.sh .
RUN ./hardware.sh
COPY system/software.sh .
RUN ./software.sh
COPY system/network.sh .
RUN ./network.sh
COPY system/service.sh .
RUN ./service.sh


# install web server
ARG CACHEBUST=1
COPY app /opt/lantern
RUN chown -R admin /opt/lantern
RUN chgrp -R wheel /opt/lantern
WORKDIR /opt/lantern
ENTRYPOINT "/opt/lantern/bin/docker-entrypoint"