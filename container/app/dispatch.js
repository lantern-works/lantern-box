/*
* Dispatch
*
* Use this to watch database for changes and broadcast over LoRa
* Also will upload to cloud where internet is available
*
*/

var PouchDB = require("./lib/pouchdb");
var utils = require("./lib/utils");

module.exports = (function Dispatch() {

    var sync;
    var db = new PouchDB(utils.getLocalDatabaseURI());

    function startCloudSync() {

        if (process.env.CLOUD) {
            console.log("skip sync since this is in the cloud...");
            return;
        }

        var remote_db = new PouchDB(utils.getRemoteDatabaseURI());

        sync = db.sync(remote_db, {
          live: true,
          retry: true
        }).on('change', function (change) {
            if (change.direction) {
                console.log("[stor] " + change.direction  + " docs: " + 
                        change.change.docs_read + " read / " + 
                        change.change.docs_written + " written"
                    );
            }
            else {
                console.log("[stor] change: ", change);
            }
        }).on('paused', function (info) {
            console.log("paused sync... no internet?");
        }).on('active', function (info) {
            console.log("resumed sync... internet is back?");
        }).on('error', function (err) {
            console.log("err: ", err);
        });
    }

    function stopCloudSync() {
        if (sync) {
            sync.on('complete', function() {
                console.log("cloud sync stopped");
            });
            sync.cancel();
        }
        else {
            console.log("can't stop non-existing sync");
        }
    }

    // setup change feed
    function processChange(id,key,val) {
        var msg = id + "::";
        msg += key + "=" +JSON.stringify(val);
        console.log(" ");
        console.log(msg);
        console.log(" ");
        if (utils.isLantern()) {
            utils.loraBroadcast(msg);
        }
    }

    function watchLocalDatabase() {
        db.changes({
                live: true,
                since: 'now',
                include_docs: true
            })
            .on('active', function() {
                console.log("active change feed");
            })
            .on('paused', function() {
                console.log("paused change feed");
            })
            .on('change', function (change) {
                for (var idx in change.changes) {
                    var doc = change.doc;
                    var rev = change.changes[idx].rev;
                    console.log(["======", doc._id, rev, "======"].join(" "));
                    for (var idy in doc) {

                        if (idy[0] != "_" && idy != "32" && idy != "33") {
                            processChange(doc._id,idy,doc[idy]);
                        }
                    }
                }
                // received a change
            })
            .on('error', function (err) {
                // handle errors
                console.log(err);
            });
    }

    utils.checkInternet(function(is_connected) {
        if (is_connected) {
            startCloudSync();
        }
    });

    watchLocalDatabase();
}());