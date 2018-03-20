const CrimeController     = require('./controllers/CrimeController');
const ImportController    = require('./controllers/ImportController');
const WardsController     = require('./controllers/WardsController');


const express             = require('express');
const router              = express.Router();

/* GET api listing. */

// ============================= IMPORT =============================
// router.get('/import/lsoa', ImportController.lsoa);
// router.get('/import/crime', ImportController.crime);
router.get('/import/crimeNested', ImportController.crimeNested);
router.get('/import/wards', ImportController.wards);


// ============================= CRIME ==============================
router.get('/crime/getWard', CrimeController.getWard);
router.get('/crime/getRoute', CrimeController.getRoute);

// ============================== WARD ==============================
router.get('/ward/get', WardsController.get);

module.exports = router;
