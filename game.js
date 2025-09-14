    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let timeLeft = 30; // seconds
    let gameOver = false;
    let box = { x: 50, y: 50, size: 50, border: 5 };
    let score = 0;

    setInterval(() => {
  if (!gameOver && timeLeft > 0) {
    timeLeft--;
  }
  if (timeLeft === 0) {
    gameOver = true;
  }
}, 1000);

    // Draw the box
    function drawBox() {
      ctx.fillStyle = "red";
      ctx.lineWidth = box.border;
        ctx.strokeStyle = "black";
        ctx.strokeRect(box.x, box.y, box.size, box.size);
      ctx.fillRect(box.x, box.y, box.size, box.size);
    }

    // Clear + redraw everything
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText("Time: " + timeLeft, 300, 25);

  if (gameOver) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", 120, 180);
  ctx.fillText("Score: " + score, 140, 220);

  // Show restart button
  document.getElementById("restartBtn").style.display = "block";

  return;
}

document.getElementById("restartBtn").addEventListener("click", () => {
  // Reset game variables
  score = 0;
  timeLeft = 30;
  gameOver = false;

  // Hide button again
  document.getElementById("restartBtn").style.display = "none";

  // Reset box position
  box.x = Math.random() * (canvas.width - box.size);
  box.y = Math.random() * (canvas.height - box.size);

  gameLoop(); // restart the game loop
});


      drawBox();

      // Draw score
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText("Score: " + score, 10, 25);

      requestAnimationFrame(gameLoop);
    }

    // Check clicks
    canvas.addEventListener("click", e => {
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
        // Move box to random spot
        box.x = Math.random() * (canvas.width - box.size);
        box.y = Math.random() * (canvas.height - box.size);
      }
    });

    gameLoop();