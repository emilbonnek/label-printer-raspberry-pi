$(document).ready(function(){

	$("#q").focus();
	esc();
	// Hent produkter til klient for hurtigere søgning
	$.ajax({type: 'POST',
		url: '/products',
		dataType: 'json',
		success: function(response){
			window.products = response;
			$("#loadproof").hide()
			$("#no-search").slideDown()
			notify("Klar til at søge","success'")
		}
	});

	$("#q").on('keyup',function(){
		$("#loadproof").show();
		value = $("#q").val()
		if (value.length<2){
			$("#results").empty()
			$("#no-results").hide()
			$("#no-search").slideDown()
		} else if (value.length>=3 && !(/^\d+$/.test(value))) {
			$("#no-search").hide()
			$("#search-form").trigger("submit")
		} else if (value.length>=4 && (/^\d+$/.test(value))){
			$("#no-search").hide()
			$("#search-form").trigger("submit")
		};
		if (value.length<3){
			$("#loadproof").hide();
		}
	});

	$("#search-form").on("submit", function(event){
		event.preventDefault()
		res = search($(this).find('input[name="item_number"]').val())
		doLoadQ(res);
		
	});

	online();

	keyTyping();

	deleLeftOversNotify();
});


function doLoadQ(matching_elems){
	$("#results").hide();
	$("#results").empty()
	matching_elems
	$.each(matching_elems, function(i, product){
		//console.log(product)
		elem = $("<li>").addClass("panel")
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
	$("#results").slideDown();
	if (matching_elems.length == 0) {
		$("#no-results").slideDown()
	} else {
		$("#no-results").hide()
	}
}

function search(q) {
	var results = [];
	var index;
	var product;

	if (q.length == 0){
		return results
	} else if (/^\d+$/.test(q)){

	}


	terms = q.toUpperCase().split(" ");
	$("#results").empty();

	window.products.forEach(function(product){
		relevant = true
		terms.forEach(function(term){
			if (product && product.item_num.toUpperCase().indexOf(term)!==-1 || product.description.toUpperCase().indexOf(term)!==-1) {

			} else {
				relevant = false
			}
		})
		if (relevant){
			results.push(product);
		}
	})

	$("#loadproof").hide();

	return results

	/*
	terms.forEach(function(term){
		for (index = 0; index < window.products.length; ++index) {
			product = window.products[index];
			if (product && (product.item_num.toUpperCase().indexOf(term) !== -1 || product.description.toUpperCase().indexOf(term) !== -1)) {
				results.push(product);
			}
		}
	})
*/
	

	return results;
}

var onlineNote = 0;

function esc(){
	$("body").keyup(function(e){
		if(event.keyCode==27){
			$(":focus").val("");
		}
	});
}

function online(){
	setTimeout(function(){doOnline()}, 5000);
}
function doOnline(){
	$.ajax({
				type: "GET",
				url: "http://192.168.1.2/alive",
				timeout: "2000",
				success: function(){
            if(onlineNote==1){
              notify("Print Online","success");
            }
						onlineNote = 0;
						$("#netstatus").attr("class","netOnline");
				},
				error: function(msg) {
            if(onlineNote==0){
              onlineNote = 1;
  						notify("Print Offline");
  						$("#netstatus").attr("class","netOffline");
            }
				}
		});
	online();
}

function keyTyping(){
	$("body").keyup(function(e){
		if($(".reveal-modal-bg").is(':visible')){

		}else{
			if($("#q").is(':focus')){

			}else{
				$("#q").focus().val($("#q").val()+event.key);
			}
		}
	});
}

function deleLeftOversNotify(){
	setTimeout(function(){doDeleLeftOversNotify()}, 60000);
}

function doDeleLeftOversNotify(){
	$("#notification_space .remove").remove();

	$("#notification_space").find(".alert-close").addClass('remove');
	deleLeftOversNotify()
}

/*vent med at hente data til der er skrevet lidt i søgefeltet*/
/*
$.fn.extend({
				donetyping: function(callback,timeout){
						timeout = timeout || 1e3; // 1 second default timeout	(1eo3)
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