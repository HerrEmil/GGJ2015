function clickHandler(id) {
  for (const key in story) {
    const obj = story[key];
    if (obj.id === id) {
      if (story[key].sound) {
        const a = new Audio(story[key].sound);
        a.play();
      }
      if (obj.premise) {
        // Gate on the step's OWN `fulfilled` too, exactly like the non-premise
        // branch below. Without this guard the premise branch only checked the
        // *premise's* flag, so once the prerequisite was met every further click
        // re-fired the whole success set and re-armed `nextScene` (a repeated
        // switchScene + ambience re-trigger, plus duplicate success bubbles).
        if (story[obj.premise].fulfilled) {
          if (!obj.fulfilled) {
            bubble(obj.success, obj.nextScene ? () => switchScene(obj.nextScene) : undefined);
            obj.fulfilled = true;
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
