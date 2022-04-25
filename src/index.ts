import Canvas from './Canvas/Canvas.js';
import Randomizer from './Helper/Randomizer.js';
import LocationsMap from './ParAvion/LocationsMap.js';
import TerrainMap from './ParAvion/TerrainMap.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

function init() {
  const randomizer = new Randomizer();
  const map = new LocationsMap(16, randomizer);
  const terrain = new TerrainMap(map, randomizer);


  console.log(
    map,
    terrain
  );

  if (canvas) {
    new Canvas(canvas, map, terrain);
  }
}

init();
canvas.addEventListener('click', init);
