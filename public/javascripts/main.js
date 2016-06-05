$(document).ready(function() {
   $(".icon").hover(
    function() {
      var path = $(this).attr('src').split(".")[0] + "-hover.png";
      $(this).attr('src', path);
   },
   function() {
    var path = $(this).attr('src').replace("-hover", "");
    $(this).attr('src', path);
   });

   $(".show-subcomments-window").click(function() {
   		$(this).parent().parent().parent().next(".subcomments-window").toggle();
   	});


   $(".show-subcomments").click(function() {
		var id = $(this).attr('id').split('_')[1];
		$('#subcomments_' + id).toggle();
	});
});