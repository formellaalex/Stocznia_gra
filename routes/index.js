var express = require('express');
var encode = require( 'hashcode' ).hashCode;
var hash = encode().value( "my string value" ); 
var md5 = require('md5');
var router = express.Router();

var sendgrid = require("sendgrid")("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");
var email = new sendgrid.Email();

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

router.get('/error', function(req,res){

  res.render("error.html");
});

router.get('/aktualnosci', function(req,res){
  if(req.cookies.remember){
      res.render("aktualnosci.html");
  }
  else{
    res.redirect('/');
  }
  
});


router.get('/przestrzen_temp', function(req,res){
  if(req.cookies.remember){
      res.render("przestrzen_temp.html");
  }
  else{
    res.redirect('/');
  }
  
});



//Like dla postu
router.post('/vote_up/:id/:type/:post_id/:strona', function(req,res){
  console.log(req.params.id);
  var post = {item_id: req.params.id, rate: 1, user_id: req.cookies.id,type: req.params.type};
  connection.query("SELECT * FROM rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+"';", function(err, result){
    console.log(result);
    if(result.length < 1){
      connection.query("INSERT INTO rating set ?", post, function(err, result)
      {
        if (err){

          console.log("Error inserting : %s ",err );

        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }

      });
    }
    else if(result.length > 0 && result[0].rate < 0){
      connection.query("DELETE from rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+ "';", function(err, result){
        connection.query("INSERT INTO rating set ?", post, function(err, result){
          if (err){

          console.log("Error inserting : %s ",err );

        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }
        });

      });
    }
    else{
      connection.query("DELETE from rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+"';", function(err, result){
        if(err){
          console.log("Error deleting : %s", err);
        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }
      });
      
    }
  });
  
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
          console.log(result2);
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

//Dislike dla postu
router.post('/vote_down/:id/:type/:post_id/:strona', function(req,res){
  console.log(req.params.id);
  var post = {item_id: req.params.id, rate: -1, user_id: req.cookies.id,type: req.params.type};
  connection.query("SELECT * FROM rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+"';", function(err, result){
    console.log(result);
    if(result.length < 1){
      connection.query("INSERT INTO rating set ?", post, function(err, result)
      {
        if (err){

          console.log("Error inserting : %s ",err );

        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }

      });
    }
    else if(result.length > 0 && result[0].rate > 0){
      connection.query("DELETE from rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+ "';", function(err, result){
        connection.query("INSERT INTO rating set ?", post, function(err, result){
          if (err){

          console.log("Error inserting : %s ",err );

        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }
        });

      });
    }
    else{
      connection.query("DELETE from rating WHERE item_id=" + req.params.id + " AND user_id=" + req.cookies.id + " AND type='"+ req.params.type+"';", function(err, result){
        if(err){
          console.log("Error deleting : %s", err);
        }
        else{
          res.redirect("/forum/"+req.params.strona+"/"+req.params.post_id);
        }
      });
      
    }
  });
  
});


//Dodaj uzytkownika
router.post('/add_user', function(req,res){
  var token = tokenGen(19);
  var post  = {imie: req.body.imie, nazwisko: req.body.nazwisko,email: req.body.email,haslo: req.body.haslo, profilowe: "/default/batman.jpg",o_mnie: req.body.o_mnie, aktywne: token};
  connection.query('SELECT email from users where email="' + req.body.email +'";', function(err,czyTenSamMail){
    if(czyTenSamMail.length == 0){
        connection.query('INSERT INTO users SET ?', post, function(err, result)
            {
              if (err)
                  console.log("Error inserting : %s ",err );
              connection.query('SELECT MAX(id) as id from users', function(err, insertId){
                  monit = "Na podany w formularzu email został wysłany link aktywacyjny. Proszę otworzyć skrzynkę mailową i zapoznać się z treścią otrzymanego maila, aby dokończyć rejestrację.";
                  /*server.send({
                   text:    "To już ostatni krok do rozpoczęcia Gry o stocznię! Kliknij w poniższy link aby aktywować swoje konto : \n localhost:8080/activate/" + insertId.id + "/" + encode().value(req.body.email + new Date().toJSON().slice(0,10).toString()), 
                   from:    "Gra o stocznię <stoczniagame@gmail.com>", 
                   to:      "<" + req.body.email + ">",
                   cc:      "Gra o stocznię <stoczniagame@gmail.com>",
                   subject: "Aktywacja konta w Grze o stocznię"
                  }, function(err, message) { console.log(err || message); });*/
                  email.addTo(req.body.email);
                  email.setFrom("stoczniagame@gmail.com");
                  email.setSubject("Rejestracja w Grze o Stocznie");
                  email.setHtml("To już ostatni krok do rozpoczęcia Gry o stocznię! Kliknij w poniższy link aby aktywować swoje konto : \n http://www.gra-o-stocznie.org.pl/activate/" + insertId[0].id + "/" + token.toString());
                  sendgrid.send(email);
                  res.redirect("/activation");
              });
      });
    }
    else{
      monit = "Podany email już isnieje w naszej bazie. Proszę zarejestrować się na inny adres.";
      res.redirect('/register');

    }
  });

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
    res.redirect('/');
  }
});




