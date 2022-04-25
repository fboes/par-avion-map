import Point from "./Point.js";

export default class Peak extends Point {
  protected randWords(index = 0) {
    const words = [
      [
        'Belle',
        'Big',
        'Black',
        'Blue',
        'Broken',
        'Clear',
        'Cold',
        'Dusty',
        'East',
        'Far',
        'Foggy',
        'Free',
        'Good',
        'Grand',
        'Great',
        'Greater',
        'Green',
        'Grey',
        'Higher',
        'Inner',
        'Little',
        'Lonely',
        'Lost',
        'Middle',
        'Misty',
        'New',
        'North',
        'Northeast',
        'Northwest',
        'Old',
        'Outer',
        'Plain',
        'Red',
        'Shady',
        'Small',
        'South',
        'Southeast',
        'Southwest',
        'Still',
        'Stormy',
        'Sunny',
        'Tiny',
        'West',
        'White',
        'Windy',
      ],
      [
        'Cross',
        'Mountain',
        'Hill',
        'Peak',
        'Point',
        'Summit',
        'Tree',
      ]
    ];

    return this.randomizer.fromArray(words[index]);
  }
}
