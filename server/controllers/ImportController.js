// app/controllers/ImportController.js
const Lsoa                = require('../models/lsoa');
const Ward                = require('../models/ward');
const Crime               = require('../models/crime')

const async               = require('async');
const parse               = require('csv-parse');
const csv                 = require('csv-parser');
const fs                  = require('fs');

const mongoose            = require('mongoose');

module.exports = (function() {

  return {

    lsoa: function(req, res, next) {
      let londonLsoa      = [];
      let londonGeo       = {};
      let LondonPostcodes = [];
      let londonFiltered  = [];

      async.waterfall([
        // CRIME LSOA
        function(callback) {
          console.log('crime lsoa');
          let parser = parse({delimiter: ','}, function (err, data) {
            async.eachOf(data, function (line, index, callback) {
              if (index == 0) callback();
              else {
                londonLsoa.push(line[1]);
                callback();
              }
            }, function(err) {
              if (err) console.error(err);

              console.log(londonLsoa.length);
              callback(null);
            });
          });

          fs.createReadStream('./server/assets/lsoa.csv').pipe(parser);
        },
        function(callback) {
          console.log('total lsoa');
          fs.readFile('./server/assets/lsoa.geojson', 'utf8', function (err, data) {
            if (err) console.error(err);

            londonGeo = JSON.parse(data);
            console.log(londonGeo.features.length);
            callback(null);
          });
        },
        function(callback) {
          console.log('filter lsoa');
          async.each(londonGeo.features, function (feature, callback) {
            if (londonLsoa.indexOf(feature.properties['LSOA11CD']) === -1) {
              callback();
            } else {

              postcodeIndex = LondonPostcodes.map(function(postcode) {
                return postcode.lsoa;
              }).indexOf(feature.properties['LSOA11CD']);

              let lsoa = new Lsoa({
                'type'          : 'Feature',
                'properties'    : feature.properties,
                'geometry'      : feature.geometry
              })
              lsoa.save(function(err) {
                if (err) console.error(err);

                callback();
              });
            }
          }, function(err) {
            callback(null);
          });
        }
      ], function(err, result) {
        if (err) console.error(err);
        console.log('all done');

        return res.send(LondonPostcodes);
      });
    },
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

    }

  }

})();
