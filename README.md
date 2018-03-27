# lantern-box

Our Docker image is modeled after a Raspberry Pi Zero W. The image enables us to cache our software dependencies and test as much logic as possible without loading to a physical device.

### Getting Started

```bash
make && make run
```

### Loading On Device

```bash
make image
```

This command uses [pi-maker](https://github.com/lantern-works/pi-maker) to generate an image compatible with the RPI0W.


### Requirements

A local [Docker](https://www.docker.com/community-edition) environment is required in order to build an image.

Ubuntu users should install these packages before building an image:
```bash
apt-get install binfmt-support qemu-user-static make
```

### Disclaimer
This repository is under active development and not yet intended for widespread use.