import { minBy } from './util.js'

const voronoiPathGroup = 'voronoi';

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

        this.voronoiGroup = this.svg.append('g').attr('id', voronoiPathGroup);
        const clipPath = this.voronoiGroup.append('clipPath').attr('id', 'voronoiClip');

        clipPath.selectAll('path')
            .data(mapJSON.features)
            .enter()
            .append('path')
            .attr('d', path);
    }

    initVoronoi(polygons) {
        // Use the state map as a clipPath eventually.
        const polygonPath = polygon => {
            const result = d3.path();
            const firstPoint = polygon[0]
            result.moveTo(firstPoint[0], firstPoint[1]);

            for (const point of polygon.slice(1)) {
                result.lineTo(point[0], point[1]);
            }

            result.closePath();
            return result.toString();
        };
        this.voronoiGroup = this.voronoiGroup.selectAll(`path.${voronoiPathGroup}`)
            .data(polygons)
            .enter()
            .append('path')
            .attr('class', `path.${voronoiPathGroup}`)
            .attr('d', polygonPath)
            .attr('stroke-width', 0)
            .attr('stroke-opacity', 0)
            .attr('clip-path', 'url(#voronoiClip)');
    }

    showVoronoi(voronoiData, colorScale) {
        colorScale.domain([minBy(voronoiData), minBy(voronoiData, undefined, true)]);
        this.voronoiGroup
            .attr('fill', (_, i) => colorScale(voronoiData[i]));
        this.svg.selectAll('path.state').style('pointer-events', 'none');
    }

    hideVoronoi() {
        this.voronoiGroup
            .attr('fill', 'transparent');
        this.svg.selectAll('path.state')
        this.svg.selectAll('path.state').style('pointer-events', 'unset');
    }

    renderTotals(totals) {
        const that = this;

        d3.select('#map-label').html('Total Tweets per State');

        const scale = d3.scaleSequential(d3.interpolateOranges)
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

        this.svg.selectAll('path.state')
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

        this.svg.selectAll('path.state')
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

        return scale;
    }

    renderMapFill(stateData, colorInterpolation = d3.interpolateBlues) {
        const that = this;

        let labels = [];
        if(colorInterpolation == d3.interpolateBlues){
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
            .attr('fill', d => d.properties ? scale(stateData[d.properties.postal]) : 0)
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