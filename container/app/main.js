var express = require("express");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;
var bodyParser = require("body-parser");
var cors = require("./lib/cors-middleware");
var rewrite = require("./lib/rewrite-middleware");
var captive = require("./lib/captive-middleware");
var utils = require("./lib/utils");

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

/*
* Providing direct visibility and access to the PouchDB database through HTTP
*/
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

/*
* Serves the web application / user interface, which may be updated over time
*/
function routeStatic() {
    var static_path = path.resolve(__dirname + "/public/");
    serv.use("/", express.static(static_path));
}

/*
* API commands used by scripts, web interface and administrative users
*/
function routeCommands() {
    serv.post("/api/config/ssid", bodyParser.json(), function(req, res) {
        if (req.body.ssid && req.body.pass && req.body.pass >= 8) {
            console.log("[server] setting wireless ssid: " + req.body.ssid);
            var stdout = execSync(__dirname + "/bin/wireless register " + req.body.ssid + " " + req.body.pass);
            res.status(201).send("OK");
        }
        else {
            res.status(412).send("NOK");
        }
    });

    serv.post("/api/config/frequency", bodyParser.json(), function(req, res) {
        if (req.body.frequency) {
            try {
                var freq = Number(req.body.frequency);
                
                if (freq < 400 || freq > 950) {
                    return res.status(401).send("NOK");
                }

                console.log("[server] setting lora frequency: " + req.body.ssid);
                var stdout = execSync(__dirname + "/bin/set-frequency " + req.body.frequency);
                res.status(201).send("OK");
            }
            catch(e) {
                res.status(401).send("NOK");
                console.log(e);
            }
        }
        else {
            res.status(412).send("NOK");
        }
    });

    serv.post("/api/control/interface", function(req, res) {
        console.log("[server] checking for updated user interface");
        var stdout = execSync(__dirname + "/bin/ui-update");
        console.log("[server] latest user interface loaded");
        res.status(201).send("OK");
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
routeDatabase();
serv.use(captive);
routeCommands();
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
    })
    .catch(function(err) {
        console.log(err);
        throw new Error(err);
    });
});