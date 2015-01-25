function bubble(id) {
    if(id instanceof Array) {
        id.forEach(bubbleOnce);
    } else {
        bubbleOnce(id);
    }
}
function bubbleOnce(id){
    var url = 'pratbubblar/mgj_pratbubblar-'+id+'.svg';
    console.log(url);
    var el = document.createElement('div');
    el.className = 'bubble';
    el.setAttribute('style', 'z-index: '+(100-id)+';background-image: url('+url+')');;
    el.addEventListener('click', function(){
        el.style.display = 'none';
    });
    document.body.appendChild(el);
}
