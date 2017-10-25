var express = require('express');
var router = express.Router();
var guide_controller = require('../controllers/guideController.js');

router.get('/', guide_controller.guide_get);
router.post('/', guide_controller.guide_post);

module.exports = router;