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
    var product = $(this)
    $('#edit-switch').attr('checked', false)
    doEditMode(true)
    $('#description').val(product.data('description'))
    $('#item-number').val(product.data('item-num'))
    $('#barcode-number').val(product.data('bar-num'))
    $('#barcode').JsBarcode(String(product.data('bar-num')),{format:"CODE128", width:3, height: 45});
    $('#price').val(product.data('price'))
    $('#variant').val(product.data('variant'))
    $('#antal').val(1)

    $('#print-modal').foundation('reveal', 'open');
    setTimeout(function(){$('#antal').select();},500);
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