#!/usr/bin/env python2
import sys
import string
import rf95

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

        # send test data
        while True:
            # Wait until data is available 
            while not lora.available():
                pass
            # Receive
            data = lora.recv()
            print("---  data  ---")
            for i in data:
                print(str(i).zfill(3) + " | " + chr(i))
            print("---  /data ---")

    except KeyboardInterrupt:
        print("closing...")
        # clean up
        lora.cleanup()


if __name__ == '__main__':
   main()