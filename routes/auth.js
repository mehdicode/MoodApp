var authController = require('../controllers/authcontroller.js');
 
module.exports = function(app) {
 
    app.get('/login', authController.signup);
 
}