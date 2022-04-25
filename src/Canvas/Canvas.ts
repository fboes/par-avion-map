import LocationsMap from "../ParAvion/LocationsMap.js";
import Navaid from "../ParAvion/Navaid.js";
import Airport from "../ParAvion/Airport.js";
import TerrainMap from "../ParAvion/TerrainMap.js";
import CanvasTool from "./CanvasTool.js";
import Waypoint from "../ParAvion/Waypoint.js";

export default class Canvas {
  colors = {
    'blue': '#002da3',
    'blueTransparent': 'rgba(0, 45, 163, 0.5)',
    'magenta': '#800033',
    'magentaTransparent': 'rgba(128, 0, 51, 0.5)',
    'river': '#0c2a6c',
    'greyHue': 'rgba(0, 0, 0, 0.5)',
  };

  elevationColors = {
    '0': '#e8fcfd', // 0 blue
    '5': '#d7e4c6', // 0+ green
    '1000': '#bac7ab', // 1000+ green
    '2000': '#fbf1cd', // 2000+ yellow
    '3000': '#fbeca9', // 3000+ yellow
    '4000': '#e8c899', // 5000+ orange
    '5000': '#c58c3e', // 7000+ orange
    '6000': '#775843', // 9000+ brown
  }

  protected ctx: CanvasRenderingContext2D;
  protected multiplier: number;

  constructor(protected canvas: HTMLCanvasElement, protected map: LocationsMap, protected terrain: TerrainMap) {
    const ctx = canvas.getContext('2d');
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
    this.ctx.fillStyle = this.elevationColors['5'];
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  makeGrid() {
    const t = this.getNewCanvasTool(0, 0);
    t.style(this.colors.greyHue);
    t.textStyle();
    t.rect(0, 0, this.map.mapDimension, this.map.mapDimension).stroke();

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
      if ((i - offset) % 5 === 0) {
        t.line(0, i, this.map.mapDimension, i).stroke();
        t.line(i, 0, i, this.map.mapDimension).stroke();
      } else {
        t.line(0, i, 0.25, i).stroke();
        t.line(this.map.mapDimension - 0.25, i, this.map.mapDimension, i).stroke();
        t.line(i, 0, i, 0.25).stroke();
        t.line(i, this.map.mapDimension - 0.25, i, this.map.mapDimension).stroke();
      }
      if ((i - offset) % 10 === 0) {
        t.lineWidth = oldlineWidth;
      }
    }

    /*
    <text class="outline" x="<?= $p.center.x ?>" y="1.1"><a xlink:href="<?= Svg.xml($_SERVER['SCRIPT_NAME'] . '?salt=' . urlencode($salt) . '&maxdimension=' . $maxDimension) ?>">MAP: <?= Svg.xml($salt) ?></a></text>
    <text class="outline" x="<?= $p.center.x ?>" y="<?= $p.mapDimension - 0.7 ?>"><?= $p.mapDimension / 2 ?> / <?= $p.mapDimension ?>NM</text>
  </g>
</g>
    */
  }
  makeMaximumElevationFigures() {
    /*
    <g id="maximum-elevation-figure" inkscape:groupmode="layer" inkscape:label="Maximum Elevation Figures">
    $start = $offset >= 5 ? $offset : ($offset + 10) ?>
    for (i = $start; i <= $p.mapDimension + $offset; i += 10) {
      for ($j = $start; $j <= $p.mapDimension + $offset; $j += 10) {
        <text x="<?= i - 5 ?>" y="<?= $j - 4.5 ?>" class="maximum-elevation-figure outline">
          <title>Maximum elevation: $elevation = max($t.getHighestElevationNm(new Coordinates(i - 10, $j - 10), 11, 11), $p.getHighestObstruction(i - 10, $j - 10, 10, 10));
                                    echo ($elevation);
                                    $h = Svg.terrain_elevations($elevation) ?> ft</title>
          <tspan><?= $h[0]; ?></tspan><tspan class="small" dy="-0.2"><?= $h[1]; ?></tspan>
        </text>
      }
    }
  </g>
    */
  }

