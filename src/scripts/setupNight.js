function setupNight(container) {
    // Load night images
    importSVG('images/mgj-10.svg', '#night-2', function(f) {});
    importSVG('images/mgj-11.svg', '#night-3', function(f) {});
    importSVG('images/mgj-12.svg', '#night-4', function(f) {});
    importSVG('images/mgj-13.svg', '#night-5', function(f) {});
    importSVG('images/mgj-14.svg', '#night-6', function(f) {});

    // Make visisble night layers moveable
    var layers = [
        container.querySelector('.layer--half'),
        container.querySelector('.layer--normal'),
        container.querySelector('.layer--twice')
    ];
    makeSceneMovable(container, layers);
}
