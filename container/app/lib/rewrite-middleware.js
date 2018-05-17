// https://github.com/pouchdb/express-pouchdb/issues/116
module.exports = function(req,res,next) {

    // PouchDB web admin may need access to some or all of these at the root
    var paths = ['/_session', '/_all_dbs', '/_replicator', "/_uuids", 
        '/_users', '/_utils', "/_active_tasks", "/lantern"];

    // if we're requesting one of these, make sure to prefix with "/db"
    for (var i=0; i<paths.length; i++) {
        if (req.url.indexOf(paths[i]) === 0) {
            
            // make sure we have trailing slash for certain paths
            if (req.url == "/_utils") {
                res.redirect(301, req.url+"/");
            }
            else {
                req.url = req.originalUrl = "/db" + req.url;
                return next();
            }
        }
    }
    next();
};