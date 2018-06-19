var bodyParser = require("body-parser");
var execSync = require("child_process").execSync;
var path = require("path");

module.exports = function APIRoutes(serv) {

    var wireless_bin = path.resolve(__dirname, "../bin", "wireless");
    var frequency_bin = path.resolve(__dirname, "../bin", "set-frequency");

    serv.post("/api/config/ssid", bodyParser.json(), function(req, res) {
        if (req.body.ssid && req.body.pass && req.body.pass >= 8) {
            console.log("[server] setting wireless ssid: " + req.body.ssid);
            var stdout = execSync(wireless_bin + " register " + req.body.ssid + " " + req.body.pass);
            res.status(201).send("OK");
        }
        else {
            res.status(412).send("NOK");
        }
    });

    serv.post("/api/config/frequency", bodyParser.json(), function(req, res) {
        if (req.body.frequency) {
            try {
                var freq = Number(req.body.frequency);
                
                if (freq < 400 || freq > 950) {
                    return res.status(401).send("NOK");
                }

                console.log("[server] setting lora frequency: " + req.body.ssid);
                var stdout = execSync(frequency_bin + " " + req.body.frequency);
                res.status(201).send("OK");
            }
            catch(e) {
                res.status(401).send("NOK");
                console.log(e);
            }
        }
        else {
            res.status(412).send("NOK");
        }
    });

};