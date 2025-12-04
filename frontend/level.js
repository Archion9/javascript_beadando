import { TILE_SIZE, TILE_TYPE } from "./constants.js";

let coinCount = 0;

let level = [];

// Preload tile images    
const dirt_img = new Image();
dirt_img.src = './assets/dirt.png';
const coin_img = new Image();
coin_img.src = './assets/coin.png';
const spike_img = new Image();
spike_img.src = './assets/spike.png';
const platform_img = new Image();
platform_img.src = './assets/platform.png';

export async function loadLevel() {
  try {
    const response = await fetch("./assets/level.json");
    if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
    level = await response.json(); 
  } catch (err) {
    alert("Hiba a pálya betöltése során: " + err.message);
  }
}
export function CountCoins() {
  if (level.length === 0) return 0;
  coinCount = 0;
  for (const row of level) {
    for (const tile of row) {
      if (tile === TILE_TYPE.COIN) coinCount++;
    }
  }
  return coinCount;
}

export function getLevel() {
  return level; // synchronous getter
}

export function drawLevel(canvas, camera) {
  const ctx = canvas.getContext('2d');

  // Figure out which tiles are visible
  const startCol = Math.floor(camera.x / TILE_SIZE);
  const endCol = Math.ceil((camera.x + canvas.width) / TILE_SIZE);
  const startRow = Math.floor(camera.y / TILE_SIZE);
  const endRow = Math.ceil((camera.y + canvas.height) / TILE_SIZE);

  // Clamp to level bounds
  const maxCols = level[0].length;
  const maxRows = level.length;
  const visibleCols = Math.min(endCol, maxCols);
  const visibleRows = Math.min(endRow, maxRows);

  for (let row = startRow; row < visibleRows; row++) {
    if (row < 0) continue; // skip offscreen top
    for (let col = startCol; col < visibleCols; col++) {
       if (col < 0) continue; // skip offscreen left

       const tile = level[row][col];
       if (tile === 0 || tile === TILE_TYPE.EMPTY) continue;

       const x = col * TILE_SIZE - camera.x;
       const y = row * TILE_SIZE - camera.y;

      if (tile === TILE_TYPE.GROUND) {
        ctx.drawImage(dirt_img, x, y, TILE_SIZE, TILE_SIZE);
      }
      if (tile === TILE_TYPE.PLATFORM) {
        ctx.drawImage(platform_img, x, y, TILE_SIZE, TILE_SIZE);
      }
      if (tile === TILE_TYPE.SPIKE) {
       ctx.drawImage(spike_img, x, y, TILE_SIZE, TILE_SIZE);
      }
      if (tile === TILE_TYPE.COIN) {
        ctx.drawImage(coin_img, x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}   