  makePeaks() {
    this.terrain.peaks.forEach((peak) => {
      if (peak.coordinates.elevation) {

        const t = this.getNewCanvasTool(peak.coordinates.x, peak.coordinates.y);
        t.style('black');
        t.textStyle();
        t.circle(0, 0, 0.1).fill();
        t.textMultiline(
          0,
          peak.isSwitchLabelPosition ? -1 : 0.7,
          [
            String(Math.ceil(peak.coordinates.elevation)),
            peak.name
          ]
        );
      }
    });
  }

  makeObstructions() {
    this.map.obstructions.forEach((obstruction) => {
      const t = this.getNewCanvasTool(obstruction.coordinates.x, obstruction.coordinates.y);

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
          [0.1, -0.2, 0.3, 0, 0.5, 0.1]
        ]).fill();
      } else {
        t.polygon([[0.5, 0.1], [0, -1], [-0.5, 0.1], [-0.3, 0.1], [0, -0.6], [0.3, 0.1]]).fill();
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
        String((obstruction.coordinates.elevation || 0) + obstruction.heightAboveGround),
        '(' + String(obstruction.heightAboveGround) + ')'
      ]);
    })
  }

  makeNavaids() {
    this.map.navAids.forEach((navaid, id) => {
      const t = this.getNewCanvasTool(navaid.coordinates.x, navaid.coordinates.y);

      t.style(navaid.type === Navaid.VOR ? this.colors.blue : this.colors.magenta);
      t.textStyle();
      t.circle(0, 0, 0.15).fill();

      if (navaid.type === Navaid.NDB) {
        t.circle(0, 0, 0.7).stroke();
        this.getNavaidNdbRing(navaid.coordinates.x, navaid.coordinates.y);
      } else {
        t.polygon([[0.5, 0.7], [0.8, 0], [0.5, -0.7], [-0.5, -0.7], [-0.8, 0], [-0.5, 0.7]]).stroke();
        this.getNavaidVorRing(navaid.coordinates.x, navaid.coordinates.y);
      }

      t.style(navaid.type === Navaid.VOR ? this.colors.blue : this.colors.magenta);
      if (navaid.hasDme) {
        t.strokeRect(-0.8, -0.7, 1.6, 1.4);
      }

      if (navaid.holdingPattern) {
        t.rotate(0, 0, navaid.holdingPattern.direction.degree);
        /*
        <g class="holding-pattern" transform="rotate(<?= navaid.holdingPattern.direction[0] ?> 0 0)">
          <use xlink:href="#holding-pattern" class="navaid-pattern" transform="scale(<?= navaid.holdingPattern.isRight ? 1 : -1 ?> 1)" />
          <text class="outline" x="0.5" y="0.2" transform="translate(0 1.25) rotate(90 0 0)"><?= Svg.num_pad(navaid.holdingPattern.direction[0]) ?>°</text>
          <g transform="rotate(180 0 0) translate(<?= navaid.holdingPattern.isRight ? -HoldingPattern.WIDTH : HoldingPattern.WIDTH ?> <?= HoldingPattern.WIDTH - HoldingPattern.LENGTH ?>)">
            <text class="outline" x="0.5" y="0.2" transform="translate(0 1.25) rotate(90 0 0)"><?= Svg.num_pad(navaid.holdingPattern.direction[1]) ?>°</text>
          </g>
        </g>*/
        t.reset();
      }

      t.textMultiline(
        0,
        (navaid.type === Navaid.NDB)
          ? (navaid.isSwitchLabelPosition ? -3 : 2.7)
          : (navaid.isSwitchLabelPosition ? -1.6 : 1.3),
        [
          navaid.name,
          CanvasTool.frequency(navaid.frequency) + ' ' + navaid.code
        ]
      );

      this.getPin(navaid.coordinates.x - 0.75, navaid.coordinates.y - 1.7, id + 1);
    })
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
        /*
                if ($runway.trafficPatterns[0]) {
          <use xlink:href="#traffic-pattern" x="0" y="0" transform="scale(<?= $runway.trafficPatterns[0].isRight ? 1 : -1 ?> 1)" />
        }
        */

        this.ctx.fillStyle = 'white';
        t.fillRect(
          runway.width / 500 / -2,
          runway.length / 6076 / -2,
          runway.width / 500,
          runway.length / 6076
        );

        t.style(accentColor);
        if (runway.ilsFrequencies.first) {
          this.getIls(airport.coordinates.x, airport.coordinates.y);
        }
        if (runway.ilsFrequencies.second) {
          t.rotate(0, 0, 180);
          this.getIls(airport.coordinates.x, airport.coordinates.y);
        }

        t.reset();
      });

      if (airport.hasBeacon) {
        const offset = 1.1;
        t.style('white', baseColor, 0.05);
        t.polygon([
          [0, -0.2 - offset], [+0.065, -0.05 - offset],
          [+0.2, -0.05 - offset], [+0.08, 0.06 - offset],
          [+0.15, 0.2 - offset], [0, 0.12 - offset],
          [-0.15, 0.2 - offset], [-0.08, 0.06 - offset],
          [-0.2, -0.05 - offset], [-0.065, -0.05 - offset]
        ]).fill()
        this.ctx.stroke();
      }

      t.style(baseColor);
      t.textMultiline(
        0,
        airport.isSwitchLabelPosition ? -2 : 1.75,
        [
          airport.name + ' (' + airport.code + ')',
          (airport.hasTower ? 'CT ' : 'UNICOM ') + CanvasTool.frequency(airport.frequency) +
          (airport.runways[0].ilsFrequencies.first ? ' ILS ' + CanvasTool.frequency(airport.runways[0].ilsFrequencies.first) : '')
        ]
      )

      airport.approachPoints.forEach((approachPoint) => {
        this.getWaypoint(approachPoint);
      })

      this.getPin(airport.coordinates.x - 1.1, airport.coordinates.y - 1.75, id + 1);
    });
  }

  makeWind() {
    const t = this.getNewCanvasTool(1.2, this.map.mapDimension - 1.2);

    this.ctx.fillStyle = 'black';
    t.textStyle();

    t.circle(0, 0, 0.9).fill();
    t.text(0, -1.45, 'N')
    t.polygon([
      [-0.3, -1],
      [0.3, -1],
      [0, -1.3]
    ]).fill();

    this.ctx.fillStyle = 'white';
    t.rotate(0, 0, this.map.windDirection.degree);
    t.polygon([
      [-0.5, 0.5],
      [0, 0.2],
      [0.5, 0.5],
      [0, -0.65]
    ]).fill();
    t.reset();
  }

  protected getNavaidNdbRing(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);

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

  protected getNavaidVorRing(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);

    t.style(this.colors.blueTransparent);
    t.textStyle();

    t.polygon([[-0.2, -3.2], [0.2, -3.2], [0, -3.5]]).fill();
    t.circle(0, 0, 3).stroke();

    for (let i = 0; i < 360; i += 15) {
      t.line(0, 3, 0, (i % 45 === 0) ? 2.6 : 2.8).stroke();
      if (i % 90 === 0) {
        t.text(0, -2.1, CanvasTool.numPad(i / 10, 2));
      }
      t.rotate(0, 0, 15);
    }
    t.reset();
  }

  protected getWaypoint(approachPoint: Waypoint) {
    const t = this.getNewCanvasTool(approachPoint.coordinates.x, approachPoint.coordinates.y);

    t.style(this.colors.blue);
    t.polygon([
      [0.35, 0], [0.15, 0, 0, 0.15, 0, 0.35], [0, 0.15, -0.15, 0, -0.35, 0], [-0.15, 0, 0, -0.15, 0, -0.35], [0, -0.15, 0.15, 0, 0.35, 0]
    ]).fill();
    t.text(0, approachPoint.isSwitchLabelPosition ? -0.5 : 0.9, approachPoint.code);

    t.style('white');
    t.circle(0, 0, 0.1).fill();
  }

  protected getPin(x: number, y: number, pin: number) {
    const t = this.getNewCanvasTool(x, y);
    t.style('black', 'black', 0.05);
    t.textStyle(0.4);
    t.line(0.5, 1, 0, 0).stroke();
    t.circle(0, 0, 0.25).fill();

    this.ctx.fillStyle = 'white';
    t.text(0.01, 0.14, String(pin));
  }

  protected getIls(x: number, y: number) {
    const t = this.getNewCanvasTool(x, y);
    t.polygon([
      [0.0, -1.2],
      [0.4, -Airport.ILS_RANGE / 2 - 0.3],
      [0, -Airport.ILS_RANGE / 2],
      [-0.4, -Airport.ILS_RANGE / 2 - 0.3]
    ]).fill();
    //<path class="airport-ils white" d="M 0,-1.4 L 0,<?= -Airport.ILS_RANGE / 2 + 0.1 ?> L 0.3,<?= -Airport.ILS_RANGE / 2 - 0.1 ?> z" />
  }

  protected getNewCanvasTool(x: number, y: number) {
    return new CanvasTool(this.ctx, x, y, this.multiplier);
  }
}


