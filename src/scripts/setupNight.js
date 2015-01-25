function setupNight(container) {
    // Load night images
    importSVG('images/mgj-10.svg', '#night-2', function(f) {
        f.select('#no_x5F_snake_1_').click(function(){
            alert('Nooooo snaaake');
        });
        f.select('#peter_18_').click(function(){
            alert('peter_18_');
        });
        f.select('#peter_19_').click(function(){
            alert('peter_19_');
        });
    });
    importSVG('images/mgj-11.svg', '#night-3', function(f) {
        f.select('#dead_x5F_tree_2_').click(function(){
            alert('dead_x5F_tree_2_');
        });
        f.select('#well_5_').click(function(){
            alert('well_5_');
        });
        f.select('#wolf_2_').click(function(){
            alert('wolf_2_');
        });
    });
    importSVG('images/mgj-12.svg', '#night-4', function(f) {
        f.select('#peter_13_').click(function(){
            alert('peter_13_');
        });
        f.select('#peter_10_').click(function(){
            alert('peter_10_');
        });
        f.select('#dead_x5F_tree_4_').click(function(){
            alert('dead_x5F_tree_4_');
        });
        f.select('#bag').click(function(){
            alert('bag');
        });
        f.select('#peter_20_').click(function(){
            alert('peter_20_');
        });
    });
    importSVG('images/mgj-13.svg', '#night-5', function(f) {
        f.select('#tent_2_').click(function(){
            alert('tent_2_');
        });
        f.select('#peter_11_').click(function(){
            alert('peter_11_');
        });
    });
    importSVG('images/mgj-14.svg', '#night-6', function(f) {
        f.select('#peter_12_').click(function(){
            alert('peter_12_');
        });
        f.select('#peter_15_').click(function(){
            alert('peter_15_');
        });
        f.select('#peter_14_').click(function(){
            alert('peter_14_');
        });
    });

    // Make visisble night layers moveable
    var layers = [
        container.querySelector('.layer--half'),
        container.querySelector('.layer--normal'),
        container.querySelector('.layer--twice')
    ];
    makeSceneMovable(container, layers);
}
