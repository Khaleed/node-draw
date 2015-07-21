(function() {
    // connect to socket.io
    var socket = io.connect('http://localhost:3000');
    // get elements
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        rules = document.getElementById('rules');
    // generate UIID
    var id = Math.random().toString(36).substr(2, 5);
    // drawing state
    var drawing = false;
    // main objects
    var clients = {};
    var cursors = {};
    // handle socket.io events
    // each time drawing event from server is triggered
    socket.on('moving', function(data) {
        console.log("what is in the data: " + data);
        var newCursor = cursor.innerHTML += "<div class='cursor'> <div>";
        // does clients obj have data.id (unique id) key
        // as a direct property
        console.log("id is " + data.id);
        if (clients.hasOwnProperty(data.id)) {
            // build a cursor for each id
            cursors[data.id] = newCursor;
            console.log("cursors: " + cursors[data.id]);
        }
        // move mouse left and right
        cursors[data.id].style.left = data.x;
        cursors[data.id].style.left = data.y;
        // if the id is drawing and id has unique ID
        if (data.drawing && clients[data.id]) {
            // draw line
            // clients[data.id] hold previous id position
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }
        // save current player state
        clients[data.id] = data;
    });
    var current = {};
    // canvas mousedown handler
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        drawing = true;
        current.x = e.pageX;
        current.y = e.pageY;
        // hide game rules
        rules.style.display = 'none';
    });
    // bind mouseup and mouseleave events and set drawing state to false
    document.addEventListener('mouseup mouseleave', function() {
        drawing = false;
    });
    // emit mousemove
    var lastEmit = Date.now();
    // mousemove event handler
    document.addEventListener('mousemove', function(e) {
        if (Date.now() - lastEmit > 30) {
            socket.emit('mousemove', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = Date.now();
        }
        // Drawline based on current user movement as not 
        // received from socket.on('moving') 
        if (drawing) {
            drawLine(current.x, current.y, e.pageX, e.pageY);
            current.x = e.pageX;
            current.y = e.pageY;
        }
    });
    // remove inactive users after 10 seconds of logging on
    setInterval(function() {
        // loop through clients 
        for (key in clients) {
            if (Date.now() - clients[key].updated > 10000) {
                delete cursors[key];
                delete clients[key];
            }
        }
    }, 10000);
    // drawLine
    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.stroke();
    }
    // draw grid
    function renderGrid(pix, color) {
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = color;
        // horizontal lines
        for (var i = 0; i <= canvas.height; i += pix) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.closePath();
            ctx.stroke();
        }
        // vertical lines
        for (var j = 0; j <= canvas.width; j += pix) {
            ctx.beginPath();
            ctx.moveTo(j, 0);
            ctx.lineTo(j, canvas.height);
            ctx.closePath();
            ctx.stroke();
        }
    }
})();