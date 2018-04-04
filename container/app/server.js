var express = require("express");
var path = require("path");
var cors = require("./middleware/cors");
var Stor = require("./lib/stor");
var db_config = require("./config.json");

//----------------------------------------------------------------- App Server
console.log("starting up database server...");
var app = express();
var port = (process.env.TERM_PROGRAM ? 8000 : 80);
app.disable("x-powered-by");
var static_path = path.resolve(__dirname + "/public/static");


//--------------------------------------------------------------------- Routes
app.get("/", cors, function(req,res) {
    res.sendFile(path.resolve(__dirname + "/public/index.html"));
});
app.use("/static", express.static(static_path));
app.use("/", cors, require("./routes/db"));


//----------------------------------------------------------------- Initialize
app.listen(port, function() {
    console.log("lantern server is ready on port %s ...", port);
    var db_uri = "http://admin:"+db_config.admins.admin+"@localhost:" + port;
    var db = new Stor(db_uri + "/lantern");
});