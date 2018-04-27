var express = require("express");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;
var cors = require("./middleware/cors");
var rewrite = require("./middleware/rewrite");
var captive = require("./middleware/captive");
var utils = require("./lib/utils");
var PouchDB = require("./lib/pouchdb");

var serv, port, db, sync, static_path;


//----------------------------------------------------------------------------

function startServer() {
    // finally, start up server
    serv.listen(port, function() {
        db = new PouchDB(utils.getLocalDatabaseURI());
        console.log("[server] ready on port %s ...", port);
        db.info()
            .then(function(response) {
                console.log("[server] database starting doc count: " + response.doc_count);
                console.log("[server] database update sequence: " + response.update_seq);
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

function startCloudSync() {

    if (process.env.CLOUD) {
        console.log("skip sync since this is in the cloud...");
        return;
    }

    var remote_db = new PouchDB(utils.getRemoteDatabaseURI());

    sync = db.sync(remote_db, { live: true, retry: true})
        .on('change', function (change) {
            if (change.direction) {
                console.log("[server] " + change.direction  + " docs: " + 
                        change.change.docs_read + " read / " + 
                        change.change.docs_written + " written"
                    );
            }
            else {
                console.log("[server] change: ", change);
            }
        })
        .on('error', function (err) {
            console.log("err: ", err);
        });
}

function stopCloudSync() {
    if (sync) {
        sync.on('complete', function() {
            console.log("[server] cloud sync stopped");
        });
        sync.cancel();
    }
    else {
        console.log("[server] can't stop non-existing sync");
    }
}

function dbRoute() {
    var data_dir = __dirname + "/data/";
    if (!fs.existsSync(data_dir)) {
        fs.mkdirSync(data_dir);
    }
    
    return require("express-pouchdb")(PouchDB.defaults({
        prefix: data_dir,
        adapter: "websql"
    }));
}



//----------------------------------------------------------------------------

console.log("[server] starting server...");

// setup app and database server...
serv = express();
port = (process.env.TERM_PROGRAM ? 8000 : 80);
static_path = path.resolve(__dirname + "/public/");
serv.disable("x-powered-by");
serv.use(rewrite);
serv.use("/db/", cors, dbRoute());
serv.use("/", express.static(static_path));

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