from stephank/archlinux:armv6-base

EXPOSE 80

# install scripts to prepare system
RUN mkdir -p /tmp/scripts
WORKDIR /tmp/scripts
COPY scripts/system .
RUN ./system
COPY scripts/hardware .
RUN ./hardware
COPY scripts/network .
RUN ./network
COPY scripts/service .
RUN ./service


# install web server
ARG CACHEBUST=1
COPY app /opt/lantern
WORKDIR /opt/lantern
ENTRYPOINT "/opt/lantern/bin/docker-entrypoint"