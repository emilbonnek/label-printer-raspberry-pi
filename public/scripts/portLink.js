// Kopieret fra Gary Green (02/12/16):
// http://stackoverflow.com/questions/6016120/relative-url-to-a-different-port-number-in-a-hyperlink

// delegate event for performance, and save attaching a million events to each anchor
document.addEventListener('click', function(event) {
    var target = event.target;
    if (target.tagName.toLowerCase() == 'a')
    {
        var port = target.getAttribute('href').match(/^:(\d+)(.*)/);
        if (port)
        {
            target.href = port[2];
            target.port = port[1];
        }
    }
}, false);