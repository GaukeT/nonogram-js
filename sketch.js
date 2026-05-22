let DEBUG = false;

let boardWidth = 450;
let game;

let currentMode = 'fill';
let currentGridSize = 10;

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + mode).classList.add('active');
}

function setGridSize(size) {
  currentGridSize = size;
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-size-' + size).classList.add('active');
  const canvasSize = calcCanvasSize();
  boardWidth = floor(canvasSize * 0.75);
  game = new Game(boardWidth, currentGridSize);
}

function calcCanvasSize() {
  const el = document.getElementById('cnv-div');
  return max(el ? el.clientWidth : 400, 200);
}

function setup() {
  const canvasSize = calcCanvasSize();
  boardWidth = floor(canvasSize * 0.79);

  var cnv = createCanvas(canvasSize, canvasSize);
  cnv.parent('cnv-div');

  // Prevent scroll/zoom only when touching the canvas, not the buttons
  cnv.elt.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  cnv.elt.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  cnv.elt.addEventListener('contextmenu', (e) => e.preventDefault());

  game = new Game(boardWidth, currentGridSize);
}

function draw() {
  background(255);
  game.draw();

  // Show pointer cursor when hovering over hint areas
  const inRowHint = mouseX > boardWidth && mouseY >= 0 && mouseY < boardWidth;
  const inColHint = mouseY > boardWidth && mouseX >= 0 && mouseX < boardWidth;
  cursor(inRowHint || inColHint ? HAND : ARROW);

  if (mouseIsPressed) {
    game.handleMousePressed();
  }
}

function windowResized() {
  const canvasSize = calcCanvasSize();
  boardWidth = floor(canvasSize * 0.75);
  resizeCanvas(canvasSize, canvasSize);
  game = new Game(boardWidth, currentGridSize);
}

function mouseReleased() {
  if (game) game.resetClickState();
}

function mousePressed() {
  if (game) {
    game.handleHintClick(mouseX, mouseY);
  }
}

function touchStarted() {
  // handled per-element above; no global prevention
}

function touchMoved() {
  // handled per-element above; no global prevention
}
