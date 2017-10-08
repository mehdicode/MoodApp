var mysql = require('mysql')
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Qwerty1368",
  database : "login"
})

connection.connect(function(err) {
  if (err) throw err;

});

module.exports = connection;