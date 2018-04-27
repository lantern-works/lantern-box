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
    
    var db = new PouchDB(utils.getLocalDatabaseURI());

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