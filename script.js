// ==========================================
// 1. GLOBAL VARIABLES & UI ROUTING
// ==========================================
let currentMode = "Vs-AI", isGameOver = false, capturedWhite = [], capturedBlack = [], initialSetup = {};
let selectedSquare = null, highlightedMoves = [], isPlayer1Turn = true;
let gameMetrics = { currentStage: 1, userAggressionCount: 0, userMistakes: [], matchMoveHistory: [], consecutiveUserLosses: 0, adaptiveDifficultyScore: 50 };

const pieceSigns = { "Raja": "👑", "Mantri": "📜", "Gaja": "🐘", "Ashva": "🐎", "Ratha": "🛕", "Padati": "⚔️" };
const markedSquares = ["0-0", "0-3", "0-4", "0-7", "3-0", "3-3", "3-4", "3-7", "4-0", "4-3", "4-4", "4-7", "7-0", "7-3", "7-4", "7-7"];

// ==========================================
// 2. SOCKET.IO CONNECTION
// ==========================================
let socket = null;
if (typeof io !== 'undefined') {
    socket = io(); 
    socket.on('updateBoard', (moveData) => {
        if(currentMode === '2-Player' && initialSetup[moveData.from]) {
            const piece = initialSetup[moveData.from];
            const isCapture = !!initialSetup[moveData.to];
            initialSetup[moveData.to] = piece;
            delete initialSetup[moveData.from];
            if (isCapture) playCaptureSound(piece.name); else playMoveSound();
            logMoveToHistory(piece.name, moveData.to, isCapture, piece.isWhite);
            isPlayer1Turn = moveData.nextTurn;
            createBoard(); 
        }
    });
}

// ==========================================
// 3. UI TAB SWITCH FIX
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const originalShowPage = window.showPage;
    window.showPage = function(targetPage) {
        if(originalShowPage) originalShowPage(targetPage);
        if(targetPage === 'game') {
            setTimeout(() => {
                if(isThreeInitialized && renderer && camera) {
                    const container = document.getElementById('three-game-container');
                    if(container && container.clientWidth > 0) {
                        let newW = container.clientWidth;
                        let newH = container.clientHeight || newW;
                        camera.aspect = newW / newH;
                        camera.updateProjectionMatrix();
                        renderer.setSize(newW, newH);
                    }
                } else {
                    createBoard();
                }
            }, 100);
        }
    };
    window.showPage('home');
    window.triggerReset();
});

