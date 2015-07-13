
var express = require('express');
var router = express.Router();
var zalogowano = false;
var info = "";
var vote_up;
var vote_down;
router.get('/error', function(req,res){

  res.render("error.html");
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
  if(req.body.haslo===req.body.phaslo){
  
  var post  = {imie: req.body.imie, nazwisko: req.body.nazwisko,email: req.body.email,haslo: req.body.haslo, profilowe: "/default/batman.jpg",o_mnie: req.body.o_mnie};
  
  connection.query('INSERT INTO users SET ?', post, function(err, result)
        {
          if (err)
              console.log("Error inserting : %s ",err );
         
          info = "Zarejestrowano. Możesz się teraz zalogować";
          res.redirect('/logowanie');
          
        });
  
  }else{
  
  info = "Hasła nie są takie same.";
  res.redirect('/logowanie');
  
  
  }
});

router.get('/register', function(req,res){
    res.render("register.html", {info:info});
});

router.get('/reguly', function(req,res){
    res.render("reguly.html", {info:info});
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
});


//Forum
router.get('/forum/:strona', function (req, res)
{
var postulaty;
var tiger;
  if (req.cookies.remember){
    ciastka=req.cookies.remember;

  /* UWAGA po czyszczeniu serwera bazy zdjec trzeba tutaj zmienic id na koncu drugiego selecta na id pierwszego postu w bazie danych*/
    connection.query("select tabela_postow.id, IF(punkty.suma_punktow IS NULL, 0, punkty.suma_punktow) as suma_punktow_post, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow  LEFT JOIN (SELECT item_id, SUM(rate) as suma_punktow FROM rating group by item_id) as punkty ON punkty.item_id = tabela_postow.id where nick=users.id and strona='"+req.params.strona+"' ORDER BY data_dodania ASC;SELECT idpost,pathfile FROM tabfile;select tabela_postow.id , tytul,tresc, nick, data_dodania, ilosc_click, imie, nazwisko from users,tabela_postow where tabela_postow.id="+connection.escape(471)+" and strona='"+req.params.strona+"'", function(err, result) {
      if (err) throw err;
       
       
       
          res.render('forum.html', {title: 'Przeszłość', postulaty:result[0],postulaty1:result[1],postulaty2:result[2], ciasta:ciastka , idcookies:req.cookies.id,capfile:3 ,id: result[0].length-1,tiger:0, vote_up: "", vote_down: "",strona:req.params.strona});
       // tutaj przekazanie zmiennej do widoku
    });
}
else{
res.redirect('/logowanie');
}

});

