// server/models/event.js

var mongoose              = require('mongoose');

// ============================= SCHEMA =============================
var ReportSchema						= mongoose.Schema({

	crimeId								: String,
	date									: {
		raw										: String,
		dateString						: Date
	},
	reportedBy						: String,
	fallsWithin						: String,
	crimeType							: String,
	outcome								: String,

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Report', ReportSchema);
