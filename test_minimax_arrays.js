const iterations = 10000;
let initialSetup = {
    "0-0": { name: "Ratha", isWhite: false }, "0-1": { name: "Ashva", isWhite: false }, "0-2": { name: "Gaja", isWhite: false },  "0-3": { name: "Mantri", isWhite: false }, "0-4": { name: "Raja", isWhite: false },  "0-5": { name: "Gaja", isWhite: false }, "0-6": { name: "Ashva", isWhite: false }, "0-7": { name: "Ratha", isWhite: false },
    "1-0": { name: "Padati", isWhite: false }, "1-1": { name: "Padati", isWhite: false }, "1-2": { name: "Padati", isWhite: false }, "1-3": { name: "Padati", isWhite: false }, "1-4": { name: "Padati", isWhite: false }, "1-5": { name: "Padati", isWhite: false }, "1-6": { name: "Padati", isWhite: false }, "1-7": { name: "Padati", isWhite: false },
    "6-0": { name: "Padati", isWhite: true }, "6-1": { name: "Padati", isWhite: true }, "6-2": { name: "Padati", isWhite: true }, "6-3": { name: "Padati", isWhite: true }, "6-4": { name: "Padati", isWhite: true }, "6-5": { name: "Padati", isWhite: true }, "6-6": { name: "Padati", isWhite: true }, "6-7": { name: "Padati", isWhite: true },
    "7-0": { name: "Ratha", isWhite: true }, "7-1": { name: "Ashva", isWhite: true }, "7-2": { name: "Gaja", isWhite: true },  "7-3": { name: "Mantri", isWhite: true }, "7-4": { name: "Raja", isWhite: true },  "7-5": { name: "Gaja", isWhite: true }, "7-6": { name: "Ashva", isWhite: true }, "7-7": { name: "Ratha", isWhite: true }
};

let STATIC_KEYS = Object.keys(initialSetup);
const SQUARE_KEYS = Array.from({length: 8}, (_, r) => Array.from({length: 8}, (_, c) => `${r}-${c}`));

function evaluateBoardState() {
    let totalVal = 0;
    for (const key in initialSetup) {
        if (!initialSetup[key]) continue;
        const piece = initialSetup[key];
        const r = key.charCodeAt(0) - 48;
        if (piece.isWhite) {
            totalVal -= 10;
        } else {
            totalVal += 10;
        }
    }
    return totalVal;
}

function minimaxForIn(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0) return evaluateBoardState();
    let foundMove = false;
    let maxEval = isAiMaximizing ? -Infinity : Infinity;

    for (const key in initialSetup) {
        if (!initialSetup[key]) continue;
        if (initialSetup[key].isWhite !== isAiMaximizing) {
            const piece = initialSetup[key];
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    // simulate move validation
                    if (toR !== toC) {
                        foundMove = true;
                        const toKey = SQUARE_KEYS[toR][toC];
                        const backup = initialSetup[toKey]; initialSetup[toKey] = initialSetup[key]; initialSetup[key] = undefined;
                        let evaluation = minimaxForIn(depth - 1, !isAiMaximizing, alpha, beta);
                        initialSetup[key] = initialSetup[toKey]; initialSetup[toKey] = backup;

                        if (isAiMaximizing) {
                            maxEval = Math.max(maxEval, evaluation);
                            alpha = Math.max(alpha, evaluation);
                            if (beta <= alpha) return maxEval;
                        } else {
                            maxEval = Math.min(maxEval, evaluation);
                            beta = Math.min(beta, evaluation);
                            if (beta <= alpha) return maxEval;
                        }
                    }
                }
            }
        }
    }
    if (!foundMove) return evaluateBoardState();
    return maxEval;
}

let startForIn = performance.now();
minimaxForIn(2, false, -Infinity, Infinity);
let timeForIn = performance.now() - startForIn;


let boardArray = new Array(64).fill(null);
for (const key in initialSetup) {
    let r = key.charCodeAt(0) - 48;
    let c = key.charCodeAt(2) - 48;
    boardArray[r * 8 + c] = initialSetup[key];
}

function evaluateBoardStateArray() {
    let totalVal = 0;
    for (let i = 0; i < 64; i++) {
        let piece = boardArray[i];
        if (!piece) continue;
        if (piece.isWhite) {
            totalVal -= 10;
        } else {
            totalVal += 10;
        }
    }
    return totalVal;
}

function minimaxArray(depth, isAiMaximizing, alpha, beta) {
    if (depth === 0) return evaluateBoardStateArray();
    let foundMove = false;
    let maxEval = isAiMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 64; i++) {
        let piece = boardArray[i];
        if (!piece) continue;
        if (piece.isWhite !== isAiMaximizing) {
            let fromR = Math.floor(i / 8);
            let fromC = i % 8;
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    // simulate move validation
                    if (toR !== toC) {
                        foundMove = true;
                        let toIdx = toR * 8 + toC;
                        let backup = boardArray[toIdx];
                        boardArray[toIdx] = piece;
                        boardArray[i] = null;

                        let evaluation = minimaxArray(depth - 1, !isAiMaximizing, alpha, beta);

                        boardArray[i] = piece;
                        boardArray[toIdx] = backup;

                        if (isAiMaximizing) {
                            maxEval = Math.max(maxEval, evaluation);
                            alpha = Math.max(alpha, evaluation);
                            if (beta <= alpha) return maxEval;
                        } else {
                            maxEval = Math.min(maxEval, evaluation);
                            beta = Math.min(beta, evaluation);
                            if (beta <= alpha) return maxEval;
                        }
                    }
                }
            }
        }
    }
    if (!foundMove) return evaluateBoardStateArray();
    return maxEval;
}

let startArray = performance.now();
minimaxArray(2, false, -Infinity, Infinity);
let timeArray = performance.now() - startArray;


console.log("For In tree search:", timeForIn);
console.log("1D Array tree search:", timeArray);
