// --- AI LOGIC & MINIMAX ENGINE ---
const VERCEL_API_URL = "https://chaturanga.quarry.dpdns.org/api";
let aiDatabase = { userWinningTraps: [] };

async function loadGlobalAIDatabase() {
    try {
        const response = await fetch(`${VERCEL_API_URL}/get-strategies`);
        if (response.ok) {
            const data = await response.json();
            aiDatabase.userWinningTraps = data.traps || [];
        }
    } catch (error) { console.log("Offline fallback active."); }
}

async function syncTrapToVercelDatabase(winningMove) {
    try {
        await fetch(`${VERCEL_API_URL}/save-strategy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ move: winningMove })
        });
    } catch (error) { console.log("Local database bypass."); }
}

function evaluateBoardState() {
    const scores = { 'Raja': 10000, 'Mantri': 90, 'Ratha': 50, 'Gaja': 40, 'Ashva': 30, 'Padati': 10 };
    let totalVal = 0;
    for (const key in initialSetup) {
        const piece = initialSetup[key];
        const [r, c] = key.split('-').map(Number);
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
        const isWhitePiece = initialSetup[key].isWhite;
        if ((isAiMaximizing && !isWhitePiece) || (!isAiMaximizing && isWhitePiece)) {
            const [fromR, fromC] = key.split('-').map(Number);
            const piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                        aiMoves.push({ from: key, to: `${toR}-${toC}`, piece: piece });
                    }
                }
            }
        }
    }
    if (aiMoves.length === 0) return evaluateBoardState();

    let bestEval = isAiMaximizing ? -Infinity : Infinity;
    for (const move of aiMoves) {
        const backup = initialSetup[move.to];
        initialSetup[move.to] = initialSetup[move.from];
        delete initialSetup[move.from];
        let evaluation = minimax(depth - 1, !isAiMaximizing);
        bestEval = isAiMaximizing ? Math.max(bestEval, evaluation) : Math.min(bestEval, evaluation);
        initialSetup[move.from] = initialSetup[move.to];
        if (backup) initialSetup[move.to] = backup; else delete initialSetup[move.to];
    }
    return bestEval;
}

function triggerAiEngineLogic() {
    if (isGameOver) return;
    const allLegalAiMoves = [];
    for (const key in initialSetup) {
        if (!initialSetup[key].isWhite) {
            const [fromR, fromC] = key.split('-').map(Number);
            const piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) { 
                for (let toC = 0; toC < 8; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                        const target = initialSetup[`${toR}-${toC}`];
                        allLegalAiMoves.push({ fromKey: key, toKey: `${toR}-${toC}`, piece: piece, targetPiece: target });
                    }
                }
            }
        }
    }

    if (allLegalAiMoves.length === 0) {
        isGameOver = true;
        showEndGameModal("STALEMATE", "The battle ended in a draw.", "🏳️", false);
        return;
    }
    if (gameMetrics.currentStage === 1) {
        allLegalAiMoves.sort(() => Math.random() - 0.5);
    } else {
        for (const move of allLegalAiMoves) {
            const backup = initialSetup[move.toKey];
            initialSetup[move.toKey] = initialSetup[move.fromKey];
            delete initialSetup[move.fromKey];
            move.minimaxWeight = gameMetrics.currentStage === 2 ? evaluateBoardState() : minimax(2, false); 
            if(gameMetrics.currentStage > 2) aiDatabase.userWinningTraps.forEach(trap => { if (trap.to === move.toKey) move.minimaxWeight += 250; });
            initialSetup[move.fromKey] = initialSetup[move.toKey];
            if (backup) initialSetup[move.toKey] = backup; else delete initialSetup[move.toKey];
        }
        allLegalAiMoves.sort((a, b) => b.minimaxWeight - a.minimaxWeight);
    }
    
    const bestMove = allLegalAiMoves[0]; 
    const isCapture = !!bestMove.targetPiece;

    if (isCapture) playCaptureSound(bestMove.targetPiece.name); else playMoveSound();
    logMoveToHistory(bestMove.piece.name, bestMove.toKey, isCapture, false);

    if (bestMove.targetPiece) {
        capturedWhite.push(bestMove.targetPiece.name);
        if (bestMove.targetPiece.name === 'Raja') {
            isGameOver = true; createBoard();
            showEndGameModal("DEFEAT", "The computer has captured your Raja!", "💀", false); return;
        }
    }

    delete initialSetup[bestMove.fromKey];
    initialSetup[bestMove.toKey] = { name: bestMove.piece.name, isWhite: false };
    createBoard();
                      }
      
