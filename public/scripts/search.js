systemKeys = Array(8,9,13,16,17,18,20,27,33,34,35,36,37,38,39,40,45,46,91,92,93,106,107,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,144,145,186,187,188,189,190,191,192,219,220,221,222);
$(document).ready(function(){

	$("#q").focus();
	esc();
	// Hent produkter til klient for hurtigere søgning
	$.ajax({type: 'GET',
		url: '/products',
		dataType: 'json',
		success: function(response){
			window.products = response;
			$("#loadproof").hide()
			$("#no-search").slideDown()
			notify("Klar til at søge","success'")
		}
	});

	$("#searchForLnr").change(function(){
		$("#search-form").trigger("submit")
		if ($(this).prop("checked")) {
			notify("Søgning efter leverandørnummer aktiv","info")
		} else {
			notify("Søgning efter leverandørnummer ikke længere aktiv","info")
		}
	});

	$("#q").on('keyup',function(){
		$("#loadproof").show();
		value = $("#q").val()
		if (value.length<2){
			$("#variant-prompt").hide()
			$('li',"#results").remove(); 
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

	$("#q_emty").click(function(){
		$("#q").val("").focus();
	});

	online();

	keyTyping();

	deleLeftOversNotify();
});


function doLoadQ(matching_elems){
	$("#results").hide();
	$('li',"#results").remove();
	$("#variant-prompt").hide()
	matching_elems
	$.each(matching_elems, function(i, product){
		if (product.variant.length == 1){
			elem = $("<li>").addClass("panel")
			.data("bar-num", product.bar_num[0])
			.data("description", product.description)
			.data("item-num", product.item_num)
			.data("price", product.price)
			.data("variant",product.variant[0])
			.data("l-num",product.l_num)
			.data("seson",product.seson)
			.data("division",product.division)
			// if (product.variant[0] != null){
			// 	elem.append("<span class='info label'>"+product.variant+"</span>")
			// }
			if ($("#searchForLnr").prop("checked")) {
				elem.append("<span class='left label'>"+product.l_num+"</span>")
			};
			elem.append("<span class='right warning label'>"+product.seson+"</span>")
			elem.append("<br>")
			elem.append("<h2>"+product.description+"</h2>")
			elem.append("<br>")
			$("#results").append(elem)
		} else {
			elem = $("<li>").addClass("panel")
			.data("bar-num", product.bar_num)
			.data("description", product.description)
			.data("item-num", product.item_num)
			.data("price", product.price)
			.data("variant",product.variant)
			.data("l-num",product.l_num)
			.data("seson",product.seson)
			.data("division",product.division)
			.data("open", false)

			if ($("#searchForLnr").prop("checked")) {
				elem.append("<span class='left label'>"+product.l_num+"</span>")
			};
			elem.append("<span class='right warning label'>"+product.seson+"</span>")
			elem.append("<br>")
			elem.append("<h2>"+product.description+"</h2>")
			elem.append("<center><img id='arrow' src='images/green_triangle.png' height='19' width='19'></center>")
			$("#results").append(elem)
		}
		
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
	$("#variant-prompt").hide()
	$('li',"#results").remove();

	window.products.forEach(function(product){
		relevant = true
		terms.forEach(function(term){

			
			if ($("#searchForLnr").prop("checked") ) {
				// Søg efter leverandørnummer
				if (product && (product.l_num == null ? '' : product.l_num).toUpperCase().indexOf(term)!==-1) {

				} else {
					relevant = false
				}

			} else {
				// Søg almindeligt
				if (product && product.item_num.toUpperCase().indexOf(term)!==-1 || product.description.toUpperCase().indexOf(term)!==-1) {

				} else {
					relevant = false
				}
			}
			

		})

		if (relevant){
			results.push(product);
		}
	})

	$("#loadproof").hide();

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
				if(event.keyCode==27){
					$("#q").val("").focus();
					return;
				}
				if($.inArray(event.keyCode,systemKeys)<0){
					$("#q").focus().val(event.key);
				}
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