module.exports = function Cors(req, res, next) {
  
    process.env.ORIGINS = process.env.ORIGINS +",http://localhost:3000";
    var allowed_origins = process.env.ORIGINS.split(",");
    var origin = req.headers.origin;
    if(allowed_origins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, authorization, content-type, origin, referer, x-csrf-token');
    res.header('Access-Control-Allow-Credentials', true);


    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      //respond with 200
      res.status(200).send();
    }
    else {
    //move on
      next();
    }
};