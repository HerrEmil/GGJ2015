var currentScene = 'crashSiteDay',
    currentLayer = 5,
    dayOrNight = 'night';

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
}


function switchScene(sceneID) {
    // Hide the old scene
    var oldScene = document.getElementById(currentScene);
    oldScene.classList.add('hidden');

    currentScene = sceneID;

    var container = document.getElementById(sceneID);

    // Display the current scene
    container.classList.remove('hidden');

    // assuming there's only two scenes for now, 1 day, 2 night
    dayOrNight = (dayOrNight === 'day' ? 'night' : 'day');
}

// up or down
function switchLayer(direction) {
    var nextLayerID = dayOrNight + '-',
    previousLayerID = dayOrNight + '-';

    // If you're going up, and you're not already in the top layer
    if (direction === 'up' && currentLayer > 1) {
        // The ID of the layer above
        nextLayerID += currentLayer - 2;
        previousLayerID += currentLayer + 1;
        console.log('nextLayerID  ' + nextLayerID);
        console.log('previousLayerID  ' + previousLayerID);

        // display the layer above you
        document.getElementById(nextLayerID).classList.remove('hidden');

        // play zoom animation


        // hide old bottom layer
        document.getElementById(previousLayerID).classList.add('hidden');
        
        // update normal, half and twice classes

    } else if (direction === 'down' /*and you are not already all the way down*/) {
        // display one more layer
        // play zoom animation
        // hide old bottom layer
        // update classes
    }

    // Update moveable layers to currently displayed ones
}