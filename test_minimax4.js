function withKeysCache() {
    let initialSetup = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    let ALL_KEYS = Object.keys(initialSetup); // simulating SQUARE_KEYS
    for (let i = 0; i < 1000000; i++) {
        for (let j = 0; j < ALL_KEYS.length; j++) {
            const key = ALL_KEYS[j];
            const piece = initialSetup[key];
            if (!piece) continue; // handle undefined/deleted
            if (piece.isWhite) {}
        }
    }
    return performance.now() - start;
}
function withForIn() {
    let initialSetup = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    for (let i = 0; i < 1000000; i++) {
        for (const key in initialSetup) {
            const piece = initialSetup[key];
            if (!piece) continue;
            if (piece.isWhite) {}
        }
    }
    return performance.now() - start;
}
console.log("Cached keys:", withKeysCache());
console.log("For in:", withForIn());
