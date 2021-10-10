const normalizedEvents = (() => {
  const supportsTouch =
    "ontouchstart" in window || window.navigator.msPointerEnabled;
  return {
    down: supportsTouch ? "touchstart" : "mousedown",
    move: supportsTouch ? "touchmove" : "mousemove",
    up: supportsTouch ? "touchend" : "mouseup",
  };
})();
