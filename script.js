const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const livesEl = document.getElementById('lives-display');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');
const saveBtn = document.getElementById('save-btn');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const saveScoreSection = document.getElementById('save-score-section');

// Elementi modale scelta aereo
const openPlaneModalBtn = document.getElementById('open-plane-modal-btn');
const closePlaneModalBtn = document.getElementById('close-plane-modal-btn');
const planeModal = document.getElementById('plane-modal');
const planeGrid = document.getElementById('plane-grid');

// Riferimenti pop-up di aggiornamento
const updatePopup = document.getElementById('update-popup');
const updateActionBtn = document.getElementById('update-action-btn');

// Versione attuale del gioco
const CURRENT_VERSION = "2.0"; 

// Credenziali Cloud jsonbin.io
const BIN_ID = '6ac4b87cffd5d1605351f58d';
const MASTER_KEY = '$2a$10$aplyk/beh6fEjv43q.yWK.yNbASVpWB2lHxQ8.O3c9aj0.zzW4Kuu';

// Definizione dei 10 aerei
const PLANES_DATA = [
    { id: 0, emoji: '✈️', name: 'Aereo di Linea', points: 0 },
    { id: 1, emoji: '🛩️', name: 'Monomotore', points: 200 },
    { id: 2, emoji: '🛫', name: 'Jet', points: 400 },
    { id: 3, emoji: '🛬', name: 'Caccia', points: 600 },
    { id: 4, emoji: '🚁', name: 'Biposto', points: 800 },
    { id: 5, emoji: '✈️', name: 'Fighter', points: 1000 },
    { id: 6, emoji: '🛩️', name: 'Bimotore', points: 1200 },
    { id: 7, emoji: '🛫', name: 'Idrovolante', points: 1400 },
    { id: 8, emoji: '🛬', name: 'Jet Supersonico', points: 1600 },
    { id: 9, emoji: '✈️', name: 'Aereo Acrobatico', points: 1800 }
];

// Gestione Punti Totali (Hangar) e HighScore
let totalLifetimeScore = parseInt(localStorage.getItem('sky_ace_total_score')) || 0;
let highScore = parseInt(localStorage.getItem('sky_ace_highscore')) || 0;
let unlockedPlanes = JSON.parse(localStorage.getItem('sky_ace_unlocked')) || [0]; 
let selectedPlaneId = parseInt(localStorage.getItem('sky_ace_selected_id')) || 0;

// --- GESTIONE HUD (Tempo in mezzo, Record a destra vicino alle vite) ---
let timerDisplayEl = document.getElementById('timer-display');
let recordDisplayEl = document.getElementById('record-display');

// Se non esistono nel DOM, li creiamo dinamicamente nella barra superiore
if (currentScoreEl) {
    let hudBar = currentScoreEl.parentElement; // Il contenitore degli elementi in alto
    
    if (!timerDisplayEl && hudBar) {
        let timerContainer = document.createElement('div');
        timerContainer.id = 'timer-container';
        timerContainer.innerHTML = 'Tempo: <span id="timer-display">0s</span>';
        // Inseriamo il timer subito dopo il punteggio
        currentScoreEl.parentElement.after(timerContainer);
        timerDisplayEl = document.getElementById('timer-display');
    }

    if (!recordDisplayEl && livesEl) {
        let recordContainer = document.createElement('div');
        recordContainer.id = 'record-container';
        recordContainer.innerHTML = 'Record: <span id="record-display">' + highScore + '</span>';
        // Inseriamo il record a sinistra delle vite
        livesEl.parentElement.insertBefore(recordContainer, livesEl);
        recordDisplayEl = document.getElementById('record-display');
    }
}

// --- CREAZIONE DINAMICA PULSANTE "MENU" NELLA SCHERMATA GAME OVER ---
let restartBtnParent = restartBtn ? restartBtn.parentElement : null;
let menuBtn = document.getElementById('menu-btn');
if (!menuBtn && restartBtnParent) {
    menuBtn = document.createElement('button');
    menuBtn.id = 'menu-btn';
    menuBtn.textContent = 'Menu Principale';
    menuBtn.style.background = '#4caf50';
    menuBtn.style.color = 'white';
    menuBtn.style.border = 'none';
    menuBtn.style.padding = '10px 20px';
    menuBtn.style.borderRadius = '5px';
    menuBtn.style.cursor = 'pointer';
    menuBtn.style.fontWeight = 'bold';
    menuBtn.style.marginLeft = '10px';
    restartBtn.after(menuBtn);
}

