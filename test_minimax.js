const fs = require('fs');

// We simulate the minimax loop with delete vs undefined
function testDelete() {
    let obj = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    for (let i = 0; i < 1000000; i++) {
        for (const key in obj) {
            let backup = obj['7-7'];
            obj['7-7'] = obj[key];
            delete obj[key];
            // do something
            obj[key] = obj['7-7'];
            if (backup) obj['7-7'] = backup; else delete obj['7-7'];
        }
    }
    return performance.now() - start;
}

function testUndefined() {
    let obj = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    for (let i = 0; i < 1000000; i++) {
        for (const key in obj) {
            if (!obj[key]) continue;
            let backup = obj['7-7'];
            obj['7-7'] = obj[key];
            obj[key] = undefined;
            // do something
            obj[key] = obj['7-7'];
            obj['7-7'] = backup; // Since backup can be undefined
        }
    }
    return performance.now() - start;
}

console.log("Delete:", testDelete());
console.log("Undefined:", testUndefined());
