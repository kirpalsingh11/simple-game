let canvas, ctx;
let box = {x:100,y:100,size:50};
let score=0, timeLeft=30, gameOver=false, frame;
let playerName="";
function startWithName(){
  const input = document.getElementById("username").value.trim();
  if(!input){ document.getElementById("loginMessage").textContent="Enter a name!"; return; }
  playerName = input;
  document.getElementById("loginScreen").style.display="none";
  document.getElementById("gameContainer").style.display="block";
  startGame();
}

function drawBox(){ ctx.fillStyle="red"; ctx.fillRect(box.x,box.y,box.size,box.size); }

function updateLeaderboard(){
  db.ref("scores").orderByChild("score").limitToLast(5).on("value", snapshot=>{
    const list = document.getElementById("leaderboard");
    list.innerHTML="";
    const scores=[];
    snapshot.forEach(snap=>scores.push(snap.val()));
    scores.reverse().forEach((s,i)=>{
      const li=document.createElement("li");
      li.textContent=`#${i+1}: ${s.name} - ${s.score}`;
      list.appendChild(li);
    });
  });
}
function saveScore(){
  if(!playerName) playerName = "Anonymous"; // fallback
  db.ref("scores").push({
    name: playerName,
    score: score,
    time: Date.now()
  });
  updateLeaderboard();
}


function gameLoop(){ if(gameOver) return; ctx.clearRect(0,0,canvas.width,canvas.height); drawBox(); frame=requestAnimationFrame(gameLoop); }

function countdown(){ if(timeLeft>0){ document.getElementById("timer").textContent=timeLeft; timeLeft--; setTimeout(countdown,1000); } else endGame(); }

function endGame(){ gameOver=true; cancelAnimationFrame(frame); ctx.fillStyle="#000"; ctx.font="30px Arial"; ctx.fillText("Game Over!",180,280); ctx.fillText("Score:"+score,200,320); saveScore(); document.getElementById("restartBtn").style.display="block"; }

document.getElementById("restartBtn").addEventListener("click",()=>{
  score=0; timeLeft=30; gameOver=false;
  document.getElementById("score").textContent=score;
  document.getElementById("restartBtn").style.display="none";
  startGame();
});

function setupCanvasClicks(){
  canvas.addEventListener("click", e=>{
    if(gameOver) return;
    const rect=canvas.getBoundingClientRect();
    const mouseX=e.clientX-rect.left;
    const mouseY=e.clientY-rect.top;
    if(mouseX>=box.x && mouseX<=box.x+box.size && mouseY>=box.y && mouseY<=box.y+box.size){
      score++; document.getElementById("score").textContent=score;
      box.x=Math.random()*(canvas.width-box.size);
      box.y=Math.random()*(canvas.height-box.size);
    }
  });
}

function startGame(){
  canvas=document.getElementById("gameCanvas");
  ctx=canvas.getContext("2d");
  document.getElementById("score").textContent=score;
  setupCanvasClicks();
  updateLeaderboard();
  gameLoop();
  countdown();
}

