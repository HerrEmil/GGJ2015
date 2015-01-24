var full = document.querySelector('.full');
var layers = [
    document.querySelector('.layer--half'),
    document.querySelector('.layer--normal'),
    document.querySelector('.layer--twice')
];

function drag (e) {
    var diffX = e.offsetX - startX;
    var scale = [0.5, 1, 2];
    for(var i=0; i<3; i++){
        layers[i].style.backgroundPosition = diffX + 'px';
    }
    console.log(diffX);
}

function scrollTo(x){

}

var startX;

full.addEventListener('mousedown', function(e){
    startX = e.offsetX;
    full.addEventListener('mousemove', drag);
    full.addEventListener('mouseup', function(){
        full.removeEventListener('mousemove', drag);
    })
});