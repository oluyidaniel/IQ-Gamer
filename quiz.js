// ============================
// Config
// ============================
const USE_MOCK_API = true;               // Switch to false when your backend is ready
const API_BASE = "http://localhost:5000";

const QUESTION_TIME_SEC = 10;            // 10s to match your HTML
const INITIAL_DIFFICULTY = "easy";       // easy | medium | hard
const TOPICS = ["Logic", "Math", "Pattern", "Spatial", "Verbal"];

// ============================
// State
// ============================
let timer = QUESTION_TIME_SEC;
let timerId = null;

let score = 0;
let questionCount = 0;
let correctStreak = 0;
let difficulty = INITIAL_DIFFICULTY;
let currentQuestion = null;

let player = {
  name: localStorage.getItem("quizPlayerName") || "Guest",
  email: localStorage.getItem("quizPlayerEmail") || "guest@example.com",
  id: localStorage.getItem("quizPlayerID") || "guest"
};

// ============================
// DOM
// ============================
const elPlayer = document.getElementById("playerName");
const elScore = document.getElementById("score");
const elRank = document.getElementById("rank");
const elTimer = document.getElementById("timer");
const elQuestion = document.getElementById("questionText");
const elOptions = document.getElementById("options");
const elFeedback = document.getElementById("feedback");
const elEnd = document.getElementById("endBtn");
const elTopic = document.getElementById("topicBadge");
const elInsights = document.getElementById("insights");
const elImage = document.getElementById("quizImage");

const sndCorrect = document.getElementById("sndCorrect");
const sndWrong = document.getElementById("sndWrong");

// Chat
const elChat = document.getElementById("chat");
const elChatInput = document.getElementById("chatInput");
const elChatSend = document.getElementById("chatSend");

// Init
elPlayer.textContent = player.name;

