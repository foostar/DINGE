var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose=require("mongoose")
var send=require("send")
var app = express();
var mongoStore=require('connect-mongo')(session)
var passport=require('passport')
var multiparty = require('connect-multiparty');
var dbUrl='mongodb://localhost/dinge'
mongoose.Promise=require("bluebird")
mongoose.connect(dbUrl);
// view engine setup
/*app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multiparty());
app.set("jwtTokenSecret","international meeting")
if('development' === app.get('env')) {
  app.set('showStackError', true)
  app.use(logger(":method :url :status"))
  mongoose.set("debug", true)
}
app.use(session({
  secret: 'imooc',
  name: 'keyvalue',
  store:new mongoStore({
    url:dbUrl,
    collection:'sessions',
  }),
  resave:true,
  saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
//静态路由
require('./routes/routerStatic')(app)
//用户端API
require('./routes/routerPost')(app)
//后台管理API
require('./routes/adminRouterPost')(app)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        send(req, path.join(__dirname, "public/404.html")).pipe(res);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    send(req, path.join(__dirname, "public/404.html")).pipe(res);
});


module.exports = app;
