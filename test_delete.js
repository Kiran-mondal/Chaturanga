const iterations = 1000000;

function withDelete() {
    let obj = { a: 1, b: 2, c: 3 };
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        let backup = obj.b;
        delete obj.b;
        obj.d = backup;

        backup = obj.d;
        delete obj.d;
        obj.b = backup;
    }
    return performance.now() - start;
}

function withUndefined() {
    let obj = { a: 1, b: 2, c: 3, d: undefined };
    let start = performance.now();
    for (let i = 0; i < iterations; i++) {
        let backup = obj.b;
        obj.b = undefined;
        obj.d = backup;

        backup = obj.d;
        obj.d = undefined;
        obj.b = backup;
    }
    return performance.now() - start;
}

console.log("withDelete:", withDelete(), "ms");
console.log("withUndefined:", withUndefined(), "ms");
