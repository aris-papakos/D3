// app/controllers/WardsController.js
const Crime               = require('../models/crime');
const Location            = require('../models/location');
const Ward                = require('../models/ward');

const async               = require('async');
const decodePolyline      = require('decode-google-map-polyline');
const mongoose            = require('mongoose');
const request             = require('request');
const turf                = require('@turf/turf');


module.exports = (function() {

  return {

    getWard: function(req, res, next) {
      Ward.findOne({ 'properties.name': req.query.ward })
      .exec(function(err, ward) {
        if (err) console.error(err);

        let populate = { path: 'properties.crimes' }

        if (req.query.sample == true) {
          let date = new Date('2017-01-01')
          // populate['match'] = { 'date.dateString': { '$gte': date } }
          populate['options'] = {
            limit: 5
          }
        }

        Location.find({
           'geometry': { $geoWithin: { $geometry: ward.geometry } }
        })
        .populate(populate)
        .exec(function(err, location) {
          if (err) console.error(err);

          console.log(location.length);

          res.status(200).json(location)
        });
      });
    },
    getRoute: function(req, res, next) {
      let start, end;

      async.parallel([
        function(callback) {
          Ward.findOne({ 'properties.name': req.query.start })
          .exec(function(err, ward) {
            if (err) console.error(err);

            start = ward;
            let startCentroid = turf.centroid(turf.polygon(ward.geometry.coordinates));
            callback(null, startCentroid)
          });
        },
        function(callback) {
          Ward.findOne({ 'properties.name': req.query.end })
          .exec(function(err, ward) {
            if (err) console.error(err);

            end = ward;
            let endCentroid = turf.centroid(turf.polygon(ward.geometry.coordinates));
            callback(null, endCentroid)
          });
        }
      ], function(err, result) {
        if (err) console.error(err);

        var url = 'https://maps.googleapis.com/maps/api/directions/json?'
        var params = {
            key             : 'AIzaSyArEJJyNfw0ti1iYhe4EQro0y_j0wNtVDY',
            origin          : (result[0].geometry.coordinates[1] + ',' + result[0].geometry.coordinates[0]).toString(),
            destination     : (result[1].geometry.coordinates[1] + ',' + result[1].geometry.coordinates[0]).toString(),
            mode            : req.query.mode,
            avoid           : 'highways'
        };

        request({
            url:url,
            qs: params
        }, function (error, response, body) {
          if (error) console.error(err);
          body = JSON.parse(body);

          let decodedroute;
          let routeFeature;

          if (body.status == 'OK') {
            routeFeature = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: []
              }
            };

            decodedroute = decodePolyline(body.routes[0].overview_polyline.points);
            async.eachSeries(decodedroute, function(point, callback) {
              routeFeature.geometry.coordinates.push([
                point.lng , point.lat
              ])
              callback();
            }, function(err) {
              if (error) console.error(err);

              var polyline = turf.lineString(routeFeature.geometry.coordinates);
              var buffered = turf.buffer(polyline, 0.25);

              let date = new Date('2017-01-01')

              let populate = {
                path: 'properties.crimes',
                // match: { 'date.dateString': { '$gte': date } },
                options: {
                  limit: 3
                }
              }

              Location.find({
                $and: [
                  { 'geometry': { $geoWithin: { $geometry: buffered.geometry } } },
                  { 'geometry': { $not: { $geoWithin: { $geometry: start.geometry } } } },
                  { 'geometry': { $not: { $geoWithin: { $geometry: end.geometry } } } }
                ]
              }

              )
              .populate(populate)
              .exec(function(err, location) {
                if (err) console.error(err);

                res.status(200).json(location)
              });
            });
          } else {
            res.status(200).json('ERROR')
          }
        });
      })



    },
  }

})();
