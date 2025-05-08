export class Enemy {
  constructor(word, x, y) {
    this.word = word;
    this.x = x;
    this.y = y;
    this.progress = 0;
    this.speed = Math.max(0.8, 1.8 - word.length * 0.05);
    this.originalSpeed = this.speed;
  }

  update(isFocused) {
    this.speed = isFocused ? this.originalSpeed * 0.5 : this.originalSpeed;
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "24px monospace";
    ctx.fillText(this.word, this.x, this.y);

    if (this.progress > 0) {
      ctx.fillStyle = "lime";
      ctx.fillText(this.word.slice(0, this.progress), this.x, this.y);
    }
  }

  type(letter) {
    if (this.word[this.progress] === letter) {
      this.progress++;
      return this.progress === this.word.length;
    }
    return false;
  }
}
