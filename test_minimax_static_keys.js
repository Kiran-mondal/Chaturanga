const fs = require('fs');

const scriptContent = fs.readFileSync('script.js', 'utf8');

let initialSetup = {
    "0-0": { name: "Ratha", isWhite: false }, "0-1": { name: "Ashva", isWhite: false }, "0-2": { name: "Gaja", isWhite: false },  "0-3": { name: "Mantri", isWhite: false }, "0-4": { name: "Raja", isWhite: false },  "0-5": { name: "Gaja", isWhite: false }, "0-6": { name: "Ashva", isWhite: false }, "0-7": { name: "Ratha", isWhite: false },
    "1-0": { name: "Padati", isWhite: false }, "1-1": { name: "Padati", isWhite: false }, "1-2": { name: "Padati", isWhite: false }, "1-3": { name: "Padati", isWhite: false }, "1-4": { name: "Padati", isWhite: false }, "1-5": { name: "Padati", isWhite: false }, "1-6": { name: "Padati", isWhite: false }, "1-7": { name: "Padati", isWhite: false },
    "6-0": { name: "Padati", isWhite: true }, "6-1": { name: "Padati", isWhite: true }, "6-2": { name: "Padati", isWhite: true }, "6-3": { name: "Padati", isWhite: true }, "6-4": { name: "Padati", isWhite: true }, "6-5": { name: "Padati", isWhite: true }, "6-6": { name: "Padati", isWhite: true }, "6-7": { name: "Padati", isWhite: true },
    "7-0": { name: "Ratha", isWhite: true }, "7-1": { name: "Ashva", isWhite: true }, "7-2": { name: "Gaja", isWhite: true },  "7-3": { name: "Mantri", isWhite: true }, "7-4": { name: "Raja", isWhite: true },  "7-5": { name: "Gaja", isWhite: true }, "7-6": { name: "Ashva", isWhite: true }, "7-7": { name: "Ratha", isWhite: true }
};

const SQUARE_KEYS = Array.from({length: 8}, (_, r) => Array.from({length: 8}, (_, c) => `${r}-${c}`));
const PIECE_SCORES = { 'Raja': 10000, 'Mantri': 90, 'Ratha': 50, 'Gaja': 40, 'Ashva': 30, 'Padati': 10 };
const aiMemory = { skillLevel: 20, userAggression: 0, totalMatches: 0 };
let isGameOver = false;

const STATIC_BOARD_KEYS = [];
for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
        STATIC_BOARD_KEYS.push(SQUARE_KEYS[r][c]);
    }
}


function evaluateBoardState() {
    let totalVal = 0;
    let defenseMultiplier = aiMemory.userAggression > 20 ? 1.2 : 1.0;
    for (const key in initialSetup) {
        if (initialSetup[key] === undefined) continue;
        const piece = initialSetup[key];
        const r = key.charCodeAt(0) - 48;
        let weight = PIECE_SCORES[piece.name];
        if (piece.name === 'Padati') {
            weight += piece.isWhite ? (7 - r) : r;
        }
        if (piece.isWhite) {
            totalVal -= weight;
        } else {
            totalVal += (weight * defenseMultiplier);
        }
    }
    return totalVal;
}

function evaluateBoardStateStatic() {
    let totalVal = 0;
    let defenseMultiplier = aiMemory.userAggression > 20 ? 1.2 : 1.0;
    for (let i = 0; i < 64; i++) {
        const key = STATIC_BOARD_KEYS[i];
        const piece = initialSetup[key];
        if (piece === undefined) continue;
        const r = key.charCodeAt(0) - 48;
        let weight = PIECE_SCORES[piece.name];
        if (piece.name === 'Padati') {
            weight += piece.isWhite ? (7 - r) : r;
        }
        if (piece.isWhite) {
            totalVal -= weight;
        } else {
            totalVal += (weight * defenseMultiplier);
        }
    }
    return totalVal;
}


function checkLegalMove(piece, fromR, fromC, toR, toC) {
    if (toR < 0 || toR > 7 || toC < 0 || toC > 7 || (fromR === toR && fromC === toC)) return false;
    const target = initialSetup[SQUARE_KEYS[toR][toC]];
    if (target && target.isWhite === piece.isWhite) return false;
    const rowDiff = Math.abs(toR - fromR), colDiff = Math.abs(toC - fromC);

    switch (piece.name) {
        case 'Padati': const dir = piece.isWhite ? -1 : 1; if (fromC === toC && toR === fromR + dir) return !target; if (colDiff === 1 && toR === fromR + dir) return target && target.isWhite !== piece.isWhite; return false;
        case 'Ratha': if (fromR !== toR && fromC !== toC) return false; const stepR = fromR === toR ? 0 : (toR > fromR ? 1 : -1), stepC = fromC === toC ? 0 : (toC > fromC ? 1 : -1); let checkR = fromR + stepR, checkC = fromC + stepC; while (checkR !== toR || checkC !== toC) { if (initialSetup[SQUARE_KEYS[checkR][checkC]]) return false; checkR += stepR; checkC += stepC; } return true;
        case 'Ashva': return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        case 'Gaja': return rowDiff === 2 && colDiff === 2;
        case 'Raja': return rowDiff <= 1 && colDiff <= 1;
        case 'Mantri': return rowDiff === 1 && colDiff === 1;
        default: return false;
    }
}