// ==========================================
// 4. AUDIO ENGINE
// ==========================================
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playMoveSound() {
    triggerVibration(40); 
    initAudio();
    try {
        const osc = audioCtx.createOscillator(), gainNode = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
}
function playCaptureSound(capturedPieceName) {
    triggerVibration([100, 50, 100]); 
    let audioSrc = "sword.mp3"; 
    switch(capturedPieceName) {
        case "Ashva": audioSrc = "scottishperson-sound-effect-horse-whinny-03-372258.mp3"; break;
        case "Gaja": audioSrc = "universfield-sad-trumpet-278822.mp3"; break;
        case "Ratha": audioSrc = "freesound_community-slosh-a-101500.mp3"; break;
        case "Padati": audioSrc = "data_pion-st3-footstep-sfx-323056.mp3"; break;
    }
    new Audio(audioSrc).play().catch(e => console.log("Audio Error:", e));
}
function triggerVibration(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }

// ==========================================
// 5. CORE GAME ENGINE LOGIC
// ==========================================
function resetInitialSetup() {
    initialSetup = {
        "0-0": { name: "Ratha", isWhite: false }, "0-1": { name: "Ashva", isWhite: false }, "0-2": { name: "Gaja", isWhite: false },  "0-3": { name: "Mantri", isWhite: false }, "0-4": { name: "Raja", isWhite: false },  "0-5": { name: "Gaja", isWhite: false }, "0-6": { name: "Ashva", isWhite: false }, "0-7": { name: "Ratha", isWhite: false },
        "1-0": { name: "Padati", isWhite: false }, "1-1": { name: "Padati", isWhite: false }, "1-2": { name: "Padati", isWhite: false }, "1-3": { name: "Padati", isWhite: false }, "1-4": { name: "Padati", isWhite: false }, "1-5": { name: "Padati", isWhite: false }, "1-6": { name: "Padati", isWhite: false }, "1-7": { name: "Padati", isWhite: false },
        "6-0": { name: "Padati", isWhite: true }, "6-1": { name: "Padati", isWhite: true }, "6-2": { name: "Padati", isWhite: true }, "6-3": { name: "Padati", isWhite: true }, "6-4": { name: "Padati", isWhite: true }, "6-5": { name: "Padati", isWhite: true }, "6-6": { name: "Padati", isWhite: true }, "6-7": { name: "Padati", isWhite: true },
        "7-0": { name: "Ratha", isWhite: true }, "7-1": { name: "Ashva", isWhite: true }, "7-2": { name: "Gaja", isWhite: true },  "7-3": { name: "Mantri", isWhite: true }, "7-4": { name: "Raja", isWhite: true },  "7-5": { name: "Gaja", isWhite: true }, "7-6": { name: "Ashva", isWhite: true }, "7-7": { name: "Ratha", isWhite: true }
    };
}
window.switchMode = function(mode) {
    currentMode = mode;
    if (mode === "Vs-AI") { gameMetrics.currentStage = 1; gameMetrics.consecutiveUserLosses = 0; }
    isCameraAnimating = true;
    if (camera) camera.position.set(0, 25, 0); // Drop down animation starts here
    window.triggerReset();
}
window.triggerReset = function() {
    selectedSquare = null; highlightedMoves = []; isPlayer1Turn = true; isGameOver = false; capturedWhite = []; capturedBlack = []; gameMetrics.matchMoveHistory = [];
    resetInitialSetup(); 
    
    const modal = document.getElementById('gameOverModal');
    if (modal) modal.classList.add('hidden');
    
    const historyFeed = document.getElementById('move-history-feed');
    if (historyFeed) historyFeed.innerHTML = '<div class="text-stone-500 italic text-center mt-6">The battlefield awaits...</div>';

    const btn2P = document.getElementById('btn2P');
    const btnAI = document.getElementById('btnAI');
    if (btn2P) btn2P.className = currentMode === '2-Player' ? 'flex-1 py-1.5 text-[11px] font-bold bg-amber-600 text-stone-950 rounded uppercase tracking-wider' : 'flex-1 py-1.5 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    if (btnAI) btnAI.className = currentMode === 'Vs-AI' ? 'flex-1 py-1.5 text-[11px] font-bold bg-amber-600 text-stone-950 rounded uppercase tracking-wider' : 'flex-1 py-1.5 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    
    createBoard();
}
function logMoveToHistory(pieceName, toSquare, isCapture, isWhite) {
    const historyFeed = document.getElementById('move-history-feed');
    if (!historyFeed) return;
    if (historyFeed.innerText.includes('awaits')) historyFeed.innerHTML = ''; 
    const colorLabel = isWhite ? '<span class="text-amber-500 font-bold">Player</span>' : '<span class="text-red-500 font-bold">Computer</span>';
    const actionText = isCapture ? `<span class="text-red-400 font-bold">captured on</span>` : `moved to`;
    const entry = document.createElement('div');
    entry.className = 'border-b border-stone-800/50 pb-1 opacity-0 animate-fade-in';
    entry.innerHTML = `> ${colorLabel}'s ${pieceName} ${actionText} [${toSquare}]`;
    historyFeed.appendChild(entry); historyFeed.scrollTop = historyFeed.scrollHeight; 
}
function showEndGameModal(title, description, icon, userWon) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerHTML = `<span class="block mb-3">${description}</span>`;
    document.getElementById('modalIcon').innerText = icon;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function checkLegalMove(piece, fromR, fromC, toR, toC) {
    if (toR < 0 || toR > 7 || toC < 0 || toC > 7 || (fromR === toR && fromC === toC)) return false;
    const rowDiff = Math.abs(toR - fromR), colDiff = Math.abs(toC - fromC), target = initialSetup[`${toR}-${toC}`];
    if (target && target.isWhite === piece.isWhite) return false;

    switch (piece.name) {
        case 'Padati': const dir = piece.isWhite ? -1 : 1; if (fromC === toC && toR === fromR + dir) return !target; if (colDiff === 1 && toR === fromR + dir) return target && target.isWhite !== piece.isWhite; return false;
        case 'Ratha': if (fromR !== toR && fromC !== toC) return false; const stepR = fromR === toR ? 0 : (toR > fromR ? 1 : -1), stepC = fromC === toC ? 0 : (toC > fromC ? 1 : -1); let checkR = fromR + stepR, checkC = fromC + stepC; while (checkR !== toR || checkC !== toC) { if (initialSetup[`${checkR}-${checkC}`]) return false; checkR += stepR; checkC += stepC; } return true;
        case 'Ashva': return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        case 'Gaja': return rowDiff === 2 && colDiff === 2;
        case 'Raja': return rowDiff <= 1 && colDiff <= 1;
        case 'Mantri': return rowDiff === 1 && colDiff === 1;
        default: return false;
    }
}
function calculatePossibleMoves(row, col, piece) {
    const validDestinations = [];
    for (let r = 0; r < 8; r++) { for (let c = 0; c < 8; c++) { if (checkLegalMove(piece, row, col, r, c)) validDestinations.push(`${r}-${c}`); } }
    return validDestinations;
}
function updateGraveyardUI() {
    const bYard = document.getElementById('black-graveyard');
    const wYard = document.getElementById('white-graveyard');
    if (bYard) bYard.innerHTML = capturedBlack.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 text-xs">${pieceSigns[p]}</span>`).join('');
    if (wYard) wYard.innerHTML = capturedWhite.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 text-xs">${pieceSigns[p]}</span>`).join('');
}

// ==========================================
// 6. THREE.JS RENDERING (CARVED WOOD SILHOUETTE)
// ==========================================
let scene, camera, renderer, boardGroup, piecesGroup;
let isThreeInitialized = false;

let targetCameraPos = new THREE.Vector3(0, 11, 7.5);
let isCameraAnimating = true;

function create3DPiece(name, isWhite) {
    const group = new THREE.Group();
    // রেফারেন্স ছবির মতো ন্যাচারাল কাঠের রং
    const pieceColor = isWhite ? 0xc49a6c : 0x4a2e15; 
    const mat = new THREE.MeshStandardMaterial({ 
        color: pieceColor, 
        roughness: 0.85, // কাঠের মতো অমসৃণ ভাব
        metalness: 0.05 
    });

    // ছবির মতো ভারী এবং চওড়া বেস
    const baseGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.15, 32);
    const base = new THREE.Mesh(baseGeo, mat);
    base.position.y = 0.075; base.castShadow = true; base.receiveShadow = true;
    group.add(base);
    
    const stepGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.1, 32);
    const step = new THREE.Mesh(stepGeo, mat);
    step.position.y = 0.2; step.castShadow = true;
    group.add(step);

    // ছবির শেপ অনুযায়ী বেসিক আকার
    if (name === 'Padati') { 
        // বসে থাকা সৈন্যের মতো নিচু এবং ছড়ানো শেপ
        let body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), mat);
        body.position.y = 0.4; body.castShadow = true;
        let head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), mat);
        head.position.y = 0.6; head.castShadow = true;
        group.add(body, head);
    } else if (name === 'Ratha') { 
        // রথের মতো চারকোনা ও চওড়া
        let body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.45), mat);
        body.position.y = 0.45; body.castShadow = true;
        group.add(body);
    } else if (name === 'Ashva') { 
        // ঘোড়ার মুখের মতো সামনের দিকে ঝোঁকা শেপ
        let body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.4, 16), mat);
        body.position.y = 0.45; body.castShadow = true;
        let head = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16), mat);
        head.position.set(0, 0.7, 0.15); head.rotation.x = Math.PI / 3; head.castShadow = true;
        group.add(body, head);
    } else if (name === 'Gaja') { 
        // হাতির মতো বিশাল বডি এবং পিঠের ওপর বসার জায়গা
        let body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), mat);
        body.position.y = 0.5; body.scale.z = 1.2; body.castShadow = true;
        let howdah = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), mat);
        howdah.position.y = 0.9; howdah.castShadow = true;
        group.add(body, howdah);
    } else if (name === 'Mantri') { 
        // মন্ত্রীর জন্য মাঝারি উচ্চতার মুকুট
        let body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.6, 32), mat);
        body.position.y = 0.55; body.castShadow = true;
        let crown = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 16, 32), mat);
        crown.position.y = 0.9; crown.rotation.x = Math.PI / 2;
        group.add(body, crown);
    } else if (name === 'Raja') { 
        // রাজার জন্য সবচেয়ে উঁচু এবং ছড়ানো শেপ
        let body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.7, 32), mat);
        body.position.y = 0.6; body.castShadow = true;
        let top = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), mat);
        top.position.y = 1.0; top.castShadow = true;
        let point = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 16), mat);
        point.position.y = 1.3; point.castShadow = true;
        group.add(body, top, point);
    }

    return group;
}

