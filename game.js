import { Enemy } from "./js/enemy.js";
import { Explosion } from "./js/explosion.js";
import { handleKeyPress } from "./js/input.js";
import { Bullet } from "./js/Bullet.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shipImage = new Image();
const MAX_HIGH_SCORES = 5;

shipImage.src = "assets/images/ship-removebg-preview.png";
let shipX = canvas.width / 2;
let shipY = canvas.height - 50;
let targetX = shipX;
let targetY = shipY;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  shipX = canvas.width / 2;
  shipY = canvas.height - 50;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function saveHighScore(score) {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  highScores.push(score);
  highScores.sort((a, b) => b - a);
  if (highScores.length > MAX_HIGH_SCORES) {
    highScores.pop();
  }
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

function displayHighScores() {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const highScoresList = document.getElementById("highScoresList");

  highScoresList.innerHTML = "";

  highScores.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.score} - ${entry.date}`;
    highScoresList.appendChild(li);
  });
}
let words = [];
let enemies = [];
let explosions = [];
let bullets = [];
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
  targetX = x;
  targetY = y;
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

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].update()) {
      createExplosion(bullets[i].targetX, bullets[i].targetY, "");
      bullets.splice(i, 1);
    } else {
      bullets[i].draw(ctx);
    }
  }

  let focusedEnemyIndex = -1;
  if (inputBuffer.length > 0) {
    focusedEnemyIndex = enemies.findIndex((enemy) =>
      enemy.word.startsWith(inputBuffer)
    );
  }

  let gameOverTriggered = false;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const isFocused = i === focusedEnemyIndex;
    enemy.update(isFocused);
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

  drawShip();
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

function drawShip() {
  const angle = Math.atan2(targetY - shipY, targetX - shipX);
  ctx.save();
  ctx.translate(shipX, shipY);
  ctx.rotate(angle + Math.PI / 2);
  ctx.drawImage(shipImage, -25, -25, 50, 50);
  ctx.restore();
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

document.getElementById("scoreboard").addEventListener("click", () => {
  document.getElementById("highScores").style.display = "block";
  displayHighScores();
});
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  const result = handleKeyPress(e, enemies);
  if (result.completed) {
    const completedEnemy = enemies[result.index];
    bullets.push(new Bullet(shipX, shipY, completedEnemy.x, completedEnemy.y));
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