function minimaxUndefined(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0 || isGameOver) return evaluateBoardState();
    let foundMove = false;
    if (isAiMaximizing) {
        let maxEval = -Infinity;
        for (const key in initialSetup) {
            if (initialSetup[key] === undefined) continue;
            if (!initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; initialSetup[key] = undefined;
                            let evaluation = minimaxUndefined(depth - 1, false, alpha, beta);
                            initialSetup[key] = initialSetup[toKey]; initialSetup[toKey] = backup;

                            maxEval = Math.max(maxEval, evaluation);
                            alpha = Math.max(alpha, evaluation);
                            if (beta <= alpha) return maxEval;
                        }
                    }
                }
            }
        }
        if (!foundMove) return evaluateBoardState();
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const key in initialSetup) {
            if (initialSetup[key] === undefined) continue;
            if (initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; initialSetup[key] = undefined;
                            let evaluation = minimaxUndefined(depth - 1, true, alpha, beta);
                            initialSetup[key] = initialSetup[toKey]; initialSetup[toKey] = backup;

                            minEval = Math.min(minEval, evaluation);
                            beta = Math.min(beta, evaluation);
                            if (beta <= alpha) return minEval;
                        }
                    }
                }
            }
        }
        if (!foundMove) return evaluateBoardState();
        return minEval;
    }
}

function minimaxStaticKeys(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0 || isGameOver) return evaluateBoardStateStatic();
    let foundMove = false;
    if (isAiMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 64; i++) {
            const key = STATIC_BOARD_KEYS[i];
            const piece = initialSetup[key];
            if (piece === undefined) continue;
            if (!piece.isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48;
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = piece; initialSetup[key] = undefined;
                            let evaluation = minimaxStaticKeys(depth - 1, false, alpha, beta);
                            initialSetup[key] = piece; initialSetup[toKey] = backup;

                            maxEval = Math.max(maxEval, evaluation);
                            alpha = Math.max(alpha, evaluation);
                            if (beta <= alpha) return maxEval;
                        }
                    }
                }
            }
        }
        if (!foundMove) return evaluateBoardStateStatic();
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 64; i++) {
            const key = STATIC_BOARD_KEYS[i];
            const piece = initialSetup[key];
            if (piece === undefined) continue;
            if (piece.isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48;
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = piece; initialSetup[key] = undefined;
                            let evaluation = minimaxStaticKeys(depth - 1, true, alpha, beta);
                            initialSetup[key] = piece; initialSetup[toKey] = backup;

                            minEval = Math.min(minEval, evaluation);
                            beta = Math.min(beta, evaluation);
                            if (beta <= alpha) return minEval;
                        }
                    }
                }
            }
        }
        if (!foundMove) return evaluateBoardStateStatic();
        return minEval;
    }
}



function simulateAiEngineUndefined() {
    let moves = [];
    for (const key in initialSetup) {
        if (initialSetup[key] === undefined) continue;
        if (!initialSetup[key].isWhite) {
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                        moves.push({ fromKey: key, toKey: SQUARE_KEYS[toR][toC], piece: piece, targetPiece: initialSetup[SQUARE_KEYS[toR][toC]] });
                    }
                }
            }
        }
    }

    let thinkingDepth = 4; // pushed to 4 to emphasize overhead

    for (const move of moves) {
        const backup = initialSetup[move.toKey]; initialSetup[move.toKey] = initialSetup[move.fromKey]; initialSetup[move.fromKey] = undefined;
        move.minimaxWeight = minimaxUndefined(thinkingDepth, false, -Infinity, Infinity);
        initialSetup[move.fromKey] = initialSetup[move.toKey]; initialSetup[move.toKey] = backup;
    }
}

function simulateAiEngineStatic() {
    let moves = [];
    for (let i = 0; i < 64; i++) {
        const key = STATIC_BOARD_KEYS[i];
        const piece = initialSetup[key];
        if (piece === undefined) continue;
        if (!piece.isWhite) {
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48;
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                        moves.push({ fromKey: key, toKey: SQUARE_KEYS[toR][toC], piece: piece, targetPiece: initialSetup[SQUARE_KEYS[toR][toC]] });
                    }
                }
            }
        }
    }

    let thinkingDepth = 4; // pushed to 4 to emphasize overhead

    for (const move of moves) {
        const backup = initialSetup[move.toKey]; initialSetup[move.toKey] = initialSetup[move.fromKey]; initialSetup[move.fromKey] = undefined;
        move.minimaxWeight = minimaxStaticKeys(thinkingDepth, false, -Infinity, Infinity);
        initialSetup[move.fromKey] = initialSetup[move.toKey]; initialSetup[move.toKey] = backup;
    }
}

let startUndefined = performance.now();
simulateAiEngineUndefined();
let timeUndefined = performance.now() - startUndefined;

let startStatic = performance.now();
simulateAiEngineStatic();
let timeStatic = performance.now() - startStatic;

console.log("Undefined full turn:", timeUndefined);
console.log("Static full turn:", timeStatic);
