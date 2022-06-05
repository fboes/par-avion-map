import Randomizer from "../Helper/Randomizer.js";
import TerrainCoordinates from "../Types/TerrainCoordinates.js";
import Coordinates from "../Types/Coordinates.js";
import LocationsMap from "./LocationsMap.js";
import Peak from "./Peak.js";
import HslColor from "../Types/HslColor.js";

export default class TerrainMap {
  public static JAGGEDNESS = 2; // Multiplier for elevation randomizer
  public static RESOLUTION = 4; // How many parts per nautical mile
  public static MINIMUM_LAND = 5; // Minimum height for non-water

  public elevations: Float32Array[];
  public mapDimension: number;
  public peaks: Peak[] = [];
  protected elevationMin = 0;
  protected elevationMax = 5000;

  // @see https://en.wikipedia.org/wiki/Diamond-square_algorithm
  // @see https://github.com/A1essandro/Diamond-And-Square/blob/master/src/DiamondAndSquare.php
  public constructor(protected map: LocationsMap, protected randomizer: Randomizer, public resolution = 4) {
    // Round up to nearest x^2 + 1
    this.mapDimension =
      Math.pow(
        2,
        Math.ceil(
          Math.log(map.mapDimension * this.resolution - 1) / Math.log(2)
        )
      ) + 1;

    this.elevations = Array(this.mapDimension);
    for (let i = 0; i < this.mapDimension; i++) {
      this.elevations[i] = new Float32Array(this.mapDimension);
    }

    const averageHeight = (this.elevationMin + this.elevationMax) / 2;
    this.elevations[0][0] = this.randElevation(averageHeight);
    this.elevations[0][this.mapDimension - 1] = this.randElevation(averageHeight);
    this.elevations[this.mapDimension - 1][0] = this.randElevation(averageHeight);
    this.elevations[this.mapDimension - 1][this.mapDimension - 1] = this.randElevation(averageHeight);

    this.nextStep(this.mapDimension);

    this.map.navAids.forEach((navAid) => {
      const elevation = this.flattenTerrain(navAid.coordinates);
      navAid.coordinates.elevation = elevation;
    });

    this.map.obstructions.forEach((obstruction) => {
      const elevation = this.flattenTerrain(obstruction.coordinates);
      obstruction.coordinates.elevation = elevation;
    });

    this.map.airports.forEach((airport) => {
      const elevation = this.flattenTerrain(airport.coordinates, 2, airport.runways[0].heading.degree);
      airport.coordinates.elevation = elevation;
    });

    this.makePeaks();
  }

