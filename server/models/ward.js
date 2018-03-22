// server/models/wards.js

var mongoose              = require('mongoose');

// ============================= SCHEMA =============================
var WardsSchema						= mongoose.Schema({

		type									: String,
		properties						: Object,
		geometry							: Object

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Wards', WardsSchema);
