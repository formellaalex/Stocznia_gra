(function($){

	var methods = {

		maxLength : function(length, id) {
			$(this).attr('maxLength', length); // nadaje atrybut "maxLength",czyli maksymalna dlugosc tekst
			$(this).on('input', function() {
                var input=$(this); // pobiera nasz obiekt na ktory dziala funkcja, w tym przypadku jest to input, czyli pole tekstowe
                var len=input.val().length; // pobiera ilosc znakow wpisanego tekstu
                if(len==length) {
                	 // jezeli dlugosc tekstu wpisanego w pole tekstowe jest rowna liczbe wpisanej jako argument do funkcji(argument "length"),to wywal error
                }
                else {

                }
            });
		}
	}

})(jQuery);