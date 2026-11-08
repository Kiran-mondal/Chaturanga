function minimaxDelete() {
    let board = { 'a': 1, 'b': 2, 'c': 3, 'd': 4 };
    let start = performance.now();
    let sum = 0;
    for(let i=0; i<1000000; i++) {
        for(let key in board) {
            let backup = board['x'];
            board['x'] = board[key];
            delete board[key];

            // simulating recursive loop where keys are evaluated
            let keys = Object.keys(board);
            for(let j=0; j<keys.length; j++) { sum++; }

            board[key] = board['x'];
            if(backup !== undefined) board['x'] = backup; else delete board['x'];
        }
    }
    return performance.now() - start;
}

function minimaxUndefined() {
    let board = { 'a': 1, 'b': 2, 'c': 3, 'd': 4 };
    let start = performance.now();
    let sum = 0;
    for(let i=0; i<1000000; i++) {
        for(let key in board) {
            if (board[key] === undefined) continue;
            let backup = board['x'];
            board['x'] = board[key];
            board[key] = undefined;

            let keys = Object.keys(board);
            for(let j=0; j<keys.length; j++) { if (board[keys[j]] !== undefined) sum++; }

            board[key] = board['x'];
            if(backup !== undefined) board['x'] = backup; else board['x'] = undefined;
        }
    }
    return performance.now() - start;
}

console.log("Delete Object.keys:", minimaxDelete());
console.log("Undefined Object.keys:", minimaxUndefined());
