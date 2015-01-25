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
}
