const questions = [
  {
    zone: "Path to Licence",
    type: "rules",
    question: "Before booking the SAAQ Class 5 knowledge test, how long must you have held a learner's licence?",
    answers: ["At least 10 months", "At least 3 months", "Exactly 18 months", "No minimum period"],
    correct: 0,
    hint: "The knowledge test comes before the road test, but not immediately after getting the learner's licence.",
    explain: "SAAQ lists a 10-month learner's licence requirement before the Class 5 knowledge test.",
  },
  {
    zone: "Path to Licence",
    type: "rules",
    question: "What score is needed on each section of the Class 5 knowledge test?",
    answers: ["75%", "60%", "80% overall only", "100% on signs only"],
    correct: 0,
    hint: "Think section-by-section, not just an overall score.",
    explain: "The test is divided into three sections, and each section needs a passing mark of 75%.",
  },
  {
    zone: "Path to Licence",
    type: "rules",
    question: "A Class 5 learner driver may drive on the road network when...",
    answers: ["An instructor or qualified accompanying driver sits beside them", "They have passed any online quiz", "They drive only during daylight", "They avoid highways"],
    correct: 0,
    hint: "The learner stage is supervised driving.",
    explain: "A learner's licence requires a driving school instructor or qualified accompanying driver in the passenger seat.",
  },
  {
    zone: "Signs & Signals",
    type: "signs",
    question: "A red octagonal sign at an intersection means you should...",
    answers: ["Come to a complete stop and yield as required", "Slow only if traffic is present", "Continue if turning right", "Stop only when a pedestrian is crossing"],
    correct: 0,
    hint: "Shape matters even before you read the word on the sign.",
    explain: "A stop sign requires a complete stop, then you proceed only when it is safe and legal.",
  },
  {
    zone: "Signs & Signals",
    type: "signs",
    question: "A steady yellow traffic light usually tells you to...",
    answers: ["Stop if you can do so safely", "Speed up to clear the intersection", "Stop only if a police officer is present", "Treat it as a four-way stop"],
    correct: 0,
    hint: "The safe choice avoids entering late.",
    explain: "A yellow light warns that the signal is changing; stop when it is safe to do so.",
  },
  {
    zone: "Sharing the Road",
    type: "behaviour",
    question: "When passing a cyclist, the safest habit is to...",
    answers: ["Leave generous lateral space and pass only when safe", "Tap the horn and pass closely", "Pass on the right shoulder", "Assume the cyclist will hold a perfect line"],
    correct: 0,
    hint: "People on bikes may need room to avoid drains, doors, or rough pavement.",
    explain: "Road sharing means anticipating vulnerability and leaving enough space before passing.",
  },
  {
    zone: "Sharing the Road",
    type: "behaviour",
    question: "At a crosswalk with a pedestrian waiting to cross, what should you do?",
    answers: ["Slow down, stop if required, and let them cross safely", "Maintain speed if you are on the larger road", "Wave them across without checking other lanes", "Move closer so they know you saw them"],
    correct: 0,
    hint: "Your job is to make the crossing predictable and safe.",
    explain: "Pedestrians are vulnerable road users; reduce speed and yield according to the situation and signals.",
  },
  {
    zone: "Risk Control",
    type: "behaviour",
    question: "In rain or snow, the first driving adjustment should be to...",
    answers: ["Increase following distance and reduce speed", "Drive closer so traffic stays compact", "Use high beams in all conditions", "Brake sharply to test grip"],
    correct: 0,
    hint: "Traction and visibility both get worse.",
    explain: "Poor conditions require more time and space to see, react, and stop.",
  },
  {
    zone: "Risk Control",
    type: "behaviour",
    question: "A driver who feels drowsy should...",
    answers: ["Pull over safely and rest before continuing", "Open a window and keep going indefinitely", "Follow another vehicle closely", "Turn music louder as the main solution"],
    correct: 0,
    hint: "Drowsiness is an impairment risk.",
    explain: "Rest is the reliable fix; tricks like loud music do not remove fatigue.",
  },
  {
    zone: "Demerits & Safety",
    type: "rules",
    question: "For probationary licence holders, alcohol tolerance is best remembered as...",
    answers: ["Zero alcohol", "One drink if driving slowly", "Only no alcohol after midnight", "A lower limit than regular drivers, but not zero"],
    correct: 0,
    hint: "SAAQ treats the probationary period as serious business.",
    explain: "SAAQ states zero alcohol applies to probationary licence holders regardless of age.",
  },
  {
    zone: "Demerits & Safety",
    type: "rules",
    question: "What can happen if a probationary driver reaches the 4 demerit point threshold?",
    answers: ["Licence loss for at least 3 months", "Only a warning letter", "Automatic full licence", "They retake only the vision test"],
    correct: 0,
    hint: "The threshold is low during probation.",
    explain: "SAAQ describes a 4-point threshold and a licence loss of at least 3 months for probationary drivers.",
  },
  {
    zone: "Test Strategy",
    type: "signs",
    question: "When a knowledge-test image has several vehicles, the best first step is to...",
    answers: ["Identify each vehicle and decode signs, markings, and signals", "Pick the vehicle closest to you", "Choose the longest answer", "Ignore pavement markings if signs are visible"],
    correct: 0,
    hint: "Treat the image like a scene investigation.",
    explain: "SAAQ recommends carefully reading, enlarging if needed, and analyzing the full illustration.",
  },
];

