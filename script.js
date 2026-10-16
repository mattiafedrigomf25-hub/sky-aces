// --- COSTANTI DI CONFIGURAZIONE E VERSIONING ---
const CURRENT_GAME_VERSION = "3.8";
const BIN_ID = '6ac4b87cffd5d1605351f58d';
const MASTER_KEY = '$2a$10$aplyk/beh6fEjv43q.yWK.yNbASVpWB2lHxQ8.O3c9aj0.zzW4Kuu';

// --- CONTROLLO VERSIONE SALVATAGGI (FORZATURA RESET PER TUTTI) ---
const SAVE_DATA_VERSION = "reset_v3.6"; 

if (localStorage.getItem('sky_ace_save_version') !== SAVE_DATA_VERSION) {
    localStorage.removeItem('sky_ace_total_score');
    localStorage.removeItem('sky_ace_highscore');
    localStorage.removeItem('sky_ace_unlocked');
    localStorage.removeItem('sky_ace_selected_id');
    localStorage.setItem('sky_ace_save_version', SAVE_DATA_VERSION);
}

// --- ELEMENTI PRINCIPALI E CANVAS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const currentScoreEl = document.getElementById('current-score');
const livesEl = document.getElementById('lives-display');

// --- ELEMENTI SCHERMATA DI USCITA / ARRIVEDERCI ---
const mainExitBtn = document.getElementById('main-exit-btn');
const goodbyeScreen = document.getElementById('goodbye-screen');
const goodbyeMessage = document.getElementById('goodbye-message');

function triggerGameExit() {
    gameRunning = false;
    gameStarted = false;
    gamePaused = false;
    
    updateMobileControlsVisibility(false);

    if (startScreen) startScreen.classList.add('hidden');
    if (pausePopup) pausePopup.classList.add('hidden');
    if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (planeModal) planeModal.classList.add('hidden');
    if (updatePopup) updatePopup.classList.add('hidden');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (splashScreen) splashScreen.classList.add('hidden');
    if (downloadScreen) downloadScreen.classList.add('hidden');

    if (goodbyeMessage) {
        goodbyeMessage.textContent = `Grazie per aver volato con noi, Comandante ${pilotId || 'Pilota'}! A presto. 👋`;
    }

    if (goodbyeScreen) goodbyeScreen.classList.remove('hidden');

    try {
        window.close();
    } catch (e) {}
}

if (mainExitBtn) {
    mainExitBtn.addEventListener('click', triggerGameExit);
}

// Schermate Principali
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
const finalScoreEl = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');
const saveBtn = document.getElementById('save-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const saveScoreSection = document.getElementById('save-score-section');

// Elementi Countdown Overlay
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownText = document.getElementById('countdown-text');

// Elementi In-Game
const inGameButtons = document.getElementById('in-game-buttons');
const pauseBtn = document.getElementById('pause-btn');
const pausePopup = document.getElementById('pause-popup');
const resumeBtn = document.getElementById('resume-btn');
const pauseToMenuBtn = document.getElementById('pause-to-menu-btn');

const restartPromptBtn = document.getElementById('restart-prompt-btn');
const restartConfirmPopup = document.getElementById('restart-confirm-popup');
const confirmRestartBtn = document.getElementById('confirm-restart-btn');
const restartToMenuBtn = document.getElementById('restart-to-menu-btn');
const cancelRestartBtn = document.getElementById('cancel-restart-btn');

// Hangar e Update
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

if (currentVersionLabel) currentVersionLabel.textContent = CURRENT_GAME_VERSION;

if (inGameButtons) {
    inGameButtons.style.display = 'flex';
}

let onlineVersionToInstall = null;

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

// --- GESTIONE PILOTA ED ISOLAMENTO LOCALE DEI PROGRESSI ---
let pilotId = localStorage.getItem('sky_ace_pilot_name') || "";

let totalLifetimeScore = parseInt(localStorage.getItem('sky_ace_total_score')) || 0;
let highScore = parseInt(localStorage.getItem('sky_ace_highscore')) || 0;
let unlockedPlanes = JSON.parse(localStorage.getItem('sky_ace_unlocked')) || [0]; 
let selectedPlaneId = parseInt(localStorage.getItem('sky_ace_selected_id')) || 0;

let timerDisplayEl = document.getElementById('timer-display');
let recordDisplayEl = document.getElementById('record-display');
if (recordDisplayEl) recordDisplayEl.textContent = highScore;

// --- SALVATAGGIO PROGRESSI LOCALE ED ISOLATO PER PILOTA NEL CLOUD ---
function saveLocalProgress() {
    localStorage.setItem('sky_ace_total_score', totalLifetimeScore);
    localStorage.setItem('sky_ace_highscore', highScore);
    localStorage.setItem('sky_ace_unlocked', JSON.stringify(unlockedPlanes));
    localStorage.setItem('sky_ace_selected_id', selectedPlaneId);
    if (pilotId) {
        localStorage.setItem('sky_ace_pilot_name', pilotId);
    }
}

async function saveProgressToCloud() {
    saveLocalProgress();
    if (!pilotId) return;

    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let record = data.record || {};

        if (!record.pilots) record.pilots = {};

        record.pilots[pilotId] = {
            totalLifetimeScore: totalLifetimeScore,
            highScore: highScore,
            unlockedPlanes: unlockedPlanes,
            selectedPlaneId: selectedPlaneId
        };

        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(record)
        });
    } catch (error) {}
}

