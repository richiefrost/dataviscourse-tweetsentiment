export class Info {
    constructor(data) {
        this.tweets = data;
        
        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 20, left: 50};
        let infoSection = d3.select("#info");
        
        //fetch the svg bounds
        this.svgBounds = infoSection.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 150;

        //add the svg to the div
        this.svg = infoSection.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
    }

    displayInfo() {
        let positiveTweets = _.filter(this.tweets, function(tweet){
            return tweet.sentiment_score >= 0.5;
        });

        let negativeTweets = _.filter(this.tweets, function(tweet){
            return tweet.sentiment_score < 0.5;
        });

        let percentPositive = (positiveTweets.length / this.tweets.length) * 100;
        let percentNegative = (negativeTweets.length / this.tweets.length) * 100;
        
        let svg = d3.select("#info").select('svg');

        let selection = svg.selectAll('g')
            .data([{
                'positive': percentPositive, 
                'negative': percentNegative,
                'total': this.tweets.length,
                'totalPositive': positiveTweets.length,
                'totalNegative': negativeTweets.length,
            }]);

        let tweetBreakdown = selection.enter()
            .append('g');
            
        tweetBreakdown.append('text')
            .attr('x', 0)
            .attr('y', 20)
            .text(d => 'Total tweets: ' + d.total);

        let positiveGroup = selection.enter()
            .append('g');
            
        positiveGroup.append('rect')
            .attr('height', 20)
            .attr('width', d => d.positive+'%')
            .attr('x', 0)
            .attr('y', 50)
            .classed('positive', true);

        positiveGroup.append('text')
            .classed('positive', true)
            .attr('x', 0)
            .attr('y', 45)
            .text(d => Math.round(d.positive) + "% Positive Tweets");

        positiveGroup.append('text')
            .classed('white', true)
            .attr('x', 5)
            .attr('y', 65)
            .text(d => d.totalPositive);

        let negativeGroup = selection.enter()
            .append('g');

        negativeGroup.append('rect')
            .attr('height', 20)
            .attr('width', d => d.negative+'%')
            .attr('x', 0)
            .attr('y', 100)
            .classed('negative', true);

        negativeGroup.append('text')
            .classed('negative', true)
            .attr('x', 0)
            .attr('y', 95)
            .text(d => Math.round(d.negative) + "% Negative Tweets");

        negativeGroup.append('text')
            .classed('white', true)
            .attr('x', 5)
            .attr('y', 115)
            .text(d => d.totalNegative);
    }
}