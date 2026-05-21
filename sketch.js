const DEBUG = false;

let boardWidth = 450;
let game;

let currentMode = 'fill';

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + mode).classList.add('active');
}

function calcCanvasSize() {
  const padding = 48;
  const uiHeight = 160; // header + buttons + margins
  const size = min(windowWidth - padding, windowHeight - uiHeight, 600);
  return max(size, 200);
}

function setup() {
  const canvasSize = calcCanvasSize();
  boardWidth = floor(canvasSize * 0.75);

  var cnv = createCanvas(canvasSize, canvasSize);
  cnv.parent('cnv-div');

  // Prevent scroll/zoom only when touching the canvas, not the buttons
  cnv.elt.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  cnv.elt.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  cnv.elt.addEventListener('contextmenu', (e) => e.preventDefault());

  game = new Game(boardWidth);
}

function draw() {
  background(255);
  game.draw();

  if (mouseIsPressed) {
    game.handleMousePressed();
  }
}

function windowResized() {
  const canvasSize = calcCanvasSize();
  boardWidth = floor(canvasSize * 0.75);
  resizeCanvas(canvasSize, canvasSize);
  game = new Game(boardWidth);
}

function touchStarted() {
  // handled per-element above; no global prevention
}

function touchMoved() {
  // handled per-element above; no global prevention
}
