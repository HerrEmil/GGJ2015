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
    window.addEventListener(normalizedEvents.move, drag);
    window.addEventListener(normalizedEvents.up, mouseUp);
  }
  function mouseUp() {
    window.removeEventListener(normalizedEvents.move, drag);
    window.removeEventListener(normalizedEvents.up, mouseUp);
  }
  function drag(e) {
    const diffX = e.screenX - startX;
    startX = e.screenX;
    callback(diffX, e);
  }
}

let _sceneState = null;

function applyPosition(container, layers, factors, ratio) {
  const w = container.offsetWidth;
  for (let i = 0; i < 3; i++) {
    layers[i].style.left = `${ratio * w * factors[i]}px`;
  }
}

function makeSceneMovable(container, layers) {
  const factors = [0.5, 1, 2];

  if (!_sceneState) {
    // Position stored as ratio of container width (-2 to 0), resize-independent
    _sceneState = { positionRatio: -1, layers, container };

    function drag(diffX) {
      const w = container.offsetWidth;
      _sceneState.positionRatio = Math.max(-2, Math.min(0, _sceneState.positionRatio + diffX / w));
      applyPosition(container, _sceneState.layers, factors, _sceneState.positionRatio);
    }
    onMouseDrag(drag);
    enableArrowKeyPanning(drag);
    window.addEventListener('resize', function() {
      applyPosition(container, _sceneState.layers, factors, _sceneState.positionRatio);
    });
  } else {
    _sceneState.layers = layers;
  }

  applyPosition(container, layers, factors, _sceneState.positionRatio);
}