  protected nextStep(range: number): void {
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

  protected doSquare(a: number, b: number, range: number, halfRange: number) {
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

  protected doDiamond(a: number, b: number, range: number, halfRange: number) {
    if (!this.elevations[a][b] || this.elevations[a][b] === null) {
      const average = this.getAverageDiamondElevation(new TerrainCoordinates(a, b), halfRange);
      this.elevations[a][b] = this.randElevation(average, range);
    }

    return;
  }

  // ---------------------------------------------------------------------------

  protected makePeaks() {
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

  public addPeak(coordinates: Coordinates) {
    const peak = new Peak(coordinates, this.randomizer);
    peak.isSwitchLabelPosition = coordinates.y > this.map.mapDimension - 3;

    this.peaks.push(peak);
  }

  // ---------------------------------------------------------------------------

  protected getAverageSquareElevation(coordinates: TerrainCoordinates, range: number) {
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

  protected getAverageDiamondElevation(coordinates: TerrainCoordinates, range: number) {
    let count = 0;
    let sum = 0;

    [coordinates.a - range, coordinates.a + range].forEach((a) => {
      if (
        a >= 0 &&
        a < this.mapDimension &&
        this.elevations[a][coordinates.b] &&
        this.elevations[a][coordinates.b] !== null
      ) {
        count++;
        sum += this.elevations[a][coordinates.b];
      }
    });

    [coordinates.b - range, coordinates.b + range].forEach((b) => {
      if (
        b >= 0 &&
        b < this.mapDimension &&
        this.elevations[coordinates.a][b] &&
        this.elevations[coordinates.a][b] !== null
      ) {
        count++;
        sum += this.elevations[coordinates.a][b];
      }
    });

    return count ? sum / count : 0;
  }


  protected flattenTerrain(coordinates: Coordinates, extraRadius = 1, direction = 0) {
    if (extraRadius > 1) {
      extraRadius *= this.resolution;
    }
    const innerCoords = coordinates.getTerrainCoordinates(this.resolution);
    const clearing = 1;
    const clearingDegree = 20;

    const x = this.clamp(innerCoords.a);
    const y = this.clamp(innerCoords.b);

    const minX = this.clamp(x - extraRadius);
    const minY = this.clamp(y - extraRadius);

    const maxX = this.clamp(x + extraRadius);
    const maxY = this.clamp(y + extraRadius);

    let elevation = this.elevations[x][y];
    if (elevation < 1) {
      elevation = TerrainMap.MINIMUM_LAND;
    }

    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const refCoords = new TerrainCoordinates(i, j);

        const distance = innerCoords.getDistance(refCoords);
        if (Math.round(distance) > extraRadius) {
          continue;
        }
        const maxElevation = elevation + (300 / distance * this.resolution); // 300ft = 3° / 1 NM
        const angle = innerCoords.getBearing(refCoords);
        if (
          x - clearing <= i &&
          i <= x + clearing &&
          y - clearing <= j &&
          j <= y + clearing
        ) {
          this.elevations[i][j] = elevation;
        } else if (
          (angle.isBetween(direction - clearingDegree, direction + clearingDegree)
            || angle.isBetween(direction - clearingDegree + 180, direction + clearingDegree + 180))
          && this.getElevation(refCoords) > maxElevation
        ) {
          this.elevations[i][j] = maxElevation;
        }
      }
    }

    return elevation;
  }

  public getCircle(circleIndex: number) {
    let circle = [];
    for (let i = -circleIndex - 1; i <= circleIndex + 2; i++) {
      circle.push([i, -circleIndex - 1]);
    }

    for (let i = -circleIndex; i <= circleIndex + 1; i++) {
      circle.push([circleIndex + 2, i]);
    }

    for (let i = circleIndex + 2; i >= -circleIndex - 1; i--) {
      circle.push([i, circleIndex + 2]);
    }

    for (let i = circleIndex + 1; i >= -circleIndex; i--) {
      circle.push([-circleIndex - 1, i]);
    }

    return circle;
  }

  public getHighestElevationNm(coordinates: Coordinates, sliceX: number, sliceY: number) {
    return this.getHighestElevation(
      coordinates.getTerrainCoordinates(this.resolution),
      sliceX * this.resolution,
      sliceY * this.resolution
    );
  }

  public getHighestElevation(coordinates: TerrainCoordinates, sliceA: number, sliceB: number) {
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

  public getElevationNm(coordinates: Coordinates) {
    return this.getElevation(
      coordinates.getTerrainCoordinates(this.resolution)
    );
  }

  public getElevation(coordinates: TerrainCoordinates) {
    const a = this.clamp(coordinates.a);
    const b = this.clamp(coordinates.b);
    return Math.max(0, this.elevations[a][b]);
  }

  getRoundedElevation(a: number, b: number, step = 1000) {
    const elevation = this.getElevation(new TerrainCoordinates(a, b));

    return elevation <= 0
      ? 0
      : Math.max(
        TerrainMap.MINIMUM_LAND,
        Math.min(6000, Math.floor(elevation / step) * step)
      );
  }

  public getInclinationColors(x: number, y: number) {
    let classes = ["", ""];
    const elevation = this.getElevation(new TerrainCoordinates(x, y));

    if (x - 1 >= 0 && y + 1 < this.mapDimension) {
      const referenceHeight = this.getElevation(new TerrainCoordinates(x - 1, y + 1));

      [[-1, 0], [0, 1],].forEach((otherPoint, id) => {
        const otherReferenceHeight = this.getElevation(new TerrainCoordinates(x + otherPoint[0], y + otherPoint[1]));
        let inclinitation = otherReferenceHeight - (elevation + referenceHeight) / 2;

        if (id === 1) {
          inclinitation *= -1;
        }

        const alpha = Math.max(0, Math.min(1, Math.abs(inclinitation * this.resolution) / 2000));
        if (alpha > 0.05) {
          classes[id] = new HslColor(
            0,
            0,
            inclinitation >= 0 ? 0 : 1,
            alpha
          ).value;
        }
      });
    }

    return classes;
  }

  protected clamp(coordinate: number) {
    return Math.max(0, Math.min(this.mapDimension - 1, Math.round(coordinate)));
  }

  protected randElevation(average = 0, span: number | null = null) {
    if (span === null) {
      span = this.mapDimension;
    }

    const range = ((this.elevationMin + this.elevationMax) / 2) * Math.min(1, (span / this.mapDimension) * TerrainMap.JAGGEDNESS);

    return Math.round(average + this.randomizer.getInt(-range, range));
  }
}
