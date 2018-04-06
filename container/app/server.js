var express = require("express");
var path = require("path");
var cors = require("./middleware/cors");
var captive = require("./middleware/captive");
var utils = require("./lib/utils");
var Stor = require("./lib/stor");
var db_config = require("./config.json");

//----------------------------------------------------------------- App Server
var app = express();
var port = (process.env.TERM_PROGRAM ? 8000 : 80);
app.disable("x-powered-by");
var static_path = path.resolve(__dirname + "/public/");
var db_name = "lantern";
var db_prefix = "/db";

//--------------------------------------------------------------------- Routes

app.use(function(req,res,next) {
    // https://github.com/pouchdb/express-pouchdb/issues/116
    var paths = ['/_session', '/_all_dbs', '/_replicator', 
        '/_users', '/_utils', "/"+db_name];
    for (var i=0; i<paths.length; i++) {
        if (req.url.indexOf(paths[i]) ===0) {
            req.url = req.originalUrl = db_prefix + req.url;
            return next();
        }
    }
    next();
});
app.use(db_prefix, cors, require("./routes/db"));

app.use("/", express.static(static_path));

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
    db_uri += db_prefix + "/" + db_name;
    var db = new Stor(db_uri);
});