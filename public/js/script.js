import { TweetMap } from './map.js';
import { Info } from './info.js';
import { getTotalByState, getAverageSentimentByState, getStateRanks } from './util.js';

async function main() {
    // Load these asynchronously.
    // const dataProm = d3.json('data/tweets-with-sentiment.json');
    const dataProm = d3.json('data/tweets-with-state.json');
    const mapProm = d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson');
    const [data, map] = await Promise.all([dataProm, mapProm]);
    
    function changeMapView(viewType) {
        let totals, averages, ranks;
        switch(viewType) {
            case 'Average':
                averages = getAverageSentimentByState(data);
                tweetMap.renderAverageSentiment(averages);
                break;
            case 'Total':
                totals = getTotalByState(data);
                tweetMap.renderTotals(totals);
                break;
            case 'Total happy':
                totals = getTotalByState(data.filter(tweet => tweet.sentiment_score >= 0.5));
                // Normalize by taking the rank of each state
                ranks = getStateRanks(totals, 'asc');
                tweetMap.renderMapFill(ranks, d3.interpolateGreens);
                break;
            case 'Total angry':
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

    // Set up the view switcher
    const viewTypes = ['Average', 'Total', 'Total happy', 'Total angry', 'Total bars'];
    const viewSelect = d3.select('#viewSelect').append('select');
    const viewOptions = viewSelect.selectAll('option').data(viewTypes);
    viewOptions.exit().remove();
    viewOptions.enter().append('option')
        .attr('value', viewType => viewType)
        .text(viewType => viewType);
    viewSelect.on('change', function(d, i) {
        let viewType = viewTypes[this.selectedIndex];
        changeMapView(viewType);
    });
    
    const tweetMap = new TweetMap('#us-map', map);
    tweetMap.renderAverageSentiment(getAverageSentimentByState(data));

    const info = new Info(data, changeMapView);
    info.displayInfo();
}

main();