// Sistema di Particelle
let particles = [];
function addParticles(x, y, color = '#ffd54f', count = 12) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1.5,
            color: color, alpha: 1,
            decay: Math.random() * 0.03 + 0.02
        });
    }
}

let plane = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40, height: 40,
    speed: 6,
    emoji: PLANES_DATA[selectedPlaneId].emoji
};

let obstacles = [];
let enemyLasers = [];
let obstacleTimer = 0;
let spawnRate = 40; 
let gameSpeed = 3;
let score = 0; 
let lives = 3;
let gameStarted = false; 
let gameRunning = false; 
let survivalTime = 0;

let shieldActive = false;
let shieldTimer = 0;
let doublePointsActive = false;
let doublePointsTimer = 0;
let windForce = 0;

let keys = { ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    if (e.key === ' ' && !gameStarted && planeModal && planeModal.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
});

// --- GESTIONE TOUCH E JOYSTICK MOBILE ---
let joystick = { active: false, identifier: null, startX: 0, startY: 0, vx: 0 };
const vJoystickEl = document.getElementById('virtualJoystick');
const knobEl = document.getElementById('joystickKnob');

if (vJoystickEl && knobEl) {
    vJoystickEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joystick.active = true;
        joystick.identifier = touch.identifier;
        const rect = vJoystickEl.getBoundingClientRect();
        joystick.startX = rect.left + rect.width / 2;
        updateJoystick(touch.clientX);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (!joystick.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === joystick.identifier) {
                updateJoystick(touch.clientX);
                break;
            }
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (!joystick.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joystick.identifier) {
                joystick.active = false;
                joystick.vx = 0;
                knobEl.style.transform = `translate(0px, 0px)`;
                break;
            }
        }
    });
}

function updateJoystick(clientX) {
    const maxDist = 30;
    let dx = clientX - joystick.startX;
    if (dx > maxDist) dx = maxDist;
    if (dx < -maxDist) dx = -maxDist;
    if (knobEl) knobEl.style.transform = `translate(${dx}px, 0px)`;
    joystick.vx = dx / maxDist;
}

const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
if (leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowLeft = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowLeft = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.ArrowRight = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowRight = false; });
}

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    let mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) mobileControls.style.display = 'flex';
}

// --- GESTIONE MODALE E SBLOCCO AEREI ---
function renderPlaneGrid() {
    if (!planeGrid) return;
    planeGrid.innerHTML = '';
    PLANES_DATA.forEach(p => {
        let slot = document.createElement('div');
        let isUnlocked = unlockedPlanes.includes(p.id);
        let canUnlock = totalLifetimeScore >= p.points && !isUnlocked;
        let isSelected = selectedPlaneId === p.id;

        slot.className = 'plane-slot';
        if (isUnlocked) {
            slot.classList.add('unlocked');
            if (isSelected) slot.classList.add('selected');
            slot.innerHTML = `
                <div class="plane-emoji">${p.emoji}</div>
                <div class="plane-info"><strong>${p.name}</strong><br>${isSelected ? 'Selezionato' : 'Sbloccato'}</div>
            `;
            slot.onclick = () => {
                selectedPlaneId = p.id;
                plane.emoji = p.emoji;
                localStorage.setItem('sky_ace_selected_id', selectedPlaneId);
                renderPlaneGrid();
            };
        } else if (canUnlock) {
            slot.classList.add('unlockable');
            slot.innerHTML = `
                <div class="plane-emoji">${p.emoji}</div>
                <div class="plane-info" style="color: #ff9800; font-weight: bold;">CLICCA PER RISCATTARE!</div>
            `;
            slot.onclick = () => {
                unlockedPlanes.push(p.id);
                localStorage.setItem('sky_ace_unlocked', JSON.stringify(unlockedPlanes));
                renderPlaneGrid();
            };
        } else {
            slot.classList.add('locked');
            slot.innerHTML = `
                <div class="plane-emoji">🔒</div>
                <div class="plane-info">${p.name}<br>Richiede ${p.points} pt tot</div>
            `;
        }
        planeGrid.appendChild(slot);
    });
}

