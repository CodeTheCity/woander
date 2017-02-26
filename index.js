var config = require('./config.json');

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var fb = require('./fbMessenger');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('tiny'))

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

var gmaps = require('./information');

fb_parser.on('invalid', function(message) {
  // No point showing typing when we already know the reply
  var recipient = messenger.createRecipient(message.id);
  var fbMessage = messenger.createMessage(message.text);

  messenger.sendMessage(recipient, fbMessage);
})
.on('location', function(message) {
    // No point showing typing when we already know the reply
    var recipient = messenger.createRecipient(message.id);
    var fbMessage = messenger.createMessage(message.text, false, messenger.createQuickReplies(['location']));

    messenger.sendMessage(recipient, fbMessage);
})
.on('search', function(message) {
  gmaps.location(message.text, function(data) {
    message.location = data;
    fb_parser.run(message);
  })
})
.on('go', function(message, query) {
  var recipient = messenger.createRecipient(message.id);
  // Shows us as typing
  messenger.sendAction(recipient,'typing_on');

  // Do some async stuff here to get useful information
  gmaps.details(query.subject, query.location.lng, query.location.lat, function(data) {
    var text = "";

    if (data && data.length > 0) {
      text += data[0].name + " is " + (data[0].times.open_now ? "open" : "closed");
    }

    var fbMessage = messenger.createMessage(text);
    messenger.sendMessage(recipient, fbMessage);
  });
});

app.post('/fb_webhook', function (req, res) {
  var entries = req.body.entry;

  for (var e in entries) {
    var messages = entries[e].messaging;

    for (var m in messages) {
      // Indicate we have seen the message
      var recipient = messenger.createRecipient(messages[m].sender.id);
      messenger.sendAction(recipient, 'mark_seen');

      if (messages[m].message && messages[m].message.text) {
        fb_parser.run({
          id: messages[m].sender.id,
          text: messages[m].message.text,
          type: 'fb'
        });
      } else if(messages[m].messeage && messages[m].message.attachments){
        var attachments = messages[m].message.attachments;
        attachments.forEach(function(item) {
          var reply;
          switch(item.type){
             case 'location':
              // Use the location
              fb_parser.run({
                id: messages[m].sender.id,
                location: {
                  lat: item.payload.coordinates.lat,
                  lng: item.payload.coordinates.long
                },
                type: 'fb'
              });

              break;
            default:
              reply = messenger.createMessage("We currently cannot handle this attachment, sorry.");
              messenger.sendMessage(recipient, reply);
              break;
          }
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

