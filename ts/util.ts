function assert(condition, message="Assertion failed") {
    if(!condition) {
        throw message;
    }
}

function sum(arr) {
    return arr.reduce((a, b) =>  a + b, 0);
}

function rndelem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
