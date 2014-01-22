var http = require('http');

var databaseUrl = "blackhole"; // "username:password@example.com/mydb"
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

          if (!('email' in data) ||
              !('canonical' in data) ||
              !('source' in data) ||
              !('datetime') in data) {
            console.log("[400] " + req.method + " to " + req.url);
            res.writeHead(400, "Missing required field", {'Content-Type': 'text/html'});
            res.end('<html><head><title>405 - Missing required field</title></head><body><h1>Method not supported.</h1></body></html>');
          } else {
            // empty 200 OK response for now
            res.writeHead(200, "OK", {'Content-Type': 'text/html'});
            res.end();
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