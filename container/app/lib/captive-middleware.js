module.exports = function(req, res, next) { 
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("[server] request from: " + ip);
    console.log("[server] url = " + req.url);
    var agent = req.headers['user-agent'];
    if (agent) {
        console.log("[server] agent = " + agent);
    }

    // ios
    if (agent && agent.indexOf("CaptiveNetworkSupport") !== -1) {
        console.log("[server] hotspot redirect");
        res.redirect("/welcome.html");
    }
    else {
        return next();
    }
};