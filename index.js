var express = require('express'),
    app = express();

app.get('/', function(req, res) {
  res.send('Hello');
});

var server = app.listen(3000, function() {
  var host = server.address().address,
      port = server.address().port;

  console.log('github | datadog is listening at http://%s:%s', host, port);
});

