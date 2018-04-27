var PouchDB = require("./pouchdb");
var utils = require("./utils");

module.exports = function CloudSync(db) {
    var self = {};

    self.start = function() {

        if (process.env.CLOUD) {
            console.log("skip sync since this is in the cloud...");
            return;
        }

        var remote_db = new PouchDB(utils.getRemoteDatabaseURI());

        sync = db.sync(remote_db, { live: true, retry: true})
            .on('change', function (change) {
                if (change.direction) {
                    console.log("[cloud] " + change.direction  + " docs: " + 
                            change.change.docs_read + " read / " + 
                            change.change.docs_written + " written"
                        );
                }
                else {
                    console.log("[cloud] change: ", change);
                }
            })
            .on('error', function (err) {
                console.log("err: ", err);
            });
    };

    self.stop = function() {
        if (sync) {
            sync.on('complete', function() {
                console.log("[cloud] cloud sync stopped");
            });
            sync.cancel();
        }
        else {
            console.log("[cloud] can't stop non-existing sync");
        }
    };

    return self;
};