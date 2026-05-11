// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

const leftPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const rightPaddle = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#ff006e';
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenter() {
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameArea() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCenter();
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
}

// Update functions
function updateLeftPaddle() {
    // Mouse control
    if (mouseY - paddleHeight / 2 > 0 && mouseY - paddleHeight / 2 < canvas.height - paddleHeight) {
        leftPaddle.y = mouseY - paddleHeight / 2;
    }
    
    // Keyboard control
    if (keys['ArrowUp'] && leftPaddle.y > 0) {
        leftPaddle.y -= leftPaddle.speed;
    }
    if (keys['ArrowDown'] && leftPaddle.y < canvas.height - paddleHeight) {
        leftPaddle.y += leftPaddle.speed;
    }
    
    // Keep paddle in bounds
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y > canvas.height - paddleHeight) leftPaddle.y = canvas.height - paddleHeight;
}

function updateRightPaddle() {
    // Computer AI
    const paddleCenter = rightPaddle.y + paddleHeight / 2;
    const ballCenter = ball.y;
    
    if (paddleCenter < ballCenter - 35) {
        rightPaddle.y += rightPaddle.speed;
    } else if (paddleCenter > ballCenter + 35) {
        rightPaddle.y -= rightPaddle.speed;
    }
    
    // Keep paddle in bounds
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y > canvas.height - paddleHeight) rightPaddle.y = canvas.height - paddleHeight;
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Left paddle collision
    if (
        ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + leftPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (leftPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
    }
    
    // Right paddle collision
    if (
        ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + rightPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (rightPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
        ball.dy += hitPos * 3;
    }
    
    // Out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }
    
    // Update score display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Game loop
function gameLoop() {
    drawGameArea();
    
    if (gameRunning) {
        updateLeftPaddle();
        updateRightPaddle();
        updateBall();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();