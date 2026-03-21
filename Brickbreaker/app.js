const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const statusEl = document.getElementById("status");
const startButtonEl = document.getElementById("start-button");
const restartButtonEl = document.getElementById("restart-button");

const board = {
  width: canvas.width,
  height: canvas.height,
};

const paddle = {
  width: 118,
  height: 16,
  x: (board.width - 118) / 2,
  y: board.height - 42,
  speed: 7,
};

const ball = {
  radius: 10,
  x: board.width / 2,
  y: board.height - 60,
  dx: 4,
  dy: -4,
};

const brickGrid = {
  rows: 6,
  columns: 9,
  width: 64,
  height: 22,
  gap: 10,
  offsetTop: 72,
  offsetLeft: 36,
};

let score = 0;
let lives = 3;
let level = 1;
let running = false;
let animationFrameId = null;
let moveLeft = false;
let moveRight = false;
let bricks = [];

buildLevel();
syncHud();
draw();

startButtonEl.addEventListener("click", startGame);
restartButtonEl.addEventListener("click", restartGame);

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function buildLevel() {
  bricks = [];

  for (let row = 0; row < brickGrid.rows; row += 1) {
    for (let column = 0; column < brickGrid.columns; column += 1) {
      bricks.push({
        x: brickGrid.offsetLeft + column * (brickGrid.width + brickGrid.gap),
        y: brickGrid.offsetTop + row * (brickGrid.height + brickGrid.gap),
        width: brickGrid.width,
        height: brickGrid.height,
        color: pickBrickColor(row, column),
        active: true,
      });
    }
  }
}

function pickBrickColor(row, column) {
  const palette = ["#38bdf8", "#34d399", "#fbbf24", "#fb7185", "#818cf8", "#f97316"];
  return palette[(row + column) % palette.length];
}

function startGame() {
  if (running) {
    return;
  }

  running = true;
  statusEl.textContent = "Game live. Keep the signal ball in play.";
  tick();
}

function restartGame() {
  cancelAnimationFrame(animationFrameId);
  score = 0;
  lives = 3;
  level = 1;
  running = false;
  resetBallAndPaddle();
  buildLevel();
  syncHud();
  statusEl.textContent = "Board reset. Press Start to launch again.";
  draw();
}

function tick() {
  update();
  draw();

  if (running) {
    animationFrameId = requestAnimationFrame(tick);
  }
}

function update() {
  movePaddle();

  ball.x += ball.dx;
  ball.y += ball.dy;

  handleWallCollision();
  handlePaddleCollision();
  handleBrickCollision();
  handleMiss();
}

function movePaddle() {
  if (moveLeft) {
    paddle.x -= paddle.speed;
  }

  if (moveRight) {
    paddle.x += paddle.speed;
  }

  paddle.x = Math.max(0, Math.min(board.width - paddle.width, paddle.x));
}

function handleWallCollision() {
  if (ball.x + ball.radius >= board.width || ball.x - ball.radius <= 0) {
    ball.dx *= -1;
  }

  if (ball.y - ball.radius <= 0) {
    ball.dy *= -1;
  }
}

function handlePaddleCollision() {
  const withinX = ball.x >= paddle.x && ball.x <= paddle.x + paddle.width;
  const withinY = ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;

  if (withinX && withinY && ball.dy > 0) {
    const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    ball.dx = hitOffset * 5.5;
    ball.dy = -Math.abs(ball.dy);
  }
}

function handleBrickCollision() {
  for (const brick of bricks) {
    if (!brick.active) {
      continue;
    }

    const hitX = ball.x + ball.radius >= brick.x && ball.x - ball.radius <= brick.x + brick.width;
    const hitY = ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height;

    if (hitX && hitY) {
      brick.active = false;
      ball.dy *= -1;
      score += 10;
      syncHud();

      if (bricks.every((candidate) => !candidate.active)) {
        advanceLevel();
      }
      break;
    }
  }
}

function handleMiss() {
  if (ball.y - ball.radius <= board.height) {
    return;
  }

  lives -= 1;
  syncHud();

  if (lives <= 0) {
    running = false;
    cancelAnimationFrame(animationFrameId);
    statusEl.textContent = "Game over. Press Restart to run the harbor again.";
    return;
  }

  running = false;
  cancelAnimationFrame(animationFrameId);
  resetBallAndPaddle();
  statusEl.textContent = "Life lost. Press Start to launch the ball again.";
  draw();
}

function advanceLevel() {
  level += 1;
  ball.dx = Math.sign(ball.dx || 1) * (Math.abs(ball.dx) + 0.6);
  ball.dy = -Math.abs(ball.dy) - 0.6;
  buildLevel();
  resetBallAndPaddle();
  running = false;
  syncHud();
  cancelAnimationFrame(animationFrameId);
  statusEl.textContent = `Level ${level} ready. Press Start to launch with more speed.`;
}

function resetBallAndPaddle() {
  paddle.x = (board.width - paddle.width) / 2;
  ball.x = board.width / 2;
  ball.y = board.height - 60;
  ball.dx = 4 + (level - 1) * 0.6;
  ball.dy = -(4 + (level - 1) * 0.6);
}

function syncHud() {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
  levelEl.textContent = String(level);
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  drawBackdrop();
  drawBricks();
  drawPaddle();
  drawBall();
  drawBoardLabel();
}

function drawBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, 0, board.height);
  gradient.addColorStop(0, "#10233c");
  gradient.addColorStop(1, "#07121f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, board.width, board.height);

  for (let index = 0; index < 28; index += 1) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.arc((index * 97) % board.width, (index * 53) % board.height, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBricks() {
  for (const brick of bricks) {
    if (!brick.active) {
      continue;
    }

    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }
}

function drawPaddle() {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoardLabel() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText("Harbor Breaker", 24, 34);
}

function handleKeyDown(event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    moveLeft = true;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    moveRight = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    moveLeft = false;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    moveRight = false;
  }
}
