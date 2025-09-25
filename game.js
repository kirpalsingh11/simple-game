// ---------------- CONFIG - put your Firebase config here ----------------
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpDkkemB9ohWS5ZUm5T0YqPqIvxSz7Tc4",
  authDomain: "click-game-cc39b.firebaseapp.com",
  databaseURL: "https://click-game-cc39b-default-rtdb.firebaseio.com/",  // ✅ add this
  projectId: "click-game-cc39b",
  storageBucket: "click-game-cc39b.appspot.com",
  messagingSenderId: "966402336573",
  appId: "1:966402336573:web:d6814160a4b6ca7abe0754",
  measurementId: "G-39SJXWZFHN"
};


// ---------------- init Firebase safely ----------------
let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  console.log("Firebase initialized.");
} catch (err) {
  console.error("Firebase init error:", err);
  document.getElementById('leaderboardStatus').textContent = 'Firebase init error (check console).';
}

// ---------------- Game variables ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let box = { x: 100, y: 100, size: 40 };
let score = 0;
let timeLeft = 30;
let gameOver = false;
let frame;

// ---------------- UI helpers ----------------
function showLeaderboardStatus(msg) {
  const el = document.getElementById('leaderboardStatus');
  if (el) el.textContent = msg;
}

function renderLeaderboardArray(arr) {
  const list = document.getElementById('leaderboard');
  list.innerHTML = '';
  if (!arr.length) {
    const li = document.createElement('li');
    li.textContent = 'No scores yet';
    list.appendChild(li);
    return;
  }
  arr.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `#${i+1}: ${s}`;
    list.appendChild(li);
  });
}

// ---------------- Draw the red box ----------------
function drawBox() {
  ctx.fillStyle = "red";
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

// ---------------- Game loop ----------------
function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBox();
  frame = requestAnimationFrame(gameLoop);
}

// ---------------- Click detection ----------------
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

// ---------------- End game ----------------
function endGame() {
  gameOver = true;
  cancelAnimationFrame(frame);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 180, 280);
  ctx.fillText("Score: " + score, 200, 320);
  if (db) {
    saveScore(score);
  } else {
    showLeaderboardStatus('No Firebase (score not saved).');
  }
  document.getElementById("restartBtn").style.display = "block";
}

// ---------------- Save to Firebase ----------------
function saveScore(newScore) {
  try {
    db.ref("scores").push({ score: newScore, time: Date.now() });
    showLeaderboardStatus('Saved to Firebase');
  } catch (err) {
    console.error('Save error:', err);
    showLeaderboardStatus('Save failed (check console).');
  }
  updateLeaderboard();
}

// ---------------- Update leaderboard from Firebase ----------------
function updateLeaderboard() {
  const statusEl = document.getElementById('leaderboardStatus');
  if (!db) {
    statusEl.textContent = 'Firebase not initialized.';
    renderLeaderboardArray([]);
    return;
  }
  statusEl.textContent = 'Loading...';
  db.ref('scores').orderByChild('score').limitToLast(5).once('value')
    .then(snapshot => {
      const arr = [];
      snapshot.forEach(snap => {
        const val = snap.val();
        if (val && typeof val.score === 'number') arr.push(val.score);
      });
      arr.reverse();
      renderLeaderboardArray(arr);
      statusEl.textContent = arr.length ? 'Top 5 (global)' : 'No global scores yet';
      console.log('Leaderboard loaded:', arr);
    })
    .catch(err => {
      console.error('Leaderboard read error:', err);
      statusEl.textContent = 'Error reading leaderboard (see console)';
      renderLeaderboardArray([]);
    });
}

// ---------------- Restart button ----------------
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  timeLeft = 30;
  gameOver = false;
  document.getElementById("score").textContent = score;
  document.getElementById("restartBtn").style.display = "none";
  gameLoop();
  countdown();
});

// ---------------- helper you can run in console ----------------
// Run this in DevTools console to push a test score to Firebase:
//   pushTestScore();
window.pushTestScore = function () {
  if (!db) {
    console.warn('Firebase not initialized.');
    return;
  }
  const val = Math.floor(Math.random() * 100);
  db.ref('scores').push({ score: val, time: Date.now() })
    .then(() => {
      console.log('pushed test score', val);
      updateLeaderboard();
    })
    .catch(e => console.error('pushTestScore error', e));
};

// ---------------- start ----------------
updateLeaderboard();
gameLoop();
countdown();


