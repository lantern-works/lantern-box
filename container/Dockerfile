from stephank/archlinux:armv6-base

EXPOSE 80

# install scripts to prepare system
RUN mkdir -p /tmp/scripts
WORKDIR /tmp/scripts
COPY scripts/hardware .
RUN ./hardware
COPY scripts/software .
RUN ./software
COPY scripts/network .
RUN ./network
COPY scripts/finalize .
RUN ./finalize


# install web server
ARG CACHEBUST=1
COPY app /opt/lantern
RUN chown -R admin /opt/lantern
RUN chgrp -R wheel /opt/lantern
WORKDIR /opt/lantern
ENTRYPOINT "/opt/lantern/bin/docker-entrypoint"