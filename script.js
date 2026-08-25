// ==========================================
// 1. GLOBAL VARIABLES & UI ROUTING
// ==========================================
let currentMode = "Vs-AI", isGameOver = false, capturedWhite = [], capturedBlack = [], initialSetup = {};
let selectedSquare = null, highlightedMoves = [], isPlayer1Turn = true;
let gameMetrics = { currentStage: 1, userAggressionCount: 0, userMistakes: [], matchMoveHistory: [], consecutiveUserLosses: 0, adaptiveDifficultyScore: 50 };
let aiDatabase = { userWinningTraps: [] };

const pieceSigns = { "Raja": "⚜️", "Mantri": "📜", "Gaja": "🐘", "Ashva": "🐎", "Ratha": "🛕", "Padati": "⚔️" };
const markedSquares = ["0-0", "0-3", "0-4", "0-7", "3-0", "3-3", "3-4", "3-7", "4-0", "4-3", "4-4", "4-7", "7-0", "7-3", "7-4", "7-7"];
const VERCEL_API_URL = "https://chaturanga.quarry.dpdns.org/api";

window.showPage = function(targetPage) {
    const pages = ['home', 'game', 'rules', 'heritage', 'projects'];
    pages.forEach(page => {
        const container = document.getElementById(`${page}-container`);
        const btns = document.querySelectorAll(`.nav-btn-${page}`);
        if (page === targetPage) {
            if(container) { container.style.display = 'flex'; container.classList.remove('hidden'); }
            btns.forEach(btn => { btn.classList.add('text-amber-200', 'border-amber-500'); btn.classList.remove('text-stone-400', 'border-transparent'); });
        } else {
            if(container) { container.style.display = 'none'; container.classList.add('hidden'); }
            btns.forEach(btn => { btn.classList.add('text-stone-400', 'border-transparent'); btn.classList.remove('text-amber-200', 'border-amber-500'); });
        }
    });
};

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('flex');
    }
    if (btn) {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.showPage('home');
    window.triggerReset();
});

// ==========================================
// 2. AUDIO & HAPTIC ENGINE (Lazy Load)
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
// 3. CORE GAME ENGINE & AI LOGIC
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
    if (mode === "Vs-AI") { gameMetrics.currentStage = 1; gameMetrics.consecutiveUserLosses = 0; gameMetrics.adaptiveDifficultyScore = 50; }
    window.triggerReset();
}

window.triggerReset = function() {
    selectedSquare = null; highlightedMoves = []; isPlayer1Turn = true; isGameOver = false; capturedWhite = []; capturedBlack = []; gameMetrics.matchMoveHistory = [];
    resetInitialSetup(); 
    
    const modal = document.getElementById('gameOverModal');
    if (modal) modal.classList.add('hidden');
    
    const historyFeed = document.getElementById('move-history-feed');
    if (historyFeed) historyFeed.innerHTML = '<div class="text-stone-500 italic text-center mt-6">The battlefield awaits the first strike...</div>';

    const btn2P = document.getElementById('btn2P');
    const btnAI = document.getElementById('btnAI');
    if (btn2P) btn2P.className = currentMode === '2-Player' ? 'flex-1 py-2 text-[11px] font-bold bg-amber-600 text-stone-950 rounded cursor-pointer transition uppercase tracking-wider' : 'flex-1 py-2 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    if (btnAI) btnAI.className = currentMode === 'Vs-AI' ? 'flex-1 py-2 text-[11px] font-bold bg-amber-600 text-stone-950 rounded cursor-pointer transition uppercase tracking-wider' : 'flex-1 py-2 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    
    const lossTitle1 = document.getElementById('loss-title-1');
    const lossTitle2 = document.getElementById('loss-title-2');
    if (lossTitle1) lossTitle1.innerText = currentMode === 'Vs-AI' ? "💀 YOUR LOSSES" : "💀 PLAYER 1 LOSSES";
    if (lossTitle2) lossTitle2.innerText = currentMode === 'Vs-AI' ? "🤖 COMPUTER LOSSES" : "💀 PLAYER 2 LOSSES";
    
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

function generateAITeachingReport(userWon) {
    if (currentMode !== 'Vs-AI') return "Match finished locally.";
    if (userWon) {
        gameMetrics.consecutiveUserLosses = 0; gameMetrics.currentStage = Math.min(gameMetrics.currentStage + 1, 3);
        return "🎉 Victory! The system has analyzed your tactics and will adapt for the next encounter.";
    }
    gameMetrics.consecutiveUserLosses++; let advise = "📋 [Engine Evaluation]:\n";
    if (gameMetrics.consecutiveUserLosses >= 2) {
        gameMetrics.currentStage = Math.max(gameMetrics.currentStage - 1, 1); gameMetrics.consecutiveUserLosses = 0;
        advise += "🛡️ Engine difficulty dynamically scaled down for balance.\n";
    } else {
        advise += "⚡ Engine playing at tactical level. ";
        if (gameMetrics.userAggressionCount < 3) advise += "Develop Padati and Ashva pieces in the early phase.";
        else if (gameMetrics.userMistakes.includes("Raja_exposed")) advise += "Tactical Error: Raja was left vulnerable with open lines of attack.";
        else advise += "Coordinate your Ratha and Gaja forces to establish board dominance.";
    }
    return advise;
}

function showEndGameModal(title, description, icon, userWon) {
    const teachingReport = generateAITeachingReport(userWon);
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerHTML = `<span class="block mb-3">${description}</span><div class="text-[11px] bg-amber-500/10 p-2 rounded text-amber-400 border border-amber-500/20">${teachingReport}</div>`;
    document.getElementById('modalIcon').innerText = icon;
    document.getElementById('gameOverModal').classList.remove('hidden');
    gameMetrics.userMistakes = []; gameMetrics.userAggressionCount = 0;
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
    if (bYard) bYard.innerHTML = capturedBlack.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 graveyard-piece">${pieceSigns[p]}</span>`).join('');
    if (wYard) wYard.innerHTML = capturedWhite.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 graveyard-piece">${pieceSigns[p]}</span>`).join('');
}

function createBoard() {
    const boardElement = document.getElementById('board');
    if (!boardElement) return;

    const activeElementId = document.activeElement ? document.activeElement.id : null;

    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareId = `${row}-${col}`, square = document.createElement('div');
            square.id = `square-${squareId}`;
            square.setAttribute('role', 'button');
            square.setAttribute('tabindex', '0');
            square.className = 'ashtapada-square flex flex-col items-center justify-center cursor-pointer select-none relative aspect-square';

            const piece = initialSetup[squareId];
            let ariaLabel = piece ? `${piece.isWhite ? 'White' : 'Black'} ${piece.name} at row ${row}, column ${col}` : `Empty square at row ${row}, column ${col}`;

            if (markedSquares.includes(squareId)) square.classList.add('marked-square');
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
                ariaLabel += ' (Selected)';
            }
            if (!isGameOver && selectedSquare && highlightedMoves.includes(squareId)) {
                if (piece) {
                    square.classList.add('possible-capture-marker');
                    ariaLabel += ' (Possible Capture)';
                } else {
                    square.classList.add('possible-move-marker');
                    ariaLabel += ' (Possible Move)';
                }
            }

            square.setAttribute('aria-label', ariaLabel);

            if (piece) {
                const labelColor = piece.isWhite ? 'text-amber-700' : 'text-red-700';
                square.innerHTML = `<span class="text-2xl md:text-3xl filter drop-shadow-sm">${pieceSigns[piece.name]}</span><span class="text-[7px] ${labelColor} font-sans font-extrabold z-10 uppercase tracking-tighter absolute bottom-0.5">${piece.name}</span>`;
            }
            square.addEventListener('click', () => handleSquareClick(row, col));
            square.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSquareClick(row, col);
                }
            });
            boardElement.appendChild(square);
        }
    }
    updateGraveyardUI();

    if (activeElementId) {
        const toFocus = document.getElementById(activeElementId);
        if (toFocus) toFocus.focus();
    }
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

        if (targetPiece) gameMetrics.userAggressionCount++;
        if (selectedSquare.piece.name === 'Raja' && row < 6) gameMetrics.userMistakes.push("Raja_exposed");

        gameMetrics.matchMoveHistory.push({ from: fromKey, to: squareId, piece: selectedSquare.piece.name });

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

        if (isGameOver) return;
        if (currentMode === 'Vs-AI') { setTimeout(triggerAiEngineLogic, 300); } else { isPlayer1Turn = !isPlayer1Turn; }
    }
}