//Forum - konretny post
router.get('/forum/:strona/:id', function(req,res){
   var postulaty;
   var tiger;
  if (req.cookies.remember){
    ciastka=req.cookies.remember;
    ciastka1= parseInt(req.cookies.id);
    connection.query("select tabela_postow.id, IF(punkty.suma_punktow IS NULL, 0, punkty.suma_punktow) as suma_punktow_post, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow  LEFT JOIN (SELECT item_id, SUM(rate) as suma_punktow FROM rating group by item_id) as punkty ON punkty.item_id = tabela_postow.id where nick=users.id and strona='"+req.params.strona+"' ORDER BY data_dodania ASC;SELECT idpost,pathfile,rozszerzenie,name_pic FROM tabfile WHERE idpost="+connection.escape(req.params.id)+" ;SELECT tabela_postow.id, tytul,tresc, nick, data_dodania, imie,czas_dodania, nazwisko,profilowe FROM users,tabela_postow WHERE nick=users.id AND tabela_postow.id="+connection.escape(req.params.id)+" AND strona='"+req.params.strona+"' ;SELECT SUM(if(rating.rate>0, 1, 0)) AS ilosc_like,SUM(if(rating.rate<0, 1, 0)) AS ilosc_dislike, IdKomentarzu,ilosc_podkomentarzy,id_parent, nick,czas_dodania_kom,profilowe, imie, nazwisko,tresc,komentarze.rate from rating RIGHT JOIN (SELECT* FROM tablica_komentarzy WHERE id_postu_uzytkownika="+connection.escape(req.params.id)+") as komentarze on item_id=IdKomentarzu right join users on users.id=komentarze.nick where type = 'past_kom' OR type IS NULL AND IdKomentarzu IS NOT NULL GROUP BY IdKomentarzu ORDER BY IdKomentarzu ASC;SELECT id_post_kom,idpost_kom,pathfile_kom,rozszerzenie,name_pic FROM tabfilekomentarze WHERE id_post_kom="+connection.escape(req.params.id)+";SELECT count(komentarze.Idkomentarzu) as ilosc, komentarze.rate from (SELECT * FROM tablica_komentarzy WHERE id_postu_uzytkownika="+ connection.escape(req.params.id) + ") AS komentarze RIGHT JOIN tablica_komentarzy ON komentarze.IdKomentarzu = tablica_komentarzy.IdKomentarzu GROUP BY komentarze.rate ORDER BY rate DESC;" ,function(err,result ) {
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
          res.render('forum.html', {title: 'Przeszloscc', postulaty:result[0],postulaty1:result[1],postulaty2:result[2],postulaty3:result[3],postulaty4:result[4],huj:ciastka1,idcookies:req.cookies.id, ciasta:ciastka,id:result[0].length-1,capfile: req.params.id,tiger:1, vote_down: vote_down, vote_up: vote_up, vote_up_count: data[1].ilosc, vote_down_count: data[2].ilosc, comments_count: result[5],strona:req.params.strona}); // req.params.id tutaj przekazanie zmiennej do widoku

      }
    });
    });
  }
  else{
    res.redirect('/logowanie');
  }
});

router.get('/forum1/:strona/:id', function(req,res){
   var postulaty;
   var tiger;
  if (req.cookies.remember){
    ciastka=req.cookies.remember;
    ciastka1= parseInt(req.cookies.id);
    connection.query("select tabela_postow.id, IF(punkty.suma_punktow IS NULL, 0, punkty.suma_punktow) as suma_punktow, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow  LEFT JOIN (SELECT item_id, SUM(rate) as suma_punktow FROM rating group by item_id) as punkty ON punkty.item_id = tabela_postow.id where nick=users.id and strona='"+req.params.strona+"' ORDER BY data_dodania ASC; SELECT idpost,pathfile,rozszerzenie,name_pic FROM tabfile WHERE idpost="+connection.escape(req.params.id)+" ;SELECT tabela_postow.id, tytul,tresc, nick, data_dodania, imie,czas_dodania, nazwisko,profilowe from users,tabela_postow where nick=users.id AND tabela_postow.id="+connection.escape(req.params.id)+" and strona='"+req.params.strona+"' ;select SUM(if(rating.rate>0, 1, 0)) as ilosc_like,SUM(if(rating.rate<0, 1, 0)) as ilosc_dislike, IdKomentarzu,ilosc_podkomentarzy,id_parent, nick,czas_dodania_kom,profilowe, imie, nazwisko,tresc,komentarze.rate from rating right join (select * from tablica_komentarzy where id_postu_uzytkownika="+connection.escape(req.params.id)+") as komentarze on item_id=IdKomentarzu right join users on users.id=komentarze.nick where type = 'kom' OR type IS NULL AND IdKomentarzu IS NOT NULL group by IdKomentarzu order by IdKomentarzu asc;SELECT id_post_kom,idpost_kom,pathfile_kom,rozszerzenie,name_pic FROM tabfilekomentarze WHERE id_post_kom="+connection.escape(req.params.id)+";SELECT count(komentarze.Idkomentarzu) as ilosc, komentarze.rate from (select * from tablica_komentarzy where id_postu_uzytkownika="+ connection.escape(req.params.id) + ") as komentarze right join tablica_komentarzy on komentarze.IdKomentarzu = tablica_komentarzy.IdKomentarzu group by komentarze.rate order by rate desc;" ,function(err,result ) {
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
  }
  else{
    res.redirect('/logowanie');
  }
});


router.get('/mapa_przeszlosc', function(req,res){
var postulaty;
var tiger;
var strona="mapa_przeszlosc";
  if (req.cookies.remember){
    ciastka=req.cookies.remember;

  /* UWAGA po czyszczeniu serwera bazy zdjec trzeba tutaj zmienic id na koncu drugiego selecta na id pierwszego postu w bazie danych*/
    connection.query("select tabela_postow.id, tytul,tresc, nick, data_dodania, imie, nazwisko from users,tabela_postow where nick=users.id and strona='"+strona+"' ORDER BY data_dodania;SELECT idpost,pathfile FROM tabfile;select tabela_postow.id , tytul,tresc, nick, data_dodania, ilosc_click, imie, nazwisko from users,tabela_postow where tabela_postow.id="+connection.escape(471)+" and strona='"+strona+"'", function(err, result) {
      if (err) throw err;
res.render('mapa_przeszlosc.html', {title: 'Przeszloscmappa', postulaty:result[0],postulaty1:result[1],postulaty2:result[2], ciasta:ciastka , idcookies:req.cookies.id,capfile:3 ,id: result[0].length-1,tiger:0, vote_up: "", vote_down: "",strona:strona}); // req.params.id tutaj przekazanie zmiennej do widoku
  });
}else{
res.redirect('/logowanie');
}
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
    res.redirect('/logowanie');
  }
});

//Usun komentarz
router.get('/delete/:id?', function(req,res){
  var backURL=req.header('Referer') || '/';
  console.log(req.params.id);
   var postulaty;
   var tiger;

  if (req.cookies.remember){
    ciastka=req.cookies.remember;
     var id = req.params.id;   
        connection.query("DELETE FROM tablica_komentarzy  WHERE IdKomentarzu = ? ; DELETE FROM tabfilekomentarze WHERE idpost_kom="+connection.escape(id),[id], function(err, rows)
        //connection.query("DELETE FROM tablica_komentarzy  WHERE IdKomentarzu = ?",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            res.redirect(backURL);
             //res.redirect('/przeszlosc');
             
        });
  }
  else{
    res.redirect('/logowanie');
  }
});


 // /log i kolonisci ORDER BY punkty DESC
