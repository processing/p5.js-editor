/**
 *  @name soundFormats
 *  @description <p>There is no single sound format that is supported
 *  by all web browsers. For example, mp3 support is not native to
 *  Firefox and Opera because the mp3 codec is patented.</p>
 *
 *  <p>To ensure compatability, you can include the same sound file
 *  in multiple formats, i.e. 'sound.mp3' and 'sound.ogg'. (Ogg is an
 *  open source alternative to mp3.) You can convert audio files
 *  into web friendly formats for free online at <a href="
 *  http://media.io/">media.io</a></p>.
 *
 *  <p>The soundFormats() method tells loadSound which formats
 *  we have included with our sketch. Then, loadSound will
 *  attempt to load the first format that is supported by the
 *  client's web browser.</p>
 *
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
var song;

function preload() {
  // we have included both an .ogg file and an .mp3 file
  soundFormats('ogg', 'mp3');

  // if mp3 is not supported by this browser,
  // loadSound will load the ogg file
  // we have included with our sketch
  song = loadSound('assets/lucky_dragons_-_power_melody.mp3');
}

function setup() {
  createCanvas(710, 200);

  // song loaded during preload(), ready to play in setup()
  song.play();
  background(0,255,0);
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.pause();
    background(255,0,0);
  } else {
    song.play(); // playback will resume from the pause position
    background(0,255,0);
  }
}
