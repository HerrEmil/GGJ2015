function importSVG(url, querySelector, addEventsFn) {
  const s = Snap(querySelector);
  Snap.load(url, (f) => {
    // Event handlers for specific objects...
    addEventsFn(f);
    s.append(f);
  });
}
