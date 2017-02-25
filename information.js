var config = require('./config.json');

var googleMapsClient = require('@google/maps').createClient({
  key: config.google_map_api_key
});
