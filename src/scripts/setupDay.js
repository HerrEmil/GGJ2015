function setupDay() {
    // Load day images
    importSVG('images/mgj-03.svg', '#day-2', function(f) {});
    importSVG('images/mgj-04.svg', '#day-3', function(f) {});
    importSVG('images/mgj-05.svg', '#day-4', function(f) {
        f.select('#cactus').click(function(){
            alert('FRIGGING CACTUS STING');
        });
    });
    importSVG('images/mgj-06.svg', '#day-5', function(f) {});
    importSVG('images/mgj-07.svg', '#day-6', function(f) {});

    // Make visible day layers moveable
    var container = document.querySelector('#crashSiteDay');
    var layers = [
        document.querySelector('#crashSiteDay .layer--half'),
        document.querySelector('#crashSiteDay .layer--normal'),
        document.querySelector('#crashSiteDay .layer--twice')
    ];
    makeSceneMovable(container, layers);
    return container;
}