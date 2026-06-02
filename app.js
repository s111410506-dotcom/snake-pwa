const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const statusEl = document.getElementById('status');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

let snake, direction, nextDirection, food, score, highScore, gameOver, win, gameLoop;

function init() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  win = false;
  highScore = parseInt(localStorage.getItem('snake-high-score') || '0', 10);
  highScoreEl.textContent = highScore;
  scoreEl.textContent = '0';
  statusEl.textContent = '進行中';
  spawnFood();
  draw();
}

function spawnFood() {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) {
    win = true;
    gameOver = true;
    statusEl.textContent = '你贏了！🎉';
    return;
  }
  food = free[Math.floor(Math.random() * free.length)];
}

function update() {
  if (gameOver) return;

  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    gameOver = true;
    statusEl.textContent = '撞牆了！按重新開始';
    updateHighScore();
    return;
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    statusEl.textContent = '咬到自己了！按重新開始';
    updateHighScore();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  if (win) return;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    localStorage.setItem('snake-high-score', String(highScore));
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#0f3460' : '#0d2c52';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  snake.forEach((s, i) => {
    const ratio = 1 - i / (snake.length + 5);
    const g = Math.floor(180 + 75 * ratio);
    ctx.fillStyle = `rgb(0, ${g}, 255)`;
    const pad = 1;
    ctx.beginPath();
    ctx.roundRect(
      s.x * CELL_SIZE + pad,
      s.y * CELL_SIZE + pad,
      CELL_SIZE - pad * 2,
      CELL_SIZE - pad * 2,
      4
    );
    ctx.fill();
  });

  if (food) {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2 - 3,
      food.y * CELL_SIZE + CELL_SIZE / 2 - 3,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function changeDirection(dx, dy) {
  if (dx === -direction.x && dy === -direction.y) return;
  if (dx === direction.x && dy === direction.y) return;
  nextDirection = { x: dx, y: dy };
}

function resetGame() {
  clearInterval(gameLoop);
  init();
  gameLoop = setInterval(() => {
    update();
    draw();
  }, 150);
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); changeDirection(0, -1); break;
    case 'ArrowDown':  e.preventDefault(); changeDirection(0, 1); break;
    case 'ArrowLeft':  e.preventDefault(); changeDirection(-1, 0); break;
    case 'ArrowRight': e.preventDefault(); changeDirection(1, 0); break;
    case ' ':          e.preventDefault(); resetGame(); break;
  }
});

document.getElementById('btn-up').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('btn-down').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('btn-left').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => changeDirection(1, 0));
document.getElementById('restart-btn').addEventListener('click', resetGame);

let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: false });

canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    changeDirection(dx > 0 ? 1 : -1, 0);
  } else {
    changeDirection(0, dy > 0 ? 1 : -1);
  }
}, { passive: false });

init();
gameLoop = setInterval(() => {
  update();
  draw();
}, 150);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
