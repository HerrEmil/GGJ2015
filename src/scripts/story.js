const story = {
  "clicking tent": {
    id: "tent",
    success: "05",
    sound: "sfx/rattle",
  },
  "getting a club": {
    id: "dead_x5F_tree_3_",
    premise: "clicking tent",
    locked: "It´s a tree.",
    success: ["10", "11"],
  },
  "sleeping in tent": {
    id: "tent",
    premise: "getting a club",
    locked: "06",
    success: "08",
  },
  "getting matches": {
    id: "bag",
    premise: "sleeping in tent",
    success: [16, 17, 18],
    sound: "sfx/match-strike",
  },
  "making a torch": {
    id: "dead_x5F_tree_4_",
    premise: "getting matches",
    locked: 19,
    success: [20, 21],
    sound: "sfx/match-strike",
  },
  "scaring the wolf": {
    id: "wolf_2_",
    premise: "making a torch",
    locked: [14, 15],
    success: [23, 24, 25, 26, 27],
    sound: "sfx/dog-snarl-self-made",
  },
  "EXTRA TEXT meeting the wolf": {
    id: "wolf_1_",
    success: [12, 13],
    sound: "sfx/dog-snarl-self-made",
  },
  "EXTRA TEXT cannot sleep": {
    id: "tent_2_",
    success: 28,
  },
};
