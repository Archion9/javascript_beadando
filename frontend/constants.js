const TILE_SIZE = 32;
const GRAVITY = 1800;
const JUMP_FORCE = -950;
const MOVE_SPEED = 400;

const TILE_TYPE = Object.freeze({
    EMPTY: 0,
    GROUND: 1,
    PLATFORM: 2,
    SPIKE: 3,
    COIN: 4,
    NPC: 5,
    ENDING: 6
});

export { GRAVITY, JUMP_FORCE, MOVE_SPEED, TILE_SIZE, TILE_TYPE };