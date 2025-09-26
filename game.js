
// ---------------- Global Variables ----------------
let playerName = "";
let canvas, ctx;
let box = { x: 100, y: 100, size: 50 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;

// ---------------- Name input ----------------
function startWithName() {
  const nameInput = document.getElementById("username").value.trim();
  if (!nameInput) {
    document.getElementById("loginMessage").textContent = "Please enter a name!";
    return;
  }
  playerName = nameInput;

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";

  startGame();
}

// ---------------- Game Functions ----------------
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
  ctx.fillStyle = "#000";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 180, 280);
  ctx.fillText("Score: " + score, 200, 320);
  saveScore();
  document.getElementById("restartBtn").style.display = "block";
}

function saveScore() {
  if (!playerName) return;
  db.ref("scores").push({
    username: playerName,
    score: score,
    time: Date.now()
  });
  updateLeaderboard();
}

function updateLeaderboard() {
  db.ref("scores")
    .orderByChild("score")
    .limitToLast(5)
    .on("value", snapshot => {
      const list = document.getElementById("leaderboard");
      list.innerHTML = "";
      const scores = [];
      snapshot.forEach(snap => scores.push(snap.val()));
      scores.reverse().forEach((s,i)=>{
        const li = document.createElement("li");
        li.textContent = `#${i+1}: ${s.username} - ${s.score}`;
        list.appendChild(li);
      });
    });
}

// ---------------- Canvas Click ----------------
function setupCanvasClicks() {
  canvas.addEventListener("click", e => {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= box.x && mouseX <= box.x + box.size &&
        mouseY >= box.y && mouseY <= box.y + box.size) {
      score++;
      document.getElementById("score").textContent = score;
      box.x = Math.random() * (canvas.width - box.size);
      box.y = Math.random() * (canvas.height - box.size);
    }
  });
}

// ---------------- Start/Restart ----------------
function startGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  document.getElementById("score").textContent = score;
  setupCanvasClicks();
  updateLeaderboard();
  gameLoop();
  countdown();
}

document.getElementById("restartBtn").addEventListener("click", ()=>{
  score = 0; timeLeft = 30; gameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  startGame();
});


