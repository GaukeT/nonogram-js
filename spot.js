class Spot {
    y = -1;
    x = -1;
    val = 0;
    offset;
    filled;

    indexY = -1;
    indexX = -1;

    constructor(y, x, val, offset, filled) {
      this.offset = offset;
      this.y = y * this.offset;
      this.x = x * this.offset;
      this.val = val;
      this.filled = filled;

      this.indexY = y;
      this.indexX = x;
    }

    show() {
      // spot
      fill(255);
      square(this.x, this.y, this.offset);

      // fill
      push();
      noStroke();

      let o = this.offset * 0.1;
      if (this.val >= 0) {
        fill(255 * this.val);
        square(this.x + o, this.y + o, this.offset - (2*o));
      } else {
        fill(200,0,0);
        circle(this.x + this.offset / 2, this.y + this.offset / 2, 5);
      }
      pop();
    }

    showIndexes() {
      fill(0);
      textSize(9);
      textAlign(CENTER);
      text('y:' +  this.indexY + ' | x:' + this.indexX, this.x + this.offset * 0.5, this.y + this.offset * 0.95);
    }

    clicked(markSpot) {
      if (this.val === 1) this.val = 0;
      else this.val = 1;

      this.show();
    }

    getVal() {
        return this.val;
    }

    setVal(newVal) {
        // TODO: validation newVal between 0 and 1;
        if (this.val !== newVal) {
            this.val = newVal;
        }
    }
}
