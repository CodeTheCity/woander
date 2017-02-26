var async = require('async');

var config = require('./config.json');
var key = config.google.api_key;

var googleMaps = require('@google/maps').createClient({
    key: key
});

function getDetails(query, long, lat, callback) {
    googleMaps.places({
        query: query,
        location: [long, lat],
    }, function (err, response) {
        if (!err) {
            var results = response.json.results;

            if (!results || results.length == 0) {
                callback([]);
                return;
            }

            async.map(results, function (result, cb) {
                getPlaceInformation(result.place_id, function (data) {
                    var address = data.formatted_address;
                    var times = data.opening_hours;

                    cb(null, {
                        name: data.name,
                        address: address,
                        times: times
                    });
                });
            }, function (err, result) {
                callback(result);
            });
        }
    });
}

function getPlaceInformation(id, callback) {
    googleMaps.place({
        placeid: id
    }, function (err, response) {
        if (!err) {
            callback(response.json.result);
        }
    });
}

function getLocation(location, callback) {
    googleMaps.geocode({
        address: location
    }, function (err, response) {
        if (!err) {
            callback(response.json.results[0].geometry.location);
        }
    });
}

module.exports = {
    details: getDetails,
    location: getLocation
};