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
});