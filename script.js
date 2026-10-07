const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const totalScoreHudEl = document.getElementById('total-score-hud');
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

// Versione attuale del gioco in locale
const CURRENT_VERSION = "1.5"; 

// Credenziali Cloud jsonbin.io
const BIN_ID = '6ac4b87cffd5d1605351f58d';
const MASTER_KEY = '$2a$10$aplyk/beh6fEjv43q.yWK.yNbASVpWB2lHxQ8.O3c9aj0.zzW4Kuu';

// Definizione dei 10 aerei con icone coerenti e punteggi incrementali cumulativi
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

// Gestione Punti Totali Cumulativi e Sblocco Aerei
let totalLifetimeScore = parseInt(localStorage.getItem('sky_ace_total_score')) || 0;
let unlockedPlanes = JSON.parse(localStorage.getItem('sky_ace_unlocked')) || [0]; 
let selectedPlaneId = parseInt(localStorage.getItem('sky_ace_selected_id')) || 0;

if (totalScoreHudEl) {
    totalScoreHudEl.textContent = totalLifetimeScore;
}

// Web Audio API per suoni arcade retrò
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    try {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        let now = audioCtx.currentTime;
        if (type === 'bonus') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'shield') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'laser') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.6);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
        }
    } catch(e) {}
}

let plane = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
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

// --- GESTIONE INPUT TASTIERA ---
window.addEventListener('keydown', (e) => {
    initAudio();
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    
    if (e.key === ' ' && !gameStarted && planeModal.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
});

// --- GESTIONE INPUT TOUCH / MOBILE (Virtual Joystick & Pulsanti) ---
let joystick = {
    active: false,
    identifier: null,
    startX: 0,
    startY: 0,
    vx: 0
};

const vJoystickEl = document.getElementById('virtualJoystick');
const knobEl = document.getElementById('joystickKnob');

if (vJoystickEl) {
    vJoystickEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        initAudio();
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
    knobEl.style.transform = `translate(${dx}px, 0px)`;
    joystick.vx = dx / maxDist;
}

// Pulsanti touch dedicati opzionali
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

if (leftBtn && rightBtn) {
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); keys.ArrowLeft = true; });
    leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowLeft = false; });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); keys.ArrowRight = true; });
    rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.ArrowRight = false; });
}

// Mostra i controlli touch se è un dispositivo mobile
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    let mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) mobileControls.style.display = 'flex';
}

