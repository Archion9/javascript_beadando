import { TILE_SIZE } from './constants.js';
import { getLevel } from './level.js';
import { player } from './player.js';

export const camera = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};

export function initCamera(canvas) {
    camera.width = canvas.width;
    camera.height = canvas.height;
}

export function updateCamera() {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    // Center camera on player
    camera.x = centerX - camera.width / 2;
    camera.y = centerY - camera.height / 2;

    // Clamp camera within level boundaries
    const levelWidth = getLevel()[0].length * TILE_SIZE;
    const levelHeight = getLevel().length * TILE_SIZE;

    camera.x = Math.max(0, Math.min(camera.x, levelWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, levelHeight - camera.height));
}