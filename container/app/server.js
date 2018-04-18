var fs = require("fs");
var express = require("express");
var path = require("path");
var execSync = require("child_process").execSync;
var yaml = require('js-yaml');

var cors = require("./middleware/cors");
var rewrite = require("./middleware/rewrite");
var captive = require("./middleware/captive");
var utils = require("./lib/utils");
var Stor = require("./lib/stor");

//----------------------------------------------------------------- App Server
var app = express();
var port = (process.env.TERM_PROGRAM ? 8000 : 80);
app.disable("x-powered-by");
var static_path = path.resolve(__dirname + "/public/");
var config_file = __dirname + "/config.yml";


//--------------------------------------------------------------------- Routes
app.use(rewrite);
app.use("/db/", cors, require("./routes/db"));
app.use("/", express.static(static_path));

//----------------------------------------------------------------- Initialize
console.log("[server] starting server...");

utils.checkInternet(function(is_connected) {

    // first, try to load latest web app...
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
        var config = yaml.safeLoad(fs.readFileSync(config_file, 'utf8'));
        var db_uri = "http://admin:"+config.DB_PASS+"@localhost:" + port;
        var db = new Stor(db_uri + "/db/lantern");

        // finally, start up server
        app.listen(port, function() {
            console.log("[server] ready on port %s ...", port);
        });

    } catch (e) {
        console.log(e);
    }


});
