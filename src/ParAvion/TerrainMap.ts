import Randomizer from "../Helper/Randomizer.js";
import TerrainCoordinates from "../Types/TerrainCoordinates.js";
import Coordinates from "../Types/Coordinates.js";
import LocationsMap from "./LocationsMap.js";
import Peak from "./Peak.js";

export default class TerrainMap {
  public static JAGGEDNESS = 2; // Multiplier for elevation randomizer
  public static RESOLUTION = 1; // How many parts per nautical mile
  public static MINIMUM_LAND = 5; // Minimum height for non-water

  public elevations: Float32Array[];
  public mapDimension: number;
  public peaks: Peak[] = [];
  protected elevationMin = 0;
  protected elevationMax = 5000;


  // @see https://en.wikipedia.org/wiki/Diamond-square_algorithm
  // @see https://github.com/A1essandro/Diamond-And-Square/blob/master/src/DiamondAndSquare.php
  public constructor(protected map: LocationsMap, protected randomizer: Randomizer) {
    // Round up to nearest x^2 + 1
    this.mapDimension = Math.pow(2,
      Math.ceil(
        Math.log(
          (map.mapDimension * TerrainMap.RESOLUTION) - 1
        ) / Math.log(2)
      )
    ) + 1;


    this.elevations = Array(this.mapDimension);
    for (let i = 0; i < this.mapDimension; i++) {
      this.elevations[i] = new Float32Array(this.mapDimension);
    }

    if (this.randomizer) {

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
      this.elevations[a][b] = this.randElevation(
        average,
        range
      );
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
      this.elevations[a][b] = this.randElevation(
        average,
        range
      );
    }

    return;
  }

  // ---------------------------------------------------------------------------

  protected makePeaks() {
    const searchRadius = 2 * TerrainMap.RESOLUTION;
    const searchDiameter = TerrainMap.RESOLUTION + (searchRadius * 2);
    const maxDimension = (this.map.mapDimension * TerrainMap.RESOLUTION) - searchRadius;

    for (let a = searchRadius; a < maxDimension; a++) {
      for (let b = searchRadius; b < maxDimension; b++) {
        const elevation = this.getElevation(new TerrainCoordinates(a, b));

        if (elevation > 2000) {
          const highest = this.getHighestElevation(new TerrainCoordinates(a - searchRadius, b - searchRadius), searchDiameter, searchDiameter);

          if (highest === elevation) {
            this.addPeak(
              (new TerrainCoordinates(a, b)).getCoordinates(Math.ceil(elevation))
            );
          }
        }
      }
    }
  }

  public addPeak(coordinates: Coordinates) {
    const peak = new Peak(coordinates, this.randomizer);
    peak.isSwitchLabelPosition = (coordinates.y > (this.map.mapDimension - 3));

    this.peaks.push(peak);
  }

  // ---------------------------------------------------------------------------


