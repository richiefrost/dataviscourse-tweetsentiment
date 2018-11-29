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
        // hacky way to make sentiment scale from -1 to 1
        averages[state] = ((totals[state] / counts[state]) - 0.5491584409915266) * 10;
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

// returns object {state: { positive: {sentiment, tweet}, negative: {sentiment, tweet} } }
export function getTopTweetsByState(jsonData){
   const topTweets = {};

   for (let element of jsonData) {
        let state = element.state.code;

        if(!topTweets.hasOwnProperty(state)){
            let positiveSentiment = element.sentiment_score >= 0.5 ? element.sentiment_score : null;
            let positiveTweet = element.sentiment_score >= 0.5 ? element.text : null;

            let negativeSentiment = element.sentiment_score < 0.5 ? element.sentiment_score : null;
            let negativeTweet = element.sentiment_score < 0.5 ? element.text : null;

            topTweets[state] = {
                'positive': {
                    'sentiment': positiveSentiment,
                    'tweet': positiveTweet,
                },
                'negative': {
                    'sentiment': negativeSentiment,
                    'tweet': negativeTweet,
                }
            }
        } else {
            if(element.sentiment_score >= 0.5) {
                if(topTweets[state].positive.sentiment == null || element.sentiment_score > topTweets[state].positive.sentiment) {
                    topTweets[state].positive.sentiment = element.sentiment_score;
                    topTweets[state].positive.tweet = element.text;
                }
            } else {
                 if(topTweets[state].negative.sentiment == null || element.sentiment_score < topTweets[state].negative.sentiment) {
                    topTweets[state].negative.sentiment = element.sentiment_score;
                    topTweets[state].negative.tweet = element.text;
                }
            }
        }
    } 
    return topTweets;
}

export function getTweetsByTime(jsonData){
    const dates = {};
    const counts = {};

    for (let element of jsonData) {
        let dateArray = element.date.split("-");
        let date = dateArray[0] + "-" + dateArray[1];
        
        if(!dates.hasOwnProperty(date)){
            dates[date] = element.sentiment_score;
            counts[date] = 1;
        } else {
            dates[date] += element.sentiment_score;
            counts[date] += 1;
        }
    }

    const averages = [];
    for (let date of Object.keys(dates)) {
        // hacky way to make sentiment scale from -1 to 1
        averages.push({
            'date': date,
            'sentiment': ((dates[date] / counts[date]) - 0.5491584409915266) * 10,
        });
    }
    console.log(JSON.stringify(averages));
    return averages;
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
