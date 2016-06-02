$(document).ready(function() {
	$(".post-show-more").click(function() {
	    var hidden = $(this).parent().parent().next(".post-message");
	    showHidden(hidden);
	});

	$("#comments-add").click(function() {
	    var hidden = $("#comments-window");
	    showHidden(hidden);
	});

	function showHidden(hidden) {
		if (hidden.hasClass("hidden")){
	      hidden.removeClass("hidden");
	    }
	    else {
	      hidden.addClass("hidden");
	    }
	}

	$("#comments-form textarea").keypress(function(event) {
	    if (event.which == 13) {
	        event.preventDefault();
	        $("#comments-form").submit();
	    }
	});
});
