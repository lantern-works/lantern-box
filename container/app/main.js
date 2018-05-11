var express = require("express");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;
var bodyParser = require("body-parser");
var cors = require("./lib/cors-middleware");
var rewrite = require("./lib/rewrite-middleware");
var captive = require("./lib/captive-middleware");
var utils = require("./lib/utils");
var RadioPush = require("./lib/radio-push");

var PouchDB, db, serv, port;



//----------------------------------------------------------------------------
/*
* Set up database server
*/
// custom build of PouchDB to meet our SQLite requirements
PouchDB = require('pouchdb-core')
            .plugin(require('pouchdb-adapter-node-websql'))
            .plugin(require('pouchdb-adapter-http'))
            .plugin(require('pouchdb-mapreduce'))
            .plugin(require('pouchdb-replication'));

db = new PouchDB(utils.getLocalDatabaseURI());



//----------------------------------------------------------------------------


function routeDatabase() {
    var data_dir = __dirname + "/db/";
    if (!fs.existsSync(data_dir)) {
        fs.mkdirSync(data_dir);
    }
    var db_router = require("express-pouchdb")(PouchDB.defaults({
        prefix: data_dir,
        adapter: "websql"
    }), {
        configPath: "./db/db-conf.json",
        logPath: "./db/db-log.txt"
    });
    serv.use("/db/", db_router);
}

function routeStatic() {
    var static_path = path.resolve(__dirname + "/public/");
    serv.use("/", express.static(static_path));
}


function routeCommands() {
    serv.post("/api/network", bodyParser.json(), function(req, res) {
        if (req.body.ssid && req.body.pass) {
            //@todo require 8 characters or greater
            console.log("[server] setting wireless network: " + req.body.ssid);
            var stdout = execSync(__dirname + "/bin/wireless register " + req.body.ssid + " " + req.body.pass);
            res.status(201).send("OK");            
        }
    });

    serv.post("/api/interface", function(req, res) {
        console.log("[server] internet access: active");
        console.log("[server] checking for updated web platform");
        var stdout = execSync(__dirname + "/bin/platform-update");
        console.log("[server] latest web platform loaded");
    });
}



//----------------------------------------------------------------------------
/*
* Set up application server and routing
*/
serv = express();
serv.disable("x-powered-by");
serv.use(rewrite);
serv.use(cors);
routeCommands();
routeDatabase();
routeStatic();

console.log("============================");
console.log("  Lantern HTTP Service");
console.log("  Device ID = " + utils.getLanternID());
console.log("============================");

// start up server
port = (process.env.TERM_PROGRAM ? 8080 : 80);
serv.listen(port, function() {
    console.log("[server] ready on port %s ...", port);
    db.info()
        .then(function(response) {
            console.log("[server] database starting doc count: " + response.doc_count);
            console.log("[server] database update sequence: " + response.update_seq);
            var push = RadioPush(db);
            push.start();

    })
    .catch(function(err) {
        console.log(err);
        throw new Error(err);
    });
});