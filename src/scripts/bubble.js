let onAllBubblesDismissed = null;

function bubble(id, onComplete) {
  if (onComplete) {
    onAllBubblesDismissed = onComplete;
  }
  if (id instanceof Array) {
    id.forEach(bubbleOnce);
  } else {
    bubbleOnce(id);
  }
}
function bubbleOnce(id) {
  const url = `bubbles/bubble-${id}.svg`;
  const el = document.createElement("div");
  el.className = "bubble";
  el.setAttribute(
    "style",
    `z-index: ${100 - id};background-image: url(${url})`
  );
  document.body.classList.add("has-bubble");
  el.addEventListener("click", () => {
    el.style.display = "none";
    if (!Array.from(document.querySelectorAll(".bubble")).some(b => b.style.display !== "none")) {
      document.body.classList.remove("has-bubble");
      if (onAllBubblesDismissed) {
        const cb = onAllBubblesDismissed;
        onAllBubblesDismissed = null;
        cb();
      }
    }
  });
  document.body.appendChild(el);
}
