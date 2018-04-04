var dns = require("dns");

module.exports = function Utils() {

    var self = {};
    var db_domain = "paperequator.cloudant.com";


    self.getCloudAddress = function(u, p) {
        var uri = "https://" + db_domain + "/lantern"
        if (u && p) {
            uri = uri.replace("://", "://" + u + ":" + p + "@");
        }
        return uri;
    }

    self.checkInternet = function(cb) {
        dns.lookup(db_domain,function(err) {
            if (err && err.code == "ENOTFOUND") {
                cb(false);
            } else {
                cb(true);
            }
        })
    }
   return self; 
}();