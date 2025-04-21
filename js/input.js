export function handleKeyPress(e, enemies) {
  if (
    e.key === "Shift" ||
    e.key === "Control" ||
    e.key === "Alt" ||
    e.key === "Meta" ||
    e.key === "CapsLock" ||
    e.key === "Tab"
  ) {
    return { completed: false };
  }

  if (e.key === "Escape") {
    return { completed: false };
  }

  const letter = e.key.toLowerCase();

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.word[enemy.progress] === letter) {
      const done = enemy.type(letter);
      if (done) {
        return { completed: true, index: i };
      }
      return { completed: false };
    }
  }

  return { completed: false };
}
