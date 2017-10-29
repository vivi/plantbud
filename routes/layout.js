var express = require('express');
var router = express.Router();
var layout_controller = require('../controllers/layoutController.js');

router.get('/', layout_controller.layout_get);
router.post('/', layout_controller.layout_post);

module.exports = router;
