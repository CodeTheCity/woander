var regex = /(does|is|will)(.+)(open|close)/ig;
var locationRegex = /(in|on)(.+)/ig;

var EventEmitter = require('events');
var levelup = require('level');

var db = levelup('./session.db', {
  json: true
});

class Parser extends EventEmitter {
  run(input) {
    var self = this;

    db.get(input.type + input.id, function(err, session) {
      if (err) {
        if(err.notFound) {
          self.parse.call(self, input, null);
        } else {
          console.error(err); // Bad things have happened
        }
      } else {
        self.parse.call(self, input, session);
      }
    });
  }

  parse(input, session) {
    if (session == null) {
      regex.lastIndex = 0;
      var match = regex.exec(input.text);

      if (match == null) {
        this.emit('invalid', input);
      } else {
        var query = {
          subject: match[2].trim(),
          state: match[3].trim()
        };

        db.put(input.type + input.id, query, function(err) {
          if (err) {
            console.error(err); // Bad things have happened
          }
        });

        this.emit('location', input, query);
      }
    } else {
      if (input.location) {
        db.del(input.type + input.id, function(err) {
          if (err) {
            console.error(err);
          }
        });

        this.emit('go', input, session);
      } else {
        this.emit('search', input, session);
      }
    }
  }
}

module.exports = Parser;
