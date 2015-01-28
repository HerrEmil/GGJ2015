function axesMove(panCallback) {
    for(var key in controllers) {
        var axes = controllers[key].axes;
        if(axes[0] > 0.05 || axes[0] < -0.05) panCallback(axes[0] * -5);
    }
}

function dPadMove(panCallback) {
    var controller;
    for(var key in controllers) {
        if (controllers[key].buttons[14].pressed) panCallback(3);
        if (controllers[key].buttons[15].pressed) panCallback(-3);
    }
}

function checkArrowKeys(panCallback) {
    keys.forEach(function(key){
        if(key.isPressed() === 37) panCallback(3);
        if(key.isPressed() === 39) panCallback(-3);
    });
}

function onMouseDrag(callback) {
    var body = document.body, startX;
    body.addEventListener(normalizedEvents.down, mouseDown);
    function mouseDown(e){
        startX = e.layerX;
        body.addEventListener(normalizedEvents.move, drag);
        body.addEventListener(normalizedEvents.up, mouseUp);
    };
    function mouseUp() {
        body.removeEventListener(normalizedEvents.move, drag);
    }
    function drag (e) {
        var diffX = (e.layerX - startX);
        console.log(diffX);
        startX = e.layerX;
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

    function checkEvents(){
        checkArrowKeys(drag);
        axesMove(drag);
        dPadMove(drag);        
    }
    setInterval(checkEvents, 16);


    // Start positions
    for(var i=0; i<3; i++){
        layers[i].style.left = '0px';
    }    
}