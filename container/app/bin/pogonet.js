#!/usr/bin/env node

var cmd 	  = require('node-cmd');
var fs    	= require('fs');
var sleep 	= require('sleep');

var LANTERN_SSID="LANTERN"
//LANTERN_SSID="aamootp" //override with jeff's home AP for testing
//LANTERN_SSID="TP-Link_C743" //override with Jeff's home internet in Israel
var LANTERN_INTERNET_SSID="LANTERN-INTERNET"

//How long should we stay in AP mode before dropping out to pollinate?
var POLLINATE_MIN_SECONDS=10;
var POLLINATE_MAX_SECONDS=30;

var curLanternIndex=0; //for iterating through lanterns
var nearbyLanterns;

var autoPogo = false;


//https://stackoverflow.com/questions/13997793/generate-random-number-between-2-numbers
function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//if user terminates the script, switch back to AP mode and exit
process.once('SIGINT', function (code) {
    console.log('SIGINT received...');
    ap_start(true);
    process.exit(0);
  });

function pollinate_lantern(ssid, mac) {
  console.log("pollinateLantern() %s %s", ssid, mac);
  //Create new netctl profile for the target lantern (based on mac address)
  fs.writeFile(
    "/etc/netctl/wlan0-lantern",
    "Description=Lantern\nInterface=wlan0\nConnection=wireless\nSecurity=wpa\nESSID=\""+
      ssid +
      "\"\nIP=dhcp\nAP=" + mac + '\n',
    function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("New netctl profile written: "+ssid+" "+mac);
      //netctl profile ready : let's connect to it!
      cmd.get(
        'netctl switch-to wlan0-lantern; sleep 5',
        function(err, data, stderr) {
          if(err) {
            console.log(stderr);
          }
          else{
            console.log("Beginning PouchDB sync (TODO)");
            //TODO: How do we kick off the pouchDB sync here?
            sleep.sleep(23);  //simulate a delay for when it would be actually syncing
            //TODO: How do we know when pouchDB sync is done here? monitor deleted file?
            console.log("Done with pouchDB sync...time for next lantern");
          }
          //whether error or not, pollinate the next one
          setTimeout(pollinate_next, 1*1000); //1s delay to avoid recursion
        }
      );

      //OK, so it should connect and sync here. What if it doesn't?
    }
  );
}

function pollinate_next() {
  if(curLanternIndex==nearbyLanterns.length) {
    //TODO - should go through all lanterns twice...just doing once now.
    curLanternIndex=0;
    console.log("No other lanterns in range: switching to AP mode.");
    ap_start(false); //BUGBUG - should not need to be retold if there is internet...
    if(autoPogo) {
      pollinate_schedule();
    }
    else {
      console.log("pogo mode = false: no pollinate scheduled.");
    }
  }
  else {
    pollinate_lantern(LANTERN_SSID, nearbyLanterns[curLanternIndex]);
    curLanternIndex++;
  }
}

function pollinate_start() {
  console.log("pollinate_start");

  //first shut down AP mode
  cmd.get(
    'create_ap --stop wlan0; sleep 5',  //TODO: Don't shut down before scanning for nearby lanterns
    function(err, data, stderr) {
      if(err) {
        console.log("Error shutting down AP: "+stderr);
      }
      else {
        var command = 'ifconfig wlan0 up; sleep 5; '+__dirname+'/wireless macs ' + LANTERN_SSID;
        //console.log("Finding lanterns with: "+command);
        cmd.get(
          command,
          function(err, data, stderr) {
            if(err) { //BUGBUG - this is now probably just the return of sleep, which won't fail
              console.log("ERROR pogo-macs failure: "+err);
            }
            else {
              nearbyLanterns = data.split('\n');
              nearbyLanterns.pop();  //get rid of final blank line
              curLanternIndex=0;
              if(nearbyLanterns.length > 0) {
                console.log("Found " + nearbyLanterns.length.toString() + " new Lanterns:\n"+nearbyLanterns.toString());
              }
              pollinate_next();
            }
          }
        );
      }
    }
  );
  //console.log("exiting LaternModePollinate");
}

function pollinate_schedule() {
  var interval = random_int(POLLINATE_MIN_SECONDS, POLLINATE_MAX_SECONDS);
  setTimeout(pollinate_start, (interval*1000));
  console.log("Pollinate scheduled in " + interval.toString() + " seconds.");
}

/**
* Start Access Point
*/
function ap_start(internet_available) {
    console.log("Switching to AP mode.");
    var command = [__dirname + "/wireless"];
    command.push(internet_available ? "ap_internet" : "ap");
    console.log(command.join(" "));
    cmd.get(command.join(" "), function(err, data, stderr) {
        if(err) {
            console.log("ERROR creating access point" + stderr);
        }
        else {
          console.log("Access point successfully started", data);
        }
    });
}



//-----------------------------------------------------------------------------
// process command line arguments and do the caller's bidding
switch(String(process.argv[2])){
  case "ap"        : ap_start(false);                      break;
  case "internet"  : ap_start(true);                       break;
  case "pogo"      : autoPogo=true; pollinate_schedule();  break; //won't begin pollinating immediately, but starts the timer
  case "pollinate" : pollinate_start();                    break; //starts pollinating immediately
  default:
    console.log("pogonet [ap, pollinate, internet, pogo]\n");
    console.log("ap: becomes an access point to which phones and lanterns can connect.");
    console.log("pollinate: drops out of ap mode and syncs with nearby lanterns once, then returns to ap mode.");
    console.log("internet: locked to ap mode with SSID LANTERN_INTERNET.");
    console.log("pogo: automatically toggles between ap and pollinate, currently on a randomized schedule.");
    break;
}

/*
  TODO:
  - pollinate: iterate through nearby lanterns twice to make sure all are in sync
  - pollinate: pick the strongest LANTERN_INTERNET nearby and sync to that first, to get latest before pollinating
  - internet: automatically check if internet is active, then go into internet mode automatically in ap_start
*/
