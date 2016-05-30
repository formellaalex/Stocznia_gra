var express = require('express');
  formidable = require('formidable'),
  http = require('http'),
  util = require('util'),
  fs   = require('fs-extra');
  path = require('path');
  logger = require('morgan');
  mysql = require('mysql');
  cookieParser = require('cookie-parser');
  bodyParser = require('body-parser');
  connection_db  = require('express-myconnection'); 
  index = require('./routes/index');


var app =  module.exports = express();
var server_port = 3000
var server_ip_address = '127.0.0.1'


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);


app.use(logger('dev'));
app.use(cookieParser('sgdkdk'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/kolonia',index);


var email   = require("./node_modules/emailjs");
var server  = email.server.connect({
   user:    "stoczniagame@gmail.com", 
   password:"stoczniagra", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

// send the message and get a callback with an error or details of the message that was sent
app.post('/send/:strona/:post_id/:id?', function(req, res) {
server.send({
   text:    "Zgłoszono komentarz nr "+req.params.id + " z powodu: " + req.body.delete_message, 
   from:    " stocznia game <stoczniagame@gmail.com>", 
   to:      "skocz <freeq343@gmail.com>",
   cc:      " stocznia game <stoczniagame@gmail.com>",
   subject: "testing emailjs"
}, function(err, message) { console.log(err || message); });
res.redirect('/forum/' + req.params.strona + '/' + req.params.post_id);
});


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

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {message: err});
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {

        message: err.message,
        error: {}
    });
});

db_config = {
  host     : 'localhost',
  socketPath: '/var/run/mysqld/mysqld.sock',
  user     : 'adminmPNjwgk',
  password : 'dhby1WSwYuxP',
  database : 'graostocznie',
  multipleStatements: true 

};



// db_config = {
//   host     : 'us-cdbr-iron-east-01.cleardb.net',
//   user     : 'b6328a367ad02a',
//   password : 'deb5efdb',
//   database : 'heroku_fd1c348c48d7c8c',
//   multipleStatements: true 
// }

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {   
    if(err) console.log("Error when connecting to db: " + err);           // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

//handleDisconnect();

//module.exports = app;

app.listen(server_port, function () {
  console.log( "Listening on server_port " + server_port);
});
//jeszcze mi nie kasuj będę tego potrzebował do wylogowywaniaF
/*app.get('/', function(req, res){
  if (req.cookies.remember) {
    res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
  } else {
    res.send('<form method="post"><p>Check to <label>'
      + '<input type="checkbox" name="remember"/> remember me</label> '
      + '<input type="submit" value="Submit"/>.</p></form>');
  }
});
app.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.redirect('back');
});
app.post('/', function(req, res){
  var minute = 60 * 1000;
  if (req.body.remember) res.cookie('remember', 1, { maxAge: minute });
  res.redirect('back');
});*/


// var express = require('express');
// var app = express();

// app.get('/', function(req, res){
//   res.send('Hello World');
// });

// var server = app.listen(3000, function(){
//   console.log('Magic is happening on port 3000')
// });