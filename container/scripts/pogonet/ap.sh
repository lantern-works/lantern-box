./resetwlan0.sh
sleep 1
echo "About to create_ap"
netctl stop wlan0-SSID
create_ap --daemon --no-virt -n wlan0 lantern
sleep 5
