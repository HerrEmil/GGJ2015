var currentLayer = 5;
let dayOrNight = "night";

function switchScene(sceneID) {
  // Hide the old scene
  const oldScene = document.getElementById(dayOrNight);
  const newScene = document.getElementById(sceneID);
  oldScene.classList.add("hidden");
  newScene.classList.remove("hidden");
  dayOrNight = sceneID;
  if (sceneID === "night") {
    const amb = new Audio("amb/138288__kangarooVindaloo__desert-at-night");
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

  // If you're going up, and you're not already in the top layer
  if (direction === "up" && currentLayer > 3) {
    newBackground += currentLayer - 2;
    newMiddleGround = currentBackground;
    newForeground = currentMiddleGround;

    // display the new background
    document.getElementById(newBackground).classList.remove("hidden");

    // hide old foreground
    document.getElementById(currentForeground).classList.add("hidden");

    // Update current layer
    currentLayer -= 1;
  } else if (direction === "down" && currentLayer < 5) {
    newBackground = currentMiddleGround;
    newMiddleGround = currentForeground;
    newForeground += currentLayer + 2;

    // display the new foreground
    document.getElementById(newForeground).classList.remove("hidden");

    // hide old background
    document.getElementById(currentBackground).classList.add("hidden");

    // Update current layer
    currentLayer += 1;
  } else {
    return;
  }

  // update normal, half and twice classes
  document.getElementById(currentBackground).classList.remove("layer--half");
  document
    .getElementById(currentMiddleGround)
    .classList.remove("layer--normal");
  document.getElementById(currentForeground).classList.remove("layer--twice");
  document.getElementById(newBackground).classList.add("layer--half");
  document.getElementById(newMiddleGround).classList.add("layer--normal");
  document.getElementById(newForeground).classList.add("layer--twice");

  const layers = [
    document.getElementById(newBackground),
    document.getElementById(newMiddleGround),
    document.getElementById(newForeground),
  ];
  makeSceneMovable(document.getElementById(dayOrNight), layers);
}
