export function identity(x) {
    return x;
}

export function minBy(eles, key=identity, invert=false) {
    let maxVal = undefined;
    let maxKey = undefined;

    for (const ele of eles) {
        const temp = key(ele);
        if (!maxVal || (invert && temp > maxKey) || (!invert && temp < maxKey)) {
            maxVal = ele;
            maxKey = temp;
        }
    }

    return maxVal;
}

export function uniformRandom(begin, end) {
    return (end - begin) * Math.random() + begin;
}

export function sum(arr) {
    return arr.reduce((x1, x2) => x1 + x2, 0);
}
