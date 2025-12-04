function fillScoreTable() {

    const scoreTableBody = document.getElementById('score-tbody');
    scoreTableBody.innerHTML = ''; // Clear existing rows


    // Get all saved games (array)
    fetch('./backend/show_scores.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include cookies for session management
    })
    .then(response => response.json()).then(data => {
        if (data.status === 'success') {
            const allGames = data.scores; // Assuming the backend returns an array of scores
             // Create a table row for each saved game
            allGames.forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${game.username || 'N/A'}</td>
                        <td>${game.score || 0}</td>
                        <td>${game.lives || 0}</td>
                        <td>${game.time || 0}s</td>
                    `;
            scoreTableBody.appendChild(row);
            });
            // If no data, show a message
            if (allGames.length === 0) {
                scoreTableBody.innerHTML = `<tr><td colspan="4">Nincs mentett játék a rendszerben</td></tr>`;
                return;
            }
        }else{
            alert("Hiba az adatok lekérése során: " + data.message);
            return;
        }
    }).catch(error => {
        alert("Hiba az adatok lekérése során: " + error.message);
    });


   
}


async function fetchRegister() {

    try {

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert("Kérem töltse ki a mezőket!");
            return;
        }

        const response = await fetch('./backend/regist.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Read raw response first to debug any JSON issues
        const text = await response.text();

        // Then parse JSON safely
        const data = JSON.parse(text);

        if (data.status === 'success') {
            alert("✅ Sikeres regisztráció!");
        } else {
            alert("⚠️ Sikertelen regisztráció: " + data.message);
        }

    } catch (error) {
        alert("❌ Hiba történt a regisztráció során." + error.message);
    }

}
async function fetchLogin() {

    try {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alert("Kérem töltse ki a mezőket!");
            return;
        }

        const response = await fetch('./backend/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Read raw response first to debug any JSON issues
        const text = await response.text();

        // Then parse JSON safely
        const data = JSON.parse(text);

        if (data.status === 'success') {
            LoggedIn();
            alert("✅ Sikeres bejelentkezés! Üdvözlünk, " + data.user);
        } else {
            alert("⚠️ Sikertelen bejelentkezés: " + data.message);
        }


    } catch (error) {
        alert("❌ Hiba történt a bejelentkezés során." + error.message);
    }

}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#register').addEventListener('click', fetchRegister);
    document.querySelector('#login').addEventListener('click', fetchLogin);
    document.querySelector('#logout').addEventListener('click', logout);
});
async function handleLoad() {
    fetch('./backend/cookie_check.php', {
        method: "GET",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"  // <— important: ensures cookies are sent
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                LoggedIn();
            } else {
                NotLoggedIn();
            }
        });
}
function LoggedIn() {
    document.querySelector('#logout').style.display = 'block';
    document.querySelector('#start-button').style.display = 'block';
    document.querySelector('#score-container').style.display = 'block';
    document.querySelector('#username').style.display = 'none';
    document.querySelector('#password').style.display = 'none';
    document.querySelector('#login').style.display = 'none';
    document.querySelector('#register').style.display = 'none';
    fillScoreTable();
   
}
function NotLoggedIn() {
    document.querySelector('#logout').style.display = 'none';
    document.querySelector('#start-button').style.display = 'none';
    document.querySelector('#score-container').style.display = 'none';
    document.querySelector('#username').style.display = 'block';
    document.querySelector('#password').style.display = 'block';
    document.querySelector('#login').style.display = 'block';
    document.querySelector('#register').style.display = 'block';
}
async function logout() {
    fetch('./backend/logout.php', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
    }).then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert("Sikeres kijelentkezés.");
                NotLoggedIn();
            } else {
                alert("Kijelentkezési hiba: " + data.message);
            }
        });
}

window.onload = handleLoad;

document.addEventListener('DOMContentLoaded', function() {
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                document.body.innerHTML = "<h1>Mobil eszközön nem elérhető</h1>";
            }
});