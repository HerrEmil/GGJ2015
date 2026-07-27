function clickHandler(id) {
  for (const key in story) {
    const obj = story[key];
    if (obj.id === id) {
      if (obj.sound) {
        const a = new Audio(obj.sound);
        a.play();
      }
      // One success path, guarded once: `fulfilled` is what stops a step re-firing
      // its success set or re-arming `nextScene` on a repeat click. Locked hints
      // still repeat — `fulfilled` can only be set once the premise is met.
      if (obj.premise && !story[obj.premise].fulfilled) {
        bubble(obj.locked);
      } else if (!obj.fulfilled) {
        bubble(obj.success, obj.nextScene ? () => switchScene(obj.nextScene) : undefined);
        obj.fulfilled = true;
      }
    }
  }
}

function handleClicks(f, ids) {
  ids.forEach((id) => {
    const querySelector = `#${id}`;
    f.select(querySelector).click(() => {
      clickHandler(id);
    });
  });
}
