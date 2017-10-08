var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('userMoodHistory', { title: 'Mood History' });
});

module.exports = router;
