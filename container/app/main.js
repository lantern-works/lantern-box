var express = require("express");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;
var cors = require("./middleware/cors");
var rewrite = require("./middleware/rewrite");
var captive = require("./middleware/captive");
var utils = require("./lib/utils");
var PouchDB = require("./lib/pouchdb");
var CloudSync = require("./lib/cloud-sync");
var RadioPush = require("./lib/radio-push");

var serv, port, db, static_path;


//----------------------------------------------------------------------------

function startServer() {
    // finally, start up server
    serv.listen(port, function() {
        db = new PouchDB(utils.getLocalDatabaseURI());
        var push = RadioPush(db);
        //var sync = CloudSync(db);

        console.log("[server] ready on port %s ...", port);
        db.info()
            .then(function(response) {
                console.log("[server] database starting doc count: " + response.doc_count);
                console.log("[server] database update sequence: " + response.update_seq);
                push.start();
                // console.log("[server] attempting cloud sync");
                // sync.start();

        })
        .catch(function(err) {
            throw new Error(err);
        });
    });
}

function updateWebPlatform() {
    console.log("[server] internet access: active");
    console.log("[server] checking for updated web platform");
    var stdout = execSync(__dirname + "/bin/platform-update");
    console.log("[server] latest web platform loaded");
}

function dbRoute() {
    var data_dir = __dirname + "/db/";
    if (!fs.existsSync(data_dir)) {
        fs.mkdirSync(data_dir);
    }
    
    return require("express-pouchdb")(PouchDB.defaults({
        prefix: data_dir,
        adapter: "websql"
    }), {
        configPath: "./db/db-conf.json",
        logPath: "./db/db-log.txt"
    });
}



//----------------------------------------------------------------------------

// setup app and database server...
serv = express();
port = (process.env.TERM_PROGRAM ? 8080 : 80);
static_path = path.resolve(__dirname + "/public/");
serv.disable("x-powered-by");
serv.use(rewrite);
serv.use("/db/", cors, dbRoute());
serv.use("/", express.static(static_path));


console.log("============================");
console.log("  Lantern HTTP Service");
console.log("  Device ID = " + utils.getLanternID());
console.log("============================");


// download latest version of web app platform...
utils.checkInternet(function(is_connected) {
    if (is_connected) {
        updateWebPlatform();
    }
    else {
        console.log("[server] internet access: unavailable");
    }

    // start the web and database server...
    try {
        startServer();
    } catch (e) {
        console.log(e);
        process.exit();
    }
});