router.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.clearCookie('id');
  res.clearCookie('pos');
  info = "";
  res.redirect('/');
  zarazPoZalogowaniu = true;
});


//Forum
router.get('/forum/:strona', function (req, res)
{
var postulaty;
var tiger;
    ciastka=req.cookies.remember;
    var postulaty = "select tabela_postow.id,tytul, tresc, IF(komentarze_swoje.punkty IS NULL, 0,komentarze_swoje.punkty)+ " +
    "IF(komentarze_obce.punkty IS NULL, 0,komentarze_obce.punkty) + IF(rating_swoj.punkty IS NULL, 0, rating_swoj.punkty)+ " +
    "IF(rating_obce.punkty IS NULL, 0, rating_obce.punkty) + IF(rating_swoj_kom.punkty IS NULL, 0, rating_swoj_kom.punkty) +" +
    "IF(rating_obcy_kom.punkty IS NULL, 0, rating_obcy_kom.punkty) suma_punktow_post from tabela_postow " +
    "left join (select 10*count(*) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick = " +
    "tabela_postow.nick group by id_postu_uzytkownika) komentarze_swoje on komentarze_swoje.id = tabela_postow.id " +
    "left join (select sum(rate) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != " +
    "tabela_postow.nick group by id_postu_uzytkownika) komentarze_obce on komentarze_obce.id = tabela_postow.id " +
    "left join (select count(*) punkty, item_id from rating left join tabela_postow on " +
    "rating.item_id = tabela_postow.id where rating.user_id = tabela_postow.nick AND rating.type='post' " +
    "group by item_id) rating_swoj on rating_swoj.item_id = tabela_postow.id " +
    "left join (select 0.5*sum(rate) punkty, item_id from rating left join tabela_postow on " +
    "rating.item_id = tabela_postow.id where rating.user_id != tabela_postow.nick AND rating.type='post' " +
    "group by item_id) rating_obce on rating_obce.item_id = tabela_postow.id " +
    "left join (select count(*) punkty, item_id,id_postu_uzytkownika from rating left join tablica_komentarzy on " +
    "rating.item_id = tablica_komentarzy.IdKomentarzu where rating.user_id = tablica_komentarzy.nick AND rating.type='past_kom' " +
    "group by id_postu_uzytkownika) rating_swoj_kom on rating_swoj_kom.id_postu_uzytkownika = tabela_postow.id " +
    "left join (select 0.5*sum(rating.rate) punkty, item_id,id_postu_uzytkownika from rating left join tablica_komentarzy on " +
    "rating.item_id = tablica_komentarzy.IdKomentarzu where rating.user_id != tablica_komentarzy.nick AND rating.type='past_kom' " +
    "group by id_postu_uzytkownika) rating_obcy_kom on rating_obcy_kom.id_postu_uzytkownika = tabela_postow.id " +
    "where tabela_postow.strona = '" + req.params.strona + "' ORDER BY suma_punktow_post ASC;";
    connection.query(postulaty +"SELECT idpost,pathfile FROM tabfile;select tabela_postow.id , tytul,tresc, nick, data_dodania, ilosc_click, imie, nazwisko from users,tabela_postow where tabela_postow.id="+connection.escape(471)+" and strona='"+req.params.strona+"'", function(err, result) {
      if (err) throw err;

          res.render('forum.html', {title: 'Forum', postulaty:result[0],postulaty1:result[1],postulaty2:result[2], ciasta:ciastka , idcookies:req.cookies.id,capfile:3 ,id: result[0].length-1,tiger:0, vote_up: "", vote_down: "",strona:req.params.strona});
       // tutaj przekazanie zmiennej do widoku
    });

});

