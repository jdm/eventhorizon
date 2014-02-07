var fs = require('fs');
var http = require('http');
var request = require('request');
var databaseUrl = process.env.MONGO_URL || "blackhole"; // "username:password@example.com/mydb"
var collections = ["contributions"];
var db = require("mongojs").connect(databaseUrl, collections);

var port = Number(process.env.PORT || 8080);

http.createServer(function (req, res) {
  // set up some routes
  switch(req.url) {
    case '/submit':
      if (req.method == 'POST') {
        console.log("[200] " + req.method + " to " + req.url);
        var fullBody = '';
        req.on('data', function(chunk) {
          fullBody += chunk.toString();
        });
        req.on('end', function() {
          var data = JSON.parse(fullBody);

          var properties = Object.getOwnPropertyNames(data);
          var expected = ["email", "canonical", "source", "datetime", "extra"];
          while (properties.length) {
            var idx = expected.indexOf(properties[0]);
            if (idx != -1) {
              properties.shift();
              expected.splice(idx, 1);
            } else {
              break;
            }
          }

          if (expected.length) {
            console.log("[400] " + req.method + " to " + req.url);
            res.writeHead(400, "Missing required field", {'Content-Type': 'text/html'});
            res.end('<html><head><title>400 - Missing required field</title></head><body><h1>Missing required field: ' + expected[0] + '.</h1></body></html>');
          } else if (properties.length) {
            console.log("[400] " + req.method + " to " + req.url);
            res.writeHead(400, "Unexpected field", {'Content-Type': 'text/html'});
            res.end('<html><head><title>400 - Unexpected field</title></head><body><h1>Unexpected field: ' + properties[0] + '.</h1></body></html>');
          } else {
            fs.readFile('emails.lst', 'utf8', function(error, body) {
              if (!error) {
                var emails = body.split('\n');
                data.volunteer = emails.indexOf(data.email) == -1;
                db.contributions.save(data, function(err, saved) {
                  if (err || !saved) {
                    console.log("[500] " + req.method + " to " + req.url);
                    res.writeHead(500, "Error saving submission", {'Content-Type': 'text/html'});
                    res.end('<html><head><title>500 - Error saving submission</title></head><body><h1>Method not supported.</h1></body></html>');
                  } else {
                    // empty 200 OK response for now
                    res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                    res.end();
                  }
                });
              } else {
                console.log("[500] " + req.method + " to " + req.url);
                res.writeHead(500, "Error retrieving emails.", {'Content-Type': 'text/html'});
                res.end('<html><head><title>500 - Error retrieving emails.</title></head><body><h1>Method not supported.</h1></body></html>');
              }
            });
          }
        });
      } else {
        console.log("[405] " + req.method + " to " + req.url);
        res.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
        res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
      }
      break;
    default:
      res.writeHead(404, "Not found", {'Content-Type': 'text/html'});
      res.end('<html><head><title>404 - Not found</title></head><body><h1>Not found.</h1></body></html>');
      console.log("[404] " + req.method + " to " + req.url);
  };
}).listen(port); // listen on tcp port 8080 (all interfaces)