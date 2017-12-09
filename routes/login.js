var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController.js');

/* GET google login page. */
router.get('/auth/google', user_controller.login);

/* GET google callback page. */
router.get('/auth/google/callback', user_controller.login_callback);

/* GET login failed page. */
router.get('/auth/failed', user_controller.login_failed);

module.exports = router;
