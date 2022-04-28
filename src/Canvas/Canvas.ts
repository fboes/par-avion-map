import LocationsMap from "../ParAvion/LocationsMap.js";
import Navaid from "../ParAvion/Navaid.js";
import Airport from "../ParAvion/Airport.js";
import TerrainMap from "../ParAvion/TerrainMap.js";
import CanvasTool from "./CanvasTool.js";
import Waypoint from "../ParAvion/Waypoint.js";
import Coordinates from "../Types/Coordinates.js";
import HoldingPattern from "../ParAvion/HoldingPattern.js";
import Runway from "../ParAvion/Runway.js";

export default class Canvas {
  colors = {
    blue: "#002da3",
    blueTransparent: "rgba(0, 45, 163, 0.5)",
    magenta: "#800033",
    magentaTransparent: "rgba(128, 0, 51, 0.5)",
    whiteTransparent: "rgba(255, 255, 255, 0.5)",
    blackTransparent: "rgba(0, 0, 0, 0.5)",
    river: "#0c2a6c",
  };

  elevationColors: { [key: string]: string } = {
    "0": "#e8fcfd", // 0 blue
    "5": "#d7e4c6", // 0+ green
    "1000": "#bac7ab", // 1000+ green
    "2000": "#fbf1cd", // 2000+ yellow
    "3000": "#fbeca9", // 3000+ yellow
    "4000": "#e8c899", // 5000+ orange
    "5000": "#c58c3e", // 7000+ orange
    "6000": "#775843", // 9000+ brown
  };

