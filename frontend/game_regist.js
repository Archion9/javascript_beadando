import { initGame, pauseGame, resumeGame} from './engine.js';

export function startGame(e) {
    e.preventDefault();

    let username = document.querySelector('#username').value;
    if (username === '') {
        alert('Kérlek, adj meg egy felhasználónevet!');
        return;
    }
    
    // Itt indíthatod el a játékot, például meghívhatod a játék inicializáló függvényét
    
    // console.log(`Játék indítva a következő felhasználónévvel: ${username}`);
    setTimeout(() => {
        alert("Irányítás: Nyilak a mozgáshoz, Szóköz a ugráshoz.");
    }, 100); // 100ms késleltetés
    
    document.querySelector('#menu-container').style.display = 'none';
    document.querySelector('#game-canvas').style.display = 'block';
    initGame(username);

    document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
    else resumeGame();
    });
  // (Optional) handle when window focus is lost (e.g., Alt+Tab without tab switch)
  window.addEventListener('blur', pauseGame);
  window.addEventListener('focus', resumeGame);
  
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#start-button').addEventListener('click', startGame);
});