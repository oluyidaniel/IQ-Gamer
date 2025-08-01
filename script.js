// ==== DOM Elements ====
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const nextBtn = document.getElementById("next-btn");
const resultSection = document.getElementById("result");
const finalScoreEl = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");
const modeToggle = document.getElementById("mode-toggle");
const leaderboardList = document.getElementById("leaderboard-list");

let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timer;
let selectedOption = null;

// ==== Dark/Light Mode Toggle ====
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  modeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// ==== Start Quiz ====
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreEl.textContent = "Score: 0";
  resultSection.classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  loadQuestion();
}

// ==== Load a Question ====
function loadQuestion() {
  resetState();
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("option-btn");
    btn.onclick = () => selectOption(btn, q.answer);
    optionsEl.appendChild(btn);
  });
  startTimer();
}

// ==== Reset State Before New Question ====
function resetState() {
  clearInterval(timer);
  timeLeft = 10;
  timerEl.textContent = "10s";
  optionsEl.innerHTML = "";
  nextBtn.style.display = "none";
  selectedOption = null;
}

// ==== Handle Option Click ====
function selectOption(button, correctAnswer) {
  clearInterval(timer);
  selectedOption = button;
  const buttons = document.querySelectorAll(".option-btn");

  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.style.backgroundColor = "#4caf50"; // green
    } else if (btn === button) {
      btn.style.backgroundColor = "#f44336"; // red
    }
  });

  if (button.textContent === correctAnswer) {
    score += 10;
    scoreEl.textContent = `Score: ${score}`;
    // playCorrectSound(); // optional
  } else {
    // playWrongSound(); // optional
  }

  nextBtn.style.display = "block";
}

// ==== Timer Logic ====
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoFail();
    }
  }, 1000);
}

// ==== Auto Fail If Time Runs Out ====
function autoFail() {
  const q = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.style.backgroundColor = "#4caf50";
    }
  });
  // playWrongSound(); // optional
  nextBtn.style.display = "block";
}

// ==== Next Question ====
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
});

// ==== Show Final Score and Leaderboard ====
function showResult() {
  document.getElementById("quiz").classList.add("hidden");
  resultSection.classList.remove("hidden");
  finalScoreEl.textContent = score;

  const playerName = prompt("Enter your name for the leaderboard:");
  if (playerName) {
    const playerData = {
      name: playerName,
      score: score,
      timestamp: Date.now()
    };
    database.ref("leaderboard").push(playerData);
  }

  loadLeaderboard();
}

// ==== Retry Quiz ====
retryBtn.addEventListener("click", startQuiz);

// ==== Load Leaderboard (Top 10, Real-Time) ====
function loadLeaderboard() {
  leaderboardList.innerHTML = "";

  database.ref("leaderboard")
    .orderByChild("score")
    .limitToLast(10)
    .on("value", snapshot => {
      const data = [];
      snapshot.forEach(child => data.unshift(child.val())); // reverse order

      leaderboardList.innerHTML = data.map((player, i) => `
        <li>#${i + 1} ${player.name} — ${player.score}</li>
      `).join("");
    });
}

// ==== Start the Game ====
window.onload = startQuiz;
