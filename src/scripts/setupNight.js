function setupNight(container) {
  // Load night images
  importSVG("images/mgj-10.svg", "#night-2", (f) => {
    handleClicks(f, ["no_x5F_snake_1_", "peter_18_", "peter_19_"]);
  });
  importSVG("images/mgj-11.svg", "#night-3", (f) => {
    handleClicks(f, ["dead_x5F_tree_2_", "well_5_", "wolf_2_"]);
  });
  importSVG("images/mgj-12.svg", "#night-4", (f) => {
    handleClicks(f, ["peter_13_", "peter_10_", "dead_x5F_tree_4_", "bag"]);
  });
  importSVG("images/mgj-13.svg", "#night-5", (f) => {
    handleClicks(f, ["tent_2_", "peter_11_"]);
  });
  importSVG("images/mgj-14.svg", "#night-6", (f) => {
    handleClicks(f, ["peter_12_", "peter_15_", "peter_14_"]);
  });

  // Make visible night layers moveable
  const layers = [
    container.querySelector(".layer--half"),
    container.querySelector(".layer--normal"),
    container.querySelector(".layer--twice"),
  ];
  makeSceneMovable(container, layers);
}
