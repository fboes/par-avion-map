import Randomizer from "../Helper/Randomizer.js";
import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import LocationsMap from "./LocationsMap.js";

type FourCorners = {
  topLeft: number,
  topRight: number,
  bottomlLeft: number,
  bottomRight: number
}

export type CurrentWeather = {
  pressureHpa: number,
  pressureHpaAtAltitudeFt: number,
  windDirection: Degree
  windSpeedKts: number
}

export default class Weather {
  public windDirection: Degree;
  public windSpeedKts: number;
  public temperatureC: number;
  public minPressureHpa: number;
  protected minPressureCenter: Coordinates;
  public maxPressureHpa: number;
  protected maxPressureCenter: Coordinates;
  //protected pressureHpa: FourCorners;

  static STANDARD_PRESSURE_HPA = 1013.25;
  static STANDARD_PRESSURE_TEMPERATURE_C = 15;

  constructor(protected map: LocationsMap, protected randomizer: Randomizer) {
    this.windDirection = this.map.windDirection;

    const pressure1 = randomizer.getInt(Weather.STANDARD_PRESSURE_HPA - 10, Weather.STANDARD_PRESSURE_HPA + 10);
    const pressure2 = randomizer.getInt(Weather.STANDARD_PRESSURE_HPA - 10, Weather.STANDARD_PRESSURE_HPA + 10);

    this.minPressureHpa = Math.min(pressure1, pressure2);
    this.minPressureCenter = this.map.center.getNewCoordinates(this.windDirection, Math.ceil(this.map.mapDimension / 2));

    this.maxPressureHpa = Math.max(pressure1, pressure2);
    this.maxPressureCenter = this.map.center.getNewCoordinates(new Degree(this.windDirection.oppositeDegree), Math.ceil(this.map.mapDimension / 2));

    this.windSpeedKts = this.maxPressureHpa - this.minPressureHpa + randomizer.getInt(0, 5);
    this.temperatureC = Weather.STANDARD_PRESSURE_TEMPERATURE_C + randomizer.getInt(-10, 10);

    // clouds
  }

  at(coordinates: Coordinates): CurrentWeather {
    const distFromMin = this.minPressureCenter.getDistance(coordinates);
    const distFromMax = this.maxPressureCenter.getDistance(coordinates);
    const pressureHpa = (this.maxPressureHpa * distFromMin + this.minPressureHpa * distFromMax) / (distFromMin + distFromMax);
    const pressureHpaAtAltitudeFt = (coordinates.elevation)
      ? pressureHpa - (coordinates.elevation / 1000)
      : pressureHpa;


    return {
      pressureHpa,
      pressureHpaAtAltitudeFt,
      windDirection: this.windDirection,
      windSpeedKts: this.windSpeedKts,
    }
  }
}
