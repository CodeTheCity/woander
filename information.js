var async = require('async');

var config = require('./config.json');
var key = config.google.api_key;

var googleMaps = require('@google/maps').createClient({
    key: key
});

function getDetails(query, long, lat, callback) {
    googleMaps.placesNearby({
        keyword: query,
        location: [long, lat],
        rankby: 'distance'
    }, function (err, response) {
        if (!err) {
            var results = response.json.results;

            if (!results || results.length == 0) {
                callback([]);
                return;
            } else {
                getPlaceInformation(results[0].place_id, function (data) {
                    var address = data.formatted_address;
                    var times = data.opening_hours;

                    callback([{
                        name: data.name,
                        address: address,
                        times: times
                    }]);
                });
            }

            // async.map(results, function (result, cb) {
            //cb(null, );
            // }, function (err, result) {
            //     callback(result);
            // });
        } else {
            console.error(err);
        }
    });
}

function getPlaceInformation(id, callback) {
    googleMaps.place({
        placeid: id
    }, function (err, response) {
        if (!err) {
            callback(response.json.result);
        } else {
            console.error(err);
        }
    });
}

function getLocation(location, callback) {
    googleMaps.geocode({
        address: location
    }, function (err, response) {
        if (!err) {
            callback(response.json.results[0].geometry.location);
        } else {
            console.error(err);
        }
    });
}

module.exports = {
    details: getDetails,
    location: getLocation
};