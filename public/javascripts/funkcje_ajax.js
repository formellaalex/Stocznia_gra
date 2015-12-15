
$(document).ready(function(){

	  $("#pDodatkInfo").click(function(){
	    $("#informacjeDodatkoweRejestracja").toggle();
	  });


	var content = " ";
	$('#ajax_button').click(function(){
		
		


					 $.post("/add",
 						 {
						    nr:24,
						    imie:"Asasyn"
						  },
						  function(data,status){
						    
					});

					bierej();


	});

	$('#usun').click(function(){

		$.ajax({
			
			url: "/delete",
			type: "POST",
			data: {delete_nr: 100}, 
			success : function(result){

			}
		});
	});

	function bierej(){
	var interval = setInterval(function(){
			$.getJSON( '/test', function( data ) {

	        // For each item in our JSON, add a table row and cells to the content string
	        content = content + " Bardzo " + data[data.length-1].imie;

	        // Inject the whole content string into our existing HTML table
	        $('#ajax_button').html(content);

    		});
			}, 1000);
	}


	  $('.napisz_postulat_btn').click(function(){
	    $('#wykujPostulat').toggle(800);
  		
	});

	function getCaret(el) {
	  if (el.selectionStart) {
	     return el.selectionStart;
	  } else if (document.selection) {
	     el.focus();

	   var r = document.selection.createRange();
	   if (r == null) {
	    return 0;
	   }

	    var re = el.createTextRange(),
	    rc = re.duplicate();
	    re.moveToBookmark(r.getBookmark());
	    rc.setEndPoint('EndToStart', re);

	    return rc.text.length;
	  }  
	  return 0;
	}

	$( ".test_form" ).submit(function( event ) {
		  var message = prompt("Wpisz powód zgłoszenia", "Np. zgłaszam postulat do usunięcia, gdyż...");
		  if(message == null){
		  	return false;
		  }
		  else{
		  	$(this).children(".message").val(message);
		  	input.value = message;
		  	return true;
		  }

		
	  });

  $(".comment_text").keypress(function(event) {
   if (event.which == 13 && !event.shiftKey) {
        event.preventDefault();
        $(this).parent().submit();
    }
    if (event.which == 13 && event.shiftKey) {
       var content = this.value;
       var caret = getCaret(this);
       this.value = content.substring(0,caret) +content.substring(caret,content.length);
       event.stopPropagation();
       alert("LOOOOOOL");

  }
  
  });



	

});


function validate(pass, rep_pass,em){
	var password = $(pass).val();
	var repeat_password = $(rep_pass).val();
	var email = $(em).val();
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	if(!re.test(email)){
		alert("Nieprawidłowy format adresu email!");
		return false;
	}
	else{
		if(password != repeat_password){
			alert("Hasła nie są równe!");
			return false;
		}
		return true;
	}

}

function show_log_div(){

	$('#log_div').slideToggle('slow');
	 $('html,body').animate({
	        scrollTop: $("#sentence_bottom").offset().top},
	        'slow');
}

function show_password(){
    $("#passoword_change").toggle();
}

function usun_opinie() {
	var person = prompt("Wiadomość dla Człowieka ze Stoczni", "Uważam że ta opinia jest niewłaściwa, ponieważ ");
	if(person == null  || person == "" || person.length == 0){
		return false;
	}
	else{
		return true;
	}
}




