class Game {
    initLoaded = false;
    size = 10;
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

    constructor(boardWidth) {
        // board[y-axis]
        this.board = [this.size];

        this.width = boardWidth;
        this.offset = this.width / this.size;
        this.initBoard();
    }

    initBoard() {
        // board[y-axis][x-axis]
        for (let y = 0; y < this.size; y++) {
            let row = [this.size];
            for (let x = 0; x < this.size; x++) {
                let isFilled = random(1) < 0.50;
                row[x] = new Spot(y, x, 1, this.offset, isFilled);
             }
            this.board[y] = row;
        }
        // determine hints
        this.countRows();
        this.countCols();
        this.rowsComplete = this.rows.map(r => new Array(r.length).fill(false));
        this.colsComplete = this.cols.map(c => new Array(c.length).fill(false));
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
              //this.board[y][x].showIndexes();
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
      line(0, 5 * this.offset, this.width, 5 * this.offset);
      line(5 * this.offset, 0, 5 * this.offset, this.width);
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
        // toggle: filled → empty, anything else → filled
        this.setVal(y, x, this.getVal(y, x) === 0 ? 1 : 0);
      } else if (currentMode === 'mark') {
        // toggle: marked → empty, anything else → marked
        this.setVal(y, x, this.getVal(y, x) === -1 ? 1 : -1);
      }
    }

    getVal(y, x) {
        return this.board[y][x].getVal();
    }

    setVal(y, x, newVal) {
        this.board[y][x].setVal(newVal);
    }
}
