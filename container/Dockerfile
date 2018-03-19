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

# custom application logic
COPY bin/* /usr/local/bin/
ENTRYPOINT "/usr/local/bin/docker-entrypoint"
