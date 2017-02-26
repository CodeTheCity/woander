var config = require('./config.json');

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var fb = require('./fbMessenger');

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

var fb_parser = new parser();
var messenger = new fb(config.facebook);

fb_parser.on('invalid', function(message) {
  // No point showing typing when we already know the reply
  var recipient = messenger.createRecipient(message.id);
  var fbMessage = messenger.createMessage(message.text);

  messenger.sendMessage(recipient, fbMessage);
})
.on('go', function(message, query) {
  var recipient = messenger.createRecipient(message.id);
  // Shows us as typing
  messenger.sendAction(recipient,'typing_on');

  // TODO: Do some async stuff here to get useful information
  var fbMessage = messenger.createMessage();
  messenger.sendMessage(recipient, fbMessage);
});

app.post('/fb_webhook', function (req, res) {
  var entries = req.body.entry;

  for (var e in entries) {
    var messages = entries[e].messaging;

    for (var m in messages) {
      // Indicate we have seen the message
      var recipient = messenger.createRecipient(messages[m].sender.id);
      messenger.sendAction(recipient, 'mark_seen');

      if (messages[m].message && messages[m].messsage.text) {
        fb_parser.run({
          id: messages[m].sender.id,
          text: messages[m].message.text
        });
      }
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

  p.on('invalid', function(message, query) {
    res.send("I'm not sure what you mean?");
    res.end();
  })
  .on('location', function(message, query) {
    res.send("Please provide me your location?");
    res.end();
  })
  .on('search', function(message, query) {
    res.send("Finding location");
    res.end();
  })
  .on('go', function(message) {
    res.send("Here's your times");
    res.end();
  })
  .run(req.body);
});

app.listen(3030);

