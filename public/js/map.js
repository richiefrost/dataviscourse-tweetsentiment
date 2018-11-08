export class Map {
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
    }
}