var currentScene = 'crashSiteDay';

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
    var layers = [
        container.getElementsByClassName("layer--half")[0],
        container.getElementsByClassName("layer--normal")[0],
        container.getElementsByClassName("layer--twice")[0]
    ];

    // Display the current scene
    container.classList.remove('hidden');

    removeSceneMovable = makeSceneMovable(container, layers);
}