function initThreeJS() {
    if(isThreeInitialized) return;
    if(typeof THREE === 'undefined') return; 

    const container = document.getElementById('three-game-container');
    if(!container) return;

    let w = container.clientWidth || window.innerWidth - 30;
    let h = container.clientHeight || w;

    scene = new THREE.Scene();
    scene.background = null; 

    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    camera.position.set(0, 25, 0); 
    camera.lookAt(0, 0, 0); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffe4ce, 0.9); 
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048; 
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -10; directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10; directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const tableGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.6, 64);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9, metalness: 0.1 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, -0.4, 0); 
    table.receiveShadow = true;
    scene.add(table);

    boardGroup = new THREE.Group();
    scene.add(boardGroup);
    piecesGroup = new THREE.Group();
    scene.add(piecesGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(boardGroup.children);
        if (intersects.length > 0) {
            const userData = intersects[0].object.userData;
            if(userData.row !== undefined) handleSquareClick(userData.row, userData.col);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        if(isCameraAnimating) {
            camera.position.lerp(targetCameraPos, 0.04); 
            camera.lookAt(0, 0, 0);
            if(camera.position.distanceTo(targetCameraPos) < 0.1) isCameraAnimating = false;
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        if(!container || container.clientWidth === 0) return;
        let newW = container.clientWidth;
        let newH = container.clientHeight || newW;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    });

    isThreeInitialized = true;
}

