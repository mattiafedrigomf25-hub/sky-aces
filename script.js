// --- CONFIGURAZIONE & RESET FORZATO v4.1 ---
const CURRENT_GAME_VERSION = "4.4";
const BIN_ID = '6ac4b87cffd5d1605351f58d';
const MASTER_KEY = '$2a$10$aplyk/beh6fEjv43q.yWK.yNbASVpWB2lHxQ8.O3c9aj0.zzW4Kuu';

const SAVE_DATA_VERSION = "reset_v4.1_absolute";

// Pulizia profonda locale dei vecchi record
if (localStorage.getItem('sky_ace_save_version') !== SAVE_DATA_VERSION) {
    localStorage.removeItem('sky_ace_total_score');
    localStorage.removeItem('sky_ace_highscore');
    localStorage.removeItem('sky_ace_unlocked');
    localStorage.removeItem('sky_ace_selected_id');
    localStorage.removeItem('sky_ace_max_world');
    localStorage.setItem('sky_ace_max_world', '1');
    localStorage.setItem('sky_ace_save_version', SAVE_DATA_VERSION);
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
}

// --- DEFINIZIONE STRUTTURATA DEI 10 MONDI E DEI VELIVOLI (BILANCIATA SU 90s) ---
const WORLDS_DATA = [
    { world: 1, name: "Training Skies", emoji: "✈️", planeName: "Aereo Standard", targetScore: 120, speed: 6, lives: 3, perk: "Bilanciato", shootType: "single" },
    { world: 2, name: "Storm Valley", emoji: "🛩️", planeName: "Caccia Agile", targetScore: 200, speed: 8, lives: 2, perk: "Velocità +33% / Vita -1", shootType: "single" },
    { world: 3, name: "Neon City", emoji: "🛫", planeName: "Doppio Cannone", targetScore: 300, speed: 6.5, lives: 3, perk: "Doppio Sparo di Base", shootType: "double" },
    { world: 4, name: "Canyon Run", emoji: "🚁", planeName: "Girocottero", targetScore: 420, speed: 7, lives: 4, perk: "Scudo +1 Vita Extra", shootType: "single" },
    { world: 5, name: "Asteroid Field", emoji: "🛬", planeName: "Interceptor", targetScore: 560, speed: 6.5, lives: 3, perk: "Triplo Sparo Nativo", shootType: "triple" },
    { world: 6, name: "Volcano Alley", emoji: "🛸", planeName: "Stealth Jet", targetScore: 720, speed: 7.5, lives: 3, perk: "Magnete Bonus integrato", shootType: "double" },
    { world: 7, name: "Frozen Peaks", emoji: "⚡", planeName: "Thunderbolt", targetScore: 900, speed: 8.5, lives: 3, perk: "Ricarica Fuoco Rapido", shootType: "triple" },
    { world: 8, name: "Orbital Station", emoji: "🛡️", planeName: "Dreadnought", targetScore: 1100, speed: 5.5, lives: 5, perk: "Corazzato 5 Vite Base", shootType: "double" },
    { world: 9, name: "Deep Nebula", emoji: "🌌", planeName: "Aero-Phantasm", targetScore: 1300, speed: 8, lives: 4, perk: "Sparo Quadruplo", shootType: "quad" },
    { world: 10, name: "Core Final Bastion", emoji: "👑", planeName: "Sky Ace Supreme", targetScore: 1500, speed: 9, lives: 5, perk: "Potenza e Agilità Massima", shootType: "quad" }
];

let pilotId = localStorage.getItem('sky_ace_pilot_name') || "";
let highScore = 0; 
let maxWorldReached = parseInt(localStorage.getItem('sky_ace_max_world')) || 1;
let selectedWorldIndex = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const currentScoreEl = document.getElementById('current-score');
const livesEl = document.getElementById('lives-display');
const timerDisplayEl = document.getElementById('timer-display');
const recordDisplayEl = document.getElementById('record-display');

const splashScreen = document.getElementById('splash-screen');
const splashProgressBar = document.getElementById('splash-progress-bar');
const splashProgressText = document.getElementById('splash-progress-text');

const loginScreen = document.getElementById('login-screen');
const loginPilotInput = document.getElementById('login-pilot-input');
const savePilotBtn = document.getElementById('save-pilot-btn');
const startPilotName = document.getElementById('start-pilot-name');