//Forum - konretny post
router.get('/forum/:strona/:id', function(req,res){
   var postulaty;
   var tiger;
    ciastka=req.cookies.remember;
    ciastka1= parseInt(req.cookies.id);
    var postulaty = "select tabela_postow.id,tytul, tresc, IF(komentarze_swoje.punkty IS NULL, 0,komentarze_swoje.punkty)+ " +
    "IF(komentarze_obce.punkty IS NULL, 0,komentarze_obce.punkty) + IF(rating_swoj.punkty IS NULL, 0, rating_swoj.punkty)+ " +
    "IF(rating_obce.punkty IS NULL, 0, rating_obce.punkty) + IF(rating_swoj_kom.punkty IS NULL, 0, rating_swoj_kom.punkty) +" +
    "IF(rating_obcy_kom.punkty IS NULL, 0, rating_obcy_kom.punkty) suma_punktow_post from tabela_postow " +
    "left join (select 10*count(*) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick = " +
    "tabela_postow.nick group by id_postu_uzytkownika) komentarze_swoje on komentarze_swoje.id = tabela_postow.id " +
    "left join (select sum(rate) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != " +
    "tabela_postow.nick group by id_postu_uzytkownika) komentarze_obce on komentarze_obce.id = tabela_postow.id " +
    "left join (select count(*) punkty, item_id from rating left join tabela_postow on " +
    "rating.item_id = tabela_postow.id where rating.user_id = tabela_postow.nick AND rating.type='post' " +
    "group by item_id) rating_swoj on rating_swoj.item_id = tabela_postow.id " +
    "left join (select 0.5*sum(rate) punkty, item_id from rating left join tabela_postow on " +
    "rating.item_id = tabela_postow.id where rating.user_id != tabela_postow.nick AND rating.type='post' " +
    "group by item_id) rating_obce on rating_obce.item_id = tabela_postow.id " +
    "left join (select count(*) punkty, item_id,id_postu_uzytkownika from rating left join tablica_komentarzy on " +
    "rating.item_id = tablica_komentarzy.IdKomentarzu where rating.user_id = tablica_komentarzy.nick AND rating.type='past_kom' " +
    "group by id_postu_uzytkownika) rating_swoj_kom on rating_swoj_kom.id_postu_uzytkownika = tabela_postow.id " +
    "left join (select 0.5*sum(rating.rate) punkty, item_id,id_postu_uzytkownika from rating left join tablica_komentarzy on " +
    "rating.item_id = tablica_komentarzy.IdKomentarzu where rating.user_id != tablica_komentarzy.nick AND rating.type='past_kom' " +
    "group by id_postu_uzytkownika) rating_obcy_kom on rating_obcy_kom.id_postu_uzytkownika = tabela_postow.id " +
    "where tabela_postow.strona = '" + req.params.strona + "' ORDER BY suma_punktow_post ASC;";

    var comments_count = "select IF(swoje.punkty IS NULL,0,swoje.punkty) +  IF(obce_poz.punkty IS NULL,0, obce_poz.punkty) pozytywne "+
    ",IF(obce_neg.punkty IS NULL, 0, obce_neg.punkty) negatywne, tabela_postow.id from tabela_postow " +
    "left join(select 10*count(*) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick = " +
    "tabela_postow.nick group by id_postu_uzytkownika) swoje on tabela_postow.id = swoje.id " +
    "left join(select sum(rate) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != " +
    "tabela_postow.nick and rate > 0 group by id_postu_uzytkownika) obce_poz on tabela_postow.id = obce_poz.id " +
    "left join(select sum(rate) punkty, id from tablica_komentarzy left join tabela_postow on " +
    "tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != " +
    "tabela_postow.nick and rate < 0 group by id_postu_uzytkownika) obce_neg on tabela_postow.id = obce_neg.id " +
    "WHERE strona='" + req.params.strona + "' AND tabela_postow.id=" + req.params.id + ";";
    connection.query(postulaty + "SELECT idpost,pathfile,rozszerzenie,name_pic FROM tabfile WHERE idpost="+connection.escape(req.params.id)+" ;SELECT tabela_postow.id, tytul,tresc, nick, data_dodania, imie,czas_dodania, nazwisko,profilowe FROM users,tabela_postow WHERE nick=users.id AND tabela_postow.id="+connection.escape(req.params.id)+" AND strona='"+req.params.strona+"' ;SELECT SUM(if(rating.rate>0, 1, 0)) AS ilosc_like,SUM(if(rating.rate<0, 1, 0)) AS ilosc_dislike, IdKomentarzu,ilosc_podkomentarzy,id_parent, nick,czas_dodania_kom,profilowe, imie, nazwisko,tresc,komentarze.rate from rating RIGHT JOIN (SELECT* FROM tablica_komentarzy WHERE id_postu_uzytkownika="+connection.escape(req.params.id)+") as komentarze on item_id=IdKomentarzu right join users on users.id=komentarze.nick where type = 'past_kom' OR type IS NULL AND IdKomentarzu IS NOT NULL GROUP BY IdKomentarzu ORDER BY data_kom DESC;SELECT id_post_kom,pic_id_kom,idpost_kom,pathfile_kom,rozszerzenie,name_pic FROM tabfilekomentarze WHERE id_post_kom="+connection.escape(req.params.id)+" ORDER BY pic_id_kom DESC;" + comments_count ,function(err,result ) {
    if (err) throw err;
    get_user(req.cookies.id, req.params.id,function(err,data){
      if(err){
        console.log(err)
      }
      else{
        if(data[0].ilosc>0 && data[0].rate <0){
          vote_down = "_active";
          vote_up = "";


        }
        else if(data[0].ilosc >0 && data[0].rate >0){
          vote_down = "";
          vote_up = "_active";
        }
        else{
          vote_up = "";
          vote_down = "";
         
        }
        res.render('forum.html', {title: 'Forum', postulaty:result[0],postulaty1:result[1],postulaty2:result[2],postulaty3:result[3],postulaty4:result[4],huj:ciastka1,idcookies:req.cookies.id, ciasta:ciastka,id:result[0].length-1,capfile: req.params.id,tiger:1, vote_down: vote_down, vote_up: vote_up, vote_up_count: data[1].ilosc, vote_down_count: data[2].ilosc, comments_count: result[5],strona:req.params.strona, post_id: req.params.id}); // req.params.id tutaj przekazanie zmiennej do widoku

      }
    });
    });
});

