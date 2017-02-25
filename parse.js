var natural = require('natural');
var state = new natural.BayesClassifier();

state.addDocument('is qqqq open', 'open');
state.addDocument('when does qqqq close', 'close');
state.addDocument('qqq closes', 'close');

state.train();

var regex = /(does|is|will)(.+)(open|close)/gi  ;

var emitter = require('events');

exports = function(input) {
  var e = new emitter();

  var match = regex.exec(input.text);

  var query = {
    subject: match.length == 3 ? match[1] : '',
    state: state.classify(input.text)
  };

  var output = ;

  if (query.subject == '') {
    e.emit('more', {
      id: message.id,
      text: 'I\'m not sure where you mean'
    }, query);
  } else {
    e.emit('go', query);
  }

  return e;
}
