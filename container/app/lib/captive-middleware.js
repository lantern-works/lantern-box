module.exports = function(req, res, next) { 
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];

    console.log("[server] request from: " + ip + " (" + agent + ")");

    // ios
    if (agent.indexOf("CaptiveNetworkSupport") !== -1) {
        res.redirect("/static/hotspot.html");
    }
    else {
        return next();
    }
};