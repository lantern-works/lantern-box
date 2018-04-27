var PouchDB = require("./pouchdb");
var utils = require("./utils");

module.exports = function RadioPush(db) {

    var self = {};

    function onChange(change) {
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
        console.log("[radio] push message: " + msg);
        // push change over distributed long-range network
        if (utils.isLantern()) {
            utils.queueMessageForRadio(msg);
        }
    }

    self.start = function() {
        if (process.env.CLOUD) {
            console.log("skip push since this is in the cloud...");
            return;
        }
        console.log("[radio] watching for changes...");
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
            .on('change', onChange)
            .on('error', function (err) {
                console.log(err);
            });
    };

    self.stop = function() {
    };

    return self;
};
