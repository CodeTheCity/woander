var regex = /(does|is|will)(.+)(open|close)/ig;

var EventEmitter = require('events');

class Parser extends EventEmitter {
  run(input) {
    regex.lastIndex = 0;
    var match = regex.exec(input.text);

    if (match == null) {
      this.emit('more', {
        id: input.id,
        text: 'I\'m not sure what you mean?'
      });

      return;
    }

    var query = {
      subject: match[2].trim(),
      state: match[3].trim()
    };

    this.emit('go', { id: input.id }, query);
  }
}

module.exports = Parser;
