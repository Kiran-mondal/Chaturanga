function withForIn() {
    let sum = 0;
    let obj = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    for (let i = 0; i < 1000000; i++) {
        for (const key in obj) {
            sum++;
        }
    }
    return performance.now() - start;
}

function withArray() {
    let sum = 0;
    let obj = { '0-0': { isWhite: false }, '1-1': { isWhite: true }, '7-7': { isWhite: false } };
    let start = performance.now();
    let keys = Object.keys(obj);
    for (let i = 0; i < 1000000; i++) {
        for (let j = 0; j < keys.length; j++) {
            sum++;
        }
    }
    return performance.now() - start;
}

console.log("For in:", withForIn());
console.log("Array:", withArray());
