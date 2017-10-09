var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('gps', { title: 'enter gps location' });
});
// router.get('/gps', genre_controller.genre_create_get);

module.exports = router;