router.get('/forum1/:strona/:id', function(req,res){
   var postulaty;
   var tiger;
    ciastka=req.cookies.remember;
    ciastka1= parseInt(req.cookies.id);
    connection.query("select tabela_postow.id, IF(punkty.suma_punktow IS NULL, 0, punkty.suma_punktow) as suma_punktow, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow  LEFT JOIN (SELECT item_id, SUM(rate) as suma_punktow FROM rating group by item_id) as punkty ON punkty.item_id = tabela_postow.id where nick=users.id and strona='"+req.params.strona+"' ORDER BY data_kom DESC; SELECT idpost,pathfile,pic_id,rozszerzenie,name_pic FROM tabfile WHERE idpost="+connection.escape(req.params.id)+" ORDER BY pic_id ASC ;SELECT tabela_postow.id, tytul,tresc, nick, data_dodania, imie,czas_dodania, nazwisko,profilowe from users,tabela_postow where nick=users.id AND tabela_postow.id="+connection.escape(req.params.id)+" and strona='"+req.params.strona+"' ;select SUM(if(rating.rate>0, 1, 0)) as ilosc_like,SUM(if(rating.rate<0, 1, 0)) as ilosc_dislike, IdKomentarzu,ilosc_podkomentarzy,id_parent, nick,czas_dodania_kom,profilowe, imie, nazwisko,tresc,komentarze.rate from rating right join (select * from tablica_komentarzy where id_postu_uzytkownika="+connection.escape(req.params.id)+") as komentarze on item_id=IdKomentarzu right join users on users.id=komentarze.nick where type = 'kom' OR type IS NULL AND IdKomentarzu IS NOT NULL group by IdKomentarzu order by IdKomentarzu DESC;SELECT id_post_kom,pic_id_kom,idpost_kom,pathfile_kom,rozszerzenie,name_pic FROM tabfilekomentarze WHERE id_post_kom="+connection.escape(req.params.id)+" ORDER BY pic_id_kom ASC; SELECT count(komentarze.Idkomentarzu) as ilosc, komentarze.rate from (select * from tablica_komentarzy where id_postu_uzytkownika="+ connection.escape(req.params.id) + ") as komentarze right join tablica_komentarzy on komentarze.IdKomentarzu = tablica_komentarzy.IdKomentarzu group by komentarze.rate order by rate desc;" ,function(err,result ) {
    if (err) throw err;
    if(!result[5][0] || !result[5][1]){
      result[5][0] = {ilosc:0,rate:0};
      result[5][1] = {ilosc:0,rate:0};

    }
    get_user(req.cookies.id, req.params.id,function(err,data){
      if(err){
        console.log(err)
      }
      else{
        if(data[0].ilosc>0 && data[0].rate <0){
          vote_down = "_active";
          vote_up = "";


        }
        else if(data[0].ilosc >0 && data[0].rate >0){
          vote_down = "";
          vote_up = "_active";
        }
        else{
          vote_up = "";
          vote_down = "";
         
        }
          res.render('forum.html', {title: 'Przeszloc', postulaty:result[0],postulaty1:result[1],postulaty2:result[2],postulaty3:result[3],postulaty4:result[4],huj:ciastka1,idcookies:req.cookies.id, ciasta:ciastka,id:result[0].length-1,capfile: req.params.id,tiger:1, vote_down: vote_down, vote_up: vote_up, vote_up_count: data[1].ilosc, vote_down_count: data[2].ilosc, comments_count: result[5],strona:req.params.strona}); // req.params.id tutaj przekazanie zmiennej do widoku

      }
    });
    });
});


