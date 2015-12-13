var express = require('express');
//tu
//var http = require('http');
var formidable = require('formidable'),
http = require('http'),
    util = require('util'),
    fs   = require('fs-extra');
//var formidable = require('formidable');
//var fs = require('fs');
var im = require('./imagemagick');
var gm = require('gm');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mysql = require('mysql');
//var Cookies = require( "cookies" );
//var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connection_db  = require('express-myconnection'); 


var index = require('./routes/index');
//module exp
var app =  module.exports = express();
//var server = require('../server');
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
//app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//cok
app.use(cookieParser('sgdkdk'));
app.use(bodyParser.json());
//zmienilem na true
app.use(bodyParser.urlencoded({ extended: true }));
//bylo wczesniej
//app.use(cookieParser());



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



//dodawanie zdjecia post
//przy uploadowaniu fotki sprawa wyglada tak ze zawsze najpierw 
// idzie do temp a potem z temp jest dopiero pobierana 
// i zapisywana do wlasciwej sciezki na dysku 
app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
   
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('/') + 1,
            file_name = old_path.substr(index),
            new_path = path.join(process.env.PWD, '/public/uploads/', file_name + '.' + file_ext);
            var bezwzgledna_path = path.join( '/uploads/', file_name + '.' + file_ext);
            console.log("new_path ",new_path," process.env.PWD",process.env.PWD," bezwzgledna_path",bezwzgledna_path);
          /*  var zdj =new_path;
            //
            gm('profilowy.jpg')
            .size(function (err, size) {
              console.log('width = ' + zdj);
                
              if (!err) {
                console.log('width = ' + size.width);
                console.log('height = ' + size.height);
              }
            });
            //*/
            fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {

                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {

                     
                        res.status(200);
                        //res.json({'success': true});
                    }
                });
            });
          //pierwszy skrypt od skalowania bardzo fajny tylko problem jest ze sciezka
          /*  gm(bezwzgledna_path).resize('200', '200', '^')
  .gravity('Center')
  .crop('200', '200').stream(function(err, stdout, stderr) {
            var writeStream = fs.createWriteStream(bezwzgledna_path, {
            encoding: 'base64'
            });
             stdout.pipe(writeStream);
            });*/

           //drugi skrypt 
          //problem tez ze sciezka   jakby 
          //bezwzgledna_path(sciezka do fotki) juz byla dodana ale jeszcze fotka nie zdarzyla sie tam zapisac
          /*var brakujacasciezka='/public';
          var path = __dirname+brakujacasciezka+bezwzgledna_path;
            im.resize({
            srcData: fs.readFileSync(path, 'binary'),
            width:   256
            }, function(err, stdout, stderr){
            if (err) throw err
               console.log('resized kittens.jpg to fit within 256x256px')
            fs.writeFileSync(path, stdout, 'binary');
            console.log('resized kittens.jpg to fit within 256x256px')
            });  
              */

            var queryString = 'UPDATE users SET profilowe='+connection.escape(bezwzgledna_path)+'WHERE email='+connection.escape(req.cookies.remember);
                      connection.query(queryString, function(err, result)
                      {
                        if (err)
                        console.log("Error inserting : %s ",err );
                        res.redirect('/edit');
                      });
        });
    });

}); 

app.post('/multiupload', function(req, res) {
  var backURL=req.header('Referer') || '/';
  var bit0=0;
  var tyt;
  var tre;
  var str;
  var form = new formidable.IncomingForm(),
      files = [],
      fields = [];
  function getDateTime() {

      var date = new Date();

      var hour = date.getHours();
      hour = (hour < 10 ? "0" : "") + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? "0" : "") + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? "0" : "") + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? "0" : "") + month;

      var day  = date.getDate();
      day = (day < 10 ? "0" : "") + day;

      return year +"/"+ month + "/" + day ;

  }
  var czas=getDateTime();




  form.uploadDir = __dirname + '/public/uploads1';
  form.keepExtensions=true; 
  form
    .on('field', function(field, value) {
      console.log(field, value);
      console.log("przerwa");
      if(field==="strona"){str=value;}
      if(field==="tytul"){tyt=value;}
      if(field==="tresc"){tre=value;}
      fields.push([field, value]);
    })
    .on('file', function(field, file) {
   if(file.size === 0){ bit0=1;}else{
      console.log(field, file);
      console.log(" huj");
      console.log( file.path);
      console.log(" huj");
      
      var scie=file.path;
      var file_ext = file.name.split('.').pop(),
              index = scie.lastIndexOf('/') + 1,
              file_name = scie.substr(index);
              var bezwzgl_path =( '/uploads1/'+file_name );
  console.log(" huj");
      console.log( file_ext);
      
  var pat = {pathfile: bezwzgl_path, idpost: req.cookies.id, rozszerzenie:file_ext,name_pic:file.name};
    connection.query('INSERT INTO tabfile SET ?', pat, function(err, result){
      if (err)
        console.log("Error tu inserting : %s ",err );
    });
  }
      files.push([field, file]);
    })
    .on('end', function() {
       if (req.cookies.remember){
        console.log(tre+req.cookies.id +'cokolwiek');
        console.log("czas"+czas);
    var post = {tytul: tyt.toUpperCase(), tresc: tre, nick: req.cookies.id ,czas_dodania:czas,strona:str};
    connection.query('INSERT INTO tabela_postow SET ?', post, function(err, result){
      if (err)
        console.log("Erro tu nie r inserting : %s ",err );

    if(bit0===1){}else{
    connection.query('UPDATE tabfile SET tabfile.idpost = (SELECT tabela_postow.id FROM tabela_postow WHERE tabela_postow.tytul= '+connection.escape(tyt)+'AND tabela_postow.tresc= '+connection.escape(tre)+') WHERE tabfile.idpost = '+connection.escape(req.cookies.id), function(err, result){
      if (err)
        console.log("Error inserting : %s ",err );

    });
  }
  res.redirect(backURL);
     // res.redirect('/przeszlosc');
    });

    }
    else{
      res.redirect('/logowanie');
    }

    });
  form.parse(req);

      return;
}); 


