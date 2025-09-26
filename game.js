// ---------------- Firebase Config ----------------
// 🔹 Replace with YOUR Firebase project config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpDkkemB9ohWS5ZUm5T0YqPqIvxSz7Tc4",
  authDomain: "click-game-cc39b.firebaseapp.com",
  databaseURL: "https://click-game-cc39b-default-rtdb.firebaseio.com",
  projectId: "click-game-cc39b",
  storageBucket: "click-game-cc39b.firebasestorage.app",
  messagingSenderId: "966402336573",
  appId: "1:966402336573:web:d6814160a4b6ca7abe0754",
  measurementId: "G-39SJXWZFHN"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ---------------- Login/Register ----------------
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => login())
    .catch(err => document.getElementById("loginMessage").textContent = err.message);
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("gameContainer").style.display = "block";
      startGame();
    })
    .catch(err => document.getElementById("loginMessage").textContent = err.message);
}

// ---------------- Game Variables ----------------
let canvas, ctx;
let box = { x: 100, y: 100, size: 50 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;

// ---------------- Draw Box ----------------
function drawBox() {
  ctx.fillStyle = "red";
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

// ---------------- Leaderboard ----------------
function updateLeaderboard() {
  db.ref("scores").orderByChild("score").limitToLast(5).on("value", snapshot => {
    const list = document.getElementById("leaderboard");
    list.innerHTML = "";
    const scores = [];
    snapshot.forEach(snap => scores.push(snap.val()));
    scores.reverse().forEach((s,i) => {
      const li = document.createElement("li");
      li.textContent = `#${i+1}: ${s.username} - ${s.score}`;
      list.appendChild(li);
    });
  });
}

// ---------------- Save Score ----------------
function saveScore() {
  const user = auth.currentUser;
  if (!user) return;
  db.ref("scores").push({
    username: user.email.split("@")[0],
    score: score,
    time: Date.now()
  });
  updateLeaderboard();
}

// ---------------- Game Loop ----------------
function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBox();
  frame = requestAnimationFrame(gameLoop);
}

// ---------------- Countdown ----------------
function countdown() {
  if (timeLeft > 0) {
    document.getElementById("timer").textContent = timeLeft;
    timeLeft--;
    setTimeout(countdown, 1000);
  } else {
    endGame();
  }
}

// ---------------- End Game ----------------
function endGame() {
  gameOver = true;
  cancelAnimationFrame(frame);
  ctx.fillStyle = "#000";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 180, 280);
  ctx.fillText("Score: " + score, 200, 320);
  saveScore();
  document.getElementById("restartBtn").style.display = "block";
}

// ---------------- Restart ----------------
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  timeLeft = 30;
  gameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  startGame();
});

// ---------------- Canvas Click ----------------
function setupCanvasClicks() {
  canvas.addEventListener("click", e => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (
      mouseX >= box.x && mouseX <= box.x + box.size &&
      mouseY >= box.y && mouseY <= box.y + box.size
    ) {
      score++;
      document.getElementById("score").textContent = score;
      box.x = Math.random() * (canvas.width - box.size);
      box.y = Math.random() * (canvas.height - box.size);
    }
  });
}

// ---------------- Start Game ----------------
function startGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  document.getElementById("score").textContent = score;
  setupCanvasClicks();
  updateLeaderboard();
  gameLoop();
  countdown();
}

