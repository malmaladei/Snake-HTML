const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mainMenu = document.getElementById('mainMenu');
const startGameButton = document.getElementById('startGame');
const showScoreboardButton = document.getElementById('showScoreboard');
const exitAppButton = document.getElementById('exitApp');
const highScoreElement = document.getElementById('highScore');
const nameForm = document.getElementById('nameForm');
const playerNameInput = document.getElementById('playerName');
const submitNameButton = document.getElementById('submitName');
const scoreboard = document.getElementById('scoreboard');
const scoreboardBody = document.getElementById('scoreboardBody');
const backToMenuButton = document.getElementById('backToMenu');

let gridSize, tileCountX, tileCountY;
let snake, food, dx, dy, score, highScore;
let gameInterval;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gridSize = Math.min(canvas.width, canvas.height) / 20;
    tileCountX = Math.floor(canvas.width / gridSize);
    tileCountY = Math.floor(canvas.height / gridSize);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameInterval) {
        resetGame();
    }
});

resizeCanvas();

function showMainMenu() {
    mainMenu.style.display = 'flex';
    canvas.style.display = 'none';
    nameForm.style.display = 'none';
    scoreboard.style.display = 'none';
    fetch('/highscore')
        .then(response => response.json())
        .then(data => {
            highScore = data.highscore;
            highScoreElement.textContent = highScore || 0;
        });
}

function startGame() {
    mainMenu.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameInterval = setInterval(drawGame, 100);
}

function exitApp() {
    fetch('/shutdown', {
        method: 'POST'
    }).then(() => {
        // Open a new tab and close the current one
        const newWindow = window.open('about:blank', '_self');
        newWindow.close();
    });
}

function drawGame() {
    clearCanvas();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    drawScore();
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = 'blue';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY)
    };
}

function checkCollision() {
    if (snake[0].x < 0 || snake[0].x >= tileCountX || snake[0].y < 0 || snake[0].y >= tileCountY) {
        endGame();
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            endGame();
        }
    }
}

function resetGame() {
    snake = [{x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2)}];
    generateFood();
    dx = 0;
    dy = 0;
    score = 0;
}

function endGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    if (score > highScore) {
        highScore = score;
        nameForm.style.display = 'flex';
        canvas.style.display = 'none';
    } else {
        showMainMenu();
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function submitName() {
    const name = playerNameInput.value;
    fetch('/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, score })
    }).then(() => {
        showMainMenu();
    });
}

function showScoreboard() {
    mainMenu.style.display = 'none';
    scoreboard.style.display = 'flex';
    fetch('/scores')
        .then(response => response.json())
        .then(data => {
            console.log('Scores fetched:', data); // Debugging log
            scoreboardBody.innerHTML = '';
            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.name}</td>
                    <td>${row.score}</td>
                    <td>${new Date(row.date).toLocaleString()}</td>
                `;
                scoreboardBody.appendChild(tr);
            });
        });
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

startGameButton.addEventListener('click', startGame);
showScoreboardButton.addEventListener('click', showScoreboard);
exitAppButton.addEventListener('click', exitApp);
submitNameButton.addEventListener('click', submitName);
backToMenuButton.addEventListener('click', showMainMenu);

showMainMenu();