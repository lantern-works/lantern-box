# lantern-box

The Lantern is a portable server for offline-first, decentralized apps. This repository contains all software and setup scripts to build and adapt your own Lantern device. 3D printer files are also included for a physical device enclosure.

### Hardware Setup

You will be installing the Lantern system on a [MicroSD](https://www.amazon.com/Sandisk-Ultra-Micro-UHS-I-Adapter/dp/B073K14CVB) card for [Raspberry Pi Zero W](https://www.adafruit.com/product/3708). The resulting system will contain a web server, database and (with supported LoRa board) long-range sync and messaging features. With this, you will be able to find and share data with other nearby Lantern devices. 

#### Step 1

Create the Raspberry Pi disk image. This will download the latest software and create a disk image about 3GB in size:
```bash
make rpi
```

Note: There is a known issue where you may have to run this command twice when creating your first disk image. This is normal.

#### Step 2
Download and use [Etcher](http://etcher.io) to save your disk image onto a MicroSD card 8GB or greater. Your image will be named "flash-to-pi.img" by default and will be located in a "build" folder.

#### Step 3
Load the MicroSD card into your Raspberry Pi Zero W. Plug in to a computer or wall-socket power source with a micro-USB cable and you should see a green light to indicate power. Wait three minutes for the system to boot.


#### Step 4
After a few minutes you should see the wireless SSID "LANTERN" appear in your WiFi network menu. Select this and connect to the network (no password). 

### Step 4
A window should pop-up on your screen welcoming you to the Lantern Network. If so, you are all set! You can push "Continue" or manually type in the address, "https://lantern.link". You will be accessing an "offline" version of the Lantern system.

### Monitoring Your Lantern
You can plug your Lantern into an HDMI source and connect a keyboard, should you wish to interact directly. You can also SSH as the "admin" user with the password "wins" using the script located in `./bin/connect`. From here you can run commands view logs such as:

```bash
journalctl -f -u lora
```

```bash
journalctl -f -u http
```

### Connecting Your Lantern to The Internet

It is also possible to connect the Lantern to the internet directly. To do so, first make sure you are connected to the "LANTERN" WiFi network. Next, send your own WiFi credentials using your SSID and password like so:

`./bin/tether <ssid> <pass>`


Once complete, you can still reach the Lantern but finding the IP address on your local network may be tricky. Instead, you may use this command-line script that searches for and connects for you: 
`./bin/connect` 



### Local Development

Our Docker container is modeled after a Raspberry Pi Zero W. This may be used for simulations and development prior to working on the actual device. After running the below command, the resulting server will be available at: https://localhost:9443

```bash
make docker
```


### Requirements
A local [Docker](https://www.docker.com/community-edition) environment is required to begin. You will also need reliable internet access to download and install the software for the first time.

Ubuntu users should install these packages before building an image:
```bash
apt-get install binfmt-support qemu-user-static make
```

### Disclaimer
This repository is under active development and not yet intended for widespread use.