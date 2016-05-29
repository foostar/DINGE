var path = require('path');
var express = require('express');
var app = express();
var config = require('./config');
var send = require('send');

app.use(express.static(path.join(__dirname, 'public')));

var port = config.port || 3000;

app.get('/cooperation', function(req, res) {
  send(req, path.join(__dirname, 'public/cooperation.html')).pipe(res);
});

app.get('/m', function(req, res) {
  send(req, path.join(__dirname, 'public/mobile/index.html')).pipe(res);
});

app.get('/m/cooperation', function(req, res) {
  send(req, path.join(__dirname, 'public/mobile/cooperation.html')).pipe(res);
});
app.get('/haoli', function(req, res) {
  send(req, path.join(__dirname, 'public/active/index.html')).pipe(res);
});
app.get('/m/haoli', function(req, res) {
  send(req, path.join(__dirname, 'public/mobile/active.html')).pipe(res);
});

app.listen(port, function() {
    console.log('Xiaoyun website listenning %d', port);
});
