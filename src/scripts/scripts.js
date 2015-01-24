function makeSceneMovable(container, layers) {
    var startX;
    var currentPosition = 0;

    function drag (e) {
        var diffX = (e.layerX - startX);
        for(var i=0; i<3; i++){
            layers[i].style.backgroundPosition = diffX * 0.5 + 'px';
            currentPosition = diffX;
        }
    }

    container.addEventListener('mousedown', function(e){
        startX = e.layerX - currentPosition;
        container.addEventListener('mousemove', drag);
        container.addEventListener('mouseup', function(){
            container.removeEventListener('mousemove', drag);
        })
    });

    // Start positions
    for(var i=0; i<3; i++){
        layers[i].style.backgroundPosition = '0px';
    }    
}
