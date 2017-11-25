var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController.js');

/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'login' });
});

/* POST register page. */
router.post('/', user_controller.login_post);

module.exports = router;
