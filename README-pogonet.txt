
MANUAL TOGGLE WORKING: The ap.sh and pollenate.sh scripts go back and forth between the two modes now. There is probably too much happening with too many sleeps - surely can be optimized.


HOWTO

The pogonet scripts are available at /opt/lantern/bin

POGO-AP
Switches lantern into access point (AP) mode:

    'sudo /opt/lantern/bin/pogo-ap' and look on your phone to see if "lantern" appears as an AP

Called by pogonet.js


POGO-POLLINATE
Switches to client mode and connects to default wifi in profile wlan0-SSID, as configured when image was built.

    'sudo /opt/lantern/bin/.sh' and see if "lantern" disappears, and a connection is made. 'ifconfig' should show the device has an IP address from the default connection.

Only used for manual proof-of-concept, pogonet.js does not call this.


POGONET.SH
Arranges going back and forth on a (currently) random timer, between AP mode and POLLINATE to sync with other lanterns, by serially connecting to lanterns from highest to lowest signal strength. I only have one lantern up, so this is largely untested with multiple lanterns - it will connect to my home router. Once I can build images again, I'll set up with real lanterns.

When you run it, you'll get an ongoing status as it toggles between AP and POLLINATE mode and connects to other devices.

This is an extreme alpha version - I'm sure there are serious bugs, essentially zero error checking, and many features to be added.


POGO-MAC ssid
Simple bash script that creates the list of lantern mac addresses sorted by signal strength.

Called by POGO-POLLINATE

example to show nearby lanterns:

	sudo /opt/lantern/bin/pogo-macs lantern


POGO-RESETWLAN0
A brute force take down and restore of wlan0, to try and clear any weird state. Only used in POGO-AP at the moment. Hopefully can be optimized away.
