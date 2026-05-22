// Cell state constants
const VAL_FILLED = 0;   // player filled the cell (black)
const VAL_EMPTY  = 1;   // cell is empty (white)
const VAL_MARKED = -1;  // player marked the cell (red dot)

// Supported grid sizes and their bold-line block size.
// blockSize drives drawBoldLines() — no hardcoded numbers anywhere else.
const GRID_PRESETS = {
    6:  { blockSize: 3  },   // 2×2 of 3×3
    8:  { blockSize: 4  },   // 2×2 of 4×4
    10: { blockSize: 5  },   // 2×2 of 5×5
    12: { blockSize: 4  },   // 3×3 of 4×4
    15: { blockSize: 5  },   // 3×3 of 5×5
};

class Game {
    size;
    blockSize;
    board;
    width;
    offset;

    // hints
    rows = [];
    cols = [];

    // hint completion state
    rowsComplete = [];
    colsComplete = [];

    // prevent re-toggling the same cell during a drag
    lastClickedCell = null;

    constructor(boardWidth, size = 10) {
        this.size = size;
        this.blockSize = (GRID_PRESETS[size] ?? { blockSize: size }).blockSize;
        this.board = [];

        this.width = boardWidth;
        this.offset = this.width / this.size;
        this.initBoard();
    }

    // Constraints — easy to tune when adding size selection later:
    // minGroups / maxGroups scale with board size so a 5×5 or 15×15 still works.
    get minGroups() { return 2; }
    get maxGroups() { return Math.min(5, Math.max(4, Math.floor(this.size / 2.5))); }

    initBoard() {
        let attempts = 0;
        do {
            attempts++;
            this.rows = [];
            this.cols = [];

            // board[y-axis][x-axis]
            // _randomValidRow guarantees each row already satisfies minGroups/maxGroups,
            // so only column checks and uniqueness can still fail — far fewer retries.
            for (let y = 0; y < this.size; y++) {
                const rowData = _randomValidRow(this.size, this.minGroups, this.maxGroups);
                let row = [];
                for (let x = 0; x < this.size; x++) {
                    row[x] = new Spot(y, x, VAL_EMPTY, this.offset, rowData ? rowData[x] : random(1) < 0.5);
                }
                this.board[y] = row;
            }

            if (DEBUG) {
                console.log(`Attempt ${attempts}`);
            }

            this.countRows();
            this.countCols();
        } while (!this.isValidBoard());

        this.lastClickedCell = null;
        this.rowsComplete = this.rows.map(r => new Array(r.length).fill(false));
        this.colsComplete = this.cols.map(c => new Array(c.length).fill(false));
    }

    // Returns true when every row and column passes all constraints.
    isValidBoard() {
        for (let i = 0; i < this.size; i++) {
            const rg = this.rows[i].length;
            const cg = this.cols[i].length;

            // 2–maxGroups hint groups per line (also rules out empty and fully-filled lines)
            if (rg < this.minGroups || rg > this.maxGroups) return false;
            if (cg < this.minGroups || cg > this.maxGroups) return false;

            // No row or column that is completely filled
            const rowFilled = this.rows[i].reduce((s, v) => s + v, 0);
            const colFilled = this.cols[i].reduce((s, v) => s + v, 0);
            if (rowFilled === this.size || colFilled === this.size) return false;
        }

        // Uniqueness check: only accept puzzles with exactly one solution.
        // -1 means the solver hit the node limit — accept as fallback so generation
        // doesn't loop forever on complex boards.
        const solutions = countNonogramSolutions(this.rows, this.cols);
        if (DEBUG) console.log('solutions:', solutions);
        return solutions === 1 || solutions === -1;
    }

