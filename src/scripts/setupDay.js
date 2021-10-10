function setupDay(container) {
  // Load day images
  importSVG("images/mgj-03.svg", "#day-2", (f) => {
    handleClicks(f, ["no_x5F_snake", "peter_2_", "peter"]);
  });
  importSVG("images/mgj-04.svg", "#day-3", (f) => {
    handleClicks(f, ["peter_17_", "dead_x5F_tree_1_", "well", "wolf_1_"]);
  });
  importSVG("images/mgj-05.svg", "#day-4", (f) => {
    handleClicks(f, ["peter_4_", "peter_3_", "peter_5_", "dead_x5F_tree_3_"]);
  });
  importSVG("images/mgj-06.svg", "#day-5", (f) => {
    handleClicks(f, ["peter_6_", "tent", "snake"]);
  });
  importSVG("images/mgj-07.svg", "#day-6", (f) => {
    handleClicks(f, ["peter_16_", "peter_9_", "peter_1_"]);
  });

  // Make visible day layers moveable
  const layers = [
    container.querySelector(".layer--half"),
    container.querySelector(".layer--normal"),
    container.querySelector(".layer--twice"),
  ];
  makeSceneMovable(container, layers);
  return container;
}
