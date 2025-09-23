// ---------------- Firebase Config ----------------
// Replace these values with your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyBpDkkemB9ohWS5ZUm5T0YqPqIvxSz7Tc4",
  authDomain: "click-game-cc39b.firebaseapp.com",
  projectId: "click-game-cc39b",
  storageBucket: "click-game-cc39b.firebasestorage.app",
  messagingSenderId: "966402336573",
  appId: "1:966402336573:web:d6814160a4b6ca7abe0754",
  measurementId: "G-39SJXWZFHN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------------- Game variables ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = { x: 100, y: 100, size: 40 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;

// ---------------- Draw Box ----------------
function drawBox() {
  ctx.fillStyle = "red";
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

// ---------------- Game Loop ----------------
function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBox();
  frame = requestAnimationFrame(gameLoop);
}

// ---------------- Click Detection ----------------
canvas.addEventListener("click", e => {
  if (gameOver) return;
  let rect = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rect.left;
  let mouseY = e.clientY - rect.top;

  if (mouseX >= box.x && mouseX <= box.x + box.size &&
      mouseY >= box.y && mouseY <= box.y + box.size) {
    score++;
    document.getElementById("score").textContent = score;
    box.x = Math.random() * (canvas.width - box.size);
    box.y = Math.random() * (canvas.height - box.size);
  }
});

// ---------------- Countdown Timer ----------------
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

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 180, 280);
  ctx.fillText("Score: " + score, 200, 320);

  saveScore(score);
  document.getElementById("restartBtn").style.display = "block";
}

// ---------------- Save Score to Firebase ----------------
function saveScore(newScore) {
  db.ref("scores").push({
    score: newScore,
    time: Date.now()
  });
  updateLeaderboard();
}

// ---------------- Update Leaderboard from Firebase ----------------
function updateLeaderboard() {
  db.ref("scores")
    .orderByChild("score")
    .limitToLast(5)
    .on("value", snapshot => {
      let scores = [];
      snapshot.forEach(snap => {
        scores.push(snap.val().score);
      });
      scores = scores.reverse();

      let list = document.getElementById("leaderboard");
      list.innerHTML = "";
      scores.forEach((s, i) => {
        let li = document.createElement("li");
        li.textContent = `#${i+1}: ${s}`;
        list.appendChild(li);
      });
    });
}

// ---------------- Restart Button ----------------
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  timeLeft = 30;
  gameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  gameLoop();
  countdown();
});

// ---------------- Start Game ----------------
updateLeaderboard();
gameLoop();
countdown();