const downloadScreen = document.getElementById('download-screen');
const downloadProgressBar = document.getElementById('download-progress-bar');
const downloadProgressText = document.getElementById('download-progress-text');

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverReason = document.getElementById('game-over-reason');
const finalScoreEl = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');
const saveBtn = document.getElementById('save-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const saveScoreSection = document.getElementById('save-score-section');

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownText = document.getElementById('countdown-text');

const pauseBtn = document.getElementById('pause-btn');
const pausePopup = document.getElementById('pause-popup');
const resumeBtn = document.getElementById('resume-btn');
const pauseToMenuBtn = document.getElementById('pause-to-menu-btn');

const restartPromptBtn = document.getElementById('restart-prompt-btn');
const restartConfirmPopup = document.getElementById('restart-confirm-popup');
const confirmRestartBtn = document.getElementById('confirm-restart-btn');
const restartToMenuBtn = document.getElementById('restart-to-menu-btn');
const cancelRestartBtn = document.getElementById('cancel-restart-btn');

const openPlaneModalBtn = document.getElementById('open-plane-modal-btn');
const closePlaneModalBtn = document.getElementById('close-plane-modal-btn');
const planeModal = document.getElementById('plane-modal');
const planeGrid = document.getElementById('plane-grid');
const displayPilotId = document.getElementById('display-pilot-id');
const changePilotIdBtn = document.getElementById('change-pilot-id-btn');

const updatePopup = document.getElementById('update-popup');
const updateActionBtn = document.getElementById('update-action-btn');
const changelogList = document.getElementById('changelog-list');
const changelogTitle = document.getElementById('changelog-title');
const currentVersionLabel = document.getElementById('current-version-label');

const mobilePauseBtn = document.getElementById('mobile-pause-btn');
const mobileRestartBtn = document.getElementById('mobile-restart-btn');

const mainExitBtn = document.getElementById('main-exit-btn');
const goodbyeScreen = document.getElementById('goodbye-screen');
const goodbyeMessage = document.getElementById('goodbye-message');

function triggerGameExit() {
    gameRunning = false; gameStarted = false; gamePaused = false;
    updateMobileControlsVisibility(false);
    if (startScreen) startScreen.classList.add('hidden');
    if (goodbyeMessage) goodbyeMessage.textContent = `Grazie per aver volato con noi, Comandante ${pilotId || 'Pilota'}! A presto. 👋`;
    if (goodbyeScreen) goodbyeScreen.classList.remove('hidden');
    try { window.close(); } catch (e) {}
}

if (mainExitBtn) mainExitBtn.addEventListener('click', triggerGameExit);

if (mobilePauseBtn) {
    mobilePauseBtn.addEventListener('click', (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (!gameStarted || isCountdownActive) return;
        gamePaused = true;
        if (pausePopup) pausePopup.classList.remove('hidden');
    });
}

if (mobileRestartBtn) {
    mobileRestartBtn.addEventListener('click', (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (!gameStarted || isCountdownActive) return;
        gamePaused = true;
        if (restartConfirmPopup) restartConfirmPopup.classList.remove('hidden');
    });
}

if (currentVersionLabel) currentVersionLabel.textContent = CURRENT_GAME_VERSION;

let onlineVersionToInstall = null;
if (recordDisplayEl) recordDisplayEl.textContent = highScore;

function saveLocalProgress() {
    localStorage.setItem('sky_ace_highscore', highScore);
    localStorage.setItem('sky_ace_max_world', maxWorldReached);
    if (pilotId) localStorage.setItem('sky_ace_pilot_name', pilotId);
}

async function loadProgressFromCloud() {
    if (!pilotId) return;
    const normalizedPilotId = pilotId.trim().toLowerCase();

    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let record = data.record || {};

        if (record.pilots && record.pilots[normalizedPilotId]) {
            let pData = record.pilots[normalizedPilotId];
            highScore = Math.max(highScore, pData.highScore || 0);
            maxWorldReached = Math.max(maxWorldReached, pData.maxWorldReached || 1);
            saveLocalProgress();
        }
    } catch (error) {}

    if (recordDisplayEl) recordDisplayEl.textContent = highScore;
}

async function saveProgressToCloud() {
    saveLocalProgress();
    if (!pilotId) return;
    const normalizedPilotId = pilotId.trim().toLowerCase();

    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let record = data.record || {};

        if (!record.pilots) record.pilots = {};
        let existing = record.pilots[normalizedPilotId] || {};

        record.pilots[normalizedPilotId] = {
            highScore: Math.max(highScore, existing.highScore || 0),
            maxWorldReached: Math.max(maxWorldReached, existing.maxWorldReached || 1)
        };

        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
            body: JSON.stringify(record)
        });
    } catch (error) {}
}

