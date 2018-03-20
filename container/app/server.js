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
}, {
    couchConfig: {
        bind: "0.0.0.0"
    }
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


//------------------------------------ PouchDB
app.use("/", require("express-pouchdb")(LanternDB));


//------------------------------------ Initialize
console.log("starting lantern server on port %s ...", port);
app.listen(port);