router.get('/mapa_przeszlosc', function(req,res){
var postulaty;
var tiger;
var strona="mapa_przeszlosc";
    ciastka=req.cookies.remember;

  /* UWAGA po czyszczeniu serwera bazy zdjec trzeba tutaj zmienic id na koncu drugiego selecta na id pierwszego postu w bazie danych*/
    connection.query("select tabela_postow.id, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow where nick=users.id and strona='"+strona+"' ORDER BY czas_dodania_kom;SELECT idpost,pathfile FROM tabfile;select tabela_postow.id , tytul,tresc, nick, data_dodania, ilosc_click, imie, nazwisko from users,tabela_postow where tabela_postow.id="+connection.escape(471)+" and strona='"+strona+"'", function(err, result) {
      if (err) throw err;
    res.render('mapa_przeszlosc.html', {title: 'Forum', postulaty:result[0],postulaty1:result[1],postulaty2:result[2], ciasta:ciastka , idcookies:req.cookies.id,capfile:3 ,id: result[0].length-1,tiger:0, vote_up: "", vote_down: "",strona:strona}); // req.params.id tutaj przekazanie zmiennej do widoku
      });
    
});


/*
router.get('/mapa_przeszlosc', function(req,res){
  
res.render('mapa_przeszlosc.html', {title: 'Przeszloscmappa'}); // req.params.id tutaj przekazanie zmiennej do widoku

});*/
  /*  if (err) throw err;
    if(!result[5][1]){
      result[5][1] = {ilosc: 0, rate: 0};
    }
    else if(!result[5][0]){
      result[5][0].ilosc = {ilosc: 0, rate: 0};
    }
    get_user(req.cookies.id, req.params.id,function(err,data){
      if(err){
        console.log(err)
      }
      else{
        if(data[0].ilosc>0 && data[0].rate <0){
          vote_down = "_active";
          vote_up = "";
        }
        else if(data[0].ilosc >0 && data[0].rate >0){
          vote_down = "";
          vote_up = "_active";
        }
        else{
          vote_up = "";
          vote_down = "";
         
        }
          res.render('forum.html', {title: 'Przeszlosc', postulaty:result[0],postulaty1:result[1],postulaty2:result[2],postulaty3:result[3],postulaty4:result[4],huj:ciastka1, ciasta:ciastka,id:result[0].length-1,capfile: req.params.id,tiger:1, vote_down: vote_down, vote_up: vote_up, vote_up_count: data[1].ilosc, vote_down_count: data[2].ilosc, comments_count: result[5]}); // req.params.id tutaj przekazanie zmiennej do widoku
      }
    });
    });
  }
  else{
    res.redirect('/logowanie');
  }
});
*/

