export default class Point {
    constructor(coordinates, randomizer) {
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this._type = this.constructor.name;
        this._name = '';
        this._code = '';
        this.isSwitchLabelPosition = false;
        this.name = randomizer ? this.randWords(0) + ' ' + this.randWords(1) : '';
    }
    set name(name) {
        this._name = name;
        this._code = name.toUpperCase().replace(/^(\w\w).+?\W(\w\w).*$/g, '$1$2');
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    set code(code) {
        this._code = code;
    }
    get code() {
        return this._code;
    }
    randWords(index = 0) {
        const words = [
            [
                'Belle',
                'Big',
                'Black',
                'Blue',
                'Broken',
                'Clear',
                'Cold',
                'Deep',
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
                'Lower',
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
                'Upper',
                'West',
                'White',
                'Windy',
            ],
            [
                'Acre',
                'Acres',
                'Bastion',
                'Bend',
                'Borough',
                'Bridge',
                'Brook',
                'Castle',
                'Church',
                'City',
                'Clearing',
                'Corner',
                'Corners',
                'County',
                'Cove',
                'Creek',
                'Crossing',
                'Dale',
                'Dam',
                'Falls',
                'Farm',
                'Farms',
                'Ferry',
                'Field',
                'Fields',
                'Flats',
                'Ford',
                'Forest',
                'Fort',
                'Frontier',
                'Gate',
                'Garden',
                'Glen',
                'Harbour',
                'Haven',
                'Head',
                'House',
                'Houses',
                'Junction',
                'Lake',
                'Land',
                'Lights',
                'Lodge',
                'Meadow',
                'Mills',
                'Outpost',
                'Park',
                'Plains',
                'Point',
                'Pond',
                'Port',
                'Ranch',
                'Ranches',
                'Range',
                'Reservoir',
                'Resort',
                'Ridge',
                'River',
                'Road',
                'Roads',
                'Rock',
                'Sea',
                'State',
                'Station',
                'Stone',
                'Square',
                'Tower',
                'Towers',
                'Town',
                'Tree',
                'Trees',
                'Vale',
                'Valley',
                'Ville',
                'Water',
                'Way',
                'Wood',
                'Woods',
                'Yard',
            ]
        ];
        return this.randomizer.fromArray(words[index]);
    }
}
//# sourceMappingURL=Point.js.map