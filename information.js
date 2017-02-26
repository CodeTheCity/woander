var async = require('async');
var request = require('request');

var config = require('./config.json');
var key = config.google.api_key;

var googleMaps = require('@google/maps').createClient({

});

function getDetails(query, long, lat, callback) {
    request({
        url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        json: true,
        qs: {
            key: key,
            keyword: query,
            location: long + "," + lat,
            rankby: 'distance'
        }
    }, function(err, res, data) {
        if(err) {
            console.error(err);
        }

        console.log(data);

        var results = data.results;

        if (!results || results.length == 0) {
            callback([]);
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