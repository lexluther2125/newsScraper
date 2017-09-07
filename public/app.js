//save an article to database
$(document).on("click", "#save", function(e) {
  e.preventDefault();

  $(this).attr("data-status", true);

  var newsId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/api/savednews/" + newsId,
    data: {
      saved: true
    }
  }).done(function(data){
    console.log(data);
  });
});

//delete an article from database
$(document).on("click", "#remove", function(e){
  
  $("this").attr("data-status", false);

  var newsId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/api/removenews/" + newsId,
    data: {
      saved: false
    }
  }).done(function(data){
    console.log(data);
  });
});


//Save a Comment to database
$(document).on("click", "#save", function(e){
  e.preventDefault();

  var commentId = $(this).attr("data-id:");
  
  $.ajax({
    method: "POST",
    url: "/api/comments/" + commentId,
    data: {
      title: $("#newstitle").val(),
      body: $("commentbody").val()

    }
  }).done(function(data){
    $(".addComment").empty();
    console.log(data);
  });
  $("#commenttitle").val("");
  $("#commentbody").val("");
});

//Remove a comment
(document).on("click", "#remove", function(e){

  $("this").attr("data-status", false);

  var commentId = $(this).attr("data-status");
  
  $.ajax({
    method: "POST",
    url: "/api/removecomments/" + commentId,
    data: {
      saved: false
    }
  }).done(function(data){
    console.log(data);
  });
});