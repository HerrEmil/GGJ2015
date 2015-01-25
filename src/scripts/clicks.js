function clickHandler(id){
    console.log(id);
    for(var key in story){
        var obj = story[key];
        if(obj.id === id) {
            console.log(story[key]);
            if(obj.premise){
                if(story[obj.premise].fulfilled) {
                    bubble(obj.success);
                    obj.fulfilled = true;
                } else {
                    bubble(obj.locked);
                }
            } else {
                bubble(obj.success);
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