const zones = ["Path to Licence", "Signs & Signals", "Sharing the Road", "Risk Control", "Demerits & Safety", "Test Strategy"];
const badges = [
  { id: "first", label: "First Start", test: (s) => s.total > 0 },
  { id: "streak5", label: "5 Streak", test: (s) => s.streak >= 5 },
  { id: "xp250", label: "250 XP", test: (s) => s.xp >= 250 },
  { id: "mock75", label: "Test Ready", test: (s) => s.bestRun >= 75 },
];

const defaultState = {
  xp: 0,
  streak: 0,
  bestRun: 0,
  correct: 0,
  total: 0,
  answeredToday: 0,
  dateKey: new Date().toDateString(),
  clearedZones: {},
};

const els = {
  level: document.getElementById("player-level"),
  xp: document.getElementById("player-xp"),
  streak: document.getElementById("player-streak"),
  count: document.getElementById("question-count"),
  tag: document.getElementById("challenge-tag"),
  title: document.getElementById("challenge-title"),
  visual: document.getElementById("scenario-visual"),
  question: document.getElementById("question-text"),
  answers: document.getElementById("answer-list"),
  feedback: document.getElementById("feedback"),
  next: document.getElementById("next-button"),
  hint: document.getElementById("hint-button"),
  accuracy: document.getElementById("accuracy"),
  bestRun: document.getElementById("best-run"),
  badgeCount: document.getElementById("badge-count"),
  today: document.getElementById("today-count"),
  zones: document.getElementById("zone-list"),
  badges: document.getElementById("badge-list"),
  progressLabel: document.getElementById("progress-label"),
  progressBar: document.getElementById("progress-bar"),
  map: document.getElementById("road-map"),
};

let state = loadState();
let mode = "quiz";
let deck = [];
let index = 0;
let selected = false;
let runCorrect = 0;

function loadState() {
  const saved = JSON.parse(localStorage.getItem("quebecDriveQuest") || "null");
  const merged = { ...defaultState, ...saved };
  if (merged.dateKey !== defaultState.dateKey) {
    merged.dateKey = defaultState.dateKey;
    merged.answeredToday = 0;
  }
  return merged;
}

function saveState() {
  localStorage.setItem("quebecDriveQuest", JSON.stringify(state));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startMode(nextMode) {
  mode = nextMode;
  index = 0;
  selected = false;
  runCorrect = 0;
  deck = mode === "boss" ? shuffle(questions).slice(0, 10) : shuffle(questions).slice(0, mode === "cards" ? 8 : 10);
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  renderQuestion();
}

function renderQuestion() {
  const item = deck[index];
  selected = false;
  els.next.disabled = true;
  els.feedback.textContent = mode === "cards" ? "Flip the card by choosing what you think is true." : "";
  els.count.textContent = `${index + 1} / ${deck.length}`;
  els.tag.textContent = mode === "boss" ? "Mock Test" : item.zone;
  els.title.textContent = mode === "cards" ? "Flashcard Check" : "Choose the safest answer.";
  els.visual.className = `scenario-visual ${item.type}`;
  els.question.textContent = item.question;
  els.answers.innerHTML = "";

  item.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(answerIndex));
    els.answers.appendChild(button);
  });
}

function chooseAnswer(answerIndex) {
  if (selected) return;
  selected = true;
  const item = deck[index];
  const correct = answerIndex === item.correct;
  const buttons = [...els.answers.querySelectorAll("button")];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === item.correct) button.classList.add("correct");
    if (buttonIndex === answerIndex && !correct) button.classList.add("wrong");
  });

  state.total += 1;
  state.answeredToday += 1;
  if (correct) {
    runCorrect += 1;
    state.correct += 1;
    state.streak += 1;
    state.xp += mode === "boss" ? 30 : 20;
    state.clearedZones[item.zone] = (state.clearedZones[item.zone] || 0) + 1;
  } else {
    state.streak = 0;
    state.xp += 5;
  }

  els.feedback.textContent = `${correct ? "Correct." : "Review this one."} ${item.explain}`;
  els.next.disabled = false;
  saveState();
  renderStats();
}

