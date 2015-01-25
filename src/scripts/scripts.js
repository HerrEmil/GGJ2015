var currentScene = 'day',
    currentLayer = 5,
    dayOrNight = 'night';

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
    console.log('It is now ' + dayOrNight);
}

// up or down
function switchLayer(direction) {
    var newBackground = dayOrNight + '-',
        newMiddleground = dayOrNight + '-',
        newForeground = dayOrNight + '-',
        currentBackground = dayOrNight + '-' + (currentLayer - 1),
        currentMiddleground = dayOrNight + '-' + currentLayer,
        currentForeground = dayOrNight + '-' + (currentLayer + 1),
        container;

    // If you're going up, and you're not already in the top layer
    if (direction === 'up' && currentLayer > 3) {
        newBackground += (currentLayer - 2);
        newMiddleground = currentBackground;
        newForeground = currentMiddleground;

        // display the new background
        document.getElementById(newBackground).classList.remove('hidden');

        // play zoom animation


        // hide old foreground
        document.getElementById(currentForeground).classList.add('hidden');

        // Update current layer
        currentLayer -= 1;

    } else if (direction === 'down' && currentLayer < 5) {
        newBackground = currentMiddleground;
        newMiddleground = currentForeground;
        newForeground += (currentLayer + 2);

        // display the new foreground
        document.getElementById(newForeground).classList.remove('hidden');

        // play zoom animation
        

        // hide old background
        document.getElementById(currentBackground).classList.add('hidden');

        // Updte current layer
        currentLayer += 1;
    } else { return console.log("You can't move " + direction + ", you've reached the edge."); }

    // update normal, half and twice classes
    document.getElementById(currentBackground).classList.remove('layer--half');
    document.getElementById(currentMiddleground).classList.remove('layer--normal');
    document.getElementById(currentForeground).classList.remove('layer--twice');
    document.getElementById(newBackground).classList.add('layer--half');
    document.getElementById(newMiddleground).classList.add('layer--normal');
    document.getElementById(newForeground).classList.add('layer--twice');

    // Update moveable layers to currently displayed ones
    container = document.getElementById(dayOrNight);
    var layers = [
        document.getElementById(newBackground),
        document.getElementById(newMiddleground),
        document.getElementById(newForeground)
    ];
    makeSceneMovable(container, layers);
}
