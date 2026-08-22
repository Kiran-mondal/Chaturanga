// --- CORE GAME ENGINE ---
const pieceSigns = { "Raja": "⚜️", "Mantri": "📜", "Gaja": "🐘", "Ashva": "🐎", "Ratha": "🛕", "Padati": "⚔️" };
let gameMetrics = { currentStage: 1, userAggressionCount: 0, userMistakes: [], matchMoveHistory: [], consecutiveUserLosses: 0, adaptiveDifficultyScore: 50 };
let currentMode = "Vs-AI", isGameOver = false, capturedWhite = [], capturedBlack = [], initialSetup = {};
const markedSquares = ["0-0", "0-3", "0-4", "0-7", "3-0", "3-3", "3-4", "3-7", "4-0", "4-3", "4-4", "4-7", "7-0", "7-3", "7-4", "7-7"];
let selectedSquare = null, highlightedMoves = [], isPlayer1Turn = true;

function resetInitialSetup() {
    initialSetup = {
        "0-0": { name: "Ratha", isWhite: false }, "0-1": { name: "Ashva", isWhite: false }, "0-2": { name: "Gaja", isWhite: false },  "0-3": { name: "Mantri", isWhite: false }, "0-4": { name: "Raja", isWhite: false },  "0-5": { name: "Gaja", isWhite: false }, "0-6": { name: "Ashva", isWhite: false }, "0-7": { name: "Ratha", isWhite: false },
        "1-0": { name: "Padati", isWhite: false }, "1-1": { name: "Padati", isWhite: false }, "1-2": { name: "Padati", isWhite: false }, "1-3": { name: "Padati", isWhite: false }, "1-4": { name: "Padati", isWhite: false }, "1-5": { name: "Padati", isWhite: false }, "1-6": { name: "Padati", isWhite: false }, "1-7": { name: "Padati", isWhite: false },
        "6-0": { name: "Padati", isWhite: true }, "6-1": { name: "Padati", isWhite: true }, "6-2": { name: "Padati", isWhite: true }, "6-3": { name: "Padati", isWhite: true }, "6-4": { name: "Padati", isWhite: true }, "6-5": { name: "Padati", isWhite: true }, "6-6": { name: "Padati", isWhite: true }, "6-7": { name: "Padati", isWhite: true },
        "7-0": { name: "Ratha", isWhite: true }, "7-1": { name: "Ashva", isWhite: true }, "7-2": { name: "Gaja", isWhite: true },  "7-3": { name: "Mantri", isWhite: true }, "7-4": { name: "Raja", isWhite: true },  "7-5": { name: "Gaja", isWhite: true }, "7-6": { name: "Ashva", isWhite: true }, "7-7": { name: "Ratha", isWhite: true }
    };
}

function switchMode(mode) {
    currentMode = mode;
    if (mode === "Vs-AI") { gameMetrics.currentStage = 1; gameMetrics.consecutiveUserLosses = 0; gameMetrics.adaptiveDifficultyScore = 50; }
    triggerReset();
}

function triggerReset() {
    selectedSquare = null; highlightedMoves = []; isPlayer1Turn = true; isGameOver = false; capturedWhite = []; capturedBlack = []; gameMetrics.matchMoveHistory = [];
    resetInitialSetup(); document.getElementById('gameOverModal').classList.add('hidden');
    
    const historyFeed = document.getElementById('move-history-feed');
    if (historyFeed) historyFeed.innerHTML = '<div class="text-stone-500 italic text-center mt-6">The battlefield awaits the first strike...</div>';

    document.getElementById('btn2P').className = currentMode === '2-Player' ? 'flex-1 py-2 text-[11px] font-bold bg-amber-600 text-stone-950 rounded cursor-pointer transition uppercase tracking-wider' : 'flex-1 py-2 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    document.getElementById('btnAI').className = currentMode === 'Vs-AI' ? 'flex-1 py-2 text-[11px] font-bold bg-amber-600 text-stone-950 rounded cursor-pointer transition uppercase tracking-wider' : 'flex-1 py-2 text-[11px] font-bold bg-stone-900/60 rounded mode-button';
    
    document.getElementById('loss-title-1').innerText = currentMode === 'Vs-AI' ? "💀 YOUR LOSSES" : "💀 PLAYER 1 LOSSES";
    document.getElementById('loss-title-2').innerText = currentMode === 'Vs-AI' ? "🤖 COMPUTER LOSSES" : "💀 PLAYER 2 LOSSES";
    createBoard();
}

function generateAITeachingReport(userWon) {
    if (currentMode !== 'Vs-AI') return "Match finished locally.";
    if (userWon) {
        gameMetrics.consecutiveUserLosses = 0; gameMetrics.currentStage = Math.min(gameMetrics.currentStage + 1, 3);
        gameMetrics.adaptiveDifficultyScore = Math.min(gameMetrics.adaptiveDifficultyScore + 25, 100);
        if (gameMetrics.matchMoveHistory.length > 0) {
            const lastWinningMove = gameMetrics.matchMoveHistory[gameMetrics.matchMoveHistory.length - 1];
            aiDatabase.userWinningTraps.push(lastWinningMove); syncTrapToVercelDatabase(lastWinningMove.to);
        }
        return "🎉 Victory! The system has analyzed your tactics and will adapt for the next encounter.";
    }

    gameMetrics.consecutiveUserLosses++; let advise = "📋 [Engine Evaluation]:\n";
    if (gameMetrics.consecutiveUserLosses >= 2) {
        gameMetrics.currentStage = Math.max(gameMetrics.currentStage - 1, 1); gameMetrics.adaptiveDifficultyScore = Math.max(gameMetrics.adaptiveDifficultyScore - 20, 50); gameMetrics.consecutiveUserLosses = 0;
        advise += "🛡️ Engine difficulty dynamically scaled down for balance.\n";
    } else {
        advise += "⚡ Engine playing at tactical level. ";
        if (gameMetrics.userAggressionCount < 3) advise += "Develop Padati and Ashva pieces in the early phase.";
        else if (gameMetrics.userMistakes.includes("Raja_exposed")) advise += "Tactical Error: Raja was left vulnerable with open lines of attack.";
        else advise += "Coordinate your Ratha and Gaja forces to establish board dominance.";
    }
    return advise;
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

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareId = `${row}-${col}`, square = document.createElement('div');
            square.className = 'ashtapada-square flex flex-col items-center justify-center cursor-pointer select-none relative aspect-square';
            if (markedSquares.includes(squareId)) square.classList.add('marked-square');
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) square.classList.add('selected');
            if (!isGameOver && selectedSquare && highlightedMoves.includes(squareId)) square.classList.add(initialSetup[squareId] ? 'possible-capture-marker' : 'possible-move-marker');

            const piece = initialSetup[squareId];
            if (piece) {
                const labelColor = piece.isWhite ? 'text-amber-700' : 'text-red-700';
                square.innerHTML = `<span class="text-2xl md:text-3xl filter drop-shadow-sm">${pieceSigns[piece.name]}</span><span class="text-[7px] ${labelColor} font-sans font-extrabold z-10 uppercase tracking-tighter absolute bottom-0.5">${piece.name}</span>`;
            }
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
    updateGraveyardUI();
}

async function handleSquareClick(row, col) {
    if (isGameOver) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
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

// Initialize on page load
loadGlobalAIDatabase();
triggerReset();
    