router.post('/log', function(req,res){
  var lemail = req.body.lemail;
  var lhaslo = req.body.lhaslo;
  var query = 'SELECT * FROM users;';
  console.log(' lemail:',req.body.lemail,'lhaslo:',lhaslo);
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
      var data;
      var minute = 60 * 60 * 1000; 
      for (var i in rows) {
          
          if(rows[i].email===lemail && rows[i].haslo===lhaslo){
           res.cookie('remember', lemail, { maxAge: minute, httpOnly: true});
           //res.cookie('id', rows[i].id);
           res.cookie('id', rows[i].id);
           res.cookie('pos', i);
           res.cookie("pass", lhaslo);
           zalogowano = true;
           info = "";
           res.redirect('/');

         }
      }

      if(zalogowano != true){ 
          info = "Nieprawidłowy login lub hasło.";
          res.redirect('/logowanie');
      }
  });
});

//Logowanie
router.get('/logowanie', function(req, res){
  if(req.cookies.remember){
    res.redirect('/');
  }
  else{
    var query = "SELECT * from test;";
    connection.query(query, function(err,rows){
      res.render("index.html", {info:info,rows:rows});
    });
    
  }
});

router.get('/edit', function(req,res){
  if(req.cookies.remember){
    res.render("edit.html", {info: info});
  }
  else{
    res.redirect('/logowanie');
  }
  
});

//Strona glowna
router.get('/', function(req, res){
  if(req.cookies.remember){
    res.render('zalogowano.html', {title: 'zalogowano', user_pos: req.cookies.pos});

  }
  else{
    res.redirect('/logowanie');
  }
});

