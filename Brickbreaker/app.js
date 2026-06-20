const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const multiplierEl = document.getElementById("multiplier");
const bricksBrokenEl = document.getElementById("bricks-broken");
const statusEl = document.getElementById("status");
const startButtonEl = document.getElementById("start-button");
const restartButtonEl = document.getElementById("restart-button");
const leaderboardListEl = document.getElementById("leaderboard-list");
const scoreModalEl = document.getElementById("score-modal");
const scoreFormEl = document.getElementById("score-form");
const initialsInputEl = document.getElementById("initials-input");
const finalScoreEl = document.getElementById("final-score");

const leaderboardStorageKey = "harborBreakerLeaderboard";

const board = {
  width: canvas.width,
  height: canvas.height,
};

const paddle = {
  baseWidth: 118,
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

const powerUps = [
  {
    id: "wide",
    label: "W",
    name: "Wide Paddle",
    color: "#38bdf8",
  },
  {
    id: "slow",
    label: "S",
    name: "Slow Ball",
    color: "#34d399",
  },
  {
    id: "bounce",
    label: "B",
    name: "Bounce Back",
    color: "#fb7185",
  },
];

const powerUpDurationMs = 30000;
const slowBallFactor = 0.82;

const levelThemes = [
  {
    name: "Dawn Harbor",
    skyTop: "#164e63",
    waterMid: "#0e7490",
    waterBottom: "#083344",
    horizon: "rgba(67, 56, 202, 0.32)",
    skyline: "rgba(15, 23, 42, 0.58)",
    crane: "rgba(251, 191, 36, 0.74)",
    ripple: "rgba(186, 230, 253, 0.2)",
    brickPalette: ["#0ea5e9", "#f97316", "#dc2626", "#16a34a", "#facc15", "#2563eb"],
    paddle: ["#e7c68c", "#b7793a", "#6b3f1d"],
    buoy: ["#ffffff", "#f8fafc", "#ef4444", "#b91c1c"],
    hud: "rgba(5, 21, 37, 0.64)",
  },
  {
    name: "Fog Pier",
    skyTop: "#475569",
    waterMid: "#64748b",
    waterBottom: "#1e293b",
    horizon: "rgba(226, 232, 240, 0.18)",
    skyline: "rgba(15, 23, 42, 0.42)",
    crane: "rgba(248, 250, 252, 0.55)",
    ripple: "rgba(226, 232, 240, 0.2)",
    brickPalette: ["#94a3b8", "#38bdf8", "#f59e0b", "#ef4444", "#22c55e", "#a78bfa"],
    paddle: ["#f8fafc", "#94a3b8", "#475569"],
    buoy: ["#f8fafc", "#e2e8f0", "#38bdf8", "#0369a1"],
    hud: "rgba(15, 23, 42, 0.62)",
  },
  {
    name: "Sunset Docks",
    skyTop: "#7c2d12",
    waterMid: "#be123c",
    waterBottom: "#312e81",
    horizon: "rgba(251, 146, 60, 0.22)",
    skyline: "rgba(67, 20, 7, 0.56)",
    crane: "rgba(253, 186, 116, 0.78)",
    ripple: "rgba(254, 202, 202, 0.2)",
    brickPalette: ["#fb7185", "#f97316", "#facc15", "#a855f7", "#06b6d4", "#22c55e"],
    paddle: ["#fed7aa", "#ea580c", "#7c2d12"],
    buoy: ["#fff7ed", "#fed7aa", "#f97316", "#c2410c"],
    hud: "rgba(67, 20, 7, 0.64)",
  },
  {
    name: "Night Watch",
    skyTop: "#111827",
    waterMid: "#1e3a8a",
    waterBottom: "#020617",
    horizon: "rgba(59, 130, 246, 0.18)",
    skyline: "rgba(2, 6, 23, 0.72)",
    crane: "rgba(250, 204, 21, 0.78)",
    ripple: "rgba(147, 197, 253, 0.18)",
    brickPalette: ["#60a5fa", "#818cf8", "#f472b6", "#22d3ee", "#facc15", "#34d399"],
    paddle: ["#bae6fd", "#2563eb", "#1e3a8a"],
    buoy: ["#f8fafc", "#dbeafe", "#facc15", "#ca8a04"],
    hud: "rgba(2, 6, 23, 0.72)",
  },
  {
    name: "Storm Break",
    skyTop: "#1f2937",
    waterMid: "#155e75",
    waterBottom: "#0f172a",
    horizon: "rgba(148, 163, 184, 0.22)",
    skyline: "rgba(15, 23, 42, 0.66)",
    crane: "rgba(45, 212, 191, 0.62)",
    ripple: "rgba(125, 211, 252, 0.22)",
    brickPalette: ["#14b8a6", "#0ea5e9", "#64748b", "#f43f5e", "#f59e0b", "#84cc16"],
    paddle: ["#ccfbf1", "#0f766e", "#134e4a"],
    buoy: ["#f8fafc", "#ccfbf1", "#14b8a6", "#0f766e"],
    hud: "rgba(15, 23, 42, 0.7)",
  },
];

const brickGrid = {
  rows: 6,
  columns: 9,
  width: 64,
  height: 22,
  gap: 10,
  offsetTop: 86,
  offsetLeft: 36,
};

let score = 0;
let multiplier = 1;
let bricksBroken = 0;
let lives = 3;
let level = 1;
let running = false;
let animationFrameId = null;
let moveLeft = false;
let moveRight = false;
let bricks = [];
let pointerActive = false;
let pointerDown = null;
let drops = [];
let nextScoreDrop = 500;
let activePowerUps = {
  wideUntil: 0,
  slowUntil: 0,
  bounceUntil: 0,
};
let leaderboard = loadLeaderboard();
let pendingScore = 0;
let enteringScore = false;
let audioContext = null;

buildLevel();
syncHud();
renderLeaderboard();
draw();

startButtonEl.addEventListener("click", startGame);
restartButtonEl.addEventListener("click", restartGame);
scoreFormEl.addEventListener("submit", savePendingScore);
initialsInputEl.addEventListener("input", formatInitialsInput);
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", clearPointerDown);
canvas.addEventListener("pointerleave", () => {
  pointerActive = false;
  clearPointerDown();
});

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function buildLevel() {
  bricks = [];
  drops = [];
  const dropBrickIndex = Math.floor(Math.random() * brickGrid.rows * brickGrid.columns);
  const dropType = powerUps[Math.floor(Math.random() * powerUps.length)];

  for (let row = 0; row < brickGrid.rows; row += 1) {
    for (let column = 0; column < brickGrid.columns; column += 1) {
      const index = row * brickGrid.columns + column;

      bricks.push({
        x: brickGrid.offsetLeft + column * (brickGrid.width + brickGrid.gap),
        y: brickGrid.offsetTop + row * (brickGrid.height + brickGrid.gap),
        width: brickGrid.width,
        height: brickGrid.height,
        color: pickBrickColor(row, column),
        powerUp: index === dropBrickIndex ? dropType : null,
        active: true,
      });
    }
  }
}

function pickBrickColor(row, column) {
  const palette = getLevelTheme().brickPalette;
  return palette[(row + column) % palette.length];
}

function getLevelTheme() {
  return levelThemes[(level - 1) % levelThemes.length];
}

function startGame() {
  if (running || enteringScore) {
    return;
  }

  unlockAudio();
  running = true;
  startButtonEl.textContent = "Resume";
  statusEl.textContent = "Game live. Keep the signal ball in play.";
  tick();
}

function restartGame() {
  cancelAnimationFrame(animationFrameId);
  score = 0;
  multiplier = 1;
  bricksBroken = 0;
  lives = 3;
  level = 1;
  running = false;
  moveLeft = false;
  moveRight = false;
  pointerActive = false;
  drops = [];
  nextScoreDrop = 500;
  clearPowerUps();
  paddle.width = paddle.baseWidth;
  startButtonEl.textContent = "Start Game";
  resetBallAndPaddle();
  buildLevel();
  syncHud();
  statusEl.textContent = `Board reset. Level 1: ${getLevelTheme().name}. Press Start to launch again.`;
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
  updatePowerUpTimers();
  movePaddle();

  ball.x += ball.dx;
  ball.y += ball.dy;

  handleWallCollision();
  handlePaddleCollision();
  handleBrickCollision();
  updateDrop();
  handleMiss();
}

function movePaddle() {
  const previousX = paddle.x;

  if (moveLeft) {
    paddle.x -= paddle.speed;
  }

  if (moveRight) {
    paddle.x += paddle.speed;
  }

  paddle.x = Math.max(0, Math.min(board.width - paddle.width, paddle.x));

  if (!running && (moveLeft || moveRight) && !pointerActive) {
    ball.x += paddle.x - previousX;
    ball.x = Math.max(ball.radius, Math.min(board.width - ball.radius, ball.x));
    draw();
  }
}

function handleWallCollision() {
  if (ball.x + ball.radius >= board.width) {
    ball.x = board.width - ball.radius;
    ball.dx = -Math.abs(ball.dx);
  }

  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.dx = Math.abs(ball.dx);
  }

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.dy = Math.abs(ball.dy);
  }
}

