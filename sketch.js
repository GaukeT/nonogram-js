const DEBUG = false;

let resetButton;
let solveButton;

let boardWidth = 450;
let game;

function setup() {
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  var cnv = createCanvas(600, 600);
  cnv.parent('cnv-div');

//  setupResetButton();
//  setupSolveButton();

  game = new Game(boardWidth);
}

function draw() {
    background(255);
    game.draw();

    if (mouseIsPressed) {
        game.handleMousePressed();
    }
}

function styleButton(button) {
  button.style('border', 'none');
  button.style('padding', '6px 10px');
  button.style('border-radius', '6px');
  button.style('transition-duration', '0.4s');
}

function setupResetButton() {
  resetButton = createButton('Reset');
  resetButton.position(10, 550);
  resetButton.mousePressed(resetBoard);
  styleButton(resetButton);
}

function resetBoard() {
  game.initBoard();
}

function setupSolveButton() {
  solveButton = createButton('Solve');
  solveButton.position(80, 550);
  solveButton.mousePressed(solveSudoku);
  styleButton(solveButton);
}