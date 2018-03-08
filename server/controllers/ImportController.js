// app/controllers/ImportController.js
const Lsoa                = require('../models/lsoa');

const async               = require('async');
const parse               = require('csv-parse');
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
        // function(callback) {
        //   console.log('lsoa postcode');
        //   let parser = parse({delimiter: ','}, function (err, data) {
        //     async.eachOf(data, function (line, index, callback) {
        //       if (index == 0) callback();
        //
        //       else {
        //         if (londonLsoa.indexOf(line[3]) === -1) {
        //           callback();
        //         } else {
        //           LondonPostcodes.push({
        //             'lsoa': line[3], 'pcd7': line[0], 'pcd8': line[1]
        //           });
        //           callback();
        //         }
        //       }
        //     }, function(err) {
        //       if (err) console.error(err);
        //
        //       console.log(LondonPostcodes.length);
        //       callback(null);
        //     });
        //   });
        //
        //   fs.createReadStream('./server/assets/postcodes.csv').pipe(parser);
        // },
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

  }

})();
