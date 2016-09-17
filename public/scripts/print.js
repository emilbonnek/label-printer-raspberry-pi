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
  }


function printPrompt(product){
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
}

function variantPrompt(product){
  product.data("open", !product.data("open"))
  // Placer variant-prompten korrekt
  $("#variant-prompt").appendTo(product.parent())
  if (window.innerWidth > 640) {
    // Tablet / computer
    var index = Math.min(product.index()+(2-product.index()%3), product.siblings().length-1)
  } else {
    // Mobil
    var index = Math.min(product.index()+(1-product.index()%2), product.siblings().length-1)
  }
  $("#variant-prompt").insertAfter($("#results li").get(index))

  //Skriv informationer om varen i variantprompten
  $("#variant-prompt img").attr("src", "http://10.45.0.19/1500/arkiv/"+product.data('item-num')+".jpg")
  $("#variant-prompt .info #description").text(product.data('description'))
  $("#variant-prompt .info #item-num").text(product.data('item-num'))
  $("#variant-prompt .info #price").text(product.data('price'))

  //Skriv de rigtige varianter ind
  $("#variant-prompt #variants").empty()
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
  
  if (product.data("open")) {
    product.find("#arrow").attr("src", "images/red_triangle.png")
    product.siblings().find("#arrow").attr("src", "images/green_triangle.png")
    $("#variant-prompt").slideDown()
  } else {
    product.find("#arrow").attr("src", "images/green_triangle.png")
    $("#variant-prompt").slideUp()
  };  
}

  $('#results').on("click", 'li', function() {
    var product = $(this)
    if (product.data("item-num")!=$("#variant-prompt .info #item-num").text()) {
      product.siblings().data("open", false)
      product.siblings().find("#arrow").attr("src", "images/green_triangle.png")
      $("#variant-prompt").slideUp()
    };
    if (typeof $(this).data('variant') === 'string' || $(this).data('variant') == null){
      // Varen har ingen varianter eller kun én variant
      printPrompt(product);
    } else {
      // Varen har flere varianter
      variantPrompt(product);
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