function handlePaddleCollision() {
  const withinX = ball.x >= paddle.x && ball.x <= paddle.x + paddle.width;
  const withinY = ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;

  if (withinX && withinY && ball.dy > 0) {
    const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    ball.dx = hitOffset * 5.5;
    ball.dy = -Math.abs(ball.dy);
    multiplier = 1;
    syncHud();
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
      playBrickBreakSound(brick);
      ball.dy *= -1;
      score += 10 * multiplier;
      multiplier += 1;
      bricksBroken += 1;
      maybeReleaseRandomBrickDrop(brick);
      maybeReleaseScoreDrop(brick);
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

  if (isBounceBackActive()) {
    useBounceBack();
    return;
  }

  lives -= 1;
  multiplier = 1;
  drops = [];
  syncHud();

  if (lives <= 0) {
    running = false;
    cancelAnimationFrame(animationFrameId);
    startButtonEl.textContent = "Start Game";
    handleGameOver();
    return;
  }

  running = false;
  cancelAnimationFrame(animationFrameId);
  resetBallAndPaddle();
  startButtonEl.textContent = "Resume";
  statusEl.textContent = "Life lost. Press Start to launch the ball again.";
  draw();
}

function advanceLevel() {
  level += 1;
  multiplier = 1;
  drops = [];
  clearPowerUps();
  ball.dx = Math.sign(ball.dx || 1) * (Math.abs(ball.dx) + 0.6);
  ball.dy = -Math.abs(ball.dy) - 0.6;
  buildLevel();
  resetBallAndPaddle();
  running = false;
  syncHud();
  cancelAnimationFrame(animationFrameId);
  startButtonEl.textContent = "Resume";
  statusEl.textContent = `Level ${level}: ${getLevelTheme().name}. Press Start to launch with more speed.`;
}

function resetBallAndPaddle() {
  const speed = (4 + (level - 1) * 0.6) * (isSlowBallActive() ? slowBallFactor : 1);

  paddle.width = getActivePaddleWidth();
  paddle.x = (board.width - paddle.width) / 2;
  ball.x = board.width / 2;
  ball.y = board.height - 60;
  ball.dx = speed;
  ball.dy = -speed;
}

function syncHud() {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
  levelEl.textContent = String(level);
  multiplierEl.textContent = `${multiplier}x`;
  bricksBrokenEl.textContent = String(bricksBroken);
}

function loadLeaderboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(leaderboardStorageKey) || "[]");

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter((entry) => typeof entry.initials === "string" && Number.isFinite(entry.score))
      .map((entry) => ({
        initials: entry.initials.slice(0, 3).toUpperCase(),
        score: Math.max(0, Math.floor(entry.score)),
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  leaderboardListEl.replaceChildren();

  const entries = leaderboard.length > 0
    ? leaderboard
    : [{ initials: "---", score: 0 }];

  for (const entry of entries) {
    const item = document.createElement("li");
    const initials = document.createElement("span");
    const value = document.createElement("strong");

    initials.textContent = entry.initials;
    value.textContent = String(entry.score);
    item.append(initials, value);
    leaderboardListEl.append(item);
  }
}

function handleGameOver() {
  statusEl.textContent = "Game over. Press Restart to run the harbor again.";

  if (isLeaderboardScore(score)) {
    openScoreModal();
  }
}

function isLeaderboardScore(candidateScore) {
  if (candidateScore <= 0) {
    return false;
  }

  return leaderboard.length < 10 || candidateScore > leaderboard[leaderboard.length - 1].score;
}

function openScoreModal() {
  pendingScore = score;
  enteringScore = true;
  finalScoreEl.textContent = `Score ${pendingScore}`;
  initialsInputEl.value = "";
  scoreModalEl.hidden = false;
  initialsInputEl.focus();
}

function closeScoreModal() {
  enteringScore = false;
  pendingScore = 0;
  scoreModalEl.hidden = true;
}

function formatInitialsInput() {
  initialsInputEl.value = initialsInputEl.value
    .replace(/[^a-z]/gi, "")
    .slice(0, 3)
    .toUpperCase();
}

function savePendingScore(event) {
  event.preventDefault();
  formatInitialsInput();

  if (initialsInputEl.value.length !== 3) {
    initialsInputEl.focus();
    return;
  }

  leaderboard.push({
    initials: initialsInputEl.value,
    score: pendingScore,
  });
  leaderboard = leaderboard
    .sort((first, second) => second.score - first.score)
    .slice(0, 10);
  localStorage.setItem(leaderboardStorageKey, JSON.stringify(leaderboard));
  renderLeaderboard();
  closeScoreModal();
  statusEl.textContent = "Score saved. Press Restart for another run.";
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  drawBackdrop();
  drawBoardHud();
  drawBricks();
  drawDrop();
  drawPaddle();
  drawBall();
  drawStartOverlay();
}

function drawBackdrop() {
  const theme = getLevelTheme();
  const gradient = ctx.createLinearGradient(0, 0, 0, board.height);
  gradient.addColorStop(0, theme.skyTop);
  gradient.addColorStop(0.48, theme.waterMid);
  gradient.addColorStop(1, theme.waterBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, board.width, board.height);

  drawHarborHorizon();
  drawWaterRipples();

  for (let index = 0; index < 28; index += 1) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
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

    drawCargoBrick(brick);
  }
}

function drawPaddle() {
  const theme = getLevelTheme();
  const deckGradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
  deckGradient.addColorStop(0, theme.paddle[0]);
  deckGradient.addColorStop(0.52, theme.paddle[1]);
  deckGradient.addColorStop(1, theme.paddle[2]);

  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(paddle.x + 4, paddle.y + 5, paddle.width, paddle.height);

  ctx.fillStyle = deckGradient;
  roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddle.x + 10, paddle.y + 4);
  ctx.lineTo(paddle.x + paddle.width - 10, paddle.y + 4);
  ctx.stroke();

  ctx.strokeStyle = "rgba(68, 36, 12, 0.5)";
  ctx.lineWidth = 1;
  for (let x = paddle.x + 18; x < paddle.x + paddle.width - 8; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, paddle.y + 2);
    ctx.lineTo(x, paddle.y + paddle.height - 2);
    ctx.stroke();
  }
}

