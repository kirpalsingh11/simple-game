// ---------------- Game Variables ----------------
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpDkkemB9ohWS5ZUm5T0YqPqIvxSz7Tc4",
  authDomain: "click-game-cc39b.firebaseapp.com",
  databaseURL: "https://click-game-cc39b-default-rtdb.firebaseio.com",
  projectId: "click-game-cc39b",
  storageBucket: "click-game-cc39b.firebasestorage.app",
  messagingSenderId: "966402336573",
  appId: "1:966402336573:web:c7e75881e384ffb8be0754",
  measurementId: "G-LKJD88BWW3"
};

let canvas, ctx;
let box = { x: 100, y: 100, size: 50 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;
let playerName = "";

// ---------------- Canvas Draw ----------------
function drawBox() {
  ctx.fillStyle = "red";
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

// ---------------- Leaderboard ----------------
function updateLeaderboard() {
  db.ref("scores")
    .orderByChild("score")
    .limitToLast(5)
    .on("value", snapshot => {
      const list = document.getElementById("leaderboard");
      list.innerHTML = "";
      const scores = [];
      snapshot.forEach(snap => scores.push(snap.val()));
      scores.reverse().forEach((s, i) => {
        const li = document.createElement("li");
        li.textContent = `#${i + 1}: ${s.name || "Anonymous"} - ${s.score}`;
        list.appendChild(li);
      });
    });
}

// ---------------- Save Score ----------------
function saveScore() {
  if (!playerName) playerName = "Anonymous"; // fallback
  db.ref("scores").push({
    name: playerName,
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
      mouseX >= box.x &&
      mouseX <= box.x + box.size &&
      mouseY >= box.y &&
      mouseY <= box.y + box.size
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

// ---------------- Start With Name ----------------
function startWithName() {
  const input = document.getElementById("username").value.trim();
  if (!input) {
    document.getElementById("loginMessage").textContent = "Enter a name!";
    return;
  }
  playerName = input;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";
  startGame();
}

