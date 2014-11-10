var express = require('express'),
    app     = express(),
    dogapi  = require('dogapi');

app.get('/', function(req, res) {
  res.send('Hello');
});

app.post('/pushEvent', function(req, res) {
  var dd = new dogapi();

  var event = {
    'title' : 'Testing',
    'text'  : 'Only a test.'
  };

  console.log('Event received: ', event);

  dd.add_event(event, function(error, result, status_code) {
    if (error) {
      res.send('There was an issue creating your event.');
      console.log('Error: ', error);
      console.log('Status: ', status_code);
      return;
    }

    if (status_code == 200) {
      console.log('Result: ', result);
      res.send('Event created');
      return;
    }
  });
});

var server = app.listen(3000, function() {
  var host = server.address().address,
      port = server.address().port;

  console.log('github | datadog is listening at http://%s:%s', host, port);
});

