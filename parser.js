var regex = /(does|is|will)(.+)(open|close)/ig;

var emitter = require('events');

class Parser {
  constructor() {
    this.e = new emitter();
  }

  get emitter() {
    return this.e;
  }

  run(input) {
    regex.lastIndex = 0;
    var match = regex.exec(input.text);

    if (match == null) {
      this.e.emit('more', {
        id: input.id,
        text: 'I\'m not sure what you mean?'
      });

      return;
    }

    var query = {
      subject: match[2].trim(),
      state: match[3].trim()
    };

    this.e.emit('go', query);
  }
}

module.exports = Parser;
