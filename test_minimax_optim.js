const iterations = 10000;
const boardKeys = [
    '0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6', '0-7',
    '1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7',
    '6-0', '6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7',
    '7-0', '7-1', '7-2', '7-3', '7-4', '7-5', '7-6', '7-7'
];

function initBoard() {
    let board = {};
    for (let k of boardKeys) {
        let isWhite = k.startsWith('6') || k.startsWith('7');
        board[k] = { name: 'Padati', isWhite: isWhite };
    }
    return board;
}

function testDelete(board) {
    let sum = 0;
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (let key in board) {
            if (!board[key].isWhite) {
                let toKey = '4-4'; // some move
                let backup = board[toKey];
                board[toKey] = board[key];
                delete board[key];

                sum++; // do minimax...

                board[key] = board[toKey];
                if (backup) board[toKey] = backup;
                else delete board[toKey];
            }
        }
    }
    return { time: performance.now() - start, sum };
}

function testUndefined(board) {
    let sum = 0;
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (let key in board) {
            if (board[key] === undefined) continue;
            if (!board[key].isWhite) {
                let toKey = '4-4'; // some move
                let backup = board[toKey];
                board[toKey] = board[key];
                board[key] = undefined;

                sum++; // do minimax...

                board[key] = board[toKey];
                board[toKey] = backup;
            }
        }
    }
    return { time: performance.now() - start, sum };
}

console.log("Delete test:", testDelete(initBoard()));
console.log("Undefined test:", testUndefined(initBoard()));
