function enableArrowKeyPanning(panCallback) {
  setInterval(isKeyPressed, 16);
  function isKeyPressed() {
    keys.forEach((key) => {
      if (key.isPressed() === 37) panCallback(3);
      if (key.isPressed() === 39) panCallback(-3);
    });
  }
}

function onMouseDrag(callback) {
  const body = document.body;
  let startX;
  body.addEventListener(normalizedEvents.down, mouseDown);
  function mouseDown(e) {
    startX = e.screenX;
    e.stopPropagation();
    e.cancelBubble = true;
    body.addEventListener(normalizedEvents.move, drag);
    body.addEventListener(normalizedEvents.up, mouseUp);
  }
  function mouseUp() {
    body.removeEventListener(normalizedEvents.move, drag);
  }
  function drag(e) {
    const diffX = e.screenX - startX;
    startX = e.screenX;
    callback(diffX, e);
  }
}

let _sceneState = null;

function makeSceneMovable(container, layers) {
  const factors = [0.5, 1, 2];

  if (!_sceneState) {
    // First call: initialize position and set up input handlers once
    _sceneState = { currentPosition: -800, layers };

    function drag(diffX) {
      _sceneState.currentPosition += diffX;
      for (let i = 0; i < 3; i++) {
        _sceneState.layers[i].style.left = `${_sceneState.currentPosition * factors[i]}px`;
      }
    }
    onMouseDrag(drag);
    enableArrowKeyPanning(drag);
  } else {
    // Subsequent calls: just update target layers, keep position
    _sceneState.layers = layers;
  }

  // Apply current position to new layers
  for (let i = 0; i < 3; i++) {
    layers[i].style.left = `${_sceneState.currentPosition * factors[i]}px`;
  }
}
