class Game {
    initLoaded = false;
    size = 10;
    board;
    width;
    offset;

    // hints
    rows = [];
    cols = [];

    constructor(boardWidth) {
        // board[y-axis]
        this.board = [this.size];

        this.width = boardWidth;
        this.offset = this.width / this.size;
        this.initBoard();
    }

//    initBoard() {
//        // board[y-axis][x-axis]
//        for (let y = 0; y < this.size; y++) {
//            let row = [this.size];
//            for (let x = 0; x < this.size; x++) {
//                row[x] = new Spot(y, x, 1, this.offset);
//             }
//            this.board[y] = row;
//        }
//    }

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
              // this.board[y][x].showIndexes();
            }
        }

        fill(0);
        textSize(20);
        for(let i = 0; i < this.rows.length; i++) {
            let pos = 470;
            for(let j = 0; j < this.rows[i].length; j++) {
            text(this.rows[i][j], pos, i * this.offset + (this.offset * 0.7));
                pos += 25;
            }
        }

        for(let i = 0; i < this.cols.length; i++) {
            let pos = 480;
            for(let j = 0; j < this.cols[i].length; j++) {
                text(this.cols[i][j], i * this.offset + (this.offset * 0.4), pos);
                pos += 30;
            }
        }

        this.drawBoldLines();
    }

    drawBoldLines() {
      push();
      strokeWeight(2.5);
      line(0, 5 * this.offset, this.width, 5 * this.offset);
      line(5 * this.offset, 0, 5 * this.offset, this.width);
      pop();
    }

    handleMousePressed() {
      if (game && mouseX < boardWidth && mouseY < boardWidth) {
        let mY = floor(mouseY / game.offset);
        let mX = floor(mouseX / game.offset);

        if (mY >= 0 && mX >= 0) {
          game.clicked(mY, mX, mouseButton);
        }
      }
    }

    clicked(y, x, button) {
      if (button === LEFT) {
        // fill
        this.setVal(y, x, 0);
      } else if (button === RIGHT) {
        // empty
        this.setVal(y, x, 1);
      } else if (button === CENTER) {
        // mark spot
        this.setVal(y, x, -1);
      }
    }

    getVal(y, x) {
        return this.board[y][x].getVal();
    }

    setVal(y, x, newVal) {
        this.board[y][x].setVal(newVal);
    }
}
