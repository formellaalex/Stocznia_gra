var express = require('express');
var formidable = require("formidable");
var encode = require( 'hashcode' ).hashCode;
var hash = encode().value( "my string value" ); 
var md5 = require('md5');
var router = express.Router();
var email = require("./email.js");
var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
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

var upload = multer({ storage : storage }).array('posts_photo',5);

router.post('/add_photo',function(req,res){

    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file." + err);
        }
        if(req.files.length > 0) {
          res.end("File is uploaded" + req.files[0].filename);
        }
        else {
          res.end("File was not uploaded");
        }
        
    });
});

router.post('/add_user', function(req,res){
  var token = tokenGen(19);
  var post  = {
    _name: req.body._name, surname: req.body.surname,email: req.body.email,
    password: req.body.password, profile_img: "/default/batman.jpg",about_me: req.body.about_me,
    active: token
   };
   console.log(post);
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
  connection.query(
    "SELECT posts.id as posts_id,title,message,added,_name,surname,sum(rate_pos) as likes_pos, sum(rate_neg) as likes_neg FROM posts JOIN users ON users.id= posts.users_id LEFT JOIN like_posts on like_posts.posts_id = posts.id group by posts.id;", 
    function(err, postulaty) {
      if (err) console.log(err);
      res.render("graostocznie.html", {postulaty: postulaty});
    });
});

router.get("/postulat/:id", function(req,res) {
  connection.query(
    "SELECT posts.id as posts_id,title,message,added,_name,surname,sum(rate_pos) as likes_pos, sum(rate_neg) as likes_neg FROM posts JOIN users ON users.id= posts.users_id LEFT JOIN like_posts on like_posts.posts_id = posts.id where posts.id = "+connection.escape(req.params.id)+" group by posts.id", 
    function(err, postulat) {
      if (err) console.log(err);
      connection.query("SELECT comments.id as comments_id,message,added,users._name AS _name, sum(rate_pos) as likes_pos, sum(rate_neg) as likes_neg FROM comments JOIN users ON users.id = comments.users_id LEFT JOIN like_comments ON like_comments.comments_id = comments.id WHERE posts_id="+connection.escape(req.params.id)+" group by comments.id;",
      function(err,komentarze){
        if(err) console.log(err);
        connection.query("SELECT subcomments.id as subcomments_id,subcomments.message as message,subcomments.comments_id, subcomments.added as added,users._name AS _name,sum(rate_pos) as likes_pos, sum(rate_neg) as likes_neg FROM subcomments JOIN comments on comments.id= subcomments.comments_id JOIN users  ON users.id = subcomments.users_id LEFT JOIN like_subcomments ON like_subcomments.subcomments_id = subcomments.id WHERE posts_id="+connection.escape(req.params.id)+" group by subcomments.id",
        function(err, subcomments){
          connection.query("SELECT path,title from posts_files where posts_id=" + connection.escape(req.params.id) + ";", function(err,photos){
            res.render("postulat.html", {postulat: postulat, komentarze: komentarze, subcomments: subcomments, photos: photos});
          });
        });
      });
    });
});

router.get("/dodaj_postulat", function(req, res) {
  res.render("dodaj_postulat.html");
});

router.post("/like_post", function(req,res) {
  connection.query("SELECT posts_id from like_posts where posts_id="+ connection.escape(req.body.posts_id) + " and users_id=1;",
  function(err, likes) {
    if(!likes.length) {
      likesBody = {users_id: 1, rate_pos: 1, posts_id: req.body.posts_id};
      if(req.body.rate < 0) {
        likesBody = {users_id: 1, rate_neg: -1, posts_id: req.body.posts_id};
      }
      connection.query("INSERT INTO like_posts SET ?", likesBody, function(err, result){
        if(err) console.log("ERROR" + err);
        else{
          res.redirect("back");
        }
      });
    }
    else{
      res.redirect("back");
    }
  });
});

router.post("/like_comment", function(req,res) {
  connection.query("SELECT comments_id from like_comments where posts_id="+ connection.escape(req.body.posts_id) + " and users_id=1;",
  function(err, likes) {
    if(!likes.length) {
      likesBody = {users_id: 1, rate_pos: 1, posts_id: req.body.posts_id};
      if(req.body.rate < 0) {
        likesBody = {users_id: 1, rate_neg: -1, posts_id: req.body.posts_id};
      }
      connection.query("INSERT INTO like_comments SET ?", likesBody, function(err, result){
        if(err) console.log("ERROR" + err);
        else{
          res.redirect("back");
        }
      });
    }
    else{
      res.redirect("back");
    }
  });
});

router.post("/like_subcomment", function(req,res) {
  connection.query("SELECT subcomments_id from like_subcomments where posts_id="+ connection.escape(req.body.posts_id) + " and users_id=1;",
  function(err, likes) {
    if(!likes.length) {
      likesBody = {users_id: 1, rate_pos: 1, posts_id: req.body.posts_id};
      if(req.body.rate < 0) {
        likesBody = {users_id: 1, rate_neg: -1, posts_id: req.body.posts_id};
      }
      connection.query("INSERT INTO like_subcomments SET ?", likesBody, function(err, result){
        if(err) console.log("ERROR" + err);
        else{
          res.redirect("back");
        }
      });
    }
    else{
      res.redirect("back");
    }
  });
});

router.post("/dodaj_komentarz", function(req, res) {
  var post = {message: req.body.message, posts_id: req.body.posts_id, users_id: 1};
  connection.query('INSERT INTO comments SET ?', post, function(err, result){
    if (err) console.log("err");
    res.redirect('/postulat/' + req.body.posts_id);
  });
});

router.post("/add_subcomment", function(req, res) {
  var post = {message: req.body.message, comments_id: req.body.comments_id, users_id: 1};
  console.log(post);
  connection.query('INSERT INTO subcomments SET ?', post, function(err, result){
    if (err) console.log(err);

    res.redirect('/postulat/' + req.body.posts_id);
  });
});

router.post("/publikuj_postulat", function(req, res) {
  upload(req,res,function(err) {
    if(err) {
      console.log("Error uploading file." + err);
      res.redirect("/error");
    }
    else {
      if(req.files.length > 0) {
        addPost(req,res,function(insertId){
          var query = "INSERT into posts_files SET ?";
          req.files.forEach(function(file){
            var filepath = "./uploads/" + file.originalname;
            var image = {path: filepath, posts_id: insertId,title: "Tytuł"};
            connection.query(query, image, function(result, err){
              if(err) console.log(err);
            });
          });
        });        
      }
      else {
        addPost(req,res, null);
      }
    }
  });
  res.redirect("/postulaty");
});


function addPost(req,res,callback) {
  var body = {
    title: req.body.title, message: req.body.message, users_id: 1
  };
  connection.query("INSERT INTO posts SET ?", body, function(err,result){
    console.log(result);
    if(err) {
      console.log(err);
      res.redirect("/error");
    }
    else {
      if(callback != null) {
        callback(result.insertId);
      }
    }
  });
}

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
  
  var post = {tytul: req.body.tytul, tresc: req.body.tresc, nick: req.cookies.id};
  connection.query('INSERT INTO tabela_postow SET ?', post, function(err, result){
    if (err)
      console.log("Error inserting : %s ",err );
    res.redirect('/przeszlosc');
  });
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