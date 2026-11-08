const iterations = 1000;
let initialSetup = {
    "0-0": { name: "Ratha", isWhite: false }, "0-1": { name: "Ashva", isWhite: false }, "0-2": { name: "Gaja", isWhite: false },  "0-3": { name: "Mantri", isWhite: false }, "0-4": { name: "Raja", isWhite: false },  "0-5": { name: "Gaja", isWhite: false }, "0-6": { name: "Ashva", isWhite: false }, "0-7": { name: "Ratha", isWhite: false },
    "1-0": { name: "Padati", isWhite: false }, "1-1": { name: "Padati", isWhite: false }, "1-2": { name: "Padati", isWhite: false }, "1-3": { name: "Padati", isWhite: false }, "1-4": { name: "Padati", isWhite: false }, "1-5": { name: "Padati", isWhite: false }, "1-6": { name: "Padati", isWhite: false }, "1-7": { name: "Padati", isWhite: false },
    "6-0": { name: "Padati", isWhite: true }, "6-1": { name: "Padati", isWhite: true }, "6-2": { name: "Padati", isWhite: true }, "6-3": { name: "Padati", isWhite: true }, "6-4": { name: "Padati", isWhite: true }, "6-5": { name: "Padati", isWhite: true }, "6-6": { name: "Padati", isWhite: true }, "6-7": { name: "Padati", isWhite: true },
    "7-0": { name: "Ratha", isWhite: true }, "7-1": { name: "Ashva", isWhite: true }, "7-2": { name: "Gaja", isWhite: true },  "7-3": { name: "Mantri", isWhite: true }, "7-4": { name: "Raja", isWhite: true },  "7-5": { name: "Gaja", isWhite: true }, "7-6": { name: "Ashva", isWhite: true }, "7-7": { name: "Ratha", isWhite: true }
};

let STATIC_BOARD = new Array(64).fill(null);
for (const key in initialSetup) {
    let r = key.charCodeAt(0) - 48;
    let c = key.charCodeAt(2) - 48;
    STATIC_BOARD[r * 8 + c] = initialSetup[key];
}

function testDelete() {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const key in initialSetup) {
            let backup = initialSetup['3-3'];
            initialSetup['3-3'] = initialSetup[key];
            delete initialSetup[key];

            // recursion depth 1
            for (const key2 in initialSetup) {}

            initialSetup[key] = initialSetup['3-3'];
            if(backup) initialSetup['3-3'] = backup; else delete initialSetup['3-3'];
        }
    }
    return performance.now() - start;
}

function testStaticArray() {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < 64; j++) {
            let piece = STATIC_BOARD[j];
            if (piece === null) continue;
            let targetIdx = 27; // '3-3'
            let backup = STATIC_BOARD[targetIdx];
            STATIC_BOARD[targetIdx] = piece;
            STATIC_BOARD[j] = null;

            // recursion depth 1
            for (let k = 0; k < 64; k++) {
                if (STATIC_BOARD[k] !== null) {}
            }

            STATIC_BOARD[j] = piece;
            STATIC_BOARD[targetIdx] = backup;
        }
    }
    return performance.now() - start;
}

function testUndefined() {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const key in initialSetup) {
            if (initialSetup[key] === undefined) continue;
            let backup = initialSetup['3-3'];
            initialSetup['3-3'] = initialSetup[key];
            initialSetup[key] = undefined;

            // recursion depth 1
            for (const key2 in initialSetup) {
                if (initialSetup[key2] === undefined) continue;
            }

            initialSetup[key] = initialSetup['3-3'];
            initialSetup['3-3'] = backup;
        }
    }
    return performance.now() - start;
}

console.log("Delete Time:", testDelete());
console.log("Static Array Time:", testStaticArray());
console.log("Undefined Time:", testUndefined());