let particles = [];
function addParticles(x, y, color = '#ffd54f', count = 12) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1.5,
            color: color, alpha: 1, decay: Math.random() * 0.03 + 0.02
        });
    }
}

let plane = {
    x: canvas ? canvas.width / 2 - 20 : 180,
    y: canvas ? canvas.height - 80 : 520,
    width: 40, height: 40,
    speed: 6, emoji: '✈️'
};

let obstacles = [];
let enemyLasers = [];
let playerLasers = [];
let shootCooldown = 0;
let obstacleTimer = 0;
let spawnRate = 32; 
let gameSpeed = 3;
let score = 0; 
let lives = 3;
let gameStarted = false; 
let gameRunning = false; 
let gamePaused = false;
let isCountdownActive = false;
let subLevelTimer = 0;

let currentSubLevel = 1;
let bossActive = false;
let boss = {
    x: canvas ? canvas.width / 2 - 40 : 160,
    y: 40, width: 70, height: 60,
    health: 50, maxHealth: 50,
    speed: 2.5, direction: 1,
    shootTimer: 0, emoji: '🛸'
};

let shieldActive = false;
let shieldTimer = 0;
let doublePointsActive = false;
let doublePointsTimer = 0;
let tripleShotActive = false;
let tripleShotTimer = 0;

let pendingShieldBonus = false;

let keys = { ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    if (e.key === ' ' && !gameStarted && planeModal.classList.contains('hidden') && pausePopup.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameRunning && !gamePaused && !isCountdownActive) {
        gamePaused = true;
        if (pausePopup) pausePopup.classList.remove('hidden');
    }
});

async function runInitialLoading() {
    let progress = 0;
    let interval = setInterval(() => {
        progress += 25;
        if (splashProgressBar) splashProgressBar.style.width = progress + '%';
        if (splashProgressText) splashProgressText.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (splashScreen) splashScreen.classList.add('hidden');
                proceedToGameOrLogin();
                checkForGameUpdates(); // Controllo aggiornamenti all'avvio
            }, 200);
        }
    }, 40);
}

async function proceedToGameOrLogin() {
    if (!pilotId) {
        if (loginScreen) loginScreen.classList.remove('hidden');
    } else {
        if (startPilotName) startPilotName.textContent = pilotId;
        await loadProgressFromCloud();
        if (startScreen) startScreen.classList.remove('hidden');
    }
}

if (savePilotBtn) {
    savePilotBtn.addEventListener('click', async () => {
        let name = loginPilotInput ? loginPilotInput.value.trim() : "";
        if (!name) return alert("Inserisci un Nome Pilota valido!");
        pilotId = name;
        localStorage.setItem('sky_ace_pilot_name', pilotId);
        if (startPilotName) startPilotName.textContent = pilotId;
        if (playerNameInput) playerNameInput.value = pilotId;
        
        savePilotBtn.disabled = true;
        await loadProgressFromCloud();
        savePilotBtn.disabled = false;
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (!gameStarted || isCountdownActive) return;
        gamePaused = true;
        if (pausePopup) pausePopup.classList.remove('hidden');
    });
}

if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
        if (pausePopup) pausePopup.classList.add('hidden');
        runCountdown(() => { gamePaused = false; updateGame(); });
    });
}