  protected getAverageSquareElevation(coordinates: TerrainCoordinates, range: number) {
    let count = 0;
    let sum = 0;

    [coordinates.a - range, coordinates.a + range].forEach((a) => {
      [coordinates.b - range, coordinates.b + range].forEach((b) => {
        if ((this.elevations[a][b]) && this.elevations[a][b] !== null) {
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
      if (a >= 0 && a < this.mapDimension && this.elevations[a][coordinates.b] && this.elevations[a][coordinates.b] !== null) {
        count++;
        sum += this.elevations[a][coordinates.b];
      }
    });

    [coordinates.b - range, coordinates.b + range].forEach((b) => {
      if (b >= 0 && b < this.mapDimension && this.elevations[coordinates.a][b] && this.elevations[coordinates.a][b] !== null) {
        count++;
        sum += this.elevations[coordinates.a][b];
      }
    });

    return count ? sum / count : 0;
  }

  protected flattenTerrain(coordinates: Coordinates, extraRadius = 0, direction = 0) {
    extraRadius *= TerrainMap.RESOLUTION;
    const innerCoords = coordinates.getTerrainCoordinates();
    const x = this.clamp(Math.floor(innerCoords.a));
    const y = this.clamp(Math.floor(innerCoords.b));

    let elevation = this.elevations[x][y];
    if (elevation < 1) {
      elevation = TerrainMap.MINIMUM_LAND;
    }

    // outer circles
    if (extraRadius > 0) {
      for (let circleIndex = 0; circleIndex < extraRadius; circleIndex++) {
        const circle = this.getCircle(circleIndex);
        circle.forEach((coordinates, cCount) => {

          const x1 = this.clamp(x + coordinates[0]);
          const y1 = this.clamp(y + coordinates[1]);
          const circleCount = circle.length;
          const circlePointer = Math.round((direction + 30) / 360 * circleCount);
          const pointers = [
            circlePointer,
            circlePointer + 1,
            circlePointer + circleCount / 2,
            circlePointer + circleCount / 2 + 1
          ];
          pointers.forEach((pointer, id) => {
            if (pointer >= circleCount) {
              pointers[id] -= circleCount;
            } else if (pointer < 0) {
              pointers[id] += circleCount;
            }
          });

          if (
            pointers.indexOf(cCount) !== -1 &&
            ((circleIndex + 1) < TerrainMap.RESOLUTION || this.getElevation(new TerrainCoordinates(x1, y1)) > elevation)
          ) {
            this.elevations[x1][y1] = elevation;
          }
        });
      }
    }

    // inner circle
    for (let i = x; i <= x + 1; i++) {
      for (let j = y; j <= y + 1; j++) {
        this.elevations[i][j] = elevation;
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
      coordinates.getTerrainCoordinates(),
      sliceX * TerrainMap.RESOLUTION,
      sliceY * TerrainMap.RESOLUTION
    );
  }


  public getHighestElevation(coordinates: TerrainCoordinates, sliceA: number, sliceB: number) {
    const x1 = this.clamp(coordinates.a);
    const y1 = this.clamp(coordinates.b);

    if (sliceA === 1 && sliceB === 1) {
      return this.getElevation(new TerrainCoordinates(x1, y1));
    }

    let maxLines: number[] = [];
    let lines = this.elevations.slice(x1, sliceA);

    lines.forEach((line) => {
      maxLines.push(Math.max(...line.slice(y1, sliceB)));
    });

    return Math.max(...maxLines);
  }

  /*
  public getElevationPolygons(step = 1000)
  {
    roundedElevations = this.getRoundedElevationMap(step);

    polygons = [];

    for (i = 0; i <= this.elevationMax + step; i += step) {
      polygons[i] = [];
    }

    mapDimension = this.map.mapDimension * TerrainMap.RESOLUTION;
    for (a = 0; a <= mapDimension; a += 1) {
      storedElevation = null;
      storedTop = null;
      lastBottom = null;
      left = a + ((a === 0) ? 0 : -0.5);
      right = a + ((a === mapDimension) ? 0 : 0.5);

      for (b = 0; b <= mapDimension; b += 1) {
        top = b + ((b === 0) ? 0 : -0.5);
        bottom = b + ((b === mapDimension) ? 0 : 0.5);
        elevation = roundedElevations[a][b];

        // dump on elevation change in line
        if (elevation !== storedElevation) {
          if (storedElevation !== null && storedElevation !== TerrainMap.MINIMUM_LAND) {
            polygons[storedElevation][] = [
              [left / TerrainMap.RESOLUTION,  storedTop / TerrainMap.RESOLUTION],
              [right / TerrainMap.RESOLUTION, storedTop / TerrainMap.RESOLUTION],
              [right / TerrainMap.RESOLUTION, lastBottom / TerrainMap.RESOLUTION],
              [left / TerrainMap.RESOLUTION,  lastBottom / TerrainMap.RESOLUTION],
            ];
          }

          storedTop = top;
          storedElevation = elevation;
        }

        if (b === mapDimension && storedElevation !== TerrainMap.MINIMUM_LAND) { #  && elevation !== storedElevation
          polygons[elevation][] = [
            [left / TerrainMap.RESOLUTION,  storedTop / TerrainMap.RESOLUTION],
            [right / TerrainMap.RESOLUTION, storedTop / TerrainMap.RESOLUTION],
            [right / TerrainMap.RESOLUTION, bottom / TerrainMap.RESOLUTION],
            [left / TerrainMap.RESOLUTION,  bottom / TerrainMap.RESOLUTION],
          ];
        }
        lastBottom = bottom;
      }
    }

    return polygons;
  }

  public getRoundedElevationMap(step)
  {
    mapDimension = this.map.mapDimension * TerrainMap.RESOLUTION;

    elevations = new SplFixedArray(mapDimension + 1);

    for (a = 0; a <= mapDimension; a += 1) {
      elevations[a] = new SplFixedArray(mapDimension + 1);
      for (b = 0; b <= mapDimension; b += 1) {
        elevation = this.getElevation(new TerrainCoordinates(a, b));
        elevations[a][b] = (elevation <= 0)
          ? 0
          : max(TerrainMap.MINIMUM_LAND, min(6000, (int)(Math.floor(elevation / step) * step)));
      }
    }

    return elevations;
  }*/

  public getElevation(coordinates: TerrainCoordinates) {
    const a = this.clamp(coordinates.a);
    const b = this.clamp(coordinates.b);
    return Math.max(0, this.elevations[a][b]);
  }

  public getInclinationexportClasses(coordinates: Coordinates) {
    const internalCoords = coordinates.getTerrainCoordinates();
    const x = internalCoords.a;
    const y = internalCoords.b;

    let classes = ['', ''];
    const elevation = this.getElevation(internalCoords);

    if (x - 1 >= 0 && y + 1 < this.mapDimension) {
      const referenceHeight = this.getElevation(new TerrainCoordinates(x - TerrainMap.RESOLUTION, y + TerrainMap.RESOLUTION));

      [[-TerrainMap.RESOLUTION, 0], [0, TerrainMap.RESOLUTION]].forEach((otherPoint, id) => {
        const otherReferenceHeight = this.getElevation(new TerrainCoordinates(x + otherPoint[0], y + otherPoint[1]));
        let inclinitation = otherReferenceHeight - ((elevation + referenceHeight) / 2);

        if (id === 1) {
          inclinitation *= -1;
        }


        if (inclinitation >= 250) {
          classes[id] = 'darken-2';
        } else if (inclinitation >= 50) {
          classes[id] = 'darken-1';
        } else if (inclinitation <= -250) {
          classes[id] = 'lighten-2';
        } else if (inclinitation <= -50) {
          classes[id] = 'lighten-1';
        }
      });
    }

    return classes;
  }

  protected clamp(coordinate: number) {
    return Math.max(0, Math.min(this.mapDimension, Math.round(coordinate)));
  }

  protected randElevation(average = 0, span: number | null = null) {
    if (span === null) {
      span = this.mapDimension;
    }

    const range = (this.elevationMin + this.elevationMax) / 2 * Math.min(1, span / this.mapDimension * TerrainMap.JAGGEDNESS);

    return Math.round(average + this.randomizer.getInt(-range, range));

  }
}

