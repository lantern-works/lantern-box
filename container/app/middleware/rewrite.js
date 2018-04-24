// https://github.com/pouchdb/express-pouchdb/issues/116
module.exports = function(req,res,next) {
    var paths = ['/_session', '/_all_dbs', '/_replicator', "/_uuids", 
        '/_users', '/_utils', "/lantern"];
    for (var i=0; i<paths.length; i++) {
        if (req.url.indexOf(paths[i]) ===0) {
            req.url = req.originalUrl = "/db" + req.url;
            return next();
        }
    }
    next();
};