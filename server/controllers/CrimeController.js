// app/controllers/WardsController.js
const Ward                = require('../models/ward');

const async               = require('async');
const mongoose            = require('mongoose');

module.exports = (function() {

  return {

    get: function(req, res, next) {

      console.log(req.query);

      Ward.find({ 'properties.name': req.query.ward })
      .exec(function(err, wards) {
        if (err) console.error(err);

        res.json(wards)
      })
    },
  }

})();