async function loadProgressFromCloud() {
    if (!pilotId) return;

    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let record = data.record || {};

        if (record.pilots && record.pilots[pilotId]) {
            let pData = record.pilots[pilotId];
            totalLifetimeScore = pData.totalLifetimeScore || 0;
            highScore = pData.highScore || 0;
            unlockedPlanes = pData.unlockedPlanes || [0];
            selectedPlaneId = pData.selectedPlaneId || 0;
            saveLocalProgress();
        } else {
            totalLifetimeScore = parseInt(localStorage.getItem('sky_ace_total_score')) || 0;
            highScore = parseInt(localStorage.getItem('sky_ace_highscore')) || 0;
            unlockedPlanes = JSON.parse(localStorage.getItem('sky_ace_unlocked')) || [0];
            selectedPlaneId = parseInt(localStorage.getItem('sky_ace_selected_id')) || 0;
        }

        if (recordDisplayEl) recordDisplayEl.textContent = highScore;
        if (plane && PLANES_DATA[selectedPlaneId]) {
            plane.emoji = PLANES_DATA[selectedPlaneId].emoji;
        }
    } catch (error) {
        totalLifetimeScore = parseInt(localStorage.getItem('sky_ace_total_score')) || 0;
        highScore = parseInt(localStorage.getItem('sky_ace_highscore')) || 0;
        unlockedPlanes = JSON.parse(localStorage.getItem('sky_ace_unlocked')) || [0];
        selectedPlaneId = parseInt(localStorage.getItem('sky_ace_selected_id')) || 0;
    }
}

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
    x: canvas ? canvas.width / 2 - 20 : 180,
    y: canvas ? canvas.height - 80 : 520,
    width: 40, 
    height: 40,
    speed: 6,
    emoji: '✈️'
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
let gamePaused = false;
let isCountdownActive = false;
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
    if (e.key === ' ' && !gameStarted && planeModal.classList.contains('hidden') && pausePopup.classList.contains('hidden') && restartConfirmPopup.classList.contains('hidden') && updatePopup.classList.contains('hidden') && splashScreen.classList.contains('hidden') && loginScreen.classList.contains('hidden')) {
        e.preventDefault();
        startGame();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
});

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
}

// --- GESTIONE PAUSA CON VISIBILITY CHANGE ---
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameRunning && !gamePaused && !isCountdownActive) {
        gamePaused = true;
        if (pausePopup) pausePopup.classList.remove('hidden');
    }
});

// --- SEQUENZA DI AVVIO ---
async function runInitialLoading() {
    let progress = 0;
    
    let interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(async () => {
                if (splashScreen) splashScreen.classList.add('hidden');
                
                let hasUpdate = await checkForUpdates();
                if (!hasUpdate) {
                    proceedToGameOrLogin();
                }
            }, 200);
        }
        if (splashProgressBar) splashProgressBar.style.width = progress + '%';
        if (splashProgressText) splashProgressText.textContent = progress + '%';
    }, 50);
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

// --- CONTROLLO AGGIORNAMENTI ONLINE ---
async function checkForUpdates() {
    try {
        let response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        let data = await response.json();
        let onlineVersion = data.record.latestVersion || CURRENT_GAME_VERSION;
        let changelogItems = data.record.changelog || ["Aggiornamenti generali."];

        let installedVer = localStorage.getItem('sky_ace_installed_version') || CURRENT_GAME_VERSION;

        if (onlineVersion !== installedVer) {
            onlineVersionToInstall = onlineVersion;
            if (changelogTitle) changelogTitle.textContent = `Novità della versione ${onlineVersion}:`;
            if (changelogList) {
                changelogList.innerHTML = '';
                changelogItems.forEach(item => {
                    let li = document.createElement('li');
                    li.textContent = item;
                    changelogList.appendChild(li);
                });
            }
            if (updatePopup) updatePopup.classList.remove('hidden');
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

if (updateActionBtn) {
    updateActionBtn.addEventListener('click', () => {
        if (updatePopup) updatePopup.classList.add('hidden');
        if (downloadScreen) downloadScreen.classList.remove('hidden');
        
        let progress = 0;
        let interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    localStorage.setItem('sky_ace_installed_version', onlineVersionToInstall || CURRENT_GAME_VERSION);
                    if (downloadScreen) downloadScreen.classList.add('hidden');
                    proceedToGameOrLogin();
                }, 500);
            }
            if (downloadProgressBar) downloadProgressBar.style.width = progress + '%';
            if (downloadProgressText) downloadProgressText.textContent = progress + '%';
        }, 120);
    });
}

