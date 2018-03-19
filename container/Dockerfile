from stephank/archlinux:armv6-base

RUN mkdir -p /tmp/install
WORKDIR /tmp/install

COPY install/users .
RUN ./users

COPY install/db .
RUN ./db

COPY install/network .
RUN ./network

COPY install/service .
RUN ./service

COPY bin/* /usr/local/bin/

WORKDIR /opt

# install web server
COPY server.js package.json /opt/
COPY public /opt/public

# setup storage directory for database
RUN mkdir -p /opt/data

# expose web server port
EXPOSE 80

ENTRYPOINT "/usr/local/bin/docker-entrypoint"