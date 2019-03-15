#!/usr/bin/env python2
from __future__ import print_function
import sys
import string
import time
import signal
import logging
import os
import requests
from threading import Timer
import rf95


requests.packages.urllib3.disable_warnings()

DO_SEND = True
DO_RECEIVE = True
DEFAULT_LORA_FREQUENCY = rf95.CH_05_US
LORA_POWER = 23
SEND_INTERVAL = 7 # how many seconds should we wait between messages

#-----------------------------------------------------------------------------
class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer     = None
        self.interval   = interval
        self.function   = function
        self.args       = args
        self.kwargs     = kwargs
        self.is_running = False

    def _run(self):
        self.is_running = False
        self.start()
        self.function(*self.args, **self.kwargs)

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False
        


#-----------------------------------------------------------------------------
lora = rf95.RF95(0, 25, None, 13)
did_init = False
is_running_queue = False
is_receiving_message = False
is_closing = False
logging.basicConfig(filename="/lantern/logs/lora.log", level=logging.DEBUG)


#-----------------------------------------------------------------------------
def printNow(str):
    print(str)
    logging.info(str)
    sys.stdout.flush()

def isLoRaBusy():
    lora.spi.open(0,lora.cs)
    current_mode = lora.spi_read(rf95.REG_01_OP_MODE)
    if (current_mode == 128 or current_mode == 129):
        return True

# setup RF95/RF96 modem for our long-range, peer-to-peer data
def setupRadio(): 

    # determine which frequency to broadcast on
    freq = DEFAULT_LORA_FREQUENCY

    lora.set_frequency(freq)
    printNow("freq = " + str(freq) + " MHz")

    # set power levels
    lora.set_tx_power(LORA_POWER)
    printNow("power level = " + str(LORA_POWER))

    # set custom modem config
    bandwidth = rf95.BW_62K5HZ
    coding_rate = rf95.CODING_RATE_4_8
    imp_header = rf95.IMPLICIT_HEADER_MODE_ON
    spreading_factor = rf95.SPREADING_FACTOR_2048CPS
    crc = rf95.RX_PAYLOAD_CRC_ON
    continuous_tx = rf95.TX_CONTINUOUS_MODE_OFF
    timeout = rf95.SYM_TIMEOUT_MSB
    agc_auto = rf95.AGC_AUTO_ON

    #  Low Data Rate Optimisation mandated for when the symbol length exceeds 16ms
    low_data_rate = 0x08 # aka mobile node


    lora.spi_write(rf95.REG_1D_MODEM_CONFIG1, \
            bandwidth | coding_rate | imp_header)

    lora.spi_write(rf95.REG_1E_MODEM_CONFIG2, \
            spreading_factor | continuous_tx | crc | timeout)

    # low data rate optimize prevents distortion of characters
    lora.spi_write(rf95.REG_26_MODEM_CONFIG3, \
            agc_auto | low_data_rate)

    printNow("bandwidth = " + str(bandwidth))
    printNow("spreading factor = " + str(spreading_factor))
    printNow("coding_rate = " + str(coding_rate))
    printNow("agc_auto = " + str(agc_auto))
    printNow("current mode = " + str(lora.spi_read(rf95.REG_01_OP_MODE)))

    # announce that modem is ready with lighting effects
    for x in range(0, 5):
        lora.flash_led(1)



# for now, some updates will be missed when we're sending out data
def checkForIncoming():
    global is_running_queue
    global is_closing
    global is_receiving_message

    # Wait until data is available
    while is_running_queue or not lora.available() or is_closing:
        pass
    
    # Message available, let's read it...
    is_receiving_message = True
    lora.led_on()
    payload_size = lora.buflen
    data = lora.recv()
    final_str = ""
    for i in data:
        final_str += chr(i)

    printNow("==================================================")
    printNow("RCV " + str(final_str) + " (" + str(payload_size) +")")
    # dispatch incoming message to server for processing
    r = requests.put("https://localhost/api/inbox", verify=False, json={"message": str(final_str)})
    snr = lora.spi_read(rf95.REG_19_PKT_SNR_VALUE)
    printNow(" |- rssi = " + str(lora.last_rssi)) # signal strength
    printNow(" |- snr = " + str(snr)) #signal-noise-ratio
    printNow(" |- rx_good = " + str(lora.rx_good)) # successful receipts
    printNow("==================================================\n\n")

    print(r.json())

    is_receiving_message = False
    for x in range(0, 3):
        lora.flash_led(0.5)


def checkForOutgoing():
    global is_running_queue
    global is_receiving_message
    global is_closing

    
    if lora.rx_bad > 0:
        printNow("bad tx count: " + str(lora.rx_bad))

    elif is_receiving_message:
        printNow("waiting to process incoming messages...")
    else:
        is_running_queue = True
        # check if we have any queue items to process
        r = requests.post("https://localhost/api/outbox", verify=False)
        data = r.json()

        # item includes revision number so we can forward to other devices over LoRa
        # this helps us ignore old documents and duplicates
        if data["message"]:
            lora.led_on()
            printNow("==================================================")
            printNow("SND "   + data["message"] + " (" + str(len(data["message"])) + ")")
            power = lora.spi_read(rf95.REG_09_PA_CONFIG)
            lna = lora.spi_read(rf95.REG_0C_LNA)
            lora.send(lora.str_to_data(data["message"]))
            lora.wait_packet_sent()
            printNow(" |- tx_good = " + str(lora.tx_good))
            printNow(" |- reg_pa_config = " + str(power))
            printNow(" |- reg_lna = " + str(lna))
            printNow("remaining in queue: " + str(data["rows"]))
            printNow("==================================================\n\n")
        lora.led_off()
        is_running_queue = False



#-----------------------------------------------------------------------------
def main():

    printNow("============================")
    printNow("  Lantern LoRa Service")
    printNow("============================")

    def exitGracefully():
        printNow("\nexiting gracefully...")
        is_closing = True
        if 'rt' in locals() and rt.is_running:
            rt.stop()
            printNow("halting send activity...")
        else:
            printNow("no send activity to halt...")
            
        lora.set_mode_idle()
        printNow("set lora to idle...")
        time.sleep(1)
        lora.led_off()
        printNow("running cleanup...")
        lora.cleanup()
        sys.exit()


    def handleStopSignals(signum, frame):
        exitGracefully()
    
    try:
        if isLoRaBusy():
            printNow("radio in use elsewhere...")
            quit(1)
        elif not lora.init(): # returns True if found
            printNow("radio not found or not ready. please adjust hardware switch to CE0 or try later...")
            exitGracefully()
        else:
            print("radio found...")
            did_init = True
            # make sure we always exit gracefully when running as a service
            signal.signal(signal.SIGINT, handleStopSignals)
            signal.signal(signal.SIGTERM, handleStopSignals)
            # setup frequency, bandwidth, etc.
            setupRadio()
            # use a timed interval to check our queue and send messages
            if DO_SEND:
                rt = RepeatedTimer(SEND_INTERVAL, checkForOutgoing)
                rt.start()
                printNow("ready to send messages...")

            if DO_RECEIVE:
                # when we're not sending messags, drop into receiving mode
                printNow("watching airwaves...")
                while True:
                    checkForIncoming()



    except KeyboardInterrupt:
        exitGracefully()

if __name__ == '__main__':
    main()