function drawBall() {
  const theme = getLevelTheme();
  const buoyGradient = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 2, ball.x, ball.y, ball.radius);
  buoyGradient.addColorStop(0, theme.buoy[0]);
  buoyGradient.addColorStop(0.38, theme.buoy[1]);
  buoyGradient.addColorStop(0.42, theme.buoy[2]);
  buoyGradient.addColorStop(1, theme.buoy[3]);

  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.arc(ball.x + 3, ball.y + 4, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = buoyGradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.76)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ball.x - ball.radius + 2, ball.y);
  ctx.lineTo(ball.x + ball.radius - 2, ball.y);
  ctx.stroke();
}

function drawBoardHud() {
  ctx.fillStyle = getLevelTheme().hud;
  ctx.fillRect(0, 0, board.width, 58);

  ctx.fillStyle = "rgba(148, 163, 184, 0.28)";
  ctx.fillRect(0, 56, board.width, 2);

  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText("Harbor Breaker", 24, 34);

  ctx.fillStyle = "rgba(255, 255, 255, 0.54)";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText(getLevelTheme().name.toUpperCase(), 24, 49);

  const hudItems = [
    ["Score", score],
    ["Lives", lives],
    ["Level", level],
    ["Mult", `${multiplier}x`],
    ["Bricks", bricksBroken],
  ];

  let x = 205;

  for (const [label, value] of hudItems) {
    drawHudMetric(label, value, x, 18);
    x += 94;
  }
}