  protected ctx: CanvasRenderingContext2D;
  protected multiplier: number;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected map: LocationsMap,
    protected terrain: TerrainMap
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No CanvasRenderingContext2D found");
    }
    this.multiplier = Math.min(canvas.height, canvas.width) / map.mapDimension;
    this.ctx = ctx;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 4;

    this.makeTopography();
    this.makeGrid();
    this.makeMaximumElevationFigures();
    this.makePeaks();
    this.makeObstructions();
    this.makeNavaids();
    this.makeAirports();
    this.makeWind();
  }

  makeTopography() {
    const t = this.getNewCanvasTool(0, 0);
    this.ctx.fillStyle = this.elevationColors["5"];
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const mapDimension = this.map.mapDimension * TerrainMap.RESOLUTION;
    for (let a = 0; a <= mapDimension; a += 1) {
      for (let b = 0; b <= mapDimension; b += 1) {
        const elevation = this.terrain.getRoundedElevation(a, b);
        if (elevation !== 5) {
          this.ctx.fillStyle = this.elevationColors[String(elevation)];
          t.fillRect(
            (a - 0.5) / TerrainMap.RESOLUTION,
            (b - 0.5) / TerrainMap.RESOLUTION,
            1 / TerrainMap.RESOLUTION + 0.01,
            1 / TerrainMap.RESOLUTION + 0.01
          );
        }
      }
    }

    for (let i = 0; i < mapDimension + 1; i += 1) {
      for (let j = 0; j < mapDimension; j += 1) {
        const inclinationColors = this.terrain.getInclinationColors(i, j);
        if (inclinationColors[0]) {
          this.ctx.fillStyle = inclinationColors[0];
          t.polygon(
            [
              [i, j],
              [i - 1, j + 1],
              [i - 1, j],
            ],
            TerrainMap.RESOLUTION
          ).fill();
        }
        if (inclinationColors[1]) {
          this.ctx.fillStyle = inclinationColors[1];
          t.polygon(
            [
              [i, j],
              [i - 1, j + 1],
              [i, j + 1],
            ],
            TerrainMap.RESOLUTION
          ).fill();
        }
      }
    }
  }

  makeGrid() {
    const t = this.getNewCanvasTool(0, 0);
    t.style(this.colors.blackTransparent);
    t.textStyle();
    t.strokeRect(0, 0, this.map.mapDimension, this.map.mapDimension);

    t.lineWidth = 0.01;
    t.setLineDash([0.2, 0.1]);
    t.circle(this.map.center.x, this.map.center.y, this.map.center.x - LocationsMap.PADDING).stroke();
    t.setLineDash([]);

    const offset = (this.map.mapDimension % 10) / 2;

    const oldlineWidth = t.lineWidth;
    for (let i = 1; i < this.map.mapDimension; i += 1) {
      if ((i - offset) % 10 === 0) {
        t.lineWidth = oldlineWidth * 5;
      }
      this.ctx.beginPath();
      if ((i - offset) % 5 === 0) {
        t.lineRaw(0, i, this.map.mapDimension, i);
        t.lineRaw(i, 0, i, this.map.mapDimension);
      } else {
        t.lineRaw(0, i, 0.25, i);
        t.lineRaw(this.map.mapDimension - 0.25, i, this.map.mapDimension, i);
        t.lineRaw(i, 0, i, 0.25);
        t.lineRaw(i, this.map.mapDimension - 0.25, i, this.map.mapDimension);
      }
      this.ctx.stroke();
      this.ctx.closePath();
      if ((i - offset) % 10 === 0) {
        t.lineWidth = oldlineWidth;
      }
    }

    t.style("black");
    t.text(
      this.map.center.x,
      1.1,
      "MAP: " + this.map.randomizer.seed
    );

    t.text(
      this.map.center.x,
      this.map.mapDimension - 0.7,
      String(this.map.mapDimension / 2) +
      " / " +
      String(this.map.mapDimension) +
      " NM"
    );
  }
  makeMaximumElevationFigures() {
    const t = this.getNewCanvasTool(0, 0);
    t.style(this.colors.blueTransparent);

    const offset = (this.map.mapDimension % 10) / 2;
    const start = offset >= 5 ? offset : offset + 10;
    for (let i = start; i <= this.map.mapDimension + offset; i += 10) {
      for (let j = start; j <= this.map.mapDimension + offset; j += 10) {
        const elevation = CanvasTool.terrainElevations(
          Math.max(
            this.terrain.getHighestElevationNm(
              new Coordinates(i - 10, j - 10),
              11,
              11
            ),
            this.map.getHighestObstruction(i - 10, j - 10, 10, 10)
          )
        );
        t.textStyle(1.5, "right", "bold");
        t.text(i - 4.9, j - 4.5, String(elevation.thousand));

        t.textStyle(1, "left", "bold");
        t.text(i - 4.9, j - 4.8, String(elevation.hundred));
      }
    }
  }

  makePeaks() {
    this.terrain.peaks.forEach((peak) => {
      if (peak.coordinates.elevation) {
        const t = this.getNewCanvasTool(peak.coordinates.x, peak.coordinates.y);
        t.style("black");
        t.textStyle();
        t.circle(0, 0, 0.1).fill();
        t.textMultiline(0, peak.isSwitchLabelPosition ? -1 : 0.7, [
          String(Math.ceil(peak.coordinates.elevation)),
          peak.name,
        ]);
      }
    });
  }

  makeObstructions() {
    this.map.obstructions.forEach((obstruction) => {
      const t = this.getNewCanvasTool(
        obstruction.coordinates.x,
        obstruction.coordinates.y
      );

      t.style(this.colors.blue);
      t.textStyle();
      t.circle(0, 0, 0.1).fill();

      if (obstruction.heightAboveGround >= 1000) {
        t.polygon([
          [0.5, 0.1],
          [0.1, -0.2, 0.02, -1.25, 0.025, -2],
          [-0.025, -2],
          [-0.02, -1.25, -0.1, -0.2, -0.5, 0.1],
          [-0.3, 0, -0.1, -0.2, 0, -0.4],
          [0.1, -0.2, 0.3, 0, 0.5, 0.1],
        ]).fill();
      } else {
        t.polygon([
          [0.5, 0.1],
          [0, -1],
          [-0.5, 0.1],
          [-0.3, 0.1],
          [0, -0.6],
          [0.3, 0.1],
        ]).fill();
      }

      if (obstruction.hasHighIntensityLight) {
        const y = obstruction.heightAboveGround >= 1000 ? -2 : -1;
        t.rotate(0, y, -120);
        for (let i = -120; i <= 120; i += 60) {
          t.line(0, y - 0.2, 0, y - 0.5).stroke();
          t.rotate(0, y, 60);
        }
      }
      t.reset();

      t.textMultiline(0, obstruction.isSwitchLabelPosition ? -3 : 0.8, [
        String(
          (obstruction.coordinates.elevation || 0) +
          obstruction.heightAboveGround
        ),
        "(" + String(obstruction.heightAboveGround) + ")",
      ]);
    });
  }

  makeNavaids() {
    this.map.navAids.forEach((navaid, id) => {
      const t = this.getNewCanvasTool(navaid.coordinates.x, navaid.coordinates.y);

      t.style(navaid.type === Navaid.VOR ? this.colors.blue : this.colors.magenta);
      t.textStyle();
      t.circle(0, 0, 0.15).fill();

      if (navaid.type === Navaid.NDB) {
        this.makeNavaidNdb(navaid.coordinates.x, navaid.coordinates.y);
      } else {
        this.makeNavaidVor(navaid.coordinates.x, navaid.coordinates.y);
      }

      t.style(navaid.type === Navaid.VOR ? this.colors.blue : this.colors.magenta);
      if (navaid.hasDme) {
        t.strokeRect(-0.8, -0.7, 1.6, 1.4);
      }

      if (navaid.holdingPattern) {
        t.rotate(0, 0, navaid.holdingPattern.direction.degree);
        t.roundedRect(
          navaid.holdingPattern.isRight ? 0 : -HoldingPattern.WIDTH,
          -HoldingPattern.WIDTH / 2,
          HoldingPattern.WIDTH,
          HoldingPattern.LENGTH,
          HoldingPattern.WIDTH / 2
        ).stroke();
        this.makePointerArrow(navaid.coordinates.x, navaid.coordinates.y);
        this.makePointerArrow(
          navaid.coordinates.x +
          (navaid.holdingPattern.isRight
            ? HoldingPattern.WIDTH
            : -HoldingPattern.WIDTH),
          navaid.coordinates.y + HoldingPattern.LENGTH - HoldingPattern.WIDTH,
          -1
        );

        t.rotate(0, 0, 90);
        t.text(
          1.25,
          0.2,
          CanvasTool.numPad(
            Math.round(navaid.holdingPattern.direction.degree),
            3
          ) + "°"
        );
        t.rotate(0, 0, 180);
        t.text(
          1.25 - HoldingPattern.WIDTH,
          navaid.holdingPattern.isRight
            ? 0.2 + HoldingPattern.WIDTH
            : -0.2 - HoldingPattern.WIDTH,
          CanvasTool.numPad(
            Math.round(navaid.holdingPattern.direction.oppositeDegree),
            3
          ) + "°"
        );

        t.reset();
      }

      t.textMultiline(
        0,
        navaid.type === Navaid.NDB
          ? navaid.isSwitchLabelPosition ? -3 : 2.7
          : navaid.isSwitchLabelPosition ? -1.6 : 1.3,
        [
          navaid.name,
          CanvasTool.frequency(navaid.frequency) + " " + navaid.code,
        ]
      );

      this.makePin(navaid.coordinates.x - 0.75, navaid.coordinates.y - 1.7, id + 1);
    });
  }

  makeAirports() {
    this.map.airports.forEach((airport, id) => {
      const t = this.getNewCanvasTool(airport.coordinates.x, airport.coordinates.y);

      const baseColor = airport.hasTower ? this.colors.blue : this.colors.magenta;
      const accentColor = airport.hasTower ? this.colors.blueTransparent : this.colors.magentaTransparent;
      t.style(baseColor);
      t.textStyle();
      t.circle(0, 0, 1).fill();

      if (airport.hasFuelService) {
        t.fillRect(-1.15, -0.15, 0.3, 0.3);
        t.fillRect(0.85, -0.15, 0.3, 0.3);
        t.fillRect(-0.15, -1.15, 0.3, 0.3);
        t.fillRect(-0.15, 0.85, 0.3, 0.3);
      }

      airport.runways.forEach((runway) => {
        t.rotate(0, 0, runway.heading.degree);

        if (runway.trafficPatterns[0]) {
          t.style(accentColor);

          t.setLineDash([0.2, 0.1]);
          this.ctx.beginPath();
          t.roundedRectRaw(
            runway.trafficPatterns[0].isRight
              ? -Runway.TRAFFICPATTERN_WIDTH
              : 0,
            -Runway.TRAFFICPATTERN_LENGTH / 2,
            Runway.TRAFFICPATTERN_WIDTH,
            Runway.TRAFFICPATTERN_LENGTH,
            0.5
          );

          t.lineRaw(
            runway.trafficPatterns[0].isRight
              ? -Runway.TRAFFICPATTERN_WIDTH - 1
              : Runway.TRAFFICPATTERN_WIDTH + 1,
            1,
            runway.trafficPatterns[0].isRight
              ? -Runway.TRAFFICPATTERN_WIDTH
              : Runway.TRAFFICPATTERN_WIDTH,
            0
          );
          t.lineRaw(
            0,
            0.5 * Runway.TRAFFICPATTERN_LENGTH,
            0,
            0.7 * Runway.TRAFFICPATTERN_LENGTH
          );
          this.ctx.stroke();
          this.ctx.closePath();

          t.setLineDash([]);
          this.makePointerArrow(
            airport.coordinates.x +
            (runway.trafficPatterns[0].isRight
              ? -Runway.TRAFFICPATTERN_WIDTH
              : Runway.TRAFFICPATTERN_WIDTH),
            airport.coordinates.y + 0.33 * Runway.TRAFFICPATTERN_LENGTH
          );
          this.makePointerArrow(
            airport.coordinates.x,
            airport.coordinates.y - 0.33 * Runway.TRAFFICPATTERN_LENGTH,
            -1
          );
          this.makePointerArrow(
            airport.coordinates.x,
            airport.coordinates.y + 0.75 * Runway.TRAFFICPATTERN_LENGTH,
            -1
          );

          t.polygon([
            [runway.trafficPatterns[0].isRight ? -Runway.TRAFFICPATTERN_WIDTH - 1 : Runway.TRAFFICPATTERN_WIDTH + 1, 1,],
            [runway.trafficPatterns[0].isRight ? -Runway.TRAFFICPATTERN_WIDTH - 1 : Runway.TRAFFICPATTERN_WIDTH + 1, 1.35,],
            [runway.trafficPatterns[0].isRight ? -Runway.TRAFFICPATTERN_WIDTH - 1.35 : Runway.TRAFFICPATTERN_WIDTH + 1.35, 1,],
          ]).fill();

          t.style(baseColor);
        }

        this.ctx.fillStyle = "white";
        t.fillRect(runway.width / 500 / -2, runway.length / 6076 / -2, runway.width / 500, runway.length / 6076);

        if (runway.ilsFrequencies.first) {
          t.style(accentColor);
          this.makeIls(airport.coordinates.x, airport.coordinates.y);
        }
        if (runway.ilsFrequencies.second) {
          t.style(accentColor);
          t.rotate(0, 0, 180);
          this.makeIls(airport.coordinates.x, airport.coordinates.y);
        }

        t.reset();
      });

      if (airport.hasBeacon) {
        const offset = 1.1;
        t.style("white", baseColor, 0.05);
        t.polygon([
          [0, -0.2 - offset],
          [+0.065, -0.05 - offset],
          [+0.2, -0.05 - offset],
          [+0.08, 0.06 - offset],
          [+0.15, 0.2 - offset],
          [0, 0.12 - offset],
          [-0.15, 0.2 - offset],
          [-0.08, 0.06 - offset],
          [-0.2, -0.05 - offset],
          [-0.065, -0.05 - offset],
        ]).fill();
        this.ctx.stroke();
      }

      t.style(baseColor);
      t.textMultiline(0, airport.isSwitchLabelPosition ? -2 : 1.75, [
        airport.name + " (" + airport.code + ")",
        (airport.hasTower ? "CT " : "UNICOM ") +
        CanvasTool.frequency(airport.frequency) +
        (airport.runways[0].ilsFrequencies.first
          ? " ILS " +
          CanvasTool.frequency(airport.runways[0].ilsFrequencies.first)
          : ""),
      ]);

      airport.approachPoints.forEach((approachPoint) => {
        this.makeWaypoint(approachPoint);
      });

      this.makePin(
        airport.coordinates.x - 1.1,
        airport.coordinates.y - 1.75,
        id + 1
      );
    });
  }

  makeWind() {
    const t = this.getNewCanvasTool(1.2, this.map.mapDimension - 1.2);

    this.ctx.fillStyle = "black";
    t.textStyle();

    t.circle(0, 0, 0.9).fill();
    t.text(0, -1.45, "N", false);
    t.polygon([
      [-0.3, -1],
      [0.3, -1],
      [0, -1.3],
    ]).fill();

    this.ctx.fillStyle = "white";
    t.rotate(0, 0, this.map.windDirection.degree);
    t.polygon([
      [-0.5, 0.5],
      [0, 0.2],
      [0.5, 0.5],
      [0, -0.65],
    ]).fill();
    t.reset();
  }

  protected makeNavaidNdb(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);
    t.circle(0, 0, 0.7).stroke();

    t.style(this.colors.magentaTransparent);
    for (let i = 0; i < 360; i += 20) {
      t.circle(0, 1.2, 0.15).fill();
      t.rotate(0, 0, 20);
    }
    for (let i = 0; i < 360; i += 18) {
      t.circle(0, 1.6, 0.15).fill();
      t.rotate(0, 0, 18);
    }
    for (let i = 0; i < 360; i += 15) {
      t.circle(0, 2, 0.15).fill();
      t.rotate(0, 0, 15);
    }
    t.reset();
  }

  protected makeNavaidVor(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);

    t.polygon([
      [0.5, 0.7],
      [0.8, 0],
      [0.5, -0.7],
      [-0.5, -0.7],
      [-0.8, 0],
      [-0.5, 0.7],
    ]).stroke();

    t.style(this.colors.blueTransparent);
    t.textStyle();

    t.polygon([
      [-0.2, -3.2],
      [0.2, -3.2],
      [0, -3.5],
    ]).fill();
    t.circle(0, 0, 3).stroke();

    for (let i = 0; i < 360; i += 15) {
      t.line(0, 3, 0, i % 45 === 0 ? 2.6 : 2.8).stroke();
      if (i % 90 === 0) {
        t.text(0, -2.1, CanvasTool.numPad(i / 10, 2), false);
      }
      t.rotate(0, 0, 15);
    }
    t.reset();
  }

  protected makeWaypoint(approachPoint: Waypoint) {
    const t = this.getNewCanvasTool(
      approachPoint.coordinates.x,
      approachPoint.coordinates.y
    );

    t.style(this.colors.blue);
    t.polygon([
      [0.35, 0],
      [0.15, 0, 0, 0.15, 0, 0.35],
      [0, 0.15, -0.15, 0, -0.35, 0],
      [-0.15, 0, 0, -0.15, 0, -0.35],
      [0, -0.15, 0.15, 0, 0.35, 0],
    ]).fill();
    t.text(
      0,
      approachPoint.isSwitchLabelPosition ? -0.5 : 0.9,
      approachPoint.code
    );

    t.style("white");
    t.circle(0, 0, 0.1).fill();
  }

  protected makePin(x: number, y: number, pin: number) {
    const t = this.getNewCanvasTool(x, y);
    t.style("black", "black", 0.05);
    t.textStyle(0.4);
    t.line(0.5, 1, 0, 0).stroke();
    t.circle(0, 0, 0.25).fill();

    this.ctx.fillStyle = "white";
    t.text(0.01, 0.14, String(pin), false);
  }

  protected makeIls(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);
    t.polygon([
      [0.0, -1.2],
      [0.4, -Airport.ILS_RANGE / 2 - 0.3],
      [0, -Airport.ILS_RANGE / 2],
      [-0.4, -Airport.ILS_RANGE / 2 - 0.3],
    ]).fill();
    this.ctx.fillStyle = this.colors.whiteTransparent;
    t.polygon([
      [0, -1.4],
      [0, -Airport.ILS_RANGE / 2 + 0.1],
      [0.3, -Airport.ILS_RANGE / 2 - 0.1],
    ]).fill();
  }

  protected makePointerArrow(x: number, y: number, scale = 1) {
    const t = this.getNewCanvasTool(x, y);
    t.polygon([
      [-0.25, scale * 0.4],
      [0.25, scale * 0.4],
      [0, scale * 0.1],
    ]).fill();
  }

  protected getNewCanvasTool(x: number, y: number) {
    return new CanvasTool(this.ctx, x, y, this.multiplier);
  }
}
