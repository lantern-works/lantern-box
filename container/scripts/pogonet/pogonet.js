#!/usr/bin/env node

var cmd 	= require('node-cmd');
var fs  	= require('fs');
var sleep 	= require('sleep');

var LANTERN_SSID="airmoo2.4"
var LANTERN_INTERNET_SSID="Lantern-Internet"
var POLLENATE_MIN_SECONDS=10; //should be minutes, but seconds useful for debugging; multiply by 60 later
var POLLENATE_MAX_SECONDS=30;

function boot() {
  console.log('pogonet booting...');
  lanternModeAP_Internet();
}

function pollenateLantern(ssid, mac) {
  //Create new netctl profile for the target lantern (based on mac address)
  fs.writeFile(
    "/etc/netctl/wlan0-lantern",
    "Description=Lantern\nInterface=wlan0\nConnection=wireless\nSecurity=wpa\nESSID=\""+
      ssid +
      "\"\nIP=dhcp\nAP=" + mac,
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
            pollenateNextLantern();
          }
          else{
            //TODO: How do we kick off the pouchDB sync here?
            console.log("Beginning PouchDB sync (TBI)");
            sleep.sleep(10);  //simulate a delay for when it would be actually syncing
            //TODO: How do we know when pouchDB sync is done here? monitor deleted file?
            console.log("Done with pouchDB sync...time for next lantern");
          }
          //whether error or not, pollenate the next one
          setTimeout(pollenateNextLantern, 1*1000); //to avoid recursion
        }
      );
      
      //OK, so it should connect and sync here. What if it doesn't?
    }
  );
}

function pollenateNextLantern() {
  if(curLanternIndex==nearbyLanterns.length) {
    //BUGBUG - should go through all lanterns twice...just doing once now.
    curLanternIndex=0;
    lanternModeAP();
  }
  else {
    pollenateLantern(LANTERN_SSID, nearbyLanterns[curLanternIndex]);
    curLanternIndex++;
  }
}

var curLanternIndex=0;
var nearbyLanterns;
function pollenateStart() {
  //go through list of nearby lanterns, sorted by strongest signal first
  //BUGBUG: currently connected lantern will be at bottom of list
  console.log("pollenateStart()");
  cmd.get(
    __dirname+'/macs.sh',
    function(err, data, stderr) {
      console.log("DEBUG MACS LIST: "+data);
      nearbyLanterns = data.split('\n');
      console.log("Found " + nearbyLanterns.length.toString() + " new Lanterns"+nearbyLanterns.toString());
      curLanternIndex=0;
      if(nearbyLanterns.length > 0) {
        pollenateNextLantern();
      }
      else {
        console.log("No other lanterns in range: switching to AP mode.");
        lanternModeAP();
      }
    }
  );
}

function lanternModePollenate() {
  console.log("Mode switch: Pollenate");

  //first shut down AP mode
  cmd.get(
    'create_ap --stop wlan0; sleep 5',
    function(err, data, stderr) {
      if(err) {
        console.log("Error shutting down AP: "+stderr);
      }
      else {
        pollenateStart();
      }
    }
  );
  console.log("exiting LaternModePollenate");
}

//https://stackoverflow.com/questions/13997793/generate-random-number-between-2-numbers
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lanternModeAP() {
  console.log("Mode switch: AP");
  var interval = getRandomInt(POLLENATE_MIN_SECONDS, POLLENATE_MAX_SECONDS);
  setTimeout(lanternModePollenate, (interval*1000));
  console.log("Seconds remaining until next pollenate: "+interval.toString());

  cmd.get(
    //jeff - vetted throws errors, but does bring up latern
    __dirname+'/ap.sh',
    function(err, data, stderr) {
      if(err) {
        console.log("lanternModeAP error: "+stderr);
      }
      else {
        console.log("Switched to AP mode.");
      }
    }
  );
}

// tries to connect to internet and remain an AP. If fails, goes to AP-only mode
function lanternModeAP_Internet() {
  console.log("Mode switch: AP_Internet (Not yet implemented)");
  lanternModeAP(); //BUGBUG: for now, just assume we don't have internet
  return false;
}

boot();

/*
  #netctl-auto disable wlan0-SSID
  #netctl-auto enable wlan0-SSID
  netctl-auto list
  sudo create_ap --no-virt -n wlan0 lanternAP
  sudo systemctl stop netctl-auto@wlan0
  sudo ifconfig wlan0 up //if wlan0 disappears from ifconfig
*/