function drawStartOverlay() {
  if (running || enteringScore) {
    return;
  }

  ctx.fillStyle = "rgba(2, 6, 23, 0.44)";
  roundRect(170, 218, 380, 78, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(186, 230, 253, 0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 22px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("Tap to Start", board.width / 2, 250);

  ctx.fillStyle = "rgba(226, 232, 240, 0.78)";
  ctx.font = "13px Trebuchet MS";
  ctx.fillText(`Level ${level}: ${getLevelTheme().name}`, board.width / 2, 274);
  ctx.textAlign = "start";
}

function drawHarborHorizon() {
  const theme = getLevelTheme();

  ctx.fillStyle = theme.horizon;
  ctx.fillRect(0, 58, board.width, 26);

  ctx.fillStyle = theme.skyline;
  for (let x = 34; x < board.width; x += 110) {
    ctx.fillRect(x, 42, 34, 42);
    ctx.fillRect(x + 42, 52, 58, 32);
  }

  ctx.strokeStyle = "rgba(226, 232, 240, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(482, 84);
  ctx.lineTo(542, 42);
  ctx.lineTo(602, 84);
  ctx.stroke();

  ctx.strokeStyle = theme.crane;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(86, 72);
  ctx.lineTo(128, 48);
  ctx.lineTo(170, 72);
  ctx.stroke();
}

function drawWaterRipples() {
  ctx.strokeStyle = getLevelTheme().ripple;
  ctx.lineWidth = 2;

  for (let y = 118; y < board.height - 28; y += 34) {
    ctx.beginPath();

    for (let x = -20; x <= board.width + 20; x += 30) {
      const waveY = y + Math.sin((x + y) * 0.035) * 4;

      if (x === -20) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }

    ctx.stroke();
  }
}

function drawCargoBrick(brick) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  roundRect(brick.x + 4, brick.y + 5, brick.width, brick.height, 3);
  ctx.fill();

  const face = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
  face.addColorStop(0, lightenColor(brick.color, 28));
  face.addColorStop(0.45, brick.color);
  face.addColorStop(1, darkenColor(brick.color, 30));

  ctx.fillStyle = face;
  roundRect(brick.x, brick.y, brick.width, brick.height, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(brick.x + 4, brick.y + 3, brick.width - 8, 4);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  for (let x = brick.x + 12; x < brick.x + brick.width - 6; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, brick.y + 5);
    ctx.lineTo(x, brick.y + brick.height - 5);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(2, 6, 23, 0.34)";
  ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1);

  ctx.fillStyle = "rgba(2, 6, 23, 0.18)";
  ctx.fillRect(brick.x + brick.width - 6, brick.y + 2, 4, brick.height - 4);
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function lightenColor(hex, amount) {
  return shiftColor(hex, amount);
}

function darkenColor(hex, amount) {
  return shiftColor(hex, -amount);
}

function shiftColor(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = Math.max(0, Math.min(255, (value >> 16) + amount));
  const green = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
  const blue = Math.max(0, Math.min(255, (value & 255) + amount));

  return `rgb(${red}, ${green}, ${blue})`;
}

function maybeReleaseRandomBrickDrop(brick) {
  if (!brick.powerUp) {
    return;
  }

  releaseDrop(brick.powerUp, brick, -10);
}

function maybeReleaseScoreDrop(brick) {
  while (score >= nextScoreDrop) {
    releaseDrop(randomPowerUp(), brick, 10);
    nextScoreDrop += 500;
  }
}

function randomPowerUp() {
  return powerUps[Math.floor(Math.random() * powerUps.length)];
}

function releaseDrop(powerUp, brick, xOffset = 0) {
  drops.push({
    ...powerUp,
    x: brick.x + brick.width / 2 + xOffset,
    y: brick.y + brick.height / 2,
    radius: 12,
    speed: 2.2,
  });
}

function updateDrop() {
  if (drops.length === 0) {
    return;
  }

  drops = drops.filter((drop) => {
    drop.y += drop.speed;

    const withinX = drop.x + drop.radius >= paddle.x && drop.x - drop.radius <= paddle.x + paddle.width;
    const withinY = drop.y + drop.radius >= paddle.y && drop.y - drop.radius <= paddle.y + paddle.height;

    if (withinX && withinY) {
      applyPowerUp(drop);
      return false;
    }

    return drop.y - drop.radius <= board.height;
  });
}

function applyPowerUp(powerUp) {
  const expiresAt = Date.now() + powerUpDurationMs;

  if (powerUp.id === "wide") {
    activePowerUps.wideUntil = expiresAt;
    applyWidePaddle();
  }

  if (powerUp.id === "slow") {
    if (!isSlowBallActive()) {
      ball.dx *= slowBallFactor;
      ball.dy *= slowBallFactor;
    }

    activePowerUps.slowUntil = expiresAt;
  }

  if (powerUp.id === "bounce") {
    activePowerUps.bounceUntil = expiresAt;
  }

  statusEl.textContent = `${powerUp.name} caught for 30 seconds.`;
}

function updatePowerUpTimers() {
  const now = Date.now();

  if (activePowerUps.wideUntil && now >= activePowerUps.wideUntil) {
    activePowerUps.wideUntil = 0;
    resetPaddleWidthAroundCenter();
  }

  if (activePowerUps.slowUntil && now >= activePowerUps.slowUntil) {
    activePowerUps.slowUntil = 0;
    ball.dx /= slowBallFactor;
    ball.dy /= slowBallFactor;
  }

  if (activePowerUps.bounceUntil && now >= activePowerUps.bounceUntil) {
    activePowerUps.bounceUntil = 0;
  }
}

function clearPowerUps() {
  activePowerUps = {
    wideUntil: 0,
    slowUntil: 0,
    bounceUntil: 0,
  };
  paddle.width = paddle.baseWidth;
}

function getActivePaddleWidth() {
  return activePowerUps.wideUntil > Date.now() ? 190 : paddle.baseWidth;
}

function isSlowBallActive() {
  return activePowerUps.slowUntil > Date.now();
}

function isBounceBackActive() {
  return activePowerUps.bounceUntil > Date.now();
}

function useBounceBack() {
  activePowerUps.bounceUntil = 0;
  multiplier = 1;
  drops = [];
  ball.x = Math.max(ball.radius, Math.min(board.width - ball.radius, paddle.x + paddle.width / 2));
  ball.y = paddle.y - ball.radius - 2;
  ball.dx = Math.sign(ball.dx || 1) * Math.max(3.4, Math.abs(ball.dx));
  ball.dy = -Math.max(4, Math.abs(ball.dy));
  statusEl.textContent = "Bounce Back used. The ball is back in play.";
  syncHud();
}

function applyWidePaddle() {
  const center = paddle.x + paddle.width / 2;
  paddle.width = getActivePaddleWidth();
  paddle.x = Math.max(0, Math.min(board.width - paddle.width, center - paddle.width / 2));
}

function resetPaddleWidthAroundCenter() {
  const center = paddle.x + paddle.width / 2;
  paddle.width = paddle.baseWidth;
  paddle.x = Math.max(0, Math.min(board.width - paddle.width, center - paddle.width / 2));
}

function drawDrop() {
  if (drops.length === 0) {
    return;
  }

  for (const drop of drops) {
    ctx.fillStyle = drop.color;
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#082f49";
    ctx.font = "700 13px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(drop.label, drop.x, drop.y + 1);
  }

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function drawHudMetric(label, value, x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.54)";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText(label.toUpperCase(), x, y);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText(String(value), x, y + 21);
}

function unlockAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBrickBreakSound(brick) {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const baseFrequency = 360 + ((brick.y - brickGrid.offsetTop) / (brickGrid.height + brickGrid.gap)) * 34;
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const overtoneGain = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(baseFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 1.45, now + 0.08);

  overtone.type = "sine";
  overtone.frequency.setValueAtTime(baseFrequency * 2.02, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  oscillator.connect(gain);
  overtone.connect(overtoneGain);
  gain.connect(audioContext.destination);
  overtoneGain.connect(audioContext.destination);

  oscillator.start(now);
  overtone.start(now);
  oscillator.stop(now + 0.15);
  overtone.stop(now + 0.11);
}

function handleKeyDown(event) {
  if (enteringScore) {
    return;
  }

  unlockAudio();

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    startGame();
    return;
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    moveLeft = true;
    movePaddle();
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    moveRight = true;
    movePaddle();
  }
}

function handleKeyUp(event) {
  if (enteringScore) {
    return;
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    moveLeft = false;
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    moveRight = false;
  }
}

function handlePointerMove(event) {
  if (enteringScore) {
    return;
  }

  pointerActive = true;
  if (pointerDown) {
    pointerDown.moved = pointerDown.moved || Math.abs(event.clientX - pointerDown.x) > 10 || Math.abs(event.clientY - pointerDown.y) > 10;
  }
  movePaddleToPointer(event);
}

function handlePointerDown(event) {
  if (enteringScore) {
    return;
  }

  unlockAudio();
  pointerDown = {
    x: event.clientX,
    y: event.clientY,
    moved: false,
  };
  pointerActive = true;
  movePaddleToPointer(event);
}

function handlePointerUp(event) {
  if (enteringScore) {
    return;
  }

  const wasTap = pointerDown && !pointerDown.moved;
  clearPointerDown();

  if (wasTap && !running) {
    startGame();
  }
}

function clearPointerDown() {
  pointerDown = null;
}

function movePaddleToPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = board.width / rect.width;
  const pointerX = (event.clientX - rect.left) * scaleX;

  paddle.x = Math.max(0, Math.min(board.width - paddle.width, pointerX - paddle.width / 2));

  if (!running) {
    ball.x = paddle.x + paddle.width / 2;
    draw();
  }
}