//Usun postulat
router.get('/deletepostulat/:id?', function(req,res){
   var backURL=req.header('Referer') || '/';
  console.log(req.params.id);
   var postulaty;
   var tiger;

  if (req.cookies.remember){
    ciastka=req.cookies.remember;
     var id = req.params.id;
        connection.query("DELETE FROM tabela_postow WHERE id = ? ; DELETE FROM tabfile WHERE idpost="+connection.escape(id),[id], function(err, rows)
        //connection.query("DELETE FROM tablica_komentarzy  WHERE IdKomentarzu = ?",[id], function(err, rows)
        {
             if(err)
                 console.log("Error deleting : %s ",err );
            res.redirect(backURL);
             //res.redirect('/przeszlosc');
             
        });
  }
  else{
    res.redirect('/');
  }
});

//Usun komentarz
router.post('/delete/:id?', function(req,res){
  var backURL=req.header('Referer') || '/';
  console.log(req.params.id);
   var postulaty;
   var tiger;

  if (req.cookies.remember){
    ciastka=req.cookies.remember;
     var id = req.params.id;   
     console.log(id);
        connection.query("delete t1,t2 from tablica_komentarzy t1 left join tabfilekomentarze t2 on IdKomentarzu=idpost_kom where IdKomentarzu = " +connection.escape(id) + ";",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            res.redirect(backURL);
             //res.redirect('/przeszlosc');
             
        });
  }
  else{
    res.redirect('/');
  }
});


 // /log i kolonisci ORDER BY punkty DESC
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
         res.redirect('/glowna');
      }
      else{
        info = "Konto nie zostało jeszcze aktywowane.";
        res.redirect('/');
      }
       
    }
    else{
      info = "Nieprawidłowy login lub hasło.";
      res.redirect('/');
    }
  });
});

router.get('/', function(req, res){
  if(req.cookies.remember){
    res.redirect('/glowna');
  }
  else{
    res.render("index.html", {info:info});  
  }
  info = "";
});

router.get('/edit', function(req,res){
  if(req.cookies.remember){
    res.render("edit.html", {info: info});
  }
  else{
    res.redirect('/');
  }
  info = "";
});

//Strona glowna
router.get('/glowna', function(req, res){
  var logged = false;
  if(req.cookies.remember) {
    logged = true;
  }
  res.render('zalogowano_initial.html', {title: 'zalogowano', logged: logged, przyciskKolonia: 'kolonia'});

});

router.get('/kolonia', function(req, res){
  var logged = false;
  if(req.cookies.remember) {
    logged = true;
  }
  res.render('zalogowano.html', {title: 'zalogowano', logged: logged, przyciskKolonia: 'koloniastoczniazaznaczone'});
});

//Lista kolonistow
router.get('/kolonisci', function(req, res) {
  var data;
  if (req.cookies.remember) {
    ciastka=req.cookies.remember;
    connection.query('SELECT * FROM users where id=' + req.cookies.id + ';', function(err, rows, fields) {
      if (err) throw err;
      var wyliczeniaQuery = "select users.profilowe as profilowe,users.email as email,users.id as user_id,users.imie as imie, users.nazwisko as nazwisko, IF(postulaty.ilosc IS NULL,0,postulaty.ilosc ) + IF(komentarze.ilosc IS NULL,0,komentarze.ilosc) + IF(rating.ilosc IS NULL,0,rating.ilosc) + IF(komentarze_obce.ilosc IS NULL, 0, komentarze_obce.ilosc) + IF(rating_obcy_kom.ilosc IS NULL,0, rating_obcy_kom.ilosc) + IF(rating_obcy_post.ilosc IS NULL, 0, rating_obcy_post.ilosc) as suma_pkt from (select id,imie,nazwisko,email,profilowe from users) users ";
      var postulatyQuery = "left join (select 20*count(*) ilosc, id,nick from tabela_postow group by nick) postulaty on users.id = postulaty.nick ";
      var komentarzeQuery = "left join (select 10*count(*) ilosc, nick from tablica_komentarzy group by nick) komentarze on users.id = komentarze.nick ";
      var ratingQuery = "left join (select count(*) ilosc, user_id from rating group by user_id) rating on rating.user_id = users.id ";
      var komentarzeObceQuery = "left join (select sum(tablica_komentarzy.rate) ilosc, tabela_postow.nick user_id from tablica_komentarzy left join tabela_postow on tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != tabela_postow.nick group by tabela_postow.nick) komentarze_obce on komentarze_obce.user_id = users.id ";
      var ratingKomObcyQuery = "left join (select 0.5*sum(rating.rate) ilosc, tabela_postow.nick user_id from rating left join tabela_postow on tabela_postow.id = rating.item_id where rating.user_id != tabela_postow.nick AND rating.type='post' group by tabela_postow.nick) rating_obcy_post on rating_obcy_post.user_id = users.id ";
      var ratingPostObcyQuery = "left join (select 0.5*sum(rating.rate) ilosc, tablica_komentarzy.nick user_id from rating left join tablica_komentarzy on tablica_komentarzy.IdKomentarzu = rating.item_id where rating.user_id != tablica_komentarzy.nick AND tablica_komentarzy.nick > 0 AND rating.type='past_kom' group by tablica_komentarzy.nick) rating_obcy_kom on rating_obcy_kom.user_id = users.id where users.id > 0 order by suma_pkt DESC;";
      console.log(wyliczeniaQuery + postulatyQuery + komentarzeQuery + ratingQuery + komentarzeObceQuery + ratingKomObcyQuery + ratingPostObcyQuery);
      connection.query(wyliczeniaQuery + postulatyQuery + komentarzeQuery + ratingQuery + komentarzeObceQuery + ratingKomObcyQuery + ratingPostObcyQuery, function(err,list){
        if(err) throw err;
        res.render('kolonia.html', {title: 'Kolonia', data:rows, list : list, ciasta:ciastka, user_id: req.cookies.id,tiger_profilowy:0}); // tutaj przekazanie zmiennej do widoku
      });
    });
  }
  else {
  res.redirect('/');
 }

});

