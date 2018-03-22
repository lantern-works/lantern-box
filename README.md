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

### Disclaimer
This repository is under active development and not yet intended for widespread use.