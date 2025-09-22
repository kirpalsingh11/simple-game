// 🔹 1. Paste your Firebase config here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd"
};

// 🔹 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔹 3. Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = { x: 100, y: 100, size: 40 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;

function drawBox() {
  ctx.fillStyle = "red";
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBox();
  frame = requestAnimationFrame(gameLoop);
}

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

function countdown() {
  if (timeLeft > 0) {
    document.getElementById("timer").textContent = timeLeft;
    timeLeft--;
    setTimeout(countdown, 1000);
  } else {
    endGame();
  }
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(frame);

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 120, 180);
  ctx.fillText("Score: " + score, 140, 220);

  saveScore(score);
  document.getElementById("restartBtn").style.display = "block";
}

// 🔹 4. Save to Firebase
function saveScore(newScore) {
  db.ref("scores").push({
    score: newScore,
    time: Date.now()
  });
  updateLeaderboard();
}

// 🔹 5. Read from Firebase
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

// 🔹 6. Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  timeLeft = 30;
  gameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  gameLoop();
  countdown();
});

// Start game
updateLeaderboard();
gameLoop();
countdown();

