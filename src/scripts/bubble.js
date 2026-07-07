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
function bubbleOnce(id, onDismissed) {
  const url = `bubbles/bubble-${id}.svg`;
  const el = document.createElement("div");
  el.className = "bubble";
  el.setAttribute(
    "style",
    `z-index: ${100 - id};background-image: url(${url})`
  );
  el.addEventListener("click", () => {
    el.style.display = "none";
    if (!Array.from(document.querySelectorAll(".bubble")).some(b => b.style.display !== "none")) {
      document.body.classList.remove("has-bubble");
    }
    onDismissed();
  });
  document.body.appendChild(el);
}
