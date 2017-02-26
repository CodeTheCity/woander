var config = require('./config.json');

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var fb = require('./FbMessenger');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('tiny'))

var request = require('request');

var parser = require('./parser');

var verify_token = config.facebook.verify;

app.get('/fb_webhook', function (req, res) {
    if (req.query['hub.verify_token'] === verify_token) {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
});

var response_facebook = function(message) {
  request.post({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      'access_token': config.facebook.access
    },
    json: true,
    body: {
      recipient: {
        id: message.id
      },
      message: {
        text: message.text
      }
    }
  }, function(err, data) {
    console.log(err);
    console.log(data);
  });
};

app.post('/fb_webhook', function (req, res) {
  var entries = req.body.entry;
  var p = new parser();
  var messenger = new fb(config.facebook);

  p.emitter.on('more', function(message) {
    var recipient = messenger.createRecipient(message.id);
    var fbMessage = messenger.createMessage(message.text);
    messenger.sendMessage(recipient, fbMessage);
  });

  p.emitter.on('go', function(message, query) {
    var recipient = messenger.createRecipient(message.id);
    var fbMessage = messenger.createMessage("You searched for " + query.subject + " " + query.state + " times");
    messenger.sendMessage(recipient, fbMessage);
  });

  for (var e in entries) {
    var messages = entries[e].messaging;

    for (var m in messages) {
      // Shows us as typing
      messenger.sendAction(messages[m].sender.id,'typing_on');

      p.run({
        id: messages[m].sender.id,
        text: messages[m].message.text
      });
    }
  }


  res.end();
});

// {
//   id: 12212,
//   text: "when is this closing"
// }

app.post('/webhook', function(req, res) {
  var p = new parser();
  console.log(req.body);

  p.emitter.on('more', function(message) {
    res.send(message);
    res.end();
  });

  p.emitter.on('go', function(message, query) {
    res.send(query);
    res.end();
  });

  p.run(req.body);
});

app.listen(3030);

