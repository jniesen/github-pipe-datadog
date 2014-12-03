var Hapi   = require('hapi'),
    server = new Hapi.Server('0.0.0.0', '3000'),
    dogapi = require('dogapi');

server.route({
  method  : 'GET',
  path    : '/',
  handler : function(request, reply) {
    reply('Hello world');
  }
});

var formatCommits = function(commits) {
  var formattedText = "";

  for (var i in commits) {
    formattedText += "- " +commits[i]['message'] + "\n";
  }

  return formattedText;
}

server.route({
  method  : 'POST',
  path    : '/pushEvent',
  handler : function(req, res) {
    var dd     = new dogapi(),
        push   = req.payload;

    var pusher  = push['pusher']['name'],
        app     = push['repository']['name'],
        repo    = push['repository']['full_name'],
        commits = push['commits'];

    var event = {
      'title'      : pusher + " pushed to " + repo,
      'text'       : formatCommits(commits),
      'priority'   : 'normal',
      'alert_type' : 'info',
      'tags'       : [
          'application:'+app,
          'github',
          'type:push'
      ],
      'source_type_name' : 'git'
    };

    dd.add_event(event, function(error, result, status_code) {
      if (error) {
        res('There was an issue sending your event.');
        console.log('Error: ', error);
        console.log('Status: ', status_code);
        return;
      }

      if (status_code == 202) {
        res(result);
        return;
      }
    });
  }
});

server.start(function() {
  console.log('github | datadog is listening at %s', server.info.uri);
});

