var fs = require("fs");
var PouchDB = require("../lib/pouchdb");

module.exports = function DatabaseRoute() {
    
    var data_dir = __dirname + "/../data/";
    if (!fs.existsSync(data_dir)) {
        fs.mkdirSync(data_dir);
    }
    
    return require("express-pouchdb")(PouchDB.defaults({
        prefix: data_dir,
        adapter: "websql"
    }));
}();