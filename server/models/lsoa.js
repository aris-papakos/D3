// server/models/lsoa.js

var mongoose              = require('mongoose');

// ============================= SCHEMA =============================
var LsoaSchema						= mongoose.Schema({

		type									: String,
		properties						: Object,
		geometry							: Object

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Lsoa', LsoaSchema);
