import Randomizer from "./Helper/Randomizer.js";
import LocationsMap from "./World/LocationsMap.js";
import TerrainMap from "./World/TerrainMap.js";
import CanvasApproach from "./Canvas/CanvasApproach.js";
import CanvasMap from "./Canvas/CanvasMap.js";
import Coordinates from "./Types/Coordinates.js";
import CanvasHsi from "./Canvas/CanvasHsi.js";
import Degree from "./Types/Degree.js";
import Plane from "./Plane/Plane.js";
import Navaid from "./World/Navaid.js";
import Weather from "./World/Weather.js";
export default class App {
    constructor() {
        this.multiplier = 0;
        this.elements = {
            mapCanvas: document.getElementById('map'),
            hsiCanvas: document.getElementById('hsi'),
            sixPackCanvas: document.getElementById('six-pack'),
            airportsCanvases: document.querySelectorAll('.approaches canvas'),
            seedInput: document.getElementById('seed'),
            mapDimensionInput: document.getElementById('mapdimension'),
            resolutionInput: document.getElementById('resolution'),
            randomizeButton: document.getElementById('randomize'),
            generateButton: document.getElementById('generate'),
            headingSelectInput: document.getElementById('heading-select'),
            course1Input: document.getElementById('course-1'),
            course2Input: document.getElementById('course-2'),
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
        }, '', '#' + this.randomizer.seed + '-' + this.map.mapDimension + '-' + this.terrain.resolution);
    }
    generateFromSeed(seed, dimension, resolution) {
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
        this.elements.headingSelectInput.valueAsNumber = this.map.airports[0].approachPoints[1].coordinates.getBearing(this.map.airports[1].approachPoints[0].coordinates);
        this.plane.hsi.headingSelect = new Degree(this.elements.headingSelectInput.valueAsNumber);
        this.plane.heading = new Degree(this.map.airports[0].runways[0].heading.oppositeDegree);
        this.plane.navRadios.forEach((navRadio, index) => {
            navRadio.navAids = this.map.navAids;
            navRadio.setCurrentNavAid(index, this.map.airports[0].coordinates);
            const courseSelect = index === 0 ? this.elements.course1Input : this.elements.course2Input;
            courseSelect.disabled = navRadio.type !== Navaid.VOR;
            if (navRadio.bearing) {
                courseSelect.valueAsNumber = this.map.airports[0].coordinates.getBearing(navRadio.navAids[index].coordinates);
            }
            navRadio.setCourse(courseSelect.valueAsNumber);
        });
        this.hsi = new CanvasHsi(this.elements.hsiCanvas, this.plane.hsi);
        //this.sixPack = new CanvasSixPack(this.elements.sixPackCanvas, this.plane);
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
    updatePosition(event) {
        const bound = this.elements.mapCanvas.getBoundingClientRect();
        this.plane.coordinates = new Coordinates((event.clientX - bound.left) / this.multiplier * window.devicePixelRatio, (event.clientY - bound.top) / this.multiplier * window.devicePixelRatio);
        this.plane.coordinates.elevation = this.terrain.getElevationNm(this.plane.coordinates);
        this.hsi.draw();
    }
    changeHeading() {
        if (this.planeCoordinatesOld) {
            this.plane.heading = new Degree(this.planeCoordinatesOld.getBearing(this.plane.coordinates));
        }
        this.planeCoordinatesOld = new Coordinates(this.plane.coordinates.x, this.plane.coordinates.y);
        console.log(this.weather.at(this.plane.coordinates));
        this.hsi.draw();
    }
    changeHeadingSelect(event) {
        if (this.plane.hsi.headingSelect) {
            const target = event.target;
            if (target.valueAsNumber < 0) {
                target.valueAsNumber += 360;
            }
            else if (target.valueAsNumber > 359) {
                target.valueAsNumber -= 360;
            }
            this.plane.hsi.headingSelect = new Degree(target.valueAsNumber);
            this.hsi.draw();
        }
    }
    changeCourse(event, index) {
        const radio = this.plane.navRadios[index];
        const target = event.target;
        if (radio && radio.course && target) {
            if (target.valueAsNumber < 0) {
                target.valueAsNumber += 360;
            }
            else if (target.valueAsNumber > 359) {
                target.valueAsNumber -= 360;
            }
            radio.setCourse(target.valueAsNumber);
            this.hsi.draw();
        }
    }
}
