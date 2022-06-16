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
export default class App {
    constructor() {
        this.multiplier = 0;
        this.lastLogTimestamp = 0;
        this.elements = {
            mapCanvas: document.getElementById('map'),
            mapHsiCanvas: document.getElementById('map-hsi'),
            hsiCanvas: document.getElementById('hsi'),
            sixPackCanvas: document.getElementById('six-pack'),
            airportsCanvases: document.querySelectorAll('.approaches canvas'),
            seedInput: document.getElementById('seed'),
            mapDimensionInput: document.getElementById('mapdimension'),
            resolutionInput: document.getElementById('resolution'),
            randomizeButton: document.getElementById('randomize'),
            generateButton: document.getElementById('generate'),
            changeLogCheckbox: document.getElementById('show-log')
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
        this.plane.hsi.headingSelect = new Degree(this.map.airports[0].approachPoints[1].coordinates.getBearing(this.map.airports[1].approachPoints[0].coordinates));
        this.plane.heading = new Degree(this.map.airports[0].runways[0].heading.oppositeDegree);
        this.plane.navRadios.forEach((navRadio, index) => {
            navRadio.navAids = this.map.navAids;
            navRadio.setCurrentNavAid(index, this.map.airports[0].coordinates);
            if (navRadio.bearing && navRadio.navAids[index]) {
                navRadio.setCourse(this.map.airports[0].coordinates.getBearing(navRadio.navAids[index].coordinates));
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
    onClickPosition(event) {
        const bound = this.elements.mapCanvas.getBoundingClientRect();
        const clickCoordinates = new Coordinates((event.clientX - bound.left) / this.multiplier * window.devicePixelRatio, (event.clientY - bound.top) / this.multiplier * window.devicePixelRatio);
        this.plane.hsi.headingSelect = new Degree(this.plane.coordinates.getBearing(clickCoordinates));
        this.plane.navRadios.forEach((navRadio => {
            navRadio.setCourseByCoordinates(clickCoordinates);
        }));
    }
    loop(timestamp) {
        if (this.lastTimestamp && this.lastTimestamp !== timestamp) {
            const delta = timestamp - this.lastTimestamp;
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
                    if (gamepad.axisButtons.lTrigger + gamepad.axisButtons.rTrigger > 0) {
                        const axis = (-gamepad.axisButtons.lTrigger + gamepad.axisButtons.rTrigger) * delta / 12;
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
                    this.plane.changeHeading(gamepad.axes.rThumbX * delta / 50);
                    this.plane.throttle -= (gamepad.axes.rThumbY * delta / 15);
                    this.plane.changeAltitude(gamepad.axes.lThumbY * delta / 10);
                }
                this.plane.move(delta, this.weather.at(this.plane.coordinates), this.terrain.getElevationNm(this.plane.coordinates));
                this.mapHsi.draw();
                this.hsi.draw();
                this.sixPack.draw();
            }
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
    onChangeHeadingSelect(event) {
        if (this.plane.hsi.headingSelect) {
            const target = event.target;
            if (target.valueAsNumber < 0) {
                target.valueAsNumber += 360;
            }
            else if (target.valueAsNumber > 359) {
                target.valueAsNumber -= 360;
            }
            this.plane.hsi.headingSelect = new Degree(target.valueAsNumber);
        }
    }
    onChangeCourse(event, index) {
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
        }
    }
    onChangeLogging(event) {
        const tgt = event.target;
        if (tgt && this.mapHsi) {
            this.mapHsi.showLog = tgt.checked;
        }
    }
}
App.TIME_COMPRESSION = 10;
