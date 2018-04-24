var path = require("path");
var fs = require("fs");
var dns = require("dns");
var yaml = require('js-yaml');
var spawn = require('child_process').spawn;

module.exports = function Utils() {

    var self = {};
    var cloud_hostname = "lt-db-blue-1.inst.51c6516f-86f0-4ca2-9af9-7b06628881b3.us-east-1.triton.zone";
    var config_file = path.resolve(__dirname + "/../config.yml");

    self.isLantern = function() {
        try {
            return fs.statSync("/boot/config.txt").isFile();
        }
        catch(err) {
            return false;
        }
    };

    self.getRemoteDatabaseURI = function() {
        var config = yaml.safeLoad(fs.readFileSync(config_file, 'utf8'));
        var db_uri = "http://" + cloud_hostname;
        return db_uri + "/db/lantern";

    };

    self.getLocalDatabaseURI = function() {
        var port = (process.env.TERM_PROGRAM ? 8000 : 80);
        var config = yaml.safeLoad(fs.readFileSync(config_file, 'utf8'));
        var db_uri = "http://admin:"+config.DB_PASS+"@localhost:" + port;
        return db_uri + "/db/lantern";
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

    self.loraBroadcast = function() {
        var program = spawn(path.resolve(__dirname + "/../bin/lora-broadcast"));

        program.stdout.on('data', function (data) {
          console.log('stdout: ' + data.toString());
        });

        program.stderr.on('data', function (data) {
          console.log('stderr: ' + data.toString());
        });

        program.on('exit', function (code) {
          console.log('child process exited with code ' + code.toString());
        });
    };
    
    return self; 
}();