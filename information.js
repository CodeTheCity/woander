var async = require('async');

var config = require('./config.json');

var key = config.google_map_api_key;

var googleMaps = require('@google/maps').createClient({
    key: key
});

function getDetails(query, long, lat, callback) {
    googleMaps.places({
        query: query,
        location: [long, lat],
        //radius: radius
    }, function (err, response) {
        if (!err) {
            var results = response.json.results;

            async.map(results, function (result, cb) {
                getOpeningTimes(result.place_id, function (data) {
                    cb(null, { address: data });
                });
            }, function (err, result) {
                callback(result);
            });
        }
    });

}

function getOpeningTimes(id, callback) {
    googleMaps.place({
        placeid: id
    }, function (err, response) {
        if (!err) {
            callback(response.json.result);//.address_components); //.opening_hours.periods);
        }
    });
}


//example call
getDetails("starbucks", 57.1660063, -2.1054137, function (data) {
    console.log(data);
});