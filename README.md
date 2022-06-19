"Par Avion" Carte
===============

A map generator for random VFR / IFR flight maps. In a nutshell it generates:

* A general wind direction
* Two or more airports, oriented according to the general wind direction
* One or more navigational aids, like VOR or NDB
* Zero or more obstacles like radio towers
* A topographical map

This generator can be used for simple civilian IFR flight simulators without GPS support, like back in the days of [Solo Flight](https://www.mobygames.com/game/solo-flight-2nd-edition). It allows for a random flight adventure:

1. Take off at airport 1
2. Find your way to airport 2 by calculating your position using NAV 1 (and NAV 2 if present)
3. Land at airport 2, possibly with the help of an ILS

The generator takes two parameters:

1. A map size in Nautical Miles
1. Optional: A seed to generate the map from; identical seeds will generate identical maps

There is also a visible map painting on `<Canvas>`.

![](docs/canvas.png)

Usage
-----

```js
// Get yourself a randomizer
const randomizer = new Randomizer();
// Build locations
const locations = new LocationsMap(16, randomizer);
// Build terrain around locations
const terrain = new TerrainMap(locations, randomizer,4);
```

You may also skip the terrain generation or replace it with any other method for terrain generation, e.g. for a simpler approach to accommodate a more simplistic terrain model.

Demo
----

See https://fboes.github.io/par-avion-map/dist/ to have a whirl with the generator.

Data model
----------

The map consists of two layers:

1. [`LocationMap`](dist/World/LocationMap.js) contains points of interest, like airports and navigational beacons
2. [`TerrainMap`](dist/World/TerrainMap.js) contains the elevation data

The [`LocationMap`](dist/World/LocationMap.js) has multiple entities:

* [`Airport`](dist/World/Airport.js) including [`Runway`](dist/World/Runway.js) and  [`Waypoint`](dist/World/Waypoint.js)
* [`Navaid`](dist/World/Navaid.js) including [`HoldingPattern`](dist/World/HoldingPattern.js)
* [`Obstruction`](dist/World/Obstruction.js)
* [`Peak`](dist/World/Peak.js)

All of these entities use [`Coordinates`](dist/Types/Coordinates.js) calculated in Nautical Miles from the North-West corner of the map. The [`TerrainMap`](dist/World/TerrainMap.js) uses [`TerrainCoordinates`](dist/Types/TerrainCoordinates.js), which are fractions of Nautical Miles from the North-West corner, having a higher resolution for terrain data.

Code style
----------

This project ist done in [Kalashnikov programming style](https://journal.3960.org/posts/2019-10-14-kalaschnikow-programmierung/). The whole project having no set goal and consisting of lots of experiments has a rather ugly code base, hacked together whenever a new idea crosses my mind.

Legal stuff
-----------

Author: [Frank Boës](https://3960.org)

Copyright & license: See [LICENSE.txt](LICENSE.txt)
