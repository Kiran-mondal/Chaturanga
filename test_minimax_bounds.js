let initialSetup = {
    "4-4": { name: "Padati", isWhite: false },
    "1-1": { name: "Raja", isWhite: true },
    "2-2": { name: "Ashva", isWhite: false },
    "7-7": { name: "Ratha", isWhite: true }
};

function checkLegalMove(piece, fromR, fromC, toR, toC) {
    if (toR < 0 || toR > 7 || toC < 0 || toC > 7 || (fromR === toR && fromC === toC)) return false;
    return true; // simplified for benchmark
}

function testUnbounded() {
    let start = performance.now();
    let checks = 0;
    for (let i = 0; i < 100000; i++) {
        for (const key in initialSetup) {
            const piece = initialSetup[key];
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48;
            for (let toR = 0; toR < 8; toR++) {
                for (let toC = 0; toC < 8; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) checks++;
                }
            }
        }
    }
    return { time: performance.now() - start, checks };
}

function testBounded() {
    let start = performance.now();
    let checks = 0;
    for (let i = 0; i < 100000; i++) {
        for (const key in initialSetup) {
            const piece = initialSetup[key];
            const fromR = key.charCodeAt(0) - 48, fromC = key.charCodeAt(2) - 48;

            // ⚡ BOLT: Add bounding box to skip impossible moves
            let minR = 0, maxR = 7, minC = 0, maxC = 7;
            if (piece.name === 'Padati' || piece.name === 'Raja' || piece.name === 'Mantri') { minR = Math.max(0, fromR - 1); maxR = Math.min(7, fromR + 1); minC = Math.max(0, fromC - 1); maxC = Math.min(7, fromC + 1); }
            else if (piece.name === 'Ashva' || piece.name === 'Gaja') { minR = Math.max(0, fromR - 2); maxR = Math.min(7, fromR + 2); minC = Math.max(0, fromC - 2); maxC = Math.min(7, fromC + 2); }

            for (let toR = minR; toR <= maxR; toR++) {
                for (let toC = minC; toC <= maxC; toC++) {
                    if (checkLegalMove(piece, fromR, fromC, toR, toC)) checks++;
                }
            }
        }
    }
    return { time: performance.now() - start, checks };
}

console.log("Unbounded:", testUnbounded());
console.log("Bounded:", testBounded());
