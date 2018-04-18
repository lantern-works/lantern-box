#!/usr/bin/env python2
import sys
import rf95
import time
import requests

seq = 0
db_uri = "http://localhost/db/lantern/"
lora = rf95.RF95(0, 25, None, 13)

def poll():
    global seq
    uri = db_uri+"_changes?include_docs=true&since="+str(seq)
    r2 = requests.get(uri, auth=("admin", "pins"))

    if r2.status_code == 200:
        data = r2.json()
        seq = data.get("last_seq")
        for change in data.get("results"):
            if change.has_key("doc"):
                doc = change.get("doc")
                send(str(doc))
        time.sleep(10)
        poll()

def send(val):
    print("sending: " + val)
    lora.send(lora.str_to_data(val))
    lora.wait_packet_sent()
    transmit_len = len(val.encode("utf8"))
    print("bytes sent: " + str(transmit_len))

def main():
    global seq
    print("------------------------------------------------------")
    if not lora.init(): # returns True if found
        print("RF95 not found or not ready")
        lora.cleanup()
        quit(1)
    else:
        print("RF95 LoRa Ready")
    print("------------------------------------------------------")
        
    try:
        # set frequency
        if len(sys.argv) > 1:
            freq = float(sys.argv)
        else:
            freq = 434.00

        print("frequency = " + str(freq))
        lora.set_frequency(freq)
        lora.set_tx_power(15)

        # send test data
        time.sleep(2);
        send('[lantern:blue-nile]')


        r1 = requests.get(db_uri)
        seq = r1.json().get("update_seq")
        print("watching database from: " + str(seq))


        poll()

    except KeyboardInterrupt:
        print("closing...")
        # clean up
        lora.cleanup()


if __name__ == '__main__':
   main()