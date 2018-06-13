from stephank/archlinux:armv6-base

EXPOSE 80
EXPOSE 443

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

# install app
ARG CACHEBUST=1
COPY app /opt/lantern
WORKDIR /opt/lantern
ENTRYPOINT "/opt/lantern/bin/init"