# lantern-box

The Lantern is a portable server for decentralized web applications. This repository contains all software and setup scripts required to build and adapt your own Lantern device.

To get started, rename your "\_env.example" file to "\_env" and modify the placeholder values to meet your needs.

### Run a Local Server

Our Docker container is modeled after a Raspberry Pi Zero W. This enables us to cache our software dependencies and test as much logic as possible without loading to a physical device. To setup a local instance:

```bash
make && make run
```

The resulting server will be available at: http://localhost:8080

### Setup Your Raspberry Pi Zero W

This command uses [pi-maker](https://github.com/lantern-works/pi-maker) to create the image:

```bash
make image
```


[Download Etcher](http://etcher.io) and use this to flash your image onto a MicroSD card 8GB or greater. Your image will be named "flash-to-pi.img" by default and will be located in a "build" folder.



### Requirements

A local [Docker](https://www.docker.com/community-edition) environment is required to begin.

Ubuntu users should install these packages before building an image:
```bash
apt-get install binfmt-support qemu-user-static make
```

### Reference
- [WiFi Captive Portal](https://andrewwippler.com/2016/03/11/wifi-captive-portal/)

- [LoRa Time Slots](http://www.daveakerman.com/?p=1850)
- [LoRa Formats](https://www.open-electronics.org/using-lora-shield-in-packet-mode/)
### Disclaimer
This repository is under active development and not yet intended for widespread use.