const fs = require('fs');

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

function evaluateBoardState() {
    let totalVal = 0;
    let defenseMultiplier = aiMemory.userAggression > 20 ? 1.2 : 1.0;
    for (const key in initialSetup) {
        if (!initialSetup[key]) continue;
        const piece = initialSetup[key];
        const r = key.charCodeAt(0) - 48;
        let weight = PIECE_SCORES[piece.name];
        if (piece.name === 'Padati') weight += piece.isWhite ? (7 - r) : r;
        if (piece.isWhite) totalVal -= weight;
        else totalVal += (weight * defenseMultiplier);
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

function minimaxDeleteOld(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0 || isGameOver) return evaluateBoardState();
    let foundMove = false;
    if (isAiMaximizing) {
        let maxEval = -Infinity;
        for (const key in initialSetup) {
            if (!initialSetup[key]) continue;
            if (!initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; delete initialSetup[key];
                            let evaluation = minimaxDeleteOld(depth - 1, false, alpha, beta);
                            initialSetup[key] = initialSetup[toKey]; if (backup) initialSetup[toKey] = backup; else delete initialSetup[toKey];
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
            if (!initialSetup[key]) continue;
            if (initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                for (let toR = 0; toR < 8; toR++) {
                    for (let toC = 0; toC < 8; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; delete initialSetup[key];
                            let evaluation = minimaxDeleteOld(depth - 1, true, alpha, beta);
                            initialSetup[key] = initialSetup[toKey]; if (backup) initialSetup[toKey] = backup; else delete initialSetup[toKey];
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


function minimaxFastest(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0 || isGameOver) return evaluateBoardState();
    let foundMove = false;

    if (isAiMaximizing) {
        let maxEval = -Infinity;
        for (const key in initialSetup) {
            if (!initialSetup[key]) continue;
            if (!initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                let minR = 0, maxR = 7, minC = 0, maxC = 7;
                if (piece.name !== 'Ratha') {
                    const d = (piece.name === 'Ashva' || piece.name === 'Gaja') ? 2 : 1;
                    minR = Math.max(0, fromR - d); maxR = Math.min(7, fromR + d);
                    minC = Math.max(0, fromC - d); maxC = Math.min(7, fromC + d);
                }
                for (let toR = minR; toR <= maxR; toR++) {
                    for (let toC = minC; toC <= maxC; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; initialSetup[key] = undefined;
                            let evaluation = minimaxFastest(depth - 1, false, alpha, beta);
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
            if (!initialSetup[key]) continue;
            if (initialSetup[key].isWhite) {
                const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48, piece = initialSetup[key];
                let minR = 0, maxR = 7, minC = 0, maxC = 7;
                if (piece.name !== 'Ratha') {
                    const d = (piece.name === 'Ashva' || piece.name === 'Gaja') ? 2 : 1;
                    minR = Math.max(0, fromR - d); maxR = Math.min(7, fromR + d);
                    minC = Math.max(0, fromC - d); maxC = Math.min(7, fromC + d);
                }
                for (let toR = minR; toR <= maxR; toR++) {
                    for (let toC = minC; toC <= maxC; toC++) {
                        if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                            foundMove = true;
                            const toKey = SQUARE_KEYS[toR][toC];
                            const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; initialSetup[key] = undefined;
                            let evaluation = minimaxFastest(depth - 1, true, alpha, beta);
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


function simulateTurn(minimaxFunc, useDelete) {
    let start = performance.now();
    let moves = [];
    for (const key in initialSetup) {
        if (!initialSetup[key]) continue;
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
    for (const move of moves) {
        const backup = initialSetup[move.toKey]; initialSetup[move.toKey] = initialSetup[move.fromKey];
        if (useDelete) delete initialSetup[move.fromKey]; else initialSetup[move.fromKey] = undefined;
        move.minimaxWeight = minimaxFunc(4, false, -Infinity, Infinity);
        initialSetup[move.fromKey] = initialSetup[move.toKey];
        if (useDelete) { if(backup) initialSetup[move.toKey] = backup; else delete initialSetup[move.toKey]; }
        else initialSetup[move.toKey] = backup;
    }
    return performance.now() - start;
}

console.log("Original Baseline (Depth 4):", simulateTurn(minimaxDeleteOld, true));
console.log("Combined Optimization (Depth 4):", simulateTurn(minimaxFastest, false));
