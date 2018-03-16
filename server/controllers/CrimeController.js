// app/controllers/WardsController.js
const Crime               = require('../models/crime');
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

        var date = new Date()
        date = date.setDate(date.getDate() - 90);

        Crime.find({
          $and :[
            { 'geometry': { $geoWithin: { $geometry: ward.geometry } } },
            { 'properties.date.dateString': { '$gte': date } }
          ]
        })

        .exec(function(err, crimes) {
          if (err) console.error(err);

          res.status(200).json(crimes)
        });
      });
    },
    getRoute: function(req, res, next) {
      console.log(req.query);

      async.parallel([
        function(callback) {
          Ward.findOne({ 'properties.name': req.query.home })
          .exec(function(err, ward) {
            if (err) console.error(err);

            let homeCentroid = turf.centroid(turf.polygon(ward.geometry.coordinates));
            callback(null, homeCentroid)
          });
        },
        function(callback) {
          Ward.findOne({ 'properties.name': req.query.work })
          .exec(function(err, ward) {
            if (err) console.error(err);

            let workCentroid = turf.centroid(turf.polygon(ward.geometry.coordinates));
            callback(null, workCentroid)
          });
        }
      ], function(err, result) {
        if (err) console.error(err);

        var url = 'https://maps.googleapis.com/maps/api/directions/json?'
        var params = {
            key             : 'AIzaSyArEJJyNfw0ti1iYhe4EQro0y_j0wNtVDY',
            origin          : (result[0].geometry.coordinates[1] + ',' + result[0].geometry.coordinates[0]).toString(),
            destination     : (result[1].geometry.coordinates[1] + ',' + result[1].geometry.coordinates[0]).toString(),
            model           : req.query.mode
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
              var buffered = turf.buffer(polyline, 1);

              var date = new Date()
              date = date.setDate(date.getDate() - 90);

              Crime.find({
                $and :[
                  { 'geometry': { $geoWithin: { $geometry: buffered.geometry } } },
                  { 'properties.date.dateString': { '$gte': date } }
                ]
              })

              .exec(function(err, crimes) {
                if (err) console.error(err);

                res.status(200).json(crimes)
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
