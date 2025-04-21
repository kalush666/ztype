export class Explosion {
  constructor(x, y, word) {
    this.x = x;
    this.y = y;
    this.word = word;
    this.particles = [];
    this.lifespan = 40;
    this.timer = 0;

    const numParticles = Math.min(word.length * 3, 30);
    for (let i = 0; i < numParticles; i++) {
      this.particles.push({
        x: this.x + Math.random() * 50 - 25,
        y: this.y + Math.random() * 20 - 10,
        vx: Math.random() * 6 - 3,
        vy: Math.random() * -5 - 2,
        size: Math.random() * 8 + 4,
        color: this.getRandomColor(),
        alpha: 1,
      });
    }
  }

  getRandomColor() {
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#00ffff",
      "#ff00ff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.timer++;

    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.vy += 0.1;
      particle.alpha = Math.max(0, 1 - this.timer / this.lifespan);

      particle.size *= 0.98;
    });
  }

  draw(ctx) {
    if (this.timer < 15) {
      ctx.save();
      const progress = this.timer / 15;
      const scale = 1 + progress;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.font = `${24 * scale}px monospace`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        this.word,
        this.x + this.word.length * 6,
        this.y - progress * 20
      );
      ctx.restore();
    }

    this.particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  isDone() {
    return this.timer >= this.lifespan;
  }
}
