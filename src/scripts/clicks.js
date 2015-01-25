function clickHandler(id){
    console.log(id);
    for(var key in story){
        var obj = story[key];
        if(obj.id === id) {
            console.log(story[key]);
            if(story[key].sound) {
                console.log('Playing ' + story[key].sound);
                var a = new Audio(story[key].sound);
                a.play();
            }
            if(obj.premise){
                if(story[obj.premise].fulfilled) {
                    bubble(obj.success);
                    obj.fulfilled = true;
                } else {
                    bubble(obj.locked);
                }
            } else {
                if(!obj.fulfilled) {
                    bubble(obj.success);
                    obj.fulfilled = true;
                }
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