/*
 <defs>
    <polygon id="pointer-arrow" points="-0.25,0.4 0.25,0.4 0,0.1" />
    <g id="holding-pattern">
      <rect x="0" y="-<?= HoldingPattern.WIDTH / 2 ?>" rx="<?= HoldingPattern.WIDTH / 2 ?>" ry="<?= HoldingPattern.WIDTH / 2 ?>" width="<?= HoldingPattern.WIDTH ?>" height="<?= HoldingPattern.LENGTH ?>" class="stroke" />
      <use href="#pointer-arrow" />
      <use href="#pointer-arrow" transform="translate(<?= HoldingPattern.WIDTH ?> <?= HoldingPattern.LENGTH - HoldingPattern.WIDTH ?>) rotate(180)" />
    </g>
    <g id="traffic-pattern" class="airport-pattern">
      <rect x="-<?= Runway.TRAFFICPATTERN_WIDTH ?>" y="-<?= Runway.TRAFFICPATTERN_LENGTH / 2 ?>" rx="0.5" ry="0.5" width="<?= Runway.TRAFFICPATTERN_WIDTH ?>" height="<?= Runway.TRAFFICPATTERN_LENGTH ?>" class="stroke" />
      <use href="#pointer-arrow" transform="translate(-<?= Runway.TRAFFICPATTERN_WIDTH ?> <?= 0.33 * Runway.TRAFFICPATTERN_LENGTH ?>)" />
      <use href="#pointer-arrow" transform="translate(0 <?= -0.33 * Runway.TRAFFICPATTERN_LENGTH ?>) rotate(180)" />
      <line x1="0" y1="<?= 0.5 * Runway.TRAFFICPATTERN_LENGTH ?>" x2="0" y2="<?= 0.7 * Runway.TRAFFICPATTERN_LENGTH ?>" />
      <use href="#pointer-arrow" transform="translate(0 <?= 0.75 * Runway.TRAFFICPATTERN_LENGTH ?>) rotate(180)" />
      <line x1="<?= -Runway.TRAFFICPATTERN_WIDTH - 1 ?>" y1="1" x2="<?= -Runway.TRAFFICPATTERN_WIDTH ?>" y2="0" />
      <use href="#pointer-arrow" transform="translate(<?= -Runway.TRAFFICPATTERN_WIDTH - 0.75 ?> 0.75) rotate(45)" />
    </g>

  </defs>

  */