//Lista kolonistow
router.get('/kolonisci/', function(req, res) {
  var data;
  if (req.cookies.remember){
    ciastka=req.cookies.remember;
    connection.query('SELECT * FROM users where id=' + req.cookies.id + ';', function(err, rows, fields) {
      if (err) throw err;
      connection.query('select user_id,profilowe, imie, nazwisko, sum(rating) as rating FROM (SELECT users.id as user_id,users.profilowe as profilowe, users.imie as imie, users.nazwisko as nazwisko, sum(rate) as rating FROM users LEFT JOIN tabela_postow on users.id = tabela_postow.nick LEFT JOIN rating ON tabela_postow.id = rating.item_id GROUP BY users.id UNION ALL select users.id as user_id, users.profilowe as profilowe, users.imie as imie, users.nazwisko as nazwisko, sum(rate) as rating from tablica_komentarzy left join tabela_postow on id_postu_uzytkownika=tabela_postow.id right join users on users.id = tabela_postow.nick group by users.id UNION ALL SELECT users.id as user_id, users.profilowe as profilowe, users.imie as imie, users.nazwisko as nazwisko, sum(rating.rate) as rating FROM users LEFT JOIN tablica_komentarzy on users.id = tablica_komentarzy.nick LEFT JOIN rating ON tablica_komentarzy.Idkomentarzu = rating.item_id AND rating.type="kom" GROUP BY users.id UNION ALL select users.id as user_id, users.profilowe as profilowe, users.imie as imie, users.nazwisko as nazwisko, count(nick)*5 as rating  from tablica_komentarzy right join users on tablica_komentarzy.nick = users.id group by users.id) s group by user_id order by rating desc;', function(err,list,fields){
        res.render('kolonia.html', {title: 'Kolonia', data:rows, list : list, ciasta:ciastka, user_id: req.cookies.id,tiger_profilowy:0}); // tutaj przekazanie zmiennej do widoku
      });
    });
  }

  else{
  res.redirect('/logowanie');
 }

});

//Profil usera
router.get('/kolonisci/:nick?', function(req, res) {
  var data;
  if (req.cookies.remember){
    ciastka=req.cookies.remember;
    connection.query('SELECT * FROM users where id=' + req.params.nick + ';', function(err, rows, fields) {
      if (err) throw err;
      connection.query('select user_id, imie, nazwisko, sum(rating) as rating FROM (SELECT users.id as user_id, users.imie as imie, users.nazwisko as nazwisko, sum(rate) as rating FROM users LEFT JOIN tabela_postow on users.id = tabela_postow.nick LEFT JOIN rating ON tabela_postow.id = rating.item_id GROUP BY users.id UNION ALL select users.id as user_id, users.imie as imie, users.nazwisko as nazwisko, sum(rate) as rating from tablica_komentarzy left join tabela_postow on id_postu_uzytkownika=tabela_postow.id right join users on users.id = tabela_postow.nick group by users.id UNION ALL SELECT users.id as user_id, users.imie as imie, users.nazwisko as nazwisko, sum(rating.rate) as rating FROM users LEFT JOIN tablica_komentarzy on users.id = tablica_komentarzy.nick LEFT JOIN rating ON tablica_komentarzy.Idkomentarzu = rating.item_id AND rating.type="kom" GROUP BY users.id UNION ALL select users.id as user_id, users.imie as imie, users.nazwisko as nazwisko, count(nick)*5 as rating  from tablica_komentarzy right join users on tablica_komentarzy.nick = users.id group by users.id) s group by user_id order by rating desc;', function(err,list,fields){
        res.render('kolonia.html', {title: 'Kolonia', data:rows, list : list, ciasta:ciastka, user_id: req.cookies.id,tiger_profilowy:1}); // tutaj przekazanie zmiennej do widoku
      });
    });
  }

  else{
  res.redirect('/logowanie');
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
    res.redirect('/logowanie');
  }
        
});

//Zmiana hasła
router.post('/zmiana_hasla',function(req,res){
  if(req.cookies.remember){
    var post = {};
  if(req.body.old_password == req.cookies.pass){
      post.haslo = req.body.new_password;
      connection.query('UPDATE users SET ? WHERE email='+connection.escape(req.cookies.remember), post, function(err, result)
          {
            if (err)
            info = "Zaktualizowano hasło.";
            res.redirect('/edit');
          });
    }
    else{
      info = "Błędne stare hasło.";
      res.redirect('/edit');
  }   
  }
  else{
    res.redirect('/logowanie');
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
