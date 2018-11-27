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

export function getAverageSentimentByState(jsonData) {
    const totals = {};
    const counts = {};
    for (let element of jsonData) {
        let state = element.state.code;
        if (!totals.hasOwnProperty(state)) {
            totals[state] = 0;
            counts[state] = 0;
        }
        totals[state] += element.sentiment_score;
        counts[state] += 1;
    }

    const averages = {};
    for (let state of Object.keys(totals)) {
        averages[state] = totals[state] / counts[state];
    }

    return averages;
}

// Returns an object, {state: total}
export function getTotalByState(jsonData) {
    const totals = {};
    for (let element of jsonData) {
        let state = element.state.code;
        if (!totals.hasOwnProperty(state)) {
            totals[state] = 0;
        }
        totals[state] += 1;
    }

    return totals;
}

export function getStateRanks(stateData, sortDir = 'asc') {
    const ranksArray = Object.keys(stateData).map(state => [state, stateData[state]]);
    if (sortDir === 'asc') {
        ranksArray.sort((a, b) => a[1] - b[1]);
    }
    else {
        ranksArray.sort((a, b) => b[1] - a[1]);
    }
    const ranks = {};
    for (let [index, rank] of ranksArray.entries()) {
        ranks[rank[0]] = index + 1;
    }
    return ranks;
}

export function uniformRandom(begin, end) {
    return (end - begin) * Math.random() + begin;
}

export function sum(arr) {
    return arr.reduce((x1, x2) => x1 + x2, 0);
}
