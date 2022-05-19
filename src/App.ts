import Randomizer from "./Helper/Randomizer.js";
import LocationsMap from "./ParAvion/LocationsMap.js";
import TerrainMap from "./ParAvion/TerrainMap.js";
import CanvasApproach from "./Canvas/CanvasApproach.js";
import CanvasMap from "./Canvas/CanvasMap.js";
import Coordinates from "./Types/Coordinates.js";
import CanvasHsi from "./Canvas/CanvasHsi.js";
import Hsi from "./Cockpit/Hsi.js";
import Navaid from "./ParAvion/Navaid.js";

type Elements = {
  mapCanvas: HTMLCanvasElement,
  hsiCanvas: HTMLCanvasElement,
  airportsCanvases: NodeListOf<HTMLCanvasElement>,
  seedInput: HTMLInputElement,
  mapDimensionInput: HTMLInputElement,
  resolutionInput: HTMLInputElement,
  randomizeButton: HTMLInputElement,
  generateButton: HTMLInputElement
};

export default class App {
  protected randomizer!: Randomizer;
  protected map!: LocationsMap;
  protected terrain!: TerrainMap;
  protected hsi: CanvasHsi;
  protected multiplier = 0;
  public elements: Elements;

  constructor() {
    this.elements = {
      mapCanvas: <HTMLCanvasElement>document.getElementById('map'),
      hsiCanvas: <HTMLCanvasElement>document.getElementById('hsi'),
      airportsCanvases: <NodeListOf<HTMLCanvasElement>>document.querySelectorAll('.approaches canvas'),
      seedInput: <HTMLInputElement>document.getElementById('seed'),
      mapDimensionInput: <HTMLInputElement>document.getElementById('mapdimension'),
      resolutionInput: <HTMLInputElement>document.getElementById('resolution'),
      randomizeButton: <HTMLInputElement>document.getElementById('randomize'),
      generateButton: <HTMLInputElement>document.getElementById('generate'),
    };
    this.hsi = new CanvasHsi(this.elements.hsiCanvas, new Hsi(0));
    this.generateMap();
  }

  generateMap () {
    this.randomizer = new Randomizer(this.elements.seedInput ? this.elements.seedInput.value : ''),
    this.randomizer.seed = this.elements.seedInput ? this.elements.seedInput.value : '';
    this.elements.seedInput.value = this.randomizer.seed;
    this.map = new LocationsMap(this.elements.mapDimensionInput ? this.elements.mapDimensionInput.valueAsNumber : 16, this.randomizer);
    this.randomizer.seed = this.randomizer.seed;
    this.terrain = new TerrainMap(this.map, this.randomizer, this.elements.resolutionInput ? this.elements.resolutionInput.valueAsNumber : 4);

    this.map.navAids.forEach((navAid, index) => {
      let currentRadio = this.hsi.hsi.navRadios[index];
      currentRadio.label = navAid.code;
      if (navAid.type === Navaid.VOR) {
        currentRadio.setCourse(35 * (index +1));
      }
    });

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

    this.drawMap();
  }

  drawMap () {
    if (this.elements.mapCanvas) {
      const canvasMap = new CanvasMap(this.elements.mapCanvas, this.map, this.terrain);
      this.multiplier = canvasMap.multiplier;
    }

    this.elements.airportsCanvases.forEach((airportCanvas, id) => {
      airportCanvas.style.display = this.map.airports[id] ? 'block' : 'none';
      if (this.map.airports[id]) {
        new CanvasApproach(airportCanvas, this.map.airports[id]);
      }
    });
  }

  pointer (event: MouseEvent) {
    const bound = this.elements.mapCanvas.getBoundingClientRect();
    const yourCoords = new Coordinates(
      (event.clientX - bound.left) / this.multiplier,
      (event.clientY - bound.top) / this.multiplier
    );

    this.map.navAids.forEach((navAid, index) => {
      let currentRadio = this.hsi.hsi.navRadios[index];
      currentRadio.label = navAid.code;
      currentRadio.setBearing(yourCoords.getBearing(navAid.coordinates));
      currentRadio.distance = navAid.hasDme ? yourCoords.getDistance(navAid.coordinates) : undefined;
    });

    this.hsi.draw();
  }

  heading(event: WheelEvent) {
    this.hsi.hsi.heading.degree += (event.deltaY / 100);
    this.hsi.draw();
  }
}