    countRows() {
        for (let y = 0; y < this.size; y++) {
            let groups = [];
            let group = 0;

            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x].filled) {
                    group++;
                } else {
                    if (group > 0) {
                        groups.push(group);
                    }
                    group = 0;
                }
            }
            if (group > 0) {
                groups.push(group);
            }
            this.rows.push(groups);
        }
    }

    countCols() {
        for (let x = 0; x < this.size; x++) {
            let groups = [];
            let group = 0;

            for (let y = 0; y < this.size; y++) {
                if (this.board[y][x].filled) {
                    group++;
                } else {
                    if (group > 0) {
                        groups.push(group);
                    }
                    group = 0;
                }
            }

            if (group > 0) {
                groups.push(group);
            }

            this.cols.push(groups);
        }
    }

    draw() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
              this.board[y][x].show();

              if (DEBUG) {
                  this.board[y][x].showIndexes();
              }
            }
        }

        push();
        textSize(this.offset * 0.42);
        textAlign(LEFT, BASELINE);

        // Row hints (right of board)
        for (let i = 0; i < this.rows.length; i++) {
            const y = i * this.offset + (this.offset * 0.7);
            let posX = this.width + this.offset * 0.4;

            for (let j = 0; j < this.rows[i].length; j++) {
                const done = this.rowsComplete[i][j];
                fill(done ? color(160) : color(0));
                noStroke();
                text(this.rows[i][j], posX, y);

                if (done) {
                    const numW = textWidth(String(this.rows[i][j]));
                    stroke(160);
                    strokeWeight(1.5);
                    line(posX, y - this.offset * 0.18, posX + numW, y - this.offset * 0.18);
                }
                posX += this.offset * 0.55;
            }
        }

        // Col hints (below board)
        for (let i = 0; i < this.cols.length; i++) {
            const x = i * this.offset + (this.offset * 0.4);
            let posY = this.width + this.offset * 0.6;

            for (let j = 0; j < this.cols[i].length; j++) {
                const done = this.colsComplete[i][j];
                fill(done ? color(160) : color(0));
                noStroke();
                text(this.cols[i][j], x, posY);

                if (done) {
                    const numW = textWidth(String(this.cols[i][j]));
                    stroke(160);
                    strokeWeight(1.5);
                    line(x, posY - this.offset * 0.18, x + numW, posY - this.offset * 0.18);
                }
                posY += this.offset * 0.65;
            }
        }
        pop();

        this.drawBoldLines();
    }

    drawBoldLines() {
      push();
      strokeWeight(2.5);
      // draw a divider every blockSize cells; skip the outer border (i < size)
      for (let i = this.blockSize; i < this.size; i += this.blockSize) {
        line(0, i * this.offset, this.width, i * this.offset); // horizontal
        line(i * this.offset, 0, i * this.offset, this.width); // vertical
      }
      pop();
    }

    handleHintClick(px, py) {
        // Row hints: to the right of the board
        if (px > this.width && py >= 0 && py < this.width) {
            const row = floor(py / this.offset);
            if (row < 0 || row >= this.size) return;
            // shift hit-zone left by a small margin so click lands ON the digit
            const hitStartX = this.width + this.offset * 0.1;
            const j = floor((px - hitStartX) / (this.offset * 0.55));
            if (j >= 0 && j < this.rowsComplete[row].length) {
                this.rowsComplete[row][j] = !this.rowsComplete[row][j];
            }
            return;
        }
        // Col hints: below the board
        if (py > this.width && px >= 0 && px < this.width) {
            const col = floor(px / this.offset);
            if (col < 0 || col >= this.size) return;
            // shift hit-zone up by font height so click lands ON the digit, not below it
            const hitStartY = this.width + this.offset * 0.6 - this.offset * 0.42;
            const j = floor((py - hitStartY) / (this.offset * 0.65));
            if (j >= 0 && j < this.colsComplete[col].length) {
                this.colsComplete[col][j] = !this.colsComplete[col][j];
            }
        }
    }

    handleMousePressed() {
      if (game && mouseX < boardWidth && mouseY < boardWidth) {
        let mY = floor(mouseY / game.offset);
        let mX = floor(mouseX / game.offset);

        if (mY >= 0 && mX >= 0) {
          // only act when entering a new cell, prevents flicker from toggle on every frame
          if (!this.lastClickedCell || this.lastClickedCell.y !== mY || this.lastClickedCell.x !== mX) {
            this.lastClickedCell = { y: mY, x: mX };
            game.clicked(mY, mX);
          }
        }
      }
    }

    resetClickState() {
      this.lastClickedCell = null;
    }

    clicked(y, x) {
      if (currentMode === 'fill') {
        this.setVal(y, x, this.getVal(y, x) === VAL_FILLED ? VAL_EMPTY : VAL_FILLED);
      } else if (currentMode === 'mark') {
        this.setVal(y, x, this.getVal(y, x) === VAL_MARKED ? VAL_EMPTY : VAL_MARKED);
      }
      if (this.isBoardComplete()) {
        validating = true;
        document.getElementById('btn-validate').classList.add('active');
      }
    }

    // Returns true when every cell has been filled or marked (none left empty).
    isBoardComplete() {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          if (this.board[y][x].getVal() === VAL_EMPTY) return false;
        }
      }
      return true;
    }

    getVal(y, x) {
        return this.board[y][x].getVal();
    }

    setVal(y, x, newVal) {
        this.board[y][x].setVal(newVal);
    }
}
