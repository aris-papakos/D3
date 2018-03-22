// app/controllers/ImportController.js
const Ward                = require('../models/ward');
const Location            = require('../models/location')
const Crime               = require('../models/crime')
const Report              = require('../models/report')


const async               = require('async');
const parse               = require('csv-parse');
const csv                 = require('csv-parser');
const fs                  = require('fs');

const mongoose            = require('mongoose');

module.exports = (function() {

  return {

    wards: function(req, res, next) {
      let wardsGeo        = {};

      async.waterfall([
        function(callback) {
          fs.readFile('./server/assets/wards.geojson', 'utf8', function (err, data) {
            if (err) console.error(err);

            wardsGeo = JSON.parse(data);
            callback(null);
          });
        },
        function(callback) {
          async.each(wardsGeo.features, function (feature, callback) {

            let ward = new Ward({
              'type'          : 'Feature',
              'properties'    : {
                'name'          : feature.properties["NAME"],
                'borough'       : feature.properties["BOROUGH"],
                'hectares'      : feature.properties["HECTARES"]
              },
              'geometry'      : feature.geometry
            })
            ward.save(function(err) {
              if (err) console.error(err);

              callback();
            });

          }, function(err) {
            callback(null);
          });
        }
      ], function(err, result) {
        if (err) console.error(err);
        console.log('all done');

        return res.send('imported ' + wardsGeo.features.length + ' wards');
      });
    },
    crime: function(req, res, next) {

      fs.readdir('./server/assets/crimes', (err, months) => {
        async.eachSeries(months, function(month, callback) {
          console.log('importing ' + month);

          async.waterfall([
            function(callback) {
              console.log('importing city');
              if (fs.existsSync('./server/assets/crimes/' + month +'/' + month + '-city-of-london-street.csv')) {
                fs.createReadStream('./server/assets/crimes/' + month +'/' + month + '-city-of-london-street.csv')
                  .pipe(csv())
                  .on('data', function (data) {
                    if (data.Latitude != '' && data.Longitude != '') {
                      var dateSplit = data['Month'].split('-');
                      var date = new Date()
                      date.setYear(dateSplit[0]);
                      date.setMonth(dateSplit[1] - 1);
                      date.setDate(1);
                      date.setHours(0);
                      date.setMinutes(0);
                      date.setSeconds(0);
                      date.setMilliseconds(0);


                      var crime = new Crime({
                        geometry              : {
                          coordinates: [data['Longitude'], data['Latitude']]
                        },
                        properties            :{
                          crimeId								: data['Crime ID'],
                          date									: {
                            raw										: data['Month'],
                            dateString						: date
                          },
                          reportedBy						: data['Reported by'],
                          fallsWithin						: data['Falls within'],
                          crimeType							: data['Crime type'],
                          outcome								: data['Last outcome category'],
                          street                : data['Location'],
                        }
                      }).save();
                    }
                  })
                  .on('end', function () {
                    callback();
                  })
                } else {
                  callback();
                }
            },
            function(callback) {
              console.log('importing metro');
              if (fs.existsSync('./server/assets/crimes/' + month +'/' + month + '-metropolitan-street.csv')) {
                fs.createReadStream('./server/assets/crimes/' + month +'/' + month + '-metropolitan-street.csv')
                  .pipe(csv())
                  .on('data', function (data) {
                    if (data.Latitude != '' && data.Longitude != '') {
                      var dateSplit = data['Month'].split('-');
                      var date = new Date()
                      date.setYear(dateSplit[0]);
                      date.setMonth(dateSplit[1] - 1);
                      date.setDate(1);
                      date.setHours(0);
                      date.setMinutes(0);
                      date.setSeconds(0);
                      date.setMilliseconds(0);

                      var crime = new Crime({
                        geometry              : {
                          coordinates: [data['Longitude'], data['Latitude']]
                        },
                        properties            :{
                          crimeId								: data['Crime ID'],
                          date									: {
                            raw										: data['Month'],
                            dateString						: date
                          },
                          reportedBy						: data['Reported by'],
                          fallsWithin						: data['Falls within'],
                          crimeType							: data['Crime type'],
                          outcome								: data['Last outcome category'],
                          street                : data['Location'],
                        }
                      }).save();
                    }
                  })
                  .on('end', function () {
                    callback();
                  })
              } else {
                callback();
              }
            },
          ], function(err) {
            if (err) console.error(err);
            console.log('done with ' + month);
            callback();
          });
        }, function(err) {
          if (err) console.error(err);

          console.log('all done');
        });
      });

    },
    crimeNested: function(req, res, next) {

      Ward.find({})
      .exec(function(err, wards) {
        if (err) console.error(err);

        async.eachSeries(wards, function(ward, callback) {

          console.log('starting ' + ward.properties.name);

          Crime.find({
            'geometry': { $geoWithin: { $geometry: ward.geometry } }
          })
          .exec(function(err, crimes) {
            if (err) console.error(err);

            async.eachSeries(crimes, function(crime, callback) {


              var report = new Report({
                crimeId								: crime.properties.crimeId,
                date									: crime.properties.date,
                reportedBy						: crime.properties.reportedBy,
                fallsWithin						: crime.properties.fallsWithin,
                crimeType							: crime.properties.crimeType,
                outcome								: crime.properties.outcome
              }).save(function(err, savedReport) {
                if (err) console.error(err);

                Location.findOne({
                  'geometry.coordinates': crime.geometry.coordinates
                })
                .exec(function(err, location) {
                  if (err) console.error(err);

                  if (!location) {
                    location = new Location({
                      geometry        : {
                        coordinates     : crime.geometry.coordinates
                      },
                      properties      :{
                        description     : crime.properties.street,
                        crimes          : [ savedReport._id ]
                      }
                    }).save(function(err, savedCrime) {
                      if (err) console.error(err);

                      callback();
                    });
                  } else {
                    location.properties.crimes.push(savedReport._id)
                    location.save(function(err, savedLocation) {
                      if (err) console.error(err);

                      callback();
                    });
                  }
                });

              });
            }, function(err) {
              if (err) console.error(err);

              console.log(ward.properties.name + ' done');
              callback();
            });
          });

        }, function(err) {
          if (err) console.error(err);

          res.status(200).json('done!')
        });

      });

    }

  }

})();
