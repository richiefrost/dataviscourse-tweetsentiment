import { TweetMap } from './map.js';
import { Info } from './info.js';
import { getTotalByState } from './util.js';

async function main() {
    // Load these asynchronously.
    // const dataProm = d3.json('data/tweets-with-sentiment.json');
    const dataProm = d3.json('data/tweets-with-state.json');
    const mapProm = d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson');
    const [data, map] = await Promise.all([dataProm, mapProm]);
    console.log(data);
    console.log(map);

    const totals = getTotalByState(data);
    console.log(totals);

    const tweetMap = new TweetMap('#us-map', map);
    //tweetMap.renderTweets(data);
    tweetMap.renderTotals(totals);

    const info = new Info(data);
    info.displayInfo();
}

main();
