import { drawLevel, loadLevel, CountCoins } from './level.js';
import { updatePlayer, drawPlayer, player } from './player.js';
import { camera, initCamera, updateCamera } from './camera.js';

let lastFrameTime = performance.now();
let paused = false;
let gameRunning = false;

export async function initGame(username) { 
    //console.trace("initGame() called with username:", username); // helps find caller

    if (gameRunning) {
    console.log("initGame: game already running — ignoring.");
    return;
  }
  const canvas = document.querySelector('#game-canvas');
  if (!canvas) {
    console.error('Nem található a játékvászon!');
    return;
  }
  if (!username || username === '') {
    console.warn('initGame: empty username — not starting.');
    return;
  }
  await loadLevel();
  CountCoins();
  initCamera(canvas);
  gameRunning = true;
  paused = false;
  lastFrameTime = performance.now();

  GameLoop(canvas, lastFrameTime);
}

export function GameLoop(canvas, currentTime) {
  if (!gameRunning) return;
  const dt = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  if (!paused) {
    GameLogic(canvas, dt);
    GameRender(canvas, dt);
  }

  requestAnimationFrame((t) => GameLoop(canvas, t));
}


export function GameLogic(canvas, dt) {
    if(paused) return;
    if(player.lives <= 0){
        console.log("Game Over!");
        stopGame();
        alert("Game Over! Próbáld újra!");
        saveGame();
        location.reload();
    }
    if(CountCoins() === 0){
        console.log("You collected all coins! You win!");
        stopGame();
        alert("Gratulálok! Összegyűjtötted az összes érmét!");
        saveGame();
        location.reload();
    }

    updatePlayer(canvas, dt);
    updateCamera();
}
function saveGame(){
   const newGameData = {
        username: document.querySelector('#username').value,
        score: player.points,
        lives: player.lives,
        time: Math.floor((performance.now() - drawTimer.startTime) / 1000)
    };

    // Get existing data (if any)
    let allGames = JSON.parse(localStorage.getItem('gameData')) || [];

    // Add the new game record
    allGames.push(newGameData);

    // Save back to localStorage
    localStorage.setItem('gameData', JSON.stringify(allGames));
}

export function GameRender(canvas, dt) {
    if(paused) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLevel(canvas, camera);
    drawPlayer(ctx);
    drawFps(ctx);
    drawTimer(ctx);
    //drawDeltaTime(ctx, dt);
    //drawCameraInfo(ctx, camera);
    drawPoints(ctx);
    drawLives(ctx);
}
export function drawFps(ctx) {
    const fps = Math.round(1000 / (performance.now() - (drawFps.lastTime || performance.now())));
    drawFps.lastTime = performance.now();
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${fps}`, 10, 20);
}
export function drawTimer(ctx) {
    const seconds = Math.floor((performance.now() - (drawTimer.startTime || performance.now())) / 1000);
    drawTimer.startTime = drawTimer.startTime || performance.now();
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Time: ${seconds}s`, 10, 40);
}
export function drawDeltaTime(ctx, dt) {
    //Render deltatime
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Delta Time: ${dt.toFixed(4)}s`, 500, 60);
}
export function drawCameraInfo(ctx, camera) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Camera X: ${Math.round(camera.x)} Y: ${Math.round(camera.y)} Width: ${Math.round(camera.width)} Height: ${Math.round(camera.height)}`, 10, 100);
}

export function pauseGame() {
  paused = true;
  console.log('Game paused');
}

export function resumeGame() {
  paused = false;
  lastFrameTime = performance.now();
  console.log('Game resumed');
}
export function stopGame() {
    gameRunning = false;
    console.log("Game stopped");
}
export function drawPoints(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Points: ${player.points}`, 100, 20);
}
export function drawLives(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`Lives: ${player.lives}`, 100, 40);
}