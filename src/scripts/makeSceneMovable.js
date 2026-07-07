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
const layerFactors = [0.5, 1, 2];

function applyPosition() {
  const { layers, width, positionRatio } = _sceneState;
  for (let i = 0; i < 3; i++) {
    layers[i].style.left = `${positionRatio * width * layerFactors[i]}px`;
  }
}

function makeSceneMovable(container, layers) {
  if (!_sceneState) {
    // Position stored as ratio of container width (-2 to 0), resize-independent
    _sceneState = { positionRatio: -1, layers, container, width: container.offsetWidth };

    function drag(diffX) {
      const state = _sceneState;
      state.positionRatio = Math.max(-2, Math.min(0, state.positionRatio + diffX / state.width));
      applyPosition();
    }
    onMouseDrag(drag);
    enableArrowKeyPanning(drag);
    window.addEventListener('resize', function() {
      _sceneState.width = _sceneState.container.offsetWidth;
      applyPosition();
    });
  } else {
    _sceneState.layers = layers;
    _sceneState.container = container;
    _sceneState.width = container.offsetWidth;
  }

  applyPosition();
}
