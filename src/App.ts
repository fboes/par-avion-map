import Randomizer from "./Helper/Randomizer.js";
import LocationsMap from "./World/LocationsMap.js";
import TerrainMap from "./World/TerrainMap.js";
import CanvasApproach from "./Canvas/CanvasApproach.js";
import CanvasMap from "./Canvas/CanvasMap.js";
import Coordinates from "./Types/Coordinates.js";
import CanvasMapLog from "./Canvas/CanvasMapLog.js";
import Degree from "./Types/Degree.js";
import Plane from "./Plane/Plane.js";
import Weather from "./World/Weather.js";
import CanvasHsi from "./Canvas/CanvasHsi.js";
import CanvasSixPack from "./Canvas/CanvasSixPack.js";
import Hsi from "./Plane/Hsi.js";
import XboxGamepad from "./Helper/Gamepad.js";

type Elements = {
  mapCanvas: HTMLCanvasElement,
  mapHsiCanvas: HTMLCanvasElement,
  hsiCanvas: HTMLCanvasElement,
  sixPackCanvas: HTMLCanvasElement,
  airportsCanvases: NodeListOf<HTMLCanvasElement>,
  seedInput: HTMLInputElement,
  mapDimensionInput: HTMLInputElement,
  resolutionInput: HTMLInputElement,
  randomizeButton: HTMLInputElement,
  generateButton: HTMLInputElement,
  changeLogCheckbox: HTMLInputElement
};

export default class App {
  protected randomizer!: Randomizer;
  protected map!: LocationsMap;
  protected terrain!: TerrainMap;
  protected weather!: Weather;
  protected mapHsi!: CanvasMapLog;
  protected hsi!: CanvasHsi;
  protected sixPack!: CanvasSixPack;
  protected plane!: Plane;
  protected planeCoordinatesOld!: Coordinates;
  protected multiplier = 0;
  public elements: Elements;
  protected lastTimestamp!: number;
  protected lastLogTimestamp: number = 0;
  protected gamepad: XboxGamepad;

  static TIME_COMPRESSION = 10;

  constructor() {
    this.elements = {
      mapCanvas: <HTMLCanvasElement>document.getElementById('map'),
      mapHsiCanvas: <HTMLCanvasElement>document.getElementById('map-hsi'),
      hsiCanvas: <HTMLCanvasElement>document.getElementById('hsi'),
      sixPackCanvas: <HTMLCanvasElement>document.getElementById('six-pack'),
      airportsCanvases: <NodeListOf<HTMLCanvasElement>>document.querySelectorAll('.approaches canvas'),
      seedInput: <HTMLInputElement>document.getElementById('seed'),
      mapDimensionInput: <HTMLInputElement>document.getElementById('mapdimension'),
      resolutionInput: <HTMLInputElement>document.getElementById('resolution'),
      randomizeButton: <HTMLInputElement>document.getElementById('randomize'),
      generateButton: <HTMLInputElement>document.getElementById('generate'),
      changeLogCheckbox: <HTMLInputElement>document.getElementById('show-log')
    };
    this.gamepad = new XboxGamepad();
    this.generateMap();
  }

  generateMap() {
    this.randomizer = new Randomizer(this.elements.seedInput ? this.elements.seedInput.value : ''),
      this.randomizer.seed = this.elements.seedInput ? this.elements.seedInput.value : '';
    this.elements.seedInput.value = this.randomizer.seed;
    this.map = new LocationsMap(this.elements.mapDimensionInput ? this.elements.mapDimensionInput.valueAsNumber : 16, this.randomizer);
    this.randomizer.seed = this.randomizer.seed;
    this.terrain = new TerrainMap(this.map, this.randomizer, this.elements.resolutionInput ? this.elements.resolutionInput.valueAsNumber : 4);
    this.randomizer.seed = this.randomizer.seed;
    this.weather = new Weather(this.map, this.randomizer);

    this.pushState();
    this.drawMap();
  }

  pushState() {
    history.pushState({
      seed: this.randomizer.seed,
      dimension: this.map.mapDimension,
      resolution: this.terrain.resolution
    }, '', '#' + this.randomizer.seed + '-' + this.map.mapDimension + '-' + this.terrain.resolution)
  }

  generateFromSeed(seed: string, dimension: number, resolution: number) {
    this.randomizer.seed = seed;
    this.map = new LocationsMap(dimension, this.randomizer);
    this.randomizer.seed = this.randomizer.seed;
    this.terrain = new TerrainMap(this.map, this.randomizer, resolution);
    this.randomizer.seed = this.randomizer.seed;
    this.weather = new Weather(this.map, this.randomizer);

    this.drawMap();
  }

  drawMap() {
    this.plane = new Plane(this.map.airports[0].coordinates);
    this.plane.hsi.headingSelect = new Degree(
      this.map.airports[0].approachPoints[1].coordinates.getBearing(this.map.airports[1].approachPoints[0].coordinates)
    );
    this.plane.heading = new Degree(this.map.airports[0].runways[0].heading.oppositeDegree);
    this.plane.navRadios.forEach((navRadio, index) => {
      navRadio.navAids = this.map.navAids;
      navRadio.setCurrentNavAid(index, this.map.airports[0].coordinates);
      if (navRadio.bearing && navRadio.navAids[index]) {
        navRadio.setCourse(
          this.map.airports[0].coordinates.getBearing(navRadio.navAids[index].coordinates)
        );
      }
    });

    this.hsi = new CanvasHsi(this.elements.hsiCanvas, this.plane.hsi);
    this.sixPack = new CanvasSixPack(this.elements.sixPackCanvas, this.plane);
    this.mapHsi = new CanvasMapLog(this.elements.mapHsiCanvas, this.plane, this.map);

    if (this.elements.mapCanvas) {
      const canvasMap = new CanvasMap(this.elements.mapCanvas, this.map, this.terrain);
      this.multiplier = canvasMap.multiplier;
    }

    this.elements.airportsCanvases.forEach((airportCanvas, id) => {
      airportCanvas.style.display = this.map.airports[id] ? 'block' : 'none';
      if (this.map.airports[id]) {
        new CanvasApproach(airportCanvas, this.map.airports[id], this.map.navAids);
      }
    });
  }

