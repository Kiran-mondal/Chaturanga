function testDelete() {
    let board = {};
    for (let i = 0; i < 32; i++) board[`key-${i}`] = { val: i };
    let start = performance.now();
    for(let i=0; i<10000; i++) {
        for(let key in board) {
            let backup = board['key-31'];
            board['key-31'] = board[key];
            delete board[key];

            // recursion depth 1
            for(let key2 in board) {}

            board[key] = board['key-31'];
            if(backup) board['key-31'] = backup; else delete board['key-31'];
        }
    }
    return performance.now() - start;
}

function testUndefined() {
    let board = {};
    for (let i = 0; i < 32; i++) board[`key-${i}`] = { val: i };
    let start = performance.now();
    for(let i=0; i<10000; i++) {
        for(let key in board) {
            if(board[key] === undefined) continue;
            let backup = board['key-31'];
            board['key-31'] = board[key];
            board[key] = undefined;

            // recursion depth 1
            for(let key2 in board) {
                if(board[key2] === undefined) continue;
            }

            board[key] = board['key-31'];
            board['key-31'] = backup;
        }
    }
    return performance.now() - start;
}

console.log("Delete Time:", testDelete());
console.log("Undefined Time:", testUndefined());
