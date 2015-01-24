function makeSceneMovable(container, layers) {
    var startX;
    var currentPosition = 0;

    function drag (e) {
        var diffX = (e.layerX - startX);
        var factors = [0.25, 0.5, 1];
        for(var i=0; i<3; i++){
            layers[i].style.left = diffX * factors[i] + 'px';
            currentPosition = diffX;
        }
    }

    container.addEventListener(normalizedEvents.down, function(e){
        startX = e.layerX - currentPosition;
        container.addEventListener(normalizedEvents.move, drag);
        container.addEventListener(normalizedEvents.up, function(){
            container.removeEventListener(normalizedEvents.move, drag);
        })
    });

    // Start positions
    for(var i=0; i<3; i++){
        layers[i].style.left = '0px';
    }    
}
