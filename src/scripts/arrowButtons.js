function keyStatus(keyCode) {
  let _pressed = false;
  return {
    keyCode,
    down() {
      _pressed = true;
    },
    up() {
      _pressed = false;
    },
    isPressed() {
      return _pressed ? keyCode : 0;
    },
  };
}
const keys = [
  37, //left
  38, //up
  39, //right
  40, //down
  32, //space
  13, //enter
  27, //escape
].map(keyStatus);

document.addEventListener("keydown", ({ keyCode }) => {
  keys.forEach((key) => {
    if (key.keyCode === keyCode) {
      key.down();
    }
  });
});
document.addEventListener("keyup", ({ keyCode }) => {
  keys.forEach((key) => {
    if (key.keyCode === keyCode) {
      key.up();
    }
  });
});

document.addEventListener("keyup", ({ keyCode }) => {
  if (keyCode === 38) switchLayer("up");
  if (keyCode === 40) switchLayer("down");
});
