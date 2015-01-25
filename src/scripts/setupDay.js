function setupDay(container) {
    // Load day images
    importSVG('images/mgj-03.svg', '#day-2', function(f) {
        f.select('#no_x5F_snake').click(function(){
            alert('snaaake');
        });
        f.select('#peter_2_').click(function(){
            alert('Peter cactus 2');
        });
        f.select('#peter').click(function(){
            alert('Peter cactus');
        });
    });
    importSVG('images/mgj-04.svg', '#day-3', function(f) {
        f.select('#peter_17_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#dead_x5F_tree_1_').click(function(){
            alert('Dead Tree');
        });
        f.select('#well').click(function(){
            alert('Well');
        });
        f.select('#wolf_1_').click(function(){
            alert('Wolf');
        });
    });
    importSVG('images/mgj-05.svg', '#day-4', function(f) {
        f.select('#peter_4_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#peter_3_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#peter_5_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#dead_x5F_tree_3_').click(function(){
            alert('Dead Tree');
        });
    });
    importSVG('images/mgj-06.svg', '#day-5', function(f) {
        f.select('#peter_6_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#tent').click(function(){
            alert('Tent');
        });
        f.select('#snake').click(function(){
            alert('Snake');
        });
    });
    importSVG('images/mgj-07.svg', '#day-6', function(f) {
        f.select('#peter_16_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#peter_9_').click(function(){
            alert('Peter Cactus');
        });
        f.select('#peter_1_').click(function(){
            alert('Peter Cactus');
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
