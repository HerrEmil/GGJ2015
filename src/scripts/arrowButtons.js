function keyStatus(keyCode) {
  var _pressed = false;
  return {
    keyCode: keyCode,
    down: function() {
      _pressed = true;
    },
    up: function() {
      _pressed = false;
    },
    isPressed: function() {
      return _pressed ? keyCode : 0;
    }
  }
}
var keys = [
  37, //left
  38, //up
  39, //right
  40, //down
  32, //space
  13, //enter
  27  //escape
].map(keyStatus);

document.addEventListener('keydown', function(e){
  keys.forEach(function(key){
    if(key.keyCode === e.keyCode) {
      key.down();
    }
  });
});
document.addEventListener('keyup', function(e){
  keys.forEach(function(key){
    if(key.keyCode === e.keyCode) {
      key.up();
    }
  });
});

document.addEventListener('keyup', function(e){
  if(e.keyCode === 38) switchLayer('up');
  if(e.keyCode === 40) switchLayer('down');
});
