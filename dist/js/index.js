import CanvasMap from './Canvas/CanvasMap.js';
import Randomizer from './Helper/Randomizer.js';
import LocationsMap from './ParAvion/LocationsMap.js';
import TerrainMap from './ParAvion/TerrainMap.js';
const elements = {
    mapCanvas: document.getElementById('map'),
    seedInput: document.getElementById('seed'),
    mapDimensionInput: document.getElementById('mapdimension'),
    resolutionInput: document.getElementById('resolution'),
    clearButton: document.getElementById('clear'),
    keepButton: document.getElementById('keep'),
    generateButton: document.getElementById('generate'),
};
const randomizer = new Randomizer(elements.seedInput ? elements.seedInput.value : '');
function generateMap() {
    randomizer.seed = elements.seedInput ? elements.seedInput.value : '';
    const map = new LocationsMap(elements.mapDimensionInput ? elements.mapDimensionInput.valueAsNumber : 16, randomizer);
    randomizer.seed = randomizer.seed;
    const terrain = new TerrainMap(map, randomizer, elements.resolutionInput ? elements.resolutionInput.valueAsNumber : 4);
    console.log(map);
    if (elements.mapCanvas) {
        new CanvasMap(elements.mapCanvas, map, terrain);
    }
}
generateMap();
elements.clearButton.addEventListener('click', () => {
    elements.seedInput.value = '';
    elements.mapDimensionInput.valueAsNumber = 28;
    generateMap();
});
elements.keepButton.addEventListener('click', () => {
    elements.seedInput.value = randomizer.seed;
});
elements.generateButton.addEventListener('click', generateMap);
elements.seedInput.addEventListener('change', generateMap);
elements.mapDimensionInput.addEventListener('change', generateMap);
elements.resolutionInput.addEventListener('change', generateMap);
