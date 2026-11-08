const iterations = 1000000;

function withCharCode() {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        let key = '7-5';
        let r = key.charCodeAt(0) - 48;
        let c = key.charCodeAt(2) - 48;
    }
    return performance.now() - start;
}

function withIndex() {
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        let key = '7-5';
        let r = parseInt(key[0], 10);
        let c = parseInt(key[2], 10);
    }
    return performance.now() - start;
}

console.log("withCharCode:", withCharCode(), "ms");
console.log("withIndex:", withIndex(), "ms");
