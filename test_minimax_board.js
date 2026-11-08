const fs = require('fs');

function evalBoardObject() {
    let board = { 'a': {name: 'Padati', isWhite: true}, 'b': {name: 'Raja', isWhite: false} };
    let PIECE_SCORES = { 'Padati': 10, 'Raja': 100 };
    let start = performance.now();
    let sum = 0;
    for(let i=0; i<1000000; i++) {
        for(let key in board) {
            let p = board[key];
            sum += PIECE_SCORES[p.name];
        }
    }
    return performance.now() - start;
}

console.log("Obj eval:", evalBoardObject());
