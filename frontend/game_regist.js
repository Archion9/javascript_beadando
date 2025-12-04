import { initGame, pauseGame, resumeGame} from './engine.js';

export function startGame(e) {
    e.preventDefault();
    let loginStatus = true;
    fetch('backend/cookie_check.php',{
        method: 'GET',
        credentials: 'include'
    }).then(response => response.json())
    .then(data => {
        if(data.success !== true){
            loginStatus = false;
            alert("Jelentkezz be a játék indításához: " + data.error);
            //location.reload();
            return;
        }});
    if(!loginStatus) return;
    setTimeout(() => {
        alert("Irányítás: Nyilak a mozgáshoz, Szóköz a ugráshoz.");
    }, 100); 
    
    document.querySelector('#menu-container').style.display = 'none';
    document.querySelector('#game-canvas').style.display = 'block';
    initGame();

    document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
    else resumeGame();
    });

  window.addEventListener('blur', pauseGame);
  window.addEventListener('focus', resumeGame);
  
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#start-button').addEventListener('click', startGame);
});