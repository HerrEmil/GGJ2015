function makeSceneArrowable(panCallback) {
    setInterval(isKeyPressed, 16);
    function isKeyPressed() {
        keys.forEach(function(key){
            if(key.isPressed() === 37) panCallback(3);
            if(key.isPressed() === 39) panCallback(-3);
        });
    }
}

function onMouseDrag(callback) {
    var body = document.body, startX;
    body.addEventListener(normalizedEvents.down, mouseDown);
    function mouseDown(e){
        startX = e.screenX;
        // ['layerX','screenX','pageX','offsetX'].forEach(function (attr) {
        //     console.log(attr, e[attr]);
        // });

        e.stopPropagation();
        e.cancelBubble = true;
        body.addEventListener(normalizedEvents.move, drag);
        body.addEventListener(normalizedEvents.up, mouseUp);
    };
    function mouseUp() {
        body.removeEventListener(normalizedEvents.move, drag);
    }
    function drag (e) {
        var diffX = (e.screenX - startX);
        console.log(diffX);
        startX = e.screenX;
        callback(diffX, e);
    }
}

function makeSceneMovable(container, layers) {
    var body = document.body;
    var startX;
    var currentPosition = 0;

    function drag (diffX) {
        currentPosition += diffX;
        var factors = [0.25, 0.5, 1];
        factors = [.5, 1, 2];
        for(var i=0; i<3; i++){
            layers[i].style.left = currentPosition * factors[i] + 'px';
        }
    }
    onMouseDrag(drag);
    makeSceneArrowable(drag);

    // Start positions
    for(var i=0; i<3; i++){
        layers[i].style.left = '0px';
    }    
}