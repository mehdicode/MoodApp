var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('adminDashInDepth', { title: 'In Depth View' });
});

module.exports = router;
