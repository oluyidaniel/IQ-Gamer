let currentQuestion = 0;
let score = 0;
let questions = [];
let timer;
let timeLeft = 15;

const scoreDisplay = document.getElementById("score");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const timeEl = document.getElementById("time");
const nextBtn = document.getElementById("next-btn");
const retryBtn = document.getElementById("retry-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

const name = localStorage.getItem("quizPlayerName");
const email = localStorage.getItem("quizPlayerEmail");
const userID = localStorage.getItem("quizPlayerID");

if (!name || !email || !userID) {
  alert("User not authenticated. Redirecting to login...");
  window.location.href = "auth.html";
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

async function fetchQuestions(topic = "general", difficulty = "easy") {
  try {
    const response = await fetch("http://localhost:5000/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty }),
    });

    const data = await response.json();
    if (data.success && Array.isArray(data.questions)) {
      return data.questions;
    } else {
      throw new Error("Invalid questions format");
    }
  } catch (err) {
    console.error("Failed to fetch questions:", err);
    alert("Unable to load quiz questions. Try again later.");
    return [];
  }
}

function startTimer() {
  timeLeft = 15;
  timeEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableOptions();
      showCorrectAnswer();
      setTimeout(loadNextQuestion, 2500);
    }
  }, 1000);
}

function loadQuestion() {
  clearInterval(timer);

  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;

  optionsEl.innerHTML = "";
  q.options.forEach((optionText, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option");
    optionDiv.textContent = optionText;
    optionDiv.onclick = () => selectOption(optionDiv, index);
    optionsEl.appendChild(optionDiv);
  });

  nextBtn.disabled = true;
  retryBtn.classList.add("hidden");
  leaderboardBtn.classList.add("hidden");
  document.getElementById("timer").classList.remove("hidden");
  nextBtn.classList.remove("hidden");

  startTimer();
}

function selectOption(selectedDiv, selectedIndex) {
  clearInterval(timer);
  disableOptions();

  const correctIndex = questions[currentQuestion].answer;
  const allOptions = document.querySelectorAll(".option");

  if (selectedIndex === correctIndex) {
    selectedDiv.classList.add("correct");
    correctSound.play();
    score += 10;
    scoreDisplay.textContent = score;
  } else {
    selectedDiv.classList.add("wrong");
    wrongSound.play();
    allOptions[correctIndex].classList.add("correct");
  }

  setTimeout(loadNextQuestion, 2500);
}

function disableOptions() {
  const allOptions = document.querySelectorAll(".option");
  allOptions.forEach(opt => opt.onclick = null);
}

function showCorrectAnswer() {
  const correctIndex = questions[currentQuestion].answer;
  const allOptions = document.querySelectorAll(".option");
  allOptions.forEach((opt, idx) => {
    if (idx === correctIndex) opt.classList.add("correct");
    opt.onclick = null;
  });
}

function loadNextQuestion() {
  currentQuestion++;
  if (currentQuestion >= questions.length) {
    finishQuiz();
  } else {
    loadQuestion();
  }
}

function finishQuiz() {
  clearInterval(timer);
  questionEl.textContent = `Quiz Completed! Final Score: ${score}`;
  optionsEl.innerHTML = "";
  document.getElementById("timer").classList.add("hidden");
  nextBtn.classList.add("hidden");

  retryBtn.classList.remove("hidden");
  leaderboardBtn.classList.remove("hidden");

  // Update score in Firebase
  const userRef = database.ref("users/" + userID);
  userRef.once("value").then(snapshot => {
    const previousScore = snapshot.val()?.score || 0;
    const newScore = previousScore + score;
    userRef.update({ score: newScore });
  });
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  scoreDisplay.textContent = score;

  document.getElementById("timer").classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  retryBtn.classList.add("hidden");
  leaderboardBtn.classList.add("hidden");

  loadQuestion();
}

function goToLeaderboard() {
  window.location.href = "leaderboard.html";
}

nextBtn.addEventListener("click", loadNextQuestion);
retryBtn.addEventListener("click", restartQuiz);
leaderboardBtn.addEventListener("click", goToLeaderboard);

// Start quiz by fetching questions first
async function initQuiz() {
  questions = await fetchQuestions(); // default: general, easy
  if (questions.length > 0) {
    loadQuestion();
  }
}

initQuiz();
