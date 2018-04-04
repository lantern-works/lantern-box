var express = require("express");
var path = require("path");
var cors = require("./middleware/cors");
var utils = require("./lib/utils");
var Stor = require("./lib/stor");
var db_config = require("./config.json");

//----------------------------------------------------------------- App Server
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
console.log("[server] starting server...");

utils.checkInternet(function(is_connected) {
    if (is_connected) {
        console.log("[server] internet access: active");
    }
    else {
        console.log("[server] internet access: unavailable");
    }
})

app.listen(port, function() {
    console.log("[server] ready on port %s ...", port);
    var db_uri = "http://admin:"+db_config.admins.admin+"@localhost:" + port;
    var db = new Stor(db_uri + "/lantern");
});