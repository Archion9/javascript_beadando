const keysDown = {};
const keysPressed = {};

document.addEventListener("keydown", e => {
    if (!keysDown[e.code]) {
        keysPressed[e.code] = true;
    }
    keysDown[e.code] = true;
});
document.addEventListener("keyup", e => {
    keysDown[e.code] = false;
    keysPressed[e.code] = false;
});

export function isKeyDown(keyCode) {
  return !!keysDown[keyCode];
}
export function isKeyPressed(keyCode) {
   if (keysPressed[keyCode]) {
    keysPressed[keyCode] = false; // reset after checking
    return true;
  }
  return false;
}