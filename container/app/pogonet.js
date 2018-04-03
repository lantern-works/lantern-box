#!/usr/bin/env node

var cmd 	= require('node-cmd');
var fs  	= require('fs');
var sleep 	= require('sleep');

var LANTERN_SSID="lantern"
//LANTERN_SSID="airmoo2.4" //override with jeff's home AP for testing
var LANTERN_INTERNET_SSID="lantern-internet"

//How long should we stay in AP mode before dropping out to pollinate?
var POLLINATE_MIN_SECONDS=20*2; //should be minutes, but seconds useful for debugging; multiply by 60 later
var POLLINATE_MAX_SECONDS=30*2;

function boot() {
  console.log('pogonet booting...');
  lanternModeAP_Internet();
}

function pollinateLantern(ssid, mac) {
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
          setTimeout(pollinateNextLantern, 1*1000); //to avoid recursion
        }
      );
      
      //OK, so it should connect and sync here. What if it doesn't?
    }
  );
}

function pollinateNextLantern() {
  if(curLanternIndex==nearbyLanterns.length) {
    //BUGBUG - should go through all lanterns twice...just doing once now.
    curLanternIndex=0;
    lanternModeAP();
  }
  else {
    pollinateLantern(LANTERN_SSID, nearbyLanterns[curLanternIndex]);
    curLanternIndex++;
  }
}

var curLanternIndex=0;
var nearbyLanterns;
function pollinateStart() {
  //go through list of nearby lanterns, sorted by strongest signal first
  console.log("pollinateStart()");
  //process.exit(); //debug: uncomment to manually investigate wlan state at this point
  var command = 'ifconfig wlan0 up; sleep 5; '+__dirname+'/bin/pogo-macs ' + LANTERN_SSID;
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
          pollinateNextLantern();
        }
        else {
          console.log("No other lanterns in range: switching to AP mode.");
          lanternModeAP();
        }
      }
    }
  );
}

function lanternModePollinate() {
  console.log("Mode switch: Pollinate");

  //first shut down AP mode
  cmd.get(
    'create_ap --stop wlan0; sleep 5',  //TODO: Don't shut down before scanning for nearby lanterns
    function(err, data, stderr) {
      if(err) {
        console.log("Error shutting down AP: "+stderr);
      }
      else {
        pollinateStart();
      }
    }
  );
  console.log("exiting LaternModePollinate");
}

//https://stackoverflow.com/questions/13997793/generate-random-number-between-2-numbers
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lanternModeAP() {
  console.log("Mode switch: AP");
  var interval = getRandomInt(POLLINATE_MIN_SECONDS, POLLINATE_MAX_SECONDS);
  setTimeout(lanternModePollinate, (interval*1000));
  console.log("Seconds remaining until next pollinate: "+interval.toString());

  cmd.get(
    //jeff - vetted throws errors, but does bring up latern
    __dirname+'/bin/pogo-ap',
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