// --- GESTIONE MODALE E SBLOCCO AEREI (10 Aerei) ---
function renderPlaneGrid() {
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
                playSound('bonus');
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

openPlaneModalBtn.onclick = () => {
    renderPlaneGrid();
    let totalScoreDisplay = document.getElementById('total-score-display');
    if (!totalScoreDisplay) {
        totalScoreDisplay = document.createElement('p');
        totalScoreDisplay.id = 'total-score-display';
        totalScoreDisplay.style.color = '#ffd54f';
        totalScoreDisplay.style.fontSize = '15px';
        totalScoreDisplay.style.margin = '5px 0 15px 0';
        totalScoreDisplay.style.fontWeight = 'bold';
        let modalTitle = planeModal.querySelector('h2');
        if (modalTitle) modalTitle.after(totalScoreDisplay);
    }
    totalScoreDisplay.textContent = `Punti Totali Accumulati: ${totalLifetimeScore} pt`;
    planeModal.classList.remove('hidden');
};

closePlaneModalBtn.onclick = () => {
    planeModal.classList.add('hidden');
};

function startGame() {
    initAudio();
    gameStarted = true;
    gameRunning = true;
    startScreen.classList.add('hidden');
    planeModal.classList.add('hidden');
    
    plane.x = canvas.width / 2 - plane.width / 2;
    obstacles = [];
    enemyLasers = [];
    score = 0;
    lives = 3;
    gameSpeed = 3;
    survivalTime = 0;
    obstacleTimer = 0;
    shieldActive = false;
    doublePointsActive = false;
    
    currentScoreEl.textContent = score;
    if (totalScoreHudEl) totalScoreHudEl.textContent = totalLifetimeScore;
    updateLivesDisplay();

    updateGame();
}

startBtn.addEventListener('click', startGame);

function updateLivesDisplay() {
    if (livesEl) livesEl.textContent = '❤'.repeat(Math.max(0, lives));
}

function spawnObstacle() {
    let rand = Math.random();
    let type, symbol, points, width, height;

    if (rand < 0.45) {
        type = 'lightning';
        symbol = '⚡';
        points = 1;
        width = 40;
        height = 30;
    } else if (rand < 0.65) {
        type = 'laserEnemy'; 
        symbol = '🛩️';
        points = -5;
        width = 40;
        height = 40;
    } else if (rand < 0.80) {
        type = 'bonus';
        symbol = '🌟';
        points = 3;
        width = 40;
        height = 40;
    } else if (rand < 0.92) {
        type = 'shield';
        symbol = '🛡️';
        points = 5;
        width = 40;
        height = 40;
    } else {
        type = 'double';
        symbol = '💎';
        points = 10;
        width = 40;
        height = 40;
    }
    
    let x = Math.random() * (canvas.width - width);
    
    obstacles.push({
        x: x,
        y: -50,
        width: width,
        height: height,
        speed: gameSpeed + (type === 'laserEnemy' ? 0.3 : Math.random() * 1.5),
        points: points,
        type: type,
        symbol: symbol,
        shootTimer: 0 
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        if (obs.type === 'laserEnemy') {
            ctx.rotate(3 * Math.PI / 4);
        }
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
    gameSpeed = 3 + Math.floor(survivalTime / 1000) * 0.1; 
    spawnRate = Math.max(25, 40 - Math.floor(survivalTime / 400) * 2); 
    
    if (survivalTime % 400 === 0) windForce = (Math.random() - 0.5) * 2;
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
    if (joystick.active) {
        plane.x += joystick.vx * plane.speed;
    }
    plane.x += windForce;

    if (plane.x < 0) plane.x = 0;
    if (plane.x + plane.width > canvas.width) plane.x = canvas.width - plane.width;

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
            if (shieldActive) {
                playSound('shield');
                shieldActive = false;
            } else {
                playSound('hit');
                score = Math.max(0, score - 5);
                currentScoreEl.textContent = score;
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
                playSound('laser');
                enemyLasers.push({
                    x: obs.x + obs.width / 2 - 3,
                    y: obs.y + obs.height,
                    width: 6,
                    height: 16,
                    speed: 6
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
            if (obs.type === 'lightning') {
                if (shieldActive) {
                    playSound('shield');
                    shieldActive = false;
                    obstacles.splice(i, 1);
                } else {
                    lives--;
                    updateLivesDisplay();
                    playSound('hit');
                    obstacles.splice(i, 1);
                    if (lives <= 0) {
                        playSound('gameover');
                        triggerGameOver();
                        return;
                    }
                }
            } else if (obs.type === 'laserEnemy') {
                if (shieldActive) {
                    playSound('shield');
                    shieldActive = false;
                    obstacles.splice(i, 1);
                } else {
                    playSound('hit');
                    score = Math.max(0, score - 5);
                    currentScoreEl.textContent = score;
                    obstacles.splice(i, 1);
                }
            } else {
                if (obs.type === 'bonus') {
                    playSound('bonus');
                    score += doublePointsActive ? obs.points * 2 : obs.points;
                } else if (obs.type === 'shield') {
                    playSound('shield');
                    shieldActive = true;
                    shieldTimer = 300;
                } else if (obs.type === 'double') {
                    playSound('bonus');
                    doublePointsActive = true;
                    doublePointsTimer = 480;
                }
                currentScoreEl.textContent = score;
                obstacles.splice(i, 1);
            }
            continue;
        }

        if (obs.y > canvas.height) {
            if (obs.type === 'lightning') {
                score += doublePointsActive ? 2 : 1;
                currentScoreEl.textContent = score;
            }
            obstacles.splice(i, 1);
        }
    }

    draw();
    requestAnimationFrame(updateGame);
}

function triggerGameOver() {
    gameRunning = false;
    finalScoreEl.textContent = score;
    totalLifetimeScore += score;
    localStorage.setItem('sky_ace_total_score', totalLifetimeScore);
    if (totalScoreHudEl) totalScoreHudEl.textContent = totalLifetimeScore;

    saveScoreSection.classList.remove('hidden'); 
    gameOverScreen.classList.remove('hidden');    
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

        leaderboardList.innerHTML = '';
        scores.forEach((entry, index) => {
            let li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score} pts</span>`;
            if (highlightName && entry.name === highlightName && entry.score === highlightScore) {
                li.classList.add('highlight');
            }
            leaderboardList.appendChild(li);
        });
    } catch (error) {}
}

saveBtn.addEventListener('click', async () => {
    let name = playerNameInput.value.trim() || "Pilota Anonimo";
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

        saveScoreSection.classList.add("hidden"); 
        fetchLeaderboard(name, score); 
    } catch (error) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Salva in Classifica";
    }
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    saveScoreSection.classList.remove('hidden');
    playerNameInput.value = '';
    saveBtn.disabled = false;
    saveBtn.textContent = "Salva in Classifica";
    startGame();
});

// --- CONTROLLO AGGIORNAMENTI ---
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
        } else {
            if (updatePopup) updatePopup.classList.add('hidden');
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
            let onlineVersion = data.record.latestVersion || "1.5";
            localStorage.setItem('sky_ace_updated_version', onlineVersion);
        } catch(e) {}
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    });
}

checkForUpdates();
draw();