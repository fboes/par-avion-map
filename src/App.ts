import Randomizer from "./Helper/Randomizer.js";
import LocationsMap from "./World/LocationsMap.js";
import TerrainMap from "./World/TerrainMap.js";
import CanvasApproach from "./Canvas/CanvasApproach.js";
import CanvasMap from "./Canvas/CanvasMap.js";
import Coordinates from "./Types/Coordinates.js";
import CanvasMapLog from "./Canvas/CanvasMapLog.js";
import Degree from "./Types/Degree.js";
import Plane from "./Plane/Plane.js";
import Navaid from "./World/Navaid.js";
import Weather from "./World/Weather.js";
import CanvasHsi from "./Canvas/CanvasHsi.js";
import CanvasSixPack from "./Canvas/CanvasSixPack.js";

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
  headingSelectInput: HTMLInputElement,
  course1Input: HTMLInputElement,
  course2Input: HTMLInputElement,
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
      headingSelectInput: <HTMLInputElement>document.getElementById('heading-select'),
      course1Input: <HTMLInputElement>document.getElementById('course-1'),
      course2Input: <HTMLInputElement>document.getElementById('course-2'),
      changeLogCheckbox: <HTMLInputElement>document.getElementById('show-log')
    };
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
    this.elements.headingSelectInput.valueAsNumber = Math.round(this.map.airports[0].approachPoints[1].coordinates.getBearing(this.map.airports[1].approachPoints[0].coordinates));
    this.plane.hsi.headingSelect = new Degree(this.elements.headingSelectInput.valueAsNumber);
    this.plane.heading = new Degree(this.map.airports[0].runways[0].heading.oppositeDegree);
    this.plane.navRadios.forEach((navRadio, index) => {
      navRadio.navAids = this.map.navAids;
      navRadio.setCurrentNavAid(index, this.map.airports[0].coordinates);
      const courseSelect = index === 0 ? this.elements.course1Input : this.elements.course2Input;
      courseSelect.disabled = navRadio.type !== Navaid.VOR;
      if (navRadio.bearing) {
        courseSelect.valueAsNumber = Math.round(this.map.airports[0].coordinates.getBearing(navRadio.navAids[index].coordinates));
      }
      navRadio.setCourse(courseSelect.valueAsNumber);
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

  onKeydownGlobal(event: KeyboardEvent) {
    const increment = event.shiftKey ? 10 : 1;
    switch (event.key) {
      case 'Insert':
        this.elements.headingSelectInput.valueAsNumber += increment;
        this.plane.hsi.headingSelect = new Degree(this.elements.headingSelectInput.valueAsNumber);
        break;
      case 'Delete':
        this.elements.headingSelectInput.valueAsNumber -= increment;
        this.plane.hsi.headingSelect = new Degree(this.elements.headingSelectInput.valueAsNumber);
        break;
      case 'Home':
        this.elements.course1Input.valueAsNumber += increment;
        this.plane.navRadios[0].setCourse(this.elements.course1Input.valueAsNumber);
        break;
      case 'End':
        this.elements.course1Input.valueAsNumber -= increment;
        this.plane.navRadios[0].setCourse(this.elements.course1Input.valueAsNumber);
        break;
      case 'PageUp':
        this.elements.course2Input.valueAsNumber += increment;
        this.plane.navRadios[1].setCourse(this.elements.course2Input.valueAsNumber);
        break;
      case 'PageDown':
        this.elements.course2Input.valueAsNumber -= increment;
        this.plane.navRadios[1].setCourse(this.elements.course2Input.valueAsNumber);
        break;
      case 'ArrowLeft': this.plane.changeHeading(-increment); break;
      case 'ArrowRight': this.plane.changeHeading(increment); break;
      case 'ArrowUp': this.plane.throttle += increment; break;
      case 'ArrowDown': this.plane.throttle -= increment; break;
      default: return;
    }

    event.preventDefault();
  }

  loop(timestamp: number) {
    if (this.lastTimestamp && this.lastTimestamp !== timestamp) {
      this.plane.move(timestamp - this.lastTimestamp, this.weather.at(this.plane.coordinates), this.terrain.getElevationNm(this.plane.coordinates));
      this.mapHsi.draw();
      this.hsi.draw();
      this.sixPack.draw();

      this.lastLogTimestamp += timestamp - this.lastTimestamp;
      // Snapshot log every 1000ms
      if (this.lastLogTimestamp > 1000) {
        this.plane.flightLog.push(this.plane.getLogCoordinates(timestamp));
        this.lastLogTimestamp -= 1000;
      }
    }
    this.lastTimestamp = timestamp;

    window.requestAnimationFrame(this.loop.bind(this));
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
