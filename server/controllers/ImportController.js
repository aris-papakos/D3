// app/controllers/ImportController.js
const async               = require('async');
const parse               = require('csv-parse');
const fs                  = require('fs');

const mongoose            = require('mongoose');

module.exports = (function() {

  return {

    lsoa: function(req, res, next) {
      // console.log(' import');
      let input = './server/assets/codes.csv'

      let parser = parse({delimiter: ','}, function (err, data) {
        async.eachSeries(data, function (line, callback) {
          // console.log(line);
          callback();
        });
      });


      fs.createReadStream(input).pipe(parser);
      return res.json();
    },

  }

})();
