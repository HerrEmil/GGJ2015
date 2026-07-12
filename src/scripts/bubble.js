function bubble(id, onComplete) {
  const ids = id instanceof Array ? id : [id];
  let remaining = ids.length;
  document.body.classList.add("has-bubble");
  ids.forEach((bubbleId) =>
    bubbleOnce(bubbleId, () => {
      remaining -= 1;
      if (remaining === 0 && onComplete) {
        onComplete();
      }
    })
  );
}
// Bubble art is referenced by number ("05", 28, ...). Any non-numeric id is a
// plain-text hint (e.g. story `locked: "It´s a tree."`) and must be rendered as
// text: building `url(bubbles/bubble-It´s a tree..svg)` yields an invalid,
// space-containing url the CSS parser drops, plus a `100 - "It´s a tree."` = NaN
// z-index — leaving an invisible, art-less bubble and never showing the hint.
function isBubbleArtId(id) {
  return typeof id === "number" || /^\d+$/.test(String(id));
}

function bubbleOnce(id, onDismissed) {
  const el = document.createElement("div");
  el.className = "bubble";
  el.addEventListener("click", () => {
    el.style.display = "none";
    if (!Array.from(document.querySelectorAll(".bubble")).some(b => b.style.display !== "none")) {
      document.body.classList.remove("has-bubble");
    }
    onDismissed();
  });

  if (isBubbleArtId(id)) {
    el.style.zIndex = String(100 - Number(id));
    el.style.backgroundImage = `url(bubbles/bubble-${id}.svg)`;
  } else {
    el.classList.add("bubble--text");
    el.style.zIndex = "60";
    const text = document.createElement("span");
    text.className = "bubble__text";
    text.textContent = String(id);
    el.appendChild(text);
  }

  document.body.appendChild(el);
}