if (openPlaneModalBtn) {
    openPlaneModalBtn.onclick = () => {
        renderPlaneGrid();
        let totalScoreDisplay = document.getElementById('total-score-display');
        if (!totalScoreDisplay && planeModal) {
            totalScoreDisplay = document.createElement('p');
            totalScoreDisplay.id = 'total-score-display';
            totalScoreDisplay.style.color = '#ffd54f';
            totalScoreDisplay.style.fontSize = '15px';
            totalScoreDisplay.style.margin = '5px 0 15px 0';
            totalScoreDisplay.style.fontWeight = 'bold';
            let modalTitle = planeModal.querySelector('h2');
            if (modalTitle) modalTitle.after(totalScoreDisplay);
        }
        if (totalScoreDisplay) totalScoreDisplay.textContent = `Punti Totali Accumulati: ${totalLifetimeScore} pt`;
        if (planeModal) planeModal.classList.remove('hidden');
    };
}

if (closePlaneModalBtn) {
    closePlaneModalBtn.onclick = () => {
        if (planeModal) planeModal.classList.add('hidden');
    };
}

function requestMobileFullscreen() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
    if (isMobile && !document.fullscreenElement) {
        let docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => {});
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        }
    }
}

function startGame() {
    gameStarted = true;
    gameRunning = true;
    if (startScreen) startScreen.classList.add('hidden');
    if (planeModal) planeModal.classList.add('hidden');
    
    requestMobileFullscreen();

    plane.emoji = PLANES_DATA[selectedPlaneId].emoji;
    plane.x = canvas.width / 2 - plane.width / 2;
    obstacles = [];
    enemyLasers = [];
    particles = [];
    
    highScore = parseInt(localStorage.getItem('sky_ace_highscore')) || 0;
    score = 0; 
    lives = 3;
    gameSpeed = 3;
    survivalTime = 0;
    obstacleTimer = 0;
    shieldActive = false;
    doublePointsActive = false;
    
    if (currentScoreEl) currentScoreEl.textContent = score;
    if (timerDisplayEl) timerDisplayEl.textContent = '0s';
    if (recordDisplayEl) recordDisplayEl.textContent = highScore;
    updateLivesDisplay();

    updateGame();
}

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

function updateLivesDisplay() {
    if (livesEl) livesEl.textContent = '❤'.repeat(Math.max(0, lives));
}

function spawnObstacle() {
    let rand = Math.random();
    let type, symbol, points, width, height;

    if (rand < 0.45) {
        type = 'lightning'; symbol = '⚡'; points = 1; width = 40; height = 30;
    } else if (rand < 0.65) {
        type = 'laserEnemy'; symbol = '🛩️'; points = -5; width = 40; height = 40;
    } else if (rand < 0.80) {
        type = 'bonus'; symbol = '🌟'; points = 3; width = 40; height = 40;
    } else if (rand < 0.92) {
        type = 'shield'; symbol = '🛡️'; points = 5; width = 40; height = 40;
    } else {
        type = 'double'; symbol = '💎'; points = 10; width = 40; height = 40;
    }
    
    let x = Math.random() * (canvas.width - width);
    obstacles.push({
        x: x, y: -50, width: width, height: height,
        speed: gameSpeed + (type === 'laserEnemy' ? 0.3 : Math.random() * 1.5),
        points: points, type: type, symbol: symbol, shootTimer: 0 
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    if (shieldActive) {
        ctx.strokeStyle = '#29b6f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(plane.x + plane.width / 2, plane.y + plane.height / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (!shieldActive || Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.save();
        ctx.translate(plane.x + plane.width / 2, plane.y + plane.height / 2);
        ctx.rotate(-Math.PI / 4); 
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plane.emoji, 0, 0);
        ctx.restore();
    }

    for (let obs of obstacles) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        if (obs.type === 'laserEnemy') ctx.rotate(Math.PI / 2); 
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.symbol, 0, 0);
        ctx.restore();
    }

    for (let laser of enemyLasers) {
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }

    if (doublePointsActive) {
        ctx.fillStyle = '#69f0ae';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('PUNTI x2!', 15, 25);
    }
}