app.post('/multiuploadkomentarz', function(req, res) {
  var backURL=req.header('Referer') || '/';
  var bit1=0;
  var tre;
  var str;
  var id_postulatu;
  var typ_komentarza;
  var podkomentarze=0;
  var id_komentarza_odpowiedz;
  var form = new formidable.IncomingForm(),
      files = [],
      fields = [];
  var holder;
  var im;
  var naz;
  function getDateTime() {

      var date = new Date();

      var hour = date.getHours();
      hour = (hour < 10 ? "0" : "") + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? "0" : "") + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? "0" : "") + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? "0" : "") + month;

      var day  = date.getDate();
      day = (day < 10 ? "0" : "") + day;

      return year +"/"+ month + "/" + day ;

  }
  var czas=getDateTime();
  form.uploadDir = __dirname + '/public/uploads1komentarze';
  form.keepExtensions=true; 
  form
    .on('field', function(field, value) {
      //console.log(field, value);
    //  console.log("przerwa"+ req.params.id);
     if(field==="licznik"){podkomentarze=value;}
     if(field==="ukryteID"){id_komentarza_odpowiedz=value;}
     if(field==="strona"){str=value;}
     if(field==="ukryte"){id_postulatu=value; console.log("uwaga id_post_kom=" +id_postulatu +"niespodzianka"+value);}
     if(field==="tresc"){tre=value;}
     if(field==="comment_type"){typ_komentarza = value;}
     
      fields.push([field, value]);
    })
    .on('file', function(field, file) {
      if(file.size === 0){ bit0=1;}else{
      console.log("i co teraz"+field, file);
     // console.log("przerywnik");
    var scie=file.path;
      //zmiana sciezki wzglednej na sciezke bez wzgledna
    var file_ext = file.name.split('.').pop(),
              index = scie.lastIndexOf('/') + 1,
              file_name = scie.substr(index);

              var bezwzgl_path =( '/uploads1komentarze/'+file_name );


    var pat = {pathfile_kom: bezwzgl_path, idpost_kom: req.cookies.id,id_post_kom: id_postulatu,rozszerzenie:file_ext,name_pic:file.name};
    console.log(typ_komentarza);
    connection.query('INSERT INTO tabfilekomentarze SET ?', pat, function(err, result){
      if (err)
        console.log("Error tu inserting : %s ",err );
    });

   
    }
    files.push([field, file]);
    })
    .on('end', function() {

      if (req.cookies.remember){
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=" +typeof(podkomentarze));
        var post = { tresc: tre, nick: req.cookies.id, id_postu_uzytkownika:id_postulatu,czas_dodania_kom:czas,id_parent:id_komentarza_odpowiedz,rate:typ_komentarza*5};
        //;UPDATE tablica_komentarzy SET ? WHERE IdKomentarzu='+connection.escape(id_komentarza_odpowiedz)
        connection.query('INSERT INTO tablica_komentarzy SET ?', post, function(err, result){
        if (err)
          console.log("Erro tu nie r inserting : %s,%d ",err);
         
        holder=result.insertId;

          console.log(holder );
          var post2={ilosc_podkomentarzy:(parseInt(podkomentarze)+1)};
          connection.query('UPDATE tablica_komentarzy SET ? WHERE IdKomentarzu='+connection.escape(id_komentarza_odpowiedz) ,post2, function(err, result){
        if (err)
          console.log("Erro tu nie r inserting : %s,%d ",err);});
     if(bit1===1){}else{  
    console.log("aty : %s ",holder );
     var cos = { idpost_kom : holder};
    connection.query("UPDATE tabfilekomentarze SET ? WHERE idpost_kom = "+connection.escape(req.cookies.id), cos ,function(errr, resultt){
      if (errr)
        console.log("Error inserting : %s ",errr );
      console.log("trzecie: %s ",holder );
      });
      res.redirect(backURL);
      //res.redirect('/przeszlosc');
    }
  });
    }
    else{
      res.redirect('/logowanie');
    }

    });
  form.parse(req);

      return;
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
  host     : '127.13.120.2',
  port     : '3306',
  user     : 'adminmPNjwgk',
  password : 'dhby1WSwYuxP',
  database : 'graostocznie',
  multipleStatements: true 

};

/*
db_config = {
  host     : 'us-cdbr-iron-east-01.cleardb.net',
  user     : 'b6328a367ad02a',
  password : 'deb5efdb',
  database : 'heroku_fd1c348c48d7c8c',
  multipleStatements: true 
}
*/
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

handleDisconnect();

module.exports = app;

fs.writeFile("pliczek.txt", process.env.OPENSHIFT_MYSQL_DB_HOST, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port + ", host: " + process.env.OPENSHIFT_MYSQL_DB_HOST );
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


/*
  <% if(postulaty.length){ 
                                
                        for(var i = postulaty1.length-1;i >=0;i--) { %>
               <!--   <p class="naglowek_postu"> <a href="/przeszlosc/451"> <%= postulaty[i].tytul%> </a></p>-->
,postulaty1:rows[1]
                            <p class="gjhg"> <a href="<%=postulaty1[i].pathfile%>"> <%= postulaty1[i].idpost%> <%=postulaty1[i].pathfile%></a></p> 
                      <!--    <p class="naglowek_postu"> <a href="/przeszlosc/<%=i%>"> <%= postulaty[i].tytul%> </a></p>-->
                        <% } %>
                
                    <% } %>
                    */
