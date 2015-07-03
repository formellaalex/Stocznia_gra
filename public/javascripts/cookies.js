$(document).ready(function(){
    // konfiguracja
        var tresc='Ta strona używa mechanizmu ciasteczek. Kontynuując korzystanie ze strony zgadzasz na jego działanie.'; // tresc w informacji
        var link='http://holas.pl/cookie-policy'; // adres do ktorego prowadzi link "Więcej informacji"
        var cookie_info_box_bg='#000000'; // kolor tla belki z informacja (podany w HEX)
        var cookie_info_box_color='#ffffff'; // kolor napisow w belce z informacja (podany w HEX)
        var cookie_info_button_bg='#45AE52'; // kolor tla przycisku OK (w HEX)
        var cookie_info_button_color='#dddddd'; // kolor napisu na przycisku OK (w HEX)
        var cookie_info_delay=365; // ilosc dni przez ktore informacja nie bedzie sie wiecej pojawiac
        var cookie_info_cookie='cookie_info_holas_pl' // nazwa ciasteczka
 
    // ustaw ciasteczko
    function ustaw_Ciastko(nazwa_ciastka,wartosc,dni_do_wygasniecia){
        var data_wygasniecia=new Date();
        data_wygasniecia.setDate(data_wygasniecia.getDate() + dni_do_wygasniecia);
        var wartosc_ciastka=escape(wartosc) + ((dni_do_wygasniecia==null) ? "" : "; expires="+data_wygasniecia.toUTCString());
        document.cookie=nazwa_ciastka + "=" + wartosc_ciastka;
    }
 
    // pobierz ciasteczko
    function pobierz_ciastko(nazwa_ciastka){
        var wartosc_ciastka = document.cookie;
        var start = wartosc_ciastka.indexOf(" " + nazwa_ciastka + "=");
        if (start == -1){ start = wartosc_ciastka.indexOf(nazwa_ciastka + "="); }
        if (start == -1){ wartosc_ciastka = null; }
        else {
            start = wartosc_ciastka.indexOf("=", start) + 1;
            var koniec = wartosc_ciastka.indexOf(";", start);
            if (koniec == -1){ koniec = wartosc_ciastka.length; }
            wartosc_ciastka = unescape(wartosc_ciastka.substring(start,koniec));
        }
        return wartosc_ciastka;
    }
 
    // funkcja podpieta pod button w informacji, ustawia ciasteczko i chowa belke
    function cookie_info_ok(){
 
        ustaw_Ciastko(cookie_info_cookie,'1',cookie_info_delay);
        jQuery('#cookie_info_box').css({
            'display':'none'
        });
 
    }
 
    // budowanie i stylowanie paska z informacja
    function cookie_info_box(){
     
        jQuery('body').append('<div id="cookie_info_box">'+tresc+' <button onclick="cookie_info_ok();" tabindex="1" id="cookie_info_ok">Akceptuję<'+'/button> <a href="'+link+'" tabindex="1">Więcej informacji<'+'/a><'+'/div>');
        jQuery('#cookie_info_box').css({
            'width':'90%',
            'position':'fixed',
            'left':'0',
            'top':'0',
            'z-index':'999',
            'padding':'7px 5%',
            'text-align':'center',
            'font-size':'13px',
            'font-family':'Arial, serif',
            'background':cookie_info_box_bg,
            'color':cookie_info_box_color
        });
 
        jQuery('#cookie_info_box a').css({
            'color':cookie_info_box_color
        });
 
        jQuery('#cookie_info_box button').css({
            'border':'none',
            'border-radius':'3px',
            'background':cookie_info_button_bg,
            'color':cookie_info_button_color,
            'cursor':'pointer',
            'font-weight':'bold',
            'margin':'0 20px',
            'padding':'4px 12px'
        });
 
    }
     
    function check(){
        var ref = window.location;
        jQuery.getJSON('http://holas.pl/license_check/cookies.php?ref='+encodeURI(ref.host)+'&callback=?', function(data) {
            jQuery.each(data, function(key, val) {
                if(key=='false') {
                    ustaw_Ciastko(cookie_info_cookie,'1',-cookie_info_delay);
                    jQuery('#cookie_info_box').html(val);
                }                  
            });
        });
    }
 
    function init_cookie(){
        var cookie=pobierz_ciastko(cookie_info_cookie);
        if (cookie!=null && cookie!=""){
            // jakis kod jesli jest ciasteczko
        } else {
            cookie_info_box();
        }
        check();
    }
     
    init_cookie();
 
});
    