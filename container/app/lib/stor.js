var PouchDB = require("./pouchdb");

module.exports = function Stor(uri) {

    var sync;
    var remote_creds = "antsellyzonessedgediduch:7d816bafd3bb33d9bc6269f0361fab9ebf0db3a2";
    var remote_uri = "https://" + remote_creds + "@paperequator.cloudant.com/lantern";
    var remote_db = new PouchDB(remote_uri);
    var local_db = new PouchDB(uri);

    var self = {
        startSync: function() {
            sync = local_db.sync(remote_db, {
              live: true
            }).on('change', function (change) {
                console.log(change);
              // yo, something changed!
            }).on('error', function (err) {
                console.log(err);
              // yo, we got an error! (maybe the user went offline?)
            }).on('complete', function() {
                console.log("complete");
            })
        },
        stopSync: function() {
            sync.cancel();
        }
    };

    // optimistically start sync with cloud
    // even if we don't have internet access  
    local_db.info().then(function(response) {
        console.log("database info:");
        console.log(response);
        self.startSync();
    });

    return self;
};
