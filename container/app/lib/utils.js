var path = require("path");
var fs = require("fs");
var dns = require("dns");
var yaml = require('js-yaml');

module.exports = function Utils() {

    var self = {};
    var cloud_hostname = "lt-db-blue-1.inst.51c6516f-86f0-4ca2-9af9-7b06628881b3.us-east-1.triton.zone";
    var default_db_pass = "wins";
    var config_file = path.resolve(__dirname + "/../config.yml");
    var config = config || yaml.safeLoad(fs.readFileSync(config_file, 'utf8'));

    self.isLantern = function() {
        try {
            return fs.statSync("/boot/config.txt").isFile();
        }
        catch(err) {
            return false;
        }
    };

    self.getRemoteDatabaseURI = function() {
        var db_uri = "http://" + cloud_hostname;
        return db_uri + "/db/lantern";

    };

    self.getLocalDatabaseURI = function() {
        var port = (process.env.TERM_PROGRAM ? 8080 : 80);
        var pass = config.DB_PASS || default_db_pass;
        var db_uri = "http://admin:"+pass+"@localhost:" + port;
        return db_uri + "/db/lantern";
    };

    self.getRadioFrequency = function() {
        return config.FREQUENCY || 924.68;
    };

    self.checkInternet = function(cb) {
        dns.lookup("lantern.works",function(err) {
            if (err && err.code == "ENOTFOUND") {
                cb(false);
            } else {
                cb(true);
            }
        });
    };

    self.getLanternID = function() {
        if (config.hasOwnProperty("LANTERN_ID")) {
            return config.LANTERN_ID;
        }
    };


    self.startCloudSync = function() {

        if (process.env.CLOUD) {
            console.log("skip sync since this is in the cloud...");
            return;
        }

        var remote_db = self.makeRemotePouchDB();

        var sync = db.sync(remote_db, { live: true, retry: true})
            .on('change', function (change) {
                if (change.direction) {
                    console.log("[utils] " + change.direction  + " docs: " + 
                            change.change.docs_read + " read / " + 
                            change.change.docs_written + " written"
                        );
                }
                else {
                    console.log("[utils] change: ", change);
                }
            })
            .on('error', function (err) {
                console.log("err: ", err);
            });
    };

    return self; 
}();
