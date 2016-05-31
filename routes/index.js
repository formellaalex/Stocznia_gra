var express = require('express');
var encode = require( 'hashcode' ).hashCode;
var hash = encode().value( "my string value" ); 
var md5 = require('md5');
var router = express.Router();
var email = require("./email.js");

var zalogowano = false;
var zarazPoZalogowaniu = true;
var info = "";
var monit = "";
var vote_up;
var vote_down;

function tokenGen(length)
{
  var keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var str = '';
  var max = keyspace.length;
  for (var i = 0; i < length; ++i) {
      str += keyspace.charAt(Math.random() * max);
  }
  return str;
}

router.post('/add_user', function(req,res){
  var token = tokenGen(19);
  var post  = {
    _name: req.body._name, surname: req.body.surname,email: req.body.email,
    password: req.body.haslo, profile_img: "/default/batman.jpg",about_me: req.body.about_me,
    active: token
   };
  connection.query('SELECT email from users where email="' + req.body.email +'";', function(err,czyTenSamMail){
    if(czyTenSamMail.length == 0){
        connection.query('INSERT INTO users SET ?', post, function(err, result)
            {
              if (err) console.log("Error inserting : %s ",err );
                  connection.query('SELECT MAX(id) as id from users', function(err, insertId){
                  monit = "Na podany w formularzu email został wysłany link aktywacyjny. Proszę otworzyć skrzynkę mailową i zapoznać się z treścią otrzymanego maila, aby dokończyć rejestrację.";
                  
                  var values = {
                    msg: "Dupadupaduap",
                    from: "stoczniagame@gmail.com",
                    to: "formella.alex@gmail.com",
                    subject: "Testowy temat"
                  }
                  email.postfixSend(values, function(err){
                      if(err) res.redirect('/error');
                      else res.redirect("/activation");
                  });
                  
              });
      });
    }
    else{
      monit = "Podany email już isnieje w naszej bazie. Proszę zarejestrować się na inny adres.";
      res.redirect('/register');
    }
  });
});


router.get('/error', function(req,res){
  res.render("error.html");
});

router.get('/', function(req, res) {
  res.render("index.html");
});

router.get('/postulaty', function(req,res) {

});

router.get('/mapa', function(req,res) {
  if (req.cookies.remember) {
    
  }
  else {
    res.redirect("/login");
  }
});

router.get('/kolonista', function(req,res) {

});


router.get("/activation", function(req,res){

  res.render("aktywacja.html", {monit: monit});
});


router.get("/activate/:id/:hash",function(req,res){
  connection.query("SELECT aktywne FROM users WHERE id=" + connection.escape(req.params.id) + "AND aktywne='" + req.params.hash + "';", function(err,result){
    if(result.length > 0){
      connection.query("UPDATE users SET aktywne = NULL WHERE id=" + connection.escape(req.params.id), function(err,result2){
        if(err){
          res.render("/error");
        }
        else{
          monit = "Konto zostało aktywowane. Możesz się teraz zalogować.";
          res.redirect("/activation");
        }
      });
      }
    else{
      monit = "Link aktywacyjny jest niepoprawny lub konto zostało już aktywowane.";
      res.redirect("/activation");
    }
  });
  monit = "";
});

router.get('/register', function(req,res){
    res.render("register.html", {monit:monit});
    monit = "";
});

router.get('/czlowiek_ze_stoczni', function(req,res){
  res.render("stoczniowiec.html");
});

router.get('/zasady', function(req,res){
    res.render("reguly.html");
});


//Dodaj post
router.post('/add_post', function(req,res){
  if (req.cookies.remember){
  var post = {tytul: req.body.tytul, tresc: req.body.tresc, nick: req.cookies.id};
  connection.query('INSERT INTO tabela_postow SET ?', post, function(err, result){
    if (err)
      console.log("Error inserting : %s ",err );
    res.redirect('/przeszlosc');
  });

  }
  else{
    res.redirect('/logowanie');
  }
});

router.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.clearCookie('id');
  res.clearCookie('pos');
  info = "";
  res.redirect('back');
  zarazPoZalogowaniu = true;
});

router.post('/log', function(req,res){

  var query = 'SELECT id,aktywne FROM users where email=' + connection.escape(req.body.email) + ' AND haslo=' + connection.escape(req.body.haslo);
  console.log(query);
  connection.query(query, function(err, rows) {
    if (err) throw err;
    if(rows[0]){
      if(rows[0].aktywne == null){
         var minute = 3600 * 1000;
         res.cookie('remember', req.body.email, { maxAge: minute, httpOnly: true});
         res.cookie('id', rows[0].id);
         info = "";
         res.redirect('/');
      }
      else{
        info = "Konto nie zostało jeszcze aktywowane.";
        res.redirect('/logowanie');
      }
       
    }
    else{
      info = "Nieprawidłowy login lub hasło.";
      res.redirect('/logowanie');
    }
  });
});

//Logowanie
router.get('/login', function(req, res){
  if(req.cookies.remember){
    res.redirect('/');
  }
  else{
      res.render("login.html", {info:info});  
  }
  info = "";
});

router.get('/edit', function(req,res){
  if(req.cookies.remember){
    res.render("edit.html", {info: info});
  }
  else{
    res.redirect('/logowanie');
  }
  info = "";
});

//Strona glowna
router.get('/', function(req, res){
  console.log(hash);
  if(req.cookies.remember){
      res.render('zalogowano_initial.html', {title: 'zalogowano', user_pos: req.cookies.pos, przyciskKolonia: 'kolonia'});
  }
  else{
    res.redirect('/logowanie');
  }
});


//Zmiana hasła
router.post('/zmiana_hasla',function(req,res){
  if(req.cookies.remember){
  connection.query('SELECT haslo FROM users WHERE id=' + connection.escape(req.cookies.id),function(err, db_pass){
    if(err) console.log("Blad przy odczycie hasla\n");
    if(md5(req.body.old_password) == md5(db_pass[0].haslo)){
        connection.query('UPDATE users SET haslo="'+ req.body.new_password + '" WHERE email='+connection.escape(req.cookies.remember), function(err, result)
            {
              if (err) console.log("Blad przy zmianie hasla\n");
              info = "Zaktualizowano hasło.";
              res.redirect('/edit');
            });
      }
      else{
        info = "Błędne stare hasło.";
        res.redirect('/edit');
    }   

  });
}
  else{
    res.redirect('/logowanie');
  }
  
});


module.exports = router;