// --- GESTIONE LOGIN PILOTA CON CARICAMENTO IMMEDIATO ---
if (savePilotBtn) {
    savePilotBtn.addEventListener('click', async () => {
        let name = loginPilotInput ? loginPilotInput.value.trim() : "";
        if (!name) {
            alert("Inserisci un Nome Pilota valido!");
            return;
        }
        pilotId = name;
        localStorage.setItem('sky_ace_pilot_name', pilotId);
        if (startPilotName) startPilotName.textContent = pilotId;
        if (playerNameInput) playerNameInput.value = pilotId;
        
        savePilotBtn.disabled = true;
        savePilotBtn.textContent = "Caricamento Profilo...";
        
        await loadProgressFromCloud();
        
        savePilotBtn.disabled = false;
        savePilotBtn.textContent = "CONFERMA E ENTRA 🚀";
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

// --- PAUSA ---
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (!gameStarted || isCountdownActive) return;
        gamePaused = true;
        if (pausePopup) pausePopup.classList.remove('hidden');
    });
}

if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
        gamePaused = false;
        if (pausePopup) pausePopup.classList.add('hidden');
        updateGame();
    });
}

if (pauseToMenuBtn) {
    pauseToMenuBtn.addEventListener('click', () => {
        gamePaused = false;
        gameRunning = false;
        gameStarted = false;
        updateMobileControlsVisibility(false);
        if (pausePopup) pausePopup.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

// --- RICOMINCIA ---
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
        gamePaused = false;
        gameRunning = false;
        gameStarted = false;
        updateMobileControlsVisibility(false);
        if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
        if (gameOverScreen) gameOverScreen.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

// --- CONTROLLI MOBILE ---
const mobileControls = document.getElementById('mobile-controls');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function updateMobileControlsVisibility(show) {
    if (!mobileControls) return;
    if (!isMobileDevice()) {
        mobileControls.classList.remove('in-game-active');
        return;
    }
    
    if (show) {
        mobileControls.classList.add('in-game-active');
    } else {
        mobileControls.classList.remove('in-game-active');
    }
}

function setupInstantButton(btn, keyProp) {
    if (!btn) return;

    const startAction = (e) => {
        if (e && e.cancelable) e.preventDefault();
        keys[keyProp] = true;
    };

    const stopAction = (e) => {
        if (e && e.cancelable) e.preventDefault();
        keys[keyProp] = false;
    };

    btn.addEventListener('touchstart', startAction, { passive: false });
    btn.addEventListener('touchend', stopAction, { passive: false });
    btn.addEventListener('touchcancel', stopAction, { passive: false });

    btn.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') startAction(e);
    }, { passive: false });

    btn.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'touch') stopAction(e);
    }, { passive: false });
}

setupInstantButton(leftBtn, 'ArrowLeft');
setupInstantButton(rightBtn, 'ArrowRight');

