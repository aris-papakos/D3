// Get dependencies
const bodyParser          = require('body-parser');
const express             = require('express');
const http                = require('http');
const mongoose            = require('mongoose');
const path                = require('path');


// Get our API routes
const app                 = express();
const api                 = require('./server/api');
const database            = require('./server/database.js');


mongoose.connect(database.url);

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api', api);

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
