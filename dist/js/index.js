import CanvasApproach from './Canvas/CanvasApproach.js';
import CanvasMap from './Canvas/CanvasMap.js';
import Randomizer from './Helper/Randomizer.js';
import LocationsMap from './ParAvion/LocationsMap.js';
import TerrainMap from './ParAvion/TerrainMap.js';
const elements = {
    mapCanvas: document.getElementById('map'),
    airportsCanvases: document.querySelectorAll('.approaches canvas'),
    seedInput: document.getElementById('seed'),
    mapDimensionInput: document.getElementById('mapdimension'),
    resolutionInput: document.getElementById('resolution'),
    randomizeButton: document.getElementById('randomize'),
    generateButton: document.getElementById('generate'),
};
const randomizer = new Randomizer(elements.seedInput ? elements.seedInput.value : '');
function generateMap() {
    randomizer.seed = elements.seedInput ? elements.seedInput.value : '';
    elements.seedInput.value = randomizer.seed;
    const map = new LocationsMap(elements.mapDimensionInput ? elements.mapDimensionInput.valueAsNumber : 16, randomizer);
    randomizer.seed = randomizer.seed;
    const terrain = new TerrainMap(map, randomizer, elements.resolutionInput ? elements.resolutionInput.valueAsNumber : 4);
    history.pushState({
        seed: randomizer.seed,
        dimension: map.mapDimension,
        resoultion: terrain.resolution
    }, '', '#' + randomizer.seed + '-' + map.mapDimension + '-' + terrain.resolution);
    console.log(map);
    drawMap(map, terrain);
}
function drawMap(map, terrain) {
    if (elements.mapCanvas) {
        new CanvasMap(elements.mapCanvas, map, terrain);
    }
    elements.airportsCanvases.forEach((airportCanvas, id) => {
        airportCanvas.style.display = map.airports[id] ? 'block' : 'none';
        if (map.airports[id]) {
            new CanvasApproach(airportCanvas, map.airports[id]);
        }
    });
}
if (location.hash) {
    const parts = location.hash.slice(1).split('-');
    elements.seedInput.value = parts[0];
    elements.mapDimensionInput.value = parts[1];
    elements.resolutionInput.value = parts[2];
}
// -----------------------------------------------------------------------------
generateMap();
elements.generateButton.addEventListener('click', generateMap);
elements.seedInput.addEventListener('change', generateMap);
elements.mapDimensionInput.addEventListener('change', generateMap);
elements.resolutionInput.addEventListener('change', generateMap);
elements.randomizeButton.addEventListener('click', () => {
    elements.seedInput.value = '';
    generateMap();
});
window.addEventListener('resize', generateMap);
window.addEventListener('popstate', (event) => {
    randomizer.seed = event.state.seed;
    const map = new LocationsMap(event.state.dimension, randomizer);
    randomizer.seed = randomizer.seed;
    const terrain = new TerrainMap(map, randomizer, event.state.resolution);
    drawMap(map, terrain);
});
