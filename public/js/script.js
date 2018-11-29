import { TweetMap } from './map.js';
import { Info } from './info.js';
import { getTotalByState, getAverageSentimentByState, getStateRanks, getTopTweetsByState } from './util.js';

async function main() {
    // Load these asynchronously.
    // const dataProm = d3.json('data/tweets-with-sentiment.json');
    const dataProm = d3.json('data/tweets-with-state.json');
    const mapProm = d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson');
    const [data, map] = await Promise.all([dataProm, mapProm]);
    
    function changeMapView(viewType) {
        let totals, averages, ranks;
        switch(viewType) {
            case 'Average sentiment':
                averages = getAverageSentimentByState(data);
                tweetMap.renderAverageSentiment(averages);
                break;
            case 'Total tweets':
                totals = getTotalByState(data);
                tweetMap.renderTotals(totals);
                break;
            case 'Happiest ranked states':
                totals = getTotalByState(data.filter(tweet => tweet.sentiment_score >= 0.5));
                // Normalize by taking the rank of each state
                ranks = getStateRanks(totals, 'asc');
                tweetMap.renderMapFill(ranks, d3.interpolateGreens);
                break;
            case 'Angriest ranked states':
                totals = getTotalByState(data.filter(tweet => tweet.sentiment_score < 0.5));
                // Normalize by taking the rank of each state
                ranks = getStateRanks(totals, 'asc');
                tweetMap.renderMapFill(ranks, d3.interpolateReds);
                break;
            /*
            Not sure how to make this interpretable?
            case 'Average happy':
                averages = getAverageSentimentByState(data.filter(tweet => tweet.sentiment_score >= 0.5));
                ranks = getStateRanks(averages, 'desc');
                tweetMap.renderAverageSentiment(ranks);
                break;
            */
            case 'Total bars':
                tweetMap.renderTweets(data);
                break;
            default:
                console.log(`Currently unsupported view type '${viewType}'`);
        }
    }

    const topTweets = getTopTweetsByState(data);

    // Set up the view switcher
    const viewTypes = ['Average sentiment', 'Total tweets', 'Happiest ranked states', 'Angriest ranked states'];
    const viewSelect = d3.select('#viewSelect')
        .append('select')
        .classed('form-control', true)
        .style('width', '70%');
    const viewOptions = viewSelect.selectAll('option').data(viewTypes);
    viewOptions.exit().remove();
    viewOptions.enter().append('option')
        .attr('value', viewType => viewType)
        .text(viewType => viewType);
    viewSelect.on('change', function(d, i) {
        let viewType = viewTypes[this.selectedIndex];
        changeMapView(viewType);
    });

    let avgSentiments = getAverageSentimentByState(data);
    let totalTweets = getTotalByState(data);
    let totalHappy = getTotalByState(data.filter(tweet => tweet.sentiment_score >= 0.5));
    let totalAngry = getTotalByState(data.filter(tweet => tweet.sentiment_score < 0.5));
    
    const tweetMap = new TweetMap('#us-map', map, avgSentiments, totalTweets, totalHappy, totalAngry, topTweets);
    tweetMap.renderAverageSentiment(avgSentiments);

    const info = new Info(data, changeMapView);
    info.displayInfo();
}

main();

