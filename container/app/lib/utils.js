var dns = require("dns");

module.exports = function Utils() {

    var self = {};
    var db_domain = "lt-db-blue-1.inst.51c6516f-86f0-4ca2-9af9-7b06628881b3.us-east-1.triton.zone";


    self.getCloudAddress = function(u, p) {
        var uri = "https://" + db_domain + "/lantern"
        if (u && p) {
            uri = uri.replace("://", "://" + u + ":" + p + "@");
        }
        return uri;
    }

    self.checkInternet = function(cb) {
        dns.lookup("lantern.works",function(err) {
            if (err && err.code == "ENOTFOUND") {
                cb(false);
            } else {
                cb(true);
            }
        })
    }
   return self; 
}();