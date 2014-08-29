var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/read-avid');

var routes = require('./routes/index');
var users = require('./routes/users');
var Book = require('./routes/book');

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
app.use(express.static(path.join(__dirname, 'public')));





app.use('/list', function(req, res,next){
    Book.find(function(error, books) {
        if(error){
            res.send(error);
        }else{
            res.send(books);    
        }
    });
});

app.use('/deleteAll', function(req,res, next){
    Book.remove(function (err) {
        if (err) return next(err);
    });
    res.send(200);
});


app.post('/submit', function(req, res, next){
    new Book({title: req.body.title, description: req.body.desc}).save();
    res.status(200).end();
});

app.get('/', function(req,res,next){
    Book.find(function(error, books) {
        res.render('index', {books: books});
    });
});

app.use('/users', users);

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
