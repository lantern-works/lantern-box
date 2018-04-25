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

    console.log("starting to dispatch...");
    
    var sync;
    var db = new PouchDB(utils.getLocalDatabaseURI());

    function startCloudSync() {

        if (process.env.CLOUD) {
            console.log("skip sync since this is in the cloud...");
            return;
        }

        var remote_db = new PouchDB(utils.getRemoteDatabaseURI());

        sync = db.sync(remote_db, { live: true, retry: true})
            .on('change', function (change) {
                if (change.direction) {
                    console.log("[stor] " + change.direction  + " docs: " + 
                            change.change.docs_read + " read / " + 
                            change.change.docs_written + " written"
                        );
                }
                else {
                    console.log("[stor] change: ", change);
                }
            })
            .on('error', function (err) {
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
        console.log(" ");
        console.log(msg);
        console.log(" ");
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

                var msg = "";
                for (var idx in change.changes) {
                    var doc = change.doc;
                    var rev = change.changes[idx].rev;
                    console.log(["======", doc._id, rev, "======"].join(" "));
                    var params = [];
                    for (var k in doc) {
                        if (k[0] != "_" && k != "32" && k != "33") {
                            var val = doc[k];
                            if (val instanceof Array) {
                                val = val.join(",");
                            }
                            else if (typeof(val) == "object") {
                                val = JSON.stringify(val);
                            }
                            params.push(k+"="+val);
                        }
                    }

                    if (params.length) {
                        msg += doc._id + "//" + params.join("&");
                    }
                }

                // push change over distributed long-range network
                if (utils.isLantern()) {
                    utils.loraBroadcast(msg);
                }
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

    if (utils.isLantern()) {
        // let others know we are online
        utils.loraBroadcast("1");
    }

    watchLocalDatabase();

    process.stdin.resume();

    process.on('SIGINT', function () {
        if (utils.isLantern()) {
            // let others know we are online
            utils.loraBroadcast("0");
        }
        process.exit();
    });
}());