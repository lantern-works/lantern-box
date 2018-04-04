module.exports = function Cors(req, res, next) {
    if (!process.env.ORIGINS) {
        return next();
    }
    var allowedOrigins = process.env.ORIGINS.split(",");
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, authorization, content-type, origin, referer, x-csrf-token');
    res.header('Access-Control-Allow-Credentials', true);


    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      //respond with 200
      res.send(200);
    }
    else {
    //move on
      next();
    }
};