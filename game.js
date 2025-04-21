import { Enemy } from "./js/enemy.js";
import { Explosion } from "./js/explosion.js";
import { handleKeyPress } from "./js/input.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let words = [];
let enemies = [];
let explosions = [];
let inputBuffer = "";
let score = 0;

async function fetchWords() {
  try {
    const response = await fetch("words.txt");
    const text = await response.text();
    words = text
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
  } catch (error) {
    console.error("Error fetching words:", error);
  }
}

function spawnEnemy() {
  if (words.length === 0) {
    console.error("No words available to spawn enemies.");
    return;
  }
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const x = Math.random() * (canvas.width - 150);
  const y = -30;
  enemies.push(new Enemy(randomWord, x, y));
}

function createExplosion(x, y, word) {
  explosions.push(new Explosion(x, y, word));
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].draw(ctx);
    if (explosions[i].isDone()) {
      explosions.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();
    enemy.draw(ctx);

    if (enemy.y > canvas.height + 20) {
      enemies.splice(i, 1);
    }
  }

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
}

function gameLoop() {
  updateGame();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  const result = handleKeyPress(e, enemies);
  if (result.completed) {
    const completedEnemy = enemies[result.index];
    createExplosion(completedEnemy.x, completedEnemy.y, completedEnemy.word);
    enemies.splice(result.index, 1);
    score += completedEnemy.word.length * 10;
  }
});

fetchWords().then(() => {
  setInterval(spawnEnemy, 2000);
  gameLoop();
});
