/*

Start a new sound like so:
  var a = new Audio('Intro1');
  a.play();

Fade it: 
  fadeSound(a, 0.005);


Audio tracks so far:

Music
=====

Intro1
Mood1
Problem
Death


Sound effects
=============

sfx/175182__seidhepriest__vibraslap-4 (rattlesnake)
sfx/166819__quistard__water-bubble-7 (water bottle)
sfx/231840__skepticdosh__match-strike (matches)

Ambience
========

amb/104320__proxima4__desert-simple
amb/138288__kangaroovindaloo__desert-at-night

*/


function Audio(key) {
    var el = document.createElement('audio');
    var srcMP3 = '<source src="snd/'+key+'.mp3" type=\'audio/mpeg; codecs="mp3"\'>';
    var srcOGG = '<source src="snd/'+key+'.mp3" type=\'audio/ogg; codecs="vorbis"\'>';
    el.innerHTML =  srcMP3 + srcOGG;
    return el;
}

// decr: 0.005 is a good value
function fadeSound(el, decr) {
    if(!el) return;
    if(el.volume > decr) {
        el.volume -= decr;
        setTimeout (function(){
            fadeSound(el, decr);
        }, 16);
    } else {
        el.pause();
        el.volume = 1;
        el.currentTime = 0;
    }
}