function createBoard() {
    if(typeof THREE !== 'undefined') initThreeJS();
    if(!isThreeInitialized) return;
    
    while(boardGroup.children.length > 0) boardGroup.remove(boardGroup.children[0]); 
    while(piecesGroup.children.length > 0) piecesGroup.remove(piecesGroup.children[0]); 

    const boardSize = 8;
    const tileSize = 1;
    const offset = (boardSize * tileSize) / 2 - (tileSize / 2);

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const squareId = `${row}-${col}`;
            const isBlack = (row + col) % 2 === 1;
            
            let tileColor = isBlack ? 0x5c3a21 : 0xd2a679; 
            if (markedSquares.includes(squareId)) tileColor = isBlack ? 0x4a2e1a : 0xb58c60;
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) tileColor = 0xf59e0b; 
            if (selectedSquare && highlightedMoves.includes(squareId)) tileColor = initialSetup[squareId] ? 0xef4444 : 0x22c55e; 

            const tileGeometry = new THREE.BoxGeometry(tileSize, 0.2, tileSize, 4, 1, 4);
            const tileMaterial = new THREE.MeshStandardMaterial({ color: tileColor, roughness: 0.8, metalness: 0.1 });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.receiveShadow = true;
            
            const xPos = col * tileSize - offset;
            const zPos = row * tileSize - offset;
            
            tile.position.set(xPos, -0.1, zPos);
            tile.userData = { row: row, col: col }; 
            boardGroup.add(tile);

            const pieceData = initialSetup[squareId];
            if (pieceData) {
                const pieceMesh = create3DPiece(pieceData.name, pieceData.isWhite);
                pieceMesh.position.set(xPos, 0.1, zPos);
                piecesGroup.add(pieceMesh);
            }
        }
    }
    
    updateGraveyardUI();
}

window.handleSquareClick = async function(row, col) {
    if (isGameOver) return;
    const squareId = `${row}-${col}`, targetPiece = initialSetup[squareId];

    if (selectedSquare === null) {
        if (targetPiece) {
            if (currentMode === '2-Player' && targetPiece.isWhite !== isPlayer1Turn) return;
            if (currentMode === 'Vs-AI' && !targetPiece.isWhite) return;
            selectedSquare = { row, col, piece: targetPiece }; highlightedMoves = calculatePossibleMoves(row, col, targetPiece); createBoard();
        }
    } else {
        const fromKey = `${selectedSquare.row}-${selectedSquare.col}`;
        if (!checkLegalMove(selectedSquare.piece, selectedSquare.row, selectedSquare.col, row, col)) { selectedSquare = null; highlightedMoves = []; createBoard(); return; }

        const isCapture = !!targetPiece;
        if (isCapture) playCaptureSound(targetPiece.name); else playMoveSound();
        logMoveToHistory(selectedSquare.piece.name, squareId, isCapture, selectedSquare.piece.isWhite);

        if (targetPiece) {
            if (targetPiece.isWhite) {
                capturedWhite.push(targetPiece.name);
                if (targetPiece.name === 'Raja') { isGameOver = true; createBoard(); showEndGameModal("DEFEAT", "The opponent has captured your Raja!", "💀", false); return; }
            } else {
                capturedBlack.push(targetPiece.name);
                if (targetPiece.name === 'Raja') { isGameOver = true; createBoard(); showEndGameModal("VICTORY!", "You have conquered the opposing throne!", "👑", true); return; }
            }
        }

        let pieceNameToDeploy = selectedSquare.piece.name;
        if (pieceNameToDeploy === 'Padati' && (row === 0 || row === 7)) pieceNameToDeploy = 'Mantri';

        delete initialSetup[fromKey]; initialSetup[squareId] = { name: pieceNameToDeploy, isWhite: selectedSquare.piece.isWhite };
        selectedSquare = null; highlightedMoves = []; createBoard();
        
        if(currentMode === '2-Player' && socket) {
            isPlayer1Turn = !isPlayer1Turn;
            socket.emit('playerMove', { from: fromKey, to: squareId, nextTurn: isPlayer1Turn });
        }

        if (isGameOver) return;
        if (currentMode === 'Vs-AI') { setTimeout(triggerAiEngineLogic, 300); } 
    }
}

