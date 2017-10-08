var express = require('express');
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require(path.join(__dirname, 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var favicon = require('serve-favicon');
// auth++++++
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const MySQLStore = require('express-session-sequelize')(session.Store);
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');





var bcrypt = require('bcrypt');
var index = require('./routes/index');
var users = require('./routes/users');
var db = require('./models');

// var profile = require('./routes/profile')
var app = express();
var PORT = process.env.PORT || 3000;
//Routes
var authRoute = require('./routes/auth.js')(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Handlebars default config
const hbs = require('hbs');
const partialsDir = __dirname + '/views/partials';
const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function(filename) {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    const name = matches[1];
    const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});
// derp
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(expressValidator());
app.use(cookieParser());
// For Passport
const sessionStore = new MySQLStore({
    db: sequelize,
});
app.use(session({
    secret: config.secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// require("./index.js")(app);

db.sequelize.sync().then(function() {
    console.log('looks fine');
});

// var options = {
//   host: "us-cdbr-iron-east-03.cleardb.net",
//   user: "babbe505ecfb1b",
//   password: "84f122c8",
//   database : "heroku_a9c3b7ff3b5f692"
// };
// var sessionStore = new MySQLStore(options);
// app.use(session({
//     // move the secret key to env file
//     secret: '111111fhhfghdfghdfgh',
//     resave: false,
//     store: sessionStore,
//     saveUninitialized: false,
//     // cookie: { secure: true }
// }));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use('/', index);
app.use('/users', users);


passport.use(new LocalStrategy(
    function(username, password, done) {


        const db = require('./models');
        db.users.findOne({
            where: {
                username: username
            }
        }).then(function(results) {


            if (results.length === 0) {
                done(null, false);
            } else {

                const hash = results.dataValues.password.toString();
                bcrypt.compare(password, hash, function(err, response) {
                    if (response) {
                        console.log("++++++++")
                        console.log(results)
                        console.log("++++++++")
                        console.log(results.dataValues)
                        console.log("++++++++")
                        console.log(results.dataValues.id)
                        console.log("++++++++")
                        return done(null, {
                            user_id: results.dataValues.id
                        });
                    } else {
                        return done(null, false);
                    }
                })
            };

        })
       

    }
));





// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



app.listen(PORT, function() {
    console.log("App running on port 3000!");
});