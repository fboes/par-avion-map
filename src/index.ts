import Canvas from './Canvas/Canvas.js';
import Randomizer from './Helper/Randomizer.js';
import LocationsMap from './ParAvion/LocationsMap.js';
import TerrainMap from './ParAvion/TerrainMap.js';

const elements = {
  canvas: <HTMLCanvasElement>document.getElementById('canvas'),
  seedInput: <HTMLInputElement>document.getElementById('seed'),
  mapDimensionInput : <HTMLInputElement>document.getElementById('mapdimension'),
  clearButton : <HTMLInputElement>document.getElementById('clear'),
  generateButton : <HTMLInputElement>document.getElementById('generate'),
};

function generateMap() {
  const randomizer = new Randomizer(elements.seedInput ? elements.seedInput.value : '');
  const map = new LocationsMap(elements.mapDimensionInput ? elements.mapDimensionInput.valueAsNumber : 16, randomizer);
  randomizer.seed = randomizer.seed;
  const terrain = new TerrainMap(map, randomizer);

  console.log(map);

  if (elements.canvas) {
    new Canvas(elements.canvas, map, terrain);
  }
}

generateMap();
elements.clearButton.addEventListener('click', () => {
  elements.seedInput.value = '';
  elements.mapDimensionInput.valueAsNumber = 16;
  generateMap();
});
elements.generateButton.addEventListener('click', generateMap);
elements.seedInput.addEventListener('change', generateMap);
elements.mapDimensionInput.addEventListener('change', generateMap);
