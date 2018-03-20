from stephank/archlinux:armv6-base

# install scripts to prepare system
RUN mkdir -p /tmp/scripts
WORKDIR /tmp/scripts
COPY scripts/hardware .
RUN ./hardware
COPY scripts/network .
RUN ./network
COPY scripts/users .
RUN ./users
COPY scripts/db .
RUN ./db
COPY scripts/service .
RUN ./service
COPY scripts/config .
COPY bin/* /usr/local/bin/


# install web server
WORKDIR /opt
COPY server.js package.json /opt/
COPY public /opt/public
RUN mkdir -p /opt/data

# expose web server port
EXPOSE 80

ENTRYPOINT "/usr/local/bin/docker-entrypoint"