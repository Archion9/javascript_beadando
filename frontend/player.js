import { GRAVITY, MOVE_SPEED, JUMP_FORCE, TILE_SIZE, TILE_TYPE } from './constants.js';
import { isKeyDown, isKeyPressed } from './input.js';
import { AABBIntersect } from './physics.js';
import { getLevel } from './level.js';
import { camera } from './camera.js';

export const player = {
  x: 100,
  y: 100,
  points: 0,
  lives: 3,
  width: 32,
  height: 48,
  dx: 0,
  dy: 0,
  onGround: false,
  direction: 'right'
};

const player_img = new Image();
player_img.src = 'assets/player.png';

export function updatePlayer(canvas, dt) {
    const ACCEL = 1500;     // horizontal acceleration
    const FRICTION = 2000;  // horizontal deceleration
    const MAX_SPEED = MOVE_SPEED;
    const GRAV = GRAVITY;   // from constants
    const JUMP = JUMP_FORCE;

    // --- Update player direction ---
    if (isKeyPressed("ArrowLeft")) {
        player.direction = 'left';
    } else if (isKeyPressed("ArrowRight")) {
        player.direction = 'right';
    }

    // --- Horizontal input ---
    if (isKeyDown("ArrowLeft")) {
        if(player.dx > 0) player.dx -= FRICTION * dt;
        player.dx -= ACCEL * dt;
    } else if (isKeyDown("ArrowRight")) {
        if(player.dx < 0) player.dx += FRICTION * dt;
        player.dx += ACCEL * dt;
    } else {
        if (player.onGround) {
            // Apply friction only when on ground
            if (Math.abs(player.dx) < FRICTION * dt) player.dx = 0;
            else player.dx -= Math.sign(player.dx) * FRICTION * dt;
        } else {
            // In air with no horizontal input, stop horizontal movement to avoid gliding
            player.dx = 0;
        }
    }

    // --- Clamp horizontal velocity ---
    player.dx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.dx));

    // --- Jump ---
    if(!isKeyDown("Space") && player.dy < 0){
        player.dy += GRAV * dt * 2; 
    }
    if (isKeyPressed("Space") && player.onGround) {
        player.dy = JUMP;
        player.onGround = false;
    }

    // --- Apply gravity ---
    player.dy += GRAV * dt;
    if (player.dy > 1000) player.dy = 1000; // terminal velocity

    // --- Step 1: Horizontal movement + collision ---
    player.x += player.dx * dt;
    resolveCollisions("x");

    // --- Step 2: Vertical movement + collision ---
    player.y += player.dy * dt;
    player.onGround = false;
    resolveCollisions("y");

    // --- Keep player inside canvas ---
    if (player.y > canvas.height) {
        player.x = 100;
        player.y = 100;
        player.dx = 0;
        player.dy = 0;
        player.onGround = false;
        player.lives -= 1;
        return;
    }
    if (player.x < 0){
        player.x = 0;
        player.dx = 0;
    }
    if (player.x + player.width > TILE_SIZE * getLevel()[0].length){
        player.x = TILE_SIZE * getLevel()[0].length - player.width;
        player.dx = 0;
    }
}

function resolveCollisions(axis) {
    for (let row = 0; row < getLevel().length; row++) {
        for (let col = 0; col < getLevel()[row].length; col++) {
            const tile = getLevel()[row][col];
            if (tile === TILE_TYPE.EMPTY) continue;

            const tileX = col * TILE_SIZE;
            const tileY = row * TILE_SIZE;

            if (AABBIntersect(
                player.x, player.y, player.width, player.height,
                tileX, tileY, TILE_SIZE, TILE_SIZE
            )) {
                if (tile === TILE_TYPE.SPIKE) {
                    player.x = 100;
                    player.y = 100;
                    player.dx = 0;
                    player.dy = 0;
                    player.onGround = false;
                    player.lives -= 1;
                    return;
                }
                if (tile === TILE_TYPE.COIN) {
                    player.points += 1;
                    getLevel()[row][col] = TILE_TYPE.EMPTY;
                    continue;
                }

                if (tile === TILE_TYPE.GROUND || tile === TILE_TYPE.PLATFORM) {
                    if (axis === "x") {
                        if (player.dx > 0) {
                            player.x = tileX - player.width;
                        } else if (player.dx < 0) {
                            player.x = tileX + TILE_SIZE;
                        }
                        player.dx = 0;
                    } else if (axis === "y") {
                        if (player.dy > 0) {
                            player.y = tileY - player.height;
                            player.dy = 0;
                            player.onGround = true;
                        } else if (player.dy < 0) {
                            player.y = tileY + TILE_SIZE;
                            player.dy = 0;
                        }
                    }
                }
            }
        }
    }
}


export function drawPlayer(ctx) {
    // Draw Player SpriteSheet first is when jumping second row is neutral on the image
    let row = 0;
    if (!player.onGround) {
        if(player.direction === 'left') {
            row = 3; // left facing sprites
        } else {
            row = 2; // right facing sprites
        }
    }
    if (player.onGround) {
        if(player.direction === 'left') {
            row = 1; // left facing sprites
        } else {
            row = 0; // right facing sprites
        }
    }
    const spriteRow = row;

    ctx.drawImage(player_img, 0, spriteRow * player.height, player.width, player.height,
        player.x - camera.x, player.y - camera.y, player.width, player.height);
    //draw player position
    //ctx.fillStyle = 'black';
    //ctx.font = '16px Arial';
    //ctx.fillText(`X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`,200, 30);
}