const SQUARE_KEYS = Array.from({length: 8}, (_, r) => Array.from({length: 8}, (_, c) => `${r}-${c}`));
function testDelete() {
    let initialSetup = { '0-0': { name: 'Padati', isWhite: false }, '1-1': { name: 'Raja', isWhite: true }, '7-7': { name: 'Gaja', isWhite: false } };
    let start = performance.now();
    for(let i=0; i<100000; i++) {
        for(let key in initialSetup) {
            let backup = initialSetup['7-7'];
            initialSetup['7-7'] = initialSetup[key];
            delete initialSetup[key];

            // minimax recursive call overhead
            for(let key2 in initialSetup) {}

            initialSetup[key] = initialSetup['7-7'];
            if(backup) initialSetup['7-7'] = backup; else delete initialSetup['7-7'];
        }
    }
    return performance.now() - start;
}

function testUndefined() {
    let initialSetup = { '0-0': { name: 'Padati', isWhite: false }, '1-1': { name: 'Raja', isWhite: true }, '7-7': { name: 'Gaja', isWhite: false } };
    let start = performance.now();
    for(let i=0; i<100000; i++) {
        for(let key in initialSetup) {
            if(initialSetup[key] === undefined) continue;
            let backup = initialSetup['7-7'];
            initialSetup['7-7'] = initialSetup[key];
            initialSetup[key] = undefined;

            // minimax recursive call overhead
            for(let key2 in initialSetup) {
                if(initialSetup[key2] === undefined) continue;
            }

            initialSetup[key] = initialSetup['7-7'];
            initialSetup['7-7'] = backup;
        }
    }
    return performance.now() - start;
}

console.log("Delete Time:", testDelete());
console.log("Undefined Time:", testUndefined());
