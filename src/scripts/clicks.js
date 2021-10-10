function clickHandler(id) {
  for (const key in story) {
    const obj = story[key];
    if (obj.id === id) {
      if (story[key].sound) {
        const a = new Audio(story[key].sound);
        a.play();
      }
      if (obj.premise) {
        if (story[obj.premise].fulfilled) {
          bubble(obj.success);
          obj.fulfilled = true;
          if (key === "sleeping in tent") {
            switchScene("night");
          }
        } else {
          bubble(obj.locked);
        }
      } else {
        if (!obj.fulfilled) {
          bubble(obj.success);
          obj.fulfilled = true;
        }
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