function evaluateBoardState() {
    const scores = { 'Raja': 10000, 'Mantri': 90, 'Ratha': 50, 'Gaja': 40, 'Ashva': 30, 'Padati': 10 }; let totalVal = 0;
    for (const key in initialSetup) {
        const piece = initialSetup[key];
        // ⚡ Bolt Optimization: Replace slow key.split('-').map(Number) with fast charCodeAt math.
        // Board size is fixed 8x8 (single digits), so this is safe and avoids array allocations.
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
            // ⚡ Bolt Optimization: Use fast charCodeAt instead of split
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
            // ⚡ Bolt Optimization: Use fast charCodeAt instead of split
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) { for (let toC = 0; toC < 8; toC++) { if (checkLegalMove(piece, fromR, fromC, toR, toC)) allLegalAiMoves.push({ fromKey: key, toKey: `${toR}-${toC}`, piece: piece, targetPiece: initialSetup[`${toR}-${toC}`] }); } }
        }
    }
    if (allLegalAiMoves.length === 0) { isGameOver = true; showEndGameModal("STALEMATE", "The battle ended in a draw.", "🏳️", false); return; }

    if (gameMetrics.currentStage === 1) allLegalAiMoves.sort(() => Math.random() - 0.5);
    else {
        for (const move of allLegalAiMoves) {
            const backup = initialSetup[move.toKey]; initialSetup[move.toKey] = initialSetup[move.fromKey]; delete initialSetup[move.fromKey];
            move.minimaxWeight = gameMetrics.currentStage === 2 ? evaluateBoardState() : minimax(2, false); 
            if(gameMetrics.currentStage > 2) aiDatabase.userWinningTraps.forEach(trap => { if (trap.to === move.toKey) move.minimaxWeight += 250; });
            initialSetup[move.fromKey] = initialSetup[move.toKey]; if (backup) initialSetup[move.toKey] = backup; else delete initialSetup[move.toKey];
        }
        allLegalAiMoves.sort((a, b) => b.minimaxWeight - a.minimaxWeight);
    }
    
    const bestMove = allLegalAiMoves[0], isCapture = !!bestMove.targetPiece;
    if (isCapture) playCaptureSound(bestMove.targetPiece.name); else playMoveSound();
    logMoveToHistory(bestMove.piece.name, bestMove.toKey, isCapture, false);

    if (bestMove.targetPiece) { capturedWhite.push(bestMove.targetPiece.name); if (bestMove.targetPiece.name === 'Raja') { isGameOver = true; createBoard(); showEndGameModal("DEFEAT", "The computer has captured your Raja!", "💀", false); return; } }
    delete initialSetup[bestMove.fromKey]; initialSetup[bestMove.toKey] = { name: bestMove.piece.name, isWhite: false }; createBoard();
                                                                                                                                                                                                                                   }
        
