var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/read-avid');

var hash = require('./routes/hash').hash;
var User = require('./routes/user');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "woah cat", saveUninitialized: true, resave: false}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));

app.use(function (req, res, next) {
    var err = req.session.error,
    msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    User.findOne({
        username: name
    },
    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });

}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/");
        }
    });
}

app.use('/deleteAll', function(req,res, next){
    Book.remove(function (err) {
        if (err) return next(err);
    });
    res.send(200);
});

app.post('/submit', requiredAuthentication, function(req, res, next){
    var newBook = {title: req.body.title, author: req.body.author};
    if(req.body.completed === "on"){
        newBook.completed = true;
        newBook.dateFinished = req.body.dateFinished;
    }
    else{
        newBook.completed =  false;
    }

    var name = req.session.user.username;
    User.findOne({
        username: name
    },
    function (err, user) {
        User.count({
            title: req.body.title
        }, function (err, count) {
            if (count === 0) {
                user.books.push(newBook);
                user.save(function(err){
                  res.redirect("/");
              });
            }else{
                req.session.error = "Book exists";
                res.redirect("/");
            }
        });

    });
});

app.get('/deleteBooks', function(req,res){
    User.find(function (err, users) {
        users.forEach(function(user){
            user.books = [];
            user.save();
        });
    });
});


app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("login");
    }
});

app.post("/signup", userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;
    var fullname = req.body.fullname;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            fullname: fullname,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        res.redirect('/');
                    });
                }
            });
        });
    });
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            req.session.regenerate(function () {
                req.session.user = user;
                res.redirect('/');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

app.post('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get("/", requiredAuthentication, function (req, res) {
  User.find(function(error, users){
   res.render('index', {users: users, user: req.session.user.username});
});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
