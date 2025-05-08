export class Bullet {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 80;

    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    const distance = Math.hypot(this.targetX - this.x, this.targetY - this.y);
    return distance < this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
