/**
 * Created by emilbonnekristiansen on 05/04/2017.
 */
$(document).ready(function(){
    $.ajax({type: 'GET',
        url: '/printers',
        dataType: 'json',
        success: function(response){
            window.printers = response;
            $.each(window.printers, function(i, printer) {
                elem = $("<li>");
                elem.append("<div class='panel callout'><img src='images/printer.png' /><p>"+printer.name+"</p></div>")
                $("#printers").append(elem)
            });
        }
    });
});