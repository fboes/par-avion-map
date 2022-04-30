import CanvasMap from './Canvas/CanvasMap.js';
import Randomizer from './Helper/Randomizer.js';
import LocationsMap from './ParAvion/LocationsMap.js';
import TerrainMap from './ParAvion/TerrainMap.js';

const elements = {
  mapCanvas: <HTMLCanvasElement>document.getElementById('map'),
  seedInput: <HTMLInputElement>document.getElementById('seed'),
  mapDimensionInput : <HTMLInputElement>document.getElementById('mapdimension'),
  resolutionInput : <HTMLInputElement>document.getElementById('resolution'),
  clearButton : <HTMLInputElement>document.getElementById('clear'),
  keepButton : <HTMLInputElement>document.getElementById('keep'),
  generateButton : <HTMLInputElement>document.getElementById('generate'),
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
