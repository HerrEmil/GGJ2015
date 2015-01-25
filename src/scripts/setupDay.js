function setupDay(container) {
    // Load day images
    importSVG('images/mgj-03.svg', '#day-2', function(f) {
        f.select('#snake_1_').click(function(){
            alert('snaaake');
        });
        f.select('#peter').click(function(){
            alert('Peter cactus');
        });
    });
    importSVG('images/mgj-04.svg', '#day-3', function(f) {
        f.select('#tent_1_').click(function(){
            alert('tent 1');
        });
    });
    importSVG('images/mgj-05.svg', '#day-4', function(f) {
        f.select('#well_2_').click(function(){
            alert('well');
        });
    });
    importSVG('images/mgj-06.svg', '#day-5', function(f) {
        f.select('#peter_1_').click(function(){
            alert('peter 1');
        });
        f.select('#dead_x5F_tree').click(function(){
            alert('dead tree');
        });
    });
    importSVG('images/mgj-07.svg', '#day-6', function(f) {
        f.select('#snake').click(function(){
            alert('snake');
        });
        f.select('#tent').click(function(){
            alert('tent');
        });
        f.select('#bag').click(function(){
            alert('bag');
        });
    });

    // Make visible day layers moveable
    var layers = [
        container.querySelector('.layer--half'),
        container.querySelector('.layer--normal'),
        container.querySelector('.layer--twice')
    ];
    makeSceneMovable(container, layers);
    return container;
}
