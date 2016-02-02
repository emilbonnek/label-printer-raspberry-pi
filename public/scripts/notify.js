function notify(message, type){
  box = "<div data-alert class='alert-box "+type+"'>"+message+"<a href='#' class='close'>&times;</a></div>"
  $("#notification_space").append(box)
  $(document).foundation('alert', 'reflow');
  window.setTimeout( function(){
    $(".alert-box a.close").trigger("click.fndtn.alert")
  },2500)
}