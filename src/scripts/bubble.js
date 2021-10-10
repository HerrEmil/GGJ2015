function bubble(id) {
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
  el.addEventListener("click", () => {
    el.style.display = "none";
  });
  document.body.appendChild(el);
}
