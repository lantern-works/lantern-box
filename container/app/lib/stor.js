var PouchDB = require("./pouchdb");
var utils = require("./utils");

module.exports = function Stor(uri) {

    var sync;
    var remote_db = new PouchDB(utils.getCloudAddress());
    var local_db = new PouchDB(uri);

    var self = {
        startSync: function() {

            if (process.env.CLOUD) {
                console.log("[stor] skip sync since this is in the cloud...");
                return;
            }

            sync = local_db.sync(remote_db, {
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
                console.log("[stor] paused sync... no internet?");
            }).on('active', function (info) {
                console.log("[stor] resumed sync... internet is back?");
            }).on('error', function (err) {
                console.log("[stor] err: ", err);
            })
        },
        stopSync: function() {
            if (sync) {
                sync.on('complete', function() {
                    console.log("[stor] cloud sync stopped");
                });
                sync.cancel();
            }
            else {
                console.log("[stor] can't stop non-existing sync");
            }
        }
    };

    // optimistically start sync with cloud
    // even if we don't have internet access  
    local_db.info().then(function(response) {
        console.log("[stor] database starting doc count: " + response.doc_count);
        console.log("[stor] database update sequence:" + response.update_seq);
        self.startSync();
    });

    return self;
};
