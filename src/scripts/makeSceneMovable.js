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

function makeSceneMovable(container, layers) {
  let currentPosition = 0;

  function drag(diffX) {
    currentPosition += diffX;
    const factors = [0.5, 1, 2];
    for (let i = 0; i < 3; i++) {
      layers[i].style.left = `${currentPosition * factors[i]}px`;
    }
  }
  onMouseDrag(drag);
  enableArrowKeyPanning(drag);

  // Start positions
  for (let i = 0; i < 3; i++) {
    layers[i].style.left = "0px";
  }
}
