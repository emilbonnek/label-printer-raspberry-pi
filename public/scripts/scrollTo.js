/////scrool
function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}
function elmYPosition(eID, ys) {
    var elm = $(eID);
    var y = elm.position().top;
    var node = elm;
    var noedbremse = 0;
    while (node.offsetParent() && node.prop("tagName") != "BODY" && node.prop("tagName") != "HTML") {
        noedbremse++;
        node = node.offsetParent();
        y += node.position().top;
        if(noedbremse==1000){
            alert("kan ikke finde BODY tag i smoothScroll");
            return;
        }
    } return y + ys;
}
function smoothScroll(eID, ys) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID, ys);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        } return;
    }
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }
}
/////end - scrool


////////////////////- https://css-tricks.com/snippets/jquery/smooth-scrolling/ -////////////////////
/*
////////////////////- CSS på siden (til top circle) -////////////////////
css
#toTop{
    display: none;
    text-decoration: none;
    position: fixed;
    bottom: .75rem;
    right: .75rem;
    overflow: hidden;
    width: 43px;
    height: 43px;
    border: none;
    z-index: 100;
}
#toTopHover {
    display: block;
    overflow: hidden;
    float: left;
}
*/

/*
////////////////////- javascript på siden -////////////////////

<script type="text/javascript">

    $(function(){
        var scrollBack = 0

        
        $("a[href*=#]").click(function(e) {
            scrollBack = $(window).scrollTop();
            $("#toTop").rotate({angle: 0,animateTo:270})
            
            var href = $(this).attr('href').substring(1);
            e.preventDefault();
            smoothScroll("#"+href,-150);
            //$(".tg-031e:contains("+felt+")").parents("tr").highlight();
        });
        
        $("#toTop").click(function(){
            var to = scrollBack;
            $("html, body").animate({ scrollTop: to }, "slow");
            scrollBack = 0;
            $("#toTop").rotate({animateTo:0})
        });
        
        
        //add class "highlight" when hover over the row  
        $('table tbody tr').hover(function() {               
            $(this).addClass('highlight');  
        }, function() {  
            $(this).removeClass('highlight');  
        });
        
          
    });
    $(window).scroll( function(){
       if($(window).scrollTop()>200){
           $("#toTop").fadeIn("slow");
       }else{
           $("#toTop").fadeOut("slow");
       } 
    });
</script>
*/

/*
////////////////////- html på siden -////////////////////


<script type="text/javascript" src="/etc/js/jQueryRotate.js"></script>
<a id="toTop" href="javascript:;"><span id="toTopHover"></span><img width="40" height="40" alt="To Top" src="/etc/css/to-top.png"></a>
*/