#!/usr/bin/env python2
import sys
import rf95
import time

def main():

    # setup lora
    lora = rf95.RF95(0, 25, None, 13)
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
        lora.send(lora.bytes_to_data([0x01, 0x02, 0x03]))
        lora.wait_packet_sent()
        print("sent data")

        time.sleep(2);

        lora.send(lora.str_to_data('{"hello":"world"}'))
        lora.wait_packet_sent()
        print("sent string")

        # cleanup lora module
        lora.cleanup()

    except KeyboardInterrupt:
        print("closing...")
        # clean up
        lora.cleanup()


if __name__ == '__main__':
   main()