function updateGame() {
    if (!gameRunning) return;

    survivalTime++;
    if (survivalTime % 60 === 0 && timerDisplayEl) {
        timerDisplayEl.textContent = Math.floor(survivalTime / 60) + 's';
    }

    gameSpeed = 3 + Math.floor(survivalTime / 1000) * 0.1; 
    spawnRate = Math.max(25, 40 - Math.floor(survivalTime / 400) * 2); 
    
    if (survivalTime % 400 === 0) windForce = (Math.random() - 0.5) * 1.5;
    if (survivalTime % 600 === 0) windForce = 0;

    if (shieldActive) {
        shieldTimer--;
        if (shieldTimer <= 0) shieldActive = false;
    }
    if (doublePointsActive) {
        doublePointsTimer--;
        if (doublePointsTimer <= 0) doublePointsActive = false;
    }

    if (keys.ArrowLeft) plane.x -= plane.speed;
    if (keys.ArrowRight) plane.x += plane.speed;
    if (joystick.active) plane.x += joystick.vx * plane.speed;
    plane.x += windForce;

    if (plane.x < 0) plane.x = 0;
    if (plane.x + plane.width > canvas.width) plane.x = canvas.width - plane.width;

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
    }

    obstacleTimer++;
    if (obstacleTimer > spawnRate) {
        spawnObstacle();
        obstacleTimer = 0;
    }

    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        enemyLasers[i].y += enemyLasers[i].speed;
        let padding = 8;
        if (
            plane.x + padding < enemyLasers[i].x + enemyLasers[i].width - padding &&
            plane.x + plane.width - padding > enemyLasers[i].x + padding &&
            plane.y + padding < enemyLasers[i].y + enemyLasers[i].height - padding &&
            plane.y + plane.height - padding > enemyLasers[i].y + enemyLasers[i].height
        ) {
            addParticles(plane.x + plane.width / 2, plane.y + plane.height / 2, '#ff1744', 10);
            if (shieldActive) {
                shieldActive = false;
            } else {
                score = Math.max(0, score - 5);
                if (currentScoreEl) currentScoreEl.textContent = score;
            }
            enemyLasers.splice(i, 1);
            continue;
        }
        if (enemyLasers[i].y > canvas.height) enemyLasers.splice(i, 1);
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += obs.speed;

        if (obs.type === 'laserEnemy') {
            if (obs.x < plane.x) obs.x += 1.0; 
            else if (obs.x > plane.x) obs.x -= 1.0; 

            obs.shootTimer++;
            if (obs.shootTimer > 80) { 
                enemyLasers.push({
                    x: obs.x + obs.width / 2 - 3,
                    y: obs.y + obs.height,
                    width: 6, height: 16, speed: 6
                });
                obs.shootTimer = 0;
            }
        }

        let padding = 10;
        if (
            plane.x + padding < obs.x + obs.width - padding &&
            plane.x + plane.width - padding > obs.x + padding &&
            plane.y + padding < obs.y + obs.height - padding &&
            plane.y + plane.height - padding > obs.y + padding
        ) {
            addParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.type === 'bonus' ? '#69f0ae' : '#ff9800', 12);
            if (obs.type === 'lightning') {
                if (shieldActive) {
                    shieldActive = false;
                    obstacles.splice(i, 1);
                } else {
                    lives--;
                    updateLivesDisplay();
                    obstacles.splice(i, 1);
                    if (lives <= 0) {
                        triggerGameOver();
                        return;
                    }
                }
            } else if (obs.type === 'laserEnemy') {
                if (shieldActive) {
                    shieldActive = false;
                    obstacles.splice(i, 1);
                } else {
                    score = Math.max(0, score - 5);
                    if (currentScoreEl) currentScoreEl.textContent = score;
                    obstacles.splice(i, 1);
                }
            } else {
                let gainedPoints = 0;
                if (obs.type === 'bonus') {
                    gainedPoints = doublePointsActive ? obs.points * 2 : obs.points;
                } else if (obs.type === 'shield') {
                    shieldActive = true;
                    shieldTimer = 300;
                } else if (obs.type === 'double') {
                    doublePointsActive = true;
                    doublePointsTimer = 480;
                }

                score += gainedPoints;
                if (score > highScore) {
                    highScore = score;
                    if (recordDisplayEl) recordDisplayEl.textContent = highScore;
                }

                if (currentScoreEl) currentScoreEl.textContent = score;
                obstacles.splice(i, 1);
            }
            continue;
        }

        if (obs.y > canvas.height) {
            if (obs.type === 'lightning') {
                let gainedPoints = doublePointsActive ? 2 : 1;
                score += gainedPoints;
                if (score > highScore) {
                    highScore = score;
                    if (recordDisplayEl) recordDisplayEl.textContent = highScore;
                }
                if (currentScoreEl) currentScoreEl.textContent = score;
            }
            obstacles.splice(i, 1);
        }
    }

    draw();
    requestAnimationFrame(updateGame);
}

