import { minBy, sum, uniformRandom } from './util.js'

const CLUSTER_COUNT = 50;

const square = x => x * x;
const distance = (p1, p2) => Math.sqrt(square(p1[0] - p2[0]) + square(p1[1] - p2[1]));

const findCenterGen = centers => point => {
    return minBy(centers, center => distance(center, point));
};

const kmeans = (points, centers) => {
    let trueCenters = centers;

    const centersEqual = newCenters => {
        for (let i = 0; i < trueCenters.length; i++) {
            const c1 = trueCenters[i];
            const c2 = newCenters[i];

            if (c1[0] !== c2[0] || c1[1] !== c2[1]) {
                return false;
            }
        }

        return true;
    };

    while (true) {
        const clusterMap = new Map(trueCenters.map(center => [center, []]));
        const clusterFunc = findCenterGen(trueCenters);

        for (const point of points) {
            clusterMap.get(clusterFunc(point)).push(point);
        }

        const newCenters = Array.from(clusterMap.values()).map(clusterPoints => {
            const computeEle = pos => sum(clusterPoints.map(pt => pt[pos])) / clusterPoints.length;
            return [computeEle(0), computeEle(1)];
        });

        if (centersEqual(newCenters)) {
            return clusterFunc;
        } else {
            trueCenters = newCenters;
        }
    }
};

// Lets do a Gonzalez cluster for simplicity.
const pointCluster = (points, clusterCount) => {
    const centers = [points[0]];

    let findCenter = findCenterGen(centers);

    while (centers.length < clusterCount && centers.length < points.length) {
        const newCenter = minBy(points, point => {
            const pcenter = findCenter(point);
            return distance(pcenter, point);
        }, true);
        centers.push(newCenter);
        findCenter = findCenterGen(centers);
    }
    // const centers = new Set();
    // while (centers.size < clusterCount) {
    //     const index = Math.floor(uniformRandom(0, points.length));
    //     centers.add(points[index]);
    // }

    return kmeans(points, Array.from(centers));
};

export class TweetMap {
    constructor(selectorQuery, mapJSON, avgSentiments, totalTweets, totalHappy, totalAngry, topTweets) {
        // Based off of http://dataviscourse.net/tutorials/lectures/lecture-maps/
        // const center = {
        //     lon: -83.903347,
        //     lat: 38.769315
        // };
        const width = 800;
        const height = 500;
        const svg = d3
            .select(selectorQuery)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('class', 'data-map');

        const projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale([1000]);
        const path = d3.geoPath().projection(projection);

        svg.selectAll('path')
            .data(mapJSON.features)
            .enter()
            .append('path')
            .classed('state', true)
            .attr('d', path)
            .attr('id', d => d.properties.postal); // This assigns the state abbreviation to the state path

        d3.select('#us-map')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.svg = svg;
        this.projection = projection;
        this.bounds = {
            width,
            height
        };

        this.avgSentiments = avgSentiments;
        this.totalTweets = totalTweets;
        this.totalHappy = totalHappy;
        this.totalAngry = totalAngry;
        this.topTweets = topTweets;
    }

