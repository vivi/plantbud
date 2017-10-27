var express = require('express');
var router = express.Router();
var map_controller = require('../controllers/mapController.js');

router.get('/', map_controller.map_get);
router.post('/', map_controller.map_post);

module.exports = router;
