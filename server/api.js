const ImportController    = require('./controllers/ImportController');
const LsoaController      = require('./controllers/LsoaController');


const express             = require('express');
const router              = express.Router();

/* GET api listing. */

// ============================= IMPORT =============================
// router.get('/import/lsoa', ImportController.lsoa);

// ============================== LSOA ==============================
  router.get('/lsoa/get', LsoaController.get);

// ============================ DEFAULT =============================
// Catch all other routes and return the index file
router.get('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

module.exports = router;