if (pauseToMenuBtn) {
    pauseToMenuBtn.addEventListener('click', () => {
        gamePaused = false; gameRunning = false; gameStarted = false;
        updateMobileControlsVisibility(false);
        if (pausePopup) pausePopup.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

if (restartPromptBtn) {
    restartPromptBtn.addEventListener('click', () => {
        if (!gameStarted || isCountdownActive) return;
        gamePaused = true;
        if (restartConfirmPopup) restartConfirmPopup.classList.remove('hidden');
    });
}

if (cancelRestartBtn) {
    cancelRestartBtn.addEventListener('click', () => {
        gamePaused = false;
        if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
        if (gameRunning) updateGame();
    });
}

if (confirmRestartBtn) {
    confirmRestartBtn.addEventListener('click', () => {
        gamePaused = false;
        if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        startGame();
    });
}

if (restartToMenuBtn) {
    restartToMenuBtn.addEventListener('click', () => {
        gamePaused = false; gameRunning = false; gameStarted = false;
        updateMobileControlsVisibility(false);
        if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

const mobileControls = document.getElementById('mobile-controls');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function updateMobileControlsVisibility(show) {
    if (!mobileControls) return;
    if (!isMobileDevice()) {
        mobileControls.classList.remove('in-game-active');
        return;
    }
    if (show) mobileControls.classList.add('in-game-active');
    else mobileControls.classList.remove('in-game-active');
}

function setupInstantButton(btn, keyProp) {
    if (!btn) return;
    const startAction = (e) => { if (e && e.cancelable) e.preventDefault(); keys[keyProp] = true; };
    const stopAction = (e) => { if (e && e.cancelable) e.preventDefault(); keys[keyProp] = false; };
    btn.addEventListener('touchstart', startAction, { passive: false });
    btn.addEventListener('touchend', stopAction, { passive: false });
    btn.addEventListener('touchcancel', stopAction, { passive: false });
    btn.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') startAction(e); }, { passive: false });
    btn.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch') stopAction(e); }, { passive: false });
}

setupInstantButton(leftBtn, 'ArrowLeft');
setupInstantButton(rightBtn, 'ArrowRight');

function renderPlaneGrid() {
    if (!planeGrid) return;
    planeGrid.innerHTML = '';
    
    WORLDS_DATA.forEach((wData, idx) => {
        let slot = document.createElement('div');
        let isUnlocked = wData.world <= maxWorldReached;
        let isSelected = selectedWorldIndex === idx;

        slot.className = 'plane-slot';
        if (isUnlocked) {
            slot.classList.add('unlocked');
            if (isSelected) slot.classList.add('selected');
            slot.innerHTML = `
                <div class="plane-emoji">${wData.emoji}</div>
                <div class="plane-info">
                    <strong>Mondo ${wData.world}</strong><br>
                    ${wData.planeName}<br>
                    <span style="color:#69f0ae;">Req: ${wData.targetScore} pt</span>
                </div>
            `;
            slot.onclick = () => {
                selectedWorldIndex = idx;
                renderPlaneGrid();
            };
        } else {
            slot.classList.add('locked');
            slot.innerHTML = `
                <div class="plane-emoji">🔒</div>
                <div class="plane-info">
                    Mondo ${wData.world}<br>
                    <span style="color:#e53935;">Completa Mondo ${wData.world - 1}</span>
                </div>
            `;
        }
        planeGrid.appendChild(slot);
    });
}

if (openPlaneModalBtn) {
    openPlaneModalBtn.onclick = async () => {
        await loadProgressFromCloud();
        if (displayPilotId) displayPilotId.textContent = pilotId;
        renderPlaneGrid();
        if (planeModal) planeModal.classList.remove('hidden');
    };
}

if (changePilotIdBtn) {
    changePilotIdBtn.onclick = async () => {
        let newName = prompt("Inserisci il tuo Nome Pilota:", pilotId);
        if (newName && newName.trim() !== "") {
            pilotId = newName.trim();
            localStorage.setItem('sky_ace_pilot_name', pilotId);
            if (displayPilotId) displayPilotId.textContent = pilotId;
            if (startPilotName) startPilotName.textContent = pilotId;
            if (playerNameInput) playerNameInput.value = pilotId;
            await loadProgressFromCloud();
            renderPlaneGrid();
        }
    };
}

if (closePlaneModalBtn) {
    closePlaneModalBtn.onclick = () => {
        if (planeModal) planeModal.classList.add('hidden');
    };
}

function runCountdown(onComplete) {
    isCountdownActive = true;
    let count = 3;
    if (countdownOverlay) countdownOverlay.classList.remove('hidden');
    if (countdownText) {
        countdownText.textContent = count;
        countdownText.style.fontSize = '72px';
    }

    let interval = setInterval(() => {
        count--;
        if (count > 0) {
            if (countdownText) {
                countdownText.style.animation = 'none';
                void countdownText.offsetWidth;
                countdownText.style.animation = 'popIn 0.3s ease-out';
                countdownText.textContent = count;
            }
        } else if (count === 0) {
            if (countdownText) {
                countdownText.style.animation = 'none';
                void countdownText.offsetWidth;
                countdownText.style.animation = 'popIn 0.3s ease-out';
                countdownText.style.fontSize = '32px';
                countdownText.textContent = "BUON VOLO! 🚀";
            }
        } else {
            clearInterval(interval);
            if (countdownOverlay) countdownOverlay.classList.add('hidden');
            isCountdownActive = false;
            if (onComplete) onComplete();
        }
    }, 800);
}

function startGame() {
    gameStarted = true; gameRunning = true; gamePaused = false;
    keys.ArrowLeft = false; keys.ArrowRight = false;

    if (startScreen) startScreen.classList.add('hidden');
    if (planeModal) planeModal.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (pausePopup) pausePopup.classList.add('hidden');
    if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
    
    updateMobileControlsVisibility(true);

    let activeConfig = WORLDS_DATA[selectedWorldIndex];
    plane.emoji = activeConfig.emoji;
    plane.speed = activeConfig.speed;
    plane.x = canvas.width / 2 - plane.width / 2;
    
    obstacles = []; enemyLasers = []; playerLasers = []; particles = [];
    score = 0; 
    lives = activeConfig.lives;
    gameSpeed = 3 + (activeConfig.world - 1) * 0.4;
    subLevelTimer = 0;
    obstacleTimer = 0;
    
    if (pendingShieldBonus) {
        shieldActive = true; shieldTimer = 400;
        pendingShieldBonus = false;
    } else {
        shieldActive = false;
    }
    doublePointsActive = false; tripleShotActive = false;

    currentSubLevel = 1;
    bossActive = false;
    boss.health = 40 + activeConfig.world * 15;
    boss.maxHealth = boss.health;
    boss.x = canvas.width / 2 - boss.width / 2;
    boss.y = 40;

    if (currentScoreEl) currentScoreEl.textContent = score;
    if (timerDisplayEl) timerDisplayEl.textContent = `Mondo ${activeConfig.world}-1`;
    if (recordDisplayEl) recordDisplayEl.textContent = highScore;
    updateLivesDisplay();

    runCountdown(() => { updateGame(); });
}

if (startBtn) startBtn.addEventListener('click', startGame);

function updateLivesDisplay() {
    if (livesEl) livesEl.textContent = '❤'.repeat(Math.max(0, lives));
}

function spawnObstacle() {
    if (bossActive) return;

    let rand = Math.random();
    let type, symbol, points, width, height;

    if (rand < 0.35) { type = 'lightning'; symbol = '⚡'; points = 1; width = 40; height = 30; }
    else if (rand < 0.65) { type = 'laserEnemy'; symbol = '🛩️'; points = 10; width = 40; height = 40; }
    else if (rand < 0.82) { type = 'bonus'; symbol = '🌟'; points = 5; width = 40; height = 40; }
    else if (rand < 0.90) { type = 'shield'; symbol = '🛡️'; points = 5; width = 40; height = 40; }
    else if (rand < 0.96) { type = 'tripleShot'; symbol = '🎯'; points = 8; width = 40; height = 40; }
    else { type = 'double'; symbol = '💎'; points = 10; width = 40; height = 40; }

    let x = Math.random() * (canvas.width - width);
    obstacles.push({
        x: x, y: -50, width: width, height: height,
        speed: gameSpeed + Math.random() * 1.5,
        points: points, type: type, symbol: symbol, shootTimer: 0 
    });
}

function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeConfig = WORLDS_DATA[selectedWorldIndex];

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
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(plane.x + plane.width / 2, plane.y + plane.height / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(plane.x + plane.width / 2, plane.y + plane.height / 2);
    ctx.rotate(-Math.PI / 4); 
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(plane.emoji, 0, 0);
    ctx.restore();

    for (let obs of obstacles) {
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        if (obs.type === 'laserEnemy') ctx.rotate(3 * Math.PI / 4); 
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(obs.symbol, 0, 0);
        ctx.restore();
    }

    if (bossActive) {
        ctx.save();
        ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
        ctx.font = '52px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(boss.emoji, 0, 0);
        ctx.restore();

        let barWidth = canvas.width - 60;
        let barHeight = 8;
        let barX = 30; let barY = 12;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        let healthPercent = Math.max(0, boss.health / boss.maxHealth);
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`MONDO ${activeConfig.world} - BOSS (${Math.ceil(boss.health)}/${boss.maxHealth})`, canvas.width / 2, barY + 19);
    }

    for (let laser of enemyLasers) {
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }

    for (let laser of playerLasers) {
        ctx.fillStyle = '#69f0ae';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }

    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'; ctx.shadowBlur = 4;
    ctx.fillStyle = score >= activeConfig.targetScore ? '#69f0ae' : '#ffd54f';
    ctx.fillText(`Obiettivo Mondo ${activeConfig.world}: ${score}/${activeConfig.targetScore} pt`, 15, bossActive ? 42 : 25);
    ctx.restore();
}

function updateGame() {
    if (!gameRunning) return;
    if (gamePaused || isCountdownActive) return;

    let activeConfig = WORLDS_DATA[selectedWorldIndex];
    subLevelTimer++;

    if (!bossActive) {
        if (subLevelTimer >= 800 && currentSubLevel === 1) {
            currentSubLevel = 2; subLevelTimer = 0;
            if (timerDisplayEl) timerDisplayEl.textContent = `Mondo ${activeConfig.world}-2`;
        } else if (subLevelTimer >= 950 && currentSubLevel === 2) {
            currentSubLevel = 3;
            bossActive = true;
            boss.x = canvas.width / 2 - boss.width / 2;
            boss.y = 40;
            obstacles = [];
            if (timerDisplayEl) timerDisplayEl.textContent = `Mondo ${activeConfig.world}-3 (Boss)`;
        }
    }
    
    if (shieldActive) { shieldTimer--; if (shieldTimer <= 0) shieldActive = false; }
    if (doublePointsActive) { doublePointsTimer--; if (doublePointsTimer <= 0) doublePointsActive = false; }
    if (tripleShotActive) { tripleShotTimer--; if (tripleShotTimer <= 0) tripleShotActive = false; }

    if (keys.ArrowLeft) plane.x -= plane.speed;
    if (keys.ArrowRight) plane.x += plane.speed;

    if (plane.x < 0) plane.x = 0;
    if (plane.x + plane.width > canvas.width) plane.x = canvas.width - plane.width;

    shootCooldown++;
    let cooldownTarget = activeConfig.perk.includes("Rapida") ? 14 : 20;

    if (shootCooldown > cooldownTarget) {
        let mode = tripleShotActive ? "triple" : activeConfig.shootType;

        if (mode === "single") {
            playerLasers.push({ x: plane.x + plane.width / 2 - 3, y: plane.y, width: 6, height: 14, speed: 8 });
        } else if (mode === "double") {
            playerLasers.push({ x: plane.x + 4, y: plane.y, width: 5, height: 14, speed: 8 });
            playerLasers.push({ x: plane.x + plane.width - 9, y: plane.y, width: 5, height: 14, speed: 8 });
        } else if (mode === "triple") {
            playerLasers.push({ x: plane.x + 2, y: plane.y, width: 5, height: 14, speed: 8 });
            playerLasers.push({ x: plane.x + plane.width / 2 - 2, y: plane.y - 4, width: 5, height: 14, speed: 8 });
            playerLasers.push({ x: plane.x + plane.width - 7, y: plane.y, width: 5, height: 14, speed: 8 });
        } else if (mode === "quad") {
            playerLasers.push({ x: plane.x, y: plane.y, width: 4, height: 14, speed: 9 });
            playerLasers.push({ x: plane.x + 12, y: plane.y - 4, width: 4, height: 14, speed: 9 });
            playerLasers.push({ x: plane.x + 24, y: plane.y - 4, width: 4, height: 14, speed: 9 });
            playerLasers.push({ x: plane.x + 36, y: plane.y, width: 4, height: 14, speed: 9 });
        }
        shootCooldown = 0;
    }

    for (let i = playerLasers.length - 1; i >= 0; i--) {
        playerLasers[i].y -= playerLasers[i].speed;
        if (playerLasers[i].y < 0) playerLasers.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
    }

    if (!bossActive) {
        obstacleTimer++;
        if (obstacleTimer > spawnRate) {
            spawnObstacle();
            obstacleTimer = 0;
        }
    } else {
        boss.x += boss.speed * boss.direction;
        if (boss.x <= 15 || boss.x + boss.width >= canvas.width - 15) boss.direction *= -1;

        boss.shootTimer++;
        if (boss.shootTimer > 45) {
            enemyLasers.push({ x: boss.x + 10, y: boss.y + boss.height, width: 6, height: 16, speed: 5 });
            enemyLasers.push({ x: boss.x + boss.width / 2 - 3, y: boss.y + boss.height, width: 6, height: 16, speed: 6 });
            enemyLasers.push({ x: boss.x + boss.width - 16, y: boss.y + boss.height, width: 6, height: 16, speed: 5 });
            boss.shootTimer = 0;
        }

        for (let j = playerLasers.length - 1; j >= 0; j--) {
            let pLaser = playerLasers[j];
            if (
                pLaser.x < boss.x + boss.width && pLaser.x + pLaser.width > boss.x &&
                pLaser.y < boss.y + boss.height && pLaser.y + pLaser.height > boss.y
            ) {
                addParticles(pLaser.x, pLaser.y, '#ffd54f', 6);
                boss.health -= 1;
                playerLasers.splice(j, 1);

                if (boss.health <= 0) {
                    addParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#69f0ae', 45);
                    
                    let customMsg = "";
                    let missingPoints = activeConfig.targetScore - score;

                    if (missingPoints > 0) {
                        score += missingPoints;
                        customMsg = `Boss abbattuto! Esplosione di +${missingPoints} pt Bonus per raggiungere l'obiettivo del Mondo ${activeConfig.world}!`;
                    } else {
                        score += 150;
                        pendingShieldBonus = true;
                        customMsg = `Boss dominato! +150 pt Extra ottenuti & Scudo Bonus sbloccato per il prossimo Mondo!`;
                    }

                    if (currentScoreEl) currentScoreEl.textContent = score;

                    if (activeConfig.world === maxWorldReached && maxWorldReached < 10) {
                        maxWorldReached++;
                    }
                    triggerVictory(customMsg);
                    return;
                }
                break;
            }
        }
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
            addParticles(plane.x + plane.width / 2, plane.y + plane.height / 2, '#ff1744', 12);
            if (shieldActive) { shieldActive = false; } 
            else {
                lives--; updateLivesDisplay();
                if (lives <= 0) { triggerGameOver("Nessuna vita rimasta!"); return; }
            }
            enemyLasers.splice(i, 1);
            continue;
        }
        if (enemyLasers[i].y > canvas.height) enemyLasers.splice(i, 1);
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.y += obs.speed;

        if (activeConfig.perk.includes("Magnete") && obs.type !== 'lightning' && obs.type !== 'laserEnemy') {
            if (Math.abs(obs.x - plane.x) < 100 && obs.y > plane.y - 120) {
                if (obs.x < plane.x) obs.x += 2.5;
                else if (obs.x > plane.x) obs.x -= 2.5;
            }
        }

        for (let j = playerLasers.length - 1; j >= 0; j--) {
            let pLaser = playerLasers[j];
            if (
                obs.type === 'laserEnemy' &&
                pLaser.x < obs.x + obs.width && pLaser.x + pLaser.width > obs.x &&
                pLaser.y < obs.y + obs.height && pLaser.y + pLaser.height > obs.y
            ) {
                addParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#69f0ae', 10);
                score += 10;
                if (currentScoreEl) currentScoreEl.textContent = score;
                obstacles.splice(i, 1); playerLasers.splice(j, 1);
                break;
            }
        }

        if (!obstacles[i]) continue;

        let padding = 10;
        if (
            plane.x + padding < obs.x + obs.width - padding &&
            plane.x + plane.width - padding > obs.x + padding &&
            plane.y + padding < obs.y + obs.height - padding &&
            plane.y + plane.height - padding > obs.y + padding
        ) {
            addParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#ff9800', 12);
            if (obs.type === 'lightning') {
                if (shieldActive) { shieldActive = false; } 
                else {
                    lives--; updateLivesDisplay();
                    if (lives <= 0) { triggerGameOver("Aereo distrutto dai fulmini!"); return; }
                }
            } else if (obs.type === 'laserEnemy') {
                if (shieldActive) shieldActive = false;
                else score = Math.max(0, score - 5);
            } else {
                let gainedPoints = obs.type === 'bonus' ? (doublePointsActive ? obs.points * 2 : obs.points) : 0;
                if (obs.type === 'shield') { shieldActive = true; shieldTimer = 300; }
                else if (obs.type === 'tripleShot') { tripleShotActive = true; tripleShotTimer = 800; }
                else if (obs.type === 'double') { doublePointsActive = true; doublePointsTimer = 500; }

                score += gainedPoints;
                if (currentScoreEl) currentScoreEl.textContent = score;
            }
            obstacles.splice(i, 1);
            continue;
        }

        if (obs.y > canvas.height) {
            if (obs.type === 'lightning') {
                score += doublePointsActive ? 2 : 1;
                if (currentScoreEl) currentScoreEl.textContent = score;
            }
            obstacles.splice(i, 1);
        }
    }

    draw();
    requestAnimationFrame(updateGame);
}

async function triggerVictory(customMessage = "") {
    gameRunning = false;
    updateMobileControlsVisibility(false);

    let activeConfig = WORLDS_DATA[selectedWorldIndex];
    if (score > highScore) highScore = score;

    await saveProgressToCloud();

    if (gameOverTitle) gameOverTitle.textContent = "🏆 MONDO COMPLETATO!";
    if (gameOverReason) gameOverReason.textContent = customMessage || `Hai superato il Mondo ${activeConfig.world}! Nuovo Mondo sbloccato!`;
    if (finalScoreEl) finalScoreEl.textContent = score;

    if (restartBtn) {
        restartBtn.textContent = `Passa al Mondo Successivo 🚀`;
        restartBtn.onclick = () => {
            if (selectedWorldIndex < WORLDS_DATA.length - 1 && selectedWorldIndex + 1 < maxWorldReached) {
                selectedWorldIndex++;
            }
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            if (saveScoreSection) saveScoreSection.classList.remove('hidden');
            restartBtn.disabled = false;
            startGame();
        };
    }

    if (gameOverScreen) gameOverScreen.classList.remove('hidden');
    fetchLeaderboard();
}

async function triggerGameOver(reason = "") {
    gameRunning = false;
    updateMobileControlsVisibility(false);

    if (score > highScore) highScore = score;
    await saveProgressToCloud();

    let activeConfig = WORLDS_DATA[selectedWorldIndex];

    if (gameOverTitle) gameOverTitle.textContent = "MISSIONE FALLITA";
    if (gameOverReason) gameOverReason.textContent = reason || `Punteggio finale: ${score}`;
    if (finalScoreEl) finalScoreEl.textContent = score;

    if (restartBtn) {
        restartBtn.textContent = `Ripeti Mondo ${activeConfig.world} 🔄`;
        restartBtn.onclick = () => {
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            if (saveScoreSection) saveScoreSection.classList.remove('hidden');
            restartBtn.disabled = false;
            startGame();
        };
    }

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
        let name = playerNameInput ? playerNameInput.value.trim() : (pilotId || "Pilota Anonimo");
        if (!name) name = "Pilota Anonimo";
        saveBtn.disabled = true; saveBtn.textContent = "Salvataggio...";

        try {
            let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            let data = await response.json();
            let record = data.record || {};
            let scores = record.scores || [];
            scores.push({ name: name, score: score });
            record.scores = scores;

            await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
                body: JSON.stringify(record)
            });

            if (saveScoreSection) saveScoreSection.classList.add("hidden"); 
            fetchLeaderboard(name, score); 
        } catch (error) {
            saveBtn.disabled = false; saveBtn.textContent = "Salva in Classifica";
        }
    });
}

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (saveScoreSection) saveScoreSection.classList.remove('hidden');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Salva in Classifica"; }
        gameStarted = false; gameRunning = false;
        updateMobileControlsVisibility(false);
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

