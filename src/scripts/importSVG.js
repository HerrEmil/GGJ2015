function importSVG(url, querySelector, addEventsFn) {
    var s = Snap(querySelector);
    Snap.load(url, function (f) {
        var g = f.select('g');
        // Event handlers for specific objects...
        addEventsFn(f);
        s.append(f);
    });
}