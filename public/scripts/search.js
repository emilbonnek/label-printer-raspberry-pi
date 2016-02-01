

// Hent produkter til klient for hurtigere søgning
$.ajax({type: 'POST',
  url: '/products',
  dataType: 'json',
  success: function(response){
    window.products = response;
    
    //$.each(response, function(i, product) {
    //  window.products.push(product);
    //});
  }
});

$(document).ready(function(){


  $("#q").focus();
  esc();
  /*$("#search-form").on("keyup", function(){
    $("#results").empty();
  });*/

  $("#q").on('keyup',function(){
    if ($("#q").val().length>=5){
      //doLoadQ();
      $("#search-form").trigger("submit")
    }
  });

  $("#search-form").on("submit", function(event){
    event.preventDefault()
    res = search($(this).find('input[name="item_number"]').val())
    //doLoadQ();
    doLoadQ2(res);
    
  });

  function doLoadQ(){
    $.ajax({type: 'POST',
            url: '/search',
            dataType: 'json',
            data: $('#search-form').serialize(),
            success: function(response){
              $("#results").empty();
              $.each(response, function(i, product) {
                elem = $("<li>").addClass("panel")
                                .height(100)
                                .data("bar-num", product.bar_num)
                                .data("description", product.description)
                                .data("item-num", product.item_num)
                                .data("price", product.price)
                                .data("variant",product.variant)
                if (product.variant != null){
                  elem.append("<span class='info label'>"+product.variant+"</span>")
                }
                elem.append("<br>")
                elem.append("<h2>"+product.description+"</h2>")
                // elem = "<li class='panel text-center' data-bar-num='"+product.bar_num+"' data-description='"+product.description+"' data-item-num='"+product.item_num+"' data-price='"+product.price+"' data-variant='"+product.variant+"'>"+product.description+"</li>"
                // elem = "<li><form class='print-form' action='/print' method='post'><input type='hidden' name='item_number' value='"+product.item_num+"'><input type='submit' class='button expand' value='"+product.description+"'></form></li>"
                // :bar_num, :description, :item_num, :variant, :price
                $("#results").append(elem)
              });
            }
    });
  }
  function doLoadQ2(matching_elems){
    $("#results").empty()
    matching_elems
    $.each(matching_elems, function(i, product){
      //console.log(product)
      elem = $("<li>").addClass("panel")
                                .height(100)
                                .data("bar-num", product.bar_num)
                                .data("description", product.description)
                                .data("item-num", product.item_num)
                                .data("price", product.price)
                                .data("variant",product.variant)
      if (product.variant != null){
        elem.append("<span class='info label'>"+product.variant+"</span>")
      }
      elem.append("<br>")
      elem.append("<h2>"+product.description+"</h2>")
      $("#results").append(elem)
    })
  }
});


function search(term) {
  var results = [];
  var index;
  var product;

  term = term.toUpperCase();
  for (index = 0; index < window.products.length; ++index) {
    product = window.products[index];
    if (product && product.item_num && product.item_num.toUpperCase().indexOf(term) !== -1) {
      results.push(product);
    }
  }

  return results;
}

function esc(){
  $("body").keyup(function(e){
    if(event.keyCode==27){
      $(":focus").val("");
    }
  });
}


/*vent med at hente data til der er skrevet lidt i søgefeltet*/
/*
$.fn.extend({
        donetyping: function(callback,timeout){
            timeout = timeout || 1e3; // 1 second default timeout  (1eo3)
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                $el.is(':input') && $el.keyup(function(){
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        doneTyping(el);
                    }, timeout);
                }).blur(function(){
                    doneTyping(el);
                });
            });
        }
    });
*/
/*end -vent med at hente data til der er skrevet lidt i søgefeltet*/