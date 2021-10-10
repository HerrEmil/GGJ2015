function Audio(key) {
  const el = document.createElement("audio");
  const srcMP3 = `<source src="snd/${key}.mp3" type='audio/mpeg; codecs="mp3"'>`;
  const srcOGG = `<source src="snd/${key}.mp3" type='audio/ogg; codecs="vorbis"'>`;
  el.innerHTML = srcMP3 + srcOGG;
  return el;
}

// decr: 0.005 is a good value
function fadeSound(el, decr) {
  if (!el) return;
  if (el.volume > decr) {
    el.volume -= decr;
    setTimeout(() => {
      fadeSound(el, decr);
    }, 16);
  } else {
    el.pause();
    el.volume = 1;
    el.currentTime = 0;
  }
}
