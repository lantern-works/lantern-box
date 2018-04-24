var express = require("express");
var path = require("path");
var execSync = require("child_process").execSync;
var cors = require("./middleware/cors");
var rewrite = require("./middleware/rewrite");
var captive = require("./middleware/captive");
var utils = require("./lib/utils");
var PouchDB = require("./lib/pouchdb");

//----------------------------------------------------------------- App Server
var app = express();
var port = (process.env.TERM_PROGRAM ? 8000 : 80);
app.disable("x-powered-by");
var static_path = path.resolve(__dirname + "/public/");


//--------------------------------------------------------------------- Routes
app.use(rewrite);
app.use("/db/", cors, require("./routes/db"));
app.use("/", express.static(static_path));

//----------------------------------------------------------------- Initialize
console.log("[server] starting server...");

utils.checkInternet(function(is_connected) {
    if (is_connected) {
        console.log("[server] internet access: active");
        console.log("[server] checking for updated web platform");
        var stdout = execSync(__dirname + "/bin/platform-update");
        console.log("[server] latest web platform loaded");
    }
    else {
        console.log("[server] internet access: unavailable");
    }
    // connect to and setup database...
    try {
        // finally, start up server
        app.listen(port, function() {
            console.log("[server] ready on port %s ...", port);
            var db = new PouchDB(utils.getLocalDatabaseURI());
            db.info()
                .then(function(response) {
                    console.log("[stor] database starting doc count: " + response.doc_count);
                    console.log("[stor] database update sequence: " + response.update_seq);
            })
            .catch(function(err) {
                throw new Error(err);
            });
        });
    } catch (e) {
        console.log(e);
    }
});