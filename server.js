// Get dependencies
const bodyParser          = require('body-parser');
const express             = require('express');
const http                = require('http');
const mongoose            = require('mongoose');
const morgan              = require('morgan');
const path                = require('path');


// Get our API routes
const app                 = express();
const api                 = require('./server/api');
const database            = require('./server/database.js');


mongoose.connect(database.url);

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Log to command line
app.use(morgan('dev'));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set access control
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
  next();
});

// Set our api routes
app.use('/api', api);
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
  // res.sendFile(path.join(__dirname, 'src/index.html'));
});

// Get port from environment and store in Express.
const port = process.env.PORT || '3000';
app.set('port', port);


// Create HTTP server.
const server = http.createServer(app);


// Listen on provided port, on all network interfaces.
server.listen(port, () => console.log(`API running on localhost:${port}`));
