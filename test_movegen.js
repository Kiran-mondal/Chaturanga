const iterations = 10000;
let initialSetup = {
    "4-4": { name: "Raja", isWhite: false },
    "1-1": { name: "Padati", isWhite: true }
};

const SQUARE_KEYS = Array.from({length: 8}, (_, r) => Array.from({length: 8}, (_, c) => `${r}-${c}`));

function checkLegalMove(piece, fromR, fromC, toR, toC) {
    if (fromR === toR && fromC === toC) return false;
    const target = initialSetup[SQUARE_KEYS[toR][toC]];
    if (target && target.isWhite === piece.isWhite) return false;
    const rowDiff = Math.abs(toR - fromR), colDiff = Math.abs(toC - fromC);
    switch (piece.name) {
        case 'Padati': const dir = piece.isWhite ? -1 : 1; if (fromC === toC && toR === fromR + dir) return !target; if (colDiff === 1 && toR === fromR + dir) return target && target.isWhite !== piece.isWhite; return false;
        case 'Raja': return rowDiff <= 1 && colDiff <= 1;
        default: return false;
    }
}

function generateMovesOld(piece, fromR, fromC) {
    let moves = 0;
    for (let toR = 0; toR < 8; toR++) {
        for (let toC = 0; toC < 8; toC++) {
            if (checkLegalMove(piece, fromR, fromC, toR, toC)) {
                moves++;
            }
        }
    }
    return moves;
}

const PIECE_OFFSETS = {
    'Raja': [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]],
    'Mantri': [[-1,-1], [-1,1], [1,-1], [1,1]],
    'Gaja': [[-2,-2], [-2,2], [2,-2], [2,2]],
    'Ashva': [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]]
};

function generateMovesNew(piece, fromR, fromC) {
    let moves = 0;
    const offsets = PIECE_OFFSETS[piece.name];
    if (offsets) {
        for (let i = 0; i < offsets.length; i++) {
            const toR = fromR + offsets[i][0];
            const toC = fromC + offsets[i][1];
            if (toR >= 0 && toR <= 7 && toC >= 0 && toC <= 7) {
                if (checkLegalMove(piece, fromR, fromC, toR, toC)) moves++;
            }
        }
    } else {
        // Fallback to full board for Ratha and Padati, or implement logic
        for (let toR = 0; toR < 8; toR++) {
            for (let toC = 0; toC < 8; toC++) {
                if (checkLegalMove(piece, fromR, fromC, toR, toC)) moves++;
            }
        }
    }
    return moves;
}

let startOld = performance.now();
for (let i = 0; i < iterations; i++) {
    generateMovesOld(initialSetup["4-4"], 4, 4);
}
console.log("Old time:", performance.now() - startOld);

let startNew = performance.now();
for (let i = 0; i < iterations; i++) {
    generateMovesNew(initialSetup["4-4"], 4, 4);
}
console.log("New time:", performance.now() - startNew);