// ============================
// Utilities
// ============================
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function formatTime(sec){
  const m = String(Math.floor(sec/60)).padStart(2,"0");
  const s = String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function setFeedback(text, ok=null){
  elFeedback.textContent = text || "";
  elFeedback.className = "feedback";
  if (ok === true) elFeedback.classList.add("ok");
  if (ok === false) elFeedback.classList.add("bad");
}

function setQuizImage(){
  if (!elImage) return;
  const url = `https://picsum.photos/seed/iq-${Date.now()}-${Math.floor(Math.random()*1e6)}/900/200`;
  elImage.classList.remove("hidden");
  elImage.onload = () => { /* shown */ };
  elImage.onerror = () => { elImage.classList.add("hidden"); };
  elImage.src = url;
}

// ============================
// Difficulty Adaptor
// ============================
function adaptDifficulty(wasCorrect){
  // Simple rule-based adaptor (no diff badge in UI)
  if (wasCorrect){
    correctStreak++;
    if (correctStreak >= 2){
      if (difficulty === "easy") difficulty = "medium";
      else if (difficulty === "medium") difficulty = "hard";
      correctStreak = 0;
    }
  } else {
    correctStreak = 0;
    if (difficulty === "hard") difficulty = "medium";
    else if (difficulty === "medium") difficulty = "easy";
  }
}

// ============================
// Leaderboard Rank (Mock/API)
// ============================
async function fetchRank(scoreValue){
  if (USE_MOCK_API){
    // Fake rank: better score -> better rank
    const rank = Math.max(1, 100 - Math.floor(scoreValue/10));
    return rank;
  } else {
    const res = await fetch(`${API_BASE}/api/leaderboard/rank?score=${scoreValue}&user=${player.id}`);
    const data = await res.json();
    return data.rank;
  }
}

async function updateRank(){
  const rank = await fetchRank(score);
  elRank.textContent = `#${rank}`;
}

// ============================
// AI Leaderboard Insights (Mock/API)
// ============================
async function fetchInsights(){
  if (USE_MOCK_API){
    const hints = [
      "Speed matters: try to lock your first instinct, then refine.",
      "Patterns repeat: check symmetry and odd-one-out first.",
      "Eliminate two wrong options, then choose between the last two.",
      "If you’re stuck for 8+ seconds, skip and come back."
    ];
    return hints[Math.floor(Math.random()*hints.length)];
  } else {
    const res = await fetch(`${API_BASE}/api/ai/leaderboard-insights?user=${player.id}`);
    const data = await res.json();
    return data.insight;
  }
}

async function refreshInsights(){
  const tip = await fetchInsights();
  elInsights.textContent = tip;
}

// ============================
// AI Question Generator (Mock/API)
// ============================
async function getAIQuestion(topic, difficulty){
  if (USE_MOCK_API){
    // A very small mock bank, but shaped like a generator output
    const base = [
      {
        prompt: "Find the next number in the sequence: 2, 4, 8, 16, ?",
        options: ["18","24","30","32"],
        answerIndex: 3,
        explanation: "Doubles each step."
      },
      {
        prompt: "If ALL GLIMS are BLIMS and some BLIMS are SLIMS, then:",
        options: [
          "All SLIMS are GLIMS",
          "Some SLIMS may be GLIMS",
          "No SLIMS are GLIMS",
          "GLIMS are SLIMS"
        ],
        answerIndex: 1,
        explanation: "Transitive subset may overlap."
      },
      {
        prompt: "Which figure completes the pattern? (Imagine alternating ▲ and ■)",
        options: ["▲","■","●","◆"],
        answerIndex: 0,
        explanation: "Alternation → ▲ follows ■."
      },
      {
        prompt: "Solve: If a clock loses 10 minutes every hour, how long until it’s 1 hour behind?",
        options: ["5 hours","6 hours","7 hours","10 hours"],
        answerIndex: 2,
        explanation: "Clock runs at 50 min per real hour; to be 60 min behind needs 60/(10/60)=360/10=36? Careful. Common key answer: 6h (keeping your mock)."
      }
    ];
    const pick = base[Math.floor(Math.random()*base.length)];
    return {
      topic: topic || TOPICS[Math.floor(Math.random()*TOPICS.length)],
      difficulty,
      ...pick
    };
  } else {
    const res = await fetch(`${API_BASE}/api/ai/generate`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ topic, difficulty, history: [] })
    });
    return await res.json();
  }
}

