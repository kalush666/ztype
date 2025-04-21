export function handleKeyPress(e, enemies) {
  const letter = e.key.toLowerCase();

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.word[enemy.progress] === letter) {
      const done = enemy.type(letter);
      if (done) enemies.splice(i, 1);
      break;
    }
  }
}
