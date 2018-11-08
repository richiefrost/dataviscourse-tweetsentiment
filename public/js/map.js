import { minBy, uniformRandom } from './util.js'

const CLUSTER_COUNT = 50;

// Lets do a Gonzalez cluster for simplicity.
const pointCluster = (points, clusterCount) => {
    const centers = [points[0]];
    const square = x => x * x;
    const distance = (p1, p2) => Math.sqrt(square(p1[0] - p2[0]) + square(p1[1] - p2[1]));

    const findCenter = point => {
        return minBy(centers, center => distance(center, point));
    };

    while (centers.length < clusterCount && centers.length < points.length) {
        const newCenter = minBy(points, point => {
            const pcenter = findCenter(point);
            return distance(pcenter, point);
        }, true);
        centers.push(newCenter);
    }

    console.log(centers);

    return findCenter;
};

export class TweetMap {
    constructor(selectorQuery, mapJSON) {
        // Based off of http://dataviscourse.net/tutorials/lectures/lecture-maps/
        // const center = {
        //     lon: -83.903347,
        //     lat: 38.769315
        // };
        const width = 1000;
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
            .attr('d', path);

        this.svg = svg;
        this.projection = projection;
        this.bounds = {
            width,
            height
        };
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
}