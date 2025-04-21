export class Enemy {
  constructor(word, x, y) {
    this.word = word;
    this.x = x;
    this.y = y;
    this.progress = 0;
  }

  update() {
    this.y += 0.5;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "24px monospace";
    ctx.fillText(this.word, this.x, this.y);
    // Highlight typed part
    ctx.fillStyle = "lime";
    ctx.fillText(this.word.slice(0, this.progress), this.x, this.y);
  }

  type(letter) {
    if (this.word[this.progress] === letter) {
      this.progress++;
      return this.progress === this.word.length;
    }
    return false;
  }
}
