import { minBy, sum, sortedBy } from './util.js'

const square = x => x * x;
const distance = (p1, p2) => square(p1[0] - p2[0]) + square(p1[1] - p2[1]);

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
            return trueCenters;
        } else {
            trueCenters = newCenters;
        }
    }
};

// Lets do a Gonzalez cluster for simplicity.
export const pointCluster = (points, clusterCount) => {
    const centers = [points[0]];

    let findCenter = findCenterGen(centers);

    while (centers.length < clusterCount && centers.length < points.length) {
        const distanceMap = new Map(points.map(point => [point, distance(findCenter(point), point)]));
        const sortedPoints = sortedBy(points, point => distanceMap.get(point));
        const totalDistance = sum(Array.from(distanceMap.values()));

        let target = Math.random();
        let current = 0;
        let newCenter = undefined;
        for (const point of sortedPoints) {
            const indvProb = distanceMap.get(point) / totalDistance;
            current += indvProb;

            if (current <= target) {
                newCenter = point;
            }
        }

        centers.push(newCenter);
        findCenter = findCenterGen(centers);
    }

    return kmeans(points, Array.from(centers));
};