function triggerGameOver() {
    gameRunning = false;
    
    if (score > highScore) highScore = score;
    localStorage.setItem('sky_ace_highscore', highScore);

    // Salva i punti di questa partita nel totale cumulativo dell'Hangar
    totalLifetimeScore += score;
    localStorage.setItem('sky_ace_total_score', totalLifetimeScore);

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (saveScoreSection) saveScoreSection.classList.remove('hidden'); 
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');    
    fetchLeaderboard(); 
}

async function fetchLeaderboard(highlightName = null, highlightScore = null) {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let scores = data.record.scores || [];
        scores.sort((a, b) => b.score - a.score);

        if (leaderboardList) {
            leaderboardList.innerHTML = '';
            scores.forEach((entry, index) => {
                let li = document.createElement('li');
                li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score} pts</span>`;
                if (highlightName && entry.name === highlightName && entry.score === highlightScore) {
                    li.classList.add('highlight');
                }
                leaderboardList.appendChild(li);
            });
        }
    } catch (error) {}
}

if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        let name = playerNameInput ? playerNameInput.value.trim() : "Pilota Anonimo";
        if (!name) name = "Pilota Anonimo";
        saveBtn.disabled = true;
        saveBtn.textContent = "Salvataggio...";

        try {
            let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            let data = await response.json();
            let scores = data.record.scores || [];
            scores.push({ name: name, score: score });

            await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify({ scores: scores, latestVersion: CURRENT_VERSION })
            });

            if (saveScoreSection) saveScoreSection.classList.add("hidden"); 
            fetchLeaderboard(name, score); 
        } catch (error) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salva in Classifica";
        }
    });
}

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (saveScoreSection) saveScoreSection.classList.remove('hidden');
        if (playerNameInput) playerNameInput.value = '';
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salva in Classifica";
        }
        startGame();
    });
}

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (saveScoreSection) saveScoreSection.classList.remove('hidden');
        if (playerNameInput) playerNameInput.value = '';
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salva in Classifica";
        }
        gameStarted = false;
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

async function checkForUpdates() {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let onlineVersion = data.record.latestVersion || "1.0";
        let lastUpdatedVersion = localStorage.getItem('sky_ace_updated_version');

        if (onlineVersion !== CURRENT_VERSION && onlineVersion !== lastUpdatedVersion) {
            if (updatePopup) updatePopup.classList.remove('hidden');
        }
    } catch (error) {}
}

if (updateActionBtn) {
    updateActionBtn.addEventListener('click', async () => {
        try {
            let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            let data = await response.json();
            let onlineVersion = data.record.latestVersion || CURRENT_VERSION;
            localStorage.setItem('sky_ace_updated_version', onlineVersion);
        } catch(e) {}
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    });
}

draw();
checkForUpdates().catch(err => console.log("Controllo aggiornamenti non disponibile."));
