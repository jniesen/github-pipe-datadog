var Hapi      = require('hapi'),
    server    = new Hapi.Server('0.0.0.0', '3000'),
    dogapi    = require('dogapi'),
    fs        = require('fs'),
    reqLogDir = '/srv/github_pipe_datadog/requests/',
    logLimit  = 5;

var formatCommits = function(commits) {
  var formattedText = "";

  for (var i in commits) {
    formattedText += "- " +commits[i]['message'] + "\n";
  }

  return formattedText;
};

var logPath = function(logDir) {
  var timestamp = Math.floor(new Date() / 1000);

  return logDir + timestamp + '.log'
};

var logRequest = function(request, dest) {
  var out = fs.createWriteStream(dest, {
    flags: 'w',
    mode: 0666
  });

  out.end(JSON.stringify(request));
};

var logFiles = function(logDir, callback) {
  var logs = fs.readdir(logDir, function(err, files) {
    console.log('Reading log dir.');

    if(err) throw err;

    callback(files);

    console.log('Finished reading log dir.');
  });
};

var logCount = function(logs) {
  return logs.length;
};

var logsFull = function(logCnt, maxLogs) {
  return logCnt == maxLogs;
};

var oldestLog = function(logs) {
  return logs.sort()[0];
};

var manageLogs = function(fileToDel) {
  fs.unlink(fileToDel, function(err) {
    console.log('Removing oldest log file.');

    if (err) throw err;

    console.log('Oldest log file removed.');
  });
};

server.route({
  method  : 'GET',
  path    : '/',
  handler : function(request, reply) {
    reply('Hello world');
  }
});

server.route({
  method : 'GET',
  path : '/requests',
  handler : function(req, res) {
    var requests = { requests: [] };

    var bulkRead = function(paths, callback) {
      var results = [],
          errors  = [],
          count   = paths.length;

      paths.forEach(function(path, i) {
        fs.readFile(reqLogDir + path, { encoding: 'utf8' }, function(err, data) {
          console.log('reading file');
          --count;

          if (err) { errors[i] = err };
          if (!err) { results[i] = data };

          if (!count) {
            var errArg = errors.length? errors : undefined;
            callback(errArg, results);
          }
        });
      });
    };

    logFiles(reqLogDir, function(files) {
      bulkRead(files, function(errors, data) {
        if (errors) { console.log(errors) }

        data.forEach(function(content, i) {
          var requestLog = {
            body: content
          }

          requests['requests'][i] = requestLog;
        });

        res(requests);
      });
    });
  }
});

server.route({
  method  : 'POST',
  path    : '/pushEvent',
  handler : function(req, res) {
    var dd     = new dogapi(),
        push   = JSON.parse(req.payload['payload']);

    logFiles(reqLogDir, function(files) {
      var logCnt = logCount(files);
      if (logsFull(logCnt, logLimit)) {
        manageLogs(oldestLog(logs));
      }
    });

    logRequest(push, logPath(reqLogDir));

    var pusher  = push['pusher']['name'],
        app     = push['repository']['name'],
        repo    = push['repository']['organization'] + '/' + app,
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

