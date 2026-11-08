const fs = require('fs');

function evaluateBoardStateDelete() {
    let initialSetup = { '0-0': { name: 'Padati', isWhite: false }, '1-1': { name: 'Raja', isWhite: true }, '7-7': { name: 'Gaja', isWhite: false } };
    let start = performance.now();
    let val = 0;
    for (let i = 0; i < 1000000; i++) {
        val = 0;
        for (const key in initialSetup) {
            val++;
        }
    }
    return { val, time: performance.now() - start };
}

function evaluateBoardStateUndefined() {
    let initialSetup = { '0-0': { name: 'Padati', isWhite: false }, '1-1': { name: 'Raja', isWhite: true }, '7-7': { name: 'Gaja', isWhite: false } };
    let start = performance.now();
    let val = 0;
    for (let i = 0; i < 1000000; i++) {
        val = 0;
        for (const key in initialSetup) {
            if (initialSetup[key] === undefined) continue;
            val++;
        }
    }
    return { val, time: performance.now() - start };
}

console.log("Delete:", evaluateBoardStateDelete());
console.log("Undefined:", evaluateBoardStateUndefined());
