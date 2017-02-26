var regex = /(does|is|will)(.+)(open|close)/ig;
var locationRegex = /(in|on)(.+)/ig;

var EventEmitter = require('events');
var levelup = require('level');

var db = levelup('./session.db');

class Parser extends EventEmitter {
  run(input) {
    var self = this;

    db.get(input.type + input.id, function(err, data) {
      if (err) {
        if(err.notFound) {
          self.parse.call(self, input, null);
        } else {
          console.error(err); // Bad things have happened
        }
      } else {
        var session = JSON.parse(data);
        self.parse.call(self, input, session);
      }
    });
  }

  parse(input, session) {
    if (session == null) {
      regex.lastIndex = 0;
      var match = regex.exec(input.text);

      if (match == null) {
        input.text = "I am not sure what you mean";
        this.emit('invalid', input);
      } else {
        var query = {
          subject: match[2].trim(),
          state: match[3].trim()
        };

        db.put(input.type + input.id, JSON.stringify(query), function(err) {
          if (err) {
            console.error(err); // Bad things have happened
          }
        });

        input.text = "Can you send me your locaton?";
        this.emit('location', input, query);
      }
    } else {
      if (input.location) {
        db.del(input.type + input.id, function(err) {
          if (err) {
            console.error(err);
          }
        });

        session.location = input.location;

        this.emit('go', input, session);
      } else {
        this.emit('search', input, session);
      }
    }
  }
}

module.exports = Parser;
