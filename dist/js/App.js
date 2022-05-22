import Randomizer from "./Helper/Randomizer.js";
import LocationsMap from "./ParAvion/LocationsMap.js";
import TerrainMap from "./ParAvion/TerrainMap.js";
import CanvasApproach from "./Canvas/CanvasApproach.js";
import CanvasMap from "./Canvas/CanvasMap.js";
import Coordinates from "./Types/Coordinates.js";
import CanvasHsi from "./Canvas/CanvasHsi.js";
import Hsi from "./Cockpit/Hsi.js";
import Navaid from "./ParAvion/Navaid.js";
import Degree from "./Types/Degree.js";
export default class App {
    constructor() {
        this.multiplier = 0;
        this.elements = {
            mapCanvas: document.getElementById('map'),
            hsiCanvas: document.getElementById('hsi'),
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
        this.drawMap();
    }
    drawMap() {
        this.hsi = new CanvasHsi(this.elements.hsiCanvas, new Hsi(0));
        this.hsi.hsi.headingSelect = new Degree(this.elements.headingSelectInput.valueAsNumber);
        this.map.navAids.forEach((navAid, index) => {
            let currentRadio = this.hsi.hsi.navRadios[index];
            if (currentRadio !== undefined) {
                let currentCourseInput = (index === 0)
                    ? this.elements.course1Input
                    : this.elements.course2Input;
                currentCourseInput.disabled = (navAid.type !== Navaid.VOR);
                currentRadio.label = navAid.code;
                currentRadio.type = navAid.type;
                if (navAid.type === Navaid.VOR) {
                    currentRadio.setCourse(currentCourseInput.valueAsNumber);
                }
            }
        });
        this.hsi.draw();
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
        const yourCoords = new Coordinates((event.clientX - bound.left) / this.multiplier, (event.clientY - bound.top) / this.multiplier);
        this.map.navAids.forEach((navAid, index) => {
            let currentRadio = this.hsi.hsi.navRadios[index];
            if (currentRadio) {
                currentRadio.label = navAid.code;
                currentRadio.type = navAid.type;
                currentRadio.setBearing(yourCoords.getBearing(navAid.coordinates));
                currentRadio.distance = navAid.hasDme ? yourCoords.getDistance(navAid.coordinates) : undefined;
            }
        });
        this.hsi.draw();
    }
    changeHeading(event) {
        this.hsi.hsi.heading.degree -= (event.deltaY / 100);
        this.hsi.draw();
    }
    changeHeadingSelect(event) {
        if (this.hsi.hsi.headingSelect) {
            const target = event.target;
            if (target.valueAsNumber < 0) {
                target.valueAsNumber += 360;
            }
            else if (target.valueAsNumber > 359) {
                target.valueAsNumber -= 360;
            }
            this.hsi.hsi.headingSelect = new Degree(target.valueAsNumber);
            this.hsi.draw();
        }
    }
    changeCourse(event, index) {
        const radio = this.hsi.hsi.navRadios[index];
        const target = event.target;
        if (radio && radio.course && target) {
            if (target.valueAsNumber < 0) {
                target.valueAsNumber += 360;
            }
            else if (target.valueAsNumber > 359) {
                target.valueAsNumber -= 360;
            }
            radio.setCourse(target.valueAsNumber);
            radio.caluclateDeviation();
            this.hsi.draw();
        }
    }
}
