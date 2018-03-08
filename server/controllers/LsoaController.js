// app/controllers/LsoaController.js
const Lsoa                = require('../models/lsoa');

const async               = require('async');
const mongoose            = require('mongoose');

module.exports = (function() {

  return {

    get: function(req, res, next) {
      Lsoa.find({})
      .exec(function(err, lsoas) {
        if (err) console.error(err);

        res.json(lsoas)
      })
    },
  }

})();
