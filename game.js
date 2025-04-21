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
let level = 1;
let spawnInterval = 2000;
let spawnTimer = null;
let gameOver = false;

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

  const maxLength = Math.min(level * 2, 15);
  const minLength = Math.max(Math.floor(level / 2), 3);

  const adjustedMaxLength = Math.max(maxLength, minLength);

  let wordPool = words.filter((word) => {
    return word.length >= minLength && word.length <= adjustedMaxLength;
  });

  if (wordPool.length === 0) {
    wordPool = words;
  }

  const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
  const x = Math.random() * (canvas.width - 150);
  const y = -30;
  enemies.push(new Enemy(randomWord, x, y));

  adjustDifficulty();
}

function adjustDifficulty() {
  level = 1 + Math.floor(score / 500);

  const baseInterval = 2000;
  const levelFactor = Math.max(0.6, 1 - level * 0.06);
  const enemyCountFactor = Math.min(1.5, 1 + enemies.length * 0.1);

  const newInterval = baseInterval * levelFactor * enemyCountFactor;

  if (Math.abs(newInterval - spawnInterval) > 200) {
    spawnInterval = newInterval;
    if (spawnTimer) {
      clearInterval(spawnTimer);
    }
    spawnTimer = setInterval(spawnEnemy, spawnInterval);
  }
}

function createExplosion(x, y, word) {
  explosions.push(new Explosion(x, y, word));
}

function updateGame() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].draw(ctx);
    if (explosions[i].isDone()) {
      explosions.splice(i, 1);
    }
  }

  let gameOverTriggered = false;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();
    enemy.draw(ctx);

    if (enemy.y >= canvas.height) {
      gameOverTriggered = true;
    }

    if (enemy.y > canvas.height + 20) {
      enemies.splice(i, 1);
    }
  }

  if (gameOverTriggered) {
    gameOver = true;
    clearInterval(spawnTimer);
    spawnTimer = null;
    showGameOver();
  }

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Level: ${level}`, 20, 70);
}

function showGameOver() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  document.getElementById("finalScore").textContent = score;
  gameOverScreen.style.display = "block";
}

function restartGame() {
  gameOver = false;
  enemies = [];
  explosions = [];
  score = 0;
  level = 1;
  spawnInterval = 2000;

  if (spawnTimer) clearInterval(spawnTimer);
  spawnTimer = setInterval(spawnEnemy, spawnInterval);

  document.getElementById("gameOverScreen").style.display = "none";
  gameLoop();
}

document.getElementById("restartButton").addEventListener("click", restartGame);
document.getElementById("startButton").addEventListener("click", () => {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  fetchWords().then(() => {
    spawnTimer = setInterval(spawnEnemy, spawnInterval);
    gameLoop();
  });
});

document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  const result = handleKeyPress(e, enemies);
  if (result.completed) {
    const completedEnemy = enemies[result.index];
    createExplosion(completedEnemy.x, completedEnemy.y, completedEnemy.word);
    enemies.splice(result.index, 1);
    score += completedEnemy.word.length * 10;
    adjustDifficulty();
  }
});

function gameLoop() {
  if (gameOver) return;
  updateGame();
  requestAnimationFrame(gameLoop);
}
