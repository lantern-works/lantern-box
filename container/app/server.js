console.log("starting up database server...");


var PouchDB = require('pouchdb-core')
    .plugin(require('pouchdb-adapter-node-websql'))
    .plugin(require('pouchdb-adapter-http'))
    .plugin(require('pouchdb-mapreduce'))
    .plugin(require('pouchdb-replication'));

var express = require("express");
var path = require("path");
var fs = require("fs");


var data_dir = __dirname + "/data/";

if (!fs.existsSync(data_dir)) {
    fs.mkdirSync(data_dir);
}

var LanternDB = PouchDB.defaults({
    prefix: data_dir,
    adapter: "websql"
});

var app = express();
var port = (process.env.TERM_PROGRAM ? 8000 : 80);
app.disable("x-powered-by");

//------------------------------------ Captive Portal
app.get("/", function(req,res) {
    res.sendFile(path.resolve(__dirname + "/public/index.html"));
});

var static_path = path.resolve(__dirname + "/public/static");
app.use("/static", express.static(static_path));


var cors = function(req, res, next) {
    if (!process.env.ORIGINS) {
        return next();
    }
    var allowedOrigins = process.env.ORIGINS.split(",");
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, authorization, content-type, origin, referer, x-csrf-token');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
};

//------------------------------------ PouchDB
app.use("/", cors, require("express-pouchdb")(LanternDB));


//------------------------------------ Initialize
app.listen(port, function() {
    console.log("lantern server is ready on port %s ...", port);

    // make sure we have the database to work with
    console.log("setting up database...");
    var db_config = require("./config.json");
    var db_uri = "http://admin:"+db_config.admins.admin+"@localhost:" + port;
    var my_db = new PouchDB(db_uri + "/lantern");
    my_db.info().then(function(response) {
        console.log("database info:");
        console.log(response);
    });
});