    renderTotals(totals) {
        const that = this;

        d3.select('#map-label').html('Total Tweets per State');

        const scale = d3.scaleSequential(d3.interpolateBlues)
            .domain(d3.extent(Object.keys(totals), state => totals[state])); // Domain based on state total

        this.svg.append('g')
            .attr('class', 'legend')
            .attr("transform", "translate(10,0)");

        let legend = d3.legendColor()
            .shapeWidth((this.bounds.width-40)/9)
            .shapeHeight(13)
            .cells(9)
            .orient('horizontal')
            .scale(scale)
            .labelAlign('middle')
            .labelOffset(3)
            .labels(['8', '', '', '', '500', '', '', '', '1000+']);

        this.svg.select('.legend')
            .call(legend);

        this.svg.selectAll('path')
            .attr('fill', d => scale(totals[d.properties.postal]))
            .on('mouseover', d => {
                d3.event.stopPropagation();
                d3.select(".tooltip")
                    .style("display", "inline")
                    .style("opacity", 0.9);
            })
            .on('mousemove', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .html(that.tooltipRender(d.properties.name, totals[d.properties.postal], 'Total tweets'))
                    .style("left", (d3.event.pageX) + "px")
                    .style('top', (d3.event.pageY - 200) + "px");
            })
            .on('mouseout', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .style("display", 'none')
                    .style('opacity', 0);
            });
    }

    renderAverageSentiment(averages) {
        const that = this;

        d3.select('#map-label').html('Average Sentiment per State');

        const sentimentDomain = d3.extent(Object.keys(averages), state => averages[state]);
        sentimentDomain.reverse(); // Reverse this so our color scale goes from blue to red.


        const scale = d3.scaleSequential(d3.interpolateRdBu)
            .domain(sentimentDomain);

        this.svg.append('g')
            .attr('class', 'legend')
            .attr("transform", "translate(10,0)");

        let legend = d3.legendColor()
            .shapeWidth((this.bounds.width-40)/9)
            .shapeHeight(13)
            .cells(9)
            .orient('horizontal')
            .scale(scale)
            .labelAlign('middle')
            .labelOffset(3)
            .labels(['Positive (+1)', '', '', '', 'Neutral (0)', '', '', '', 'Negative (-1)']);

        this.svg.select('.legend')
            .call(legend);

        this.svg.selectAll('path')
            .attr('fill', d => scale(averages[d.properties.postal]))
            .on('mouseover', d => {
                d3.event.stopPropagation();
                d3.select(".tooltip")
                    .style("display", "inline")
                    .style("opacity", 0.9);
            })
            .on('mousemove', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .html(that.tooltipRender(d.properties.name, averages[d.properties.postal].toFixed(4), 'Average Sentiment'))
                    .style("left", (d3.event.pageX) + "px")
                    .style('top', (d3.event.pageY - 200) + "px");
            })
            .on('mouseout', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .style("display", 'none')
                    .style('opacity', 0);
            })
            .on('click', d => {
                d3.event.stopPropagation();
                d3.select("#state-info")
                    .html(that.stateInfoRender(d));
            });
    }

    renderMapFill(stateData, colorInterpolation = d3.interpolateGreens) {
        const that = this;

        let labels = [];
        if(colorInterpolation == d3.interpolateGreens){
            d3.select('#map-label').html('Happiest Ranked States <small class="text-muted">based on number of happy tweets</small>');
            labels = ['Least Happy', '', '', '', '', '', '', '', 'Most Happy'];
        } else {
            d3.select('#map-label').html('Angriest Ranked States <small class="text-muted">based on number of angry tweets</small>');
            labels = ['Least Angry', '', '', '', '', '', '', '', 'Most Angry'];
        }

        const scale = d3.scaleSequential(colorInterpolation)
            .domain(d3.extent(Object.keys(stateData), state => stateData[state]));

        this.svg.append('g')
            .attr('class', 'legend')
            .attr("transform", "translate(10,0)");

        let legend = d3.legendColor()
            .shapeWidth((this.bounds.width-40)/9)
            .shapeHeight(13)
            .cells(9)
            .orient('horizontal')
            .scale(scale)
            .labelAlign('middle')
            .labelOffset(3)
            .labels(labels);

        this.svg.select('.legend')
            .call(legend);

        this.svg.selectAll('path')
            .attr('fill', d => scale(stateData[d.properties.postal]))
            .on('mouseover', d => {
                d3.event.stopPropagation();
                d3.select(".tooltip")
                    .style("display", "inline")
                    .style("opacity", 0.9);
            })
            .on('mousemove', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .html(that.tooltipRender(d.properties.name, stateData[d.properties.postal], 'Ranking'))
                    .style("left", (d3.event.pageX) + "px")
                    .style('top', (d3.event.pageY - 200) + "px");
            })
            .on('mouseout', d => {
                d3.event.stopPropagation();
                d3.select('.tooltip')
                    .style("display", 'none')
                    .style('opacity', 0);
            });
    }

    renderTweets(tweets) {
        const rawPoints = tweets.map(tweet =>{
            return tweet.geolocation.coordinates;
        }).filter(point => this.projection(point));

        const clusterFunc = pointCluster(rawPoints, CLUSTER_COUNT);
        const clusterMap = new Map();

        for (const point of rawPoints) {
            const cluster = clusterFunc(point);
            const currentVal = clusterMap.get(cluster) || 0;
            clusterMap.set(cluster, currentVal + 1);
        }

        const clusters = Array.from(clusterMap.keys());
        let rects = this.svg.selectAll('rect').data(clusters);

        rects.exit().remove();
        rects = rects.merge(rects.enter().append('rect'));
        const maxHeight = this.bounds.height / 12;
        const maxCount = minBy(clusterMap.values(), undefined, true);
        const basicScale = d3.scaleLinear().domain([0, maxCount]).range([0, maxHeight]);

        const projection = this.projection;

        const rectWidth = 10;
        rects
            .attr('x', point => projection(point)[0])
            .attr('y', point => projection(point)[1])
            .attr('width', rectWidth)
            .attr('height', point => basicScale(clusterMap.get(point)))
            .attr('transform', point => {
                const height = basicScale(clusterMap.get(point));
                return `translate(-${rectWidth / 2}, -${height / 2})`;
            });
    }

    tooltipRender(state, total, title) {
        return "<div><h4>"+state+"</h4>"+
            "<p>"+title+": "+total+"</p></div>";
    }

    stateInfoRender(d) {
        let html = "<div class='card border-secondary mb-3' style='margin-top: 30px; width: 95%'>";

        html += "<div class='card-header'>State Info</div>";
        html += "<div class='card-body'>";
        html += "<h4 class='card-title text-primary'>"+d.properties.name+"</h4>";

        html += "<ul class='list-group'>";
        html += "<li class='list-group-item d-flex justify-content-between align-items-center'>Total Tweets <span class='badge badge-info badge-pill'>"+this.totalTweets[d.properties.postal]+"</span></li>";
        html += "<li class='list-group-item d-flex justify-content-between align-items-center'>Positive Tweets <span class='badge badge-success badge-pill'>"+this.totalHappy[d.properties.postal]+"</span></li>";
        html += "<li class='list-group-item d-flex justify-content-between align-items-center'>Negative Tweets <span class='badge badge-danger badge-pill'>"+this.totalAngry[d.properties.postal]+"</span></li>";
        html += "<li class='list-group-item d-flex justify-content-between align-items-center'>Avg. Sentiment <span class='badge badge-light badge-pill'>"+this.avgSentiments[d.properties.postal].toFixed(4)+"</span></li>";
        html += "</ul>";

        html += '<div class="list-group">'
        html += '<a class="list-group-item list-group-item-action active" style="margin-top: 10px">Most Positive Tweet</a>';
        html += '<a class="list-group-item list-group-item-action">'+this.topTweets[d.properties.postal].positive.tweet+'</a>';
        html += '</div>';

        html += '<div class="list-group">'
        html += '<a class="list-group-item list-group-item-action active" style="margin-top: 10px">Most Negative Tweet</a>';
        html += '<a class="list-group-item list-group-item-action">'+this.topTweets[d.properties.postal].negative.tweet+'</a>';
        html += '</div>';

        html += "</div></div>";
        
        return html;
    }
}