//Profil usera
router.get('/kolonisci/:nick?', function(req, res) {
  var data;
  if (req.cookies.remember) {
    ciastka=req.cookies.remember;
    connection.query('SELECT * FROM users where id=' + connection.escape(req.params.nick) + ';', function(err, rows, fields) {
       if (err) throw err;
      var wyliczeniaQuery = "select users.profilowe as profilowe,users.email as email,users.id as user_id,users.imie as imie, users.nazwisko as nazwisko, IF(postulaty.ilosc IS NULL,0,postulaty.ilosc ) + IF(komentarze.ilosc IS NULL,0,komentarze.ilosc) + IF(rating.ilosc IS NULL,0,rating.ilosc) + IF(komentarze_obce.ilosc IS NULL, 0, komentarze_obce.ilosc) + IF(rating_obcy_kom.ilosc IS NULL,0, rating_obcy_kom.ilosc) + IF(rating_obcy_post.ilosc IS NULL, 0, rating_obcy_post.ilosc) as suma_pkt from (select id,imie,nazwisko,email,profilowe from users) users ";
      var postulatyQuery = "left join (select 20*count(*) ilosc, id,nick from tabela_postow group by nick) postulaty on users.id = postulaty.nick ";
      var komentarzeQuery = "left join (select 10*count(*) ilosc, nick from tablica_komentarzy group by nick) komentarze on users.id = komentarze.nick ";
      var ratingQuery = "left join (select count(*) ilosc, user_id from rating group by user_id) rating on rating.user_id = users.id ";
      var komentarzeObceQuery = "left join (select sum(tablica_komentarzy.rate) ilosc, tabela_postow.nick user_id from tablica_komentarzy left join tabela_postow on tablica_komentarzy.id_postu_uzytkownika = tabela_postow.id where tablica_komentarzy.nick != tabela_postow.nick group by tabela_postow.nick) komentarze_obce on komentarze_obce.user_id = users.id ";
      var ratingKomObcyQuery = "left join (select 0.5*sum(rating.rate) ilosc, tabela_postow.nick user_id from rating left join tabela_postow on tabela_postow.id = rating.item_id where rating.user_id != tabela_postow.nick AND rating.type='post' group by tabela_postow.nick) rating_obcy_post on rating_obcy_post.user_id = users.id ";
      var ratingPostObcyQuery = "left join (select 0.5*sum(rating.rate) ilosc, tablica_komentarzy.nick user_id from rating left join tablica_komentarzy on tablica_komentarzy.IdKomentarzu = rating.item_id where rating.user_id != tablica_komentarzy.nick AND tablica_komentarzy.nick > 0 AND rating.type='past_kom' group by tablica_komentarzy.nick) rating_obcy_kom on rating_obcy_kom.user_id = users.id where users.id > 0 order by suma_pkt DESC;";
      console.log(wyliczeniaQuery + postulatyQuery + komentarzeQuery + ratingQuery + komentarzeObceQuery + ratingKomObcyQuery + ratingPostObcyQuery);
      connection.query(wyliczeniaQuery + postulatyQuery + komentarzeQuery + ratingQuery + komentarzeObceQuery + ratingKomObcyQuery + ratingPostObcyQuery, function(err,list){
        if(err) throw err;
        res.render('kolonia.html', {title: 'Kolonia', data:rows, list : list, ciasta:ciastka, user_id: req.params.nick,tiger_profilowy:0}); // tutaj przekazanie zmiennej do widoku
      });
    });
  }

  else{
  res.redirect('/');
 }

});

