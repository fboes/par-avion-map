import TerrainCoordinates from "../Types/TerrainCoordinates.js";
import Peak from "./Peak.js";
import HslColor from "../Types/HslColor.js";
import HoldingPattern from "./HoldingPattern.js";
import Degree from "../Types/Degree.js";
export default class TerrainMap {
    // @see https://en.wikipedia.org/wiki/Diamond-square_algorithm
    // @see https://github.com/A1essandro/Diamond-And-Square/blob/master/src/DiamondAndSquare.php
    constructor(map, randomizer, resolution = 4) {
        this.map = map;
        this.randomizer = randomizer;
        this.resolution = resolution;
        this.peaks = [];
        this.elevationMin = 0;
        this.elevationMax = 5000;
        // Round up to nearest x^2 + 1
        this.mapDimension =
            Math.pow(2, Math.ceil(Math.log(map.mapDimension * this.resolution - 1) / Math.log(2))) + 1;
        this.elevations = Array(this.mapDimension);
        for (let i = 0; i < this.mapDimension; i++) {
            this.elevations[i] = new Float32Array(this.mapDimension);
        }
        const averageHeight = (this.elevationMin + this.elevationMax) / 2;
        this.elevations[0][0] = this.randElevation(averageHeight);
        this.elevations[0][this.mapDimension - 1] =
            this.randElevation(averageHeight);
        this.elevations[this.mapDimension - 1][0] =
            this.randElevation(averageHeight);
        this.elevations[this.mapDimension - 1][this.mapDimension - 1] =
            this.randElevation(averageHeight);
        this.nextStep(this.mapDimension);
        this.map.navAids.forEach((navAid) => {
            const elevation = this.flattenTerrain(navAid.coordinates);
            navAid.coordinates.elevation = elevation;
            if (navAid.holdingPattern) {
                const middleCoords = navAid.holdingPattern.getCenterCoordinates();
                const maxHeight = Math.ceil(this.getHighestElevationNm(middleCoords, HoldingPattern.LENGTH / 2, HoldingPattern.LENGTH / 2) / 100) * 100;
                navAid.holdingPattern.coordinates.elevation = maxHeight + 1000;
            }
        });
        this.map.obstructions.forEach((obstruction) => {
            const elevation = this.flattenTerrain(obstruction.coordinates, 2);
            obstruction.coordinates.elevation = elevation;
        });
        this.map.airports.forEach((airport) => {
            const elevation = this.flattenTerrain(airport.coordinates, 10, airport.runways[0].heading.degree);
            airport.coordinates.elevation = elevation;
        });
        this.makePeaks();
    }
    nextStep(range) {
        const halfRange = Math.floor(range / 2);
        if (halfRange <= 0) {
            return;
        }
        for (let a = halfRange; a < this.mapDimension; a += range) {
            for (let b = halfRange; b < this.mapDimension; b += range) {
                this.doSquare(a, b, range, halfRange);
            }
        }
        return this.nextStep(halfRange);
    }
    doSquare(a, b, range, halfRange) {
        if (!this.elevations[a][b] || this.elevations[a][b] === null) {
            const average = this.getAverageSquareElevation(new TerrainCoordinates(a, b), halfRange);
            this.elevations[a][b] = this.randElevation(average, range);
        }
        this.doDiamond(a, b - halfRange, range, halfRange);
        this.doDiamond(a, b + halfRange, range, halfRange);
        this.doDiamond(a - halfRange, b, range, halfRange);
        this.doDiamond(a + halfRange, b, range, halfRange);
        return;
    }
    doDiamond(a, b, range, halfRange) {
        if (!this.elevations[a][b] || this.elevations[a][b] === null) {
            const average = this.getAverageDiamondElevation(new TerrainCoordinates(a, b), halfRange);
            this.elevations[a][b] = this.randElevation(average, range);
        }
        return;
    }
    // ---------------------------------------------------------------------------
    makePeaks() {
        const searchRadius = 2 * this.resolution;
        const searchDiameter = this.resolution + searchRadius * 2;
        const maxDimension = this.map.mapDimension * this.resolution - searchRadius;
        for (let a = searchRadius; a < maxDimension; a++) {
            for (let b = searchRadius; b < maxDimension; b++) {
                const elevation = this.getElevation(new TerrainCoordinates(a, b));
                if (elevation > 2000) {
                    const highest = this.getHighestElevation(new TerrainCoordinates(a - searchRadius, b - searchRadius), searchDiameter, searchDiameter);
                    if (highest === elevation) {
                        this.addPeak(new TerrainCoordinates(a, b).getCoordinates(this.resolution, Math.ceil(elevation)));
                    }
                }
            }
        }
    }
    addPeak(coordinates) {
        const peak = new Peak(coordinates, this.randomizer);
        peak.isSwitchLabelPosition = coordinates.y > this.map.mapDimension - 3;
        this.peaks.push(peak);
    }
    // ---------------------------------------------------------------------------
    getAverageSquareElevation(coordinates, range) {
        let count = 0;
        let sum = 0;
        [coordinates.a - range, coordinates.a + range].forEach((a) => {
            [coordinates.b - range, coordinates.b + range].forEach((b) => {
                if (this.elevations[a][b] && this.elevations[a][b] !== null) {
                    count++;
                    sum += this.elevations[a][b];
                }
            });
        });
        return count ? sum / count : 0;
    }
    getAverageDiamondElevation(coordinates, range) {
        let count = 0;
        let sum = 0;
        [coordinates.a - range, coordinates.a + range].forEach((a) => {
            if (a >= 0 &&
                a < this.mapDimension &&
                this.elevations[a][coordinates.b] &&
                this.elevations[a][coordinates.b] !== null) {
                count++;
                sum += this.elevations[a][coordinates.b];
            }
        });
        [coordinates.b - range, coordinates.b + range].forEach((b) => {
            if (b >= 0 &&
                b < this.mapDimension &&
                this.elevations[coordinates.a][b] &&
                this.elevations[coordinates.a][b] !== null) {
                count++;
                sum += this.elevations[coordinates.a][b];
            }
        });
        return count ? sum / count : 0;
    }
    flattenTerrain(coordinates, extraRadius = 1, direction = null) {
        const elevation = Math.max(TerrainMap.MINIMUM_LAND, this.getElevationNm(coordinates));
        const flattenRadius = extraRadius > 5 ? 1 : 0.5;
        this.elevations.forEach((line, a) => {
            line.forEach((value, b) => {
                const distance = Math.sqrt((a / this.resolution - coordinates.x) ** 2 +
                    (b / this.resolution - coordinates.y) ** 2);
                let delta = this.randomizer.getInt(280, 310) * distance;
                if (distance > extraRadius) {
                    delta *= 2;
                }
                if (direction !== null) {
                    const deltaRad = new Degree(new TerrainCoordinates(a, b)
                        .getCoordinates(this.resolution, null)
                        .getBearing(coordinates)).add(-direction).rad;
                    delta *= 1 + Math.abs(Math.sin(deltaRad));
                }
                if (distance < flattenRadius) {
                    this.elevations[a][b] = elevation;
                }
                else if (delta > 0 &&
                    delta < 10000 &&
                    distance < extraRadius &&
                    value > elevation + delta) {
                    this.elevations[a][b] = elevation + delta;
                }
            });
        });
        return elevation;
    }
    getHighestElevationNm(coordinates, sliceX, sliceY) {
        return this.getHighestElevation(coordinates.getTerrainCoordinates(this.resolution), sliceX * this.resolution, sliceY * this.resolution);
    }
    getHighestElevation(coordinates, sliceA, sliceB) {
        const x1 = this.clamp(coordinates.a);
        const y1 = this.clamp(coordinates.b);
        if (sliceA === 1 && sliceB === 1) {
            return this.getElevation(new TerrainCoordinates(x1, y1));
        }
        let max = 0;
        this.elevations.slice(x1, x1 + sliceA).forEach((line) => {
            line.slice(y1, y1 + sliceB).forEach((value) => {
                max = Math.max(max, value);
            });
        });
        return max;
    }
    getElevationNm(coordinates) {
        // get four surrounding coordinates
        const co = coordinates.getTerrainCoordinates(this.resolution);
        const multiA = co.a % 1;
        const multiB = co.b % 1;
        const leftElevation = this.getElevation(new TerrainCoordinates(Math.floor(co.a), Math.floor(co.b))) *
            (1 - multiB) +
            this.getElevation(new TerrainCoordinates(Math.floor(co.a), Math.ceil(co.b))) *
                multiB;
        const rightElevation = this.getElevation(new TerrainCoordinates(Math.ceil(co.a), Math.floor(co.b))) *
            (1 - multiB) +
            this.getElevation(new TerrainCoordinates(Math.ceil(co.a), Math.ceil(co.b))) *
                multiB;
        return leftElevation * (1 - multiA) + rightElevation * multiA;
    }
    getElevation(coordinates) {
        const a = this.clamp(coordinates.a);
        const b = this.clamp(coordinates.b);
        return Math.max(0, this.elevations[a][b]);
    }
    getRoundedElevation(a, b, step = 1000) {
        const elevation = this.getElevation(new TerrainCoordinates(a, b));
        return elevation <= 0
            ? 0
            : Math.max(TerrainMap.MINIMUM_LAND, Math.min(6000, Math.floor(elevation / step) * step));
    }
    getInclinationColors(x, y) {
        let classes = ["", ""];
        const elevation = this.getElevation(new TerrainCoordinates(x, y));
        if (x - 1 >= 0 && y + 1 < this.mapDimension) {
            const referenceHeight = this.getElevation(new TerrainCoordinates(x - 1, y + 1));
            [
                [-1, 0],
                [0, 1],
            ].forEach((otherPoint, id) => {
                const otherReferenceHeight = this.getElevation(new TerrainCoordinates(x + otherPoint[0], y + otherPoint[1]));
                let inclinitation = otherReferenceHeight - (elevation + referenceHeight) / 2;
                if (id === 1) {
                    inclinitation *= -1;
                }
                const alpha = Math.max(0, Math.min(1, Math.abs(inclinitation * this.resolution) / 2000));
                if (alpha > 0.05) {
                    classes[id] = new HslColor(0, 0, inclinitation >= 0 ? 0 : 1, alpha).value;
                }
            });
        }
        return classes;
    }
    clamp(coordinate) {
        return Math.max(0, Math.min(this.mapDimension - 1, Math.round(coordinate)));
    }
    randElevation(average = 0, span = null) {
        if (span === null) {
            span = this.mapDimension;
        }
        const range = ((this.elevationMin + this.elevationMax) / 2) *
            Math.min(1, (span / this.mapDimension) * TerrainMap.JAGGEDNESS);
        return Math.round(average + this.randomizer.getInt(-range, range));
    }
}
TerrainMap.JAGGEDNESS = 2; // Multiplier for elevation randomizer
TerrainMap.RESOLUTION = 4; // How many parts per nautical mile
TerrainMap.MINIMUM_LAND = 5; // Minimum height for non-water