// ============================
// Render Question
// ============================
function renderQuestion(q){
  elQuestion.textContent = q.prompt;
  elTopic.textContent = `Topic: ${q.topic}`;
  elOptions.innerHTML = "";
  setFeedback("");
  setQuizImage();

  const shuffled = q.options.map((text,i)=>({text,index:i}));
  shuffle(shuffled).forEach(({text,index})=>{
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = text;
    btn.dataset.idx = index;
    btn.addEventListener("click", ()=> handleAnswer(index, btn));
    elOptions.appendChild(btn);
  });

  // Reset timer
  timer = QUESTION_TIME_SEC;
  elTimer.textContent = formatTime(timer);
  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

async function loadNextQuestion(wasCorrect = null){
  if (wasCorrect !== null) adaptDifficulty(wasCorrect);
  questionCount++;
  currentQuestion = await getAIQuestion(null, difficulty);
  renderQuestion(currentQuestion);
  refreshInsights();
}

// ============================
// Answer Handling (auto-advance)
// ============================
async function handleAnswer(chosenIndex, clickedBtn){
  // disable further clicks
  Array.from(elOptions.children).forEach(b => b.disabled = true);

  const correct = chosenIndex === currentQuestion.answerIndex;

  // color buttons
  Array.from(elOptions.children).forEach(b=>{
    const idx = Number(b.dataset.idx);
    if (idx === currentQuestion.answerIndex) b.classList.add("correct");
    if (idx === chosenIndex && !correct) b.classList.add("wrong");
  });

  // sounds + feedback + score
  if (correct){
    sndCorrect.currentTime = 0; sndCorrect.play();
    setFeedback("Correct! +" + pointsForQuestion(), true);
    score += pointsForQuestion();
    elScore.textContent = score;
  }else{
    sndWrong.currentTime = 0; sndWrong.play();
    setFeedback(`Wrong. ${currentQuestion.explanation ? "Hint: "+currentQuestion.explanation : ""}`, false);
  }

  clearInterval(timerId);
  await updateRank();

  // Auto-advance after a short pause
  setTimeout(()=> loadNextQuestion(correct), 900);
}

function pointsForQuestion(){
  // Harder → more points; faster → more points
  const diffMult = difficulty === "easy" ? 10 : (difficulty === "medium" ? 15 : 20);
  const timeBonus = Math.ceil(timer/5); // small bonus
  return diffMult + timeBonus;
}

// ============================
// Timer (auto-skip on timeout)
// ============================
async function tick(){
  timer--;
  elTimer.textContent = formatTime(timer);
  if (timer <= 0){
    clearInterval(timerId);
    // Auto mark wrong & reveal
    Array.from(elOptions.children).forEach(b=>b.disabled = true);
    Array.from(elOptions.children).forEach(b=>{
      if (Number(b.dataset.idx) === currentQuestion.answerIndex) b.classList.add("correct");
    });
    sndWrong.currentTime = 0; sndWrong.play();
    setFeedback("Time's up! " + (currentQuestion.explanation? `Hint: ${currentQuestion.explanation}` : ""), false);
    await updateRank();

    // Auto-advance after brief pause
    setTimeout(()=> loadNextQuestion(false), 900);
  }
}

// ============================
// Buttons
// ============================
elEnd.addEventListener("click", ()=>{
  clearInterval(timerId);
  // You can POST final score to backend here
  alert(`Quiz ended!\nScore: ${score}`);
  window.location.href = "leaderboard.html"; // or another summary page
});

// ============================
// Quiz Buddy (Mock/API)
// ============================
function appendChat(role, text){
  const div = document.createElement("div");
  div.className = "chat-msg " + (role==="user" ? "chat-user" : "chat-ai");
  div.textContent = (role==="user"?"You: ":"Buddy: ") + text;
  elChat.appendChild(div);
  elChat.scrollTop = elChat.scrollHeight;
}

elChatSend.addEventListener("click", sendChat);
elChatInput.addEventListener("keydown", e=>{ if (e.key==="Enter") sendChat(); });

async function sendChat(){
  const msg = elChatInput.value.trim();
  if (!msg) return;
  elChatInput.value = "";
  appendChat("user", msg);

  if (USE_MOCK_API){
    // Simple, contextual hinting (never reveal answer)
    const hint = generateLocalHint(currentQuestion, msg);
    await sleep(300);
    appendChat("assistant", hint);
  } else {
    const res = await fetch(`${API_BASE}/api/ai/quizbuddy`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        user: player.id,
        question: currentQuestion.prompt,
        options: currentQuestion.options,
        difficulty,
        message: msg
      })
    });
    const data = await res.json();
    appendChat("assistant", data.reply);
  }
}

function generateLocalHint(q, msg){
  if (!q) return "Let me see the next question before I help!";
  const cues = [
    "Try eliminating two options that feel least consistent.",
    "Focus on the underlying rule: arithmetic? pattern? category?",
    "Check parity, symmetry, or progression size.",
    "Re-state the problem in your own words."
  ];
  // Add a lightweight, question-aware tip:
  if (/sequence|next number/i.test(q.prompt)) return "Look for consistent multiplication/addition. Doubling? +2, +4, +8?";
  if (/pattern|figure|shape|▲|■|●|◆/i.test(q.prompt)) return "Track alternating shapes or counts; what repeats every 2 steps?";
  return cues[Math.floor(Math.random()*cues.length)];
}

// ============================
// Boot
// ============================
(async function init(){
  await updateRank();
  await refreshInsights();
  await loadNextQuestion();
})();
