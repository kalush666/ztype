import { Enemy } from "./js/enemy.js";
import { hundleKeyPress } from "./js/input.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let words = [];
let enemies = [];
let inputBuffer = "";

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
  const x = Math.random() * (canvas.width - 100);
  const y = -30;
  enemies.push(new Enemy(randomWord, x, y));
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let enemy of enemies) {
    enemy.update();
    enemy.draw();
  }
}

function gameLoop() {
  updateGame();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (event) => {
  hundleKeyPress(event, enemies);
});

fetchWords().then(() => {
  setInterval(spawnEnemy, 2000);
  gameLoop();
});
