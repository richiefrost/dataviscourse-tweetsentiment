import { TweetMap } from './map.js';
import { Info } from './info.js';

const generateSentiment = (tweets) => {
    let sentimentTweets = [];

    tweets.forEach(function(tweet, i){
        const sentiment = Math.random();
        tweet.sentiment = sentiment;
        sentimentTweets.push(tweet);
    });
    
    return sentimentTweets;
}

async function main() {
    // Load these asynchronously.
    // const dataProm = d3.json('data/tweets-with-sentiment.json');
    const dataProm = d3.json('data/raw_tweets.json');
    const mapProm = d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson');
    let [data, map] = await Promise.all([dataProm, mapProm]);
    console.log(data);
    console.log(map);

    const tweetMap = new TweetMap('#us-map', map);
    tweetMap.renderTweets(data);

    // apply random sentiment to each tweet for now
    data = generateSentiment(data);

    const info = new Info(data);
    info.displayInfo();
}

main();
