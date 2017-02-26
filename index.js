var config = require('./config.json');

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('tiny'))

var verify_token = config.facebook_verify_token;

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === verify_token) {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');
    }
});

app.post('/webhook', function (req, res) {
  console.log(req.body);
  res.end();
});

app.listen(3030);

