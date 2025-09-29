/* ====== CONFIG ====== */
const CANDIDATES = [
  { name: "Thomas",  img: "assets/people/thomas.jpg"  },
  { name: "Nicolas", img: "assets/people/nicolas.jpg" },
  { name: "Dylan",   img: "assets/people/dylan.jpg"   },
  { name: "Mathis",  img: "assets/people/mathis.jpg"  },
  { name: "Malcolm", img: "assets/people/malcolm.jpg" },
  { name: "Noah",    img: "assets/people/noah.jpg"    },
];

// Ordre fixe des 10 manches (réponses que tu as données)
const ROUNDS = [
  { answer: "Noah",    sound: "assets/sounds/noah_r1.wav" },
  { answer: "Mathis",  sound: "assets/sounds/mathis_r2.wav" },
  { answer: "Nicolas", sound: "assets/sounds/nicolas_r3.wav" },
  { answer: "Nicolas", sound: "assets/sounds/nicolas_r4.wav" },
  { answer: "Dylan",   sound: "assets/sounds/dylan_r5.wav" },
  { answer: "Thomas",  sound: "assets/sounds/thomas_r6.wav" },
  { answer: "Noah",    sound: "assets/sounds/noah_r7.wav" },
  { answer: "Noah",    sound: "assets/sounds/noah_r8.wav" },
  { answer: "Dylan",   sound: "assets/sounds/dylan_r9.wav" },
  { answer: "Malcolm", sound: "assets/sounds/malcolm_r10.wav" },
];

const QUESTIONS = ROUNDS.length;
const PTS_GOOD = 5;
const PTS_BAD  = -2;

/* ====== STATE & DOM ====== */
let score = 0;
let round = 0;
let answered = false;
let playerName = "";

const home = document.getElementById('screen-home');
const nameScreen = document.getElementById('screen-name');
const game = document.getElementById('screen-game');
const end = document.getElementById('screen-end');

const playBtn = document.getElementById('playBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const playerNameInput = document.getElementById('playerName');
const nameMsg = document.getElementById('nameMsg');

const roundInfo = document.getElementById('roundInfo');
const scoreInfo = document.getElementById('scoreInfo');
const grid = document.getElementById('grid');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const audio = document.getElementById('roundAudio');

const finalScore = document.getElementById('finalScore');
const leaderboardEl = document.getElementById('leaderboard');
const restartBtn = document.getElementById('restartBtn');

/* ====== FLOW ====== */
playBtn.onclick = () => {
  home.classList.add('hidden');
  nameScreen.classList.remove('hidden');
};

startQuizBtn.onclick = () => {
  const val = playerNameInput.value.trim();
  if (!val) { nameMsg.textContent = "Choisis un pseudo pour jouer."; return; }
  nameMsg.textContent = "";
  playerName = val;

  nameScreen.classList.add('hidden');
  game.classList.remove('hidden');

  score = 0; round = 0;
  newRound();
};

restartBtn.onclick = () => {
  end.classList.add('hidden');
  home.classList.remove('hidden');
};

/* ====== GAMEPLAY ====== */
function newRound(){
  round++;
  answered = false;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.classList.add('hidden');

  roundInfo.textContent = `Manche ${round} / ${QUESTIONS}`;
  scoreInfo.textContent = `Score : ${score}`;

  const current = ROUNDS[round-1];
  audio.src = current.sound || "";

  // Affichage des 6 cartes (ordre mélangé)
  const shuffled = [...CANDIDATES].sort(() => Math.random() - 0.5);
  grid.innerHTML = "";
  shuffled.forEach(p => {
    const btn = document.createElement('button');
    btn.className = "cardOpt";
    btn.innerHTML = `<img src="${p.img}" alt="${p.name}"><div class="name">${p.name}</div>`;
    btn.onclick = () => choose(p.name, current.answer);
    grid.appendChild(btn);
  });
}

document.getElementById('soundBtn').onclick = () => {
  if (!audio.src) return;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
};

function choose(chosenName, answerName){
  if (answered) return;
  answered = true;

  if (chosenName === answerName){
    score += PTS_GOOD;
    feedback.textContent = `✅ Bonne réponse ! (+${PTS_GOOD})`;
    feedback.classList.add('correct');
  } else {
    score += PTS_BAD;
    feedback.textContent = `❌ Raté. C'était ${answerName}. (${PTS_BAD})`;
    feedback.classList.add('wrong');
  }
  scoreInfo.textContent = `Score : ${score}`;
  nextBtn.classList.remove('hidden');
}

nextBtn.onclick = () => {
  if (round >= QUESTIONS) return endGame();
  newRound();
};

function endGame(){
  game.classList.add('hidden');
  end.classList.remove('hidden');
  finalScore.textContent = `${playerName}, tu fais ${score} pts (max ${QUESTIONS*PTS_GOOD})`;

  const top = saveScore(playerName, score);
  renderLeaderboard(top);
}

/* ====== LEADERBOARD (localStorage) ====== */
function saveScore(name, score){
  const key = 'petguessr_leaderboard';
  const now = new Date().toISOString().slice(0,10);
  const entry = { name, score, date: now };

  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.push(entry);
  data.sort((a,b)=> b.score - a.score);
  const top = data.slice(0,10);
  localStorage.setItem(key, JSON.stringify(top));
  return top;
}

function renderLeaderboard(list){
  leaderboardEl.innerHTML = '';
  list.forEach((e, i) => {
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${e.name} — ${e.score} pts (${e.date})`;
    leaderboardEl.appendChild(li);
  });
}