  onClickPosition(event: MouseEvent) {
    const bound = this.elements.mapCanvas.getBoundingClientRect();
    const clickCoordinates = new Coordinates(
      (event.clientX - bound.left) / this.multiplier * window.devicePixelRatio,
      (event.clientY - bound.top) / this.multiplier * window.devicePixelRatio,
    );
    this.plane.hsi.headingSelect = new Degree(this.plane.coordinates.getBearing(clickCoordinates));
    this.plane.navRadios.forEach((navRadio => {
      navRadio.setCourseByCoordinates(clickCoordinates);
    }));
  }

  onRequestAnimationFrame(timestamp: number) {
    if (this.lastTimestamp && this.lastTimestamp !== timestamp) {
      const delta = timestamp - this.lastTimestamp

      if (this.gamepad) {
        const gamepad = this.gamepad.getGamepadState();
        if (gamepad !== null) {
          gamepad.buttons[XboxGamepad.BUTTON_INDEX.lBumper].triggered && this.plane.hsi.activateNextElement(-1);
          gamepad.buttons[XboxGamepad.BUTTON_INDEX.rBumper].triggered && this.plane.hsi.activateNextElement(+1);
          gamepad.buttons[XboxGamepad.BUTTON_INDEX.lTrigger].triggered
            && (this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV1_SOURCE || this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV2_SOURCE)
            && this.plane.hsi.navRadios[this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV1_SOURCE ? 0 : 1].changeCurrentNavaid(-1, this.plane.coordinates);
          gamepad.buttons[XboxGamepad.BUTTON_INDEX.rTrigger].triggered
            && (this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV1_SOURCE || this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV2_SOURCE)
            && this.plane.hsi.navRadios[this.plane.hsi.activeElement === Hsi.INTERACTIVE_NAV1_SOURCE ? 0 : 1].changeCurrentNavaid(1, this.plane.coordinates);

          if (gamepad.buttons[XboxGamepad.BUTTON_INDEX.lTrigger].value + gamepad.buttons[XboxGamepad.BUTTON_INDEX.rTrigger].value > 0) {
            const axis = (-gamepad.buttons[XboxGamepad.BUTTON_INDEX.lTrigger].value + gamepad.buttons[XboxGamepad.BUTTON_INDEX.rTrigger].value) * delta / 12;
            switch (this.plane.hsi.activeElement) {
              case Hsi.INTERACTIVE_NAV1_COURSE:
                this.plane.hsi.navRadios[0].course && this.plane.hsi.navRadios[0].course.add(axis);
                break;
              case Hsi.INTERACTIVE_NAV2_COURSE:
                this.plane.hsi.navRadios[1].course && this.plane.hsi.navRadios[1].course.add(axis);
                break;
              case Hsi.INTERACTIVE_HEADING:
                this.plane.hsi.headingSelect && this.plane.hsi.headingSelect.add(axis);
                break;
            }
          }

          if (gamepad.axes.throttle) {
            this.plane.throttle = gamepad.axes.throttle * 100; // -1..+1 -> 0..100
          } else {
            this.plane.throttle -= (gamepad.axes.rThumbY * delta / 15);
          }
          this.plane.elevator = gamepad.axes.lThumbY * 45;
          this.plane.ailerons = gamepad.axes.lThumbX * 45;
          this.plane.rudder = gamepad.axes.rThumbX * 5;
        }

        const unBroken = this.plane.move(delta, this.weather.at(this.plane.coordinates), this.terrain.getElevationNm(this.plane.coordinates));
        if (!unBroken) {
          this.mapHsi.showLog = true;
        }
        this.mapHsi.draw();
        this.hsi.draw();
        this.sixPack.draw();
      }

      if (this.plane.isActive) {
        this.lastLogTimestamp += timestamp - this.lastTimestamp;
        // Snapshot log every 1000ms
        if (!this.plane.isBroken && this.lastLogTimestamp > 1000) {
          this.plane.flightLog.push(this.plane.getLogCoordinates(timestamp));
          this.lastLogTimestamp -= 1000;
        }
      }

    }
    this.lastTimestamp = timestamp;

    window.requestAnimationFrame(this.onRequestAnimationFrame.bind(this));
  }

  onChangeHeadingSelect(event: Event) {
    if (this.plane.hsi.headingSelect) {
      const target = <HTMLInputElement>event.target;
      if (target.valueAsNumber < 0) {
        target.valueAsNumber += 360;
      } else if (target.valueAsNumber > 359) {
        target.valueAsNumber -= 360;
      }
      this.plane.hsi.headingSelect = new Degree(target.valueAsNumber);
    }
  }

  onChangeCourse(event: Event, index: number) {
    const radio = this.plane.navRadios[index];
    const target = <HTMLInputElement>event.target;
    if (radio && radio.course && target) {
      if (target.valueAsNumber < 0) {
        target.valueAsNumber += 360;
      } else if (target.valueAsNumber > 359) {
        target.valueAsNumber -= 360;
      }
      radio.setCourse(target.valueAsNumber);
    }
  }

  onChangeLogging(event: Event) {
    const tgt = <HTMLInputElement>event.target;
    if (tgt && this.mapHsi) {
      this.mapHsi.showLog = tgt.checked;
    }
  }
}
