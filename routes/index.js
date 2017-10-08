var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
var d3 = require('d3');
var dsv = require('d3-dsv');
const saltRounds = 10;
var db = require('../models');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3({
  username: '702de12e-4a67-4611-8b08-44d0a3debfd2',
  password: '2cL4a6h4sARl',
  version_date: '2016-05-19'
});
const fs = require("fs");
const os = require('os');
// var user_id;
function convertDate(d){

var parts = d.split(" ");
var months = {
Jan: "01",
Feb: "02",
Mar: "03",
Apr: "04",
May: "05",
Jun: "06",
Jul: "07",
Aug: "08",
Sep: "09",
Oct: "10",
Nov: "11",
Dec: "12"
};
return parts[3]+months[parts[1]]+parts[2];
};






router.get('/', function (req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('home', {
        title: 'Welcome'
    });
});

// router.get('/profile', authenticationMiddleware(), function (req, res) {
//     res.render('profile', {
//         title: 'Profile'
//     })
// });

router.get('/login', function (req, res) {
    res.render('login', {
        title: 'Login'
    })
});



router.post('/login', passport.authenticate('local', {
    successRedirect: '/userDash',
    failureRedirect: '/login'
}), function (req, res) {

});

router.get('/logout', function (req, res) {
    req.logOut();
    req.session.destroy();
    res.redirect('/login');
});


// router.get('/register', function(req, res, next) {
//   res.render('register', { title: 'Registeration' });
// });

router.get('/entry',authenticationMiddleware(), function (req, res, next) {
    res.render('journalEntry'), {
        title: ' journal'
    };
});

router.post('/entry',authenticationMiddleware(), function (req, res, next) {

    var params = {
    // Get the text from the JSON file.
    text: req.body.moodEntry
    };

    tone_analyzer.tone(params, function(error, response) {
    if (error)
        console.log('error:', error);
    else

        console.log(typeof(response.document_tone.tone_categories[0].tones[3].score));
        db.Post.create({

            body: req.body.moodEntry,
            userId: req.user.user_id,
            joy: response.document_tone.tone_categories[0].tones[3].score ,
            sadness:response.document_tone.tone_categories[0].tones[4].score



        })
        .then(function (dbPost) {
            res.redirect('userDash'), { title: 'User Dashboard' };
        });
    });


});

router.get('/userDash',authenticationMiddleware(), function (req, res, next) {

    var query = {};
    if (req.user){
        query.userId =req.user.user_id
    }
    db.Post.findAll({
      where: query,
      include: [db.users],
      order: [['createdAt', 'DESC']]

    }).then(function(dbPost) {
           var hbsObject = {
                Post: dbPost
            };

            fs.writeFile("./public/data.tsv","date"+"\t"+"joy"+"\t"+"sadness"+"\r\n",function(err) {

                if (err) {
                    return console.log(err);
                }else{
                    var len = hbsObject.Post.length-1;

                    for (var i = len; i > -1; i--) {
                            var d = hbsObject.Post[i].createdAt.toString();
                            var t1 = convertDate(d);
                            var t2 = (parseFloat(hbsObject.Post[i].joy.toString())*100).toFixed(1);
                            var t3 = (parseFloat(hbsObject.Post[i].sadness.toString())*100).toFixed(1);
                        fs.appendFileSync("./public/data.tsv", t1+"\t"+t2+"\t"+t3+"\r\n",'utf8', function(err) {

                            // // If an error was experienced we say it.
                            // if (err) {
                            //     console.log(err);
                            // }

                            // // If no error is experienced, we'll log the phrase "Content Added" to our node console.
                            // else {
                            //     console.log("Content Added!");
                            // }

                        });
                    };
                };
            });
      res.render('userDash', hbsObject), { title: 'User Dashboard'};
    });

});

router.get('/userDetailedHistory', function (req, res, next) {
    res.render('userDetailedHistory'), { title: 'User Detailed History' };
});

router.get('/register', function (req, res, next) {
    res.render('register');
});

router.post('/register', function (req, res, next) {
    req.checkBody('username', 'you must enter a username').notEmpty();
    req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    // going to turn off the password validation must include lowercase just for dev desting
    // req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        console.log(`errors: ${JSON.stringify(errors)}`);
        res.render('register', {
            title: 'registration error',
            errors: errors
        });
    } else {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        bcrypt.hash(password, saltRounds, function (err, hash) {


            db.users.create({
                username: username,
                email: email,
                password: hash
            }).then(function (data) {
                const user_id = data.get('id');
                req.login(user_id, function (err) {

                    res.redirect('/userDash');
                });

            });
        

        });
    }
});



passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
    done(null, user_id);
});


function authenticationMiddleware() {
    return (req, res, next) => {

        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/login');
    }
};




module.exports = router;
