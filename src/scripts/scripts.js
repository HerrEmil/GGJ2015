var full = document.querySelector('.full');
var layers = [
    document.querySelector('.layer--half'),
    document.querySelector('.layer--normal'),
    document.querySelector('.layer--twice')
];

var startX;
var currentPosition = 0;

function drag (e) {
    var diffX = e.offsetX - startX;
    var scale = [0.5, 1, 2];
    for(var i=0; i<3; i++){
        layers[i].style.backgroundPosition = diffX + 'px';
        currentPosition = diffX;
    }
}

full.addEventListener('mousedown', function(e){
    startX = e.offsetX - currentPosition;
    full.addEventListener('mousemove', drag);
    full.addEventListener('mouseup', function(){
        full.removeEventListener('mousemove', drag);
    })
});

// Start positions
for(var i=0; i<3; i++){
    layers[i].style.backgroundPosition = '0px';
}