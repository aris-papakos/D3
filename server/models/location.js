// server/models/location.js

var mongoose              = require('mongoose');

// ============================= SCHEMA =============================
var LocationsSchema				= mongoose.Schema({

	type									: { type: String, default: 'Feature' },
	geometry							: {
		type									: { type: String, default: 'Point' },
		coordinates						: { type: [Number], index: '2dsphere' }
	},
	properties						: {
		description						:	String,
		crimes								: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Crime' } ]
	}
});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Locations', LocationsSchema);