// --- HANGAR AEREI ---
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
            slot.onclick = async () => {
                selectedPlaneId = p.id;
                plane.emoji = p.emoji;
                await saveProgressToCloud();
                renderPlaneGrid();
            };
        } else if (canUnlock) {
            slot.classList.add('unlockable');
            slot.innerHTML = `
                <div class="plane-emoji">${p.emoji}</div>
                <div class="plane-info" style="color: #ff9800; font-weight: bold;">RISCATTA!</div>
            `;
            slot.onclick = async () => {
                unlockedPlanes.push(p.id);
                await saveProgressToCloud();
                renderPlaneGrid();
            };
        } else {
            slot.classList.add('locked');
            slot.innerHTML = `
                <div class="plane-emoji">🔒</div>
                <div class="plane-info">${p.name}<br>Req: ${p.points}pt</div>
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
        let totalScoreDisplay = document.getElementById('total-score-display');
        if (!totalScoreDisplay && planeModal) {
            totalScoreDisplay = document.createElement('p');
            totalScoreDisplay.id = 'total-score-display';
            totalScoreDisplay.style.color = '#ffd54f';
            totalScoreDisplay.style.fontSize = '14px';
            totalScoreDisplay.style.margin = '4px 0 10px 0';
            totalScoreDisplay.style.fontWeight = 'bold';
            let modalTitle = planeModal.querySelector('h2');
            if (modalTitle) modalTitle.after(totalScoreDisplay);
        }
        if (totalScoreDisplay) totalScoreDisplay.textContent = `Punti Totali Accumulati: ${totalLifetimeScore} pt`;
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
            
            alert("Nome pilota aggiornato!");
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

// --- COUNTDOWN ---
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
                countdownText.style.fontSize = '36px';
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
    gameStarted = true;
    gameRunning = true;
    gamePaused = false;
    
    keys.ArrowLeft = false;
    keys.ArrowRight = false;

    if (startScreen) startScreen.classList.add('hidden');
    if (planeModal) planeModal.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    if (pausePopup) pausePopup.classList.add('hidden');
    if (restartConfirmPopup) restartConfirmPopup.classList.add('hidden');
    
    updateMobileControlsVisibility(true);

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

    runCountdown(() => {});

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
    if (!ctx) return;
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
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(plane.x + plane.width / 2, plane.y + plane.height / 2, 28, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(plane.x + plane.width / 2, plane.y + plane.height / 2);
    ctx.rotate(-Math.PI / 4); 
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(plane.emoji, 0, 0);
    ctx.restore();

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

    if (shieldActive) {
        ctx.fillStyle = '#29b6f6';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`SCUDO: ${Math.ceil(shieldTimer / 60)}s`, canvas.width - 15, 25);
    }
}

function updateGame() {
    if (!gameRunning || gamePaused) return;

    if (keys.ArrowLeft) plane.x -= plane.speed;
    if (keys.ArrowRight) plane.x += plane.speed;

    if (plane.x < 0) plane.x = 0;
    if (plane.x + plane.width > canvas.width) plane.x = canvas.width - plane.width;

    if (isCountdownActive) {
        draw();
        requestAnimationFrame(updateGame);
        return;
    }

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

    plane.x += windForce;

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

    // Laser Nemici
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        enemyLasers[i].y += enemyLasers[i].speed;
        let padding = 8;
        if (
            plane.x + padding < enemyLasers[i].x + enemyLasers[i].width - padding &&
            plane.x + plane.width - padding > enemyLasers[i].x + padding &&
            plane.y + padding < enemyLasers[i].y + enemyLasers[i].height - padding &&
            plane.y + plane.height - padding > enemyLasers[i].y + enemyLasers[i].height
        ) {
            addParticles(enemyLasers[i].x, enemyLasers[i].y, '#ff1744', 10);
            if (!shieldActive) {
                score = Math.max(0, score - 5);
                if (currentScoreEl) currentScoreEl.textContent = score;
            }
            enemyLasers.splice(i, 1);
            continue;
        }
        if (enemyLasers[i].y > canvas.height) enemyLasers.splice(i, 1);
    }

    // Ostacoli Generali
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
                if (!shieldActive) {
                    lives--;
                    updateLivesDisplay();
                    obstacles.splice(i, 1);
                    if (lives <= 0) {
                        triggerGameOver();
                        return;
                    }
                } else {
                    obstacles.splice(i, 1);
                }
            } else if (obs.type === 'laserEnemy') {
                if (!shieldActive) {
                    score = Math.max(0, score - 5);
                    if (currentScoreEl) currentScoreEl.textContent = score;
                }
                obstacles.splice(i, 1);
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

async function triggerGameOver() {
    gameRunning = false;
    updateMobileControlsVisibility(false);
    
    if (score > highScore) highScore = score;
    localStorage.setItem('sky_ace_highscore', highScore);

    totalLifetimeScore += score;
    localStorage.setItem('sky_ace_total_score', totalLifetimeScore);

    await saveProgressToCloud();

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (playerNameInput && pilotId) playerNameInput.value = pilotId;
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
        let name = playerNameInput ? playerNameInput.value.trim() : (pilotId || "Pilota Anonimo");
        if (!name) name = "Pilota Anonimo";
        saveBtn.disabled = true;
        saveBtn.textContent = "Salvataggio...";

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
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                },
                body: JSON.stringify(record)
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
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Salva in Classifica";
        }
        gameStarted = false;
        gameRunning = false;
        updateMobileControlsVisibility(false);
        if (startScreen) startScreen.classList.remove('hidden');
    });
}

draw();
runInitialLoading();