//Aktualizacja danych
router.post('/uaktualnij', function(req,res){
  if(req.cookies.remember){
    var post  = {};
  if(req.body.new_name != ""){
    post.imie = req.body.new_name;
  }
  if(req.body.new_surname != ""){
    post.nazwisko = req.body.new_surname;
  }
  connection.query('UPDATE users SET ? WHERE email='+connection.escape(req.cookies.remember), post, function(err, result)
          {
            if (err){
              info = "Błąd przy zmianie danych.";
              res.redirect('/edit');
            }
            else{
              info = "Zaktualizowano dane.";
              res.redirect("/edit");
            }
          });
  }
  else{
    res.redirect('/');
  }
        
});

//Zmiana hasła
router.post('/zmiana_hasla',function(req,res){
  if(req.cookies.remember){
  connection.query('SELECT haslo FROM users WHERE id=' + connection.escape(req.cookies.id),function(err, db_pass){
    if(err)
        console.log("Blad przy odczycie hasla\n");
    if(md5(req.body.old_password) == md5(db_pass[0].haslo)){
        connection.query('UPDATE users SET haslo="'+ req.body.new_password + '" WHERE email='+connection.escape(req.cookies.remember), function(err, result)
            {
              if (err)
                console.log("Blad przy zmianie hasla\n");
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
    res.redirect('/');
  }
  
});

function get_user(user_id, item_id, callback){
  var wynik;
  connection.query("select count(id) as ilosc,rate from rating where user_id=" + user_id + " and item_id="+item_id +" and type='post' UNION ALL (select count(id) as ilosc,rate from rating where item_id="+ item_id +" and rate>0 and type='post') UNION ALL (select count(id) as ilosc,rate from rating where item_id="+ item_id +" and rate<0 and type='post');", function(err,result){
    if(err){
      callback(err,null)
    }
    else{
      callback(null,result);
    }
    
  });

}
module.exports = router;


//zostaw  mi te komentarze jeszcze ich będę potrzebował
/*router.post('/create', function(req,res){
    connection.query('ALTER TABLE users ADD id INT UNSIGNED NOT NULL AUTO_INCREMENT,ADD INDEX (id);',function(err, result)
        {
          if (err)
              console.log("Error creating : %s ",err );
         
          res.redirect('/');
          
        });
})*/
/*router.post('/zmianatypukolumny', function(req,res){
 connection.query('ALTER TABLE users MODIFY email VARCHAR(40);',function(err, result)
        {
          if (err)
              console.log("Error creating : %s ",err );
         
          res.redirect('/');
          
        });
});*/
/*
router.post('/zmianawartoscipoczatkowejkolumny', function(req,res){
  var sciecha='/uploads/profilowy.jpg'
 connection.query( 'ALTER TABLE users ALTER sciezka SET DEFAULT '+connection.escape(sciecha),function(err, result)
        {
          if (err)
              console.log("Error creating : %s ",err );
          res.redirect('/');
         //'ALTER TABLE users ALTER sciezka SET DEFAULT /uploads/profilowy.jpg' 
        });
});
router.post('/dodaniekolumny', function(req,res){
 connection.query('ALTER TABLE users ADD sciezka varchar(200) after punkty;',function(err, result)
        {
          if (err)
              console.log("Error creating : %s ",err );
         
          res.redirect('/');
          
        });
});
router.post('/create', function(req,res){
    connection.query('CREATE TABLE users(nr int, imie varchar(20));',function(err, result)
        {
          if (err)
              console.log("Error creating : %s ",err );
         
          res.redirect('/');
          
        });
})*/
