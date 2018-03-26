
MANUAL TOGGLE WORKING: The ap.sh and pollenate.sh scripts go back and forth between the two modes now. There is probably too much happening with too many sleeps - surely can be optimized.

INTEGRATION INTO LANTERN IMAGE: Zero progress. These are all run manually now, and need to be integrated into the build.

HOWTO

The pogonet scripts are not integrated into the image build yet.
After building the pi image, manually install the below scripts on the booted pi. I use scp, e.g.:

	scp ./* admin@[IP_OF_LANTERN]:~/bin

Then you can just run them manually directly on the lantern.


AP.SH
Switches lantern into access point (AP) mode:

    'sudo ap.sh' and look on your phone to see if "lantern" appears as an AP

Called by pogonet.sh


POLLENATE.SH
Switches to client mode and connects to default wifi in profile wlan0-SSID, as configured when image was built.

    'sudo pollenate.sh' and see if "lantern" disappears, and a connection is made. 'ifconfig' should show the device has an IP address from the default connection.

Only used for manual proof-of-concept, pogonet.sh does not call this.


POGONET.SH
Arranges going back and forth on a (currently) random timer, between AP mode and POLLENATE to sync with other lanterns, by serially connecting to lanterns from highest to lowest signal strength. I only have one lantern up, so this is largely untested with multiple lanterns - it will connect to my home router. Once I can build images again, I'll set up with real lanterns.

the system script should do this automatically when building image, but if you're starting from another branch, you need to install some node modules on the lantern:

	sudo npm install --unsafe-perm node-cmd fs sleep

When you run it, you'll get an ongoing status as it toggles between AP and POLLENATE mode and connects to other devices.

This is an extreme alpha version - I'm sure there are serious bugs, essentially zero error checking, and many features to be added.


MACS.SH ssid
Simple bash script that creates the list of lantern mac addresses sorted by signal strength.

Called by pollenate.sh

example to show nearby lanterns:

	sudo ./macs.sh lantern


RESETWLAN0.SH
A brute force take down and restore of wlan0, to try and clear any weird state. Only used in AP.SH at the moment. Hopefully can be optimized away.