// --- CONTROLLO AGGIORNAMENTI & POP-UP CHANGELOG CLOUD (ANTI-CACHE MOBILE) ---
async function checkForGameUpdates() {
    try {
        let antiCacheUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest?_t=${new Date().getTime()}`;
        
        let response = await fetch(antiCacheUrl, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        
        let record = data.record || {};
        let cloudVersion = record.latestVersion || "4.1";
        let lastSeenVersion = localStorage.getItem('sky_ace_acknowledged_version') || "4.1";

        if (cloudVersion !== CURRENT_GAME_VERSION && cloudVersion !== lastSeenVersion) {
            onlineVersionToInstall = cloudVersion;
            if (changelogTitle) changelogTitle.textContent = `Aggiornamento Disponibile: v${cloudVersion}`;
            
            if (changelogList && record.changelog) {
                changelogList.innerHTML = '';
                record.changelog.forEach(item => {
                    let li = document.createElement('li');
                    li.innerHTML = `<strong>[${item.category}]</strong> ${item.description}`;
                    changelogList.appendChild(li);
                });
            }

            if (updatePopup) updatePopup.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Errore controllo aggiornamenti:", error);
    }
}

// Funzione di esecuzione aggiornamento forzata
function executeGameUpdate(e) {
    if (e && e.cancelable) e.preventDefault();
    if (e) e.stopPropagation();

    // 1. Salva subito la versione approvata
    if (onlineVersionToInstall) {
        localStorage.setItem('sky_ace_acknowledged_version', onlineVersionToInstall);
    } else {
        localStorage.setItem('sky_ace_acknowledged_version', '4.3');
    }

    // 2. Nascondi subito il pop-up a schermo
    if (updatePopup) {
        updatePopup.classList.add('hidden');
        updatePopup.style.display = 'none';
    }

    // 3. Ricarica la pagina forzando l'aggiornamento
    setTimeout(() => {
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    }, 100);
}

if (updateActionBtn) {
    // Sostituiamo con gestione eventi diretta sia per Mobile che per Desktop
    updateActionBtn.onclick = executeGameUpdate;
    updateActionBtn.addEventListener('touchstart', executeGameUpdate, { passive: false });
}
draw();
runInitialLoading();
