// server/models/crime.js

var mongoose              = require('mongoose');

// ============================= SCHEMA =============================
var CrimeSchema						= mongoose.Schema({

		type									: { type: String, default: 'Feature' },
		geometry							: {
			type									: { type: String, default: 'Point' },
			coordinates						: { type: [Number], index: '2dsphere' }
		},
		properties						: {
			crimeId								: String,
			date									: {
				raw										: String,
				dateString						: Date
			},
			reportedBy						: String,
			fallsWithin						: String,
			crimeType							: String,
			outcome								: String,
			street								: String
		}

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Crimes', CrimeSchema);