// ==========================================
// 7. AI ENGINE LOGIC
// ==========================================
function evaluateBoardState() {
    const scores = { 'Raja': 10000, 'Mantri': 90, 'Ratha': 50, 'Gaja': 40, 'Ashva': 30, 'Padati': 10 }; let totalVal = 0;
    for (const key in initialSetup) {
        const piece = initialSetup[key];
        const r = key.charCodeAt(0) - 48;
        let weight = scores[piece.name];
        if (piece.name === 'Padati') weight += piece.isWhite ? (7 - r) : r;
        if (piece.isWhite) totalVal -= weight; else totalVal += weight;
    }
    return totalVal;
}

function minimax(depth, isAiMaximizing) {
    if (depth === 0 || isGameOver) return evaluateBoardState();
    const aiMoves = [];
    for (const key in initialSetup) {
        if ((isAiMaximizing && !initialSetup[key].isWhite) || (!isAiMaximizing && initialSetup[key].isWhite)) {
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) { for (let toC = 0; toC < 8; toC++) { if (checkLegalMove(piece, fromR, fromC, toR, toC)) aiMoves.push({ from: key, to: `${toR}-${toC}`, piece: piece }); } }
        }
    }
    if (aiMoves.length === 0) return evaluateBoardState();

    let bestEval = isAiMaximizing ? -Infinity : Infinity;
    for (const move of aiMoves) {
        const backup = initialSetup[move.to]; initialSetup[move.to] = initialSetup[move.from]; delete initialSetup[move.from];
        let evaluation = minimax(depth - 1, !isAiMaximizing);
        bestEval = isAiMaximizing ? Math.max(bestEval, evaluation) : Math.min(bestEval, evaluation);
        initialSetup[move.from] = initialSetup[move.to]; if (backup) initialSetup[move.to] = backup; else delete initialSetup[move.to];
    }
    return bestEval;
}

function triggerAiEngineLogic() {
    if (isGameOver) return;
    const allLegalAiMoves = [];
    for (const key in initialSetup) {
        if (!initialSetup[key].isWhite) {
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) { for (let toC = 0; toC < 8; toC++) { if (checkLegalMove(piece, fromR, fromC, toR, toC)) allLegalAiMoves.push({ fromKey: key, toKey: `${toR}-${toC}`, piece: piece, targetPiece: initialSetup[`${toR}-${toC}`] }); } }
        }
    }
    if (allLegalAiMoves.length === 0) { isGameOver = true; showEndGameModal("STALEMATE", "The battle ended in a draw.", "🏳️", false); return; }

    for (const move of allLegalAiMoves) {
        const backup = initialSetup[move.toKey]; initialSetup[move.toKey] = initialSetup[move.fromKey]; delete initialSetup[move.fromKey];
        move.minimaxWeight = minimax(2, false); 
        initialSetup[move.fromKey] = initialSetup[move.toKey]; if (backup) initialSetup[move.toKey] = backup; else delete initialSetup[move.toKey];
    }
    allLegalAiMoves.sort((a, b) => b.minimaxWeight - a.minimaxWeight);
    
    const bestMove = allLegalAiMoves[0], isCapture = !!bestMove.targetPiece;
    if (isCapture) playCaptureSound(bestMove.targetPiece.name); else playMoveSound();
    logMoveToHistory(bestMove.piece.name, bestMove.toKey, isCapture, false);

    if (bestMove.targetPiece) { 
        capturedWhite.push(bestMove.targetPiece.name); 
        if (bestMove.targetPiece.name === 'Raja') { isGameOver = true; createBoard(); showEndGameModal("DEFEAT", "The computer has captured your Raja!", "💀", false); return; } 
    }
    delete initialSetup[bestMove.fromKey]; initialSetup[bestMove.toKey] = { name: bestMove.piece.name, isWhite: false }; createBoard();
            }
            
