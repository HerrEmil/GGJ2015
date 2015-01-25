function clickHandler(id){
    console.log(id);
    for(var key in story){
        var obj = story[key];
        if(obj.id === id) {
            console.log(story[key]);
            if(obj.premise){
                if(story[obj.premise].fulfilled) {
                    alert(obj.success);
                    obj.fulfilled = true;
                } else {
                    alert(obj.locked);
                }
            } else {
                obj.fulfilled = true;
            }
        }
    }
}

function handleClicks(f, ids) {
    ids.forEach(function(id){
        var querySelector = '#' + id;
        f.select( querySelector ).click(function() {
            clickHandler(id);
        });
    });
}
function setupDay(container) {
    // Load day images
    importSVG('images/mgj-03.svg', '#day-2', function(f) {
        handleClicks(f, ['no_x5F_snake', 'peter_2_', 'peter']);
    });
    importSVG('images/mgj-04.svg', '#day-3', function(f) {
        handleClicks(f, ['peter_17_', 'dead_x5F_tree_1_', 'well','wolf_1_']);
    });
    importSVG('images/mgj-05.svg', '#day-4', function(f) {
        handleClicks(f, ['peter_4_', 'peter_3_', 'peter_5_','dead_x5F_tree_3_']);
    });
    importSVG('images/mgj-06.svg', '#day-5', function(f) {
        handleClicks(f, ['peter_6_', 'tent', 'snake']);
    });
    importSVG('images/mgj-07.svg', '#day-6', function(f) {
       handleClicks(f, ['peter_16_', 'peter_9_', 'peter_1_']); 
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
