var fs = require("fs");
var PouchDB = require("../lib/pouchdb");

module.exports = function DatabaseRoute() {
    
    var data_dir = __dirname + "/../data/";
    if (!fs.existsSync(data_dir)) {
        fs.mkdirSync(data_dir);
    }

    var LanternDB = PouchDB.defaults({
        prefix: data_dir,
        adapter: "websql"
    });

    return require("express-pouchdb")(LanternDB);
}();