function nextQuestion() {
  if (index < deck.length - 1) {
    index += 1;
    renderQuestion();
    return;
  }

  const score = Math.round((runCorrect / deck.length) * 100);
  if (mode === "boss") {
    state.bestRun = Math.max(state.bestRun, score);
    saveState();
  }
  els.title.textContent = score >= 75 ? "Run cleared." : "Run complete.";
  els.tag.textContent = "Results";
  els.count.textContent = `${score}%`;
  els.visual.className = "scenario-visual";
  els.question.textContent = `You answered ${runCorrect} of ${deck.length} correctly. ${score >= 75 ? "That meets the mock target." : "Aim for at least 75% in every topic."}`;
  els.answers.innerHTML = "";
  els.feedback.textContent = "Start another run or switch modes to keep building recall.";
  els.next.disabled = false;
  els.next.textContent = "Play Again";
  selected = true;
  renderStats();
}

function showHint() {
  const item = deck[index];
  els.feedback.textContent = item.hint;
}

function levelFromXp(xp) {
  return Math.floor(xp / 120) + 1;
}

function renderStats() {
  const clearedCount = zones.filter((zone) => (state.clearedZones[zone] || 0) >= 2).length;
  const unlocked = badges.filter((badge) => badge.test(state));
  els.level.textContent = levelFromXp(state.xp);
  els.xp.textContent = state.xp;
  els.streak.textContent = state.streak;
  els.accuracy.textContent = state.total ? `${Math.round((state.correct / state.total) * 100)}%` : "0%";
  els.bestRun.textContent = `${state.bestRun}%`;
  els.badgeCount.textContent = unlocked.length;
  els.today.textContent = state.answeredToday;
  els.progressLabel.textContent = `${clearedCount} of ${zones.length} zones cleared`;
  els.progressBar.style.width = `${(clearedCount / zones.length) * 100}%`;

  els.zones.innerHTML = zones.map((zone) => {
    const count = state.clearedZones[zone] || 0;
    return `<div class="zone-item"><strong>${zone}</strong><span>${Math.min(count, 2)} / 2</span></div>`;
  }).join("");

  els.badges.innerHTML = badges.map((badge) => {
    const earned = badge.test(state);
    return `<div class="badge-item ${earned ? "" : "locked"}"><strong>${badge.label}</strong><span>${earned ? "Earned" : "Locked"}</span></div>`;
  }).join("");

  drawMap(clearedCount);
}

function drawMap(clearedCount) {
  const canvas = els.map;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b8d6d0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5d9974";
  ctx.fillRect(0, 440, canvas.width, 180);
  ctx.strokeStyle = "#2d3840";
  ctx.lineWidth = 58;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(210, 580);
  ctx.bezierCurveTo(90, 460, 338, 410, 220, 300);
  ctx.bezierCurveTo(116, 202, 314, 148, 214, 42);
  ctx.stroke();
  ctx.strokeStyle = "#f5d35a";
  ctx.lineWidth = 5;
  ctx.setLineDash([18, 18]);
  ctx.stroke();
  ctx.setLineDash([]);

  const routeStartY = 540;
  const routeEndY = 64;
  const routeStep = (routeStartY - routeEndY) / (zones.length - 1);

  zones.forEach((zone, zoneIndex) => {
    const y = routeStartY - zoneIndex * routeStep;
    const earned = zoneIndex < clearedCount;
    ctx.fillStyle = earned ? "#d9a51a" : "#ffffff";
    ctx.strokeStyle = "#15272d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(zoneIndex % 2 ? 282 : 132, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#15272d";
    ctx.font = "700 13px Segoe UI";
    ctx.textAlign = zoneIndex % 2 ? "right" : "left";
    ctx.fillText(zone, zoneIndex % 2 ? 248 : 166, y + 5);
  });

  const carY = routeStartY + 28 - Math.min(clearedCount, zones.length) * routeStep;
  ctx.fillStyle = "#c24136";
  ctx.fillRect(187, carY, 46, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(196, carY + 5, 27, 10);
  ctx.fillStyle = "#15272d";
  ctx.beginPath();
  ctx.arc(198, carY + 29, 6, 0, Math.PI * 2);
  ctx.arc(222, carY + 29, 6, 0, Math.PI * 2);
  ctx.fill();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => startMode(tab.dataset.mode));
});

els.next.addEventListener("click", () => {
  if (els.next.textContent === "Play Again") {
    els.next.textContent = "Next";
    startMode(mode);
  } else {
    nextQuestion();
  }
});

els.hint.addEventListener("click", showHint);

document.getElementById("reset-progress").addEventListener("click", () => {
  state = { ...defaultState, dateKey: new Date().toDateString(), clearedZones: {} };
  saveState();
  startMode(mode);
  renderStats();
});

startMode("quiz");
renderStats();
