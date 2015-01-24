var currentScene = 'crashSiteDay';

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

    function mouseUp() {
        container.removeEventListener(normalizedEvents.move, drag);
    }

    function mouseDown(e){
        startX = e.layerX - currentPosition;
        container.addEventListener(normalizedEvents.move, drag);
        container.addEventListener(normalizedEvents.up, mouseUp)
    };

    function removeAllEventListeners() {
        container.removeEventListener(normalizedEvents.down, mouseDown);
        container.removeEventListener(normalizedEvents.move, drag);
        container.removeEventListener(normalizedEvents.up, mouseUp);
    }

    container.addEventListener(normalizedEvents.down, mouseDown);

    // Start positions
    for(var i=0; i<3; i++){
        layers[i].style.left = '0px';
        layers[i].style.backgroundPosition = '0px';
    }    
    return removeAllEventListeners; 
}

var removeSceneMovable = function() {};

function switchScene(sceneID) {
    removeSceneMovable();
    // Hide the old scene
    var oldScene = document.getElementById(currentScene);
    oldScene.classList.add('hidden');

    currentScene = sceneID;

    var container = document.getElementById(sceneID);

    // Display the current scene
    container.classList.remove('hidden');
}