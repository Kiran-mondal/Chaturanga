function minimaxDelete() {
    let board = { 'a': 1, 'b': 2, 'c': 3, 'd': 4 };
    let start = performance.now();
    let sum = 0;
    for(let i=0; i<1000000; i++) {
        for(let key in board) {
            let backup = board['a'];
            board['a'] = board[key];
            delete board[key];

            for(let key2 in board) { sum++; } // Trigger a loop over keys

            board[key] = board['a'];
            if(backup) board['a'] = backup; else delete board['a'];
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
            let backup = board['a'];
            board['a'] = board[key];
            board[key] = undefined;

            for(let key2 in board) { if(board[key2] !== undefined) sum++; }

            board[key] = board['a'];
            board['a'] = backup;
        }
    }
    return performance.now() - start;
}

console.log("Delete loop:", minimaxDelete());
console.log("Undefined loop:", minimaxUndefined());
