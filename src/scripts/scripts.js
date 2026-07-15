var currentLayer = 5;
let dayOrNight = "night";

function switchScene(sceneID) {
  // Hide the old scene
  const oldScene = document.getElementById(dayOrNight);
  const newScene = document.getElementById(sceneID);
  oldScene.classList.add("hidden");
  newScene.classList.remove("hidden");
  dayOrNight = sceneID;

  // Re-bind the drag / arrow-key pan controller to the now-visible scene. There
  // is a single module-level _sceneState (makeSceneMovable.js); switchLayer
  // re-calls makeSceneMovable on every layer change, but a scene switch never
  // did — so after day->night the controller kept moving the now-hidden day
  // layers and the night scene was un-pannable until an up/down press happened
  // to rebind it. Query the new scene's active layers the same way
  // setupDay/setupNight do.
  const layers = [
    newScene.querySelector(".layer--half"),
    newScene.querySelector(".layer--normal"),
    newScene.querySelector(".layer--twice"),
  ];
  makeSceneMovable(newScene, layers);

  if (sceneID === "night") {
    const amb = new Audio("amb/138288__kangaroovindaloo__desert-at-night");
    const mood = new Audio("Mood1");
    amb.play();
    mood.play();
    bubble([28]);
  }
}

// up or down
function switchLayer(direction) {
  const scenePrefix = `${dayOrNight}-`;
  let newBackground = scenePrefix;
  let newMiddleGround;
  let newForeground = scenePrefix;
  const currentBackground = scenePrefix + (currentLayer - 1);
  const currentMiddleGround = scenePrefix + currentLayer;
  const currentForeground = scenePrefix + (currentLayer + 1);

  let enteringLayer, leavingLayer;

  // If you're going up, and you're not already in the top layer
  if (direction === "up" && currentLayer > 3) {
    newBackground += currentLayer - 2;
    newMiddleGround = currentBackground;
    newForeground = currentMiddleGround;
    enteringLayer = newBackground;
    leavingLayer = currentForeground;

    // Update current layer
    currentLayer -= 1;
  } else if (direction === "down" && currentLayer < 5) {
    newBackground = currentMiddleGround;
    newMiddleGround = currentForeground;
    newForeground += currentLayer + 2;
    enteringLayer = newForeground;
    leavingLayer = currentBackground;

    // Update current layer
    currentLayer += 1;
  } else {
    return;
  }

  // Remove old type classes only from layers that stay visible (not the leaving one)
  if (currentBackground !== leavingLayer)
    document.getElementById(currentBackground).classList.remove("layer--half");
  if (currentMiddleGround !== leavingLayer)
    document.getElementById(currentMiddleGround).classList.remove("layer--normal");
  if (currentForeground !== leavingLayer)
    document.getElementById(currentForeground).classList.remove("layer--twice");

  // Assign new classes to visible layers
  const layers = [
    document.getElementById(newBackground),
    document.getElementById(newMiddleGround),
    document.getElementById(newForeground),
  ];
  layers[0].classList.add("layer--half");
  layers[1].classList.add("layer--normal");
  layers[2].classList.add("layer--twice");

  // Show entering layer instantly (no transition) to avoid flash at wrong scale
  const enterEl = document.getElementById(enteringLayer);
  enterEl.style.transition = "none";
  enterEl.classList.remove("layer--faded");
  enterEl.offsetHeight; // force repaint with transition disabled
  enterEl.style.transition = "";

  // Fade out the leaving layer (keep its old type class so it doesn't flash at scale 1)
  const leaveEl = document.getElementById(leavingLayer);
  leaveEl.classList.add("layer--faded");
  leaveEl.addEventListener("transitionend", function cleanup() {
    leaveEl.removeEventListener("transitionend", cleanup);
    leaveEl.classList.remove("layer--half", "layer--normal", "layer--twice");
  });

  makeSceneMovable(document.getElementById(dayOrNight), layers);
}
