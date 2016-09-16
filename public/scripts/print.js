$(document).ready(function(){

  ///

  $("#edit-switch").on("change", function(){
    var set = !$(this).is(":checked")
    doEditMode(set)
  });

  ///

  function doEditMode(set){
    $("#print-form").find("#description").prop("readonly", set);
    $("#print-form").find("#item-number").prop("readonly", set);
    $("#print-form").find("#barcode-number").prop("readonly", set);
    $("#print-form").find("#price").prop("readonly", set);
    $("#print-form").find("#variant").prop("readonly", set);
    // $("#print-form").find("#antal").prop("readonly", set);
  }




  $('#results').on('click', 'li', function() {
    if (typeof $(this).data('variant') === 'string' || $(this).data('variant') == null){
      var product = $(this)
      $('#edit-switch').attr('checked', false)
      doEditMode(true)
      $('#print-modal #description').val(product.data('description'))
      $('#print-modal #item-number').val(product.data('item-num'))
      $('#print-modal #barcode-number').val(product.data('bar-num'))
      $('#print-modal #barcode').JsBarcode(String(product.data('bar-num')),{format:"CODE128", width:3, height: 45});
      $('#print-modal #price').val(product.data('price'))
      $('#print-modal #variant').val(product.data('variant'))
      $('#print-modal #lnr').val(product.data('l-num'))
      $('#print-modal #antal').val(1)

      $("#print-modal #image").attr("src", "http://10.45.0.19/1500/arkiv/"+product.data('item-num')+".jpg")

      $('#print-modal').foundation('reveal', 'open');
      setTimeout(function(){$('#antal').select();},500);
    } else {
      var product = $(this)

      $("#variant-prompt").insertAfter($("#results li").get(-1))
      var index = product.index()+(2-product.index()%3)
      $("#variant-prompt").insertAfter($("#results li").get(index))

      $("#variant-prompt img").attr("src", "http://10.45.0.19/1500/arkiv/"+product.data('item-num')+".jpg")
      $("#variant-prompt .info #description").text(product.data('description'))
      $("#variant-prompt .info #item-num").text(product.data('item-num'))
      $("#variant-prompt .info #price").text(product.data('price'))

      console.log(product.data("bar-num"));

      $("#variants").empty()
      for (var i = 0; i < product.data("variant").length; i++) {
        elem = $("<li>")
        button = $("<a>").text(product.data("variant")[i]).addClass("button expand small")
        elem
        .data("bar-num", product.data("bar-num")[i])
        .data("description", product.data('description'))
        .data("item-num", product.data('item-num'))
        .data("price", product.data('price'))
        .data("variant",product.data("variant")[i])
        .data("l-num", product.data('l-num'))
        .append(button)
        $("#variants").append(elem)

      };

      $("#variant-prompt").slideDown()

    }
  });


  $("#print-form").find("#barcode-number").on("keyup",function(){
    $('#print-modal').find('#barcode').JsBarcode($(this).val(),{format:"CODE128", width:3, height: 45});
  });
  
  $("#print-form").on("submit", function(event){
    event.preventDefault()
    $.ajax({type: 'POST',
            url: '/print',
            data: $('#print-form').serialize(),
            sucess: function(){
              notify("Lykkedes", "success")
            },
            error: function(){
              notify("Mislykkedes", "alert")
            }
    })
    $('#print-modal').foundation('reveal', 'close');
    $("#q").select();
    window.scrollTo(0,0)
    notify("Opgave sendt","secondary")
  });
  
}); 