var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController.js');

/* GET register page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'register' });
});

/* POST register page. */
router.post('/', user_controller.register_post);

module.exports = router;
